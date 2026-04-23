/**
 * SimulatorCanvas.tsx
 * Warps a user's design onto a billboard mockup using a proper projective
 * (homographic) transform computed on an HTML5 Canvas, so the design fits
 * EXACTLY the four corner points every time.
 *
 * Props:
 *   mockupUrl  — URL of the street-photo background
 *   designUrl  — URL of the user's artwork (or placeholder)
 *   corners    — [TL, TR, BR, BL] as fractions 0..1 of the mockup dimensions
 *   editMode   — show drag handles so the admin can reposition corners
 *   onCornersChange — callback when handles are moved (editMode only)
 *   style      — wrapper div style
 */
import {
  forwardRef, useImperativeHandle, useRef, useEffect, useCallback, useState
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface Corner { x: number; y: number }   // fractions 0..1

export interface SimulatorCanvasRef {
  /** Returns a JPEG data-URL of the composite (mockup + warped design) */
  capture: () => Promise<string | null>;
}

interface Props {
  mockupUrl:  string;
  designUrl:  string;
  corners:    [Corner, Corner, Corner, Corner];   // TL, TR, BR, BL
  editMode?:  boolean;
  onCornersChange?: (c: [Corner, Corner, Corner, Corner]) => void;
  style?:     React.CSSProperties;
}

// ── Math helpers ───────────────────────────────────────────────────────────────

/**
 * Solve Ax = b with Gaussian elimination (8×8 for homography).
 * Returns the 9-element h vector (h[8] = 1).
 */
function solve8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M: number[][] = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    // pivot
    let max = Math.abs(M[col][col]), piv = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > max) { max = Math.abs(M[row][col]); piv = row; }
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    for (let row = 0; row < n; row++) {
      if (row === col) continue;
      const f = M[row][col] / M[col][col];
      for (let k = col; k <= n; k++) M[row][k] -= f * M[col][k];
    }
  }
  return M.map((row) => row[n] / row[row.length - 2]);   // n columns 0..7 + rhs
}

/**
 * Compute the homography H that maps unit-square src corners
 * (0,0),(1,0),(1,1),(0,1) to the given destination pixel points dst[TL,TR,BR,BL].
 * Returned as a flat 9-element array (row-major, h[8]=1).
 */
function computeHomography(
  dst: [Corner, Corner, Corner, Corner],
  W: number, H: number
): number[] {
  // Source points (unit square): TL(0,0) TR(1,0) BR(1,1) BL(0,1)
  const src: [number, number][] = [[0,0],[1,0],[1,1],[0,1]];
  // Destination points in pixels
  const dstPx = dst.map(c => [c.x * W, c.y * H]) as [number,number][];

  // Build 8×8 system from the 4 point correspondences
  const A: number[][] = [];
  const b: number[]   = [];
  for (let i = 0; i < 4; i++) {
    const [sx, sy] = src[i];
    const [dx, dy] = dstPx[i];
    A.push([ sx, sy, 1,  0,  0, 0, -sx*dx, -sy*dx ]);  b.push(dx);
    A.push([  0,  0, 0, sx, sy, 1, -sx*dy, -sy*dy ]);  b.push(dy);
  }
  const h = solve8x8(A, b);
  return [...h, 1]; // h[8] = 1
}

/**
 * Given a homography H (length 9), map every pixel of a srcCanvas
 * onto dstCtx using inverse mapping.
 * dstW × dstH is the size of the output canvas.
 */
