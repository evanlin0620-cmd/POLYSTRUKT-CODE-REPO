// This is a test comment to see if Git detects changes.
import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { generationQueue } from './queue.mjs';
import { Job } from 'bullmq';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after a minute',
});

app.use('/api', limiter);
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.post('/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).send({ error: 'Prompt is required' });
  }

  const job = await generationQueue.add('generate-text', { prompt });
  res.send({ jobId: job.id });
});

app.get('/generate/status/:jobId', async (req, res) => {
  const { jobId } = req.params;
  const job = await generationQueue.getJob(jobId);

  if (!job) {
    return res.status(404).send({ status: 'not found' });
  }

  const state = await job.getState();
  if (state === 'completed') {
    const result = await job.finished();
    res.send({ status: 'completed', result });
  } else if (state === 'failed') {
    const reason = job.failedReason;
    res.send({ status: 'failed', reason });
  } else {
    res.send({ status: state });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
