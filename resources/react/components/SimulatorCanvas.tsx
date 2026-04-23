/**
 * SimulatorCanvas.tsx
 * Warps a user's design onto a billboard mockup using a proper projective
 * (homographic) transform on HTML5 Canvas — design fits EXACTLY the 4 corners.
 *
 * Props:
 *   mockupUrl        — URL of the street-photo background
 *   designUrl        — URL of the user's artwork (blob URL or data URL)
 *   corners          — [TL, TR, BR, BL] as fractions 0..1 of mockup dimensions
 *   editMode         — show drag handles + connecting lines (admin corner picker)
 *   onCornersChange  — callback when handles are moved (editMode only)
 *   style            — wrapper div style
 */
import {
  forwardRef, useImperativeHandle, useRef, useEffect, useCallback, useState,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface Corner { x: number; y: number }  // fractions 0..1

export interface SimulatorCanvasRef {
  capture: () => Promise<string | null>;
}

interface Props {
  mockupUrl:        string;
  designUrl:        string;
  corners:          [Corner, Corner, Corner, Corner];  // TL TR BR BL
  editMode?:        boolean;
  onCornersChange?: (c: [Corner, Corner, Corner, Corner]) => void;
  style?:           React.CSSProperties;
}

// ── Math: 8×8 Gaussian elimination ────────────────────────────────────────────
function solve8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  // Augmented matrix [A|b]
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // Partial pivoting
    let max = Math.abs(M[col][col]), piv = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > max) { max = Math.abs(M[row][col]); piv = row; }
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    // Normalize pivot row
    const pivot = M[col][col];
    if (Math.abs(pivot) < 1e-12) continue;
    for (let k = col; k <= n; k++) M[col][k] /= pivot;
    // Eliminate column
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = M[row][col];
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k];
    }
  }
  // After full Gauss-Jordan the diagonal is 1, so solution is just the RHS column
  return M.map(row => row[n]);
}

// ── Compute homography: unit-square [TL,TR,BR,BL] → dst pixel corners ─────────
function computeHomography(dst: [Corner, Corner, Corner, Corner], W: number, H: number): number[] {
  // src: unit-square TL(0,0) TR(1,0) BR(1,1) BL(0,1)
  const src: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]];
  const dstPx = dst.map(c => [c.x * W, c.y * H]) as [number, number][];
  const A: number[][] = [];
  const b: number[] = [];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i];
    const [dx, dy] = dstPx[i];
    A.push([sx, sy, 1, 0, 0, 0, -sx * dx, -sy * dx]); b.push(dx);
    A.push([0, 0, 0, sx, sy, 1, -sx * dy, -sy * dy]); b.push(dy);
  }
  const h = solve8x8(A, b);
  return [...h, 1];
}

// ── Inverse-map warp: for every dst pixel find the src pixel ──────────────────
function applyWarp(
  srcCanvas: HTMLCanvasElement,
  dstCtx: CanvasRenderingContext2D,
  dstW: number, dstH: number,
  H: number[],   // forward homography (unit-sq → dst pixels)
) {
  const [a, bv, c, d, e, f, g, hv, k] = H;
  const det = a * (e * k - f * hv) - bv * (d * k - f * g) + c * (d * hv - e * g);
  if (Math.abs(det) < 1e-10) return;
  const inv = [
    (e * k - f * hv) / det, (c * hv - bv * k) / det, (bv * f - c * e) / det,
    (f * g - d * k) / det,  (a * k - c * g) / det,   (c * d - a * f) / det,
    (d * hv - e * g) / det, (bv * g - a * hv) / det, (a * e - bv * d) / det,
  ];

  const srcCtx = srcCanvas.getContext('2d')!;
  const srcW = srcCanvas.width, srcH = srcCanvas.height;
  const srcImg = srcCtx.getImageData(0, 0, srcW, srcH);
  const dstImg = dstCtx.getImageData(0, 0, dstW, dstH);

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      const w2 = inv[6] * dx + inv[7] * dy + inv[8];
      if (Math.abs(w2) < 1e-10) continue;
      const sx = (inv[0] * dx + inv[1] * dy + inv[2]) / w2;
      const sy = (inv[3] * dx + inv[4] * dy + inv[5]) / w2;
      if (sx < 0 || sx > 1 || sy < 0 || sy > 1) continue;
      const px = Math.round(sx * (srcW - 1));
      const py = Math.round(sy * (srcH - 1));
      const si = (py * srcW + px) * 4;
      const di = (dy * dstW + dx) * 4;
      dstImg.data[di]     = srcImg.data[si];
      dstImg.data[di + 1] = srcImg.data[si + 1];
      dstImg.data[di + 2] = srcImg.data[si + 2];
      dstImg.data[di + 3] = srcImg.data[si + 3];
    }
  }
  dstCtx.putImageData(dstImg, 0, 0);
}

