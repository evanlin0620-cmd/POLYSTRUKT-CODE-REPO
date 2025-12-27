
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import cache from 'memory-cache';
import dotenv from 'dotenv';

dotenv.config();

const connection = new IORedis();

export const generationQueue = new Queue('generation-queue', { connection });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

new Worker('generation-queue', async (job) => {
  const { prompt } = job.data;

  // Check cache first
  const cachedResult = cache.get(prompt);
  if (cachedResult) {
    console.log('Worker: Returning cached result for:', prompt);
    return cachedResult;
  }

  console.log(`Worker: Processing job ${job.id} for prompt: ${prompt}`);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = await response.text();
  const generatedResponse = { generatedText: text };

  // Store result in cache for 1 hour
  cache.put(prompt, generatedResponse, 3600000);

  return generatedResponse;
}, { connection });
