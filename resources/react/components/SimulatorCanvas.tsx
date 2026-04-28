/**
 * SimulatorCanvas.tsx — Renders uploaded design(s) onto a billboard mockup
 * using CSS perspective transform (homography projection).
 * Corners are stored in NATURAL image coordinates (0..naturalWidth, 0..naturalHeight).
 * At render time they are scaled to the displayed container dimensions.
 */
import { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import type { SimPanel, SimCorner } from '@/store/dataStore';

interface Props {
  mockupUrl: string;
  designUrls: string[];      // one per panel
  panels: SimPanel[];        // each panel = 4 corners [{x,y}] in natural image coords
  containerWidth?: number;
  containerHeight?: number;
}

export interface SimulatorCanvasHandle {
  capture: () => Promise<string | null>;  // returns data URL
}

// Compute homography 3×3 matrix mapping unit-square src to 4 dst corners
function computeHomography(
  dst: [SimCorner, SimCorner, SimCorner, SimCorner]
): number[] {
  const [tl, tr, br, bl] = dst;
  const adjugate = (m: number[][]): number[][] => {
    const [[a,b,c],[d,e,f],[g,h,i]] = m;
    return [
      [e*i-f*h, c*h-b*i, b*f-c*e],
      [f*g-d*i, a*i-c*g, c*d-a*f],
      [d*h-e*g, b*g-a*h, a*e-b*d],
    ];
  };
  const mul = (a: number[][], b: number[][]): number[][] => {
    const r: number[][] = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) for (let k=0;k<3;k++) r[i][j]+=a[i][k]*b[k][j];
    return r;
  };
  const basis = (p1: SimCorner, p2: SimCorner, p3: SimCorner, p4: SimCorner): number[][] => {
    const m: number[][] = [
      [p1.x-p3.x, p2.x-p3.x, p3.x],
      [p1.y-p3.y, p2.y-p3.y, p3.y],
      [1,         1,          1   ],
    ];
    const adj = adjugate(m);
    const res = [
      adj[0][0]*p4.x + adj[0][1]*p4.y + adj[0][2],
      adj[1][0]*p4.x + adj[1][1]*p4.y + adj[1][2],
      adj[2][0]*p4.x + adj[2][1]*p4.y + adj[2][2],
    ];
    return [
      [m[0][0]*res[0], m[0][1]*res[1], m[0][2]*res[2]],
      [m[1][0]*res[0], m[1][1]*res[1], m[1][2]*res[2]],
      [m[2][0]*res[0], m[2][1]*res[1], m[2][2]*res[2]],
    ];
  };
  // Map unit square to dst
  const srcBasis = basis({x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1});
  const dstBasis = basis(tl, tr, br, bl);
  const t = mul(dstBasis, adjugate(srcBasis));
  const s = t[2][2];
  return [
    t[0][0]/s, t[1][0]/s, 0, t[2][0]/s,
    t[0][1]/s, t[1][1]/s, 0, t[2][1]/s,
    0,         0,         1, 0,
    t[0][2]/s, t[1][2]/s, 0, 1,
  ];
}

// Scale corners from natural image coords to displayed container coords
function scaleCorners(
  corners: SimCorner[],
  naturalW: number, naturalH: number,
  displayW: number, displayH: number,
  offsetX: number, offsetY: number,
): SimCorner[] {
  if (!naturalW || !naturalH) return corners;
  const scaleX = displayW / naturalW;
  const scaleY = displayH / naturalH;
  return corners.map(c => ({
    x: c.x * scaleX + offsetX,
    y: c.y * scaleY + offsetY,
  }));
}