// ── Load image (blob URLs don't need crossOrigin) ─────────────────────────────
function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin for http(s) URLs, NOT for blob: or data: URLs
    if (url.startsWith('http')) img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

// ── Handle colours & labels ───────────────────────────────────────────────────
const HANDLE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']; // TL TR BR BL
const HANDLE_LABELS = ['TL', 'TR', 'BR', 'BL'];

// ── Component ─────────────────────────────────────────────────────────────────
const SimulatorCanvas = forwardRef<SimulatorCanvasRef, Props>(({
  mockupUrl, designUrl, corners, editMode = false, onCornersChange, style,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  // Keep images in refs so render() always has the latest without stale closures
  const mockupRef = useRef<HTMLImageElement | null>(null);
  const designRef = useRef<HTMLImageElement | null>(null);
  const cornersRef = useRef<[Corner, Corner, Corner, Corner]>(corners);

  const [localCorners, setLocalCorners] = useState<[Corner, Corner, Corner, Corner]>(() => corners);
  const [dragging, setDragging] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 450 });

  // Keep cornersRef in sync
  useEffect(() => {
    cornersRef.current = localCorners;
  }, [localCorners]);

  // Sync incoming corners prop (from parent/store)
  useEffect(() => {
    setLocalCorners(corners);
    cornersRef.current = corners;
  }, [corners]);  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core render function (reads from refs — always fresh) ─────────────────
  const renderCanvas = useCallback(() => {
    const canvas  = canvasRef.current;
    const mockup  = mockupRef.current;
    if (!canvas || !mockup) return;

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d')!;
    const crns = cornersRef.current;

    // 1. Draw mockup background
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(mockup, 0, 0, W, H);

    const design = designRef.current;
    if (!design || !design.complete || design.naturalWidth === 0) return;

    // 2. Build temp src canvas from design
    const srcC = document.createElement('canvas');
    srcC.width  = design.naturalWidth;
    srcC.height = design.naturalHeight;
    srcC.getContext('2d')!.drawImage(design, 0, 0);

    // 3. Compute homography & warp into a temp dst canvas
    const H_mat = computeHomography(crns, W, H);
    const dstC  = document.createElement('canvas');
    dstC.width  = W;
    dstC.height = H;
    const dstCtx = dstC.getContext('2d')!;
    applyWarp(srcC, dstCtx, W, H, H_mat);

    // 4. Composite warped design over mockup
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(dstC, 0, 0);
    ctx.restore();
  }, []); // no deps — always reads from refs

  // ── Load mockup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mockupUrl) return;
    let cancelled = false;
    loadImg(mockupUrl)
      .then(img => {
        if (cancelled) return;
        mockupRef.current = img;
        // Resize canvas to match mockup aspect ratio
        const container = containerRef.current;
        const maxW = container?.clientWidth || 800;
        const ratio = img.naturalHeight / img.naturalWidth;
        const w = maxW;
        const h = Math.max(1, Math.round(maxW * ratio));
        setCanvasSize({ w, h });
        // Render after state update — use setTimeout to let canvas resize first
        setTimeout(() => renderCanvas(), 0);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [mockupUrl, renderCanvas]);

  // ── Load design ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!designUrl) {
      designRef.current = null;
      renderCanvas();
      return;
    }
    let cancelled = false;
    loadImg(designUrl)
      .then(img => {
        if (cancelled) return;
        designRef.current = img;
        renderCanvas();
      })
      .catch(() => {
        designRef.current = null;
        renderCanvas();
      });
    return () => { cancelled = true; };
  }, [designUrl, renderCanvas]);

  // Re-render when corners change
  useEffect(() => {
    cornersRef.current = localCorners;
    renderCanvas();
  }, [localCorners, renderCanvas]);

  // Re-render when canvas dimensions are set
  useEffect(() => {
    // Canvas element dimensions changed — need to re-draw
    setTimeout(() => renderCanvas(), 0);
  }, [canvasSize, renderCanvas]);

  // ── Drag handles ─────────────────────────────────────────────────────────
  const getRelativePos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left)  / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top)   / rect.height)),
    };
  }, []);

  const onMouseDown = useCallback((idx: number) => (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    setDragging(idx);
  }, [editMode]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !editMode) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setLocalCorners(prev => {
      const next = [...prev] as [Corner, Corner, Corner, Corner];
      next[dragging] = pos;
      onCornersChange?.(next);
      return next;
    });
  }, [dragging, editMode, getRelativePos, onCornersChange]);

  const onMouseUp = useCallback(() => { setDragging(null); }, []);

  // Touch support
  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragging === null || !editMode) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setLocalCorners(prev => {
      const next = [...prev] as [Corner, Corner, Corner, Corner];
      next[dragging] = pos;
      onCornersChange?.(next);
      return next;
    });
  }, [dragging, editMode, getRelativePos, onCornersChange]);

  // ── Expose capture ────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    capture: async () => {
      // Build composite on a FRESH off-screen canvas to avoid CORS-taint issues.
      // We draw directly from the in-memory image elements (already loaded).
      const mockup = mockupRef.current;
      const design = designRef.current;
      if (!mockup) return null;

      const W = canvasSize.w || mockup.naturalWidth;
      const H = canvasSize.h || mockup.naturalHeight;
      const offscreen = document.createElement('canvas');
      offscreen.width  = W;
      offscreen.height = H;
      const ctx = offscreen.getContext('2d')!;

      // 1. Draw mockup
      try { ctx.drawImage(mockup, 0, 0, W, H); } catch { /* tainted — skip */ }

      // 2. Warp design if available
      if (design && design.complete && design.naturalWidth > 0) {
        const srcC = document.createElement('canvas');
        srcC.width  = design.naturalWidth;
        srcC.height = design.naturalHeight;
        srcC.getContext('2d')!.drawImage(design, 0, 0);

        const H_mat = computeHomography(cornersRef.current, W, H);
        const dstC  = document.createElement('canvas');
        dstC.width  = W;
        dstC.height = H;
        applyWarp(srcC, dstC.getContext('2d')!, W, H, H_mat);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(dstC, 0, 0);
      }

      // 3. Try toDataURL — may still be tainted if mockup server blocks CORS
      try {
        return offscreen.toDataURL('image/jpeg', 0.92);
      } catch {
        // CORS taint: fall back to returning the visible canvas data URL
        try { return canvasRef.current?.toDataURL('image/jpeg', 0.92) ?? null; }
        catch { return null; }
      }
    },
  }));

  // ── JSX ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', userSelect: 'none', ...style }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onMouseUp}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />

      {/* Connecting lines SVG overlay (editMode only) */}
      {editMode && (
        <svg
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', overflow: 'visible',
          }}
        >
          {/* Draw quadrilateral outline: TL→TR→BR→BL→TL */}
          <polygon
            points={localCorners.map(c => `${c.x * 100}%,${c.y * 100}%`).join(' ')}
            fill="rgba(217,4,41,0.08)"
            stroke="rgba(255,255,255,0.85)"
            strokeWidth="1.5"
            strokeDasharray="6 3"
          />
          {/* Cross-lines TL→BR and TR→BL for alignment guides */}
          <line
            x1={`${localCorners[0].x * 100}%`} y1={`${localCorners[0].y * 100}%`}
            x2={`${localCorners[2].x * 100}%`} y2={`${localCorners[2].y * 100}%`}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4"
          />
          <line
            x1={`${localCorners[1].x * 100}%`} y1={`${localCorners[1].y * 100}%`}
            x2={`${localCorners[3].x * 100}%`} y2={`${localCorners[3].y * 100}%`}
            stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="3 4"
          />
        </svg>
      )}

      {/* Drag handles (editMode only) */}
      {editMode && localCorners.map((corner, idx) => (
        <div
          key={idx}
          onMouseDown={onMouseDown(idx)}
          onTouchStart={(e) => { e.preventDefault(); setDragging(idx); }}
          title={HANDLE_LABELS[idx]}
          style={{
            position:     'absolute',
            left:         `calc(${corner.x * 100}% - 12px)`,
            top:          `calc(${corner.y * 100}% - 12px)`,
            width:        24,
            height:       24,
            borderRadius: '50%',
            background:   HANDLE_COLORS[idx],
            border:       '2.5px solid #fff',
            boxShadow:    dragging === idx
              ? `0 0 0 3px ${HANDLE_COLORS[idx]}55, 0 4px 16px rgba(0,0,0,0.5)`
              : '0 2px 10px rgba(0,0,0,0.45)',
            cursor:       dragging === idx ? 'grabbing' : 'grab',
            display:      'flex',
            alignItems:   'center',
            justifyContent: 'center',
            fontSize:     8,
            fontWeight:   900,
            color:        '#fff',
            zIndex:       20,
            transition:   dragging === idx ? 'none' : 'box-shadow 0.15s',
            touchAction:  'none',
          }}
        >
          {HANDLE_LABELS[idx]}
        </div>
      ))}
    </div>
  );
});

SimulatorCanvas.displayName = 'SimulatorCanvas';
export default SimulatorCanvas;
