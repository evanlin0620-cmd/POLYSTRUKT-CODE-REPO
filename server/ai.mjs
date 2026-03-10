
import { aiQueue } from './queue.mjs';

export const generateComponent = async (req, res) => {
  const { prompt, chatHistory } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    const job = await aiQueue.add('generate-component', { prompt, chatHistory });
    res.json({ jobId: job.id });
  } catch (error) {
    console.error("Error adding job to queue:", error);
    res.status(500).json({ error: 'Failed to start generation job.', details: error.message });
  }
};

export const getJobStatus = async (req, res) => {
  const { jobId } = req.params;
  try {
    const job = await aiQueue.getJob(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    res.json({ 
      jobId: job.id, 
      state, 
      result: result || null, 
      failedReason: failedReason || null 
    });
  } catch (error) {
    console.error(`Error getting status for job ${jobId}:`, error);
    res.status(500).json({ error: 'Failed to get job status.', details: error.message });
  }
};
