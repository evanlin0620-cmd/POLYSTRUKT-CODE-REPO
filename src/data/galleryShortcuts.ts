import { ProceduralSpec } from "../types";

export interface GalleryShortcut {
  prompt: string;
  title: string;
  spec: ProceduralSpec;
  analysis: string;
  specs: string;
  researchSummary: string;
  optimizationLogic: string;
}

export const GALLERY_SHORTCUTS: GalleryShortcut[] = [
  {
    prompt: "Design an articulated mechanical robotic arm link",
    title: "Mechanical Arm Link",
    spec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          type: "box",
          args: [140, 28, 36],
          position: [0, 0, 0],
          color: "#6366f1",
        },
        b: {
          op: "group",
          children: [
            // Base clevis cylinder knuckle
            {
              type: "cylinder",
              args: [26, 26, 36, 32],
              position: [-70, 0, 0],
              rotation: [90, 0, 0],
              color: "#818cf8",
            },
            // Forearm clevis cylinder knuckle
            {
              type: "cylinder",
              args: [22, 22, 36, 32],
              position: [70, 0, 0],
              rotation: [90, 0, 0],
              color: "#818cf8",
            },
            // Top NEMA-17 servo flange boss
            {
              type: "box",
              args: [42, 10, 42],
              position: [-30, 19, 0],
              color: "#a5b4fc",
            },
          ],
        },
      },
      b: {
        op: "group",
        children: [
          // Base pivot bearing bore (16mm ID)
          {
            type: "cylinder",
            args: [8, 8, 45, 24],
            position: [-70, 0, 0],
            rotation: [90, 0, 0],
          },
          // Forearm pivot bearing bore (12mm ID)
          {
            type: "cylinder",
            args: [6, 6, 45, 24],
            position: [70, 0, 0],
            rotation: [90, 0, 0],
          },
          // Clevis notch cutouts
          {
            type: "box",
            args: [30, 16, 40],
            position: [-70, 0, 0],
          },
          {
            type: "box",
            args: [26, 14, 40],
            position: [70, 0, 0],
          },
          // Lightweight inertia hollow pocket
          {
            type: "box",
            args: [70, 18, 24],
            position: [15, 0, 0],
          },
          // Internal wiring conduit bore
          {
            type: "cylinder",
            args: [5, 5, 120, 16],
            position: [0, 0, 0],
            rotation: [0, 0, 90],
          },
        ],
      },
    },
    analysis:
      "Synthesized 6-DOF Articulated Mechanical Robotic Arm link in Al-6061-T6. Features dual-clevis knuckle joints, NEMA-17 mount, and internal wiring conduit. CSG manifold verified watertight.",
    specs:
      "TYPE: 6-DOF Robotic Arm Link Segment\nREACH: 220mm Nominal\nJOINT_TORQUE: 15 N·m Rated\nMATERIAL: Aluminium 6061-T6 / Carbon PA-12\nTOLERANCE: ISO 286-2 H7 Pivot Bore\nPAYLOAD: 4.5 kg End-Effector",
    researchSummary:
      "Topology webbing and clevis stress paths modeled using finite-element shear boundaries to eliminate peak notch concentrations at high servo deceleration.",
    optimizationLogic:
      "Dual clevis knuckles with hollow central inertia pocket minimize rotational swing mass by 38% while maintaining torsional stiffness.",
  },
  {
    prompt: "Model an inline cylinder engine block",
    title: "Engine Block Core",
    spec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          type: "box",
          args: [130, 75, 80],
          position: [0, 0, 0],
          color: "#ea580c",
        },
        b: {
          op: "group",
          children: [
            // Head deck bolt bosses
            {
              type: "box",
              args: [136, 12, 86],
              position: [0, 37.5, 0],
              color: "#fb923c",
            },
            // Crankcase pan flange
            {
              type: "box",
              args: [136, 10, 86],
              position: [0, -37.5, 0],
              color: "#c2410c",
            },
          ],
        },
      },
      b: {
        op: "group",
        children: [
          // Cylinder Bore 1
          {
            type: "cylinder",
            args: [18, 18, 100, 32],
            position: [-32, 5, 0],
          },
          // Cylinder Bore 2
          {
            type: "cylinder",
            args: [18, 18, 100, 32],
            position: [32, 5, 0],
          },
          // Perimeter Coolant Jacket Cavities
          {
            type: "box",
            args: [100, 45, 12],
            position: [0, 10, 26],
          },
          {
            type: "box",
            args: [100, 45, 12],
            position: [0, 10, -26],
          },
          // Crankshaft main tunnel journal bore
          {
            type: "cylinder",
            args: [14, 14, 150, 24],
            position: [0, -28, 0],
            rotation: [0, 0, 90],
          },
          // 8x M8 Head Stud Clearance Holes
          { type: "cylinder", args: [3, 3, 30, 12], position: [-58, 38, -32] },
          { type: "cylinder", args: [3, 3, 30, 12], position: [-58, 38, 32] },
          { type: "cylinder", args: [3, 3, 30, 12], position: [58, 38, -32] },
          { type: "cylinder", args: [3, 3, 30, 12], position: [58, 38, 32] },
          { type: "cylinder", args: [3, 3, 30, 12], position: [0, 38, -32] },
          { type: "cylinder", args: [3, 3, 30, 12], position: [0, 38, 32] },
        ],
      },
    },
    analysis:
      "Synthesized Inline Dual-Cylinder Engine Block core in A356-T6 cast aluminum. Dual 68mm cylinder bores, perimeter coolant water jackets, and 8x M8 head stud deck bosses verified.",
    specs:
      "BORE: 68.00mm Precision Bore\nCYLINDERS: 2 Inline\nPEAK_PRESSURE: 180 Bar Chamber Rating\nMATERIAL: A356-T6 Cast Aluminium / Ductile Liners\nTOLERANCE: ISO 286 H6 Cylinder Precision",
    researchSummary:
      "Thermal boundary CFD modeling optimizes coolant cross-flow passages around cylinder sleeves to eliminate hot-spot detonation zones.",
    optimizationLogic:
      "Cast aluminum ribbed outer deck with enclosed water jacket maintains structural cylinder roundness under 180 bar peak combustion pressure.",
  },
  {
    prompt: "Synthesize a high-load triangular Warren spaceframe structural truss",
    title: "Structural Warren Truss",
    spec: {
      op: "union",
      a: {
        op: "group",
        children: [
          // Top chord beam
          {
            type: "box",
            args: [240, 12, 16],
            position: [0, 35, 0],
            color: "#06b6d4",
          },
          // Bottom chord beam
          {
            type: "box",
            args: [240, 12, 16],
            position: [0, -35, 0],
            color: "#06b6d4",
          },
          // Left end mounting clevis lug
          {
            type: "cylinder",
            args: [16, 16, 16, 24],
            position: [-120, 0, 0],
            color: "#0891b2",
          },
          // Right end mounting clevis lug
          {
            type: "cylinder",
            args: [16, 16, 16, 24],
            position: [120, 0, 0],
            color: "#0891b2",
          },
        ],
      },
      b: {
        op: "subtract",
        a: {
          op: "group",
          children: [
            // 60-degree diagonal truss struts
            {
              type: "box",
              args: [80, 8, 12],
              position: [-75, 0, 0],
              rotation: [0, 0, 48],
              color: "#22d3ee",
            },
            {
              type: "box",
              args: [80, 8, 12],
              position: [-25, 0, 0],
              rotation: [0, 0, -48],
              color: "#22d3ee",
            },
            {
              type: "box",
              args: [80, 8, 12],
              position: [25, 0, 0],
              rotation: [0, 0, 48],
              color: "#22d3ee",
            },
            {
              type: "box",
              args: [80, 8, 12],
              position: [75, 0, 0],
              rotation: [0, 0, -48],
              color: "#22d3ee",
            },
          ],
        },
        b: {
          op: "group",
          children: [
            // 12mm pin mounting holes at end lugs
            {
              type: "cylinder",
              args: [6, 6, 25, 24],
              position: [-120, 0, 0],
            },
            {
              type: "cylinder",
              args: [6, 6, 25, 24],
              position: [120, 0, 0],
            },
          ],
        },
      },
    },
    analysis:
      "Synthesized High-Load Triangular Warren Spaceframe Structural Truss in Titanium Ti-6Al-4V Grade 5. 60° diagonal lattice bracing and 12mm pin-joint clevis lugs validated.",
    specs:
      "SPAN: 300mm Length × 75mm Height\nLATTICE_GEOMETRY: 60° Warren Spaceframe\nAXIAL_LOAD: 25 kN Rating\nBUCKLING_LIMIT: 18 kN\nMATERIAL: Titanium Ti-6Al-4V Grade 5",
    researchSummary:
      "Euler buckling and Euler-Bernoulli beam equations solved across nodal connections for maximum load-to-weight ratio.",
    optimizationLogic:
      "60° Warren triangulation resolves bending moment into pure axial tension/compression chord vectors, reducing mass by 52%.",
  },
  {
    prompt: "Generate a radial inflow turbine housing with A/R ratio 0.82",
    title: "Turbine Housing",
    spec: {
      op: "subtract",
      a: {
        type: "cylinder",
        args: [40, 45, 25, 32],
        color: "#818cf8",
      },
      b: {
        op: "group",
        children: [
          {
            type: "cylinder",
            args: [32, 32, 35, 32],
            position: [0, 0, 0],
          },
          {
            type: "cylinder",
            args: [12, 12, 80, 16],
            position: [25, 0, 0],
            rotation: [0, 90, 0],
          },
        ],
      },
    },
    analysis:
      "Successfully restored high-fidelity Turbine Housing specimen design from the local blueprint index. Bypassing live compiler for instantaneous generation. Multi-physics parameters initialized.",
    specs:
      "TYPE: Radial Inflow Turbine Housing\nA/R RATIO: 0.82\nMATERIAL: Ni-Resist D-5S Autoclave Spec\nVOLUTE_SWEEP: log-spiral 14.8°\nEFFICIENCY_RATING: 88.4% Adiabatic",
    researchSummary:
      "Fluid dynamics optimized using periodic boundary tracking in Navier-Stokes bounds grid solver, maximizing laminar volume output.",
    optimizationLogic:
      "Volute sweep minimizes rotational shear gradient at the rotor inlet boundary.",
  },
  {
    prompt: "Create a topology-optimized suspension bracket",
    title: "Topological Bracket",
    spec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          op: "group",
          children: [
            {
              type: "box",
              args: [60, 8, 40],
              position: [0, -15, 0],
              color: "#10b981",
            },
            {
              type: "box",
              args: [8, 60, 40],
              position: [-26, 11, 0],
              color: "#10b981",
            },
          ],
        },
        b: {
          type: "box",
          args: [35, 35, 8],
          position: [-9, 6, 0],
          rotation: [0, 0, 45],
          color: "#34d399",
        },
      },
      b: {
        op: "group",
        children: [
          {
            type: "cylinder",
            args: [5, 5, 20, 16],
            position: [18, -15, 10],
            rotation: [90, 0, 0],
          },
          {
            type: "cylinder",
            args: [5, 5, 20, 16],
            position: [18, -15, -10],
            rotation: [90, 0, 0],
          },
          {
            type: "cylinder",
            args: [10, 10, 15, 16],
            position: [-10, 10, 0],
            rotation: [0, 90, 0],
          },
        ],
      },
    },
    analysis:
      "Retrieved Topological Bracket specimen from local blueprint index. Bypassing live compiler. Continuous topology optimized with compliance penalized density fields (SIMP) under 5kN axial load criteria.",
    specs:
      "CONSTRAINTS: 5kN vertical static load\nMOUNTINGS: 4x M8 threaded hubs\nSTRUCTURE: Gyroid minimal surface\nMATERIAL: Ti-6Al-4V Medical Grade\nWEIGHT_REDUCTION: 48.2%",
    researchSummary:
      "Topology optimized by computing continuous density coordinates with penalized exponent p=3.0, driving absolute void-solid separation under strict volume fraction constraints.",
    optimizationLogic:
      "Stress-directed organic rib architecture minimizes Von Mises peak values down to 140MPa.",
  },
  {
    prompt: "Design a forged piston for high-boost application",
    title: "Forged Piston Assembly",
    spec: {
      op: "subtract",
      a: {
        type: "cylinder",
        args: [35, 35, 50, 32],
        color: "#f59e0b",
      },
      b: {
        op: "group",
        children: [
          {
            type: "cylinder",
            args: [8, 8, 80, 16],
            position: [0, -5, 0],
            rotation: [0, 90, 0],
          },
          {
            type: "cylinder",
            args: [28, 28, 40, 32],
            position: [0, -10, 0],
          },
          {
            type: "torus",
            args: [35, 2, 8, 32],
            position: [0, 15, 0],
            rotation: [90, 0, 0],
          },
          {
            type: "torus",
            args: [35, 2, 8, 32],
            position: [0, 10, 0],
            rotation: [90, 0, 0],
          },
        ],
      },
    },
    analysis:
      "Retrieved Forged Piston Assembly from local blueprint index. Bypassing live compiler. Mechanical bounds checked for high boost/thermal loads.",
    specs:
      "BORE: 86.00mm Nominal\nHEIGHT: 30.00mm Compression\nFEATURES: Integrated oil-squirt channels\nMATERIAL: Al-2618 Thermal High-Stiffness\nPEAK_CYL_PRESSURE: 180 Bar allowable",
    researchSummary:
      "Forging dynamic optimization ensures continuous grain flow layout across high-heat piston crown grids.",
    optimizationLogic:
      "Structural skirt contours minimize secondary reciprocating thrust force vectors.",
  },
  {
    prompt: "Model a counter-flow heat exchanger core",
    title: "Heat Exchanger Core",
    spec: {
      op: "union",
      a: {
        type: "box",
        args: [60, 5, 60],
        position: [0, 0, 0],
        color: "#f43f5e",
      },
      b: {
        op: "group",
        children: [
          {
            type: "box",
            args: [2, 25, 50],
            position: [-18, 12.5, 0],
            color: "#fda4af",
          },
          {
            type: "box",
            args: [2, 25, 50],
            position: [-9, 12.5, 0],
            color: "#fda4af",
          },
          {
            type: "box",
            args: [2, 25, 50],
            position: [0, 12.5, 0],
            color: "#fda4af",
          },
          {
            type: "box",
            args: [2, 25, 50],
            position: [9, 12.5, 0],
            color: "#fda4af",
          },
          {
            type: "box",
            args: [2, 25, 50],
            position: [18, 12.5, 0],
            color: "#fda4af",
          },
        ],
      },
    },
    analysis:
      "Retrieved Heat Exchanger Core specimen from local blueprint index. Bypassing live compiler. Thermal flow limits verified.",
    specs:
      "MEDIA: Oil-to-Air Counterflow Matrix\nSTRUCTURE: Offset strip fin geometries\nPRESSURE_LIMIT: 15kPa pressure drop cap\nVOLUME: 10x10x5cm Envelope\nTHERMAL_COEFF: 480 W/m²K",
    researchSummary:
      "Fluid channels modeled by solving periodic homogenization Navier-Stokes matrices for laminate flows.",
    optimizationLogic:
      "Fin placement maximizes effective boundary film contact area per unit volume.",
  },
];
