/**
 * FEW-SHOT ENGINEERING EXAMPLES
 * These examples serve as 'learning data' for the Technical Synthesis Core.
 * They demonstrate logical patterns for structural optimization, weight reduction, and complex boolean synthesis.
 */

export const ENGINEERING_EXAMPLES = [
  {
    prompt: "Design a high-strength structural L-bracket with stiffener gusset and counterbored mounting holes in Al-6061.",
    thought_process: "To handle structural loads while minimizing mass, I will use an L-bracket architecture with a 45° triangular stiffening gusset. I will integrate 4x counterbored bolt holes and fillet transitions for stress reduction.",
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          op: "group",
          children: [
            { type: "box", args: [80, 8, 40], position: [0, -16, 0], color: "#6366f1" }, // Base horizontal flange
            { type: "box", args: [8, 80, 40], position: [-36, 20, 0], color: "#6366f1" } // Vertical flange
          ]
        },
        b: {
          type: "box",
          args: [40, 40, 8], // Triangular center stiffener gusset
          position: [-16, 0, 0],
          rotation: [0, 0, Math.PI / 4],
          color: "#4f46e5"
        }
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [4, 4, 20, 32], position: [20, -16, 12], rotation: [0, 0, 0] }, // Base mounting hole 1
          { type: "cylinder", args: [4, 4, 20, 32], position: [20, -16, -12], rotation: [0, 0, 0] }, // Base mounting hole 2
          { type: "cylinder", args: [4, 4, 20, 32], position: [-36, 40, 12], rotation: [0, 0, Math.PI/2] }, // Vertical hole 1
          { type: "cylinder", args: [4, 4, 20, 32], position: [-36, 40, -12], rotation: [0, 0, Math.PI/2] }  // Vertical hole 2
        ]
      }
    }
  },
  {
    prompt: "Model a precision split gearbox housing for planetary gears with 608 bearing seats and bolt flange.",
    thought_process: "Gearbox housings need rigid bearing pockets (22mm OD) for shafts and perimeter bolt flange for split clamping. Aluminum 7075-T6 offers high yield strength.",
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: { type: "cylinder", args: [35, 35, 45, 64], position: [0, 0, 0], color: "#f59e0b" }, // Main gearbox cylindrical core
        b: { type: "box", args: [80, 10, 80], position: [0, 0, 0], color: "#d97706" } // Perimeter split flange
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [26, 26, 50, 64], position: [0, 0, 0] }, // Main gear cavity
          { type: "cylinder", args: [11, 11, 60, 32], position: [0, 0, 0] }, // 22mm (r=11) Bearing seat
          ...Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return {
              type: "cylinder",
              args: [3, 3, 20, 16],
              position: [Math.cos(angle) * 32, 0, Math.sin(angle) * 32]
            };
          })
        ]
      }
    }
  },
  {
    prompt: "Generate a symmetric aerodynamic foil wing section with hollow internal spar.",
    thought_process: "Aerodynamic foils use streamlined camber profiles with a rounded leading edge and tapered trailing edge. A hollow inner core reduces weight while maintaining torsional stiffness.",
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: { type: "cylinder", args: [12, 12, 60, 32], position: [-25, 0, 0], color: "#06b6d4" }, // Leading edge cylinder
        b: {
          type: "box",
          args: [60, 8, 60],
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          color: "#0891b2"
        }
      },
      b: {
        type: "cylinder",
        args: [6, 6, 70, 32],
        position: [-10, 0, 0] // Hollow structural spar channel
      }
    }
  },
  {
    prompt: "Synthesize a 4-bolt ANSI Class 150 flanged pipe connector with DN40 bore in 316L.",
    thought_process: "Flanged fluid fittings require a center flow bore, raised gasket sealing face, and 4-bolt perimeter mounting circle in corrosion-resistant 316L stainless steel.",
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: { type: "cylinder", args: [28, 28, 50, 48], position: [0, 0, 0], color: "#10b981" }, // Pipe body
        b: { type: "cylinder", args: [50, 50, 14, 48], position: [0, 18, 0], color: "#059669" } // Flange disc
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [18, 18, 70, 48], position: [0, 0, 0] }, // DN40 fluid bore (r=18-20)
          ...Array.from({ length: 4 }).map((_, i) => {
            const angle = (i / 4) * Math.PI * 2;
            return {
              type: "cylinder",
              args: [5, 5, 30, 24],
              position: [Math.cos(angle) * 38, 18, Math.sin(angle) * 38] // 4-bolt pattern
            };
          })
        ]
      }
    }
  },
  {
    prompt: "Design a high-precision multi-stage planetary gearbox assembly with bearing carrier, 8-bolt flange, and cooling fins.",
    thought_process: "High-torque planetary drives require a rigid outer casing with circumferential heat sink fins, an 8-bolt mounting flange, central stepped bearing pocket, and planetary gear carrier.",
    proceduralSpec: {
      op: "group",
      children: [
        // Main gear housing with bore
        {
          op: "subtract",
          a: { type: "cylinder", args: [40, 40, 50, 48], position: [0, 0, 0], color: "#3b82f6" },
          b: { type: "cylinder", args: [32, 32, 54, 48], position: [0, 0, 0] }
        },
        // 8-bolt mounting flange
        {
          type: "flange",
          args: [54, 30, 10, 46, 8, 3],
          position: [0, -25, 0],
          rotation: [90, 0, 0],
          color: "#2563eb"
        },
        // Bronze bearing sleeve
        {
          type: "tube",
          args: [18, 12, 25, 32],
          position: [0, 0, 0],
          rotation: [90, 0, 0],
          color: "#f59e0b"
        },
        // Central sun gear
        {
          type: "gear",
          args: [16, 8, 14, 6],
          position: [0, 5, 0],
          rotation: [90, 0, 0],
          color: "#cbd5e1"
        },
        // 4x circumferential cooling fins
        ...[-12, -4, 4, 12].map(y => ({
          type: "tube",
          args: [44, 40, 2, 48],
          position: [0, y, 0],
          rotation: [90, 0, 0],
          color: "#60a5fa"
        }))
      ]
    }
  }
];
