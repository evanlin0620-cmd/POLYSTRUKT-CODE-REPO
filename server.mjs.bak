
import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { auth } from 'express-oauth2-jwt-bearer';
import { generationQueue } from './queue.mjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { WebSocketServer } from 'ws';
import http from 'http';
import { jobClients } from './shared.mjs';

dotenv.config();

const adapter = new JSONFile('db.json');
const defaultData = { sessions: {} };
const db = new Low(adapter, defaultData);
await db.read();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

const port = process.env.PORT || 3001;

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

const checkJwt = auth({
  audience: 'https://polystrukt-api',
  issuerBaseURL: `https://dev-i3a1b0p3.us.auth0.com/`,
});

const limiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 100, 
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute',
});

app.use('/api', limiter);
app.use(express.json());

app.get('/health', async (req, res) => {
  try {
    if (generationQueue) {
      const queueStatus = await generationQueue.client.status();
      res.status(queueStatus === 'ready' ? 200 : 503).send({ server: 'OK', queue: queueStatus });
    } else {
      res.status(200).send({ server: 'OK', queue: 'mock' });
    }
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

app.get('api/load-sessions', checkJwt, async (req, res) => {
  const userId = req.auth.payload.sub;
  const userSessions = db.data.sessions[userId] || [];
  res.status(200).send(userSessions);
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

server.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
