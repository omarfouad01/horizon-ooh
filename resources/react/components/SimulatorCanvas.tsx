/**
 * SimulatorCanvas.tsx
 * Warps one or more user designs onto a billboard mockup using a proper projective
 * (homographic) transform on HTML5 Canvas — design fits EXACTLY each panel's corners.
 *
 * Props:
 *   mockupUrl        — URL of the street-photo background
 *   designUrls       — Array of design URLs, one per panel (blob URL or data URL)
 *   designUrl        — Legacy: single design URL (treated as designUrls[0])
 *   panels           — Array of 4-corner sets (one per billboard panel)
 *                       Each entry: [TL, TR, BR, BL] as fractions 0..1
 *   corners          — Legacy: single 4-corner set (treated as panels[0])
 *   editMode         — show drag handles + connecting lines (admin corner picker)
 *   activePanelIndex — which panel's handles are shown in editMode
 *   onPanelsChange   — callback when handles are moved (editMode only)
 *   onCornersChange  — legacy: callback for single-panel (uses activePanelIndex=0)
 *   style            — wrapper div style
 */
import {
  forwardRef, useImperativeHandle, useRef, useEffect, useCallback, useState,
} from 'react';

// ── Types ──────────────────────────────────────────────────────────────────────
export interface Corner { x: number; y: number }  // fractions 0..1
export type Panel = [Corner, Corner, Corner, Corner];  // TL TR BR BL

export interface SimulatorCanvasRef {
  capture: () => Promise<string | null>;
}

interface Props {
  mockupUrl:         string;
  /** Multi-panel: one design URL per panel */
  designUrls?:       string[];
  /** Legacy single-design shorthand */
  designUrl?:        string;
  /** Multi-panel corner sets */
  panels?:           Panel[];
  /** Legacy single-panel corners */
  corners?:          Panel;
  editMode?:         boolean;
  /** Which panel index is being edited (default 0) */
  activePanelIndex?: number;
  onPanelsChange?:   (panels: Panel[]) => void;
  /** Legacy alias → calls onPanelsChange with only index 0 updated */
  onCornersChange?:  (c: Panel) => void;
  style?:            React.CSSProperties;
}

