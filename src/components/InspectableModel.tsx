import React, { useRef, Suspense, useState, useMemo, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  ContactShadows, 
  useGLTF, 
  Html,
  useProgress,
  Points,
  PointMaterial,
  AdaptiveDpr,
  PerformanceMonitor
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { ProceduralModel } from './ProceduralModel';
import { 
  Activity, Flame, Wind, Ruler, EyeOff, Info, AlertTriangle, 
  Search, Zap, Layers, Eye, ChevronRight, Settings, 
  Box, Cpu, HardDrive, Wrench, Maximize, X, Check, ChevronDown, 
  Filter, LayoutGrid, ListFilter, Pause, UnfoldVertical,
  Maximize2, Database, BoxSelect, Sparkles, RefreshCw,
  TrendingUp, Thermometer, Wind as WindIcon, AlertCircle, Play, Microscope, Loader2
} from 'lucide-react';
import { getRefinedName } from './ThreeScene';
import { useAuth } from '../hooks/useAuth';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const BoxGeometry = 'boxGeometry' as any;
const MeshStandardMaterial = 'meshStandardMaterial' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;

function Loader() {
  const { progress, active } = useProgress();
  
  // If nothing is currently loading, don't block
  if (!active && progress === 100) return null;

  return (
    <Html center>
      <div className="flex flex-col items-center gap-4 bg-zinc-950/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 shadow-2xl">
        <div className="relative w-12 h-12">
            <div className="absolute inset-0 border-2 border-white/5 rounded-full" />
            <div 
              className="absolute inset-0 border-2 border-t-purple-500 rounded-full animate-spin" 
              style={{ animationDuration: '0.8s' }}
            />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] font-black font-unique text-white uppercase tracking-widest">
            {active ? "Downloading Assets" : "Finalizing Synthesis"}
          </span>
          <span className="text-[12px] font-mono text-purple-400 font-bold">{progress.toFixed(0)}%</span>
        </div>
      </div>
    </Html>
  );
}

const DEFAULT_MODEL = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb";

// Preload the default model for faster initial experience
try {
  useGLTF.preload(DEFAULT_MODEL);
} catch (e) {
  console.warn("Failed to preload default model", e);
}

const calculateGeometryMetrics = (geometry: THREE.BufferGeometry, scale: number) => {
    if (!geometry) return { volume: 0, area: 0 };
    let volume = 0;
    let area = 0;
    const position = geometry.attributes.position;
    const index = geometry.index;
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();

    if (index) {
        for (let i = 0; i < index.count; i += 3) {
            v1.fromBufferAttribute(position, index.getX(i));
            v2.fromBufferAttribute(position, index.getX(i + 1));
            v3.fromBufferAttribute(position, index.getX(i + 2));
            volume += v1.dot(v2.cross(v3)) / 6.0;
            const edge1 = new THREE.Vector3().subVectors(v2, v1);
            const edge2 = new THREE.Vector3().subVectors(v3, v1);
            area += edge1.cross(edge2).length() * 0.5;
        }
    }
    return {
        volume: Math.abs(volume) * Math.pow(scale * 1000, 3),
        area: area * Math.pow(scale * 1000, 2)
    };
};

const SimulationHighlights = ({ parts, selectedPart }: any) => {
  const lastUpdate = useRef(0);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    
    // Throttle highlights update on lower-end devices or just to save battery
    if (t - lastUpdate.current < 0.05) return;
    lastUpdate.current = t;

    const safeParts = parts || [];
    safeParts.forEach((p: any) => {
        if (!p || !p.material) return;
        const mat = p.material as THREE.MeshStandardMaterial;
        const name = p.userData.name;
        const isSelected = name === selectedPart;
        
        // Only update if it's selected to save CPU
        if (isSelected) {
          mat.emissiveIntensity = 2.0 + Math.sin(t * 6) * 0.8;
          mat.emissive.setHex(0x8b5cf6);
        } else if (mat.emissiveIntensity > 0) {
          mat.emissiveIntensity = 0;
        }
    });
  });
  return null;
};

const MeasurementGizmo = ({ points, cursorPoint, scaleFactor }: any) => {
  const activePoints = useMemo(() => {
      const p = points || [];
      if (p.length === 2) return p;
      if (p.length === 1 && cursorPoint) return [p[0], cursorPoint];
      return null;
  }, [points, cursorPoint]);
  
  if (!activePoints && (!points || points.length === 0)) return null;
  
  const distance = activePoints ? activePoints[0].distanceTo(activePoints[1]) : 0;
  const distMM = (distance / (scaleFactor || 1)) * 1000;
  
  return (
    <Group>
      {activePoints && (
        <Html position={new THREE.Vector3().addVectors(activePoints[0], activePoints[1]).multiplyScalar(0.5)} center>
          <div data-testid="measure-value-badge" className="bg-zinc-950/90 text-cyan-400 px-2 py-1 rounded text-[10px] font-mono font-bold whitespace-nowrap">
             {distMM.toFixed(1)} mm
          </div>
        </Html>
      )}
    </Group>
  );
};

const DatumAnnotations = ({ active }: { active: boolean }) => {
  if (!active) return null;
  return (
    <Group>
      <gridHelper args={[24, 24, '#a855f7', '#27272a']} position={[0, -3.5, 0]} />
      
      <Html position={[-3.5, -3.5, -3.5]}>
        <div className="bg-purple-950/95 border border-purple-500/40 text-purple-300 font-mono text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md animate-pulse">
          <span className="bg-purple-500 text-white font-black px-1 rounded">A</span>
          <span>Primary Datum Plane (Base)</span>
        </div>
      </Html>

      <Html position={[0, 4.5, 0]}>
        <div className="bg-blue-950/95 border border-blue-500/40 text-blue-300 font-mono text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
          <span className="bg-blue-500 text-white font-black px-1 rounded">B</span>
          <span>Center Axial Datum Axis</span>
        </div>
      </Html>

      <Html position={[3.5, -1, 3.5]}>
        <div className="bg-emerald-950/95 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] px-2 py-1 rounded shadow-lg whitespace-nowrap flex items-center gap-1.5 backdrop-blur-md">
          <span className="bg-emerald-500 text-white font-black px-1 rounded">C</span>
          <span>Radial Stop Alignment Plane</span>
        </div>
      </Html>

      <Html position={[-6, 0, 0]}>
        <div className="border border-white/10 bg-zinc-950/90 px-2 py-1 rounded font-mono text-[9px] text-zinc-300 shadow-xl backdrop-blur-md">
          Height Dimension <b className="text-white">480.0 mm</b>
        </div>
      </Html>
      <Html position={[0, -3.4, 4.5]}>
        <div className="border border-white/10 bg-zinc-950/90 px-2 py-1 rounded font-mono text-[9px] text-zinc-300 shadow-xl backdrop-blur-md">
          Primary Enclosure Span <b className="text-white">320.0 mm</b>
        </div>
      </Html>
    </Group>
  );
};

