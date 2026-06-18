import React, { useMemo, useEffect } from 'react';
import { ProceduralSpec } from '../types';
import { buildProceduralMesh } from '../lib/procedural-engine';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ProceduralModel({ spec, onMeshDiscovery }: { spec: ProceduralSpec, onMeshDiscovery?: (meshes: THREE.Mesh[]) => void }) {
  const object = useMemo(() => {
    try {
      const obj = buildProceduralMesh(spec);
      
      // Automatic Normalization for Procedural Models
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      
      // Target a specific size in the workspace (roughly 10 units)
      const targetSize = 10;
      const scale = targetSize / (maxDim || 1);
      obj.scale.setScalar(scale);
      
      // Center the object
      const center = new THREE.Vector3();
      box.getCenter(center);
      obj.position.sub(center.multiplyScalar(scale));
      
      return obj;
    } catch (err) {
      console.error("Procedural generation failed:", err);
      return new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 'red' }));
    }
  }, [spec]);

  useEffect(() => {
    if (onMeshDiscovery) {
      const meshes: THREE.Mesh[] = [];
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          meshes.push(child as THREE.Mesh);
        }
      });
      onMeshDiscovery(meshes);
    }
  }, [object, onMeshDiscovery]);

  return <primitive object={object} />;
}
