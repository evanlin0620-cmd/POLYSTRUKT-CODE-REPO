
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(redisUrl, {
    maxRetriesPerRequest: null, // Important for BullMQ
    enableReadyCheck: true,
    retryStrategy: (times) => {
        const delay = Math.min(times * 250, 2000);
        console.log(`Redis connection retry attempt ${times}, retrying in ${delay}ms`);
        return delay;
    }
});

connection.on('connect', () => console.log('Redis connected successfully.'));
connection.on('error', (err) => console.error('Redis connection error:', err));

export const aiQueue = new Queue('ai-generation', { 
    connection,
    defaultJobOptions: {
        attempts: 3,
        backoff: {
            type: 'exponential',
            delay: 1000,
        },
    },
});

aiQueue.on('error', (error) => {
    console.error('BullMQ Queue Error:', error);
});
