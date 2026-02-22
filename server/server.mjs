import express from 'express';
import cors from 'cors';
import { auth } from 'express-oauth2-jwt-bearer';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';

// Database setup
const adapter = new JSONFile('server/db.json');
const defaultData = { sessions: [] };
const db = new Low(adapter, defaultData);
await db.read();

const app = express();
const port = 3001;

// Authorization middleware. When used, the Access Token must
// exist and be verified against the Auth0 JSON Web Key Set.
const checkJwt = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
});

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// API routes
app.get('/api/sessions', checkJwt, (req, res) => {
  res.json(db.data.sessions);
});

app.post('/api/sessions', checkJwt, async (req, res) => {
  const session = req.body;
  session.savedAt = new Date().toISOString();
  db.data.sessions.push(session);
  await db.write();
  res.status(201).json(session);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
