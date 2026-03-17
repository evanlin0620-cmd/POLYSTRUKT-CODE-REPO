
import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // Required for BullMQ
    enableReadyCheck: true,
    retryStrategy: (times) => {
        const delay = Math.min(times * 250, 2000);
        console.log(`Worker Redis connection retry attempt ${times}, retrying in ${delay}ms`);
        return delay;
    }
});

connection.on('connect', () => console.log('Worker Redis connected successfully.'));
connection.on('error', (err) => console.error('Worker Redis connection error:', err));


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

const worker = new Worker('ai-queue', async (job) => {
    console.log('[WORKER] Received a new job.');
    const { prompt, chatHistory } = job.data;
    console.log(`[WORKER] Job data: prompt length ${prompt.length}, chatHistory length ${chatHistory?.length || 0}`);

    try {
        console.log('[WORKER] Formatting chat history for AI model.');
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
        console.log('[WORKER] Content prepared. Calling model.generateContent...');

        const result = await model.generateContent({ contents });
        console.log('[WORKER] model.generateContent call completed.');

        const response = await result.response;
        console.log('[WORKER] Awaited result.response.');

        const text = response.text();
        console.log('[WORKER] Got response text. Attempting to parse JSON.');

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(text);
            console.log('[WORKER] Successfully parsed JSON from model response.');
        } catch (e) {
            console.error("[WORKER] Failed to parse JSON from model response:", e);
            console.error("[WORKER] Original model response text:", text);
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

        console.log('[WORKER] Job processed successfully. Returning JSON response.');
        return jsonResponse;
    } catch (error) {
        console.error("[WORKER] CRITICAL: An error occurred in the main try block of the worker.", error);
        console.error("[WORKER] Error Name:", error.name);
        console.error("[WORKER] Error Message:", error.message);
        console.error("[WORKER] Error Stack:", error.stack);
        if (error.cause) {
           console.error("[WORKER] Underlying Cause:", error.cause);
        }

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

worker.on('completed', (job) => {
  console.log(`[WORKER] Job ${job.id} has completed.`);
});

worker.on('failed', (job, err) => {
  console.error(`[WORKER] Job ${job.id} has failed with error:`, err);
});

worker.on('error', (error) => {
    console.error('BullMQ Worker Error:', error);
});

console.log("Worker started with robust Redis connection...");
