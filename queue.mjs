
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { jobClients } from './server.mjs';

dotenv.config();

const connection = new IORedis({ maxRetriesPerRequest: null });

export const generationQueue = new Queue('generation-queue', { connection });

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

new Worker('generation-queue', async (job) => {
  try {
    const { prompt } = job.data;

    console.log(`Worker: Processing job ${job.id} for prompt: ${prompt}`);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const generatedResponse = { generatedText: text };

    // Notify client of completion
    const client = jobClients.get(job.id);
    if (client) {
      client.send(JSON.stringify({ jobId: job.id, state: 'completed', result: generatedResponse }));
      jobClients.delete(job.id);
    }

    return generatedResponse;
  } catch (error) {
    console.error(`Worker: Job ${job.id} failed with error: ${error.message}`);

    // Notify client of failure
    const client = jobClients.get(job.id);
    if (client) {
      client.send(JSON.stringify({ jobId: job.id, state: 'failed', error: error.message }));
      jobClients.delete(job.id);
    }

    throw error; // Re-throw the error to let BullMQ know the job failed
  }
}, { connection });