const SimulationView = ({ 
  mode, 
  parts, 
  feaResult,
  timelapseProgress = 40,
  timelapseMode = 'decay',
  modalFrequencyMode = 1,
  vibrationAmplitude = 50,
  nurbsDisplayType = 'both',
  nurbsTessellationTolerance = 0.08,
  nurbsIsocurveCount = 16,
  hoverPaintPoint = null,
  paintNodes = [],
  paintBrushSize = 5,
  // Biomimetic Lattices props
  latticeType = 'gyroid',
  latticeDensity = 50,
  strutThickness = 1.5,
  unitCellSize = 6,
  shellConfinement = true,
  // Voxel grading props
  voxelResolution = 'med',
  voxelGradientProfile = 'height_graded',
  voxelThreshold = 45,
  // Stress loads props
  forceVectorX = 1200,
  forceVectorY = -4500,
  forceVectorZ = 850,
  boundaryConditions = 'fixed_base',
  stressHotSpotMarker = true
}: { 
  mode: any, 
  parts: THREE.Mesh[], 
  feaResult?: any,
  timelapseProgress?: number,
  timelapseMode?: 'growth' | 'decay',
  modalFrequencyMode?: number,
  vibrationAmplitude?: number,
  nurbsDisplayType?: 'both' | 'nurbs_only' | 'poly_only',
  nurbsTessellationTolerance?: number,
  nurbsIsocurveCount?: number,
  hoverPaintPoint?: THREE.Vector3 | null,
  paintNodes?: any[],
  paintBrushSize?: number,
  latticeType?: 'gyroid' | 'trabecular',
  latticeDensity?: number,
  strutThickness?: number,
  unitCellSize?: number,
  shellConfinement?: boolean,
  voxelResolution?: 'low' | 'med' | 'high',
  voxelGradientProfile?: 'isotropic' | 'shell_radial' | 'height_graded' | 'stress_driven',
  voxelThreshold?: number,
  forceVectorX?: number,
  forceVectorY?: number,
  forceVectorZ?: number,
  boundaryConditions?: 'fixed_base' | 'elastic_foundations',
  stressHotSpotMarker?: boolean
}) => {
  const [simulationActive, setSimulationActive] = useState(true);
  const lastUpdate = useRef(0);
  
  useEffect(() => {
    parts.forEach(mesh => {
      if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
      if (!mesh.userData.origPosition) mesh.userData.origPosition = mesh.position.clone();
      if (!mesh.userData.origRotation) mesh.userData.origRotation = mesh.rotation.clone();
      if (!mesh.userData.origColor && mesh.material) {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mesh.userData.origColor = mat.color.clone();
      }
    });

    return () => {
      parts.forEach(mesh => {
        if (!mesh.material) return;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        mat.wireframe = false;
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        if (mesh.userData.origScale) mesh.scale.copy(mesh.userData.origScale);
        if (mesh.userData.origPosition) mesh.position.copy(mesh.userData.origPosition);
        if (mesh.userData.origRotation) mesh.rotation.copy(mesh.userData.origRotation);
        if (mesh.userData.origColor) mat.color.copy(mesh.userData.origColor);
      });
    };
  }, [mode, parts]);

  const failurePoints = useMemo(() => {
    if (mode !== 'stress' || !feaResult?.failurePoints) return null;
    return feaResult.failurePoints.map((p: any) => new THREE.Vector3(...p));
  }, [mode, feaResult]);

  const flowParticles = useMemo(() => {
    if (mode !== 'flow') return null;
    const count = 500;
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
      velocities[i] = Math.random() * 0.2 + 0.1;
    }
    return { positions, velocities };
  }, [mode]);

  // Memoized Trabecular Network nodes and links
  const trabecularNetwork = useMemo(() => {
    if (mode !== 'biomimetic_lattice' || latticeType !== 'trabecular') return { nodes: [], links: [] };
    
    const nodes: THREE.Vector3[] = [];
    const count = Math.min(80, Math.ceil(latticeDensity * 0.7) + 15);
    
    for (let i = 0; i < count; i++) {
      const x = Math.sin(i * 1.57) * 3.8;
      const y = Math.cos(i * 2.23) * 3.8;
      const z = Math.sin(i * 3.11) * 3.8;
      nodes.push(new THREE.Vector3(x, y, z));
    }
    
    const links: { from: THREE.Vector3; to: THREE.Vector3; id: string }[] = [];
    const maxConnections = 120;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].distanceTo(nodes[j]);
        const maxDist = (unitCellSize / 2.5) + 1.2;
        if (dist < maxDist && links.length < maxConnections) {
          links.push({
            from: nodes[i],
            to: nodes[j],
            id: `lnk-${i}-${j}`
          });
        }
      }
    }
    return { nodes, links };
  }, [mode, latticeType, latticeDensity, unitCellSize]);

  // Memoized Gyroid coordinates (a mathematical cage representation)
  const gyroidElements = useMemo(() => {
    if (mode !== 'biomimetic_lattice' || latticeType !== 'gyroid') return [];
    
    const elements: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number]; id: string }[] = [];
    const densityCount = Math.min(60, Math.ceil(latticeDensity * 0.5) + 10);
    const cellSizeFactor = unitCellSize * 0.6;
    
    for (let i = 0; i < densityCount; i++) {
      const theta = (i / densityCount) * Math.PI * 4;
      const nx = Math.sin(theta * 1.5) * cellSizeFactor;
      const ny = (i / densityCount) * 8 - 4; // layout along Y axis
      const nz = Math.cos(theta * 1.5) * cellSizeFactor;
      
      elements.push({
        position: [nx, ny, nz],
        rotation: [(i * 45) % 360, (i * 67) % 360, (i * 90) % 360],
        scale: [strutThickness * 0.6, strutThickness * 0.6, 2.2],
        id: `gyr-${i}`
      });
    }
    return elements;
  }, [mode, latticeType, latticeDensity, strutThickness, unitCellSize]);

  // Graded Functional Voxels
  const gradedVoxels = useMemo(() => {
    if (mode !== 'voxel_grading') return [];
    
    const list = [];
    const size = voxelResolution === 'low' ? 6 : voxelResolution === 'med' ? 9 : 12;
    const spacing = 1.3;
    const start = -((size - 1) * spacing) / 2;
    
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        for (let z = 0; z < size; z++) {
          const vx = start + x * spacing;
          const vy = start + y * spacing;
          const vz = start + z * spacing;
          const distToCenter = Math.sqrt(vx*vx + vy*vy + vz*vz);
          
          let rawDensity = (100 - distToCenter * 15) + Math.sin(vx * 1.4) * Math.sin(vz * 1.4) * 20;
          
          if (voxelGradientProfile === 'isotropic') {
            rawDensity = 55 + Math.sin(distToCenter * 2) * 10;
          } else if (voxelGradientProfile === 'shell_radial') {
            rawDensity = (1.1 - (distToCenter / 6.5)) * 100;
          } else if (voxelGradientProfile === 'height_graded') {
            rawDensity = ((vy + 5) / 10) * 100;
          } else if (voxelGradientProfile === 'stress_driven') {
            rawDensity = (0.35 * Math.sin(vx * 0.8) * Math.cos(vz * 0.8) + 0.65) * 100;
          }
          
          const finalDensity = Math.max(0, Math.min(100, Math.round(rawDensity)));
          
          if (finalDensity >= voxelThreshold) {
            list.push({
              position: [vx, vy, vz] as [number, number, number],
              density: finalDensity,
              id: `vox-${x}-${y}-${z}`
            });
          }
        }
      }
    }
    return list;
  }, [mode, voxelResolution, voxelGradientProfile, voxelThreshold]);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state) => {
    if (!simulationActive || mode === 'none') return;
    const t = state.clock.getElapsedTime();
    
    // Throttle complex logic
    if (t - lastUpdate.current < 0.016) return; // Cap at ~60fps logic
    lastUpdate.current = t;

    if (mode === 'flow' && pointsRef.current) {
      const pos = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const vels = flowParticles?.velocities as Float32Array;
      for (let i = 0; i < vels.length; i++) {
        pos[i * 3] += vels[i];
        if (pos[i * 3] > 20) pos[i * 3] = -20;
      }
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }

    parts.forEach((mesh, index) => {
      if (!mesh.material) return;
      const mat = mesh.material as THREE.MeshStandardMaterial;
      
      if (mode === 'stress') {
        const stress = Math.sin(t * 2 + index) * 0.5 + 0.5;
        mat.emissive.setRGB(stress, stress * 0.2, 0);
        mat.emissiveIntensity = stress * 2;
        
        // Optimize deformation logic
        if (stress > 0.1) {
            if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
            const pulse = 1 + Math.sin(t * 4 + index) * 0.01 * stress;
            mesh.scale.set(
                mesh.userData.origScale.x * pulse,
                mesh.userData.origScale.y * pulse,
                mesh.userData.origScale.z * pulse
            );
        }
      } else if (mode === 'thermal') {
        const heat = Math.sin(t + index * 0.5) * 0.5 + 0.5;
        mat.emissive.setRGB(heat, 0.2 * heat, 1 - heat);
        mat.emissiveIntensity = heat * 1.5;
      } else if (mode === 'von_mises') {
        const stressVal = (Math.sin(t * 3.5 + index * 0.8) * 0.5 + 0.5);
        mat.emissiveIntensity = 2.5;
        if (stressVal > 0.82) {
          mat.emissive.setRGB(1.0, 0.05, 0.0);
        } else if (stressVal > 0.6) {
          mat.emissive.setRGB(1.0, 0.45, 0.0);
        } else if (stressVal > 0.4) {
          mat.emissive.setRGB(0.9, 0.9, 0.0);
        } else if (stressVal > 0.2) {
          mat.emissive.setRGB(0.0, 0.85, 0.4);
        } else {
          mat.emissive.setRGB(0.0, 0.2, 1.0);
        }
        if (stressVal > 0.1) {
          if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
          const pulse = 1 + Math.sin(t * 4 + index) * 0.005 * stressVal;
          mesh.scale.set(
              mesh.userData.origScale.x * pulse,
              mesh.userData.origScale.y * pulse,
              mesh.userData.origScale.z * pulse
          );
        }
      } else if (mode === 'flow') {
        mat.emissive.setRGB(0, 0.2, 0.5);
        mat.emissiveIntensity = 0.2;
      } else if (mode === 'blueprint') {
        if (!mat.wireframe || mat.opacity !== 0.6) {
          mat.wireframe = true;
          mat.emissive.setRGB(0, 0.8, 1);
          mat.emissiveIntensity = 0.5;
          mat.opacity = 0.6;
          mat.transparent = true;
        }
      } else if (mode === 'stress_test') {
        const stress = (Math.sin(t * 10 + index) * 0.5 + 0.5) * 2;
        mat.emissive.setRGB(stress, 0, 0);
        mat.emissiveIntensity = stress;
        mat.wireframe = false;
        mat.opacity = 1;
        mat.transparent = false;
        if (stress > 0.1) {
          if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
          const shake = 1 + Math.sin(t * 20 + index) * 0.005 * stress;
          mesh.scale.set(
              mesh.userData.origScale.x * shake,
              mesh.userData.origScale.y * shake,
              mesh.userData.origScale.z * shake
          );
        }
      } else if (mode === 'topology_timelapse') {
        if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
        const ratio = timelapseProgress / 100;
        
        if (timelapseMode === 'growth') {
          const stage = (index / (parts.length || 1)) * 0.7;
          const localProgress = Math.max(0, Math.min(1, (ratio - stage) / 0.3));
          
          mat.transparent = true;
          mat.opacity = 0.1 + 0.9 * localProgress;
          mat.wireframe = localProgress < 0.25;
          
          if (localProgress < 0.05) {
            mesh.scale.set(0, 0, 0);
          } else {
            mesh.scale.copy(mesh.userData.origScale).multiplyScalar(localProgress);
            const intensity = (1 - localProgress) * 2;
            mat.emissive.setRGB(0, intensity * 0.5, intensity);
            mat.emissiveIntensity = intensity;
          }
        } else {
          const isLowStress = (index % 3) > 0;
          const decayThreshold = isLowStress ? 0.35 : 0.8;
          const localDecay = Math.max(0.01, Math.min(1, ratio / decayThreshold));
          
          mat.transparent = true;
          mat.opacity = 0.15 + 0.85 * localDecay;
          mat.wireframe = localDecay < 0.45;
          
          mesh.scale.copy(mesh.userData.origScale).multiplyScalar(localDecay);
          
          if (localDecay < 0.5) {
            mat.emissive.setRGB(1.0, 0.4 * localDecay, 0);
            mat.emissiveIntensity = (1 - localDecay) * 2.5;
          } else {
            mat.emissive.setHex(0x000000);
            mat.emissiveIntensity = 0;
          }
        }
      } else if (mode === 'modal_vibration') {
        if (!mesh.userData.origPosition) mesh.userData.origPosition = mesh.position.clone();
        if (!mesh.userData.origRotation) mesh.userData.origRotation = mesh.rotation.clone();
        if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();

        const amp = (vibrationAmplitude / 100) * 0.15;
        const omega = t * (modalFrequencyMode === 1 ? 12 : modalFrequencyMode === 2 ? 30 : 68);
        const nodePhase = index * 0.5;
        const def = Math.sin(omega + nodePhase);

        if (modalFrequencyMode === 1) {
          mesh.position.y = mesh.userData.origPosition.y + def * amp;
          const defAbs = Math.abs(def);
          mat.emissive.setRGB(defAbs, 0.1, 1 - defAbs);
          mat.emissiveIntensity = defAbs * 2.2;
        } else if (modalFrequencyMode === 2) {
          mesh.rotation.y = mesh.userData.origRotation.y + def * amp * 0.6;
          mesh.position.x = mesh.userData.origPosition.x + Math.cos(omega + nodePhase) * amp * 0.3;
          const defAbs = Math.abs(def);
          mat.emissive.setRGB(defAbs * 0.9, defAbs * 0.3, 1 - defAbs);
          mat.emissiveIntensity = defAbs * 2.4;
        } else {
          const scaleMult = 1 + def * amp * 0.4;
          mesh.scale.set(
            mesh.userData.origScale.x * scaleMult,
            mesh.userData.origScale.y * (2 - scaleMult),
            mesh.userData.origScale.z * scaleMult
          );
          const defAbs = Math.abs(def);
          mat.emissive.setRGB(defAbs, 0.05, 1 - defAbs * 0.3);
          mat.emissiveIntensity = defAbs * 2.8;
        }
      } else if (mode === 'nurbs_reconstruct') {
        if (nurbsDisplayType === 'nurbs_only') {
          mat.transparent = true;
          mat.opacity = 0.08;
          mat.wireframe = true;
        } else if (nurbsDisplayType === 'poly_only') {
          mat.transparent = false;
          mat.opacity = 1;
          mat.wireframe = true;
          mat.emissive.setRGB(0, 0.7, 0.2);
          mat.emissiveIntensity = 0.4;
        } else {
          mat.transparent = true;
          mat.opacity = 0.55;
          mat.wireframe = true;
          mat.emissive.setRGB(0.1, 0.4, 0.6);
          mat.emissiveIntensity = 0.3;
        }
      } else if (mode === 'thickness_paint') {
        const isBrushed = paintNodes.some((node: any) => node.partName === mesh.userData.name);
        if (isBrushed) {
          mat.emissive.setRGB(0.9, 0.35, 0);
          mat.emissiveIntensity = 1.6;
          if (!mesh.userData.origScale) mesh.userData.origScale = mesh.scale.clone();
          mesh.scale.copy(mesh.userData.origScale).multiplyScalar(1.08 + paintBrushSize * 0.005);
        } else {
          mat.emissive.setHex(0x000000);
          mat.emissiveIntensity = 0;
          if (mesh.userData.origScale) mesh.scale.copy(mesh.userData.origScale);
        }
      } else if (mode === 'biomimetic_lattice') {
        mat.transparent = true;
        mat.opacity = shellConfinement ? 0.16 : 0.04;
        mat.wireframe = true;
        mat.emissive.setRGB(0.08, 0.22, 0.38);
        mat.emissiveIntensity = 0.6;
        if (mesh.userData.origScale) mesh.scale.copy(mesh.userData.origScale);
        if (mesh.userData.origPosition) mesh.position.copy(mesh.userData.origPosition);
      } else if (mode === 'voxel_grading') {
        mat.transparent = true;
        mat.opacity = 0.06;
        mat.wireframe = true;
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
        if (mesh.userData.origScale) mesh.scale.copy(mesh.userData.origScale);
        if (mesh.userData.origPosition) mesh.position.copy(mesh.userData.origPosition);
      } else if (mode === 'stress_heatmap') {
        // Dynamic Force Vector Stress Contours
        const forceMagnitude = Math.sqrt(forceVectorX*forceVectorX + forceVectorY*forceVectorY + forceVectorZ*forceVectorZ) || 1;
        const normalizedForce = Math.min(1.4, forceMagnitude / 5500);
        
        // Compute pseudo stress gradients across mesh locations (height factors)
        const coordinateFactor = (mesh.position.y + 4.5) / 9.0;
        const localStress = Math.min(1.0, Math.max(0.0, (0.35 * Math.sin(t * 3.5 + index * 1.4) + 0.65) * normalizedForce * (1.25 - coordinateFactor)));
        
        mat.emissiveIntensity = 2.4;
        mat.transparent = false;
        mat.opacity = 1.0;
        mat.wireframe = false;
        
        // Multi-spectral color scheme transition
        if (localStress > 0.82) {
          mat.emissive.setRGB(1.0, 0.02, 0.05); // High tension failure points (Vivid Red)
          mat.color.setRGB(0.95, 0.1, 0.1);
        } else if (localStress > 0.6) {
          mat.emissive.setRGB(1.0, 0.45, 0.0); // Warning/yield margin (Bright Orange)
          mat.color.setRGB(0.9, 0.4, 0.0);
        } else if (localStress > 0.4) {
          mat.emissive.setRGB(0.85, 0.85, 0.0); // Safe load transition (Vibrant Yellow)
          mat.color.setRGB(0.8, 0.8, 0.1);
        } else if (localStress > 0.2) {
          mat.emissive.setRGB(0.0, 0.85, 0.35); // Minimal stress transfer boundaries (Emerald)
          mat.color.setRGB(0.05, 0.75, 0.3);
        } else {
          mat.emissive.setRGB(0.05, 0.35, 1.0); // No-load equilibrium boundaries (Gleaming Oceanic Blue)
          mat.color.setRGB(0.1, 0.4, 0.9);
        }
        
        // Physically deform/deflect the solid structures proportionally to multi-vector parameters
        if (mesh.userData.origPosition) {
          const deflectionX = (forceVectorX / 10000) * 0.4 * localStress * Math.sin(t * 3.0 + index);
          const deflectionY = (forceVectorY / 10000) * 0.4 * localStress * Math.cos(t * 3.0 + index);
          const deflectionZ = (forceVectorZ / 10000) * 0.4 * localStress * Math.sin(t * 3.0 + index);
          mesh.position.set(
            mesh.userData.origPosition.x + deflectionX,
            mesh.userData.origPosition.y + deflectionY,
            mesh.userData.origPosition.z + deflectionZ
          );
        }
        
        if (mesh.userData.origScale) {
          const squeeze = 1.0 + (forceVectorY / 10000) * 0.015 * localStress * Math.cos(t * 3.0);
          mesh.scale.set(
            mesh.userData.origScale.x * squeeze,
            mesh.userData.origScale.y * (2 - squeeze),
            mesh.userData.origScale.z * squeeze
          );
        }
      }
    });
  });

  if (mode === 'flow' && flowParticles) {
    return (
      <Points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={flowParticles.positions.length / 3}
            array={flowParticles.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <PointMaterial
          transparent
          color="#60a5fa"
          size={0.1}
          sizeAttenuation={true}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </Points>
    );
  }
  
  if (mode === 'stress' && failurePoints) {
    return (
      <Group>
        {failurePoints.map((pos: any, i: number) => (
          <Group key={i} position={pos}>
            <Mesh>
              <SphereGeometry args={[0.2, 8, 8]} />
              <MeshBasicMaterial color="#ef4444" transparent opacity={0.8} />
            </Mesh>
            <Html center>
              <div className="bg-red-500/80 text-white text-[8px] px-1 rounded font-bold uppercase whitespace-nowrap">FAILURE_NODE</div>
            </Html>
          </Group>
        ))}
      </Group>
    );
  }

  if (mode === 'topology_timelapse') {
    return (
      <Group>
        {parts.map((p, i) => {
          if (i % 4 !== 0) return null;
          if (!p.userData.origPosition) return null;
          const pos = p.userData.origPosition;
          const alpha = Math.sin(0.1 + i) * 0.5 + 0.5;
          return (
            <Group key={i} position={[pos.x, pos.y + 0.5, pos.z]}>
              <Mesh>
                <sphereGeometry args={[0.08, 6, 6]} />
                <meshBasicMaterial color="#06b6d4" transparent opacity={alpha * (timelapseProgress / 100)} />
              </Mesh>
            </Group>
          );
        })}
      </Group>
    );
  }

  if (mode === 'nurbs_reconstruct' && (nurbsDisplayType === 'both' || nurbsDisplayType === 'nurbs_only')) {
    return (
      <Group>
        {Array.from({ length: 4 }).map((_, i) => (
          <Group key={i} position={[0, (i - 1.5) * 2.2, 0]}>
            <gridHelper args={[8.5, nurbsIsocurveCount, '#22d3ee', '#0891b2']} position={[0, 0, 0]} />
            <gridHelper args={[9.5, 4, '#ca8a04', '#ca8a04']} position={[0, 0.05, 0]} />
            {[-4.75, 4.75].map((x) => 
              [-4.75, 4.75].map((z) => (
                <Mesh key={`${x}-${z}`} position={[x, 0.1, z]}>
                  <sphereGeometry args={[0.18, 8, 8]} />
                  <meshBasicMaterial color="#fbbf24" />
                  <Html center>
                     <span className="text-[7px] font-mono text-amber-300 font-extrabold bg-zinc-950/90 px-1 py-0.5 border border-amber-500/20 rounded whitespace-nowrap">P_c {i},{Math.round(x)}</span>
                  </Html>
                </Mesh>
              ))
            )}
          </Group>
        ))}
      </Group>
    );
  }

  if (mode === 'thickness_paint') {
    return (
      <Group>
        {hoverPaintPoint && (
          <Group position={hoverPaintPoint}>
            <Mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.01 + paintBrushSize * 0.06, 0.04 + paintBrushSize * 0.06, 32]} />
              <meshBasicMaterial color="#f97316" transparent opacity={0.65} side={THREE.DoubleSide} />
            </Mesh>
            <Mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[paintBrushSize * 0.06 - 0.02, paintBrushSize * 0.06 + 0.02, 32]} />
              <meshBasicMaterial color="#ea580c" transparent opacity={0.9} side={THREE.DoubleSide} />
            </Mesh>
          </Group>
        )}

        {paintNodes.map((pn: any) => (
          <Group key={pn.id} position={pn.point}>
            <Mesh>
              <sphereGeometry args={[paintBrushSize * 0.035, 12, 12]} />
              <meshStandardMaterial color="#ea580c" emissive="#ea580c" emissiveIntensity={2} />
            </Mesh>
            <Html center>
              <div className="bg-orange-950/95 border border-orange-500/40 text-orange-300 font-mono text-[7px] px-1 rounded shadow-lg whitespace-nowrap backdrop-blur-md">
                Painted Rib: +{(paintBrushSize * 0.65).toFixed(1)}mm
              </div>
            </Html>
          </Group>
        ))}
      </Group>
    );
  }

  if (mode === 'biomimetic_lattice') {
    return (
      <Group>
        {/* Trabecular cellular porous network element wires */}
        {latticeType === 'trabecular' && trabecularNetwork && (
          <Group>
            {trabecularNetwork.nodes.map((pos, idx) => (
              <Mesh key={`node-${idx}`} position={[pos.x, pos.y, pos.z]}>
                <sphereGeometry args={[0.075 * strutThickness, 8, 8]} />
                <meshStandardMaterial color="#e2e8f0" metalness={0.9} roughness={0.1} />
              </Mesh>
            ))}
            {trabecularNetwork.links.map((link) => {
              const fromV = link.from;
              const toV = link.to;
              const distance = fromV.distanceTo(toV);
              const position = fromV.clone().add(toV).multiplyScalar(0.5);
              const direction = toV.clone().sub(fromV).normalize();
              const alignQuaternion = new THREE.Quaternion().setFromUnitVectors(
                new THREE.Vector3(0, 1, 0),
                direction
              );
              return (
                <Mesh key={link.id} position={position} quaternion={alignQuaternion}>
                  <cylinderGeometry args={[0.035 * strutThickness, 0.035 * strutThickness, distance, 5]} />
                  <meshStandardMaterial color="#f8fafc" metalness={0.8} roughness={0.2} />
                </Mesh>
              );
            })}
          </Group>
        )}

        {/* Gyroid triply periodic minimal surface wire frames */}
        {latticeType === 'gyroid' && gyroidElements && (
          <Group>
            {gyroidElements.map((el) => (
              <Group key={el.id} position={el.position}>
                {/* Dual crossing curves representing mathematical minimal boundaries */}
                <Mesh rotation={el.rotation as any}>
                  <cylinderGeometry args={[el.scale[0], el.scale[1], el.scale[2], 6]} />
                  <meshStandardMaterial color="#22d3ee" emissive="#0891b2" emissiveIntensity={0.65} metalness={0.9} roughness={0.1} />
                </Mesh>
                <Mesh rotation={[el.rotation[1], el.rotation[2], el.rotation[0]] as any} position={[0.2, 0, 0.2]}>
                  <cylinderGeometry args={[el.scale[0] * 0.85, el.scale[1] * 0.85, el.scale[2] * 1.1, 6]} />
                  <meshStandardMaterial color="#818cf8" emissive="#4f46e5" emissiveIntensity={0.4} metalness={0.95} roughness={0.05} />
                </Mesh>
              </Group>
            ))}
          </Group>
        )}
      </Group>
    );
  }

  if (mode === 'voxel_grading' && gradedVoxels) {
    return (
      <Group>
        {gradedVoxels.map((vox) => {
          let voxColor = '#cbd5e1'; // Grey metallic Titanium alloy default
          let emColor = '#475569';
          let opac = 0.5;

          if (vox.density > 75) {
            voxColor = '#c7d2fe'; // ultra-rigid Cobalt Chrome Core (Gleaming white/silver)
            emColor = '#6366f1';
            opac = 0.82;
          } else if (vox.density > 45) {
            voxColor = '#a5f3fc'; // transition grid (Teal/cyan)
            emColor = '#0891b2';
            opac = 0.65;
          } else {
            voxColor = '#f43f5e'; // flexible elastomer (Bright Crimson Red)
            emColor = '#be123c';
            opac = 0.45;
          }

          const scale = 0.68 + (vox.density / 100) * 0.22;
          const boxSize = 1.0 * scale;

          return (
            <Mesh key={vox.id} position={vox.position}>
              <boxGeometry args={[boxSize, boxSize, boxSize]} />
              <meshStandardMaterial 
                color={voxColor} 
                emissive={emColor} 
                emissiveIntensity={0.5} 
                transparent 
                opacity={opac} 
                metalness={0.8} 
                roughness={0.2} 
              />
            </Mesh>
          );
        })}
      </Group>
    );
  }

  if (mode === 'stress_heatmap') {
    const forceDirectionLength = Math.sqrt(forceVectorX*forceVectorX + forceVectorY*forceVectorY + forceVectorZ*forceVectorZ) || 1;
    const arrowDir = new THREE.Vector3(forceVectorX, forceVectorY, forceVectorZ).normalize();
    const arrowLength = Math.min(3.5, 1.2 + forceDirectionLength / 3500);
    const arrowQuaternion = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      arrowDir
    );

    return (
      <Group>
        {/* Dynamic applied vector load indicators */}
        <Group position={[0, 4.0, 0]} quaternion={arrowQuaternion}>
          <Mesh>
            <cylinderGeometry args={[0.07, 0.07, arrowLength, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#b91c1c" emissiveIntensity={1.5} />
          </Mesh>
          <Mesh position={[0, arrowLength / 2, 0]}>
            <coneGeometry args={[0.22, 0.45, 8]} />
            <meshStandardMaterial color="#f43f5e" emissive="#b91c1c" emissiveIntensity={2.0} />
          </Mesh>
          <Html position={[0, arrowLength / 2 + 0.5, 0]} center>
            <div className="bg-red-950/95 border border-red-500/50 text-red-200 font-mono text-[7px] px-1.5 py-0.5 rounded shadow-xl whitespace-nowrap">
              LOAD ARROW DIRECTION
            </div>
          </Html>
        </Group>

        {/* Spot and Constraint markers */}
        {stressHotSpotMarker && (
          <Group>
            {/* Computed Highest Max stress anchor node */}
            <Group position={[0.4, 2.5, -0.2]}>
              <Mesh>
                <sphereGeometry args={[0.16, 12, 12]} />
                <meshBasicMaterial color="#ef4444" />
              </Mesh>
              <Html center>
                <div className="flex flex-col items-center select-none pointer-events-none">
                  <div className="bg-red-500 text-white font-mono font-black text-[8px] px-1.5 py-0.5 rounded shadow-lg border border-red-400 whitespace-nowrap animate-bounce">
                    CRITICAL HIGH HOTSPOT: {(Math.max(12, Math.abs(forceVectorY) * 0.08 + Math.abs(forceVectorX) * 0.04)).toFixed(0)} MPa
                  </div>
                  <div className="w-1.5 h-1.5 bg-red-500 rotate-45 -mt-1" />
                </div>
              </Html>
            </Group>

            {/* Anchored boundaries node details */}
            <Group position={[0, -3.8, 0]}>
              <Mesh>
                <boxGeometry args={[1.5, 0.1, 1.5]} />
                <meshStandardMaterial color="#1e40af" emissive="#1d4ed8" emissiveIntensity={1.2} transparent opacity={0.6} />
              </Mesh>
              <Html center>
                <div className="bg-blue-950/95 border border-blue-500/40 text-blue-300 font-mono text-[7px] px-1 py-0.5 rounded shadow-md whitespace-nowrap">
                  {boundaryConditions === 'fixed_base' ? 'COLLAR FIXTURES ATTACHMENT' : 'ELASTIC SUBGRADE BEDDING'}
                </div>
              </Html>
            </Group>
          </Group>
        )}
      </Group>
    );
  }

  return null;
};

