const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db');
const { requireRole } = require('../middleware/auth');

// Register a new user (handles /api/register)
router.post('/', async (req, res) => {
  console.log('POST /api/register received:', req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const row = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    const role = row.count === 0 ? 'admin' : 'viewer';
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
      [username, hashedPassword, role],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Username already exists' });
        }
        res.json({ id: this.lastID, username, role });
      }
    );
  } catch (err) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login a user (handles /api/login)
router.post('/login', async (req, res) => {
  console.log('POST /api/login received:', req.body);
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) reject(err);
        else resolve(user);
      });
    });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    res.json({ token: user.id, username: user.username, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get all users (handles /api/users)
router.get('/', requireRole(['admin']), (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Update user role (handles /api/users/:id)
router.put('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['admin', 'content_manager', 'viewer'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  if (parseInt(id) === parseInt(req.user.id)) {
    return res.status(403).json({ error: 'Cannot change your own role' });
  }
  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ message: 'Role updated successfully' });
    }
  );
});

module.exports = router;