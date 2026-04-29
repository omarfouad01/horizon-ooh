/**
 * SimulatorCanvas.tsx — Renders uploaded design(s) onto a billboard mockup
 * using a real per-pixel homographic warp on HTML5 Canvas.
 *
 * Corner coordinates are stored in NATURAL image pixels (0..naturalWidth, 0..naturalHeight).
 * Corners are stored as {x, y} objects in each panel array [TL, TR, BR, BL].
 *
 * The canvas renders at the natural mockup resolution for maximum quality,
 * then the canvas element is scaled down via CSS to fit the container.
 */
import {
  useEffect, useRef, forwardRef, useImperativeHandle, useState, useCallback,
} from 'react';
import type { SimPanel, SimCorner } from '@/store/dataStore';

// ── Public types ────────────────────────────────────────────────────────────

export interface SimulatorCanvasHandle {
  /** Returns a PNG data-URL of the composite, or null on failure */
  capture: () => Promise<string | null>;
}

interface Props {
  mockupUrl:       string;
  designUrls:      string[];   // one per panel; may contain empty strings
  panels:          SimPanel[]; // each panel = 4 corners in NATURAL mockup px [TL,TR,BR,BL]
  style?:          React.CSSProperties;
  /** Also forward Panel/Corner types for places that import from here */
}

// Re-export aliases so importers that previously used Panel/Corner from here still work
export type Corner = SimCorner;
export type Panel  = SimPanel;
export type { SimulatorCanvasHandle as SimulatorCanvasRef };

// ── 8×8 Gaussian elimination ────────────────────────────────────────────────

function solve8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let maxVal = Math.abs(M[col][col]);
    let pivRow = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > maxVal) { maxVal = Math.abs(M[row][col]); pivRow = row; }
    }
    [M[col], M[pivRow]] = [M[pivRow], M[col]];
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let k = col; k <= n; k++) M[col][k] /= pivot;
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = M[row][col];
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k];
    }
  }
  return M.map(row => row[n]);
}

/**
 * Compute the 3×3 projective homography H such that
 *   H * [sx, sy, 1]^T  ≅  [dx, dy, 1]^T
 *
 * src = 4 source points in the DESIGN coordinate system (unit square corners)
 * dst = 4 destination points in CANVAS pixels
 *
 * Returns [h0..h8] (row-major, H[2][2] == 1 normalised)
 */
function computeHomography(
  srcCorners: [SimCorner, SimCorner, SimCorner, SimCorner],
  dstCorners: [SimCorner, SimCorner, SimCorner, SimCorner],
): number[] {
  const A: number[][] = [];
  const b: number[]   = [];

  for (let i = 0; i < 4; i++) {
    const sx = srcCorners[i].x, sy = srcCorners[i].y;
    const dx = dstCorners[i].x, dy = dstCorners[i].y;

    A.push([sx, sy, 1, 0,  0,  0, -sx * dx, -sy * dx]);
    b.push(dx);

    A.push([0,  0,  0, sx, sy, 1, -sx * dy, -sy * dy]);
    b.push(dy);
  }

  const h = solve8x8(A, b);
  // h = [h00, h01, h02, h10, h11, h12, h20, h21], H[2][2] = 1
  return [...h, 1]; // 9 elements
}

// ── Pixel-level inverse warp ────────────────────────────────────────────────

/**
 * Warp the design image onto dstCtx using an inverse pixel map:
 * For every pixel in the destination (canvas), compute where it comes from
 * in the source (design) and sample bilinearly.
 *
 * @param srcCanvas  — design image on an off-screen canvas
 * @param dstCtx     — destination canvas context (full-size mockup)
 * @param W          — canvas width
 * @param H          — canvas height
 * @param H_fwd      — 9-element homography: src design pixels → dst canvas pixels
 * @param panel      — 4 dst corners (to build a clipping poly)
 * @param dW         — design canvas width
 * @param dH         — design canvas height
 */