const SimulatorCanvas = forwardRef<SimulatorCanvasHandle, Props>(
  ({ mockupUrl, designUrls, panels, containerWidth = 800, containerHeight = 600 }, ref) => {
    const mockupRef   = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [imgSize, setImgSize] = useState({ natW: 0, natH: 0, dispW: 0, dispH: 0, offX: 0, offY: 0 });

    // Measure rendered image dimensions (object-fit: contain leaves letterbox)
    useEffect(() => {
      const img = mockupRef.current;
      if (!img) return;
      const measure = () => {
        const natW = img.naturalWidth  || containerWidth;
        const natH = img.naturalHeight || containerHeight;
        const contW = containerWidth;
        const contH = containerHeight;
        // object-fit: contain
        const scale = Math.min(contW / natW, contH / natH);
        const dispW = natW * scale;
        const dispH = natH * scale;
        const offX  = (contW - dispW) / 2;
        const offY  = (contH - dispH) / 2;
        setImgSize({ natW, natH, dispW, dispH, offX, offY });
      };
      if (img.complete && img.naturalWidth) { measure(); }
      else { img.onload = measure; }
    }, [mockupUrl, containerWidth, containerHeight]);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        try {
          const img = mockupRef.current;
          if (!img) return null;
          const natW = img.naturalWidth  || containerWidth;
          const natH = img.naturalHeight || containerHeight;
          const canvas = document.createElement('canvas');
          canvas.width  = natW;
          canvas.height = natH;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;
          // Draw mockup at natural size
          ctx.drawImage(img, 0, 0, natW, natH);
          // Draw each design panel (corners already in natural coords)
          for (let i = 0; i < panels.length; i++) {
            const designUrl = designUrls[i];
            if (!designUrl || !panels[i] || panels[i].length < 4) continue;
            const panel = panels[i];
            await new Promise<void>((resolve) => {
              const dImg = new Image();
              dImg.crossOrigin = 'anonymous';
              dImg.onload = () => {
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(panel[0].x, panel[0].y);
                ctx.lineTo(panel[1].x, panel[1].y);
                ctx.lineTo(panel[2].x, panel[2].y);
                ctx.lineTo(panel[3].x, panel[3].y);
                ctx.closePath();
                ctx.clip();
                const xs = panel.map(p => p.x);
                const ys = panel.map(p => p.y);
                const minX = Math.min(...xs), maxX = Math.max(...xs);
                const minY = Math.min(...ys), maxY = Math.max(...ys);
                ctx.drawImage(dImg, minX, minY, maxX - minX, maxY - minY);
                ctx.restore();
                resolve();
              };
              dImg.onerror = () => resolve();
              dImg.src = designUrl;
            });
          }
          return canvas.toDataURL('image/png');
        } catch {
          return null;
        }
      }
    }));

    return (
      <div ref={containerRef} style={{ position: 'relative', width: containerWidth, height: containerHeight, maxWidth: '100%' }}>
        {/* Mockup background */}
        <img
          ref={mockupRef}
          src={mockupUrl}
          alt="Billboard mockup"
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Design overlays — use CSS matrix3d */}
        {imgSize.natW > 0 && panels.map((panel, i) => {
          const designUrl = designUrls[i];
          if (!designUrl || !panel || panel.length < 4) return null;

          // Scale corners from natural → display coords
          const scaled = scaleCorners(
            panel,
            imgSize.natW, imgSize.natH,
            imgSize.dispW, imgSize.dispH,
            imgSize.offX, imgSize.offY,
          ) as [SimCorner, SimCorner, SimCorner, SimCorner];

          // Compute homography mapping unit square → scaled corners
          const matrix = computeHomography(scaled);

          // Design image at 1×1 px then scaled via matrix to fill quadrilateral
          const SRC = 1000;

          return (
            <img
              key={i}
              src={designUrl}
              alt={`Design ${i + 1}`}
              style={{
                position:       'absolute',
                top:            0,
                left:           0,
                width:          SRC,
                height:         SRC,
                transform:      `matrix3d(${matrix.join(',')})`,
                transformOrigin:'0 0',
                objectFit:      'fill',
                pointerEvents:  'none',
              }}
            />
          );
        })}
      </div>
    );
  }
);

SimulatorCanvas.displayName = 'SimulatorCanvas';
export default SimulatorCanvas;
