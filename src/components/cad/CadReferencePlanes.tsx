import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface CadReferencePlanesProps {
  visible: boolean;
  size?: number;
  opacity?: number;
  showTop?: boolean;
  showFront?: boolean;
  showRight?: boolean;
  showOrigin?: boolean;
  showGrid?: boolean;
}

export const CadReferencePlanes: React.FC<CadReferencePlanesProps> = ({
  visible,
  size = 18,
  opacity = 0.06,
  showTop = true,
  showFront = true,
  showRight = true,
  showOrigin = true,
  showGrid = true,
}) => {
  if (!visible) return null;

  const halfSize = size / 2;

  // Standard Onshape & Autodesk Inventor datum plane styling:
  // Uniform calm translucent slate-gray planes with subtle borders (no harsh contrasting colors)
  const planeColor = '#94a3b8'; // Calm neutral slate
  const planeBorderColor = '#64748b'; // Subtle border

  // Plane border line geometry
  const borderEdges = useMemo(() => {
    const s = halfSize;
    const points = [
      new THREE.Vector3(-s, -s, 0),
      new THREE.Vector3(s, -s, 0),
      new THREE.Vector3(s, s, 0),
      new THREE.Vector3(-s, s, 0),
      new THREE.Vector3(-s, -s, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [halfSize]);

  return (
    <group name="cad_reference_coordinate_system">
      {/* --- STANDARD COMPACT CAD ORIGIN TRIAD (Subtle, proportional, not bulky) --- */}
      {showOrigin && (
        <group position={[0, 0, 0]}>
          {/* Origin Center Point */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color="#e2e8f0" />
          </mesh>

          {/* X Axis (+X: Soft red) */}
          <group>
            <mesh position={[0.5, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 1.0, 8]} />
              <meshBasicMaterial color="#e06c75" transparent opacity={0.85} />
            </mesh>
            <Html position={[1.15, 0, 0]} center>
              <span className="text-[8px] font-mono font-semibold text-rose-300/80 select-none pointer-events-none">
                X
              </span>
            </Html>
          </group>

          {/* Y Axis (+Y: Soft green - Up) */}
          <group>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.0, 8]} />
              <meshBasicMaterial color="#98c379" transparent opacity={0.85} />
            </mesh>
            <Html position={[0, 1.15, 0]} center>
              <span className="text-[8px] font-mono font-semibold text-emerald-300/80 select-none pointer-events-none">
                Y
              </span>
            </Html>
          </group>

          {/* Z Axis (+Z: Soft blue) */}
          <group>
            <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 1.0, 8]} />
              <meshBasicMaterial color="#61afef" transparent opacity={0.85} />
            </mesh>
            <Html position={[0, 0, 1.15]} center>
              <span className="text-[8px] font-mono font-semibold text-sky-300/80 select-none pointer-events-none">
                Z
              </span>
            </Html>
          </group>
        </group>
      )}

      {/* --- TOP PLANE (Horizontal ground plane, normal = Y) --- */}
      {showTop && (
        <group position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
              color={planeColor}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
          <lineLoop geometry={borderEdges}>
            <lineBasicMaterial color={planeBorderColor} transparent opacity={0.3} />
          </lineLoop>
          <Html position={[halfSize - 1.2, halfSize - 1.2, 0]} center>
            <div className="bg-zinc-900/90 border border-zinc-700/60 text-zinc-300 text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded pointer-events-none select-none shadow-sm">
              Top
            </div>
          </Html>
        </group>
      )}

      {/* --- FRONT PLANE (Vertical front plane, normal = Z) --- */}
      {showFront && (
        <group position={[0, 0, 0]}>
          <mesh>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
              color={planeColor}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
          <lineLoop geometry={borderEdges}>
            <lineBasicMaterial color={planeBorderColor} transparent opacity={0.3} />
          </lineLoop>
          <Html position={[halfSize - 1.2, halfSize - 1.2, 0]} center>
            <div className="bg-zinc-900/90 border border-zinc-700/60 text-zinc-300 text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded pointer-events-none select-none shadow-sm">
              Front
            </div>
          </Html>
        </group>
      )}

      {/* --- RIGHT PLANE (Vertical side plane, normal = X) --- */}
      {showRight && (
        <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh>
            <planeGeometry args={[size, size]} />
            <meshStandardMaterial
              color={planeColor}
              transparent
              opacity={opacity}
              side={THREE.DoubleSide}
              depthWrite={false}
              roughness={0.9}
            />
          </mesh>
          <lineLoop geometry={borderEdges}>
            <lineBasicMaterial color={planeBorderColor} transparent opacity={0.3} />
          </lineLoop>
          <Html position={[halfSize - 1.2, halfSize - 1.2, 0]} center>
            <div className="bg-zinc-900/90 border border-zinc-700/60 text-zinc-300 text-[8.5px] font-mono font-medium px-1.5 py-0.5 rounded pointer-events-none select-none shadow-sm">
              Right
            </div>
          </Html>
        </group>
      )}

      {/* Subtle CAD Ground Grid (Gentle slate grid, like Onshape/Inventor) */}
      {showGrid && (
        <gridHelper
          args={[size * 1.4, 28, '#334155', '#1e293b']}
          position={[0, -0.005, 0]}
        />
      )}
    </group>
  );
};
