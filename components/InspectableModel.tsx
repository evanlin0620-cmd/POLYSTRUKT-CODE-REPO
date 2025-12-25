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
  Line
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { 
  Activity, Flame, Wind, Ruler, EyeOff, Info, AlertTriangle, 
  Search, Zap, Layers, Eye, ChevronRight, Settings, 
  Box, Cpu, HardDrive, Wrench, Maximize, X, Check, ChevronDown, 
  Filter, LayoutGrid, ListFilter, Play, Pause, UnfoldVertical,
  Maximize2, Database, BoxSelect
} from 'lucide-react';
import { getRefinedName } from './ThreeScene';

const Group = 'group' as any;
const Mesh = 'mesh' as any;
const SphereGeometry = 'sphereGeometry' as any;
const MeshBasicMaterial = 'meshBasicMaterial' as any;
const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-zinc-200 border-t-purple-500 rounded-full animate-spin" />
        <span className="text-[10px] font-mono text-zinc-500">{progress.toFixed(0)}%</span>
      </div>
    </Html>
  );
}

const DEFAULT_MODEL = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb";

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

const SimulationHighlights = ({ parts, selectedPart, hoveredPart, simulationMode, visibleLayers, focusPart }: any) => {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const safeParts = parts || [];
    safeParts.forEach((p: any) => {
        if (!p || !p.material) return;
        const mat = p.material as THREE.MeshStandardMaterial;
        const name = p.userData.name;
        const isSelected = name === selectedPart;
        mat.emissiveIntensity = isSelected ? 2.0 + Math.sin(t * 6) * 0.8 : 0;
        if (isSelected) mat.emissive.setHex(0x8b5cf6);
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

export const InspectableModel = ({ 
  isFullscreen, 
  simulationMode: externalSimMode,
  modelUrl,
  focusPart
}: any) => {
  const [measureMode, setMeasureMode] = useState(false);
  const [measuredValue, setMeasuredValue] = useState<string | null>(null);
  const [explosionFactor, setExplosionFactor] = useState(0);
  const [isOperating, setIsOperating] = useState(false);
  const [parts, setParts] = useState<THREE.Mesh[]>([]);
  const [normalizationScale, setNormalizationScale] = useState<number>(1);
  const [visibleLayers] = useState<Set<string>>(new Set(['Structure', 'Internals', 'Miscellaneous']));

  return (
    <div data-testid="inspectable-model-canvas" className={`w-full h-full relative bg-zinc-50 ${isFullscreen ? '' : 'rounded-xl overflow-hidden'}`}>
        <div className="absolute top-28 left-6 z-10 flex flex-col gap-3 pointer-events-none">
            <button 
                data-testid="toggle-measure-btn"
                onClick={() => setMeasureMode(!measureMode)}
                className={`pointer-events-auto p-4 rounded-2xl border transition-all shadow-xl font-unique text-[10px] font-black tracking-widest ${measureMode ? 'bg-cyan-500 text-white' : 'bg-white text-zinc-600'}`}
            >
                <Ruler size={18} />
                <span className="hidden md:block">Measure</span>
            </button>
        </div>

        <AnimatePresence>
            {measureMode && (
                <motion.div 
                    data-testid="measure-active-panel"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -50, opacity: 0 }}
                    className="absolute top-28 left-1/2 -translate-x-1/2 z-10 bg-zinc-950/95 text-cyan-400 px-6 py-3 rounded-full border border-cyan-500/40 flex items-center gap-4 shadow-2xl"
                >
                    <span data-testid="measure-active-value" className="text-sm font-mono font-black">{measuredValue || '--- mm'}</span>
                    <button data-testid="measure-close-btn" onClick={() => { setMeasureMode(false); setMeasuredValue(null); }} className="p-1 hover:bg-cyan-500/20 rounded-md">
                        <X size={16} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>

        <Canvas shadows dpr={[1, 2]} camera={{ position: [10, 6, 10], fov: 35 }}>
            <AmbientLight intensity={0.5} />
            <SpotLight position={[10, 10, 10]} intensity={1} castShadow />
            <Suspense fallback={<Loader />}>
                <Environment preset="city" />
                <InteractiveEngine 
                    modelUrl={modelUrl}
                    measureMode={measureMode}
                    explosionFactor={explosionFactor}
                    isOperating={isOperating}
                    onMeasure={setMeasuredValue}
                    onMeshDiscovery={setParts}
                    onScaleReport={setNormalizationScale}
                />
            </Suspense>
            <OrbitControls makeDefault />
        </Canvas>
    </div>
  );
};

const InteractiveEngine = ({ modelUrl, measureMode, onMeasure, onMeshDiscovery, onScaleReport, explosionFactor, isOperating }: any) => {
  const finalUrl = modelUrl || DEFAULT_MODEL;
  const { scene } = useGLTF(finalUrl as string, true);
  
  const [measurePoints, setMeasurePoints] = useState<THREE.Vector3[]>([]);
  const [cursorPoint, setCursorPoint] = useState<THREE.Vector3 | null>(null);

  const { clonedScene, parts, normalizationScale } = useMemo(() => {
    const s = scene.clone();
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
  }, [scene]);

  useEffect(() => { onScaleReport?.(normalizationScale); }, [normalizationScale]);
  useEffect(() => { onMeshDiscovery?.(parts); }, [parts]);

  useEffect(() => {
    if (!measureMode) {
        setMeasurePoints([]);
        setCursorPoint(null);
    }
  }, [measureMode]);

  return (
      <Group 
        onPointerMove={(e: any) => { if(measureMode) setCursorPoint(e.point.clone()); }}
        onClick={(e: any) => { 
            e.stopPropagation();
            if(measureMode) {
                const newPoints = measurePoints.length >= 2 ? [e.point.clone()] : [...measurePoints, e.point.clone()];
                setMeasurePoints(newPoints);
                if (newPoints.length === 2) {
                    const dist = newPoints[0].distanceTo(newPoints[1]);
                    const distMM = (dist / (normalizationScale || 1)) * 1000;
                    onMeasure?.(distMM.toFixed(1) + " mm");
                } else {
                    onMeasure?.(null);
                }
            }
        }}
      >
          <Primitive object={clonedScene} />
          <MeasurementGizmo points={measurePoints} cursorPoint={cursorPoint} scaleFactor={normalizationScale} />
          <SimulationHighlights parts={parts} />
      </Group>
  );
};
