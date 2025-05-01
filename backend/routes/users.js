const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db');
const { requireRole } = require('../middleware/auth');

// Register a new user (handles /api/register)
router.post('/', async (req, res) => {
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
    const { nickname } = req.body;
    db.run(
      'INSERT INTO users (username, password, role, nickname) VALUES (?, ?, ?, ?)',
      [username, hashedPassword, role, nickname],
      function (err) {
        if (err) {
          return res.status(400).json({ error: 'Username or nickname already exists' });
        }
        res.json({ id: this.lastID, username, role, nickname });
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
    res.json({ token: user.id, username: user.username, role: user.role, nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ error: 'Error logging in' });
  }
});

// Get all users (handles /api/users)
router.get('/', requireRole(['admin']), (req, res) => {
  db.all('SELECT id, username, role, nickname FROM users', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Delete a user (handles /api/users/:id)
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  if (parseInt(id) === parseInt(req.user.id)) {
    return res.status(403).json({ error: 'Cannot delete your own account' });
  }
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Update user (handles /api/users/:id)
router.put('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  
  // Get the field being updated
  const fieldToUpdate = Object.keys(updateData)[0]; 
  const valueToUpdate = updateData[fieldToUpdate];
  
  // Field-specific validations
  switch (fieldToUpdate) {
    case 'role':
      const validRoles = ['admin', 'content_manager', 'commenter', 'viewer'];
      if (!validRoles.includes(valueToUpdate)) {
        return res.status(400).json({ error: 'Invalid role' });
      }
      
      // Prevent changing own role
      if (parseInt(id) === parseInt(req.user.id)) {
        return res.status(403).json({ error: 'Cannot change your own role' });
      }
      break;
      
    case 'nickname':
      if (!valueToUpdate || valueToUpdate.trim() === '') {
        return res.status(400).json({ error: 'Nickname cannot be empty' });
      }
      break;
    
    case 'username':
      if (!valueToUpdate || valueToUpdate.trim() === '') {
        return res.status(400).json({ error: 'Username cannot be empty' });
      }
      break;
    
    case 'password':
      if (!valueToUpdate || valueToUpdate.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
      }
      // Hash the new password
      bcrypt.hash(valueToUpdate, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: 'Error hashing password' });
        }
        db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id], function (err) {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }
          if (this.changes === 0) {
            return res.status(404).json({ error: 'User not found' });
          }
          res.json({ message: 'User password updated successfully' });
        });
      });
      return; // Prevent further execution
    default:
      return res.status(400).json({ error: `Cannot update field: ${fieldToUpdate}` });
  }
  
  // Build the SQL query dynamically
  const query = `UPDATE users SET ${fieldToUpdate} = ? WHERE id = ?`;
  
  db.run(
    query,
    [valueToUpdate, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ 
        message: `User ${fieldToUpdate} updated successfully`,
        [fieldToUpdate]: valueToUpdate
      });
    }
  );
});

module.exports = router;