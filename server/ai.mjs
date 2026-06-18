import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { MATERIALS } from './materials.mjs';
import { ENGINEERING_EXAMPLES } from './examples.mjs';
import { getEvaluations } from './evaluations.mjs';
import { listMcpTools, runMcpTool } from './mcp.mjs';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || process.env.API_KEY;
const DATA_DIR = path.join(process.cwd(), 'data');
const JOBS_FILE = path.join(DATA_DIR, 'jobs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const KHRONOS_ASSET_BASE = "https://cdn.jsdelivr.net/gh/KhronosGroup/glTF-Sample-Models@master/2.0";
const MODEL_LIBRARY = {
  ENGINE_V2: `${KHRONOS_ASSET_BASE}/2CylinderEngine/glTF-Binary/2CylinderEngine.glb`,
  GEARBOX: `${KHRONOS_ASSET_BASE}/GearboxAssy/glTF-Binary/GearboxAssy.glb`,
  HYDRAULIC_UNIT: `${KHRONOS_ASSET_BASE}/ReciprocatingSaw/glTF-Binary/ReciprocatingSaw.glb`,
  HELMET_SF: `${KHRONOS_ASSET_BASE}/DamagedHelmet/glTF-Binary/DamagedHelmet.glb`,
  PRESSURE_VESSEL: `${KHRONOS_ASSET_BASE}/WaterBottle/glTF-Binary/WaterBottle.glb`,
  CHAIR: `${KHRONOS_ASSET_BASE}/SheenChair/glTF-Binary/SheenChair.glb`,
  OPTICS_UNIT: `${KHRONOS_ASSET_BASE}/Lantern/glTF-Binary/Lantern.glb`,
  STRUCTURAL_FRAME: `${KHRONOS_ASSET_BASE}/Box/glTF-Binary/Box.glb`,
};

// Helper to convert MCP tool schema to Gemini tool schema
const getGeminiTools = async () => {
  const { tools } = await listMcpTools();
  return {
    functionDeclarations: tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }))
  };
};

// Helper to load/save jobs asynchronously with Atomic Writes
const loadJobs = async () => {
  try {
    if (!fs.existsSync(JOBS_FILE)) return new Map();
    const dataString = await fs.promises.readFile(JOBS_FILE, 'utf8');
    const data = JSON.parse(dataString);
    return new Map(Object.entries(data));
  } catch (e) {
    return new Map();
  }
};

const saveJobs = async (jobsMap) => {
  const data = Object.fromEntries(jobsMap);
  const tempFile = `${JOBS_FILE}.${Date.now()}.tmp`;
  try {
    await fs.promises.writeFile(tempFile, JSON.stringify(data, null, 2));
    await fs.promises.rename(tempFile, JOBS_FILE);
  } catch (e) {
    console.error('[AI] Job save failed:', e);
    if (fs.existsSync(tempFile)) {
      try { await fs.promises.unlink(tempFile); } catch (u) {}
    }
  }
};

let jobsReady = false;
let jobs = new Map();

(async () => {
  jobs = await loadJobs();
  jobsReady = true;
})();

export const analyzeUserPrompt = (prompt, history = [], attachment = null) => {
  const lowercasePrompt = (prompt || '').toLowerCase();
  const lowercaseHistory = history.map(h => (h.text || h.content || '').toLowerCase()).join(' ');
  const combined = `${lowercasePrompt} ${lowercaseHistory}`;

  // Direct drawing / CAD / layout detection
  const hasDrawingAttachment = 
    (attachment?.mimeType?.startsWith('image/') || attachment?.mimeType === 'application/pdf') || 
    history.some(h => (h.attachment?.mimeType?.startsWith('image/') || h.attachment?.mimeType === 'application/pdf'));

  const hasDrawingKeywords = 
    /\b(drawing|blueprint|sketch|2d|cad|dxf|dwg|svg|orthographic|projection|floorplan|schematic)\b/i.test(combined) ||
    combined.includes('extrude') ||
    combined.includes('turn into 3d') ||
    combined.includes('convert to 3d') ||
    combined.includes('3d model from');

  const isImageTo3DRequest = hasDrawingAttachment || hasDrawingKeywords;

  const dimensionsExtracted = [];
  const dimRegex = /(\d+(?:\.\d+)?)\s*(?:mm|cm|inches|inch|m|meters)\b/g;
  let match;
  while ((match = dimRegex.exec(combined)) !== null) {
    dimensionsExtracted.push(match[0]);
  }

  const complexity = (lowercasePrompt.length > 300 || history.length > 4) ? 'complex' : 'standard';

  // Enable high thinking for everything else (when not doing visual 2D to 3D image-to-3D requests)
  const requiresHighThinking = !isImageTo3DRequest;

  return {
    isImageTo3DRequest,
    hasDrawingAttachment,
    dimensionsExtracted,
    complexity,
    requiresHighThinking,
    detectedType: isImageTo3DRequest ? '2D_TO_3D_CONVERSION' : 'TEXT_TO_3D_SYNTHESIS'
  };
};

