// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Try to use your real User model if present
let User = null;
try {
  User = require('../models/user.model'); // adapt if your user model path/name is different
} catch (e) {
  console.warn('[auth] User model not found, using demo user for auth (dev only).');
}

// Secrets — set these in .env for real apps
const ACCESS_SECRET = process.env.ACCESS_TOKEN_SECRET || 'dev-access-secret';
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET || 'dev-refresh-secret';

// Simple in-memory store for refresh tokens (DEV ONLY)
const refreshStore = new Set();

function createAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: '15m' });
}
function createRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' });
}

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: { accessToken }
 * Sets httpOnly cookie refreshToken
 */
router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });

  // If you have a real User model, validate credentials against DB
  if (User && User.findOne) {
    try {
      const u = await User.findOne({ email }).lean();
      if (!u) return res.status(401).json({ error: 'invalid credentials' });
      // NOTE: you MUST compare hashed passwords in prod. This is a placeholder.
      if (u.password !== password) return res.status(401).json({ error: 'invalid credentials' });

      const payload = { userId: u._id.toString(), email: u.email };
      const accessToken = createAccessToken(payload);
      const refreshToken = createRefreshToken(payload);

      refreshStore.add(refreshToken);
      // set cookie
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: false, // set true in prod with HTTPS
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return res.json({ accessToken });
    } catch (err) {
      console.error('[auth] login error', err);
      return res.status(500).json({ error: 'server error' });
    }
  }

  // Demo fallback user (for local dev only)
  const DEMO_EMAIL = 'test@example.com';
  const DEMO_PASS = 'password';
  if (email === DEMO_EMAIL && password === DEMO_PASS) {
    const payload = { userId: 'demo-user', email: DEMO_EMAIL };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);
    refreshStore.add(refreshToken);
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });
    return res.json({ accessToken });
  }

  return res.status(401).json({ error: 'invalid credentials' });
});

/**
 * POST /api/auth/refresh
 * Uses httpOnly refreshToken cookie (or body.refreshToken) to issue a new access token
 */
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token provided' });
  if (!refreshStore.has(token)) return res.status(403).json({ error: 'Invalid refresh token' });

  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    const newAccess = createAccessToken({ userId: payload.userId, email: payload.email });
    // Optionally rotate refresh: issue new refresh and remove old (not done here)
    return res.json({ accessToken: newAccess });
  } catch (err) {
    console.error('[auth] refresh verify error', err);
    return res.status(403).json({ error: 'Invalid refresh token' });
  }
});

/**
 * POST /api/auth/logout
 * Clears refresh token cookie and revokes refresh token
 */
router.post('/logout', (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) refreshStore.delete(token);
  res.clearCookie('refreshToken');
  return res.json({ ok: true });
});

/**
 * authMiddleware - protect endpoints:
 * Checks Authorization: Bearer <token>
 */
function authMiddleware(req, res, next) {
  const auth = req.headers['authorization'] || req.headers['Authorization'];
  if (!auth) return res.status(401).json({ error: 'No token provided' });
  const parts = auth.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') return res.status(401).json({ error: 'Invalid auth header' });
  const token = parts[1];
  try {
    const payload = jwt.verify(token, ACCESS_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid token' });
  }
}

module.exports = { authRouter: router, authMiddleware };
