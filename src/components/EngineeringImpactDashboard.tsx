import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Activity, 
  Cpu, 
  Zap, 
  Leaf, 
  DollarSign, 
  Scale, 
  Info, 
  Sliders, 
  BarChart2, 
  Award,
  Trees,
  TrendingUp,
  Boxes,
  Compass,
  FileSpreadsheet
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  RadialBarChart, 
  RadialBar,
  Cell
} from 'recharts';

interface EngineeringImpactDashboardProps {
  onClose: () => void;
  currentDesign?: any;
  selectedMaterial?: any;
  dimensions?: { length: number; width: number; height: number };
}

export const EngineeringImpactDashboard: React.FC<EngineeringImpactDashboardProps> = ({ 
  onClose, 
  currentDesign,
  selectedMaterial = { id: 'titanium_grade_5', name: 'Titanium Grade 5', costPerKg: 120, density: 4430 },
  dimensions = { length: 150, width: 100, height: 50 } 
}) => {
  const [metricView, setMetricView] = useState<'all' | 'materials' | 'sustainability' | 'complexity'>('all');
  const [simulationSpeedMultiplier, setSimulationSpeedMultiplier] = useState<number>(1.0);

  // Derive active design context values
  const activeMass = useMemo(() => {
    const vol = (dimensions.length * dimensions.width * dimensions.height) / 1000000; // liters
    const dens = selectedMaterial?.density || 4430; // kg/m3 (4430 is Ti-Grade-5)
    // Hypothetical structural volume utilization is 12% for biomorphic optimization
    const volumeFraction = currentDesign?.isolatedComponent ? 0.08 : 0.14;
    return parseFloat((vol * volumeFraction * (dens / 1000) * 1000).toFixed(2)); // grams
  }, [dimensions, selectedMaterial, currentDesign]);

  const rawUnoptimizedMass = useMemo(() => {
    // Before topology optimization, the solid bounding box with simple margins
    const vol = (dimensions.length * dimensions.width * dimensions.height) / 1000000;
    const baseDensity = selectedMaterial?.density || 4430;
    return parseFloat((vol * 0.45 * (baseDensity / 1000) * 1000).toFixed(2)); // grams
  }, [dimensions, selectedMaterial]);

  const weightReductionPercentage = useMemo(() => {
    if (rawUnoptimizedMass <= 0) return 0;
    const diff = rawUnoptimizedMass - activeMass;
    return parseFloat(((diff / rawUnoptimizedMass) * 100).toFixed(1));
  }, [activeMass, rawUnoptimizedMass]);

  // Cost per unit (material cost)
  const partCost = useMemo(() => {
    const costKg = selectedMaterial?.costPerKg || 120;
    return parseFloat(((activeMass / 1000) * costKg).toFixed(2));
  }, [activeMass, selectedMaterial]);

  // Carbon footprint estimation (kg CO2 per part) based on material production lifecycle emissions
  const carbonFootprint = useMemo(() => {
    let carbonMultiplier = 11.2; // Titanium
    const matId = selectedMaterial?.id || '';
    if (matId.includes('steel')) carbonMultiplier = 2.4;
    else if (matId.includes('aluminum')) carbonMultiplier = 8.5;
    else if (matId.includes('carbon')) carbonMultiplier = 19.5;
    else if (matId.includes('plastic') || matId.includes('abs')) carbonMultiplier = 3.1;
    
    return parseFloat(((activeMass / 1000) * carbonMultiplier).toFixed(2));
  }, [activeMass, selectedMaterial]);

  // Simulated material sourcing baseline data for different options under the identical dimensions
  const materialSourcingComparisonData = useMemo(() => {
    const vol = (dimensions.length * dimensions.width * dimensions.height) / 1000000;
    const materialsList = [
      { id: 'titanium_grade_5', name: 'Titanium G5', density: 4430, costKg: 120, co2Kg: 11.2, strength: 950 },
      { id: 'steel_304', name: 'Stainless 304', density: 8000, costKg: 18, co2Kg: 2.4, strength: 505 },
      { id: 'carbon_fiber', name: 'Carbon Fiber', density: 1600, costKg: 150, co2Kg: 19.5, strength: 1200 },
      { id: 'aluminum_6061', name: 'Aluminum 6061', density: 2700, costKg: 32, co2Kg: 8.5, strength: 310 },
      { id: 'abs_plastic', name: 'ABS Plastic', density: 1040, costKg: 8, co2Kg: 3.1, strength: 40 }
    ];

    return materialsList.map(m => {
      const volFraction = currentDesign?.isolatedComponent ? 0.08 : 0.14;
      const mass = vol * volFraction * (m.density / 1000) * 1000; // grams
      const cost = (mass / 1000) * m.costKg;
      const co2 = (mass / 1000) * m.co2Kg;
      const strengthToWeight = parseFloat((m.strength / (m.density / 1000)).toFixed(1));

      return {
        name: m.name,
        Mass: parseFloat((mass / 1000).toFixed(3)), // kg
        Cost: parseFloat(cost.toFixed(1)), // USD
        Carbon: parseFloat(co2.toFixed(1)), // kg CO2
        StrengthRatio: strengthToWeight,
        isSelected: selectedMaterial?.id === m.id
      };
    });
  }, [dimensions, selectedMaterial, currentDesign]);

  // Simulated project historical evolution data
  const historicalBaselineData = [
    { name: 'v1: Valve Cover', Complexity: 45, VolumeSaved: 18.2, CNC_Time: 34, Mass: 2.1, Carbon: 8.4 },
    { name: 'v2: Suspension Arm', Complexity: 112, VolumeSaved: 34.5, CNC_Time: 52, Mass: 1.45, Carbon: 12.3 },
    { name: 'v3: Turbo Impeller', Complexity: 280, VolumeSaved: 41.2, CNC_Time: 78, Mass: 0.82, Carbon: 6.8 },
    { name: 'v4: Heat Exchanger', Complexity: 340, VolumeSaved: 44.8, CNC_Time: 95, Mass: 1.15, Carbon: 2.7 },
    { 
      name: `vCurrent: ${currentDesign?.isolatedComponent || 'Active Design'}`, 
      Complexity: currentDesign?.isolatedComponent ? 440 : 180, 
      VolumeSaved: weightReductionPercentage, 
      CNC_Time: currentDesign?.isolatedComponent ? 110 : 45, 
      Mass: parseFloat((activeMass / 1000).toFixed(3)), 
      Carbon: carbonFootprint 
    }
  ];

  // Dynamic Sustainability Index Score calculation
  const sustainabilityScore = useMemo(() => {
    // Higher weight reduction, lower carbon emission, and better recycling potential of metallic options yields higher score
    const weightFactor = Math.min(weightReductionPercentage * 0.45, 45); // up to 45 pts
    
    let materialScore = 20; // Default titanium has high manufacturing footprints
    const matId = selectedMaterial?.id || '';
    if (matId.includes('aluminum')) materialScore = 32; // Highly recyclable
    else if (matId.includes('steel')) materialScore = 28;
    else if (matId.includes('carbon')) materialScore = 15; // Extremely high processing impact
    else if (matId.includes('abs')) materialScore = 25;

    const dimensionsPenalty = Math.max(0, 15 - (dimensions.length * dimensions.width * dimensions.height) / 300000); // larger builds cost more energy
    const scoreVal = Math.round(weightFactor + materialScore + dimensionsPenalty + 20); // base + adaptive bonus
    return Math.min(scoreVal, 100);
  }, [weightReductionPercentage, selectedMaterial, dimensions]);

  // Radial chart structure for Score overview
  const radialScoreData = [
    {
      name: 'Sustainability',
      value: sustainabilityScore,
      fill: '#10b981',
    }
  ];

  const carbonOffsetEquivalency = useMemo(() => {
    // Estimated trees planted equivalent to carbon saved on topology optimization compared to standard fabrication
    const co2SavedKg = ((rawUnoptimizedMass - activeMass) / 1000) * 8.5; // average comparative carbon efficiency bounds
    return parseFloat((co2SavedKg / 22.0).toFixed(2)); // 1 mature tree absorbs ~22kg of CO2 per year
  }, [activeMass, rawUnoptimizedMass]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] bg-zinc-950/95 backdrop-blur-3xl overflow-y-auto p-6 font-sans border border-white/5"
    >
      {/* Dashboard Top Header Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-5 mb-6 select-none gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/10 rounded-2xl border border-indigo-500/30 text-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.15)]">
            <BarChart2 size={24} className="animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black uppercase tracking-[0.25em] text-white">Engineering Impact Analytics</h1>
              <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-mono text-[8px] px-2 py-0.5 rounded-full uppercase font-black uppercase tracking-[0.1em]">Metric Kernel v3.1</span>
            </div>
            <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest mt-1">
              Topological Optimization Synthesis // Sourcing Life Cycle Assessment // Multi-Project Resource Benchmarks
            </p>
          </div>
        </div>

        {/* Filters/Navigation tabs inside the dashboard */}
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 border border-white/5 p-1 rounded-xl flex gap-1">
            {[
              { id: 'all', label: 'All Metrics', icon: Boxes },
              { id: 'materials', label: 'Materials', icon: Scale },
              { id: 'sustainability', label: 'Sustainability', icon: Leaf },
              { id: 'complexity', label: 'Complexity', icon: Cpu }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMetricView(tab.id as any)}
                className={`py-1.5 px-3 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  metricView === tab.id 
                    ? 'bg-zinc-800 text-indigo-400 font-extrabold shadow-sm' 
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <tab.icon size={11} />
                {tab.label}
              </button>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2.5 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-white rounded-full text-zinc-400 transition-all cursor-pointer shadow-md"
          >
            <X size={16} />
          </motion.button>
        </div>
      </div>

      {/* Main Grid View */}
      <div className="space-y-6">
        {/* Core KPI Banner Card Panels */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/5 p-5 rounded-3xl relative overflow-hidden group hover:border-cyan-500/20 transition-all duration-300 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
            <div className="flex justify-between items-start mb-3 select-none">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Active Model Mass</span>
              <Scale size={14} className="text-cyan-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">
              {activeMass >= 1000 ? `${(activeMass / 1000).toFixed(2)} kg` : `${activeMass} g`}
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 mt-2 uppercase tracking-wide">
              Selected: <b className="text-white">{selectedMaterial?.name || 'Metal'}</b>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/5 p-5 rounded-3xl relative overflow-hidden group hover:border-emerald-500/20 transition-all duration-300 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
            <div className="flex justify-between items-start mb-3 select-none">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Mass Savings Factor</span>
              <Zap size={14} className="text-emerald-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight font-display text-emerald-400">
              {weightReductionPercentage > 0 ? `${weightReductionPercentage}%` : "Calculating..."}
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 mt-2 uppercase tracking-wide">
              Original Draft: <b className="text-white">{(rawUnoptimizedMass / 1000).toFixed(2)} kg</b>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/5 p-5 rounded-3xl relative overflow-hidden group hover:border-indigo-500/20 transition-all duration-300 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
            <div className="flex justify-between items-start mb-3 select-none">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Carbon Footprint</span>
              <Leaf size={14} className="text-indigo-400 animate-pulse" />
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">
              {carbonFootprint} kg
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 mt-2 uppercase tracking-wide">
              CO₂ eq / unit • <b className="text-emerald-400">~{carbonOffsetEquivalency} Trees Offset</b>
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-900/80 to-zinc-950 border border-white/5 p-5 rounded-3xl relative overflow-hidden group hover:border-amber-500/20 transition-all duration-300 shadow-xl"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-all" />
            <div className="flex justify-between items-start mb-3 select-none">
              <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest">Part Sourcing Cost</span>
              <DollarSign size={14} className="text-amber-400" />
            </div>
            <div className="text-2xl md:text-3xl font-black tracking-tight font-display text-white">
              ${partCost}
            </div>
            <p className="text-[9.5px] font-mono text-zinc-500 mt-2 uppercase tracking-wide font-bold">
              EST. Alloy Material cost under spec
            </p>
          </motion.div>
        </div>

        {/* Detailed Chart Breakdown Sections based on active view filters */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Area Chart: Resource Efficiency (Material / Mass optimization) */}
          {(metricView === 'all' || metricView === 'sustainability') && (
            <motion.div 
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="xl:col-span-2 bg-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <TrendingUp size={14} className="text-cyan-400" /> Project Evolution: Mass & Carbon Performance
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Comparing total mass reduction vs. environmental CO₂ emissions across design timeline</p>
                </div>
                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-400/10 rounded-full text-[8px] font-bold text-cyan-400 uppercase tracking-wider">
                    Unoptimized Mass: {(rawUnoptimizedMass / 1000).toFixed(2)} kg
                  </span>
                </div>
              </div>

              {/* Chart container */}
              <div className="relative w-full h-[260px] md:h-[290px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalBaselineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorMass" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCarbon" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={8} 
                      fontFamily="monospace"
                      tickLine={false} 
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      fontFamily="monospace"
                      tickLine={false} 
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '10px', color: '#a1a1aa' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Area 
                      type="monotone" 
                      dataKey="Mass" 
                      name="Fitted Mass (kg)"
                      stroke="#22d3ee" 
                      fillOpacity={1} 
                      fill="url(#colorMass)" 
                      strokeWidth={2}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="Carbon" 
                      name="Production CO₂ (kg)"
                      stroke="#818cf8" 
                      fillOpacity={1} 
                      fill="url(#colorCarbon)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Radial Sustainability Score & Dynamic Circular Gauge */}
          {(metricView === 'all' || metricView === 'sustainability') && (
            <motion.div 
              layout
              className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Award size={14} className="text-emerald-400" /> Life Cycle Sustainability Index
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Evaluates design volume efficiency, material chemistry and carbon offset rates</p>
              </div>

              {/* Radial Score Gauge */}
              <div className="relative flex items-center justify-center my-6 h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart 
                    cx="50%" 
                    cy="50%" 
                    innerRadius="70%" 
                    outerRadius="100%" 
                    barSize={12} 
                    data={radialScoreData}
                    startAngle={225}
                    endAngle={-45}
                  >
                    <RadialBar
                      background={{ fill: 'rgba(255,255,255,0.03)' }}
                      dataKey="value"
                    >
                      <Cell fill={sustainabilityScore > 80 ? '#10b981' : sustainabilityScore > 50 ? '#818cf8' : '#f59e0b'} />
                    </RadialBar>
                  </RadialBarChart>
                </ResponsiveContainer>
                
                {/* Center score indicator block */}
                <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center select-none">
                  <div className="text-4xl md:text-5xl font-black font-display tracking-tight text-white mb-1">
                    {sustainabilityScore}
                  </div>
                  <span className="text-[8.5px] font-mono font-black text-zinc-500 uppercase tracking-[0.2em]">Score out of 100</span>
                </div>
              </div>

              <div className="bg-zinc-950 border border-white/5 rounded-2xl p-4 space-y-3.5">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-zinc-500 uppercase font-black">Environmental Tier Check</span>
                  <span className={`font-black ${sustainabilityScore > 80 ? 'text-emerald-400' : sustainabilityScore > 50 ? 'text-indigo-400' : 'text-amber-500'}`}>
                    {sustainabilityScore > 80 ? 'CLASS_A_NOMINAL' : sustainabilityScore > 50 ? 'CLASS_B_VERIFIED' : 'CLASS_C_COARSE'}
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-[10px] text-zinc-400 leading-relaxed italic uppercase font-technical text-center">
                  “Biomorphic topology trims active volume by {weightReductionPercentage}%, saving critical tooling stress and raw ore refining carbon output.”
                </p>
              </div>
            </motion.div>
          )}

          {/* Bar Chart: Sourcing & Cost Optimization Breakdown */}
          {(metricView === 'all' || metricView === 'materials') && (
            <motion.div 
              layout
              className="xl:col-span-2 bg-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                    <Scale size={14} className="text-cyan-400" /> Multi-Material Sourcing Tradeoffs (L-W-H Spec)
                  </h3>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Interactive simulation comparing Part Mass, Sourcing Cost, and carbon profiles across alloy grades</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  <span className="text-[8.5px] font-mono text-zinc-400 uppercase tracking-widest">Active Choice: {selectedMaterial?.name}</span>
                </div>
              </div>

              {/* Bar Chart Sourcing */}
              <div className="relative w-full h-[250px] md:h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={materialSourcingComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={8.5} 
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '10px', color: '#a1a1aa' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Bar dataKey="Cost" name="Material Cost ($)" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                      {materialSourcingComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isSelected ? '#818cf8' : '#f59e0b'} 
                          stroke={entry.isSelected ? '#a5b4fc' : undefined}
                          strokeWidth={entry.isSelected ? 1.5 : 0}
                        />
                      ))}
                    </Bar>
                    <Bar dataKey="Carbon" name="Processing CO₂ (kg)" fill="#10b981" radius={[4, 4, 0, 0]}>
                      {materialSourcingComparisonData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.isSelected ? '#22d3ee' : '#10b981'} 
                          stroke={entry.isSelected ? '#67e8f9' : undefined}
                          strokeWidth={entry.isSelected ? 1.5 : 0}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {/* Line Chart: Geometry Complexity & Growth Curve */}
          {(metricView === 'all' || metricView === 'complexity') && (
            <motion.div 
              layout
              className="bg-zinc-900 border border-white/5 rounded-[2rem] p-6 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                  <Cpu size={14} className="text-pink-400" /> Geometric Synthesis Complexity
                </h3>
                <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-1">Growth tracking of computational nodes and toolpath solver constraints over evolutionary timeline</p>
              </div>

              {/* Line Complexity Chart */}
              <div className="relative w-full h-[220px] md:h-[250px] my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalBaselineData} margin={{ top: 10, right: 15, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#52525b" 
                      fontSize={8} 
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#52525b" 
                      fontSize={8} 
                      fontFamily="monospace"
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                      labelStyle={{ color: '#fff', fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }}
                      itemStyle={{ fontSize: '10px', color: '#a1a1aa' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '9px', textTransform: 'uppercase', fontFamily: 'monospace', paddingTop: '10px' }} />
                    <Line 
                      type="monotone" 
                      dataKey="Complexity" 
                      name="CSG Feature Blocks"
                      stroke="#ec4899" 
                      strokeWidth={2}
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="CNC_Time" 
                      name="CNC Toolpath (Mins)"
                      stroke="#a855f7" 
                      strokeWidth={2}
                      dot={{ r: 4 }} 
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-zinc-950 border border-white/5 rounded-2xl p-3 flex justify-between items-center text-[10px] font-mono">
                <span className="text-zinc-500 uppercase">Interactive simulation sweep</span>
                <div className="flex gap-1.5 items-center">
                  <button onClick={() => setSimulationSpeedMultiplier(prev => Math.max(0.5, prev - 0.25))} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-400 hover:text-white">-</button>
                  <span className="text-purple-400 font-bold px-1">{simulationSpeedMultiplier.toFixed(2)}x</span>
                  <button onClick={() => setSimulationSpeedMultiplier(prev => Math.min(3.0, prev + 0.25))} className="px-1.5 py-0.5 bg-white/5 border border-white/5 rounded text-zinc-400 hover:text-white">+</button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Informational card */}
          <div className="xl:col-span-3 bg-zinc-900 border border-white/5 rounded-[2rem] p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl">
            <div className="p-4 bg-gradient-to-tr from-[#10b981]/20 to-[#818cf8]/10 rounded-2xl border border-emerald-500/20 text-emerald-400 shrink-0">
              <Trees size={32} />
            </div>
            <div>
              <p className="text-xs font-black uppercase text-white tracking-[0.2em] mb-1.5">Algorithmic Resource & Mass Savings Standard</p>
              <p className="text-xs text-zinc-400 leading-relaxed font-technical uppercase tracking-wider">
                Industrial CAD synthesis utilizes continuous stress-mapping parameters (von Mises calculations) to isolate non-loadbearing physical material coordinates. This design system generates a <strong className="text-emerald-400">Class-A structural envelope</strong> preserving maximum stiffness while reducing refined alloy consumption. The resultant reduction translates to lowered environmental forging energy footprints, reduced fabrication scrap, and optimized product lifecycle payloads.
              </p>
            </div>
          </div>

        </div>
      </div>
    </motion.div>
  );
};
