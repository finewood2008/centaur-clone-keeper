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

function parseProduct(row) {
  if (!row) return null;
  return {
    ...row,
    factory_certs: row.factory_certs ? JSON.parse(row.factory_certs) : [],
    has_bot: !!row.has_bot,
  };
}

// GET / - list products
router.get('/', (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM products WHERE user_id = ? ORDER BY updated_at DESC'
    ).all(req.userId);
    res.json(ok(rows.map(parseProduct)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// GET /:id - get product with specs, images, docs
router.get('/:id', (req, res) => {
  try {
    const product = db.prepare(
      'SELECT * FROM products WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!product) return res.status(404).json({ code: 404, message: 'Product not found' });

    const specs = db.prepare(
      'SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);
    const images = db.prepare(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);
    const docs = db.prepare(
      'SELECT * FROM product_docs WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);

    res.json(ok({
      ...parseProduct(product),
      specs,
      images,
      docs,
    }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// POST / - create product
router.post('/', (req, res) => {
  try {
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const {
      name, category, sku, price, currency, moq, stock, image_url,
      has_bot, factory_name, factory_rating, factory_certs, description, status
    } = req.body;

    if (!name) return res.status(400).json({ code: 400, message: 'name is required' });

    db.prepare(`
      INSERT INTO products (id, user_id, name, category, sku, price, currency, moq, stock, image_url,
        has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, req.userId, name, category || null, sku || null, price || null,
      currency || 'USD', moq || null, stock || null, image_url || null,
      has_bot ? 1 : 0, factory_name || null, factory_rating || null,
      factory_certs ? JSON.stringify(factory_certs) : '[]',
      description || null, status || 'active', now, now
    );

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json(ok(parseProduct(product)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT /:id - update product
router.put('/:id', (req, res) => {
  try {
    const existing = db.prepare(
      'SELECT * FROM products WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!existing) return res.status(404).json({ code: 404, message: 'Product not found' });

    const {
      name, category, sku, price, currency, moq, stock, image_url,
      has_bot, views, inquiries_count, factory_name, factory_rating,
      factory_certs, description, status
    } = req.body;
    const now = new Date().toISOString();

    db.prepare(`
      UPDATE products SET
        name = ?, category = ?, sku = ?, price = ?, currency = ?, moq = ?, stock = ?,
        image_url = ?, has_bot = ?, views = ?, inquiries_count = ?, factory_name = ?,
        factory_rating = ?, factory_certs = ?, description = ?, status = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `).run(
      name ?? existing.name,
      category !== undefined ? category : existing.category,
      sku !== undefined ? sku : existing.sku,
      price !== undefined ? price : existing.price,
      currency !== undefined ? currency : existing.currency,
      moq !== undefined ? moq : existing.moq,
      stock !== undefined ? stock : existing.stock,
      image_url !== undefined ? image_url : existing.image_url,
      has_bot !== undefined ? (has_bot ? 1 : 0) : existing.has_bot,
      views !== undefined ? views : existing.views,
      inquiries_count !== undefined ? inquiries_count : existing.inquiries_count,
      factory_name !== undefined ? factory_name : existing.factory_name,
      factory_rating !== undefined ? factory_rating : existing.factory_rating,
      factory_certs !== undefined ? JSON.stringify(factory_certs) : existing.factory_certs,
      description !== undefined ? description : existing.description,
      status !== undefined ? status : existing.status,
      now, req.params.id, req.userId
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json(ok(parseProduct(updated)));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// DELETE /:id
router.delete('/:id', (req, res) => {
  try {
    const result = db.prepare(
      'DELETE FROM products WHERE id = ? AND user_id = ?'
    ).run(req.params.id, req.userId);
    if (result.changes === 0) return res.status(404).json({ code: 404, message: 'Product not found' });
    res.json(ok({ deleted: true }));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT /:id/specs - replace all specs
router.put('/:id/specs', (req, res) => {
  try {
    const product = db.prepare(
      'SELECT id FROM products WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!product) return res.status(404).json({ code: 404, message: 'Product not found' });

    const { specs = [] } = req.body;
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM product_specs WHERE product_id = ?').run(req.params.id);
      const insert = db.prepare(
        'INSERT INTO product_specs (id, product_id, label, value, sort_order) VALUES (?, ?, ?, ?, ?)'
      );
      for (const s of specs) {
        insert.run(crypto.randomUUID(), req.params.id, s.label, s.value, s.sort_order || 0);
      }
    });
    tx();

    const result = db.prepare(
      'SELECT * FROM product_specs WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);
    res.json(ok(result));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT /:id/images - replace all images
router.put('/:id/images', (req, res) => {
  try {
    const product = db.prepare(
      'SELECT id FROM products WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!product) return res.status(404).json({ code: 404, message: 'Product not found' });

    const { images = [] } = req.body;
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM product_images WHERE product_id = ?').run(req.params.id);
      const insert = db.prepare(
        'INSERT INTO product_images (id, product_id, url, sort_order) VALUES (?, ?, ?, ?)'
      );
      for (const img of images) {
        insert.run(crypto.randomUUID(), req.params.id, img.url, img.sort_order || 0);
      }
    });
    tx();

    const result = db.prepare(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);
    res.json(ok(result));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

// PUT /:id/docs - replace all docs
router.put('/:id/docs', (req, res) => {
  try {
    const product = db.prepare(
      'SELECT id FROM products WHERE id = ? AND user_id = ?'
    ).get(req.params.id, req.userId);
    if (!product) return res.status(404).json({ code: 404, message: 'Product not found' });

    const { docs = [] } = req.body;
    const tx = db.transaction(() => {
      db.prepare('DELETE FROM product_docs WHERE product_id = ?').run(req.params.id);
      const insert = db.prepare(
        'INSERT INTO product_docs (id, product_id, name, file_size, url, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
      );
      for (const d of docs) {
        insert.run(crypto.randomUUID(), req.params.id, d.name, d.file_size || null, d.url || null, d.sort_order || 0);
      }
    });
    tx();

    const result = db.prepare(
      'SELECT * FROM product_docs WHERE product_id = ? ORDER BY sort_order'
    ).all(req.params.id);
    res.json(ok(result));
  } catch (err) {
    res.status(500).json({ code: 500, message: err.message });
  }
});

module.exports = router;
