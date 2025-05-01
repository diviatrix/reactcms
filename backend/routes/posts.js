const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireRole } = require('../middleware/auth');

// Get all posts
router.get('/', (req, res) => {
  const query = req.query.publishedOnly
    ? 'SELECT * FROM posts WHERE published = 1' 
    : 'SELECT * FROM posts';
  db.all(query, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

// Create a new post
router.post('/', requireRole(['admin', 'content_manager']), (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }
  db.run(
    'INSERT INTO posts (title, content, published) VALUES (?, ?, ?)',
    [title, content, 1],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, title, content, published: 1, created_at: new Date().toISOString() });
    }
  );
});

// Update a post
router.put('/:id', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;
  if (!title || !content || typeof published !== 'boolean') {
    return res.status(400).json({ error: 'Title, content, and published status are required' });
  }
  db.run(
    'UPDATE posts SET title = ?, content = ?, published = ? WHERE id = ?',
    [title, content, published ? 1 : 0, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ message: 'Post updated successfully' });
    }
  );
});

// Unpublish a post
router.put('/:id/unpublish', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE posts SET published = 0 WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ message: 'Post unpublished successfully' });
    }
  );
});

// Publish a post
router.put('/:id/publish', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE posts SET published = 1 WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ message: 'Post published successfully' });
    }
  );
});

// Delete a post
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  db.run(
    'DELETE FROM posts WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Post not found' });
      }
      res.json({ message: 'Post deleted successfully' });
    }
  );
});

module.exports = router;