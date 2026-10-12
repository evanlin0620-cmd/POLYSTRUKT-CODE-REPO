
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  type: 'stress' | 'thermal' | 'flow';
}

// Define PascalCase aliases for intrinsic Three.js elements to fix JSX type errors
const MeshPhysicalMaterial = 'meshPhysicalMaterial' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;
const PointLight = 'pointLight' as any;

const SimulationMesh = ({ type }: { type: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const config = useMemo(() => {
    switch (type) {
      case 'stress':
        // Red/Warning color for stress
        return { color: '#ef4444', pulseSpeed: 3, roughness: 0.2, scaleVar: 0.15 };
      case 'thermal':
        // Orange/Hot color for thermal
        return { color: '#f97316', pulseSpeed: 2, roughness: 0.4, scaleVar: 0.08 };
      case 'flow':
        // Blue/Fluid color for flow
        return { color: '#3b82f6', pulseSpeed: 4, roughness: 0.1, scaleVar: 0.12 };
      default:
        return { color: '#ffffff', pulseSpeed: 1, roughness: 0.5, scaleVar: 0 };
    }
  }, [type]);

  useFrame((state) => {
    if (meshRef.current) {
      const t = state.clock.getElapsedTime();
      
      // Rotation
      meshRef.current.rotation.x = t * 0.2;
      meshRef.current.rotation.y = t * 0.3;

      // Pulse Animation (Simulating distortion/activity manually to avoid shader errors)
      const baseScale = 1.3;
      const pulse = Math.sin(t * config.pulseSpeed) * config.scaleVar;
      const scale = baseScale + pulse;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  return (
    <Sphere args={[1, 64, 64]} ref={meshRef}>
      <MeshPhysicalMaterial 
        color={config.color} 
        envMapIntensity={1} 
        clearcoat={0.8} 
        clearcoatRoughness={0.2}
        roughness={config.roughness} 
        metalness={0.5}
      />
    </Sphere>
  );
};

export const SimulationPreview: React.FC<Props> = ({ type }) => {
  return (
    <div className="w-full h-48 bg-zinc-900 rounded-lg overflow-hidden relative shadow-inner">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        <span className="text-[10px] text-white/50 uppercase tracking-widest font-mono">Sim Mode</span>
        <span className="text-xs text-white font-bold uppercase tracking-tight">{type} Analysis</span>
      </div>
      
      {/* Legend/Key overlay */}
      <div className="absolute bottom-3 right-3 z-10 flex flex-col items-end gap-1 pointer-events-none">
         <div className="flex items-center gap-2">
            <span className="text-[8px] text-white/70 uppercase">High</span>
            <div className={`w-16 h-1 rounded-full bg-gradient-to-r ${type === 'stress' ? 'from-green-500 to-red-500' : type === 'thermal' ? 'from-yellow-400 to-red-600' : 'from-cyan-400 to-blue-600'}`} />
         </div>
      </div>

      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 45 }}>
        <AmbientLight intensity={0.5} />
        <SpotLight position={[10, 10, 10]} angle={0.5} penumbra={1} intensity={2} />
        <PointLight position={[-10, -10, -10]} intensity={1} color={type === 'thermal' ? '#ffaa00' : '#ffffff'} />
        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={1.5} />
        <SimulationMesh type={type} />
      </Canvas>
    </div>
  );
};
