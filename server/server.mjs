import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Database setup
const adapter = new JSONFile('server/db.json');
const defaultData = { sessions: [] };
const db = new Low(adapter, defaultData);
await db.read();

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API routes
app.get('/api/sessions', (req, res) => {
  res.json(db.data.sessions);
});

app.post('/api/sessions', async (req, res) => {
  const session = req.body;
  session.savedAt = new Date().toISOString();
  db.data.sessions.push(session);
  await db.write();
  res.status(201).json(session);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