// ── Math: 8×8 Gaussian elimination ────────────────────────────────────────────
function solve8x8(A: number[][], b: number[]): number[] {
  const n = 8;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let max = Math.abs(M[col][col]), piv = col;
    for (let row = col + 1; row < n; row++) {
      if (Math.abs(M[row][col]) > max) { max = Math.abs(M[row][col]); piv = row; }
    }
    [M[col], M[piv]] = [M[piv], M[col]];
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

// ── Compute homography: unit-square [TL,TR,BR,BL] → dst pixel corners ─────────
function computeHomography(dst: Panel, W: number, H: number): number[] {
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

// ── Inverse-map warp ───────────────────────────────────────────────────────────
function applyWarp(
  srcCanvas: HTMLCanvasElement,
  dstCtx: CanvasRenderingContext2D,
  dstW: number, dstH: number,
  H: number[],
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

// ── Load image helper ─────────────────────────────────────────────────────────
function loadImg(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (url.startsWith('http')) img.crossOrigin = 'anonymous';
    img.onload  = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
}

// ── Handle colours & labels ───────────────────────────────────────────────────
// Colors cycle per-panel: each panel gets its own set of 4 colored handles
const PANEL_COLORS = [
  ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],  // panel 0: green/blue/amber/red
  ['#a855f7', '#06b6d4', '#f97316', '#ec4899'],  // panel 1: purple/cyan/orange/pink
  ['#84cc16', '#0ea5e9', '#eab308', '#f43f5e'],  // panel 2: ...
];
const HANDLE_LABELS = ['TL', 'TR', 'BR', 'BL'];

// Default panel positions
const DEFAULT_PANEL: Panel = [
  { x: 0.15, y: 0.2 }, { x: 0.85, y: 0.2 },
  { x: 0.85, y: 0.75 }, { x: 0.15, y: 0.75 },
];

// ── Component ─────────────────────────────────────────────────────────────────
const SimulatorCanvas = forwardRef<SimulatorCanvasRef, Props>((
  {
    mockupUrl,
    designUrls: designUrlsProp,
    designUrl:  designUrlSingle,
    panels:     panelsProp,
    corners:    cornersSingle,
    editMode = false,
    activePanelIndex = 0,
    onPanelsChange,
    onCornersChange,
    style,
  },
  ref,
) => {
  // Normalise to arrays
  const panels: Panel[] = (panelsProp && panelsProp.length > 0)
    ? panelsProp
    : cornersSingle
      ? [cornersSingle]
      : [DEFAULT_PANEL];

  const designUrls: string[] = designUrlsProp && designUrlsProp.length > 0
    ? designUrlsProp
    : designUrlSingle
      ? [designUrlSingle]
      : [];

  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const mockupRef     = useRef<HTMLImageElement | null>(null);
  // Array of design images, one per panel
  const designsRef    = useRef<(HTMLImageElement | null)[]>([]);
  const panelsRef     = useRef<Panel[]>(panels);
  const [localPanels, setLocalPanels] = useState<Panel[]>(panels);
  const [dragging, setDragging] = useState<{ panel: number; corner: number } | null>(null);
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 450 });

  // Keep ref in sync
  useEffect(() => { panelsRef.current = localPanels; }, [localPanels]);

  // Sync incoming panels/corners prop
  useEffect(() => {
    const next: Panel[] = (panelsProp && panelsProp.length > 0)
      ? panelsProp
      : cornersSingle
        ? [cornersSingle]
        : [DEFAULT_PANEL];
    setLocalPanels(next);
    panelsRef.current = next;
  }, [panelsProp, cornersSingle]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Core render ──────────────────────────────────────────────────────────
  const renderCanvas = useCallback(() => {
    const canvas  = canvasRef.current;
    const mockup  = mockupRef.current;
    if (!canvas || !mockup) return;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(mockup, 0, 0, W, H);

    const crns = panelsRef.current;
    const designs = designsRef.current;

    for (let pi = 0; pi < crns.length; pi++) {
      const design = designs[pi];
      if (!design || !design.complete || design.naturalWidth === 0) continue;
      const srcC = document.createElement('canvas');
      srcC.width  = design.naturalWidth;
      srcC.height = design.naturalHeight;
      srcC.getContext('2d')!.drawImage(design, 0, 0);
      const H_mat = computeHomography(crns[pi], W, H);
      const dstC  = document.createElement('canvas');
      dstC.width  = W; dstC.height = H;
      applyWarp(srcC, dstC.getContext('2d')!, W, H, H_mat);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.drawImage(dstC, 0, 0);
      ctx.restore();
    }
  }, []); // reads from refs — always fresh

  // ── Load mockup ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mockupUrl) return;
    let cancelled = false;
    loadImg(mockupUrl).then(img => {
      if (cancelled) return;
      mockupRef.current = img;
      const container = containerRef.current;
      const maxW = container?.clientWidth || 800;
      const ratio = img.naturalHeight / img.naturalWidth;
      const w = maxW, h = Math.max(1, Math.round(maxW * ratio));
      setCanvasSize({ w, h });
      setTimeout(() => renderCanvas(), 0);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [mockupUrl, renderCanvas]);

  // ── Load designs (re-run when designUrls change) ──────────────────────
  useEffect(() => {
    let cancelled = false;
    const newDesigns: (HTMLImageElement | null)[] = new Array(panels.length).fill(null);
    const promises = designUrls.map((url, i) => {
      if (!url) return Promise.resolve();
      return loadImg(url).then(img => {
        if (!cancelled) newDesigns[i] = img;
      }).catch(() => {});
    });
    Promise.all(promises).then(() => {
      if (!cancelled) {
        designsRef.current = newDesigns;
        renderCanvas();
      }
    });
    return () => { cancelled = true; };
  }, [designUrls.join(','), panels.length, renderCanvas]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-render when panels change
  useEffect(() => {
    panelsRef.current = localPanels;
    renderCanvas();
  }, [localPanels, renderCanvas]);

  // Re-render when canvas dimensions set
  useEffect(() => { setTimeout(() => renderCanvas(), 0); }, [canvasSize, renderCanvas]);

  // ── Drag logic ────────────────────────────────────────────────────────────
  const getRelativePos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    return {
      x: Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)),
      y: Math.max(0, Math.min(1, (clientY - rect.top)  / rect.height)),
    };
  }, []);

  const onMouseDown = useCallback((panelIdx: number, cornerIdx: number) =>
    (e: React.MouseEvent) => {
      if (!editMode) return;
      e.preventDefault();
      setDragging({ panel: panelIdx, corner: cornerIdx });
    }, [editMode]);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (dragging === null || !editMode) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setLocalPanels(prev => {
      const next = prev.map(p => [...p] as Panel) as Panel[];
      next[dragging.panel][dragging.corner] = pos;
      onPanelsChange?.(next);
      // Legacy callback for single-panel
      if (dragging.panel === 0) onCornersChange?.(next[0]);
      return next;
    });
  }, [dragging, editMode, getRelativePos, onPanelsChange, onCornersChange]);

  const onMouseUp = useCallback(() => { setDragging(null); }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragging === null || !editMode) return;
    e.preventDefault();
    const pos = getRelativePos(e);
    setLocalPanels(prev => {
      const next = prev.map(p => [...p] as Panel) as Panel[];
      next[dragging.panel][dragging.corner] = pos;
      onPanelsChange?.(next);
      if (dragging.panel === 0) onCornersChange?.(next[0]);
      return next;
    });
  }, [dragging, editMode, getRelativePos, onPanelsChange, onCornersChange]);

  // ── Capture for download ──────────────────────────────────────────────────
  useImperativeHandle(ref, () => ({
    capture: async () => {
      const mockup = mockupRef.current;
      if (!mockup) return null;
      const W = canvasSize.w || mockup.naturalWidth;
      const H = canvasSize.h || mockup.naturalHeight;
      const offscreen = document.createElement('canvas');
      offscreen.width  = W;
      offscreen.height = H;
      const ctx = offscreen.getContext('2d')!;
      try { ctx.drawImage(mockup, 0, 0, W, H); } catch { /* tainted */ }
      const crns    = panelsRef.current;
      const designs = designsRef.current;
      for (let pi = 0; pi < crns.length; pi++) {
        const design = designs[pi];
        if (!design || !design.complete || design.naturalWidth === 0) continue;
        const srcC = document.createElement('canvas');
        srcC.width  = design.naturalWidth;
        srcC.height = design.naturalHeight;
        srcC.getContext('2d')!.drawImage(design, 0, 0);
        const H_mat = computeHomography(crns[pi], W, H);
        const dstC  = document.createElement('canvas');
        dstC.width  = W; dstC.height = H;
        applyWarp(srcC, dstC.getContext('2d')!, W, H, H_mat);
        ctx.globalCompositeOperation = 'source-over';
        ctx.drawImage(dstC, 0, 0);
      }
      try {
        return offscreen.toDataURL('image/jpeg', 0.92);
      } catch {
        try { return canvasRef.current?.toDataURL('image/jpeg', 0.92) ?? null; }
        catch { return null; }
      }
    },
  }));

  // ── JSX ────────────────────────────────────────────────────────────────────
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

      {/* SVG overlay: connecting lines for ALL panels in editMode */}
      {editMode && (
        <svg
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            pointerEvents: 'none', overflow: 'visible',
          }}
        >
          {localPanels.map((panel, pi) => {
            const colors = PANEL_COLORS[pi % PANEL_COLORS.length];
            const strokeColor = pi === activePanelIndex
              ? 'rgba(255,255,255,0.9)'
              : 'rgba(255,255,255,0.45)';
            return (
              <g key={pi}>
                <polygon
                  points={panel.map(c => `${c.x * 100}%,${c.y * 100}%`).join(' ')}
                  fill={`rgba(217,4,41,${pi === activePanelIndex ? '0.08' : '0.04'})`}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  strokeDasharray="6 3"
                />
                {/* Cross-lines for alignment */}
                <line
                  x1={`${panel[0].x * 100}%`} y1={`${panel[0].y * 100}%`}
                  x2={`${panel[2].x * 100}%`} y2={`${panel[2].y * 100}%`}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 4"
                />
                <line
                  x1={`${panel[1].x * 100}%`} y1={`${panel[1].y * 100}%`}
                  x2={`${panel[3].x * 100}%`} y2={`${panel[3].y * 100}%`}
                  stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 4"
                />
                {/* Corner handles */}
                {panel.map((corner, ci) => (
                  <circle
                    key={ci}
                    cx={`${corner.x * 100}%`}
                    cy={`${corner.y * 100}%`}
                    r={7}
                    fill={colors[ci]}
                    stroke="#fff"
                    strokeWidth={2}
                    opacity={pi === activePanelIndex ? 1 : 0.6}
                  />
                ))}
              </g>
            );
          })}
        </svg>
      )}

      {/* Drag handles — only for active panel in editMode */}
      {editMode && localPanels.map((panel, pi) =>
        (pi === activePanelIndex ? panel : []).map((corner: Corner, ci: number) => {
          const colors = PANEL_COLORS[pi % PANEL_COLORS.length];
          return (
            <div
              key={`${pi}-${ci}`}
              onMouseDown={onMouseDown(pi, ci)}
              onTouchStart={(e) => { e.preventDefault(); setDragging({ panel: pi, corner: ci }); }}
              title={`Panel ${pi + 1} — ${HANDLE_LABELS[ci]}`}
              style={{
                position:       'absolute',
                left:           `calc(${corner.x * 100}% - 12px)`,
                top:            `calc(${corner.y * 100}% - 12px)`,
                width:          24, height: 24, borderRadius: '50%',
                background:     colors[ci],
                border:         '2.5px solid #fff',
                boxShadow:      dragging?.panel === pi && dragging?.corner === ci
                  ? `0 0 0 3px ${colors[ci]}55, 0 4px 16px rgba(0,0,0,0.5)`
                  : '0 2px 10px rgba(0,0,0,0.45)',
                cursor:         dragging?.panel === pi && dragging?.corner === ci ? 'grabbing' : 'grab',
                display:        'flex', alignItems: 'center', justifyContent: 'center',
                fontSize:       8, fontWeight: 900, color: '#fff',
                zIndex:         20,
                transition:     dragging ? 'none' : 'box-shadow 0.15s',
                touchAction:    'none',
              }}
            >
              {HANDLE_LABELS[ci]}
            </div>
          );
        })
      )}
    </div>
  );
});

SimulatorCanvas.displayName = 'SimulatorCanvas';
export default SimulatorCanvas;