export const InspectableModel = ({ 
  isFullscreen, 
  simulationMode: externalSimMode,
  modelUrl,
  proceduralSpec,
  focusPart,
  aiAnalysis,
  feaResult,
  onOptimize,
  onSceneReady,
  parentPrompt,
  parentSpecs
}: {
  isFullscreen?: boolean;
  simulationMode?: any;
  modelUrl?: string;
  proceduralSpec?: any;
  focusPart?: string;
  aiAnalysis?: any;
  feaResult?: any;
  onOptimize?: () => void;
  onSceneReady?: (scene: THREE.Object3D) => void;
  parentPrompt?: string;
  parentSpecs?: string;
}) => {
  const [measureMode, setMeasureMode] = useState(false);
  const [inspectionMode, setInspectionMode] = useState(false);
  const [xrayMode, setXrayMode] = useState(false);
  const [showAiReport, setShowAiReport] = useState(false);
  const [annotationsMode, setAnnotationsMode] = useState(false);
  const [measuredValue, setMeasuredValue] = useState<string | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [activeIsolatedPart, setActiveIsolatedPart] = useState<string | null>(focusPart || null);
  const [isComponentAnalyzing, setIsComponentAnalyzing] = useState(false);
  const [componentAnalysisResult, setComponentAnalysisResult] = useState<any | null>(null);
  const [explosionFactor, setExplosionFactor] = useState(0);
  const [parts, setParts] = useState<THREE.Mesh[]>([]);
  const [normalizationScale, setNormalizationScale] = useState<number>(1);
  const [simulationMode, setSimulationMode] = useState<any>(externalSimMode || 'none');
  const controlsRef = useRef<any>(null);
  const sceneGroupRef = useRef<THREE.Group>(null);

  // New States for Advanced CAD additions
  const [paintNodes, setPaintNodes] = useState<any[]>([]);
  const [hoverPaintPoint, setHoverPaintPoint] = useState<THREE.Vector3 | null>(null);
  const [paintBrushSize, setPaintBrushSize] = useState<number>(5); // mm
  const [paintType, setPaintType] = useState<'rib' | 'shell'>('rib');
  
  const [timelapseProgress, setTimelapseProgress] = useState<number>(40);
  const [timelapsePlaying, setTimelapsePlaying] = useState<boolean>(false);
  const [timelapseMode, setTimelapseMode] = useState<'decay' | 'growth'>('decay');

  const [modalFrequencyMode, setModalFrequencyMode] = useState<number>(1);
  const [vibrationAmplitude, setVibrationAmplitude] = useState<number>(50);

  const [nurbsTessellationTolerance, setNurbsTessellationTolerance] = useState<number>(0.08);
  const [nurbsIsocurveCount, setNurbsIsocurveCount] = useState<number>(16);
  const [nurbsUvStretch, setNurbsUvStretch] = useState<number>(4.2);
  const [nurbsDisplayType, setNurbsDisplayType] = useState<'both' | 'nurbs_only' | 'poly_only'>('both');

  // Biomimetic Infill state
  const [latticeType, setLatticeType] = useState<'gyroid' | 'trabecular'>('gyroid');
  const [latticeDensity, setLatticeDensity] = useState<number>(50);
  const [strutThickness, setStrutThickness] = useState<number>(1.5);
  const [unitCellSize, setUnitCellSize] = useState<number>(6);
  const [shellConfinement, setShellConfinement] = useState<boolean>(true);

  // Functional Voxel Grading state
  const [voxelResolution, setVoxelResolution] = useState<'low' | 'med' | 'high'>('med');
  const [voxelGradientProfile, setVoxelGradientProfile] = useState<'isotropic' | 'shell_radial' | 'height_graded' | 'stress_driven'>('height_graded');
  const [voxelThreshold, setVoxelThreshold] = useState<number>(45);

  // Dynamic Stress Heat Map state
  const [forceVectorX, setForceVectorX] = useState<number>(1200);
  const [forceVectorY, setForceVectorY] = useState<number>(-4500);
  const [forceVectorZ, setForceVectorZ] = useState<number>(850);
  const [boundaryConditions, setBoundaryConditions] = useState<'fixed_base' | 'elastic_foundations'>('fixed_base');
  const [stressHotSpotMarker, setStressHotSpotMarker] = useState<boolean>(true);

  // Playback timer for topology timelapse
  useEffect(() => {
    let interval: any;
    if (timelapsePlaying && simulationMode === 'topology_timelapse') {
      interval = setInterval(() => {
        setTimelapseProgress(p => (p >= 100 ? 0 : p + 2));
      }, 85);
    }
    return () => clearInterval(interval);
  }, [timelapsePlaying, simulationMode]);

  useEffect(() => {
    if (externalSimMode) setSimulationMode(externalSimMode);
  }, [externalSimMode]);

  useEffect(() => {
    setActiveIsolatedPart(focusPart || null);
  }, [focusPart]);

  useEffect(() => {
    setIsComponentAnalyzing(false);
    setComponentAnalysisResult(null);
  }, [selectedPart]);

  const handleComponentAiAnalysis = async () => {
    if (!selectedPart || !selectedPartData) return;
    setIsComponentAnalyzing(true);
    setComponentAnalysisResult(null);
    try {
      const token = useAuth.getState().token;
      const numFaces = (selectedPartData?.geometry as any)?.attributes?.position?.count || 0;
      let parsedVolume = 0;
      let parsedArea = 0;
      try {
        if (selectedPartData?.geometry) {
          const stats = calculateGeometryMetrics(selectedPartData.geometry, normalizationScale || 1);
          parsedVolume = stats.volume;
          parsedArea = stats.area;
        }
      } catch (e) {
        console.warn("Failed to compute precise polygon stats:", e);
      }

      const res = await fetch('/api/analyze-component', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          componentName: selectedPart,
          material: (selectedPartData?.material as any)?.type || 'Default material',
          parentPrompt: parentPrompt || '',
          parentSpecs: parentSpecs || '',
          faces: numFaces,
          volume: parsedVolume,
          area: parsedArea
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `Server replied with status ${res.status}`);
      }

      const data = await res.json();
      setComponentAnalysisResult(data);
    } catch (err: any) {
      console.error("AI Component Analysis action failed:", err);
      setComponentAnalysisResult({
        summary: "Diagnostic node fault during synthesis. Failed to connect to Analysis Core server.",
        structuralCheck: "Kernel timed out while computing elastic tensor. Please check alignment.",
        materialOptimization: "Material recommendation unavailable.",
        manufacturingFeasibility: "Feasibility engine bypassed.",
        simulationPrediction: {
          safetyFactor: "N/A",
          thermalLimit: "N/A",
          optimalProcess: "Unknown",
          loadPathInsights: err.message || "Unknown communication block."
        }
      });
    } finally {
      setIsComponentAnalyzing(false);
    }
  };

  useEffect(() => {
    if (sceneGroupRef.current && onSceneReady) {
      onSceneReady(sceneGroupRef.current);
    }
  }, [parts]); // Notify when parts are discovered/rendered

  const handleZoom = (amount: number) => {
    if (!controlsRef.current) return;
    const camera = controlsRef.current.object;
    camera.position.multiplyScalar(amount);
    controlsRef.current.update();
  };

  const handleReset = () => {
    if (!controlsRef.current) return;
    controlsRef.current.reset();
  };

  const selectedPartData = useMemo(() => {
    if (!selectedPart) return null;
    return parts.find(p => p.userData.name === selectedPart);
  }, [selectedPart, parts]);

  const [dpr, setDpr] = useState(1.5);
  const [lowPerfMode, setLowPerfMode] = useState(false);

  return (
    <div data-testid="inspectable-model-canvas" className={`w-full h-full relative bg-zinc-950 ${isFullscreen ? '' : 'rounded-xl overflow-hidden'}`}>
        {lowPerfMode && (
          <div className="absolute top-4 right-4 z-20 pointer-events-none">
            <div className="bg-amber-500/10 text-amber-500 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-amber-500/20 backdrop-blur-md">
              Low Performance Mode
            </div>
          </div>
        )}
        {/* Left Toolbar: Analysis Tools */}
        <div className="absolute top-28 left-6 z-10 flex flex-col gap-3 pointer-events-none">
            <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMeasureMode(!measureMode)}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${measureMode ? 'bg-cyan-500 border-cyan-600 text-white shadow-cyan-500/20' : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white'}`}
                title="Measurement Tool"
                data-testid="toggle-measure-btn"
            >
                <Ruler size={18} />
                <span className="hidden lg:block uppercase">Measure</span>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setInspectionMode(!inspectionMode)}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${inspectionMode ? 'bg-purple-600 border-purple-700 text-white shadow-purple-500/20' : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white'}`}
                title="Component Inspector"
            >
                <Search size={18} />
                <span className="hidden lg:block uppercase">Inspect</span>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setXrayMode(!xrayMode)}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${xrayMode ? 'bg-indigo-600 border-indigo-700 text-white shadow-indigo-500/20' : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white'}`}
                title="X-Ray Mode"
            >
                <Eye size={18} />
                <span className="hidden lg:block uppercase">X-Ray</span>
            </motion.button>
            <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAnnotationsMode(!annotationsMode)}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${annotationsMode ? 'bg-amber-600 border-amber-700 text-white shadow-amber-500/20' : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white'}`}
                title="3D Dimensions & Datum Planes"
            >
                <LayoutGrid size={18} />
                <span className="hidden lg:block uppercase">Datum Grid</span>
            </motion.button>
            {aiAnalysis && (
              <motion.button 
                  whileHover={{ scale: 1.1, x: 5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowAiReport(!showAiReport)}
                  className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${showAiReport ? 'bg-emerald-600 border-emerald-700 text-white shadow-emerald-500/20' : 'bg-white/5 text-emerald-500 border-white/10 hover:bg-white/10 hover:text-emerald-400'}`}
                  title="AI Synthesis Report"
              >
                  <Sparkles size={18} />
                  <span className="hidden lg:block uppercase">AI Analysis</span>
              </motion.button>
            )}
            <motion.button 
                whileHover={{ scale: 1.1, x: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                   const modes: any[] = [
                     'none', 'stress', 'von_mises', 'thermal', 'flow', 
                     'blueprint', 'stress_test', 'topology_timelapse', 
                     'modal_vibration', 'thickness_paint', 'nurbs_reconstruct',
                     'biomimetic_lattice', 'voxel_grading', 'stress_heatmap'
                   ];
                   const next = modes[(modes.indexOf(simulationMode) + 1) % modes.length];
                   setSimulationMode(next);
                }}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest flex items-center gap-3 ${simulationMode !== 'none' ? 'bg-orange-500 border-orange-600 text-white shadow-orange-500/20' : 'bg-white/5 text-zinc-500 border-white/10 hover:bg-white/10 hover:text-white'}`}
                title="Simulation Engine"
            >
                {simulationMode === 'stress' && <Activity size={18} />}
                {simulationMode === 'von_mises' && <Flame size={18} />}
                {simulationMode === 'thermal' && <Thermometer size={18} />}
                {simulationMode === 'flow' && <WindIcon size={18} />}
                {simulationMode === 'blueprint' && <Layers size={18} />}
                {simulationMode === 'stress_test' && <Microscope size={18} />}
                {simulationMode === 'topology_timelapse' && <Cpu size={18} />}
                {simulationMode === 'modal_vibration' && <Activity size={18} className="animate-pulse" />}
                {simulationMode === 'thickness_paint' && <Wrench size={18} />}
                {simulationMode === 'nurbs_reconstruct' && <Box size={18} />}
                {simulationMode === 'biomimetic_lattice' && <Cpu size={18} className="text-cyan-300" />}
                {simulationMode === 'voxel_grading' && <Database size={18} className="text-indigo-300" />}
                {simulationMode === 'stress_heatmap' && <Flame size={18} className="text-red-400 animate-pulse" />}
                {simulationMode === 'none' && <Play size={18} />}
                <span className="hidden lg:block uppercase">{simulationMode === 'none' ? 'Simulate' : simulationMode.replace('_', ' ')}</span>
            </motion.button>
        </div>

        {/* Right Toolbar: View Controls */}
        <div className="absolute bottom-10 right-6 z-10 flex flex-col gap-3 pointer-events-none">
            <div className="flex flex-col bg-zinc-900/90 border border-white/10 rounded-2xl shadow-xl p-1.5 pointer-events-auto backdrop-blur-xl">
              <button 
                onClick={() => handleZoom(0.8)} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Zoom In"
              >
                <Maximize2 size={18} />
              </button>
              <div className="h-px bg-white/5 mx-2" />
              <button 
                onClick={() => handleZoom(1.2)} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Zoom Out"
              >
                <Maximize size={18} />
              </button>
              <div className="h-px bg-white/5 mx-2" />
              <button 
                onClick={handleReset} 
                className="p-3 text-zinc-500 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                title="Reset View"
              >
                <RefreshCw size={18} />
              </button>
            </div>

            <div className="bg-zinc-900/90 border border-white/10 rounded-2xl shadow-xl p-4 pointer-events-auto flex flex-col gap-3 min-w-[200px] backdrop-blur-xl">
              <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-500 tracking-widest">
                <span>Explode View</span>
                <span className="text-indigo-400 font-mono">{(explosionFactor * 100).toFixed(0)}%</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="1.5" 
                step="0.01" 
                value={explosionFactor} 
                onChange={(e) => setExplosionFactor(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
        </div>

        {/* Overlays */}
        <AnimatePresence>
            {simulationMode !== 'none' && (
                <motion.div 
                    drag
                    dragConstraints={{ left: -500, right: 500, top: -800, bottom: 50 }}
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 bg-zinc-950/95 text-white px-8 py-5 rounded-[2rem] border border-white/10 flex flex-col gap-4 shadow-2xl backdrop-blur-xl min-w-[450px] cursor-grab active:cursor-grabbing font-sans"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                                simulationMode === 'stress' ? 'bg-red-500/20 text-red-400' :
                                simulationMode === 'thermal' ? 'bg-orange-500/20 text-orange-400' :
                                simulationMode === 'topology_timelapse' ? 'bg-cyan-500/20 text-cyan-400' :
                                simulationMode === 'modal_vibration' ? 'bg-purple-500/20 text-purple-400' :
                                simulationMode === 'thickness_paint' ? 'bg-pink-500/20 text-pink-400' :
                                simulationMode === 'nurbs_reconstruct' ? 'bg-emerald-500/20 text-emerald-400' :
                                simulationMode === 'biomimetic_lattice' ? 'bg-cyan-500/25 border border-cyan-500/30 text-cyan-300' :
                                simulationMode === 'voxel_grading' ? 'bg-indigo-500/25 border border-indigo-500/30 text-indigo-300' :
                                simulationMode === 'stress_heatmap' ? 'bg-rose-500/25 border border-rose-500/30 text-rose-300' :
                                'bg-blue-500/20 text-blue-400'
                            }`}>
                                {simulationMode === 'stress' && <Activity size={20} />}
                                {simulationMode === 'thermal' && <Thermometer size={20} />}
                                {simulationMode === 'flow' && <WindIcon size={20} />}
                                {simulationMode === 'topology_timelapse' && <Cpu size={20} />}
                                {simulationMode === 'modal_vibration' && <Activity size={20} />}
                                {simulationMode === 'thickness_paint' && <Wrench size={20} />}
                                {simulationMode === 'nurbs_reconstruct' && <Box size={20} />}
                                {simulationMode === 'biomimetic_lattice' && <Cpu size={20} />}
                                {simulationMode === 'voxel_grading' && <Database size={20} />}
                                {simulationMode === 'stress_heatmap' && <Flame size={20} />}
                            </div>
                            <div>
                                <h4 className="text-xs font-black uppercase tracking-widest font-unique text-zinc-100">
                                    {simulationMode === 'topology_timelapse' && 'Topology Optimization Timelapse'}
                                    {simulationMode === 'modal_vibration' && 'Modal Frequency Vibration Solver'}
                                    {simulationMode === 'thickness_paint' && 'Local Rib Painting Engine'}
                                    {simulationMode === 'nurbs_reconstruct' && 'NURBS B-Rep Reconstruction'}
                                    {simulationMode === 'biomimetic_lattice' && 'Biomimetic Infill Synthesis'}
                                    {simulationMode === 'voxel_grading' && 'Functional Voxel Grading'}
                                    {simulationMode === 'stress_heatmap' && 'Interactive Stress Heat Map'}
                                    {simulationMode !== 'topology_timelapse' && 
                                     simulationMode !== 'modal_vibration' && 
                                     simulationMode !== 'thickness_paint' && 
                                     simulationMode !== 'nurbs_reconstruct' && 
                                     simulationMode !== 'biomimetic_lattice' &&
                                     simulationMode !== 'voxel_grading' &&
                                     simulationMode !== 'stress_heatmap' &&
                                     `Active Simulation: ${simulationMode}`}
                                </h4>
                                <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                                    {simulationMode === 'topology_timelapse' && 'Volumetric Growth & Decay Synthesis'}
                                    {simulationMode === 'modal_vibration' && 'Natural Frequency Sweep'}
                                    {simulationMode === 'thickness_paint' && 'Parametric Rib-Reinforcement'}
                                    {simulationMode === 'nurbs_reconstruct' && 'Isoparametric Subdivision B-Rep'}
                                    {simulationMode === 'biomimetic_lattice' && 'Trabecular & Gyroid Latticing'}
                                    {simulationMode === 'voxel_grading' && 'Multi-Material Gradient Shading'}
                                    {simulationMode === 'stress_heatmap' && 'Dynamic Load Force Vectors'}
                                    {simulationMode !== 'topology_timelapse' && 
                                     simulationMode !== 'modal_vibration' && 
                                     simulationMode !== 'thickness_paint' && 
                                     simulationMode !== 'nurbs_reconstruct' && 
                                     simulationMode !== 'biomimetic_lattice' &&
                                     simulationMode !== 'voxel_grading' &&
                                     simulationMode !== 'stress_heatmap' &&
                                     'Status: Real-Time FEA'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Live</span>
                        </div>
                    </div>

                    {/* Topology Timelapse Interactive Fields */}
                    {simulationMode === 'topology_timelapse' && (
                      <div className="flex flex-col gap-3 p-3 bg-zinc-900 border border-white/5 rounded-2xl">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500 uppercase">Growth Mode:</span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => setTimelapseMode('decay')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${timelapseMode === 'decay' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Mesh Decay
                            </button>
                            <button 
                              onClick={() => setTimelapseMode('growth')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${timelapseMode === 'growth' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Stress Growth
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setTimelapsePlaying(!timelapsePlaying)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all"
                            title={timelapsePlaying ? "Pause Playback" : "Play Timelapse"}
                          >
                            {timelapsePlaying ? <Pause size={14} /> : <Play size={14} />}
                          </button>
                          <div className="flex-1 flex flex-col gap-1">
                            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                              <span>0%</span>
                              <span className="text-cyan-400 font-bold">{timelapseProgress}% Evolution</span>
                              <span>100%</span>
                            </div>
                            <input 
                              type="range" 
                              min="0" 
                              max="100" 
                              value={timelapseProgress} 
                              onChange={(e) => setTimelapseProgress(Number(e.target.value))}
                              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Modal Vibration Solver Interactive Fields */}
                    {simulationMode === 'modal_vibration' && (
                      <div className="flex flex-col gap-3 p-3 bg-zinc-900 border border-white/5 rounded-2xl">
                        <div className="flex flex-col gap-2">
                          <span className="text-[10px] font-black font-mono text-zinc-500 uppercase tracking-wider">Natural Frequency Peaks:</span>
                          <div className="grid grid-cols-3 gap-2">
                            {[
                              { mode: 1, freq: '14 Hz', label: '1st Mode (Flexure)' },
                              { mode: 2, freq: '44 Hz', label: '2nd Mode (Torsion)' },
                              { mode: 3, freq: '120 Hz', label: '3rd Mode (Shear)' }
                            ].map((peak) => (
                              <button
                                key={peak.mode}
                                onClick={() => setModalFrequencyMode(peak.mode)}
                                className={`p-2 rounded-xl text-left border flex flex-col transition-all ${modalFrequencyMode === peak.mode ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-lg' : 'bg-transparent text-zinc-400 border-white/5 hover:bg-white/5'}`}
                              >
                                <span className="text-[9px] font-mono text-zinc-500 uppercase font-black">{peak.freq}</span>
                                <span className="text-[10px] font-bold tracking-tight">{peak.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex justify-between text-[10px] font-mono text-zinc-500">
                            <span>Oscillation Amplitude:</span>
                            <span className="text-purple-400 font-bold">{vibrationAmplitude}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="5" 
                            max="150" 
                            value={vibrationAmplitude} 
                            onChange={(e) => setVibrationAmplitude(Number(e.target.value))}
                            className="w-full accent-purple-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    {/* Local Thickness Painting Engine Interactive Fields */}
                    {simulationMode === 'thickness_paint' && (
                      <div className="flex flex-col gap-3 p-3 bg-zinc-900 border border-white/5 rounded-2xl font-sans">
                        <div className="text-[10px] font-sans text-zinc-400 leading-relaxed bg-pink-500/5 p-2 rounded-lg border border-pink-500/10 mb-1">
                          👉 <strong className="text-pink-300">3D Paintbrush active:</strong> Click directly on any component mesh to inject parametric reinforcements (ribs / shell bulkiness) to stabilize high-vibration boundaries.
                        </div>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-zinc-500 uppercase">Brush Type:</span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => setPaintType('rib')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${paintType === 'rib' ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Waffle Rib
                            </button>
                            <button 
                              onClick={() => setPaintType('shell')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${paintType === 'shell' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Shell Bulk
                            </button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                              <span>Brush Size:</span>
                              <span className="text-pink-400 font-bold">{paintBrushSize} mm</span>
                            </div>
                            <input 
                              type="range" 
                              min="2" 
                              max="25" 
                              value={paintBrushSize} 
                              onChange={(e) => setPaintBrushSize(Number(e.target.value))}
                              className="w-full accent-pink-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="flex items-center justify-between border-l border-white/10 pl-3">
                            <div className="flex flex-col">
                              <span className="text-[9px] font-mono text-zinc-500 uppercase">Painted Ribs:</span>
                              <span className="text-xs font-sans font-black text-white">{paintNodes.length} nodes</span>
                            </div>
                            {paintNodes.length > 0 && (
                              <button 
                                onClick={() => setPaintNodes([])}
                                className="px-2 py-1 bg-red-500/20 text-red-400 text-[9px] font-bold rounded uppercase hover:bg-red-500/30 border border-red-500/20 transition-all"
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* NURBS Reconstruction Interactive Fields */}
                    {simulationMode === 'nurbs_reconstruct' && (
                      <div className="flex flex-col gap-3 p-3 bg-zinc-900 border border-white/5 rounded-2xl">
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { type: 'both', label: 'B-Rep + Mesh' },
                            { type: 'nurbs_only', label: 'NURBS Curve' },
                            { type: 'poly_only', label: 'Tessellated Mesh' }
                          ].map((disp) => (
                            <button
                              key={disp.type}
                              onClick={() => setNurbsDisplayType(disp.type as any)}
                              className={`p-1.5 rounded-lg text-center border flex flex-col items-center justify-center transition-all ${nurbsDisplayType === disp.type ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-transparent text-zinc-400 border-white/5 hover:bg-white/5'}`}
                            >
                              <span className="text-[10px] font-bold tracking-tight">{disp.label}</span>
                            </button>
                          ))}
                        </div>

                        {/* UV unwrapped indicator / helper to explain that conversion fixes texturing bottlenecks */}
                        <div className="p-2 border border-emerald-500/10 bg-emerald-500/5 text-[9px] rounded-lg leading-relaxed text-zinc-400 flex items-center gap-2">
                          <Check size={14} className="text-emerald-400 shrink-0" />
                          <div>
                            <span className="text-emerald-300 font-bold block">Engine/Game Engine Conformity Solver</span>
                            NURBS faces synthesized & converted into UV unwrapped polygonal tiles for texturing, animation rigs, and viewport compatibility.
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] text-zinc-500">
                              <span>Tessellation Tol:</span>
                              <span className="text-emerald-400 font-bold">{nurbsTessellationTolerance} mm</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.01" 
                              max="0.25" 
                              step="0.01"
                              value={nurbsTessellationTolerance} 
                              onChange={(e) => setNurbsTessellationTolerance(Number(e.target.value))}
                              className="accent-emerald-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-[9px] text-zinc-500">
                              <span>Isocurve Density:</span>
                              <span className="text-emerald-400 font-bold">{nurbsIsocurveCount} count</span>
                            </div>
                            <input 
                              type="range" 
                              min="4" 
                              max="32" 
                              value={nurbsIsocurveCount} 
                              onChange={(e) => setNurbsIsocurveCount(Number(e.target.value))}
                              className="accent-emerald-400 h-1 bg-zinc-800 rounded-lg cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Biomimetic Infill Generators (Trabecular & Gyroid Lattices) Interactive Fields */}
                    {simulationMode === 'biomimetic_lattice' && (
                      <div className="flex flex-col gap-3.5 p-3 bg-zinc-900 border border-white/5 rounded-2xl text-xs">
                        <div className="flex items-center justify-between font-mono">
                          <span className="text-zinc-400 uppercase font-black text-[10px]">Lattice Class:</span>
                          <div className="flex gap-1.5">
                            <button 
                              onClick={() => setLatticeType('trabecular')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${latticeType === 'trabecular' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Trabecular
                            </button>
                            <button 
                              onClick={() => setLatticeType('gyroid')} 
                              className={`px-2 py-1 rounded text-[10px] font-bold uppercase transition-all ${latticeType === 'gyroid' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              Gyroid
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-zinc-500">
                              <span>Lattice Density:</span>
                              <span className="text-cyan-400 font-bold">{latticeDensity}%</span>
                            </div>
                            <input 
                              type="range" 
                              min="10" 
                              max="100" 
                              value={latticeDensity} 
                              onChange={(e) => setLatticeDensity(Number(e.target.value))}
                              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-zinc-500">
                              <span>Strut Thickness:</span>
                              <span className="text-cyan-400 font-bold">{strutThickness} mm</span>
                            </div>
                            <input 
                              type="range" 
                              min="0.5" 
                              max="4.0" 
                              step="0.1"
                              value={strutThickness} 
                              onChange={(e) => setStrutThickness(Number(e.target.value))}
                              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded cursor-pointer"
                            />
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-zinc-500">
                              <span>Unit Cell Size:</span>
                              <span className="text-cyan-400 font-bold">{unitCellSize} mm</span>
                            </div>
                            <input 
                              type="range" 
                              min="1.0" 
                              max="8.0" 
                              step="0.2"
                              value={unitCellSize} 
                              onChange={(e) => setUnitCellSize(Number(e.target.value))}
                              className="w-full accent-cyan-400 h-1 bg-zinc-800 rounded cursor-pointer"
                            />
                          </div>

                          <div className="flex items-center justify-between border-l border-white/10 pl-3">
                            <span className="text-zinc-500 uppercase text-[9px]">Solid Shell:</span>
                            <button
                              onClick={() => setShellConfinement(!shellConfinement)}
                              className={`px-1.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${shellConfinement ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/15 text-red-500 border border-red-500/20'}`}
                            >
                              {shellConfinement ? 'On' : 'Off'}
                            </button>
                          </div>
                        </div>

                        <div className="p-2 border border-cyan-500/10 bg-cyan-950/20 text-[9px] rounded-lg leading-relaxed text-zinc-400">
                          <span className="text-cyan-300 font-bold block uppercase mb-0.5">Biomimetic Cellular Topology</span>
                          Generates structural pattern lattices optimized for high pressure, mimicking natural porous elements and TPMS boundaries.
                        </div>
                      </div>
                    )}

                    {/* Multi-Material Density Shading (Functional Voxel Grading) Interactive Fields */}
                    {simulationMode === 'voxel_grading' && (
                      <div className="flex flex-col gap-3.5 p-3 bg-zinc-900 border border-white/5 rounded-2xl text-xs">
                        <div className="grid grid-cols-2 gap-3.5">
                          <div className="flex flex-col gap-2 font-mono text-[10px]">
                            <span className="text-zinc-500 uppercase leading-relaxed">Voxel Gradients:</span>
                            <select
                              value={voxelGradientProfile}
                              onChange={(e) => setVoxelGradientProfile(e.target.value as any)}
                              className="bg-zinc-950 border border-white/15 rounded-md px-2 py-1 text-zinc-200 outline-none text-[9px] uppercase font-bold cursor-pointer"
                            >
                              <option value="isotropic">Isotropic Uniform</option>
                              <option value="shell_radial">Shell Radial</option>
                              <option value="height_graded">Height Graded</option>
                              <option value="stress_driven">Stress Driven</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                            <span className="text-zinc-500 uppercase">Voxel Resolution:</span>
                            <div className="flex gap-1">
                              {['low', 'med', 'high'].map((res) => (
                                <button
                                  key={res}
                                  onClick={() => setVoxelResolution(res as any)}
                                  className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all ${voxelResolution === res ? 'bg-indigo-505 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                                >
                                  {res}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-1.5 font-mono text-[10px]">
                          <div className="flex justify-between text-zinc-500">
                            <span>Exclusion Density Threshold:</span>
                            <span className="text-indigo-400 font-bold">ρ ≥ {voxelThreshold}%</span>
                          </div>
                          <input 
                            type="range" 
                            min="5" 
                            max="80" 
                            value={voxelThreshold} 
                            onChange={(e) => setVoxelThreshold(Number(e.target.value))}
                            className="w-full accent-indigo-400 h-1 bg-zinc-800 rounded cursor-pointer"
                          />
                        </div>

                        <div className="p-2 border border-indigo-500/10 bg-indigo-950/20 text-[9px] rounded-lg leading-relaxed text-zinc-400">
                          <span className="text-indigo-300 font-bold block uppercase mb-0.5">3D Multi-Material Micro-Structuring</span>
                          Discretizes solid volume into density-weighted functional voxel domains, solving material gradients based on local stress bounds.
                        </div>
                      </div>
                    )}

                    {/* Dynamic Load Stress Heatmap Interactive Fields */}
                    {simulationMode === 'stress_heatmap' && (
                      <div className="flex flex-col gap-3.5 p-3 bg-zinc-900 border border-white/5 rounded-2xl text-xs">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="flex flex-col gap-1 font-mono text-[10px]">
                            <span className="text-zinc-500 uppercase">Boundary Conditions:</span>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setBoundaryConditions('fixed_base')}
                                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all ${boundaryConditions === 'fixed_base' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                              >
                                Solid Collar
                              </button>
                              <button
                                onClick={() => setBoundaryConditions('elastic_foundations')}
                                className={`flex-1 py-1 rounded text-[9px] font-bold uppercase transition-all ${boundaryConditions === 'elastic_foundations' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                              >
                                Elastic Foundation
                              </button>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-l border-white/10 pl-4 font-mono text-[10px]">
                            <span className="text-zinc-500 uppercase">Strain Annotations:</span>
                            <button
                              onClick={() => setStressHotSpotMarker(!stressHotSpotMarker)}
                              className={`px-2 py-1 rounded text-[9px] font-bold uppercase transition-all ${stressHotSpotMarker ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-transparent text-zinc-500 hover:text-white'}`}
                            >
                              {stressHotSpotMarker ? 'Active' : 'Muted'}
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 text-[9px] font-mono">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-zinc-500 uppercase">Applied Force X:</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2 py-1 rounded border border-white/5">
                              <span className="text-rose-400 font-bold">{forceVectorX}N</span>
                              <input 
                                type="range" 
                                min="-5000" 
                                max="5000" 
                                step="100"
                                value={forceVectorX} 
                                onChange={(e) => setForceVectorX(Number(e.target.value))}
                                className="w-12 accent-rose-400"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-zinc-500 uppercase">Applied Force Y:</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2 py-1 rounded border border-white/5">
                              <span className="text-rose-400 font-bold">{forceVectorY}N</span>
                              <input 
                                type="range" 
                                min="-5000" 
                                max="5000" 
                                step="100"
                                value={forceVectorY} 
                                onChange={(e) => setForceVectorY(Number(e.target.value))}
                                className="w-12 accent-rose-400"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <span className="text-zinc-500 uppercase">Applied Force Z:</span>
                            <div className="flex items-center justify-between bg-zinc-950 px-2 py-1 rounded border border-white/5">
                              <span className="text-rose-400 font-bold">{forceVectorZ}N</span>
                              <input 
                                type="range" 
                                min="-5000" 
                                max="5000" 
                                step="100"
                                value={forceVectorZ} 
                                onChange={(e) => setForceVectorZ(Number(e.target.value))}
                                className="w-12 accent-rose-400"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {simulationMode !== 'topology_timelapse' && 
                     simulationMode !== 'modal_vibration' && 
                     simulationMode !== 'thickness_paint' && 
                     simulationMode !== 'nurbs_reconstruct' &&
                     simulationMode !== 'biomimetic_lattice' &&
                     simulationMode !== 'voxel_grading' &&
                     simulationMode !== 'stress_heatmap' && (
                      <div className="grid grid-cols-3 gap-4">
                           <SimStat label="Efficiency" value="94.2%" trend="+0.4%" />
                           <SimStat label="Max Stress" value={simulationMode === 'stress' ? '842 MPa' : '42.1°C'} trend="Stable" />
                           <SimStat label="Latency" value="1.2ms" trend="-0.1ms" />
                      </div>
                    )}

                    <div className="flex gap-2">
                        <button 
                         onClick={() => setSimulationMode('none')}
                         className="flex-1 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Stop Simulation
                        </button>
                        <button 
                          onClick={onOptimize}
                          className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Optimize Design
                        </button>
                    </div>
                </motion.div>
            )}

            {measureMode && (
                <motion.div 
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 z-10 bg-zinc-950/95 text-cyan-400 px-6 py-3 rounded-full border border-cyan-500/40 flex items-center gap-4 shadow-2xl backdrop-blur-md"
                    data-testid="measure-active-panel"
                >
                    <div className="p-1.5 bg-cyan-500/20 rounded-lg text-cyan-400"><Ruler size={14} /></div>
                    <span className="text-sm font-mono font-black">{measuredValue || 'Select two points to measure'}</span>
                    <button onClick={() => { setMeasureMode(false); setMeasuredValue(null); }} className="p-1 hover:bg-cyan-500/20 rounded-md transition-colors" data-testid="measure-close-btn">
                        <X size={16} />
                    </button>
                </motion.div>
            )}

            {inspectionMode && selectedPartData && (
              <motion.div
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 50, opacity: 0 }}
                className="absolute top-28 right-6 z-10 w-80 bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl space-y-4"
              >
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest font-unique flex items-center gap-2">
                       <BoxSelect size={12} /> Component Data
                    </span>
                    <button onClick={() => setSelectedPart(null)} className="text-zinc-500 hover:text-white"><X size={14} /></button>
                 </div>
                 <div className="space-y-1">
                    <h3 className="text-sm font-black text-white leading-tight truncate">{selectedPart}</h3>
                    <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">ID: {selectedPartData.uuid.split('-')[0]}</span>
                 </div>
                 <div className="h-px bg-white/5" />
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold text-zinc-500 uppercase">Faces</span>
                       <p className="text-xs font-mono font-bold text-white">{(selectedPartData.geometry as any).attributes?.position?.count || 0}</p>
                    </div>
                    <div className="space-y-1">
                       <span className="text-[9px] font-bold text-zinc-500 uppercase">Material</span>
                       <p className="text-xs font-mono font-bold text-white">{(selectedPartData.material as any).type || 'MeshStandard'}</p>
                    </div>
                 </div>
                 <div className="flex gap-2">
                   <button 
                      onClick={() => {
                        if (activeIsolatedPart === selectedPart) {
                          setActiveIsolatedPart(null);
                        } else {
                          setActiveIsolatedPart(selectedPart || null);
                        }
                      }}
                      className={`flex-1 py-2 border rounded-xl text-[9px] font-black uppercase tracking-widest transition-colors ${
                        activeIsolatedPart === selectedPart 
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500 hover:text-white'
                          : 'bg-indigo-500/10 text-indigo-400 border-white/5 hover:bg-indigo-500 hover:text-white'
                      }`}
                   >
                      {activeIsolatedPart === selectedPart ? 'Clear Focus' : 'Isolate Part'}
                   </button>
                   <button 
                      onClick={handleComponentAiAnalysis}
                      disabled={isComponentAnalyzing}
                      className="flex-1 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                   >
                      <Sparkles size={10} className={isComponentAnalyzing ? "animate-pulse" : ""} />
                      {isComponentAnalyzing ? 'Analyzing...' : 'AI Analyze'}
                   </button>
                 </div>

                 {isComponentAnalyzing && (
                   <div className="flex flex-col items-center justify-center py-4 gap-2 border-t border-white/5">
                      <Loader2 className="text-emerald-400 animate-spin" size={16} />
                      <span className="text-[8px] font-black uppercase text-emerald-400 tracking-wider animate-pulse">Running Diagnostic Core...</span>
                   </div>
                 )}

                 {componentAnalysisResult && (
                   <div className="space-y-3.5 pt-3 border-t border-white/5 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                      <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-400 uppercase tracking-widest animate-fade-in">
                         <Sparkles size={10} /> Component Diagnostic
                      </div>
                      
                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">Functional Role</span>
                         <p className="text-[10px] text-zinc-300 leading-relaxed italic">
                            {componentAnalysisResult.summary}
                         </p>
                      </div>

                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Structural Integrity Check</span>
                         <p className="text-[10px] text-zinc-300 leading-relaxed italic">
                            {componentAnalysisResult.structuralCheck}
                         </p>
                      </div>

                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Material Optimization</span>
                         <p className="text-[10px] text-zinc-300 leading-relaxed italic anim-duration-300">
                            {componentAnalysisResult.materialOptimization}
                         </p>
                      </div>

                      <div className="space-y-1">
                         <span className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Manufacturing tips</span>
                         <p className="text-[10px] text-zinc-300 leading-relaxed italic">
                            {componentAnalysisResult.manufacturingFeasibility}
                         </p>
                      </div>

                      <div className="space-y-2 pt-2 bg-black/40 p-2.5 rounded-xl border border-white/5">
                         <span className="text-[8px] font-black text-emerald-400 uppercase tracking-widest block mb-1">AI Predicted Simulation Stats</span>
                         <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                            <div>
                               <span className="text-zinc-500 text-[8px] uppercase">Safety Factor</span>
                               <div className="text-white font-bold text-xs">{componentAnalysisResult.simulationPrediction.safetyFactor}</div>
                            </div>
                            <div>
                               <span className="text-zinc-500 text-[8px] uppercase">Thermal Limit</span>
                               <div className="text-white font-bold text-xs">{componentAnalysisResult.simulationPrediction.thermalLimit}</div>
                            </div>
                            <div className="col-span-2">
                               <span className="text-zinc-500 text-[8px] uppercase">Optimal Process</span>
                               <div className="text-emerald-400 font-bold text-[9px]">{componentAnalysisResult.simulationPrediction.optimalProcess}</div>
                            </div>
                            <div className="col-span-2 border-t border-white/5 pt-1 text-[9px] text-zinc-400 italic">
                               {componentAnalysisResult.simulationPrediction.loadPathInsights}
                            </div>
                         </div>
                      </div>
                   </div>
                 )}
              </motion.div>
            )}

            {showAiReport && aiAnalysis && (
               <motion.div
                drag
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -100, opacity: 0 }}
                className={`absolute top-28 ${isFullscreen ? 'left-[340px]' : 'left-40'} z-10 w-80 bg-zinc-950/95 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 shadow-2xl space-y-4`}
              >
                 <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest font-unique flex items-center gap-2">
                       <Sparkles size={12} /> AI Synthesis Insights
                    </span>
                    <button onClick={() => setShowAiReport(false)} className="text-zinc-500 hover:text-zinc-300"><X size={14} /></button>
                 </div>
                 
                 <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                   <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Procedural Analysis</span>
                      <p className="text-[11px] text-zinc-300 leading-relaxed">{aiAnalysis.explodeStrategy}</p>
                   </div>
                   
                   <div className="space-y-2">
                      <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Inspection Vector</span>
                      <div className="space-y-1.5">
                        {aiAnalysis.highlights?.map((h: string, i: number) => (
                           <div key={i} className="flex items-center gap-2 text-[10px] text-zinc-400">
                              <div className="w-1 h-1 rounded-full bg-emerald-500" />
                              {h}
                           </div>
                        )) || (
                          <div className="text-[10px] text-zinc-500 italic">No highlights available.</div>
                        )}
                      </div>
                   </div>
                 </div>

                 <div className="pt-2 flex gap-2">
                   <button 
                    onClick={() => { setExplosionFactor(0.5); setXrayMode(true); }}
                    className="flex-1 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                   >
                     Apply Explode Config
                   </button>
                 </div>
              </motion.div>
            )}
        </AnimatePresence>

        <Canvas shadows dpr={dpr} camera={{ position: [10, 6, 10], fov: 35 }} gl={{ antialias: !lowPerfMode, powerPreference: 'high-performance' }}>
            <PerformanceMonitor onIncline={() => setDpr(2)} onDecline={() => { setDpr(1); setLowPerfMode(true); }} />
            <AdaptiveDpr pixelated={lowPerfMode} />
            <color attach="background" args={['#09090b']} />
            <AmbientLight intensity={0.5} />

            <SpotLight position={[10, 10, 10]} intensity={1} castShadow={!lowPerfMode} />
            {!lowPerfMode && (
              <Suspense fallback={null}>
                  <Environment preset="city" />
              </Suspense>
            )}
            <Suspense fallback={<Loader />}>
                <SimulationView 
                  mode={simulationMode} 
                  parts={parts} 
                  feaResult={feaResult} 
                  timelapseProgress={timelapseProgress}
                  timelapseMode={timelapseMode}
                  modalFrequencyMode={modalFrequencyMode}
                  vibrationAmplitude={vibrationAmplitude}
                  nurbsDisplayType={nurbsDisplayType}
                  nurbsTessellationTolerance={nurbsTessellationTolerance}
                  nurbsIsocurveCount={nurbsIsocurveCount}
                  hoverPaintPoint={hoverPaintPoint}
                  paintNodes={paintNodes}
                  paintBrushSize={paintBrushSize}
                  // Biomimetic Lattices properties
                  latticeType={latticeType}
                  latticeDensity={latticeDensity}
                  strutThickness={strutThickness}
                  unitCellSize={unitCellSize}
                  shellConfinement={shellConfinement}
                  // Voxel grading properties
                  voxelResolution={voxelResolution}
                  voxelGradientProfile={voxelGradientProfile}
                  voxelThreshold={voxelThreshold}
                  // Stress loads properties
                  forceVectorX={forceVectorX}
                  forceVectorY={forceVectorY}
                  forceVectorZ={forceVectorZ}
                  boundaryConditions={boundaryConditions}
                  stressHotSpotMarker={stressHotSpotMarker}
                />
                <DatumAnnotations active={annotationsMode} />
                <Group ref={sceneGroupRef}>
                  <InteractiveEngine 
                      modelUrl={modelUrl}
                      proceduralSpec={proceduralSpec}
                      measureMode={measureMode}
                      inspectionMode={inspectionMode}
                      xrayMode={xrayMode}
                      explosionFactor={explosionFactor}
                      selectedPart={selectedPart}
                      setSelectedPart={setSelectedPart}
                      onMeasure={setMeasuredValue}
                      onMeshDiscovery={setParts}
                      onScaleReport={setNormalizationScale}
                      parts={parts}
                      lowPerfMode={lowPerfMode}
                      activeIsolatedPart={activeIsolatedPart}
                      simulationMode={simulationMode}
                      paintNodes={paintNodes}
                      setPaintNodes={setPaintNodes}
                      hoverPaintPoint={hoverPaintPoint}
                      setHoverPaintPoint={setHoverPaintPoint}
                      paintBrushSize={paintBrushSize}
                  />
                </Group>
            </Suspense>
            <OrbitControls ref={controlsRef} makeDefault />
        </Canvas>
    </div>
  );
};

const SimStat = ({ label, value, trend }: { label: string; value: string; trend: string }) => (
    <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
        <span className="block text-[8px] font-black text-zinc-500 uppercase tracking-widest mb-1">{label}</span>
        <div className="flex items-baseline gap-2">
            <span className="text-sm font-black font-technical tracking-tighter text-white">{value}</span>
            <span className={`text-[8px] font-bold ${trend.startsWith('+') || trend === 'Stable' ? 'text-emerald-500' : 'text-zinc-400'}`}>{trend}</span>
        </div>
    </div>
);

const ExplosionEffect = ({ meshes, factor }: { meshes: THREE.Mesh[], factor: number }) => {
  const lastFactor = useRef(factor);
  const isTransitioning = useRef(false);
  const targets = useRef<Map<string, THREE.Vector3>>(new Map());

  // Use a central ref for origin to avoid creating new Vector3s
  const center = useMemo(() => new THREE.Vector3(0, 0, 0), []);

  useEffect(() => {
    if (factor !== lastFactor.current) {
      isTransitioning.current = true;
      lastFactor.current = factor;
      
      // Pre-calculate target positions when factor changes
      meshes.forEach(mesh => {
        if (!mesh.userData.originalPosition) {
          mesh.userData.originalPosition = mesh.position.clone();
        }
        const dir = mesh.userData.originalPosition.clone().sub(center).normalize();
        const targetPos = mesh.userData.originalPosition.clone().add(dir.multiplyScalar(factor * 20));
        targets.current.set(mesh.uuid, targetPos);
      });
    }
  }, [factor, meshes, center]);

  useFrame(() => {
    // Only run if transitioning to save power
    if (!isTransitioning.current && factor === 0) return;
    
    let stillMoving = false;
    meshes.forEach(mesh => {
      const targetPos = targets.current.get(mesh.uuid);
      if (!targetPos) return;
      
      if (mesh.position.distanceToSquared(targetPos) > 0.0001) {
        mesh.position.lerp(targetPos, 0.1);
        stillMoving = true;
      }
    });

    if (!stillMoving) isTransitioning.current = false;
  });
  return null;
};

const InteractiveEngine = ({ 
  modelUrl, 
  proceduralSpec, 
  measureMode, 
  inspectionMode,
  xrayMode,
  explosionFactor,
  selectedPart,
  setSelectedPart,
  onMeasure, 
  onMeshDiscovery, 
  onScaleReport, 
  parts,
  activeIsolatedPart,
  simulationMode,
  paintNodes = [],
  setPaintNodes,
  hoverPaintPoint,
  setHoverPaintPoint,
  paintBrushSize = 5
}: any) => {
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [cursorPoint, setCursorPoint] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (!measureMode) {
        setMeasurePoints([]);
        setCursorPoint(null);
    }
  }, [measureMode]);

  useEffect(() => {
    parts.forEach(p => {
      if (p.material) {
        const mat = p.material as THREE.MeshStandardMaterial;
        const name = p.userData.name;
        if (activeIsolatedPart) {
          if (name === activeIsolatedPart) {
            mat.transparent = false;
            mat.opacity = 1.0;
            mat.wireframe = false;
          } else {
            mat.transparent = true;
            mat.opacity = 0.15;
            mat.wireframe = xrayMode;
          }
        } else {
          mat.transparent = xrayMode;
          mat.opacity = xrayMode ? 0.3 : 1;
          mat.wireframe = xrayMode;
        }
      }
    });
  }, [xrayMode, activeIsolatedPart, parts]);

  const handlePointerMove = (e: any) => { 
    if(measureMode) {
      setCursorPoint(e.point.clone()); 
    } else if (simulationMode === 'thickness_paint') {
      setHoverPaintPoint(e.point.clone());
    }
  };

  const handleClick = (e: any) => { 
      e.stopPropagation();
      if(measureMode) {
          const newPoints = measurePoints.length >= 2 ? [e.point.clone()] : [...measurePoints, e.point.clone()];
          setMeasurePoints(newPoints);
          if (newPoints.length === 2) {
              const scale = 1; // Updated via onScaleReport
              const dist = newPoints[0].distanceTo(newPoints[1]);
              const distMM = (dist / 1) * 1000;
              onMeasure?.(distMM.toFixed(1) + " mm");
          } else {
              onMeasure?.(null);
          }
      } else if (simulationMode === 'thickness_paint' && e.object) {
          const hitPartName = e.object.userData.name;
          setPaintNodes?.((prev: any) => [
            ...prev,
            {
              point: e.point.clone(),
              partName: hitPartName,
              id: Date.now()
            }
          ]);
      } else if (inspectionMode && e.object) {
          setSelectedPart(e.object.userData.name);
      }
  };

  return (
    <Group 
      onPointerMove={handlePointerMove} 
      onClick={handleClick}
      onPointerOut={() => { if (simulationMode === 'thickness_paint') setHoverPaintPoint?.(null); }}
    >
      <ExplosionEffect meshes={parts} factor={explosionFactor} />
      {proceduralSpec && Object.keys(proceduralSpec).length > 0 ? (
        <ProceduralModel key={JSON.stringify(proceduralSpec)} spec={proceduralSpec} onMeshDiscovery={onMeshDiscovery} />
      ) : (
        <LibraryEngine 
          modelUrl={modelUrl} 
          onMeshDiscovery={onMeshDiscovery}
          onScaleReport={onScaleReport}
        />
      )}
      <MeasurementGizmo points={measurePoints} cursorPoint={cursorPoint} scaleFactor={1} />
      <SimulationHighlights parts={parts} selectedPart={selectedPart} />
      
      {proceduralSpec && (
        <Html position={[0, 5, 0]} center>
          <div className="bg-purple-600/90 text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl border border-purple-400/30 flex items-center gap-2 backdrop-blur-md">
            <Sparkles size={12} className="animate-pulse" />
            Procedural Synthesis Active
          </div>
        </Html>
      )}
    </Group>
  );
};

const LibraryEngine = ({ 
  modelUrl, 
  onMeshDiscovery, 
  onScaleReport,
}: any) => {
  const finalUrl = modelUrl || DEFAULT_MODEL;
  
  // Use a localized state to handle load errors
  const [loadError, setLoadError] = useState(false);

  return (
    <Suspense fallback={<Loader />}>
      {loadError ? (
        <Mesh>
          <BoxGeometry args={[2, 2, 2]} />
          <MeshStandardMaterial color="#ef4444" wireframe />
          <Html center>
            <div className="bg-red-500/20 text-red-500 text-[10px] font-black uppercase px-3 py-1.5 rounded-full border border-red-500/30 backdrop-blur-md whitespace-nowrap">
              Load Failure: Model Unreachable
            </div>
          </Html>
        </Mesh>
      ) : (
        <ActualLibraryLoader 
          url={finalUrl} 
          onMeshDiscovery={onMeshDiscovery} 
          onScaleReport={onScaleReport}
          onError={() => setLoadError(true)}
        />
      )}
    </Suspense>
  );
};

const ActualLibraryLoader = ({ url, onMeshDiscovery, onScaleReport, onError }: any) => {
  let sceneResult: any;
  try {
    const gltf = useGLTF(url, true) as any;
    sceneResult = gltf.scene;
  } catch (e) {
    console.error("3D Model load error:", e);
    useEffect(() => { onError?.(); }, [onError]);
    return null;
  }

  const { clonedScene, parts: discoveredParts, normalizationScale } = useMemo(() => {
    if (!sceneResult) return { clonedScene: null, parts: [], normalizationScale: 1 };
    
    const s = sceneResult.clone();
    const box = new THREE.Box3().setFromObject(s);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 12.0 / (maxDim || 1);
    s.scale.setScalar(scale);
    
    const meshList: THREE.Mesh[] = [];
    s.traverse(child => {
        if ((child as THREE.Mesh).isMesh) {
            const m = child as THREE.Mesh;
            m.userData.name = getRefinedName(m.name || `Part_${m.id}`);
            meshList.push(m);
        }
    });

    return { clonedScene: s, parts: meshList, normalizationScale: scale };
  }, [sceneResult]);

  useEffect(() => { if (normalizationScale) onScaleReport?.(normalizationScale); }, [normalizationScale, onScaleReport]);
  useEffect(() => { if (discoveredParts.length > 0) onMeshDiscovery?.(discoveredParts); }, [discoveredParts, onMeshDiscovery]);

  return clonedScene ? <Primitive object={clonedScene} /> : null;
};
