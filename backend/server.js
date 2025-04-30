const express = require('express');
const cors = require('cors');

const postsRouter = require('./routes/posts');
const designRouter = require('./routes/design');
const usersRouter = require('./routes/users');
const CONFIG = require('./config/config.js');  
const app = express();

const config = CONFIG.config || CONFIG; // Support both direct and named export
const { API_PORT, ORIGIN } = config;

// CORS middleware with dynamic origin validation
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