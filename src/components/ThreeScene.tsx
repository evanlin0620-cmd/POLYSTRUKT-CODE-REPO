
import React, { useRef, Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  Environment, 
  ContactShadows, 
  useGLTF, 
  Html,
  useProgress,
  PerformanceMonitor,
  Bvh
} from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Maximize2, X, MousePointerClick, Ruler, Scale, Activity, Zap, Move, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

// Define PascalCase aliases for intrinsic Three.js elements to fix JSX type errors
const Group = 'group' as any;
const Primitive = 'primitive' as any;
const AmbientLight = 'ambientLight' as any;
const SpotLight = 'spotLight' as any;
const PointLight = 'pointLight' as any;

// Shared naming utility for consistency across the app
export const getRefinedName = (raw: string) => {
  const r = raw.toLowerCase();
  
  // Reciprocating Assembly
  if (r.includes('piston')) return 'Forged Piston [High-Compression]';
  if (r.includes('rod') && !r.includes('push')) return 'Connecting Rod [Titanium-Forged]';
  if (r.includes('crank')) return 'Crankshaft [Billet 4340 Steel]';
  if (r.includes('pin')) return 'Wrist Pin [DLC Coated]';
  if (r.includes('ring')) return 'Compression Sealing Ring Set';
  
  // Structural Components
  if (r.includes('block')) return 'Engine Block [AlSi10Mg Alloy]';
  if (r.includes('body')) return 'Primary Housing Monocoque';
  if (r.includes('housing')) return 'Structural Housing Case [Cast]';
  if (r.includes('head') && !r.includes('bolt')) return 'Cylinder Head [5-Axis Ported]';
  if (r.includes('cover')) return 'Valve Cover [Composite]';
  if (r.includes('sump') || r.includes('pan')) return 'Oil Reservoir Sump [Baffled]';
  
  // Valvetrain & Timing
  if (r.includes('valve') && !r.includes('cover')) return 'Intake/Exhaust Valve [Inconel]';
  if (r.includes('spring')) return 'Dual-Rate Valve Spring';
  if (r.includes('cam') || r.includes('shaft')) return 'Camshaft [High-Lift Profile]';
  if (r.includes('gear') || r.includes('sprocket')) return 'Timing Drive Gear [Hardened]';
  
  // Hardware & Fasteners
  if (r.includes('bolt') || r.includes('screw')) return 'Retention Bolt M8 [Grade 12.9]';
  if (r.includes('nut')) return 'Locking Flange Nut M10';
  if (r.includes('cap')) return 'Main Bearing Cap [Sintered]';
  if (r.includes('bearing')) return 'Hydrodynamic Journal Bearing';
  
  // Generic / Fallbacks - specific handling for vague names
  if (r.includes('mesh') || r.includes('object')) {
      if (r.includes('cyl')) return 'Cylinder Liner Sleeve';
      return 'Structural Support Element';
  }
  
  // Clean up generic names if no match
  const cleaned = raw.replace(/_/g, ' ')
            .replace(/mesh/i, '')
            .replace(/object/i, '')
            .replace(/[0-9]/g, '')
            .replace(/([A-Z])/g, ' $1') // Space before caps
            .trim();
            
  return cleaned.length > 2 ? cleaned : 'Mechanical Sub-Assembly';
};

// Material Density Database (g/cm3)
const getMaterialInfo = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('titanium') || n.includes('rod')) return { density: 4.43, matName: 'Titanium Ti-6Al-4V', yield: 880 };
    if (n.includes('steel') || n.includes('crank') || n.includes('gear') || n.includes('bolt') || n.includes('spring')) return { density: 7.85, matName: 'Steel 4340 Chromoly', yield: 700 };
    if (n.includes('inconel') || n.includes('exhaust')) return { density: 8.5, matName: 'Inconel 718', yield: 1100 };
    if (n.includes('aluminum') || n.includes('alloy') || n.includes('block') || n.includes('head') || n.includes('piston') || n.includes('housing') || n.includes('body')) return { density: 2.7, matName: 'Alu 7075-T6', yield: 505 };
    if (n.includes('composite') || n.includes('cover')) return { density: 1.6, matName: 'Carbon Fiber Reinforced Polymer', yield: 300 };
    return { density: 2.7, matName: 'Generic Alloy', yield: 200 };
};

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div 
        className="flex flex-col items-center gap-2 w-48 backdrop-blur-md bg-white/80 p-4 rounded-lg border border-zinc-200 shadow-xl"
        role="progressbar" 
        aria-valuenow={progress} 
        aria-valuemin={0} 
        aria-valuemax={100}
        aria-label="Loading 3D Model"
      >
        <div className="w-full flex justify-between text-[9px] font-mono text-zinc-500 mb-1 uppercase tracking-wider">
           <span>Asset Load</span>
           <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden" aria-hidden="true">
          <div 
            className="h-full bg-purple-600 transition-all duration-300 ease-out" 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <span className="text-[9px] font-mono tracking-widest text-zinc-400 mt-1 whitespace-nowrap" aria-hidden="true">
          OPTIMIZING GEOMETRY
        </span>
      </div>
    </Html>
  );
}

