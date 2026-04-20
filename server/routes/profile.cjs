'use strict';

const express = require('express');
const { db } = require('../db.cjs');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();
router.use(authenticateToken);

function ok(data) {
  return { code: 0, data, message: 'success' };
}

// GET / - get current user profile
router.get('/', (req, res) => {
  try {
    const profile = db.prepare(
      'SELECT * FROM profiles WHERE id = ?'
    ).get(req.userId);
    if (!profile) return res.status(404).json({ code: 404, message: 'Profile not found' });

    // Don't leak password hash or API key
    const { password_hash, google_api_key, ...safe } = profile;
    // Indicate whether API key is set, without exposing it
    safe.has_api_key = !!google_api_key;
    res.json(ok(safe));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT / - update current user profile
router.put('/', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM profiles WHERE id = ?'
    ).get(req.userId);
    if (!existing) return res.status(404).json({ code: 404, message: 'Profile not found' });

    const { full_name, company_name, avatar_url, google_api_key, google_model } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE profiles SET
        full_name = ?, company_name = ?, avatar_url = ?,
        google_api_key = ?, google_model = ?, updated_at = ?
      WHERE id = ?
    `).run(
      full_name !== undefined ? full_name : existing.full_name,
      company_name !== undefined ? company_name : existing.company_name,
      avatar_url !== undefined ? avatar_url : existing.avatar_url,
      google_api_key !== undefined ? google_api_key : existing.google_api_key,
      google_model !== undefined ? google_model : existing.google_model,
      now, req.userId
    );

    const updated = db.prepare('SELECT * FROM profiles WHERE id = ?').get(req.userId);
    const { password_hash, google_api_key: key, ...safe } = updated;
    safe.has_api_key = !!key;
    res.json(ok(safe));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
