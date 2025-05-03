const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db/db.js');
const { requireRole } = require('../middleware/auth.js');

// Get all users (handles /api/users) - Requires admin role
router.get('/', requireRole(['admin']), (_req, res) => {
  db.all('SELECT id, username, role, nickname FROM users', [], (err, rows) => {
    if (err) {
      console.error('Database error fetching users:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Delete a user (handles /api/users/:id) - Requires admin role
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  if (req.user && parseInt(id) === parseInt(req.user.id)) {
    return res.status(403).json({ error: 'Cannot delete your own account' });
  }
  db.run('DELETE FROM users WHERE id = ?', [id], function (err) {
    if (err) {
      console.error('Database error deleting user:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  });
});

// Update user (handles /api/users/:id) - Requires admin role
router.put('/:id', requireRole(['admin']), async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const allowedFields = ['role', 'nickname', 'username', 'password'];
  const updates = [];
  const params = [];
  let hashedPassword;

  try {
    for (const field in updateData) {
      if (!allowedFields.includes(field)) {
        return res.status(400).json({ error: `Cannot update field: ${field}` });
      }

      const value = updateData[field];

      switch (field) {
        case 'role':
          const validRoles = ['admin', 'content_manager', 'commenter', 'viewer'];
          if (!validRoles.includes(value)) {
            return res.status(400).json({ error: 'Invalid role' });
          }
          if (req.user && parseInt(id) === parseInt(req.user.id)) {
            return res.status(403).json({ error: 'Cannot change your own role' });
          }
          updates.push('role = ?');
          params.push(value);
          break;

        case 'nickname':
          if (!value || String(value).trim() === '') {
            return res.status(400).json({ error: 'Nickname cannot be empty' });
          }
          updates.push('nickname = ?');
          params.push(String(value).trim());
          break;

        case 'username':
          if (!value || String(value).trim() === '') {
            return res.status(400).json({ error: 'Username cannot be empty' });
          }
          updates.push('username = ?');
          params.push(String(value).trim());
          break;

        case 'password':
          if (!value || String(value).length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
          }
          hashedPassword = await bcrypt.hash(String(value), 10);
          updates.push('password = ?');
          params.push(hashedPassword);
          break;
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields provided for update.' });
    }

    params.push(id);

    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

    db.run(query, params, function (err) {
      if (err) {
        if (err.message && err.message.includes('UNIQUE constraint failed')) {
          const fieldWithError = err.message.includes('username') ? 'username' : err.message.includes('nickname') ? 'nickname' : 'field';
          return res.status(400).json({ error: `The provided ${fieldWithError} already exists` });
        }
        console.error(`Database error updating user:`, err);
        return res.status(500).json({ error: 'Database error during update' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'User not found or no changes made' });
      }
      res.json({ message: 'User updated successfully' });
    });
  } catch (err) {
    console.error(`Error processing user update:`, err);
    res.status(500).json({ error: `Error updating user` });
  }
});

module.exports = router;