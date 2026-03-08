
import express from 'express';
import { generateComponent } from './ai.mjs';
import { getJobStatus } from './ai.mjs'; // I will add this function next
import path from 'path';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// API endpoint to generate a new component
app.post('/api/generate', generateComponent);

// API endpoint to check the status of a generation job
app.get('/api/generate/status/:jobId', getJobStatus);

// Serve static files from the 'public' directory
const __dirname = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.join(__dirname, '../public')));

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
