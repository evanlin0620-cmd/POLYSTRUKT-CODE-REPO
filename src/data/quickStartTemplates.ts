import { 
  Shield, 
  Cpu, 
  Compass, 
  Box, 
  Layers, 
  Workflow, 
  Disc, 
  Radio, 
  Zap, 
  Wrench,
  Anchor,
  CircleDot
} from 'lucide-react';

export interface QuickStartTemplate {
  id: string;
  name: string;
  shortName: string;
  category: 'Structural' | 'Powertrain' | 'Aerospace' | 'Robotics' | 'Fluidics' | 'Electronics';
  iconName: string;
  color: string;
  badge: string;
  description: string;
  prompt: string;
  keyDimensions: string;
  loadRating: string;
  material: string;
  tolerances: string;
  recommendedConstraints: string[];
}

export interface ConstraintTagGroup {
  category: string;
  tags: {
    label: string;
    value: string;
    description: string;
  }[];
}

export const QUICK_START_TEMPLATES: QuickStartTemplate[] = [
  {
    id: 'mechanical-arm',
    name: 'Articulated Mechanical Robotic Arm',
    shortName: 'Mechanical Arm',
    category: 'Robotics',
    iconName: 'Workflow',
    color: 'from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30',
    badge: '6-DOF Articulated',
    description: 'Multi-axis articulated robotic arm link segment with dual-clevis servo pivot knuckles, internal wiring conduit, and high-strength load bearing ribs.',
    prompt: 'Design an articulated mechanical robotic arm link (220mm reach, 45mm cross-section) featuring dual-clevis servo pivot knuckles, 2x NEMA-17 mounting faces, internal cable routing conduit, 3.5mm rib webbing, and hollowed Al-6061-T6 structure for minimal inertia.',
    keyDimensions: '220mm Reach • 45 × 35 mm Cross-section • 8mm Clevis Pins',
    loadRating: '15 N·m Joint Torque / 4.5 kg End-Effector Payload',
    material: 'Aluminium 6061-T6 / Carbon Fiber Composite',
    tolerances: 'ISO 286-2 H7 Pivot Bore',
    recommendedConstraints: ['Dual-Clevis Knuckle Joints', 'NEMA-17 Mounting Flange', 'Internal Cable Pass-through', 'Fillet Radii R3.0mm', 'Inertia Minimization Webbing']
  },
  {
    id: 'engine-block',
    name: 'Dual-Cylinder Inline Engine Block',
    shortName: 'Engine Block',
    category: 'Powertrain',
    iconName: 'Cpu',
    color: 'from-red-500/20 to-orange-500/20 text-red-400 border-red-500/30',
    badge: '180 Bar Chamber',
    description: 'Precision dual-cylinder engine block core with cross-flow coolant water jackets, crankcase web stiffeners, and 8x M8 cylinder head studs.',
    prompt: 'Model an inline cylinder engine block (140mm x 110mm x 90mm) with 68mm bore cylinder sleeves, circumferential coolant flow water jacket cavity, 8x M8 cylinder head studs, crankcase main journal bearings, and A356-T6 cast aluminum ribbed structural deck.',
    keyDimensions: '140 × 110 × 90 mm • 68mm Cylinder Bore',
    loadRating: '180 Bar Peak Combustion Pressure / 9500 RPM',
    material: 'A356-T6 Cast Aluminium / Ductile Iron Liners',
    tolerances: 'ISO 286 H6 Cylinder Bore',
    recommendedConstraints: ['68mm Precision Cylinder Bores', 'Perimeter Water Jacket Gallery', '8x M8 Head Stud Bosses', 'Crankcase Stiffening Ribs', 'High-Temp Cast A356-T6']
  },
  {
    id: 'structural-truss',
    name: 'High-Load Spaceframe Structural Truss',
    shortName: 'Structural Truss',
    category: 'Structural',
    iconName: 'Shield',
    color: 'from-cyan-500/20 to-emerald-500/20 text-cyan-400 border-cyan-500/30',
    badge: '25 kN Axial Rating',
    description: 'High-efficiency triangular Warren spaceframe structural truss with nodal pin-joint lugs, diagonal tubular bracing, and maximum stiffness-to-weight geometry.',
    prompt: 'Synthesize a high-load triangular Warren spaceframe structural truss (300mm length, 75mm depth) with diagonal lattice members at 60°, integrated end-node clevis mounting lugs (12mm pin), hollow tubular chords, and Grade 5 Titanium construction.',
    keyDimensions: '300 × 75 × 40 mm • 60° Warren Truss',
    loadRating: '25 kN Axial Tension / 18 kN Buckling Limit',
    material: 'Titanium Ti-6Al-4V Grade 5',
    tolerances: 'ISO 2768-m (±0.2mm)',
    recommendedConstraints: ['60° Warren Diagonal Webbing', '12mm End-Node Clevis Lugs', 'Hollow Tubular Chords', 'Ti-6Al-4V Grade 5', 'Buckling Resistant Ribs']
  },
  {
    id: 'l-bracket',
    name: 'Heavy-Duty Structural L-Bracket',
    shortName: 'L-Bracket',
    category: 'Structural',
    iconName: 'Shield',
    color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30',
    badge: '3.5 kN Rating',
    description: '90° load-bearing structural angle bracket with central triangular stiffening gusset and counterbored M6 bolt pattern.',
    prompt: 'Design a heavy-duty 90° structural L-bracket (80mm x 80mm x 40mm) with 6mm wall thickness, a triangular center stiffening rib/gusset, 4x M6 counterbored mounting holes (2 per flange), and 3mm stress-relief fillet radius in Al-6061-T6 alloy.',
    keyDimensions: '80 × 80 × 40 mm • 6mm Wall',
    loadRating: '3.5 kN Shear / 2.8 kN Bending',
    material: 'Aluminium 6061-T6',
    tolerances: 'ISO 2768-m (±0.2mm)',
    recommendedConstraints: ['Wall Thickness ≥ 4mm', 'Triangular Gusset Rib', '4x M6 Counterbores', 'R3.0mm Fillets', 'Al-6061-T6']
  },
  {
    id: 'gearbox-housing',
    name: 'Precision Split Gearbox Housing',
    shortName: 'Gearbox Housing',
    category: 'Powertrain',
    iconName: 'Cpu',
    color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
    badge: '180 Bar Rating',
    description: 'Two-piece split transmission enclosure with precision dual 608RS bearing seats, perimeter bolt flange, and oil seal lip.',
    prompt: 'Model a two-piece split gearbox housing for a 3:1 planetary gear set with twin 608RS (22mm OD) bearing seats, integrated oil seal lip, 6x M4 perimeter clamping bolt bosses, 4mm wall thickness, and Al-7075-T6 CNC machined construction.',
    keyDimensions: '95 × 95 × 55 mm • 22mm Bearing Seats',
    loadRating: '180 Bar Peak / 45 N·m Torque',
    material: 'Aluminium 7075-T6',
    tolerances: 'ISO 286-2 H7 Bearing Fit',
    recommendedConstraints: ['22mm Bearing Pockets', '6x M4 Bolt Flange', 'Oil Seal Lip', 'Al-7075-T6', '5-Axis CNC Clearances']
  },
  {
    id: 'aero-foil',
    name: 'Symmetric NACA 0012 Aerodynamic Foil',
    shortName: 'Aerodynamic Foil',
    category: 'Aerospace',
    iconName: 'Compass',
    color: 'from-cyan-500/20 to-sky-500/20 text-cyan-400 border-cyan-500/30',
    badge: 'CFD Optimized',
    description: 'Symmetric aerodynamic foil wing profile with 180mm chord, internal hollow spar cavity, and smooth camber spline curvature.',
    prompt: 'Generate a symmetric NACA 0012 aerodynamic foil wing section with 180mm chord length, 60mm span, internal hollow spar cavity (2.5mm skin thickness), 12° winglet sweep taper, and smooth camber spline curvature in Carbon Fiber / PEEK matrix.',
    keyDimensions: '180mm Chord • 60mm Span • 2.5mm Skin',
    loadRating: '850N Lift @ Mach 0.25',
    material: 'Carbon Fiber PEEK / Ti-6Al-4V',
    tolerances: 'ISO 2768-f (Fine Surface Splines)',
    recommendedConstraints: ['NACA 0012 Profile', '180mm Chord', 'Hollow Spar Cavity', 'Watertight Splines', 'Carbon PEEK']
  },
  {
    id: 'flanged-pipe',
    name: 'High-Pressure Flanged Manifold',
    shortName: 'Flanged Fitting',
    category: 'Fluidics',
    iconName: 'Anchor',
    color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
    badge: 'ANSI Class 150',
    description: '4-bolt flanged pipe connector with DN40 internal flow bore, raised gasket sealing face, and 316L stainless steel body.',
    prompt: 'Synthesize a 4-bolt ANSI Class 150 flanged pipe connector with DN40 internal fluid bore, 120mm flange diameter, raised face gasket ring groove, and 316L stainless steel specification.',
    keyDimensions: '120mm Flange • DN40 Bore',
    loadRating: '20 Bar Hydrostatic Proof',
    material: 'Stainless Steel 316L',
    tolerances: 'ANSI B16.5 Class 150',
    recommendedConstraints: ['DN40 Fluid Bore', '4-Bolt Flange Circle', 'Raised Face Gasket', 'Stainless 316L', 'Hydrostatic Proof']
  },
  {
    id: 'shaft-coupler',
    name: 'Zero-Backlash Flexible Shaft Coupler',
    shortName: 'Shaft Coupler',
    category: 'Powertrain',
    iconName: 'CircleDot',
    color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30',
    badge: 'Zero-Backlash',
    description: 'Spiral helical beam flexible shaft coupler for 8mm to 10mm shafts with integrated M3 clamping collar screws.',
    prompt: 'Create a flexible zero-backlash spiral beam shaft coupler with 8mm to 10mm dual bore, dual-axis helical flexure slit cuts, and integrated M3 clamping collar screws in anodized Al-7075.',
    keyDimensions: '25mm OD • 30mm Length • 8/10mm Bore',
    loadRating: '12 N·m Continuous Torque',
    material: 'Aluminium 7075-T6 Anodized',
    tolerances: 'ISO 286 H8 Shaft Bore',
    recommendedConstraints: ['8mm/10mm Dual Bore', 'Spiral Flexure Slits', 'M3 Clamping Screws', 'Zero-Backlash']
  },
  {
    id: 'pcb-enclosure',
    name: 'IP67 Waterproof PCB Enclosure',
    shortName: 'PCB Enclosure',
    category: 'Electronics',
    iconName: 'Box',
    color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
    badge: 'IP67 Sealed',
    description: 'Compact rugged electronics enclosure with snap-fit lid, continuous O-ring groove, 4x M3 PCB standoffs, and cable gland port.',
    prompt: 'Model an IP67 waterproof electronics enclosure (120x80x45mm) with snap-fit top lid, continuous O-ring perimeter sealing channel, 4x M3 internal PCB brass standoff posts, and PG9 cable gland port.',
    keyDimensions: '120 × 80 × 45 mm • 3mm Wall',
    loadRating: 'IK08 Impact / IP67 Ingress',
    material: 'Polycarbonate / ABS UL94-V0',
    tolerances: 'ISO 2768-m (±0.2mm)',
    recommendedConstraints: ['O-Ring Gasket Channel', 'M3 PCB Standoffs', 'PG9 Gland Port', 'Snap-Fit Lid', 'IP67 Sealed']
  },
  {
    id: 'suspension-rocker',
    name: 'Bionic Suspension Rocker Arm',
    shortName: 'Rocker Arm',
    category: 'Robotics',
    iconName: 'Workflow',
    color: 'from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30',
    badge: '-42% Mass',
    description: 'Topology-optimized pushrod suspension bellcrank with 3x spherical bearing eyelets (10mm ID) and mass-reduced titanium webbing.',
    prompt: 'Design a topology-optimized pushrod suspension bellcrank with 3x spherical bearing eyelet bores (10mm ID), progressive 1:1.2 motion ratio geometry, and mass-reduced Ti-6Al-4V titanium truss webbing.',
    keyDimensions: '110 × 85 × 28 mm • 10mm Eyelets',
    loadRating: '8.2 kN Static Peak Load',
    material: 'Titanium Ti-6Al-4V Grade 5',
    tolerances: 'ISO 286-2 H7 Bearing Fits',
    recommendedConstraints: ['10mm Bearing Eyelets', '1:1.2 Motion Ratio', 'Topology Truss Ribs', 'Ti-6Al-4V', 'Mass Minimization']
  },
  {
    id: 'drone-arm',
    name: 'Quadcopter Arm & Motor Mount',
    shortName: 'Drone Arm',
    category: 'Robotics',
    iconName: 'Zap',
    color: 'from-indigo-500/20 to-cyan-500/20 text-indigo-300 border-indigo-500/30',
    badge: 'Ultralight UAV',
    description: 'Vibration-damped quadcopter arm with standard 16/19mm motor pattern, hollow wiring channel, and tubular truss geometry.',
    prompt: 'Design a lightweight quadcopter arm and 2207 brushless motor mount with 16x16mm / 19x19mm M3 motor bolt pattern, hollow tubular truss lattice, wire pass-through channel, and carbon-reinforced structure.',
    keyDimensions: '140 × 32 × 24 mm • 16/19mm Pattern',
    loadRating: '2.2 kg Thrust per Arm',
    material: 'Carbon-PA12 Nylon / 3K Carbon',
    tolerances: 'ISO 2768-m',
    recommendedConstraints: ['16/19mm Motor Pattern', 'Wire Routing Channel', 'Tubular Truss Lattice', 'Vibration Damped']
  }
];

