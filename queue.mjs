
import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { jobClients } from './shared.mjs';

dotenv.config();

let connection;
let generationQueue;

try {
  if (!process.env.REDIS_URL) {
    throw new Error('REDIS_URL not found in .env file');
  }
  connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null });
  await connection.ping();
  console.log('Connected to Redis');

  generationQueue = new Queue('generation-queue', { connection });

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

      const client = jobClients.get(job.id);
      if (client) {
        client.send(JSON.stringify({ jobId: job.id, state: 'completed', result: generatedResponse }));
        jobClients.delete(job.id);
      }

      return generatedResponse;
    } catch (error) {
      console.error(`Worker: Job ${job.id} failed with error: ${error.message}`);

      const client = jobClients.get(job.id);
      if (client) {
        client.send(JSON.stringify({ jobId: job.id, state: 'failed', error: error.message }));
        jobClients.delete(job.id);
      }

      throw error;
    }
  }, { connection });

} catch (error) {
  console.log('Could not connect to Redis. Using mock queue.');
  console.error(error.message);

  generationQueue = {
    add: async (jobName, data) => {
      console.log(`Mock Queue: Adding job ${jobName} with data:`, data);
      const jobId = Math.random().toString(36).substring(7);
      setTimeout(() => {
        const client = jobClients.get(jobId);
        if (client) {
          console.log('Mock Queue: Simulating job completion');
          client.send(JSON.stringify({ jobId, state: 'completed', result: { generatedText: 'This is a mock response.' } }));
          jobClients.delete(jobId);
        }
      }, 1000);
      return { id: jobId };
    },
    client: {
      status: () => 'mock'
    }
  };
}

export { generationQueue };
