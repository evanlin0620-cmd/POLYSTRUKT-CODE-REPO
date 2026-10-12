import React, { useEffect, useRef } from 'react';
import { ProceduralSpec } from '../types';

interface BlueprintViewProps {
  spec: ProceduralSpec;
  width?: number;
  height?: number;
}

export const BlueprintView: React.FC<BlueprintViewProps> = ({ spec, width = 600, height = 400 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and set styles
    ctx.clearRect(0, 0, width, height);
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, width, height);

    const drawGrid = () => {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, height); ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(width, i); ctx.stroke();
      }
    };

    const drawProjection = (x: number, y: number, size: number, title: string, mode: 'front' | 'side' | 'top') => {
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, size, size);
      ctx.fillStyle = '#3b82f6';
      ctx.font = '10px JetBrains Mono';
      ctx.fillText(title, x + 5, y + 15);

      // Simplified blueprint lines based on spec
      const drawSpec = (node: ProceduralSpec, offsetX: number, offsetY: number, scale: number) => {
        if ('type' in node) {
          const [w, h, d] = node.args;
          ctx.beginPath();
          if (mode === 'front') ctx.rect(offsetX + size/2 - (w*scale)/2, offsetY + size/2 - (h*scale)/2, w*scale, h*scale);
          if (mode === 'side') ctx.rect(offsetX + size/2 - (d*scale)/2, offsetY + size/2 - (h*scale)/2, d*scale, h*scale);
          if (mode === 'top') ctx.rect(offsetX + size/2 - (w*scale)/2, offsetY + size/2 - (d*scale)/2, w*scale, d*scale);
          ctx.stroke();
          
          // Technical Dims
          ctx.setLineDash([2, 4]);
          ctx.beginPath();
          ctx.moveTo(offsetX, offsetY + size/2);
          ctx.lineTo(offsetX + (size/2 - (w*scale)/2), offsetY + size/2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
        if ('children' in node) node.children.forEach(c => drawSpec(c, offsetX, offsetY, scale));
        if ('a' in node) { drawSpec(node.a, offsetX, offsetY, scale); drawSpec(node.b, offsetX, offsetY, scale); }
      };

      drawSpec(spec, x, y, 5);
    };

    drawGrid();
    drawProjection(20, 40, 150, 'FRONT VIEW', 'front');
    drawProjection(210, 40, 150, 'SIDE VIEW', 'side');
    drawProjection(400, 40, 150, 'TOP VIEW', 'top');

    // Title Block
    ctx.fillStyle = '#94a3b8';
    ctx.font = 'bold 12px JetBrains Mono';
    ctx.fillText('ENGINEERING SPEC SHEET V1.0', 20, 240);
    ctx.font = '10px JetBrains Mono';
    ctx.fillText(`GENERATED: ${new Date().toLocaleDateString()}`, 20, 260);
    ctx.fillText('CONFIDENTIAL POLYSTRUKT INTEL', 20, 280);

  }, [spec, width, height]);

  return (
    <div className="relative group overflow-hidden rounded-xl border border-blue-500/30 bg-black shadow-2xl">
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="w-full h-auto cursor-crosshair opacity-90 group-hover:opacity-100 transition-opacity"
      />
      <div className="absolute top-4 right-4 flex gap-2">
        <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/30 px-2 py-1 rounded text-[10px] text-blue-400 font-mono">
          ORTHO_PROJECT_ACTIVE
        </div>
      </div>
    </div>
  );
};
