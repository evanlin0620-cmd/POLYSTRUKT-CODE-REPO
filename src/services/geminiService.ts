import { Attachment, ChatMessage, ProceduralSpec, HardwareSuggestion, FEAResult } from '../types';

export interface TechnicalAIResponse {
  thought_process?: string;
  analysis: string;
  specs: string;
  action: string;
  modelUrl: string;
  proceduralSpec?: ProceduralSpec;
  hardwareSuggestions?: HardwareSuggestion[];
  feaResult?: FEAResult;
  analysisReport?: {
    visual: string;
    functional: string;
    structural: string;
  };
  simulationType: 'stress' | 'thermal' | 'flow' | 'none';
  suggestedMaterials: string[];
  researchSummary: string; 
  optimizationLogic: string; 
  isolatedComponent?: string; 
  sources?: { uri: string; title: string }[];
  verificationStatus?: 'verified' | 'unverified_limit_reached';
  verificationAttempts?: number;
  jobId?: string;
  error?: string;
  statusCode: number; // Guaranteed status code
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

/**
 * Validates inputs to prevent malformed requests.
 */
const validateInput = (query: string, attachment?: Attachment): string | null => {
  const trimmed = query?.trim();
  if (!trimmed && !attachment) {
    return "Input validation failed: Query and attachment cannot both be empty.";
  }
  if (trimmed && trimmed.length > 10000) {
    return "Input validation failed: Query exceeds maximum technical buffer length.";
  }
  return null;
};

/**
 * Standardized error generator to ensure a valid JSON response structure is always returned.
 */
const createJsonErrorResponse = (message: string, code: string, status: number): TechnicalAIResponse => ({
  analysis: `KERNEL_SIGNAL_INTERRUPTED: ${message}`,
  specs: `SYSTEM_CODE: ${code}`,
  action: "RECOVERY_MODE",
  modelUrl: MODEL_LIBRARY.GEARBOX, 
  simulationType: 'none',
  suggestedMaterials: ["Fallback Composite"],
  researchSummary: "Analysis aborted due to environment or input constraints.",
  optimizationLogic: "Iterative solver failed to converge on the provided parameters.",
  error: message || "Unknown Kernel Error",
  statusCode: status
});

export const getTechnicalResponse = async (
  query: string, 
  history: ChatMessage[] = [],
  attachment?: Attachment,
  token?: string | null,
  onStatus?: (status: { state: string; attempt?: number; errors?: string[] }) => void
): Promise<TechnicalAIResponse> => {
  try {
    const errorPrefix = "ENGINE_INIT_FAILURE";
    
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Call the backend to enqueue the generation
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers,
      body: JSON.stringify({ prompt: query, history, attachment })
    });

    if (!res.ok) {
      let errorMessage = `Failed to start generation (${res.status})`;
      if (res.status === 401) errorMessage = 'Authentication required. Please sign in.';
      
      try {
        const bodyText = await res.text();
        if (bodyText && bodyText.trim().startsWith('{')) {
          const errorData = JSON.parse(bodyText);
          errorMessage = errorData.error || errorMessage;
        } else if (bodyText && bodyText.length < 500) {
          errorMessage = bodyText;
        }
      } catch (e) {}
      
      throw new Error(errorMessage);
    }

    const resJson = await res.json();
    const jobId = resJson.jobId;

    if (!jobId) {
      throw new Error("Job system synchronization failed: No Job ID returned.");
    }

    // Poll for the job status
    let attempts = 0;
    const maxAttempts = 180; 
    let delay = 500; 
    
    while (attempts < maxAttempts) {
      const statusRes = await fetch(`/api/generate/status/${jobId}`, {
        headers
      });

      if (!statusRes.ok) {
        let errorMsg = `Poll failed [${statusRes.status}]`;
        try {
          const errData = await statusRes.json();
          errorMsg = errData.error || errorMsg;
        } catch (e) {}
        throw new Error(errorMsg);
      }

      const statusData = await statusRes.json();
      
      if (onStatus) {
        onStatus({ 
          state: statusData.state, 
          attempt: statusData.attempt, 
          errors: statusData.errors 
        });
      }

      if (statusData.state === 'completed') {
        return { ...statusData.result, jobId };
      } else if (statusData.state === 'failed') {
        throw new Error(statusData.error || 'Generation failed');
      }

      // Wait before next poll with slight backoff 
      await new Promise(resolve => setTimeout(resolve, delay));
      if (delay < 2000) delay += 300; 
      attempts++;
    }

    throw new Error('Generation timed out after several minutes of synthesis.');
  } catch (error: any) {
    console.error("Backend Service Fault:", error);
    return createJsonErrorResponse(error.message || "An unexpected error occurred in the backend.", "BACKEND_FAULT_500", 500);
  }
};