export const ENGINEERING_CONSTRAINT_GROUPS: ConstraintTagGroup[] = [
  {
    category: 'Common Shapes',
    tags: [
      { label: 'Mechanical Arm', value: 'Articulated mechanical robotic arm link with dual-clevis knuckle joints and NEMA-17 mount', description: 'Multi-axis robotic arm link' },
      { label: 'Engine Block', value: 'Dual-cylinder inline engine block with 68mm bore water jacket and 8x M8 head studs', description: 'Internal combustion engine core' },
      { label: 'Structural Truss', value: 'High-load triangular Warren spaceframe structural truss with 12mm clevis pin lugs', description: '60° spaceframe structural truss' },
      { label: 'L-Bracket', value: '90° Structural L-bracket with stiffener gusset', description: '90° angle bracket with reinforcing web' },
      { label: 'Gearbox Housing', value: 'Two-piece split gearbox housing with bearing seats', description: 'Dual-bearing transmission enclosure' },
      { label: 'Aerodynamic Foil', value: 'Symmetric aerodynamic foil wing profile with hollow spar', description: 'Low-drag airfoil section' },
      { label: 'Flanged Fitting', value: '4-bolt ANSI flanged pipe coupling with gasket ring', description: 'Pressure-rated fluid coupling' },
      { label: 'Shaft Coupler', value: 'Zero-backlash spiral beam flexible shaft coupler', description: 'Dual-bore flexure coupling' },
      { label: 'PCB Enclosure', value: 'IP67 sealed electronics housing with PCB standoffs', description: 'Weatherproof electronics shell' },
      { label: 'Rocker Arm', value: 'Topology-optimized suspension bellcrank with bearing eyelets', description: 'High-stiffness pushrod lever' }
    ]
  },
  {
    category: 'Geometric & Structural Constraints',
    tags: [
      { label: 'Watertight CSG Solid', value: 'Watertight manifold CSG solid geometry', description: 'Ensures strictly non-self-intersecting volume' },
      { label: 'Wall Thickness ≥ 3.5mm', value: 'Uniform wall thickness ≥ 3.5mm', description: 'Prevents thin-wall failure and structural sagging' },
      { label: 'Stress Fillets R2.5mm', value: 'Internal stress-relief fillet radius R2.5mm', description: 'Eliminates notch stress concentrations' },
      { label: '5kN Static Load Rating', value: '5kN static load rating with safety factor 2.2', description: 'High-load mechanical rating' },
      { label: 'Triangular Gussets', value: '45° triangular stiffening gussets', description: 'Diagonal shear load bracing' },
      { label: 'Gyroid TPMS Infill', value: 'Gyroid TPMS lattice infill with -40% mass reduction', description: 'Bionic high-strength lightweighting' }
    ]
  },
  {
    category: 'Manufacturing & Tolerances',
    tags: [
      { label: 'ISO 2768-m (Medium)', value: 'ISO 2768-m standard engineering tolerance', description: 'General machining tolerance class' },
      { label: '5-Axis CNC Clearances', value: '5-axis CNC endmill accessibility and undercut clearance', description: 'Toolpath accessible surfaces' },
      { label: 'ISO 286 H7 Hole Fit', value: 'ISO 286-2 H7 precision bearing bore tolerance', description: 'Press-fit precision cylindrical tolerance' },
      { label: 'Draft Angle 1.5°', value: '1.5° draft angle for injection mold release', description: 'Tapered vertical walls for clean part ejection' },
      { label: 'Additive Overhang < 45°', value: 'Self-supporting overhang angles < 45° for 3D printing', description: 'Support-free additive manufacturing' }
    ]
  },
  {
    category: 'Fasteners & Interfaces',
    tags: [
      { label: '4x M6 Counterbores', value: '4x M6 counterbored socket head cap screw holes', description: 'Standard M6 flush bolt mounting' },
      { label: 'M3 Threaded Inserts', value: 'M3 brass heat-set threaded insert boss pockets', description: 'Reliable reusable thread boss' },
      { label: 'O-Ring Gasket Channel', value: 'Dovetail O-ring sealing groove for IP67 gasket', description: 'Ingress protection gasket track' },
      { label: '608 Bearing Pockets', value: 'Twin 22mm OD x 7mm 608RS bearing seat pockets', description: 'Standard skate/spindle ball bearing seat' }
    ]
  },
  {
    category: 'Materials & Grades',
    tags: [
      { label: 'Al-6061-T6 Billet', value: 'Aluminium 6061-T6 structural alloy', description: 'High strength-to-weight general alloy' },
      { label: 'Al-7075-T6 Aerospace', value: 'Aluminium 7075-T6 high-yield aerospace alloy', description: 'Ultra-high yield strength 505 MPa' },
      { label: 'Ti-6Al-4V Grade 5', value: 'Titanium Ti-6Al-4V Grade 5 bionic alloy', description: 'Extreme tensile strength & corrosion resistance' },
      { label: 'Stainless 316L', value: 'Austenitic Stainless Steel 316L (marine/fluid grade)', description: 'Chemical and high-pressure fluid resistant' },
      { label: 'Carbon Fiber PEEK', value: 'Continuous carbon fiber reinforced PEEK composite', description: 'High-temperature ultra-rigid polymer' }
    ]
  }
];
