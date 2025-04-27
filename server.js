const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./cms.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database.');
    // Create posts table with published column
    db.run(`CREATE TABLE IF NOT EXISTS posts (
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
    // Create users table with role column
    db.run(`CREATE TABLE IF NOT EXISTS users (
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
    db.run(`CREATE TABLE IF NOT EXISTS design_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      header_text TEXT NOT NULL DEFAULT 'Welcome to Our Website',
      primary_color TEXT NOT NULL DEFAULT '#2563eb',
      secondary_color TEXT NOT NULL DEFAULT '#f97316'
    )`, (err) => {
      if (err) {
        console.error('Error creating design_settings table:', err.message);
      } else {
        console.log('Design settings table ready.');
        // Insert default design settings if none exist
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
      }
    });
  }
});

// Middleware to check user role
const requireRole = (roles) => (req, res, next) => {
  const { token } = req.headers;
  if (!token) {
    return res.status(401).json({ error: 'Authentication token required' });
  }
  db.get('SELECT * FROM users WHERE id = ?', [token], (err, user) => {
    if (err) {
      return res.status(500).json({ error: err.message });
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

// API Routes for Posts
// Get all posts (admins and content managers see all, viewers see only published)
app.get('/api/posts', requireRole(['admin', 'content_manager', 'viewer']), (req, res) => {
  const query = req.user.role === 'viewer' 
    ? 'SELECT * FROM posts WHERE published = 1' 
    : 'SELECT * FROM posts';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Create a new post (only for admins and content managers)
app.post('/api/posts', requireRole(['admin', 'content_manager']), (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: 'Title and content are required' });
    return;
  }
  db.run(
    'INSERT INTO posts (title, content, published) VALUES (?, ?, ?)',
    [title, content, 1],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id: this.lastID, title, content, published: 1, created_at: new Date().toISOString() });
    }
  );
});

// Update a post (only for admins and content managers)
app.put('/api/posts/:id', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;
  if (!title || !content || typeof published !== 'boolean') {
    res.status(400).json({ error: 'Title, content, and published status are required' });
    return;
  }
  db.run(
    'UPDATE posts SET title = ?, content = ?, published = ? WHERE id = ?',
    [title, content, published ? 1 : 0, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json({ message: 'Post updated successfully' });
    }
  );
});

// Unpublish a post (only for admins and content managers)
app.put('/api/posts/:id/unpublish', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE posts SET published = 0 WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json({ message: 'Post unpublished successfully' });
    }
  );
});

// Publish a post (only for admins and content managers)
app.put('/api/posts/:id/publish', requireRole(['admin', 'content_manager']), (req, res) => {
  const { id } = req.params;
  db.run(
    'UPDATE posts SET published = 1 WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json({ message: 'Post published successfully' });
    }
  );
});

// Delete a post (only for admins)
app.delete('/api/posts/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  db.run(
    'DELETE FROM posts WHERE id = ?',
    [id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }
      res.json({ message: 'Post deleted successfully' });
    }
  );
});

// API Routes for Design Settings
// Get design settings (accessible to all roles)
app.get('/api/design', (req, res) => {
  db.get('SELECT * FROM design_settings WHERE id = 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Design settings not found' });
      return;
    }
    res.json(row);
  });
});

// Update design settings (only for admins)
app.put('/api/design', requireRole(['admin']), (req, res) => {
  const { header_text, primary_color, secondary_color } = req.body;
  if (!header_text || !primary_color || !secondary_color) {
    res.status(400).json({ error: 'Header text, primary color, and secondary color are required' });
    return;
  }
  db.run(
    'INSERT OR REPLACE INTO design_settings (id, header_text, primary_color, secondary_color) VALUES (1, ?, ?, ?)',
    [header_text, primary_color, secondary_color],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ message: 'Design settings updated successfully' });
    }
  );
});

// API Routes for Users
// Register a new user
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  try {
    // Check if this is the first user
    db.get('SELECT COUNT(*) as count FROM users', async (err, row) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const role = row.count === 0 ? 'admin' : 'viewer';
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
        [username, hashedPassword, role],
        function (err) {
          if (err) {
            res.status(400).json({ error: 'Username already exists' });
            return;
          }
          res.json({ id: this.lastID, username, role });
        }
      );
    });
  } catch (err) {
    res.status(500).json({ error: 'Error registering user' });
  }
});

// Login a user
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: 'Username and password are required' });
    return;
  }
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!user) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }
    try {
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        res.status(401).json({ error: 'Invalid username or password' });
        return;
      }
      res.json({ token: user.id, username: user.username, role: user.role });
    } catch (err) {
      res.status(500).json({ error: 'Error logging in' });
    }
  });
});

// Get all users (only for admins)
app.get('/api/users', requireRole(['admin']), (req, res) => {
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Update user role (only for admins)
app.put('/api/users/:id', requireRole(['admin']), (req, res) => {
  const { id } = req.params;
  const { role } = req.body;
  const validRoles = ['admin', 'content_manager', 'viewer'];
  if (!validRoles.includes(role)) {
    res.status(400).json({ error: 'Invalid role' });
    return;
  }
  // Prevent the admin from changing their own role
  if (parseInt(id) === parseInt(req.user.id)) {
    res.status(403).json({ error: 'Cannot change your own role' });
    return;
  }
  db.run(
    'UPDATE users SET role = ? WHERE id = ?',
    [role, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      res.json({ message: 'Role updated successfully' });
    }
  );
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});