
import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { auth } from 'express-oauth2-jwt-bearer';
import { generationQueue } from './queue.mjs';
import { Job } from 'bullmq';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { WebSocketServer } from 'ws';
import http from 'http';
import IORedis from 'ioredis';

dotenv.config();

// Database setup
const adapter = new JSONFile('db.json');
const defaultData = { sessions: {} };
const db = new Low(adapter, defaultData);
await db.read();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3001;

// WebSocket connections
const jobClients = new Map();

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const { jobId } = JSON.parse(message);
    if (jobId) {
      jobClients.set(jobId, ws);
    }
  });

  ws.on('close', () => {
    for (const [jobId, client] of jobClients.entries()) {
      if (client === ws) {
        jobClients.delete(jobId);
        break;
      }
    }
  });
});

// Authorization middleware
const checkJwt = auth({
  audience: 'https://polystrukt-api',
  issuerBaseURL: `https://dev-i3a1b0p3.us.auth0.com/`,
});

// Configure rate limiting with Redis
const redisClient = new IORedis({ maxRetriesPerRequest: null });

const limiter = rateLimit({
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute',
});

app.use('/api', limiter);
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    const queueStatus = await generationQueue.client.status;
    res.status(queueStatus === 'ready' ? 200 : 503).send({ server: 'OK', queue: queueStatus });
  } catch (error) {
    res.status(500).send({ server: 'OK', queue: 'Error' });
  }
});

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  const job = await generationQueue.add('generate-text', { prompt });
  res.send({ jobId: job.id });
});

// Protect the /api/save-session endpoint
app.post('/api/save-session', checkJwt, async (req, res) => {
  const { prompt, design } = req.body;
  const userId = req.auth.payload.sub;

  if (!db.data.sessions[userId]) {
    db.data.sessions[userId] = [];
  }

  db.data.sessions[userId].push({ prompt, design });
  await db.write();
  res.status(200).send({ message: 'Session saved successfully' });
});

// Protect the /api/load-sessions endpoint
app.get('api/load-sessions', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const userSessions = db.data.sessions[userId] || [];
  res.status(200).send(userSessions);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

export { jobClients };
