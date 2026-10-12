import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import * as THREE from 'three';

export type CadStandardView = 
  | 'iso'
  | 'top'
  | 'bottom'
  | 'front'
  | 'back'
  | 'right'
  | 'left';

interface CadViewCubeProps {
  camera?: THREE.Camera;
  controls?: any;
  onSelectView: (view: CadStandardView) => void;
  isOrtho?: boolean;
  onToggleOrtho?: () => void;
  className?: string;
}

export const CadViewCube: React.FC<CadViewCubeProps> = ({
  camera,
  controls,
  onSelectView,
  isOrtho = false,
  onToggleOrtho,
  className = ''
}) => {
  const [rotation, setRotation] = useState({ x: -25, y: 45, z: 0 });
  const [hoveredFace, setHoveredFace] = useState<string | null>(null);

  // Sync ViewCube orientation with camera if available
  useEffect(() => {
    if (!controls) return;

    let animId: number;
    const updateRotation = () => {
      if (controls && controls.object) {
        const cam = controls.object as THREE.Camera;
        const target = controls.target || new THREE.Vector3(0, 0, 0);
        const offset = new THREE.Vector3().subVectors(cam.position, target).normalize();

        const yaw = Math.atan2(offset.x, offset.z) * (180 / Math.PI);
        const pitch = Math.asin(Math.max(-1, Math.min(1, offset.y))) * (180 / Math.PI);

        setRotation({
          x: -pitch,
          y: yaw,
          z: 0
        });
      }
      animId = requestAnimationFrame(updateRotation);
    };

    animId = requestAnimationFrame(updateRotation);
    return () => cancelAnimationFrame(animId);
  }, [controls]);

  const cubeSize = 64; // Compact, clean CAD size
  const half = cubeSize / 2;

  // Standard uniform Autodesk Inventor / Onshape style ViewCube faces
  const faces = [
    { id: 'top', label: 'TOP', transform: `rotateX(90deg) translateZ(${half}px)` },
    { id: 'bottom', label: 'BOTTOM', transform: `rotateX(-90deg) translateZ(${half}px)` },
    { id: 'front', label: 'FRONT', transform: `rotateY(0deg) translateZ(${half}px)` },
    { id: 'back', label: 'BACK', transform: `rotateY(180deg) translateZ(${half}px)` },
    { id: 'right', label: 'RIGHT', transform: `rotateY(90deg) translateZ(${half}px)` },
    { id: 'left', label: 'LEFT', transform: `rotateY(-90deg) translateZ(${half}px)` },
  ];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Top Action Ribbon (Home + Ortho/Persp) */}
      <div className="flex items-center gap-1 mb-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 p-0.5 rounded-lg shadow-lg">
        <button
          type="button"
          onClick={() => onSelectView('iso')}
          title="Reset to Isometric View (Home)"
          className="p-1 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors cursor-pointer"
        >
          <Home size={12} />
        </button>
        <button
          type="button"
          onClick={onToggleOrtho}
          title={isOrtho ? "Switch to Perspective View" : "Switch to Orthographic View"}
          className={`px-1.5 py-0.5 text-[8.5px] font-mono font-bold rounded border transition-all cursor-pointer ${
            isOrtho
              ? "bg-sky-600/30 border-sky-400/60 text-sky-300"
              : "bg-transparent border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {isOrtho ? "ORTHO" : "PERSP"}
        </button>
      </div>

      {/* 3D ViewCube Container */}
      <div 
        className="relative cursor-pointer group"
        style={{ width: `${cubeSize + 20}px`, height: `${cubeSize + 20}px`, perspective: '350px' }}
      >
        {/* Compass Ring Floor */}
        <div 
          className="absolute inset-0 rounded-full border border-zinc-700/60 pointer-events-none flex items-center justify-center"
          style={{
            transform: `rotateX(60deg) scale(1.15) rotateZ(${-rotation.y}deg)`,
            transformStyle: 'preserve-3d',
            transition: 'transform 0.05s linear'
          }}
        >
          <span className="absolute -top-1 text-[7.5px] font-mono font-bold text-zinc-400">N</span>
          <span className="absolute -bottom-1 text-[7.5px] font-mono font-bold text-zinc-600">S</span>
          <span className="absolute -right-1 text-[7.5px] font-mono font-bold text-zinc-600">E</span>
          <span className="absolute -left-1 text-[7.5px] font-mono font-bold text-zinc-600">W</span>
        </div>

        {/* The 3D Cube */}
        <div
          className="absolute left-2.5 top-2.5"
          style={{
            width: `${cubeSize}px`,
            height: `${cubeSize}px`,
            transformStyle: 'preserve-3d',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.05s linear'
          }}
        >
          {faces.map((f) => (
            <div
              key={f.id}
              onClick={() => onSelectView(f.id as CadStandardView)}
              onMouseEnter={() => setHoveredFace(f.id)}
              onMouseLeave={() => setHoveredFace(null)}
              style={{
                position: 'absolute',
                width: `${cubeSize}px`,
                height: `${cubeSize}px`,
                transform: f.transform,
                backfaceVisibility: 'visible'
              }}
              className={`border border-zinc-600/80 bg-zinc-800/95 text-zinc-300 hover:text-white hover:bg-sky-600/35 hover:border-sky-400 flex items-center justify-center text-[9px] font-mono font-bold tracking-wider transition-colors shadow-inner ${
                hoveredFace === f.id ? 'border-sky-400 text-sky-200' : ''
              }`}
            >
              {f.label}
            </div>
          ))}
        </div>
      </div>

      {/* Quick View Presets Bar */}
      <div className="grid grid-cols-3 gap-0.5 mt-1.5 bg-zinc-900/90 backdrop-blur-md border border-zinc-700/80 p-0.5 rounded-lg shadow-lg">
        {[
          { id: 'top', label: 'Top' },
          { id: 'front', label: 'Front' },
          { id: 'right', label: 'Right' },
          { id: 'iso', label: 'Iso' },
          { id: 'left', label: 'Left' },
          { id: 'bottom', label: 'Btm' }
        ].map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={() => onSelectView(v.id as CadStandardView)}
            className="px-1.5 py-0.5 text-[8.5px] font-mono text-zinc-400 hover:text-white hover:bg-zinc-800 rounded transition-colors text-center cursor-pointer"
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
};
