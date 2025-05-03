require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Add multer

const postsRouter = require('./routes/posts');
const designRouter = require('./routes/design');
const usersRouter = require('./routes/users');
const publicRouter = require('./routes/public');
const CONFIG = require('./config/config.json');
const app = express();

const config = CONFIG.config || CONFIG;
const { API_PORT, ORIGIN } = config;

// Configure multer (store files in 'public/' directory or customize as needed)
const public = multer({ dest: 'public/' }); // Create 'public/' directory in your project root

// CORS middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === ORIGIN) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'token'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Optional: for URL-encoded form data

// Routes
app.use('/api/posts', postsRouter);
app.use('/api/design', designRouter);
app.use('/api/users', usersRouter); // Mount the users router - ensure /register and /login routes are defined within users.js

// Mount the public router for handling uploads API calls
// Ensure routes like GET /, GET /files, GET /:filename, POST /, DELETE /:filename are defined within public.js
// The POST / route within public.js should use upload.single('file') middleware
app.use('/api/public', publicRouter);

// Serve static files directly from the 'uploads' directory at the '/uploads' path
app.use('/public', express.static('public'));


// Start server
app.listen(API_PORT, () => {
  console.log(`API Server port ${API_PORT}`);
  console.log('Server has started successfully!');
});