const EngineeringModel = ({ quality }: { quality: 'high' | 'low' }) => {
  // Use verified binary model path from Khronos CDN
  const modelUrl = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0/2CylinderEngine/glTF-Binary/2CylinderEngine.glb";
  
  const { scene } = useGLTF(modelUrl, true);
  
  const { clonedScene, parts, originalData, highMat, lowMat } = useMemo(() => {
    const s = scene.clone();
    
    // Normalize Scale Calculation
    const box = new THREE.Box3().setFromObject(s);
    const sizeVec = new THREE.Vector3();
    box.getSize(sizeVec);
    const maxDimension = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
    const normalizationScale = 0.5 / (maxDimension || 1); // Scale to 0.5 meters

    const center = box.getCenter(new THREE.Vector3());
    s.position.sub(center); 

    const meshList: THREE.Mesh[] = [];
    const data = new Map<string, { pos: THREE.Vector3 }>();

    const highMaterial = new THREE.MeshPhysicalMaterial({
      color: '#a1a1aa',
      roughness: 0.12,
      metalness: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      envMapIntensity: 3.0,
      side: THREE.DoubleSide,
    });
    
    const lowQualMaterial = new THREE.MeshLambertMaterial({
      color: '#d4d4d8',
      reflectivity: 0.5,
    });
    
    s.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        
        if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m: any) => {
                if (m.map) m.map.dispose();
                if (m.normalMap) m.normalMap.dispose();
                if (m.dispose) m.dispose();
            });
        }
        
        if (mesh.geometry) {
            mesh.geometry.deleteAttribute('uv2');
            mesh.geometry.deleteAttribute('tangent');
            mesh.geometry.deleteAttribute('color'); 
        }
        
        if (!mesh.geometry.boundingSphere) mesh.geometry.computeBoundingSphere();
        const rawRadius = mesh.geometry.boundingSphere?.radius || 0;
        
        // Store the REAL WORLD radius (in meters) for physics calc
        mesh.userData.realRadiusM = rawRadius * normalizationScale;
        mesh.userData.size = rawRadius; // Keep raw for vis logic if needed
        
        // Use the refined naming logic
        mesh.userData.name = getRefinedName(mesh.name || `Part_${mesh.id}`);

        meshList.push(mesh);
        data.set(mesh.uuid, { pos: mesh.position.clone() });
      }
    });

    return { 
      clonedScene: s, 
      parts: meshList, 
      originalData: data, 
      highMat: highMaterial, 
      lowMat: lowQualMaterial 
    };
  }, [scene]);

  const [hovered, setHovered] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Dragging State
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const offsetStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
      setIsAnalyzing(false);
      setDragOffset({ x: 0, y: 0 });
      setIsDragging(false);
  }, [selected]);

  // Global Drag Handlers
  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        setDragOffset({
            x: offsetStart.current.x + (e.clientX - dragStart.current.x),
            y: offsetStart.current.y + (e.clientY - dragStart.current.y)
        });
    };
    const handlePointerUp = () => setIsDragging(false);

    if (isDragging) {
        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  const onStartDrag = (e: React.PointerEvent) => {
    e.stopPropagation(); 
    e.preventDefault(); 
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    offsetStart.current = { ...dragOffset };
  };

  useEffect(() => {
    if (!parts) return;
    
    parts.forEach(mesh => {
      if (!mesh) return; 
      
      const isLow = quality === 'low';
      
      if (!mesh.userData.hasClonedMaterial || mesh.userData.qualityMode !== quality) {
         mesh.material = (isLow ? lowMat : highMat).clone();
         mesh.userData.hasClonedMaterial = true;
         mesh.userData.qualityMode = quality;
      }
      
      const mat = mesh.material as THREE.MeshStandardMaterial;

      const isSelected = selected === mesh.uuid;
      const isHovered = hovered === mesh.uuid;

      if (isSelected) {
         mat.emissive.setHex(isAnalyzing ? 0xef4444 : 0x8b5cf6); // Red/Orange pulse during analysis
         mat.emissiveIntensity = isAnalyzing ? 3.0 : 2.0; 
         mat.color.setHex(0xffffff);
      } else if (isHovered && !selected) {
         mat.emissive.setHex(0x3b82f6); 
         mat.emissiveIntensity = 0.8;
      } else {
         mat.emissive.setHex(0x000000);
         mat.emissiveIntensity = 0;
         mat.color.setHex(isLow ? 0xd4d4d8 : 0xa1a1aa); 
      }

      if (isLow) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        if (mesh.userData.size < 0.15) {
             mesh.visible = false;
        } else {
             mesh.visible = true;
        }
      } else {
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.visible = true;
      }
    });
  }, [quality, parts, highMat, lowMat, selected, hovered, isAnalyzing]);
  
  const groupRef = useRef<THREE.Group>(null);
  const timeRef = useRef(0);
  const slowMoFactor = useRef(1);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const d = Math.min(delta, 0.1);
    const targetSpeed = selected ? 0.005 : (hovered ? 0.3 : 1.0);
    slowMoFactor.current = THREE.MathUtils.lerp(slowMoFactor.current, targetSpeed, 0.06);

    timeRef.current += d * slowMoFactor.current;
    const t = timeRef.current;

    groupRef.current.rotation.y += d * 0.1 * slowMoFactor.current;
    
    // Pulse animation during analysis
    const analysisPulse = isAnalyzing ? Math.sin(state.clock.elapsedTime * 10) * 0.02 : 0;
    
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.1 + analysisPulse;
    groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.1; 
    groupRef.current.rotation.z = Math.cos(t * 0.15) * 0.05;

    const breathSpeed = 0.4;
    const breathCycle = Math.pow((Math.sin(t * breathSpeed) + 1) / 2, 3);
    const maxExpansion = 0.35;
    
    const expansionFactor = breathCycle * maxExpansion;

    if (quality === 'low' && expansionFactor < 0.01) return;
    if (!parts) return;

    parts.forEach((mesh) => {
      if (!mesh || !mesh.visible) return;
      const data = originalData.get(mesh.uuid);
      if (data) {
        const targetPos = data.pos.clone().multiplyScalar(1 + expansionFactor);
        mesh.position.copy(targetPos);
      }
    });
  });

  const handlePointerOver = (e: any) => {
      e.stopPropagation();
      setHovered(e.object.uuid);
      document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e: any) => {
      e.stopPropagation();
      setHovered(null);
      document.body.style.cursor = 'auto';
  };

  const handleClick = (e: any) => {
      e.stopPropagation();
      if (isDragging) return;

      if (selected === e.object.uuid) {
          setSelected(null);
      } else {
          setSelected(e.object.uuid);
      }
  };

  const handleMissed = () => {};

  const selectedPartMesh = parts?.find(p => p.uuid === selected);
  const isLeftSide = selectedPartMesh ? selectedPartMesh.position.x < 0 : false;
  
  const metrics = useMemo(() => {
     if (!selectedPartMesh) return null;
     const realRadiusM = selectedPartMesh.userData.realRadiusM;
     const name = selectedPartMesh.userData.name;
     const nameLower = name.toLowerCase();
     const matInfo = getMaterialInfo(name);

     let formFactor = 0.4; 
     if (nameLower.includes('block') || nameLower.includes('housing') || nameLower.includes('cover') || nameLower.includes('sump')) {
         formFactor = 0.2; 
     } else if (nameLower.includes('bolt') || nameLower.includes('screw') || nameLower.includes('pin') || nameLower.includes('valve') || nameLower.includes('rod')) {
         formFactor = 0.8; 
     } else if (nameLower.includes('piston') || nameLower.includes('gear')) {
         formFactor = 0.65; 
     }

     const diameterMm = realRadiusM * 2 * 1000;
     const volumeM3 = (4/3) * Math.PI * Math.pow(realRadiusM, 3) * formFactor;
     const densityKgM3 = matInfo.density * 1000; 
     const massKg = volumeM3 * densityKgM3;
     const massG = massKg * 1000;
     
     let massPrimary, massSecondary;
     if (massKg >= 1000) {
        massPrimary = `${(massKg / 1000).toFixed(2)} t`;
        massSecondary = `${massKg.toFixed(0)} kg`;
     } else if (massKg >= 1) {
        massPrimary = `${massKg.toFixed(2)} kg`;
        massSecondary = `${(massKg * 2.20462).toFixed(1)} lbs`;
     } else {
        massPrimary = `${massG.toFixed(0)} g`;
        massSecondary = `${(massG * 0.035274).toFixed(1)} oz`;
     }

     let sizePrimary, sizeSecondary;
     if (diameterMm >= 1000) {
        sizePrimary = `${(diameterMm / 1000).toFixed(2)} m`;
        sizeSecondary = `${(diameterMm / 1000 * 3.28084).toFixed(2)} ft`;
     } else {
        sizePrimary = `${diameterMm.toFixed(1)} mm`;
        sizeSecondary = `${(diameterMm * 0.03937).toFixed(2)} in`;
     }
     
     return {
         massPrimary,
         massSecondary,
         sizePrimary,
         sizeSecondary,
         matName: matInfo.matName
     };
  }, [selectedPartMesh]);

  const analysisStats = useMemo(() => {
      if (!selectedPartMesh) return null;
      const name = selectedPartMesh.userData.name;
      const seed = name.length;
      const matInfo = getMaterialInfo(name);
      const yieldStrength = matInfo.yield;

      return {
          stress: (yieldStrength * 0.3 + (seed * 12) % 150).toFixed(1), 
          strain: (0.05 + (seed * 0.01) % 0.1).toFixed(4),
          fatigue: ((1 + (seed % 5)) * 1.5).toFixed(1),
          deformation: (0.01 + (seed * 0.002) % 0.1).toFixed(3),
          freq: (300 + (seed * 25) % 600).toFixed(0),
          load: (yieldStrength * 0.5 + (seed * 40) % 200).toFixed(0),
          stability: (92 + (seed % 8)).toFixed(1)
      };
  }, [selectedPartMesh]);

  return (
    <Group 
        ref={groupRef} 
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
        onPointerMissed={handleMissed}
    >
        <Primitive object={clonedScene} />
        
        {selected && selectedPartMesh && metrics && (
            <Html 
                position={[
                    selectedPartMesh.position.x,
                    selectedPartMesh.position.y, 
                    selectedPartMesh.position.z
                ]} 
                zIndexRange={[100, 0]}
            >
                <div 
                  className={`pointer-events-none w-0 h-0 flex items-center ${isDragging ? '' : 'transition-transform duration-75 ease-out'} ${isLeftSide ? 'justify-end pr-48 md:pr-96' : 'justify-start pl-48 md:pl-96'}`}
                  style={{ transform: `translate(${dragOffset.x}px, ${dragOffset.y}px)` }}
                >
                   {isLeftSide ? (
                        <>
                           <div 
                             onPointerDown={onStartDrag}
                             onClick={(e) => e.stopPropagation()} 
                             className={`pointer-events-auto select-none bg-white/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-5 shadow-2xl animate-in fade-in slide-in-from-right-4 duration-300 transition-all cursor-grab active:cursor-grabbing ${isAnalyzing ? 'min-w-[420px] max-w-[480px]' : 'min-w-[200px] w-auto max-w-[320px]'}`}
                           >
                               <div className="flex justify-between items-start mb-4 gap-6">
                                   <div>
                                      <span className="text-[9px] font-bold uppercase text-purple-600 tracking-wider block mb-1 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-purple-500 ${isAnalyzing ? 'animate-ping' : 'animate-pulse'}`} />
                                        Technical Specification
                                      </span>
                                      <h3 className="text-base font-bold text-zinc-900 leading-tight">
                                          {selectedPartMesh.userData.name}
                                      </h3>
                                   </div>
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                                       className="text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 hover:bg-zinc-100 rounded-lg -mr-2 -mt-2 cursor-pointer"
                                       onPointerDown={(e) => e.stopPropagation()} 
                                   >
                                       <X size={14} />
                                   </button>
                               </div>
                               
                               <div className="space-y-3 border-t border-zinc-200/50 pt-4">
                                   <div className="grid grid-cols-2 gap-3">
                                       <div className="bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 hover:border-purple-200 transition-colors">
                                           <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">
                                              <Scale size={10} /> Mass
                                           </div>
                                           <div className="font-mono text-xs font-bold text-zinc-900 flex flex-col">
                                              <span>{metrics.massPrimary}</span>
                                              <span className="text-[10px] text-zinc-400 font-normal">{metrics.massSecondary}</span>
                                           </div>
                                       </div>
                                       <div className="bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 hover:border-purple-200 transition-colors">
                                           <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">
                                              <Ruler size={10} /> Size
                                           </div>
                                           <div className="font-mono text-xs font-bold text-zinc-900 flex flex-col">
                                              <span>{metrics.sizePrimary}</span>
                                              <span className="text-[10px] text-zinc-400 font-normal">{metrics.sizeSecondary}</span>
                                           </div>
                                       </div>
                                   </div>

                                   {isAnalyzing && analysisStats && (
                                       <div className="mt-4 pt-4 border-t border-zinc-200/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-purple-600 bg-purple-50 p-1.5 rounded-md w-fit">
                                                    <Activity size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Structural / Mechanical</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Von Mises Stress</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.stress} MPa</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Fatigue Life</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.fatigue}e7 Cyc</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Max Deformation</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.deformation} mm</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Modal Freq</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.freq} Hz</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-blue-600 bg-blue-50 p-1.5 rounded-md w-fit">
                                                    <Move size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Dynamic Motion</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-blue-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Inertial Load</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-blue-700">{analysisStats.load} N</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-blue-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Stability Index</span>
                                                        <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                                                            {analysisStats.stability}%
                                                            <CheckCircle2 size={10} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                       </div>
                                   )}
                                   
                                   <div className="space-y-2 pt-1">
                                       <div className="flex justify-between items-center text-[10px] py-1 border-b border-zinc-50">
                                           <span className="text-zinc-500 font-medium">Material Spec</span>
                                           <span className="font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">{metrics.matName}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-[10px] py-1">
                                           <span className="text-zinc-500 font-medium">Mfg Tolerance</span>
                                           <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">±0.05mm</span>
                                       </div>
                                   </div>
                               </div>
                               
                               {!isAnalyzing && (
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); setIsAnalyzing(true); }}
                                       onPointerDown={(e) => e.stopPropagation()} 
                                       className="w-full mt-4 bg-zinc-900 text-white text-[10px] uppercase font-bold py-2.5 rounded-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 cursor-pointer"
                                   >
                                       <Zap size={12} />
                                       Analyze Component
                                   </button>
                               )}
                           </div>
                        </>
                   ) : (
                        <>
                           <div className="w-32 md:w-48 h-px bg-gradient-to-r from-purple-500/50 to-transparent mr-2" />
                           <div 
                             onPointerDown={onStartDrag}
                             onClick={(e) => e.stopPropagation()} 
                             className={`pointer-events-auto select-none bg-white/95 backdrop-blur-xl border border-purple-500/20 rounded-xl p-5 shadow-2xl animate-in fade-in slide-in-from-left-4 duration-300 transition-all cursor-grab active:cursor-grabbing ${isAnalyzing ? 'min-w-[420px] max-w-[480px]' : 'min-w-[200px] w-auto max-w-[320px]'}`}
                           >
                               <div className="flex justify-between items-start mb-4 gap-6">
                                   <div>
                                      <span className="text-[9px] font-bold uppercase text-purple-600 tracking-wider block mb-1 flex items-center gap-1.5">
                                        <span className={`w-1.5 h-1.5 rounded-full bg-purple-500 ${isAnalyzing ? 'animate-ping' : 'animate-pulse'}`} />
                                        Technical Specification
                                      </span>
                                      <h3 className="text-base font-bold text-zinc-900 leading-tight">
                                          {selectedPartMesh.userData.name}
                                      </h3>
                                   </div>
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); setSelected(null); }}
                                       className="text-zinc-400 hover:text-zinc-900 transition-colors p-1.5 hover:bg-zinc-100 rounded-lg -mr-2 -mt-2 cursor-pointer"
                                       onPointerDown={(e) => e.stopPropagation()} 
                                   >
                                       <X size={14} />
                                   </button>
                               </div>
                               
                               <div className="space-y-3 border-t border-zinc-200/50 pt-4">
                                   <div className="grid grid-cols-2 gap-3">
                                       <div className="bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 hover:border-purple-200 transition-colors">
                                           <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">
                                              <Scale size={10} /> Mass
                                           </div>
                                           <div className="font-mono text-xs font-bold text-zinc-900 flex flex-col">
                                              <span>{metrics.massPrimary}</span>
                                              <span className="text-[10px] text-zinc-400 font-normal">{metrics.massSecondary}</span>
                                           </div>
                                       </div>
                                       <div className="bg-zinc-50/80 p-2.5 rounded-lg border border-zinc-100 hover:border-purple-200 transition-colors">
                                           <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 mb-1.5 font-medium uppercase tracking-wide">
                                              <Ruler size={10} /> Size
                                           </div>
                                           <div className="font-mono text-xs font-bold text-zinc-900 flex flex-col">
                                              <span>{metrics.sizePrimary}</span>
                                              <span className="text-[10px] text-zinc-400 font-normal">{metrics.sizeSecondary}</span>
                                           </div>
                                       </div>
                                   </div>

                                   {isAnalyzing && analysisStats && (
                                       <div className="mt-4 pt-4 border-t border-zinc-200/50 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-purple-600 bg-purple-50 p-1.5 rounded-md w-fit">
                                                    <Activity size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Structural / Mechanical</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Von Mises Stress</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.stress} MPa</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Fatigue Life</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.fatigue}e7 Cyc</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Max Deformation</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.deformation} mm</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-purple-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Modal Freq</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-purple-700">{analysisStats.freq} Hz</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-center gap-2 mb-2 text-blue-600 bg-blue-50 p-1.5 rounded-md w-fit">
                                                    <Move size={12} />
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">Dynamic Motion</span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-blue-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Inertial Load</span>
                                                        <span className="text-xs font-mono font-bold text-zinc-800 group-hover:text-blue-700">{analysisStats.load} N</span>
                                                    </div>
                                                    <div className="bg-zinc-50 p-2 rounded border border-zinc-100 group hover:border-blue-200 transition-colors">
                                                        <span className="text-[9px] text-zinc-500 block mb-0.5">Stability Index</span>
                                                        <span className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                                                            {analysisStats.stability}%
                                                            <CheckCircle2 size={10} />
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                       </div>
                                   )}
                                   
                                   <div className="space-y-2 pt-1">
                                       <div className="flex justify-between items-center text-[10px] py-1 border-b border-zinc-50">
                                           <span className="text-zinc-500 font-medium">Material Spec</span>
                                           <span className="font-mono text-zinc-900 bg-zinc-100 px-1.5 py-0.5 rounded">{metrics.matName}</span>
                                       </div>
                                       <div className="flex justify-between items-center text-[10px] py-1">
                                           <span className="text-zinc-500 font-medium">Mfg Tolerance</span>
                                           <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">±0.05mm</span>
                                       </div>
                                   </div>
                               </div>
                               
                               {!isAnalyzing && (
                                   <button 
                                       onClick={(e) => { e.stopPropagation(); setIsAnalyzing(true); }}
                                       onPointerDown={(e) => e.stopPropagation()} 
                                       className="w-full mt-4 bg-zinc-900 text-white text-[10px] uppercase font-bold py-2.5 rounded-lg hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 cursor-pointer"
                                   >
                                       <Zap size={12} />
                                       Analyze Component
                                   </button>
                               )}
                           </div>
                        </>
                   )}
                </div>
            </Html>
        )}
        
        {!selected && (
            <Html position={[0, -2, 0]} center>
                <div className="flex items-center gap-2 text-zinc-400 opacity-0 animate-in fade-in delay-1000 duration-1000">
                    <MousePointerClick size={14} />
                    <span className="text-[10px] uppercase tracking-widest font-medium">Click parts to inspect</span>
                </div>
            </Html>
        )}
    </Group>
  );
};

export const ThreeScene: React.FC = () => {
    return (
        <Canvas 
            shadows 
            dpr={[1, 2]} 
            camera={{ position: [5, 2.5, 5], fov: 45 }}
            gl={{ alpha: true, antialias: true }}
            className="w-full h-full"
        >
            <AmbientLight intensity={0.4} />
            <SpotLight position={[10, 10, 10]} angle={0.25} penumbra={1} intensity={1.5} castShadow />
            <PointLight position={[-10, -5, -10]} intensity={0.5} color="#eef2ff" />
            
            <Suspense fallback={<Loader />}>
                <Environment preset="city" />
                <EngineeringModel quality="high" />
                <ContactShadows resolution={1024} scale={15} blur={2.5} opacity={0.4} far={2} color="#18181b" />
            </Suspense>
            
            <EffectComposer enableNormalPass={false}>
                <Bloom luminanceThreshold={1.2} mipmapBlur intensity={0.6} radius={0.6} />
            </EffectComposer>
        </Canvas>
    );
};
