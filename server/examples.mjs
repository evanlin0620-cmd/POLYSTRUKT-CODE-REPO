/**
 * FEW-SHOT ENGINEERING EXAMPLES
 * These examples serve as 'learning data' for the Technical Synthesis Core.
 * They demonstrate logical patterns for structural optimization, weight reduction, and complex boolean synthesis.
 */

export const ENGINEERING_EXAMPLES = [
  {
    prompt: "Design a high-strength structural bracket for a 50kN load with extreme weight reduction.",
    thought_process: "To handle 50kN while reducing weight, I must use a triangulated truss-like structure. An L-shaped base with a central web (rib) is standard, but I will optimize it using a Voronoi-inspired subtraction pattern for superior strength-to-weight ratio. Material should be AISI 4140 Steel due to high yield requirements.",
    proceduralSpec: {
      op: "subtract",
      a: {
        op: "union",
        a: {
          op: "group",
          children: [
            { type: "box", args: [100, 10, 50], position: [0, -20, 0], color: "#4f46e5" }, // Base plate
            { type: "box", args: [10, 100, 50], position: [-45, 25, 0], color: "#4f46e5" } // Vertical plate
          ]
        },
        b: {
          type: "box",
          args: [60, 60, 10], // Structural rib
          position: [-10, 10, 0],
          rotation: [0, 0, Math.PI / 4],
          color: "#6366f1"
        }
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [8, 8, 30, 32], position: [30, -20, 15], rotation: [Math.PI/2, 0, 0] }, // Mounting hole 1
          { type: "cylinder", args: [8, 8, 30, 32], position: [30, -20, -15], rotation: [Math.PI/2, 0, 0] }, // Mounting hole 2
          { type: "cylinder", args: [15, 15, 20, 32], position: [-15, 15, 0], rotation: [0, Math.PI/2, 0] } // Center weight reduction
        ]
      }
    }
  },
  {
    prompt: "Create a lightweight heat sink for a high-performance optic unit.",
    thought_process: "Heat sinks require high surface area for convection. Aluminum 6061-T6 is ideal for thermal conductivity. I will use a finned array pattern. Instead of simple extrusions, I'll use a tapered 'pin-fin' topology which improves air turbulence and heat dissipation.",
    proceduralSpec: {
      op: "union",
      a: { type: "box", args: [80, 5, 80], position: [0, 0, 0], color: "#94a3b8" }, // Base plate
      b: {
        op: "group",
        children: Array.from({ length: 25 }).map((_, i) => {
          const x = (i % 5 - 2) * 15;
          const z = (Math.floor(i / 5) - 2) * 15;
          return {
            type: "cone",
            args: [3, 40, 16],
            position: [x, 20, z],
            color: "#cbd5e1"
          };
        })
      }
    }
  },
  {
    prompt: "Design a planetary gear housing unit.",
    thought_process: "Planetary housings must be perfectly cylindrical and contain internal space for gear clearance. I'll use a thick-walled cylinder subtractively optimized. Titanium Grade 5 is chosen for extreme durability and low weight in high-torque environments.",
    proceduralSpec: {
      op: "subtract",
      a: {
        type: "cylinder",
        args: [60, 60, 40, 64],
        color: "#334155"
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [50, 50, 50, 64], position: [0, 5, 0] }, // Main internal cavity
          { type: "cylinder", args: [10, 10, 60, 32] }, // Center shaft hole
          // Bolt pattern
          ...Array.from({ length: 6 }).map((_, i) => {
            const angle = (i / 6) * Math.PI * 2;
            return {
              type: "cylinder",
              args: [4, 4, 100, 16],
              position: [Math.cos(angle) * 55, 0, Math.sin(angle) * 55]
            };
          })
        ]
      }
    }
  }
];
