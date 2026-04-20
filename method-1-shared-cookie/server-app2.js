const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cookieParser());

const ALLOWED_ORIGINS = new Set([
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Vary', 'Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

// SAME secret as App 1
const JWT_SECRET = 'shared-secret-key-between-subdomains-2024';

// Home / Dashboard
app.get('/', (req, res) => {
  const token = req.cookies['sso_token'];

  if (!token) {
    return res.send(`
      <h1>App 2 - Not Logged In</h1>
      <p>No SSO cookie found. Please login on 
        <a href="http://localhost:3001">App 1</a> first.
      </p>
    `);
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.sendFile(path.join(__dirname, 'public/app2/dashboard.html'));
  } catch (err) {
    res.send('<h1>Invalid token</h1><a href="http://localhost:3001">Go to App 1 to login</a>');
  }
});

// API to get current user
app.get('/api/me', (req, res) => {
  const token = req.cookies['sso_token'];

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.json({ user });
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout
app.post('/api/logout', (req, res) => {
  res.clearCookie('sso_token', { path: '/' });
  res.json({ success: true });
});

app.listen(3002, () => {
  console.log('🟢 App 2 running on http://localhost:3002');
});