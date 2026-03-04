
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db.mjs';
import { generateComponent } from './ai.mjs';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// User registration
app.post('/api/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
      [username, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error registering user');
  }
});

// User login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).send('Cannot find user');
    }
    const user = result.rows[0];
    if (await bcrypt.compare(password, user.password)) {
      const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET);
      res.json({ accessToken: accessToken });
    } else {
      res.status(401).send('Not Allowed');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error logging in');
  }
});

app.post('/api/generate', authenticateToken, generateComponent);


// API routes
app.get('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT session_data, saved_at FROM sessions WHERE user_id = $1', [req.user.id]);
        res.json(result.rows.map(row => ({...row.session_data, savedAt: row.saved_at})));
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving sessions");
    }
});

app.post('/api/sessions', authenticateToken, async (req, res) => {
    try {
        const session = req.body;
        const result = await db.query(
            'INSERT INTO sessions (user_id, session_data) VALUES ($1, $2) RETURNING *',
            [req.user.id, session]
        );
        const newSession = {
            ...result.rows[0].session_data,
            savedAt: result.rows[0].saved_at
        }
        res.status(201).json(newSession);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error saving session");
    }
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