function warpCanvas(
  srcCanvas: HTMLCanvasElement,
  dstCtx: CanvasRenderingContext2D,
  dstW: number, dstH: number,
  H: number[]            // forward homography: src unit-sq → dst pixels
) {
  // We need the INVERSE homography to do inverse mapping
  // Compute inverse via cofactors (3×3 matrix inverse)
  const h = H;
  // 3×3 entries
  const a = h[0], bv = h[1], c = h[2],
        d = h[3], e  = h[4], f = h[5],
        g = h[6], hv = h[7], k = h[8];
  const det = a*(e*k - f*hv) - bv*(d*k - f*g) + c*(d*hv - e*g);
  if (Math.abs(det) < 1e-10) return; // degenerate
  const inv = [
    (e*k - f*hv)/det, (c*hv - bv*k)/det, (bv*f - c*e)/det,
    (f*g  - d*k)/det, (a*k  - c*g)/det,  (c*d  - a*f)/det,
    (d*hv - e*g)/det, (bv*g - a*hv)/det, (a*e  - bv*d)/det,
  ];

  const srcCtx = srcCanvas.getContext('2d')!;
  const srcW   = srcCanvas.width;
  const srcH   = srcCanvas.height;
  const srcImg = srcCtx.getImageData(0, 0, srcW, srcH);
  const dstImg = dstCtx.getImageData(0, 0, dstW, dstH);

  for (let dy = 0; dy < dstH; dy++) {
    for (let dx = 0; dx < dstW; dx++) {
      // Apply inverse homography: (dx,dy) → (sx,sy) in unit square
      const w2  = inv[6]*dx + inv[7]*dy + inv[8];
      if (Math.abs(w2) < 1e-10) continue;
      const sx2 = (inv[0]*dx + inv[1]*dy + inv[2]) / w2;
      const sy2 = (inv[3]*dx + inv[4]*dy + inv[5]) / w2;

      // sx2,sy2 are in 0..1 range; map to source pixel coords
      if (sx2 < 0 || sx2 > 1 || sy2 < 0 || sy2 > 1) continue;

      const px = Math.round(sx2 * (srcW - 1));
      const py = Math.round(sy2 * (srcH - 1));
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

// ── Load an image cross-origin (best-effort) ──────────────────────────────────
function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

// ── Corner handle colours ─────────────────────────────────────────────────────
const HANDLE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444']; // TL TR BR BL
const HANDLE_LABELS = ['TL', 'TR', 'BR', 'BL'];

// ── Component ─────────────────────────────────────────────────────────────────
const SimulatorCanvas = forwardRef<SimulatorCanvasRef, Props>(({
  mockupUrl, designUrl, corners, editMode = false, onCornersChange, style,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);  // visible canvas (mockup + warped design)
  const [localCorners, setLocalCorners] = useState<[Corner,Corner,Corner,Corner]>(() => corners);
  const [dragging, setDragging] = useState<number | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 450 });
  const mockupImgRef  = useRef<HTMLImageElement | null>(null);
  const designImgRef  = useRef<HTMLImageElement | null>(null);

  // Sync corners from outside
  useEffect(() => { setLocalCorners(corners); }, [corners]);

  // ── Render composite onto canvas ──────────────────────────────────────────
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const mockup = mockupImgRef.current;
    const design = designImgRef.current;
    if (!canvas || !mockup) return;

    const W = canvas.width;
    const H = canvas.height;
    const ctx = canvas.getContext('2d')!;

    // 1. Draw mockup
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(mockup, 0, 0, W, H);

    if (!design || !design.complete || design.naturalWidth === 0) return;

    // 2. Build a temp canvas from the design image
    const srcCanvas = document.createElement('canvas');
    srcCanvas.width  = design.naturalWidth;
    srcCanvas.height = design.naturalHeight;
    const srcCtx = srcCanvas.getContext('2d')!;
    srcCtx.drawImage(design, 0, 0);

    // 3. Compute forward homography (unit-square → dst corners in pixels)
    const H_mat = computeHomography(localCorners, W, H);

    // 4. Build a temp dst canvas and warp the design onto it
    const warpCanvas2 = document.createElement('canvas');
    warpCanvas2.width  = W;
    warpCanvas2.height = H;
    const warpCtx = warpCanvas2.getContext('2d')!;
    warpCanvas(srcCanvas, warpCtx, W, H, H_mat);

    // 5. Composite: draw warped design over mockup with slight screen blend
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.drawImage(warpCanvas2, 0, 0);
    ctx.restore();
  }, [localCorners]);

  // Reload mockup image and re-render when URL changes
  useEffect(() => {
    if (!mockupUrl) return;
    loadImg(mockupUrl).then(img => {
      mockupImgRef.current = img;
      // Set canvas size to match mockup aspect ratio
      const container = containerRef.current;
      const maxW = container?.clientWidth || 800;
      const ratio = img.naturalHeight / img.naturalWidth;
      const w = maxW;
      const h = Math.round(maxW * ratio);
      setCanvasSize({ w, h });
    }).catch(() => {});
  }, [mockupUrl]);

  useEffect(() => {
    if (!designUrl) return;
    loadImg(designUrl).then(img => {
      designImgRef.current = img;
      render();
    }).catch(() => { render(); });
  }, [designUrl, render]);

  // Re-render whenever corners or canvas size changes
  useEffect(() => { render(); }, [render, canvasSize, localCorners]);

  // ── Drag handles (editMode) ───────────────────────────────────────────────
  const getRelativePos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height)),
    };
  }, []);

  const onMouseDown = useCallback((idx: number) => (e: React.MouseEvent) => {
    if (!editMode) return;
    e.preventDefault();
    setDragging(idx);
  }, [editMode]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !editMode) return;
    const pos = getRelativePos(e);
    setLocalCorners(prev => {
      const next = [...prev] as [Corner,Corner,Corner,Corner];
      next[dragging] = pos;
      onCornersChange?.(next);
      return next;
    });
  }, [dragging, editMode, getRelativePos, onCornersChange]);

  const onMouseUp = useCallback(() => { setDragging(null); }, []);

  // ── Expose capture ────────────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    capture: async () => {
      // Re-render at full resolution first
      render();
      await new Promise(r => setTimeout(r, 50));
      return canvasRef.current?.toDataURL('image/jpeg', 0.92) ?? null;
    },
  }));

  // ── Render JSX ────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', userSelect: 'none', ...style }}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    >
      <canvas
        ref={canvasRef}
        width={canvasSize.w}
        height={canvasSize.h}
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />

      {/* Drag handles (only in editMode) */}
      {editMode && localCorners.map((corner, idx) => (
        <div
          key={idx}
          onMouseDown={onMouseDown(idx)}
          title={HANDLE_LABELS[idx]}
          style={{
            position: 'absolute',
            left:   `calc(${corner.x * 100}% - 10px)`,
            top:    `calc(${corner.y * 100}% - 10px)`,
            width:  20, height: 20,
            borderRadius: '50%',
            background: HANDLE_COLORS[idx],
            border: '2px solid #fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
            cursor: dragging === idx ? 'grabbing' : 'grab',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 7, fontWeight: 900, color: '#fff',
            zIndex: 10,
            transition: dragging === idx ? 'none' : 'box-shadow 0.15s',
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
