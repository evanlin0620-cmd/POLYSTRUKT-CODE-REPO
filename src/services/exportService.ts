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
  const rawResult = exporter.parse(scene);
  const disclaimerHeader = [
    '# POLYSTRUKT PROCEDURAL CAD CORE - EXPORT ARTIFACT',
    '# MANDATORY LEGAL & ENGINEERING DISCLAIMER:',
    '# This geometry is algorithmically synthesized for conceptual prototyping only.',
    '# It is NOT certified for life-critical, aerospace, automotive, or structural load-bearing use.',
    '# Review and sign-off by a licensed Professional Engineer (PE) is required prior to fabrication.',
    '# Use is subject to Polystrukt Terms of Service and Engineering Liability Waivers.',
    ''
  ].join('\n');
  const finalResult = disclaimerHeader + rawResult;
  saveBlob(new Blob([finalResult], { type: 'text/plain' }), filename);
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

export const exportSessionParametersJSON = (
  sessionData: Record<string, any>,
  filenamePrefix: string = 'polystrukt_cad_params'
): string => {
  const enrichedData = {
    ...sessionData,
    legalComplianceNotice: {
      standard: "Polystrukt Engineering Safety & Liability Policy v2026.1",
      disclaimer: "AI-synthesized parametric geometry. Not certified by a licensed Professional Engineer (PE). Operator assumes all risk for physical fabrication, milling, or deployment.",
      termsOfService: "https://polystrukt.com/terms",
      privacyNotice: "Personal data processed in accordance with GDPR Art. 6/20 and CCPA/CPRA statutory requirements."
    }
  };
  const jsonString = JSON.stringify(enrichedData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const filename = `${filenamePrefix}_${Date.now()}.json`;
  saveBlob(blob, filename);
  return filename;
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
