const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db.js');

// Register a new user (handles /api/register)
router.post('/register', async (req, res) => {
  console.log('POST /api/register received:', req.body);
  const { username, password, nickname } = req.body;
  if (!username || !password || !nickname) {
    return res.status(400).json({ error: 'Username, password, and nickname are required' });
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
      'INSERT INTO users (username, password, role, nickname) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role, nickname],
      function (err) {
        if (err) {
          console.error('Error inserting user:', err);
          if (err.message && err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'Username or nickname already exists' });
          }
          return res.status(500).json({ error: 'Error registering user' });
        }
        res.status(201).json({ id: this.lastID, username, role, nickname });
      }
    );
  } catch (err) {
    console.error('Error registering user:', err);
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
      console.log(`Login attempt failed: User not found for username '${username}'`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      console.log(`Login attempt failed: Password mismatch for username '${username}'`);
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    console.log(`Login successful for user: ${user.username}`);
    res.json({ token: user.id, username: user.username, role: user.role, nickname: user.nickname });
  } catch (err) {
    console.error('Error logging in:', err);
    res.status(500).json({ error: 'Error logging in' });
  }
});

module.exports = router;