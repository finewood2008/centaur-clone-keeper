'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();
router.use(authenticateToken);

// Uploads directory — relative to server/
const UPLOADS_DIR = path.resolve(__dirname, '..', 'uploads');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Max file size: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

/**
 * POST /upload
 * Accepts multipart form-data with a single file field named "file".
 *
 * We use a raw body parser approach (no multer dependency) —
 * reads the entire body as a Buffer, extracts the file from
 * multipart boundaries manually.
 *
 * Returns: { url: "/api/trade/uploads/<filename>", name, size }
 */
router.post('/', (req, res) => {
  const contentType = req.headers['content-type'] || '';

  // ── Base64 JSON upload (simpler, works from any client) ──
  if (contentType.includes('application/json')) {
    try {
      const { name, data, mime } = req.body;
      if (!name || !data) {
        return res.status(400).json({ code: 400, message: 'name and data (base64) are required' });
      }

      const buffer = Buffer.from(data, 'base64');
      if (buffer.length > MAX_SIZE) {
        return res.status(413).json({ code: 413, message: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` });
      }

      const ext = path.extname(name) || '';
      const safeName = `${crypto.randomUUID()}${ext}`;
      const filePath = path.join(UPLOADS_DIR, safeName);

      fs.writeFileSync(filePath, buffer);

      const url = `/api/trade/uploads/${safeName}`;
      return res.status(201).json({
        code: 0,
        data: { url, name, size: buffer.length, mime: mime || 'application/octet-stream' },
        message: 'success',
      });
    } catch (err) {
      console.error('Upload (json) error:', err);
      return res.status(500).json({ code: 500, message: 'Upload failed' });
    }
  }

  // ── Raw binary upload (Content-Type: image/png etc.) ──
  // Client sends: POST /upload?name=photo.png with raw body
  if (!contentType.includes('multipart')) {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const buffer = Buffer.concat(chunks);
        if (buffer.length > MAX_SIZE) {
          return res.status(413).json({ code: 413, message: `File too large (max ${MAX_SIZE / 1024 / 1024}MB)` });
        }

        const originalName = req.query.name || 'upload';
        const ext = path.extname(originalName) || '';
        const safeName = `${crypto.randomUUID()}${ext}`;
        const filePath = path.join(UPLOADS_DIR, safeName);

        fs.writeFileSync(filePath, buffer);

        const url = `/api/trade/uploads/${safeName}`;
        return res.status(201).json({
          code: 0,
          data: { url, name: originalName, size: buffer.length, mime: contentType },
          message: 'success',
        });
      } catch (err) {
        console.error('Upload (raw) error:', err);
        return res.status(500).json({ code: 500, message: 'Upload failed' });
      }
    });
    return;
  }

  // Multipart not supported without multer — return helpful error
  return res.status(415).json({
    code: 415,
    message: 'Multipart upload not supported. Use JSON base64 upload: { name, data, mime }',
  });
});

module.exports = router;