function warpDesign(
  srcCanvas: HTMLCanvasElement,
  dstCtx:    CanvasRenderingContext2D,
  W: number, H: number,
  H_fwd: number[],
  panel: SimPanel,
  dW: number, dH: number,
): void {
  // Compute inverse homography (dst → src)
  const [a,b,c,d,e,f,g,hh] = H_fwd;
  const k = 1;
  const det = a*(e*k - f*hh) - b*(d*k - f*g) + c*(d*hh - e*g);
  if (Math.abs(det) < 1e-10) return;

  const inv: number[] = [
    (e*k - f*hh)/det, (c*hh - b*k)/det, (b*f - c*e)/det,
    (f*g - d*k)/det,  (a*k - c*g)/det,  (c*d - a*f)/det,
    (d*hh - e*g)/det, (b*g - a*hh)/det, (a*e - b*d)/det,
  ];

  // Bounding box of the panel in dst coords (to limit pixel scan)
  const pxs = panel.map(p => p.x);
  const pys = panel.map(p => p.y);
  const x0 = Math.max(0, Math.floor(Math.min(...pxs)));
  const y0 = Math.max(0, Math.floor(Math.min(...pys)));
  const x1 = Math.min(W - 1, Math.ceil(Math.max(...pxs)));
  const y1 = Math.min(H - 1, Math.ceil(Math.max(...pys)));

  const srcCtx  = srcCanvas.getContext('2d', { willReadFrequently: true })!;
  const srcData = srcCtx.getImageData(0, 0, dW, dH);
  const dstData = dstCtx.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1);
  const sw = dW, sh = dH;

  for (let py = y0; py <= y1; py++) {
    for (let px = x0; px <= x1; px++) {
      // Map dst pixel → src design pixel
      const ww = inv[6] * px + inv[7] * py + inv[8];
      if (Math.abs(ww) < 1e-10) continue;
      const sx = (inv[0] * px + inv[1] * py + inv[2]) / ww;
      const sy = (inv[3] * px + inv[4] * py + inv[5]) / ww;

      // Clamp to design bounds
      if (sx < 0 || sy < 0 || sx >= sw - 1 || sy >= sh - 1) continue;

      // Bilinear sample
      const x0s = Math.floor(sx), y0s = Math.floor(sy);
      const xf   = sx - x0s,       yf   = sy - y0s;
      const x1s = x0s + 1,          y1s  = y0s + 1;

      const idx00 = (y0s * sw + x0s) * 4;
      const idx10 = (y0s * sw + x1s) * 4;
      const idx01 = (y1s * sw + x0s) * 4;
      const idx11 = (y1s * sw + x1s) * 4;

      const r = srcData.data[idx00]*((1-xf)*(1-yf)) + srcData.data[idx10]*(xf*(1-yf))
              + srcData.data[idx01]*((1-xf)*yf)      + srcData.data[idx11]*(xf*yf);
      const g = srcData.data[idx00+1]*((1-xf)*(1-yf)) + srcData.data[idx10+1]*(xf*(1-yf))
              + srcData.data[idx01+1]*((1-xf)*yf)      + srcData.data[idx11+1]*(xf*yf);
      const bv = srcData.data[idx00+2]*((1-xf)*(1-yf)) + srcData.data[idx10+2]*(xf*(1-yf))
               + srcData.data[idx01+2]*((1-xf)*yf)      + srcData.data[idx11+2]*(xf*yf);
      const al = srcData.data[idx00+3]*((1-xf)*(1-yf)) + srcData.data[idx10+3]*(xf*(1-yf))
               + srcData.data[idx01+3]*((1-xf)*yf)      + srcData.data[idx11+3]*(xf*yf);

      const di = ((py - y0) * (x1 - x0 + 1) + (px - x0)) * 4;
      const a_src = al / 255;
      dstData.data[di]   = Math.round(r  * a_src + dstData.data[di]   * (1 - a_src));
      dstData.data[di+1] = Math.round(g  * a_src + dstData.data[di+1] * (1 - a_src));
      dstData.data[di+2] = Math.round(bv * a_src + dstData.data[di+2] * (1 - a_src));
      dstData.data[di+3] = Math.min(255, dstData.data[di+3] + Math.round(al));
    }
  }

  dstCtx.putImageData(dstData, x0, y0);
}

