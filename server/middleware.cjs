const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.TRADE_JWT_SECRET || 'centaur-trade-local-secret-key';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ code: 401, message: 'Token required' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId || decoded.id || decoded.sub;
    next();
  } catch (_err) {
    return res.status(403).json({ code: 403, message: 'Invalid token' });
  }
}

module.exports = { authenticateToken, JWT_SECRET };