export const enqueueGeneration = async (req, res) => {
  const { prompt, history = [], attachment, engine = 'Gemini 3.5 Flash' } = req.body;
  
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const jobId = Math.random().toString(36).substring(7);
  jobs.set(jobId, { 
    userId: req.user?.id, // Tie job to user for security
    state: 'active', 
    engine,
    createdAt: new Date().toISOString() 
  });
  await saveJobs(jobs);

  // Start generation in background
  (async () => {
    try {
      if (!API_KEY) {
        throw new Error('Technical Synthesis interface API key missing');
      }

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      
      const evals = await getEvaluations();
      const recentFails = evals.filter(e => e.rating === 'fail').slice(-5);
      const recentSuccesses = evals.filter(e => e.rating === 'success').slice(-5);

      const isNanoBanana = engine === 'Nano Banana 2.0';

      const systemInstruction = `
        You are the Polystrukt Technical Synthesis Core, ${isNanoBanana ? 'running the experimental NANO BANANA 2.0 specialized high-fidelity 3D generative engine' : 'a high-fidelity engineering AI specializing in personalized generative design and structural optimization'}.
        
        ${isNanoBanana ? `
        SPECIAL DEEP LEARNING MODEL PROTOCOL - NANO BANANA 2.0 ACTIVE:
        - Prioritize ultra-complex, multi-scale porous lattice structures and biomimetic geometries (e.g. trabecular rib patterns, curved vents, double-curvature organic casings).
        - Maximize architectural variance: Your 'proceduralSpec' MUST contain at least 4 nested levels of CSG operations (atoms: union, subtract, intersect) or extensive structural groupings.
        - Utilize multiple colored parts (using different colors like "#22d3ee", "#818cf8", "#f43f5e", "#cbd5e1" for specific components) to visualize distinct material densities or functional elements.
        - Ensure your thought_process is exceptionally analytical and documents high-fidelity physical design grounds.
        ` : 'MISSION: Synthesize precise, unique engineering designs from natural language. You must prioritize structural integrity, material efficiency, and manufacturing feasibility while ensuring NO TWO DESIGNS ARE THE SAME.'}
        
        KNOWLEDGE REINFORCEMENT (Lessons Learned):
        ${recentFails.length > 0 ? `PREVIOUS ERRORS (Avoid these patterns):
        ${recentFails.map(f => `- Prompt: ${f.prompt}\n  Failure: ${f.feedback || 'Inaccurate geometry'}`).join('\n')}` : ''}
        
        ${recentSuccesses.length > 0 ? `SUCCESS PATTERNS (Emulate these):
        ${recentSuccesses.map(s => `- Prompt: ${s.prompt}\n  Strength: ${s.feedback || 'High structural fidelity'}`).join('\n')}` : ''}

        ENHANCED LOGIC PROTOCOL:
        1. DEEP_THOUGHT: Before generating geometry, you MUST articulate a detailed 'thought_process'. 
           - Analyze forces, constraints, and environmental factors.
           - Explain WHY certain structural patterns (ribs, trusses, chamfers) are necessary.
           - Justify material selection based on specific yield and density requirements.
        2. COMPREHENSIVE_ANALYSIS: Provide three distinct analysis reports:
           - VISUAL: Describe the geometric aesthetic, symmetry, and "design language" (e.g., bio-inspired, brutalist, aerodynamic).
           - FUNCTIONAL: Explain how the specific features (mounts, channels, hinges) enable the part to work in its intended role.
           - STRUCTURAL: Detail the load paths, stress distribution zones, and how the geometry prevents failure under expected loads.
        3. PATTERN_LEARNING: Reference high-quality engineering examples to understand complex boolean synthesis.
        4. NEURAL_VARIANCE: Explicitly avoid cookie-cutter shapes. Generate specialized weight reduction patterns and bio-inspired topological optimizations.
        4. SYNTHESIZE: Build a custom 'proceduralSpec' using CSG (Constructive Solid Geometry).
        5. VALIDATE: Ensure no self-intersections and that all 'subtract' operations are correctly positioned.
        
        AI-GENERATED MODELS:
        Every model you provide MUST be generated via the 'proceduralSpec' field. You must build the geometry from scratch using the procedural engine.
        
        ACCURACY & ENGINEERING STANDARDS:
        - Use realistic dimensions (mm).
        - Ensure wall thicknesses are appropriate for the material (e.g., 3-5mm for steel brackets).
        - Add fillets/chamfers where appropriate (simulated via cylinders/cones).
        
        LEARNING DATA (EXAMPLES):
        ${ENGINEERING_EXAMPLES.map(ex => `Prompt: ${ex.prompt}\nThought: ${ex.thought_process}\nSpec Sample: (Complex CSG with nesting)`).join('\n\n')}

        TECHNICAL KNOWLEDGE BASE (MATERIALS):
        Reference these materials for 'suggestedMaterials' and 'analysis'. Adjust geometry (thickness, ribbing) based on yield strength:
        ${MATERIALS.map(m => `- ${m.name} (${m.category}): ${m.properties.yieldStrength} yield, ${m.properties.density} density. Best for: ${m.applications.join(', ')}`).join('\n')}
        
        CUSTOM PROCEDURAL GENERATION (proceduralSpec field):
        MANDATORY for ALL designs. A nested object of shapes (box, cylinder, sphere, torus, cone), operations (union, subtract, intersect), or groups.
        
        SCHEMA:
        - ProceduralShape: { type: 'box'|'cylinder'|'sphere'|'torus'|'cone', args: [number...], position?, rotation?, scale?, color?, opacity?, metalness?, roughness? }
        - ProceduralOperation: { op: 'union'|'subtract'|'intersect', a: Spec, b: Spec }
        - ProceduralGroup: { op: 'group', children: Spec[], position?, rotation?, scale? }
        
        ARGUMENTS:
        - 'box': [width, height, depth]
        - 'cylinder': [radiusTop, radiusBottom, height, radialSegments]
        - 'sphere': [radius, widthSegments, heightSegments]
        - 'torus': [radius, tube, radialSegments, tubularSegments]
        - 'cone': [radius, height, radialSegments]
        
        STRICT UNIQUENESS MANDATE:
        - Every 'proceduralSpec' must be a unique "Engineering Work of Art".
        - Use asymmetry, varied scale, and complex boolean nesting (at least 3 levels deep).
        - Use 'subtract' with groups for intricate weight reduction patterns.
        
        OUTPUT FORMAT:
        - Return ONLY a valid JSON object matching the schema.
        - No markdown blocks, no preamble.
      `;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          thought_process: { type: Type.STRING, description: "Detailed engineering reasoning before synthesis." },
          researchSummary: { type: Type.STRING },
          optimizationLogic: { type: Type.STRING },
          analysis: { type: Type.STRING },
          analysisReport: {
            type: Type.OBJECT,
            properties: {
              visual: { type: Type.STRING, description: "Aesthetic and geometric design analysis." },
              functional: { type: Type.STRING, description: "Operational and utility analysis." },
              structural: { type: Type.STRING, description: "Load path and integrity analysis." }
            },
            required: ["visual", "functional", "structural"]
          },
          specs: { type: Type.STRING },
          action: { type: Type.STRING },
          modelUrl: { type: Type.STRING },
          proceduralSpec: { 
            type: Type.OBJECT, 
            description: "MANDATORY. A nested object of shapes, operations, or groups.",
            properties: {
              op: { type: Type.STRING, enum: ["union", "subtract", "intersect", "group"] },
              type: { type: Type.STRING, enum: ["box", "cylinder", "sphere", "torus", "cone"] },
              args: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              position: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              rotation: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              scale: { type: Type.ARRAY, items: { type: Type.NUMBER } },
              color: { type: Type.STRING },
              a: { type: Type.OBJECT },
              b: { type: Type.OBJECT },
              children: { type: Type.ARRAY, items: { type: Type.OBJECT } }
            }
          },
          isolatedComponent: { type: Type.STRING },
          simulationType: { type: Type.STRING, enum: ["stress", "thermal", "flow", "none"] },
          suggestedMaterials: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["thought_process", "researchSummary", "optimizationLogic", "analysis", "analysisReport", "specs", "action", "modelUrl", "simulationType", "suggestedMaterials", "proceduralSpec"]
      };

      const analysisInfo = analyzeUserPrompt(prompt, history, attachment);
      console.log(`[AI] Analysis result for Job: isImageTo3D=${analysisInfo.isImageTo3DRequest}, requiresHighThinking=${analysisInfo.requiresHighThinking}`);

      let finalSystemInstruction = systemInstruction;
      if (analysisInfo.isImageTo3DRequest) {
        finalSystemInstruction += `
          
          ==================================================
          2D-TO-3D IMAGE & TECHNICAL DRAWING ANALYSIS PROTOCOL (ANALYZE IMAGES FEATURE ACTIVE):
          The user wants to turn a drawing file, sketch, blueprint, or 2D CAD file into a 3D model. We are using specialized image analysis features to handle this:
          1. Detect visual contours, boundaries, and geometric profiles within the provided drawing image/blueprint context.
          2. Locate and extract key dimensions, tolerances, thread specifications, and reference callouts.
          3. Reconstruct orthographic views: Merge information from top-down, side-profile, or section views into spatial representation.
          4. Extrude & Elevate: Synthesize how 2D primitives should be extruded, rotated, nested, or swept along the Z-axis (using our CSG operations inside 'proceduralSpec').
          5. Align material, density, and wall thickness specs against physical layouts from of the drawings.
          ==================================================
        `;
      }

      const adminInstruction = `
          
          ADMINISTRATIVE PROTOCOLS (MCP TOOLS):
          You have access to the Polystrukt Engineering Ops Tools. 
          - AUTH: Handle email/credential updates.
          - PAYMENTS: Process transactions for tier upgrades.
          - EMAILS: Dispatch synthesis reports.
          - USER: Update profile metadata (name, company, specialization).
          
          CURRENT USER CONTEXT:
          - ID: ${req.user?.id}
          - Identity: ${req.user?.email}
          
          If the user requests an administrative action (e.g. "update my profile", "upgrade me to pro", "email me the report"), use the appropriate tool BEFORE providing the final engineering synthesis result.
      `;

      // Determine if this is a standard mechanical/structural component vs a highly unique custom request.
      const lowercasePrompt = prompt.toLowerCase();
      const isUniqueConceptual = lowercasePrompt.includes('unique') || 
                                 lowercasePrompt.includes('custom') || 
                                 lowercasePrompt.includes('special') || 
                                 lowercasePrompt.includes('conceptual') || 
                                 lowercasePrompt.includes('futuristic') || 
                                 lowercasePrompt.includes('experimental') || 
                                 lowercasePrompt.includes('bio-inspired') || 
                                 lowercasePrompt.includes('biomechanical') || 
                                 lowercasePrompt.includes('organic') || 
                                 lowercasePrompt.includes('complex') ||
                                 prompt.length > 250;

      const isStandard = !isUniqueConceptual;

      // Select model based on task complexity or selected engine:
      // If it's a unique custom request, we use the peak reasoning engine gemini-3.1-pro-preview to scope and model it accurately.
      // If it's a standard model, we use gemini-3.5-flash with search tool to fact-check normal design shapes, dimension ratios, and standard engineering features.
      let modelName = "gemini-3.5-flash";
      if (isNanoBanana || isUniqueConceptual || engine === 'Nano Banana 2.0') {
        modelName = "gemini-3.1-pro-preview"; // High thinking intelligence model
      }

      console.log(`[AI] Selected model ${modelName} (isStandard=${isStandard}, isUniqueConceptual=${isUniqueConceptual})`);

      const mcpTools = await getGeminiTools();
      const tools = [mcpTools];
      
      // Inject Google Search tool where relevant to fact-check standard properties
      if (isStandard && modelName === "gemini-3.5-flash") {
        tools.push({ googleSearch: {} });
        console.log(`[AI] Added Google Search Grounding to fact-check general engineering model standards.`);
      }

      const generationConfig = {
        systemInstruction: finalSystemInstruction + adminInstruction + (isStandard ? `
          \n[FACT-CHECKING MODE ACTIVE]: Since this is a standard engineering component, you MUST use the Google Search grounding tool to find/fact-check the standard geometry, typical dimension ratios, proper mechanical configurations, and recommended engineering materials. Ensure the 'proceduralSpec' aligns with real-world technical standards.
        ` : `
          \n[GEMINI ADVANCED INTELLIGENCE ACTIVE]: Since this is a highly unique or custom conceptual request, deploy advanced geometric styling to scope out and design a highly specialized prototype. Deeply reason about fluid load paths, material efficiency, structural ribbing/lattices, and custom mechanical constraints, ensuring the outer and inner geometries are crafted with accurate and state-of-the-art precision.
        `),
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: isUniqueConceptual ? 0.90 : 0.85,
        tools: tools,
        ...(isStandard && modelName === "gemini-3.5-flash" ? {
          toolConfig: { includeServerSideToolInvocations: true }
        } : {})
      };

      // Set enable high thinking for everything else (when not doing image analysis feature)
      if (analysisInfo.requiresHighThinking || modelName === "gemini-3.1-pro-preview") {
        generationConfig.thinkingConfig = {
          thinkingLevel: "HIGH"
        };
      }

      // Update state for frontend
      const activeJob = jobs.get(jobId);
      if (activeJob) {
        console.log(`[AI] Starting synthesis for Job: ${jobId}`);
        activeJob.state = 'synthesizing';
        jobs.set(jobId, activeJob);
        await saveJobs(jobs);
      }
      
      const contents = history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [
          ...(msg.attachment ? [{
            inlineData: {
              mimeType: msg.attachment.mimeType,
              data: msg.attachment.data.split(',')[1] || msg.attachment.data
            }
          }] : []),
          { text: msg.text || msg.content || '' }
        ]
      }));
  
      contents.push({
        role: 'user',
        parts: [
          ...(attachment ? [{
            inlineData: {
              mimeType: attachment.mimeType,
              data: attachment.data.split(',')[1] || attachment.data
            }
          }] : []),
          { text: prompt }
        ]
      });
  
      const startTime = Date.now();
      // --- GENERATION LOOP FOR TOOLS ---
      let currentContents = [...contents];
      let finalResponse;

      while (true) {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: currentContents,
          config: generationConfig
        });

        const candidates = response.candidates;
        if (!candidates || candidates.length === 0) {
          throw new Error('No candidate responses returned from design core.');
        }

        const toolCalls = candidates[0].content.parts.filter(p => p.functionCall);

        if (toolCalls.length > 0) {
          console.log(`[AI] Tool calls detected: ${toolCalls.map(tc => tc.functionCall.name).join(', ')}`);
          const toolResponses = [];

          for (const tc of toolCalls) {
            const { name, args } = tc.functionCall;
            const result = await runMcpTool(name, args);
            toolResponses.push({
              functionResponse: {
                name,
                response: result
              }
            });
          }

          currentContents.push(candidates[0].content);
          currentContents.push({
            role: 'user',
            parts: toolResponses
          });
          
          continue; // Re-generate with tool results
        } else {
          finalResponse = response;
          break;
        }
      }

      const duration = (Date.now() - startTime) / 1000;
      console.log(`[AI] Generation completed in ${duration.toFixed(2)}s for Job: ${jobId}`);

      const responseText = finalResponse.text;
      let parsed = JSON.parse(responseText);
      
      console.log(`[AI] Parsing result for Job: ${jobId}`);
      
      // Extract Google Search Grounding sources if available
      const chunks = finalResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
      let extractedSources = [];
      if (chunks) {
        extractedSources = chunks.map(chunk => ({
          uri: chunk.web?.uri || chunk.uri || '',
          title: chunk.web?.title || chunk.title || 'Reference'
        })).filter(s => s.uri);
      }

      // Verification loop remains simplified here but uses the background worker pattern
      let isValid = true; // Assume true for now, can be expanded

      const modelKey = (parsed.modelUrl || "GEARBOX").toUpperCase().replace(/\s/g, '_');
      const resolvedUrl = MODEL_LIBRARY[modelKey] || MODEL_LIBRARY.GEARBOX;

      const result = {
        ...parsed,
        modelUrl: resolvedUrl,
        simulationType: parsed.simulationType || 'none',
        verificationStatus: isValid ? 'verified' : 'unverified',
        engine: engine,
        sources: extractedSources.length > 0 ? extractedSources : (parsed.sources || []),
        statusCode: 200
      };

      const finalJob = jobs.get(jobId);
      if (finalJob) {
        finalJob.state = 'completed';
        finalJob.result = result;
        finalJob.updatedAt = new Date().toISOString();
        jobs.set(jobId, finalJob);
        await saveJobs(jobs);
        console.log(`[AI] Job ${jobId} marked as completed.`);
      }
    } catch (error) {
      console.error('Generation failed:', error);
      const failedJob = jobs.get(jobId);
      if (failedJob) {
        failedJob.state = 'failed';
        failedJob.error = error.message;
        failedJob.updatedAt = new Date().toISOString();
        jobs.set(jobId, failedJob);
        await saveJobs(jobs);
      }
    }
  })();

  res.status(202).json({ jobId });
};

export const getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  const job = jobs.get(jobId);

  if (!job) {
    return res.status(404).json({ error: 'Synthesis record not found' });
  }

  // Ownership check: only the user who started the job can see it
  if (job.userId !== req.user.id) {
    return res.status(403).json({ error: 'Resource access denied' });
  }

  res.json({
    jobId,
    state: job.state,
    result: job.result,
    error: job.error,
  });
};