// ── Load image helper ───────────────────────────────────────────────────────

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}

// ── Component ───────────────────────────────────────────────────────────────

const SimulatorCanvas = forwardRef<SimulatorCanvasHandle, Props>(
  ({ mockupUrl, designUrls, panels, style }, ref) => {
    const canvasRef    = useRef<HTMLCanvasElement>(null);
    const [renderDone, setRenderDone] = useState(false);
    const [error, setError]           = useState<string | null>(null);

    // ── Render composite onto canvas ───────────────────────────────────────
    const renderComposite = useCallback(async (
      mockupSrc: string,
      designs:   string[],
      pnls:      SimPanel[],
    ) => {
      setRenderDone(false);
      setError(null);

      if (!mockupSrc) return;

      let mockupImg: HTMLImageElement;
      try {
        mockupImg = await loadImage(mockupSrc);
      } catch {
        setError('Failed to load mockup image');
        return;
      }

      const natW = mockupImg.naturalWidth  || 1200;
      const natH = mockupImg.naturalHeight || 800;

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width  = natW;
      canvas.height = natH;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw mockup
      ctx.drawImage(mockupImg, 0, 0, natW, natH);

      // Warp each design onto its panel
      for (let i = 0; i < pnls.length; i++) {
        const designUrl = designs[i];
        const panel     = pnls[i];

        if (!designUrl || !panel || panel.length < 4) continue;

        let designImg: HTMLImageElement;
        try {
          designImg = await loadImage(designUrl);
        } catch {
          continue; // skip unloadable design
        }

        const dW = designImg.naturalWidth  || 1000;
        const dH = designImg.naturalHeight || 1000;

        // Draw design to off-screen canvas
        const srcCanvas = document.createElement('canvas');
        srcCanvas.width  = dW;
        srcCanvas.height = dH;
        srcCanvas.getContext('2d')!.drawImage(designImg, 0, 0, dW, dH);

        // Normalise corners: ensure we have exactly 4 corners in natural px
        const dst = panel.slice(0, 4) as [SimCorner, SimCorner, SimCorner, SimCorner];

        // Source corners = corners of the design image
        const src: [SimCorner, SimCorner, SimCorner, SimCorner] = [
          { x: 0,  y: 0  },  // TL
          { x: dW, y: 0  },  // TR
          { x: dW, y: dH },  // BR
          { x: 0,  y: dH },  // BL
        ];

        // Compute forward homography: design pixels → canvas pixels
        const H_fwd = computeHomography(src, dst);

        // Pixel-level inverse warp
        warpDesign(srcCanvas, ctx, natW, natH, H_fwd, dst, dW, dH);
      }

      setRenderDone(true);
    }, []);

    // Re-render whenever inputs change
    useEffect(() => {
      renderComposite(mockupUrl, designUrls, panels);
    }, [mockupUrl, designUrls, panels, renderComposite]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── capture() for download ─────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      capture: async () => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        try {
          return canvas.toDataURL('image/png');
        } catch {
          return null;
        }
      },
    }));

    return (
      <div style={{ position: 'relative', width: '100%', ...style }}>
        <canvas
          ref={canvasRef}
          style={{
            display:  'block',
            width:    '100%',
            height:   'auto',
            borderRadius: style?.borderRadius ?? 12,
          }}
        />
        {!renderDone && !error && (
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.15)',
            color: '#fff', fontSize: 13, fontWeight: 600,
            borderRadius: 12,
          }}>
            Rendering…
          </div>
        )}
        {error && (
          <div style={{
            padding: 24, textAlign: 'center',
            color: '#ef4444', fontSize: 13,
          }}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

SimulatorCanvas.displayName = 'SimulatorCanvas';
export default SimulatorCanvas;
