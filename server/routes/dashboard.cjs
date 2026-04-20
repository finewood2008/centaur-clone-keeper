'use strict';

const express = require('express');
const { db } = require('../db.cjs');
const { authenticateToken } = require('../middleware.cjs');

const router = express.Router();
router.use(authenticateToken);

function ok(data) {
  return { code: 0, data, message: 'success' };
}

// GET / - dashboard overview stats
router.get('/', (req, res) => {
  try {
    const uid = req.userId;

    // Customer stats
    const totalCustomers = db.prepare('SELECT COUNT(*) as cnt FROM customers WHERE user_id = ?').get(uid).cnt;
    const activeCustomers = db.prepare("SELECT COUNT(*) as cnt FROM customers WHERE user_id = ? AND status = 'active'").get(uid).cnt;
    const tierA = db.prepare("SELECT COUNT(*) as cnt FROM customers WHERE user_id = ? AND tier = 'A'").get(uid).cnt;

    // Product stats
    const totalProducts = db.prepare('SELECT COUNT(*) as cnt FROM products WHERE user_id = ?').get(uid).cnt;
    const activeProducts = db.prepare("SELECT COUNT(*) as cnt FROM products WHERE user_id = ? AND status = 'active'").get(uid).cnt;
    const totalViews = db.prepare('SELECT COALESCE(SUM(views), 0) as total FROM products WHERE user_id = ?').get(uid).total;

    // Inquiry stats
    const totalInquiries = db.prepare('SELECT COUNT(*) as cnt FROM inquiries WHERE user_id = ?').get(uid).cnt;
    const openInquiries = db.prepare("SELECT COUNT(*) as cnt FROM inquiries WHERE user_id = ? AND status = 'open'").get(uid).cnt;
    const unreadInquiries = db.prepare('SELECT COUNT(*) as cnt FROM inquiries WHERE user_id = ? AND unread = 1').get(uid).cnt;
    const highPriority = db.prepare("SELECT COUNT(*) as cnt FROM inquiries WHERE user_id = ? AND priority = 'high'").get(uid).cnt;

    // Revenue stats
    const totalRevenue = db.prepare('SELECT COALESCE(SUM(total_value), 0) as total FROM customers WHERE user_id = ?').get(uid).total;
    const totalOrders = db.prepare('SELECT COALESCE(SUM(total_orders), 0) as total FROM customers WHERE user_id = ?').get(uid).total;

    // Recent inquiries (top 5)
    const recentInquiries = db.prepare(`
      SELECT id, name, company, channel, subject, last_message, priority, ai_score, unread, status, created_at
      FROM inquiries WHERE user_id = ? ORDER BY created_at DESC LIMIT 5
    `).all(uid).map(r => ({ ...r, unread: !!r.unread }));

    // Top customers (by value)
    const topCustomers = db.prepare(`
      SELECT id, name, company, country, tier, ai_score, total_orders, total_value, status
      FROM customers WHERE user_id = ? ORDER BY total_value DESC LIMIT 5
    `).all(uid);

    // Channel distribution
    const channelDist = db.prepare(`
      SELECT channel, COUNT(*) as count FROM inquiries WHERE user_id = ? GROUP BY channel ORDER BY count DESC
    `).all(uid);

    res.json(ok({
      customers: { total: totalCustomers, active: activeCustomers, tierA },
      products: { total: totalProducts, active: activeProducts, totalViews },
      inquiries: { total: totalInquiries, open: openInquiries, unread: unreadInquiries, highPriority },
      revenue: { total: totalRevenue, orders: totalOrders },
      recentInquiries,
      topCustomers,
      channelDistribution: channelDist,
    }));
  } catch (e) {
    res.status(500).json({ code: 500, message: e.message });
  }
});

module.exports = router;
