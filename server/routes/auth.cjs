'use strict';

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { db } = require('../db.cjs');
const { authenticateToken, JWT_SECRET } = require('../middleware.cjs');

const router = express.Router();

const TOKEN_EXPIRY = '7d';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateToken(profile) {
  return jwt.sign(
    { userId: profile.id, email: profile.email },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
}

function sanitizeProfile(row) {
  if (!row) return null;
  const { password_hash, google_api_key, ...safe } = row;
  safe.has_api_key = !!google_api_key;
  return safe;
}

// ---------------------------------------------------------------------------
// POST /register
// Body: { email, password, full_name, company_name }
// ---------------------------------------------------------------------------
router.post('/register', (req, res) => {
  try {
    const { email, password, full_name, company_name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ code: 400, message: 'Email and password are required' });
    }

    const existing = db.prepare('SELECT id FROM profiles WHERE email = ?').get(email);
    if (existing) {
      return res.status(409).json({ code: 409, message: 'Email already registered' });
    }

    const id = crypto.randomUUID();
    const password_hash = bcrypt.hashSync(password, 10);
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO profiles (id, email, full_name, company_name, password_hash, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, email, full_name || '', company_name || '', password_hash, now, now);

    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id);
    const token = generateToken(profile);

    return res.status(201).json({
      code: 0,
      data: { token, user: sanitizeProfile(profile) },
      message: 'success'
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// POST /login
// Body: { email, password }
// ---------------------------------------------------------------------------
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ code: 400, message: 'Email and password are required' });
    }

    const profile = db.prepare('SELECT * FROM profiles WHERE email = ?').get(email);
    if (!profile) {
      return res.status(401).json({ code: 401, message: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, profile.password_hash);
    if (!valid) {
      return res.status(401).json({ code: 401, message: 'Invalid email or password' });
    }

    const token = generateToken(profile);

    return res.json({
      code: 0,
      data: { token, user: sanitizeProfile(profile) },
      message: 'success'
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

// ---------------------------------------------------------------------------
// GET /me — return current user profile (auth required)
// ---------------------------------------------------------------------------
router.get('/me', authenticateToken, (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.userId);
    if (!profile) {
      return res.status(404).json({ code: 404, message: 'User not found' });
    }
    return res.json({
      code: 0,
      data: sanitizeProfile(profile),
      message: 'success'
    });
  } catch (err) {
    console.error('GET /me error:', err);
    return res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

module.exports = router;
