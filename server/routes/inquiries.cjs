'use strict';

const express = require('express');
const crypto = require('crypto');
const { db } = require('../db.cjs');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();
router.use(authenticateToken);

function ok(data) {
  return { code: 0, data, message: 'success' };
}

function parseInquiry(row) {
  if (!row) return null;
  return { ...row, unread: !!row.unread };
}

function parseMessage(row) {
  if (!row) return null;
  return { ...row, ai_generated: !!row.ai_generated };
}

// ============================================================================
// INQUIRIES
// ============================================================================

// GET / - list inquiries
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM inquiries WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.userId);
    res.json(ok(rows.map(parseInquiry)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// GET /:id - get inquiry with messages
router.get('/:id', (req, res) => {
  try {
    const inquiry = db.prepare(
      'SELECT * FROM inquiries WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!inquiry) return res.status(404).json({ code: 404, message: 'Inquiry not found' });

    const messages = db.prepare(
      'SELECT * FROM messages WHERE inquiry_id = ? ORDER BY created_at ASC'
    ).all(req.params.id);

    res.json(ok({ ...parseInquiry(inquiry), messages: messages.map(parseMessage) }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// POST / - create inquiry
router.post('/', (req, res) => {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const {
      name, company, email, avatar, channel, subject,
      last_message, priority, ai_score, status
    } = req.body;

    if (!name) {
      return res.status(400).json({ code: 400, message: 'name is required' });
    }

    db.prepare(`
      INSERT INTO inquiries (id, user_id, customer_id, name, company, email, avatar,
        channel, subject, last_message, priority, ai_score, unread, status, created_at, updated_at)
      VALUES (?, ?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `).run(
      id, req.userId, name, company || null, email || null, avatar || null,
      channel || 'Email', subject || null, last_message || null,
      priority || 'medium', ai_score || 0, status || 'open', now, now
    );

    const inquiry = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(id);
    res.status(201).json(ok(parseInquiry(inquiry)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT /:id - update inquiry
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM inquiries WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ code: 404, message: 'Inquiry not found' });

    const {
      name, company, email, avatar, channel, subject,
      last_message, priority, ai_score, unread, status, customer_id
    } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE inquiries SET
        customer_id = ?, name = ?, company = ?, email = ?, avatar = ?,
        channel = ?, subject = ?, last_message = ?, priority = ?,
        ai_score = ?, unread = ?, status = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      customer_id !== undefined ? customer_id : existing.customer_id,
      name ?? existing.name,
      company !== undefined ? company : existing.company,
      email !== undefined ? email : existing.email,
      avatar !== undefined ? avatar : existing.avatar,
      channel ?? existing.channel,
      subject !== undefined ? subject : existing.subject,
      last_message !== undefined ? last_message : existing.last_message,
      priority ?? existing.priority,
      ai_score !== undefined ? ai_score : existing.ai_score,
      unread !== undefined ? (unread ? 1 : 0) : existing.unread,
      status ?? existing.status,
      now, req.params.id, req.userId
    );

    const updated = db.prepare('SELECT * FROM inquiries WHERE id = ?').get(req.params.id);
    res.json(ok(parseInquiry(updated)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// DELETE /:id - delete inquiry (cascades to messages)
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM inquiries WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ code: 404, message: 'Inquiry not found' });
    res.json(ok({ deleted: true }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// ============================================================================
// MESSAGES (under inquiry)
// ============================================================================

// POST /:id/messages - add message to inquiry
router.post('/:id/messages', (req, res) => {
  try {
    const inquiry = db.prepare(
      'SELECT id FROM inquiries WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!inquiry) return res.status(404).json({ code: 404, message: 'Inquiry not found' });

    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const { text, sender, subject, ai_generated } = req.body;

    if (!text || !sender) {
      return res.status(400).json({ code: 400, message: 'text and sender are required' });
    }

    db.prepare(`
      INSERT INTO messages (id, inquiry_id, sender, text, subject, ai_generated, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.params.id, sender, text, subject || null, ai_generated ? 1 : 0, now);

    // Update inquiry timestamp + unread if from customer
    if (sender === 'customer') {
      db.prepare(
        'UPDATE inquiries SET updated_at = ?, last_message = ?, unread = 1 WHERE id = ?'
      ).run(now, text.substring(0, 200), req.params.id);
    } else {
      db.prepare(
        'UPDATE inquiries SET updated_at = ?, last_message = ? WHERE id = ?'
      ).run(now, text.substring(0, 200), req.params.id);
    }

    const message = db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    res.status(201).json(ok(parseMessage(message)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// DELETE /:inquiryId/messages/:msgId
router.delete('/:inquiryId/messages/:msgId', (req, res) => {
  try {
    const inquiry = db.prepare(
      'SELECT id FROM inquiries WHERE id = ? AND user_id = ?'
    ).get(req.params.inquiryId, req.userId);
    if (!inquiry) return res.status(404).json({ code: 404, message: 'Inquiry not found' });

    const result = db.prepare(
      'DELETE FROM messages WHERE id = ? AND inquiry_id = ?'
    ).run(req.params.msgId, req.params.inquiryId);

    if (result.changes === 0) return res.status(404).json({ code: 404, message: 'Message not found' });
    res.json(ok({ deleted: true }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
