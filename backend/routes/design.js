const express = require('express');
const router = express.Router();
const db = require('../db/db');
const { requireRole } = require('../middleware/auth');
const multer = require('multer');

// Configure multer to store files (adjust as needed)
const upload = multer({ dest: 'uploads/' });

// Get design settings
router.get('/', (_req, res) => { // Prefix unused 'req' with underscore
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
  console.log('PUT /api/design received:', req.body, req.file);
  const { header_text, primary_color, secondary_color, logo_img } = req.body;
  
  // Check if at least one parameter is provided
  if (!header_text && !primary_color && !secondary_color && !logo_img && !req.file) {
    return res.status(400).json({ error: 'At least one parameter must be provided' });
  }
  
  // First, get the current values to use as defaults
  db.get('SELECT * FROM design_settings WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    
    // Use current values as defaults, or empty strings if no row exists
    const currentValues = row || { header_text: '', primary_color: '', secondary_color: '', logo_img: '' };
    
    const newHeaderText = header_text !== undefined ? header_text : currentValues.header_text;
    const newPrimaryColor = primary_color !== undefined ? primary_color : currentValues.primary_color;
    const newSecondaryColor = secondary_color !== undefined ? secondary_color : currentValues.secondary_color;
    let newLogoImg = logo_img !== undefined ? logo_img : currentValues.logo_img;
    
    // Handle file upload (overrides logo_img from body)
    if (req.file) {
      newLogoImg = req.file.path;
    }
    
    const sql = 'INSERT OR REPLACE INTO design_settings (id, header_text, primary_color, secondary_color, logo_img) VALUES (1, ?, ?, ?, ?)';
    const params = [newHeaderText, newPrimaryColor, newSecondaryColor, newLogoImg];
    
    // Ensure the 'uploads/' directory exists and the server process has write permissions to it on the remote host.
    // This is a common cause for 500 errors during file uploads.
    db.run(sql, params, function (err) {
      if (err) {
        // Log the specific error for better debugging on the server
        console.error('Database error updating design settings:', err.message); 
        return res.status(500).json({ error: 'Database error updating design settings', details: err.message });
      }
      // Fetch the updated row to return it
      db.get('SELECT * FROM design_settings WHERE id = 1', (err, updatedRow) => {
        if (err) {
           console.error('Database error fetching updated design settings:', err.message);
           // Still return success message, but log the fetch error
           return res.json({ message: 'Design settings updated successfully, but failed to fetch updated data.' });
        }
        if (!updatedRow) {
           // Should not happen after successful update, but handle defensively
           return res.status(404).json({ error: 'Updated design settings not found' });
        }
        res.json({ message: 'Design settings updated successfully', settings: updatedRow });
      });
    });
  });
});

module.exports = router;