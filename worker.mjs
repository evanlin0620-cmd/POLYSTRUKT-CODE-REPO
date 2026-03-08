
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});

const systemPrompt = `You are an expert CAD AI assistant. You must reply with a single, valid JSON object that conforms to the following TypeScript interface:

interface TechnicalAIResponse {
  analysis: string;
  specs: string;
  action: "PROCEED" | "RECOVERY_MODE" | "ADJUST_PARAMS";
  modelUrl: string;
  simulationType: 'stress' | 'thermal' | 'flow' | 'none';
  suggestedMaterials: string[];
  researchSummary: string;
  optimizationLogic: string;
  isolatedComponent?: string;
  sources?: { title: string, url: string }[];
}

Your response must be only the JSON object, with no other text or formatting like markdown backticks.
`;

const worker = new Worker('ai-generation', async (job) => {
    const { prompt, chatHistory } = job.data;

    try {
        const history = (chatHistory || []).map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        }));

        const contents = [
            { role: 'user', parts: [{ text: systemPrompt }] },
            { role: 'model', parts: [{ text: 'Okay, I will respond with a single JSON object that conforms to the TechnicalAIResponse interface.' }] },
            ...history,
            { role: 'user', parts: [{ text: prompt }] }
        ];

        const result = await model.generateContent({ contents });
        const response = await result.response;
        const text = response.text();

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
        } catch (e) {
            console.error("Failed to parse JSON from model response:", e);
            console.error("Original model response text:", text);
            // Even on parse failure, we need to return some valid TechnicalAIResponse
            return { 
                analysis: "Error: Invalid JSON response from AI.",
                specs: "", 
                action: "RECOVERY_MODE",
                modelUrl: "",
                simulationType: 'none',
                suggestedMaterials: [],
                researchSummary: `The AI model returned text that could not be parsed as JSON. The raw text was: ${text}`,
                optimizationLogic: "",
                sources: []
            };
        }

        return jsonResponse;
    } catch (error) {
        console.error("Error in worker while generating component:", error);
        // On general error, return a TechnicalAIResponse-compliant error object
        return {
            analysis: "Error: AI generation failed in worker.",
            specs: "",
            action: "RECOVERY_MODE",
            modelUrl: "",
            simulationType: 'none',
            suggestedMaterials: [],
            researchSummary: `An unexpected error occurred during AI content generation: ${error.message}`,
            optimizationLogic: "",
            sources: []
        };
    }
}, { connection });

console.log("Worker started...");
