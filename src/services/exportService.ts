import * as THREE from 'three';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

export const exportToSTL = (scene: THREE.Object3D, filename: string = 'model.stl') => {
  const exporter = new STLExporter();
  const result = exporter.parse(scene, { binary: true });
  saveBlob(new Blob([result], { type: 'application/octet-stream' }), filename);
};

export const exportToOBJ = (scene: THREE.Object3D, filename: string = 'model.obj') => {
  const exporter = new OBJExporter();
  const result = exporter.parse(scene);
  saveBlob(new Blob([result], { type: 'text/plain' }), filename);
};

export const exportToGLB = async (scene: THREE.Object3D): Promise<Blob> => {
  return new Promise((resolve) => {
    const exporter = new GLTFExporter();
    exporter.parse(scene, (result) => {
      const blob = new Blob([result as ArrayBuffer], { type: 'model/gltf-binary' });
      resolve(blob);
    }, (error) => {
      console.error('GLTF Export Error:', error);
    }, { binary: true });
  });
};

const saveBlob = (blob: Blob, filename: string) => {
  const link = document.createElement('a');
  link.style.display = 'none';
  document.body.appendChild(link);
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  document.body.removeChild(link);
};
