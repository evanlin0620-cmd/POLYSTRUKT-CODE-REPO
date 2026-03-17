import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

export const aiQueue = new Queue('ai-queue', { connection });