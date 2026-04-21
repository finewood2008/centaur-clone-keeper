'use strict';

const express = require('express');
const crypto = require('crypto');
const { db } = require('../db.cjs');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// ---------------------------------------------------------------------------
// Helper: parse JSON string fields on a content_post row
// ---------------------------------------------------------------------------
function parsePost(row) {
  if (!row) return null;
  try {
    return {
      ...row,
      platforms: row.platforms ? JSON.parse(row.platforms) : ['linkedin'],
      hashtags: row.hashtags ? JSON.parse(row.hashtags) : [],
      media_urls: row.media_urls ? JSON.parse(row.media_urls) : [],
    };
  } catch (_e) {
    return {
      ...row,
      platforms: ['linkedin'],
      hashtags: [],
      media_urls: [],
    };
  }
}

// ---------------------------------------------------------------------------
// GET / — list all content posts for the current user
// Query params: ?status=draft|scheduled|published|failed
// ---------------------------------------------------------------------------
router.get('/', (req, res) => {
  try {
    const userId = req.userId;
    const { status } = req.query;

    let sql = 'SELECT * FROM content_posts WHERE user_id = ?';
    const params = [userId];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY scheduled_at DESC, created_at DESC';

    const rows = db.prepare(sql).all(...params);
    const posts = rows.map(parsePost);

    return res.json({ code: 0, data: posts, message: 'success' });
  } catch (err) {
    console.error('GET /content error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to fetch content posts' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get a single content post by id
// ---------------------------------------------------------------------------
router.get('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const row = db.prepare(
      'SELECT * FROM content_posts WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!row) {
      return res.status(404).json({ code: 404, message: 'Content post not found' });
    }

    return res.json({ code: 0, data: parsePost(row), message: 'success' });
  } catch (err) {
    console.error('GET /content/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to fetch content post' });
  }
});

// ---------------------------------------------------------------------------
// POST / — create a new content post
// ---------------------------------------------------------------------------
router.post('/', (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const {
      title,
      content = '',
      platforms = ['linkedin'],
      status = 'draft',
      scheduled_at,
      theme,
      style,
      hashtags = [],
      media_urls = [],
      ai_generated = 0,
    } = req.body;

    if (!title) {
      return res.status(400).json({ code: 400, message: 'Title is required' });
    }

    db.prepare(`
      INSERT INTO content_posts (
        id, user_id, title, content, platforms, status, scheduled_at,
        published_at, theme, style, hashtags, media_urls, ai_generated,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, userId, title, content,
      JSON.stringify(platforms), status, scheduled_at || null,
      null, theme || null, style || null,
      JSON.stringify(hashtags), JSON.stringify(media_urls),
      ai_generated ? 1 : 0, now, now
    );

    const row = db.prepare('SELECT * FROM content_posts WHERE id = ?').get(id);
    return res.status(201).json({ code: 0, data: parsePost(row), message: 'success' });
  } catch (err) {
    console.error('POST /content error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to create content post' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — update a content post. Only update provided fields.
// ---------------------------------------------------------------------------
router.put('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const existing = db.prepare(
      'SELECT * FROM content_posts WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!existing) {
      return res.status(404).json({ code: 404, message: 'Content post not found' });
    }

    const now = new Date().toISOString();
    const {
      title = existing.title,
      content = existing.content,
      platforms,
      status = existing.status,
      scheduled_at = existing.scheduled_at,
      published_at = existing.published_at,
      theme = existing.theme,
      style = existing.style,
      hashtags,
      media_urls,
      ai_generated = existing.ai_generated,
    } = req.body;

    const platformsStr = platforms !== undefined ? JSON.stringify(platforms) : existing.platforms;
    const hashtagsStr = hashtags !== undefined ? JSON.stringify(hashtags) : existing.hashtags;
    const mediaUrlsStr = media_urls !== undefined ? JSON.stringify(media_urls) : existing.media_urls;

    db.prepare(`
      UPDATE content_posts SET
        title = ?, content = ?, platforms = ?, status = ?,
        scheduled_at = ?, published_at = ?, theme = ?, style = ?,
        hashtags = ?, media_urls = ?, ai_generated = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      title, content, platformsStr, status,
      scheduled_at, published_at, theme, style,
      hashtagsStr, mediaUrlsStr, ai_generated ? 1 : 0, now,
      req.params.id, userId
    );

    const row = db.prepare('SELECT * FROM content_posts WHERE id = ?').get(req.params.id);
    return res.json({ code: 0, data: parsePost(row), message: 'success' });
  } catch (err) {
    console.error('PUT /content/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to update content post' });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — delete a content post belonging to the current user
// ---------------------------------------------------------------------------
router.delete('/:id', (req, res) => {
  try {
    const userId = req.userId;
    const existing = db.prepare(
      'SELECT id FROM content_posts WHERE id = ? AND user_id = ?'
    ).get(req.params.id, userId);

    if (!existing) {
      return res.status(404).json({ code: 404, message: 'Content post not found' });
    }

    db.prepare('DELETE FROM content_posts WHERE id = ? AND user_id = ?').run(req.params.id, userId);
    return res.json({ code: 0, data: null, message: 'success' });
  } catch (err) {
    console.error('DELETE /content/:id error:', err);
    return res.status(500).json({ code: 500, message: 'Failed to delete content post' });
  }
});

// ---------------------------------------------------------------------------
// POST /batch — create multiple content posts at once
// Body: { posts: [ { title, content, ... }, ... ] }
// ---------------------------------------------------------------------------
router.post('/batch', (req, res) => {
  try {
    const userId = req.userId;
    const { posts } = req.body;

    if (!Array.isArray(posts) || posts.length === 0) {
      return res.status(400).json({ code: 400, message: 'posts array is required and must not be empty' });
    }

    const now = new Date().toISOString();
    const insertStmt = db.prepare(`
      INSERT INTO content_posts (
        id, user_id, title, content, platforms, status, scheduled_at,
        published_at, theme, style, hashtags, media_urls, ai_generated,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const ids = [];
    const insertAll = db.transaction(() => {
      for (const post of posts) {
        const id = crypto.randomUUID();
        ids.push(id);

        const {
          title,
          content = '',
          platforms = ['linkedin'],
          status = 'draft',
          scheduled_at,
          theme,
          style,
          hashtags = [],
          media_urls = [],
          ai_generated = 0,
        } = post;

        if (!title) {
          throw new Error('Each post must have a title');
        }

        insertStmt.run(
          id, userId, title, content,
          JSON.stringify(platforms), status, scheduled_at || null,
          null, theme || null, style || null,
          JSON.stringify(hashtags), JSON.stringify(media_urls),
          ai_generated ? 1 : 0, now, now
        );
      }
    });

    insertAll();

    // Fetch all created posts
    const placeholders = ids.map(() => '?').join(',');
    const rows = db.prepare(
      `SELECT * FROM content_posts WHERE id IN (${placeholders}) ORDER BY created_at DESC`
    ).all(...ids);
    const created = rows.map(parsePost);

    return res.status(201).json({ code: 0, data: created, message: 'success' });
  } catch (err) {
    console.error('POST /content/batch error:', err);
    const message = err.message === 'Each post must have a title'
      ? err.message
      : 'Failed to create content posts';
    return res.status(400).json({ code: 400, message });
  }
});

module.exports = router;
