const express = require('express');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

// Shared secret across both localhost apps (in production, use env variables)
const JWT_SECRET = 'shared-secret-key-between-subdomains-2024';

// Mock user database
const USERS = [
  { id: 1, email: 'user@test.com', password: 'password123', name: 'John Doe' },
  { id: 2, email: 'admin@test.com', password: 'admin123', name: 'Admin User' }
];

// Serve login page
app.get('/', (req, res) => {
  // Check if already logged in
  const token = req.cookies['sso_token'];
  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      return res.redirect('/dashboard');
    } catch (err) {
      // Invalid token, show login
    }
  }
  res.sendFile(path.join(__dirname, 'public/app1/index.html'));
});

// Handle login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  const user = USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  // On localhost, omit `domain` so the cookie is valid for localhost on all ports.
  res.cookie('sso_token', token, {
    path: '/',
    maxAge: 86400000,          // 24 hours
    httpOnly: false,           // false so frontend JS can read it (for demo)
    // In production: httpOnly: true, secure: true
  });

  res.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name },
    message: 'Cookie set on localhost'
  });
});

// Dashboard page
app.get('/dashboard', (req, res) => {
  const token = req.cookies['sso_token'];

  if (!token) {
    return res.redirect('/');
  }

  try {
    const user = jwt.verify(token, JWT_SECRET);
    res.sendFile(path.join(__dirname, 'public/app1/dashboard.html'));
  } catch (err) {
    res.redirect('/');
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

app.listen(3001, () => {
  console.log('🟢 App 1 running on http://localhost:3001');
});