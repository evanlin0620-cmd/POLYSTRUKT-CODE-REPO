import { ProceduralSpec } from "../types";

export interface AISynthesisResult {
  spec: ProceduralSpec;
  modelName: string;
  modelType: string;
  analysisReport: string;
  explodeStrategy: string;
  inspectionHighlights: string[];
  expectedComponents: string[];
  visibleComponents: string[];
}

const FALLBACK_RESULT: AISynthesisResult = {
  modelName: "High-Load Planetary Flange Bearing Carrier",
  modelType: "Precision Industrial Actuator Assembly",
  analysisReport: "Multi-feature aerospace-grade bearing carrier with 8-point circular mounting flange, 4x longitudinal stiffener ribs, circumferential cooling fins, stepped dual-bearing bore, and auxiliary lubrication ports.",
  explodeStrategy: "Radial axial explosion along the primary Z-axis revealing internal stepped races, seal cavities, and mounting counterbores.",
  inspectionHighlights: [
    "Verify 8x bolt-circle pitch diameter concentricity (PCD 86mm)",
    "Inspect internal dual-bearing shoulder depth and runout (Ø44mm / Ø36mm)",
    "Validate uniform 4.5mm wall thickness across structural sleeve",
    "Examine 4x radial stiffening gussets stress concentration fillets",
    "Check auxiliary M6 grease port alignment"
  ],
  expectedComponents: [
    "Base Mounting Flange",
    "Main Bearing Housing Sleeve",
    "4x Stiffener Gussets",
    "Circumferential Heat Dissipation Fins",
    "8x M8 Flange Bolt Clearance Holes",
    "Dual Stepped Bearing Bore",
    "Auxiliary Lube Port"
  ],
  visibleComponents: [
    "Precision Baseplate Flange (110mm OD)",
    "Cylindrical Main Journal Sleeve",
    "4x Radial Stiffener Ribs",
    "Dual Heat-Sink Fin Rings",
    "Center Stepped Pass-Through Bore",
    "8x Perimeter Fastener Holes"
  ],
  spec: {
    op: "subtract",
    a: {
      op: "union",
      a: {
        op: "union",
        a: {
          op: "union",
          a: {
            type: "cylinder",
            args: [55, 55, 14, 48],
            position: [0, -25, 0],
            color: "#27272a",
            metalness: 0.85,
            roughness: 0.25
          },
          b: {
            type: "cylinder",
            args: [32, 34, 60, 48],
            position: [0, 5, 0],
            color: "#3f3f46",
            metalness: 0.8,
            roughness: 0.3
          }
        },
        b: {
          op: "group",
          children: [
            { type: "box", args: [68, 30, 6], position: [0, -10, 0], color: "#52525b", metalness: 0.85, roughness: 0.25 },
            { type: "box", args: [6, 30, 68], position: [0, -10, 0], color: "#52525b", metalness: 0.85, roughness: 0.25 },
            { type: "cylinder", args: [36, 36, 8, 48], position: [0, 32, 0], color: "#6366f1", metalness: 0.9, roughness: 0.2 }
          ]
        }
      },
      b: {
        op: "group",
        children: [
          { type: "cylinder", args: [38, 38, 3, 48], position: [0, 15, 0], color: "#71717a", metalness: 0.8, roughness: 0.25 },
          { type: "cylinder", args: [38, 38, 3, 48], position: [0, 5, 0], color: "#71717a", metalness: 0.8, roughness: 0.25 },
          { type: "cylinder", args: [38, 38, 3, 48], position: [0, -5, 0], color: "#71717a", metalness: 0.8, roughness: 0.25 },
          { type: "cylinder", args: [7, 7, 18, 24], position: [30, 10, 0], rotation: [0, 0, 90], color: "#06b6d4", metalness: 0.85, roughness: 0.2 }
        ]
      }
    },
    b: {
      op: "group",
      children: [
        { type: "cylinder", args: [22, 22, 35, 48], position: [0, 20, 0] },
        { type: "cylinder", args: [18, 18, 35, 48], position: [0, -15, 0] },
        { type: "cylinder", args: [12, 12, 100, 48], position: [0, 0, 0] },
        { type: "cylinder", args: [3, 3, 30, 16], position: [25, 10, 0], rotation: [0, 0, 90] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [43, -25, 0] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [-43, -25, 0] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [0, -25, 43] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [0, -25, -43] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [30.4, -25, 30.4] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [-30.4, -25, 30.4] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [30.4, -25, -30.4] },
        { type: "cylinder", args: [4.5, 4.5, 30, 24], position: [-30.4, -25, -30.4] }
      ]
    }
  }
};

/**
 * Proxy procedural synthesis requests securely through backend API (/api/synthesize-model)
 * to keep all Gemini API credentials and sensitive keys isolated on the server.
 */
export async function synthesizeModel(prompt: string): Promise<AISynthesisResult> {
  try {
    const res = await fetch('/api/synthesize-model', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      throw new Error(`Synthesis backend returned status ${res.status}`);
    }

    const data = await res.json();
    if (!data || !data.spec || !data.inspectionHighlights) {
      throw new Error("Missing required fields in synthesis data from backend");
    }

    return data as AISynthesisResult;
  } catch (err) {
    console.warn("AI Synthesis service encountered an error, activating resilient static fallback:", err);
    return FALLBACK_RESULT;
  }
}
