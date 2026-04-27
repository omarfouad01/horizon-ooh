/**
 * SimulatorCanvas.tsx — Renders uploaded design(s) onto a billboard mockup
 * using CSS perspective transform (homography approximation).
 */
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { SimPanel, SimCorner } from '@/store/dataStore';

interface Props {
  mockupUrl: string;
  designUrls: string[];      // one per panel
  panels: SimPanel[];        // each panel = 4 corners [{x,y},...]
  containerWidth?: number;
  containerHeight?: number;
}

export interface SimulatorCanvasHandle {
  capture: () => Promise<string | null>;  // returns data URL
}

// Convert 4 corner points to a CSS matrix3d transform string
function cornersToMatrix3d(
  corners: [SimCorner, SimCorner, SimCorner, SimCorner],
  srcW: number, srcH: number,
): string {
  // corners: [TL, TR, BR, BL]
  const [tl, tr, br, bl] = corners;
  // We map the unit square [0,0]->[1,1] to the 4 corners
  // Using the CSS matrix3d perspective projection
  const adjugateMatrix = (m: number[][]): number[][] => {
    const [[a,b,c],[d,e,f],[g,h,i]] = m;
    return [
      [e*i-f*h, c*h-b*i, b*f-c*e],
      [f*g-d*i, a*i-c*g, c*d-a*f],
      [d*h-e*g, b*g-a*h, a*e-b*d],
    ];
  };
  const multiplyMatrices = (a: number[][], b: number[][]): number[][] => {
    const result: number[][] = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i=0;i<3;i++) for (let j=0;j<3;j++) for (let k=0;k<3;k++) result[i][j]+=a[i][k]*b[k][j];
    return result;
  };
  const basis = (p1: SimCorner, p2: SimCorner, p3: SimCorner, p4: SimCorner): number[][] => {
    const m: number[][] = [[p1.x-p3.x,p2.x-p3.x,p3.x],[p1.y-p3.y,p2.y-p3.y,p3.y],[1,1,1]];
    const v = adjugateMatrix(m);
    const res = [v[0][0]*p4.x+v[0][1]*p4.y+v[0][2], v[1][0]*p4.x+v[1][1]*p4.y+v[1][2], v[2][0]*p4.x+v[2][1]*p4.y+v[2][2]];
    return [[m[0][0]*res[0],m[0][1]*res[1],m[0][2]*res[2]],[m[1][0]*res[0],m[1][1]*res[1],m[1][2]*res[2]],[m[2][0]*res[0],m[2][1]*res[1],m[2][2]*res[2]]];
  };
  const srcBasis = basis({x:0,y:0},{x:srcW,y:0},{x:srcW,y:srcH},{x:0,y:srcH});
  const dstBasis = basis(tl, tr, br, bl);
  const transform = multiplyMatrices(dstBasis, adjugateMatrix(srcBasis));
  const t = transform;
  const scale = t[2][2];
  // CSS matrix3d(a,b,0,0, c,d,0,0, 0,0,1,0, tx,ty,0,1)
  // For perspective we use matrix3d with 16 values
  return [
    t[0][0]/scale, t[1][0]/scale, 0, t[2][0]/scale,
    t[0][1]/scale, t[1][1]/scale, 0, t[2][1]/scale,
    0,             0,             1, 0,
    t[0][2]/scale, t[1][2]/scale, 0, 1,
  ].join(',');
}

const SimulatorCanvas = forwardRef<SimulatorCanvasHandle, Props>(
  ({ mockupUrl, designUrls, panels, containerWidth = 800, containerHeight = 600 }, ref) => {
    const mockupRef = useRef<HTMLImageElement>(null);

    useImperativeHandle(ref, () => ({
      capture: async () => {
        try {
          const canvas = document.createElement('canvas');
          const img = mockupRef.current;
          if (!img) return null;
          canvas.width  = img.naturalWidth  || containerWidth;
          canvas.height = img.naturalHeight || containerHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) return null;

          // Draw mockup
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Draw each design panel
          for (let i = 0; i < panels.length; i++) {
            const designUrl = designUrls[i];
            if (!designUrl || !panels[i]) continue;
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

                // Compute bounding box for scaling
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

    const displayW = containerWidth;
    const displayH = containerHeight;

    return (
      <div style={{ position: 'relative', width: displayW, height: displayH, maxWidth: '100%' }}>
        {/* Mockup background */}
        <img
          ref={mockupRef}
          src={mockupUrl}
          alt="Billboard mockup"
          crossOrigin="anonymous"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' }}
        />

        {/* Design overlays */}
        {panels.map((panel, i) => {
          const designUrl = designUrls[i];
          if (!designUrl || !panel || panel.length < 4) return null;

          const srcW = 1000, srcH = 1000; // arbitrary source dimensions
          const matrix = cornersToMatrix3d(panel as [SimCorner, SimCorner, SimCorner, SimCorner], srcW, srcH);

          return (
            <img
              key={i}
              src={designUrl}
              alt={`Design ${i + 1}`}
              style={{
                position: 'absolute',
                top: 0, left: 0,
                width: srcW, height: srcH,
                transform: `matrix3d(${matrix})`,
                transformOrigin: '0 0',
                objectFit: 'fill',
                mixBlendMode: 'multiply',
                pointerEvents: 'none',
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
