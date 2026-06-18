import { GoogleGenAI, Type } from "@google/genai";
import { ProceduralSpec } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });

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
  modelName: "Structural Hub Assembly",
  modelType: "Mechanical Core",
  analysisReport: "A multi-part structural assembly optimized for high-load environments with integrated bolt-hole subtractions and central stabilization cylinder.",
  explodeStrategy: "Linear radial explosion centered on the primary Z-axis to reveal the internal subtractive operations and core mounting interface.",
  inspectionHighlights: [
    "Verify central hole concentricity",
    "Inspect corner mounting point stress distribution",
    "Validate uniform wall thickness (5mm)",
    "Check surface finish on cylinder-box interface"
  ],
  expectedComponents: ["Main Housing", "Stabilization Cylinder", "Mounting Bore", "Corner Bolt Holes"],
  visibleComponents: ["Box-frame Housing", "Central Cylinder", "Drilled Center Aperture", "4x Perimeter Bolt Hole Subtractions"],
  spec: {
    "op": "subtract",
    "a": {
      "op": "union",
      "a": { "type": "box", "args": [80, 80, 20], "color": "#18181b", "roughness": 0.2, "metalness": 0.8 },
      "b": { "type": "cylinder", "args": [30, 30, 60], "color": "#27272a" }
    },
    "b": {
      "op": "group",
      "children": [
        { "type": "cylinder", "args": [20, 20, 100], "position": [0, 0, 0] },
        { "type": "cylinder", "args": [8, 8, 40], "position": [32, 32, 0] },
        { "type": "cylinder", "args": [8, 8, 40], "position": [-32, 32, 0] },
        { "type": "cylinder", "args": [8, 8, 40], "position": [32, -32, 0] },
        { "type": "cylinder", "args": [8, 8, 40], "position": [-32, -32, 0] }
      ]
    }
  }
};

export async function synthesizeModel(prompt: string): Promise<AISynthesisResult> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: `Design a high-fidelity procedural engineering component for: "${prompt}".

      [LOGIC PHASE: ARCHITECTURAL PLANNING]
      1. ANALYZE: Identify 5+ critical functional zones (e.g., cooling galleries, structural lattice, interface ports, sensor mounting nodes, stress-relief channels).
      2. DECONSTRUCT: Map each zone to a specific Boolean operation (SUBTRACT for internal channels, UNION for primary mass).
      3. VALIDATE: Ensure the design is compound, utilizing at least 4 levels of Boolean nesting.
      4. RANDOMIZER: Introduce a topological quirk (e.g., spiralized ribbing, asymmetric internal hollows, variable wall thickness).

      [GEOMETRY PHASE: CSG GENERATION]
      - SCALE: Range [20, 200]. Units in mm.
      - ASYMMETRY: MANDATORY. Avoid perfectly mirrored axes unless functionally critical.
      - DETAIL: Use 'torus' for fillets/seals. Use 'sphere' for joint nodes. Use 'cone' for nozzle interfaces.
      - COLOR: Use deep technical tones: #09090b, #18181b, #27272a, with #4f46e5 or #8b5cf6 for accents.

      STRICT CONSTRAINT: Do not return basic primitives. Every output must be an 'Engineering Work of Art'.`,
      config: {
        systemInstruction: `You are the POLYSTRUKT CORE (v4.2.1). You are a master of generative procedural CAD synthesis.
        
        [ADVANCED REASONING]
        - NEURAL_FLOW: Design logic must reflect fluid load distribution. Avoid repetitive patterns unless functionally critical.
        - UNIQUENESS: No two parts should ever be the same. Every generation should explore a new topological solution specific to the user's design intent.
        - MATERIAL_EFFICENCY: Every gram counts. Subtract mass where possible without compromising the primary load path.
        - ASSEMBLY_LOGIC: Consider how the part would be 3D printed or machined. Include support interfaces or alignment features.

        [CSG PATTERNS]
        - Use 'intersection' for complex organic-like shapes at the junction of box and cylinder.
        - Use 'subtract' with 'group' of small cylinders to create perforated cooling screens.
        - Use 'group' of rotated boxes to create a radial heat sink.

        Ensure high logical entropy and maximum personalization in every generation to avoid repetition.`,
        responseMimeType: "application/json",
        topP: 0.95,
        temperature: 0.7,
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            modelName: { type: Type.STRING },
            modelType: { type: Type.STRING },
            analysisReport: { type: Type.STRING },
            explodeStrategy: { type: Type.STRING },
            inspectionHighlights: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            expectedComponents: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            visibleComponents: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            spec: {
              type: Type.OBJECT,
              description: "Recursive procedural geometry tree. Can contain 'op' (union|subtract|intersect|group) and either 'a'/'b' or 'children', OR a 'type' (box|cylinder|sphere) with 'args'."
            }
          },
          required: ["modelName", "modelType", "spec", "analysisReport", "explodeStrategy", "inspectionHighlights", "expectedComponents", "visibleComponents"]
        }
      }
    });

    const text = response.text?.trim() || "";
    if (!text) throw new Error("Empty response from AI");
    
    // Simple verification of completion
    if (!text.endsWith('}')) throw new Error("Incomplete JSON response (truncated)");

    const data = JSON.parse(text);
    
    // Ensure nested fields exist to avoid crashes
    if (!data.spec || !data.inspectionHighlights) throw new Error("Missing required fields in synthesis data");

    return data as AISynthesisResult;
  } catch (err) {
    console.warn("AI Synthesis failed, using static fallback:", err);
    return FALLBACK_RESULT;
  }
}
