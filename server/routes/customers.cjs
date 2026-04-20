'use strict';

const express = require('express');
const crypto = require('crypto');
const { db } = require('../db.cjs');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ---------------------------------------------------------------------------
// Helper: parse JSON string fields (channels, tags) on a customer row
// ---------------------------------------------------------------------------
function parseCustomer(row) {
  if (!row) return null;
  try {
    return {
      ...row,
      channels: row.channels ? JSON.parse(row.channels) : [],
      tags: row.tags ? JSON.parse(row.tags) : [],
    };
  } catch (_e) {
    return {
      ...row,
      channels: row.channels ? [row.channels] : [],
      tags: row.tags ? [row.tags] : [],
    };
  }
}

// ---------------------------------------------------------------------------
// GET / — list all customers for the current user
// Query params: status, tier, search
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const userId = req.userId;
    const { status, tier, search } = req.query;

    let sql = 'SELECT * FROM customers WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (tier) {
      sql += ' AND tier = ?';
      params.push(tier);
    }
    if (search) {
      sql += ' AND (name LIKE ? OR company LIKE ? OR email LIKE ?)';
      const pattern = `%${search}%`;
      params.push(pattern, pattern, pattern);
    }

    sql += ' ORDER BY updated_at DESC';

    const rows = db.prepare(sql).all(...params);
    const customers = rows.map(parseCustomer);

    return res.json({ code: 0, data: customers, message: 'success' });
  } catch (err) {
    console.error('GET /customers error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to fetch customers' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get a single customer by id
// ---------------------------------------------------------------------------
router.get('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const row = db.prepare(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!row) {
      return res.status(404).json({ code: 404, message: 'Customer not found' });
    }

    return res.json({ code: 0, data: parseCustomer(row), message: 'success' });
  } catch (err) {
    console.error('GET /customers/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to fetch customer' });
  }
});

// ---------------------------------------------------------------------------
// POST / — create a new customer
// Required: name. Auto-set user_id from auth.
// ---------------------------------------------------------------------------
router.post('/', (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const {
      name,
      company,
      country,
      email,
      phone,
      tier = 'C',
      ai_score = 0,
      total_orders = 0,
      total_value = 0,
      last_contact_at,
      channels = [],
      status = 'nurturing',
      tags = [],
      notes,
    } = req.body;

    if (!name) {
      return res.status(400).json({ code: 400, message: 'Name is required' });
    }

    db.prepare(`
      INSERT INTO customers (
        id, user_id, name, company, country, email, phone,
        tier, ai_score, total_orders, total_value, last_contact_at,
        channels, status, tags, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, name, company || null, country || null, email || null, phone || null,
      tier, ai_score, total_orders, total_value, last_contact_at || null,
      JSON.stringify(channels), status, JSON.stringify(tags), notes || null,
      now, now
    );

    const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
    return res.status(201).json({ code: 0, data: parseCustomer(row), message: 'success' });
  } catch (err) {
    console.error('POST /customers error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to create customer' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — update customer fields. Only update provided fields.
// ---------------------------------------------------------------------------
router.put('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const existing = db.prepare(
      'SELECT * FROM customers WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!existing) {
      return res.status(404).json({ code: 404, message: 'Customer not found' });
    }

    const now = new Date().toISOString();
    const {
      name = existing.name,
      company = existing.company,
      country = existing.country,
      email = existing.email,
      phone = existing.phone,
      tier = existing.tier,
      ai_score = existing.ai_score,
      total_orders = existing.total_orders,
      total_value = existing.total_value,
      last_contact_at = existing.last_contact_at,
      channels,
      status = existing.status,
      tags,
      notes = existing.notes,
    } = req.body;

    const channelsStr = channels !== undefined ? JSON.stringify(channels) : existing.channels;
    const tagsStr = tags !== undefined ? JSON.stringify(tags) : existing.tags;

    db.prepare(`
      UPDATE customers SET
        name = ?, company = ?, country = ?, email = ?, phone = ?,
        tier = ?, ai_score = ?, total_orders = ?, total_value = ?,
        last_contact_at = ?, channels = ?, status = ?, tags = ?,
        notes = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name, company, country, email, phone,
      tier, ai_score, total_orders, total_value,
      last_contact_at, channelsStr, status, tagsStr,
      notes, now,
      req.params.id, userId
    );

    const row = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    return res.json({ code: 0, data: parseCustomer(row), message: 'success' });
  } catch (err) {
    console.error('PUT /customers/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to update customer' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — delete a customer belonging to req.userId
// ---------------------------------------------------------------------------
router.delete('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const existing = db.prepare(
      'SELECT id FROM customers WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!existing) {
      return res.status(404).json({ code: 404, message: 'Customer not found' });
    }

    db.prepare('DELETE FROM customers WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    return res.json({ code: 0, data: null, message: 'success' });
  } catch (err) {
    console.error('DELETE /customers/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to delete customer' });
  }
});

module.exports = router;
