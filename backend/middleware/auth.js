const db = require('../db/db');

const requireRole = (roles) => (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  db.get('SELECT * FROM users WHERE id = ?', [token], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    req.user = user;
    next();
  });
};

module.exports = { requireRole };