const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase } = require('./db.cjs');

const app = express();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '15mb' }));

// Static file serving for uploads
app.use('/api/trade/uploads', express.static(path.resolve(__dirname, '..', 'uploads')));

// Request logging
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/api/trade/health', (_req, res) => {
  res.json({ code: 0, data: { status: 'ok', service: 'trade-api', port: PORT }, message: 'success' });
});

// Mount route files
app.use('/api/trade/auth', require('./routes/auth.cjs'));
app.use('/api/trade/customers', require('./routes/customers.cjs'));
app.use('/api/trade/products', require('./routes/products.cjs'));
app.use('/api/trade/inquiries', require('./routes/inquiries.cjs'));
app.use('/api/trade/profile', require('./routes/profile.cjs'));
app.use('/api/trade/dashboard', require('./routes/dashboard.cjs'));
app.use('/api/trade/upload', require('./routes/upload.cjs'));

// Start server
async function start() {
  try {
    await initDatabase();
    console.log('Database initialized.');
    app.listen(PORT, () => {
      console.log(`Trade API server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();

module.exports = app;
