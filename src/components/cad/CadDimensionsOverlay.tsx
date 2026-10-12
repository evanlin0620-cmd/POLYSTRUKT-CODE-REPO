import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface CadDimensionsOverlayProps {
  visible: boolean;
  meshes: THREE.Mesh[];
  scaleFactor?: number;
  selectedMaterial?: { name: string; density?: number };
}

export const CadDimensionsOverlay: React.FC<CadDimensionsOverlayProps> = ({
  visible,
  meshes,
  scaleFactor = 1,
  selectedMaterial = { name: 'Aluminum 6061', density: 2.7 }
}) => {
  // Compute overall bounding box
  const bounds = useMemo(() => {
    if (!meshes || meshes.length === 0) return null;

    const box = new THREE.Box3();
    let hasValidMesh = false;

    meshes.forEach((m) => {
      if (m && m.geometry) {
        if (!m.geometry.boundingBox) m.geometry.computeBoundingBox();
        box.expandByObject(m);
        hasValidMesh = true;
      }
    });

    if (!hasValidMesh) return null;

    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    // Multiplied by scale factor to convert to millimeters
    const mmScale = 10; // 1 unit in Three.js corresponds to 10mm in model space
    const widthMM = size.x * mmScale;
    const heightMM = size.y * mmScale;
    const depthMM = size.z * mmScale;

    // Volume in cm3 (approx)
    const volumeCm3 = (widthMM * heightMM * depthMM * 0.45) / 1000;
    const density = selectedMaterial.density || 2.7; // g/cm3
    const massKg = (volumeCm3 * density) / 1000;

    return {
      box,
      size,
      center,
      min: box.min,
      max: box.max,
      widthMM: widthMM.toFixed(1),
      heightMM: heightMM.toFixed(1),
      depthMM: depthMM.toFixed(1),
      volumeCm3: volumeCm3.toFixed(1),
      massKg: massKg.toFixed(2),
      density
    };
  }, [meshes, scaleFactor, selectedMaterial]);

  if (!visible || !bounds) return null;

  const { min, max, center, widthMM, heightMM, depthMM } = bounds;

  // Offsets for dimension lines outside the model geometry
  const pad = 1.0;
  const lineColor = '#64748b'; // Professional neutral technical drafting slate

  return (
    <group name="cad_dimensions_overlay">
      {/* 3D Wireframe Bounding Cage - subtle neutral drafting line */}
      <box3Helper args={[bounds.box, new THREE.Color('#475569')]} />

      {/* --- X-AXIS DIMENSION (Width) --- */}
      <group position={[0, min.y - pad, max.z + pad]}>
        {/* Dimension Line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([min.x, 0, 0, max.x, 0, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Left Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([min.x, -0.3, 0, min.x, 0.3, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Right Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([max.x, -0.3, 0, max.x, 0.3, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Label */}
        <Html position={[center.x, -0.5, 0]} center>
          <div className="bg-zinc-900/90 border border-zinc-750 text-zinc-300 text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none select-none">
            X: {widthMM} mm
          </div>
        </Html>
      </group>

      {/* --- Y-AXIS DIMENSION (Height) --- */}
      <group position={[min.x - pad, 0, max.z + pad]}>
        {/* Dimension Line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, min.y, 0, 0, max.y, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Bottom Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-0.3, min.y, 0, 0.3, min.y, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Top Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([-0.3, max.y, 0, 0.3, max.y, 0])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Label */}
        <Html position={[-0.6, center.y, 0]} center>
          <div className="bg-zinc-900/90 border border-zinc-750 text-zinc-300 text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none select-none">
            Y: {heightMM} mm
          </div>
        </Html>
      </group>

      {/* --- Z-AXIS DIMENSION (Depth) --- */}
      <group position={[max.x + pad, min.y - pad, 0]}>
        {/* Dimension Line */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, 0, min.z, 0, 0, max.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Back Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -0.3, min.z, 0, 0.3, min.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Front Tick */}
        <line>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array([0, -0.3, max.z, 0, 0.3, max.z])}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={lineColor} />
        </line>
        {/* Label */}
        <Html position={[0.5, 0, center.z]} center>
          <div className="bg-zinc-900/90 border border-zinc-750 text-zinc-300 text-[9px] font-mono px-1.5 py-0.5 rounded shadow whitespace-nowrap pointer-events-none select-none">
            Z: {depthMM} mm
          </div>
        </Html>
      </group>
    </group>
  );
};
