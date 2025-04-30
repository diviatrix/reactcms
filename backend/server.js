require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer'); // Add multer

const postsRouter = require('./routes/posts');
const designRouter = require('./routes/design');
const usersRouter = require('./routes/users');
const CONFIG = require('./config/config.json');
const app = express();

const config = CONFIG.config || CONFIG;
const { API_PORT, ORIGIN } = config;

// Configure multer (store files in 'uploads/' directory or customize as needed)
const upload = multer({ dest: 'uploads/' }); // Create 'uploads/' directory in your project root

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
app.use('/api/users', usersRouter);
app.post('/api/register', usersRouter.stack.find(layer => layer.route?.path === '/').route.stack[0].handle);
app.post('/api/login', usersRouter.stack.find(layer => layer.route?.path === '/login').route.stack[0].handle);

// Start server
app.listen(API_PORT, () => {
  console.log(`API Server port ${API_PORT}`);
  console.log('Server has started successfully!');
});