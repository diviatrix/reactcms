const sqlite3 = require('sqlite3').verbose();

const initializeDatabase = () => {
  const db = new sqlite3.Database('./db/cms.db', (err) => {
    if (err) {
      console.error('Error opening database:', err.message);
      return;
    }
    console.log('Connected to SQLite database.');
  });

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
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer'
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
      header_text TEXT NOT NULL DEFAULT 'Welcome to Our Website',
      primary_color TEXT NOT NULL DEFAULT '#2563eb',
      secondary_color TEXT NOT NULL DEFAULT '#f97316'
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
          'INSERT INTO design_settings (header_text, primary_color, secondary_color) VALUES (?, ?, ?)',
          ['Welcome to Our Website', '#2563eb', '#f97316'],
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