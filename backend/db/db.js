const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config.js');

const initializeDatabase = () => {
  const db = new sqlite3.Database('./db/cms.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    console.log('Connected to SQLite database.');
  });

  const origin = config.ORIGIN || 'http://localhost:5173';

  // Create posts table
  db.run(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      published BOOLEAN DEFAULT 1
    )`, (err) => {
    if (err) {
      console.error('Error creating posts table:', err.message);
    } else {
      console.log('Posts table ready.');
    }
  });

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      nickname TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      avatar TEXT DEFAULT '${origin}/public/1337+.png'
    )`, (err) => {
    if (err) {
      console.error('Error creating users table:', err.message);
    } else {
      console.log('Users table ready.');
    }
  });

  // Create design_settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS design_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      header_text TEXT NOT NULL DEFAULT '1337+',
      primary_color TEXT NOT NULL DEFAULT '#439d2a',
      secondary_color TEXT NOT NULL DEFAULT '#525252',
      logo_img TEXT NOT NULL DEFAULT '69da57ca1fc90133789ea748db46a383'
    )`, (err) => {
    if (err) {
      console.error('Error creating design_settings table:', err.message);
      return;
    }
    console.log('Design settings table ready.');
    // Insert default design settings
    db.get('SELECT COUNT(*) as count FROM design_settings', (err, row) => {
      if (err) {
        console.error('Error checking design settings:', err.message);
        return;
      }
      if (row.count === 0) {
        db.run(
          'INSERT INTO design_settings (header_text, primary_color, secondary_color, logo_img) VALUES (?, ?, ?, ?)',
          ['1337+', '#439d2a', '#525252', '69da57ca1fc90133789ea748db46a383'],
          (err) => {
            if (err) {
              console.error('Error inserting default design settings:', err.message);
            } else {
              console.log('Default design settings inserted.');
            }
          }
        );
      }
    });
  });

  return db;
};

module.exports = initializeDatabase();