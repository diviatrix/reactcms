const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer to store files (adjust as needed)
const upload = multer({ dest: 'uploads/' });

// Get design settings
router.get('/', (req, res) => {
  console.log('GET /api/design received');
  db.get('SELECT * FROM design_settings WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Design settings not found' });
    }
    res.json(row);
  });
});

// Update design settings
router.put('/', requireRole(['admin']), upload.single('file'), (req, res) => {
  console.log('PUT /api/design received:', req.body, req.file); // Debug
  const { header_text, primary_color, secondary_color } = req.body;
  if (!header_text || !primary_color || !secondary_color) {
    return res.status(400).json({ error: 'Header text, primary color, and secondary color are required' });
  }
  db.run(
    'INSERT OR REPLACE INTO design_settings (id, header_text, primary_color, secondary_color) VALUES (1, ?, ?, ?)',
    [header_text, primary_color, secondary_color],
    function (err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      // Optionally handle file (e.g., save file path to DB)
      res.json({ message: 'Design settings updated successfully' });
    }
  );
});

module.exports = router;