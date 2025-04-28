const express = require('express');
const cors = require('cors');
const config = require('./config/config.json');
const userConfig = require('./config/user/config.json');
const postsRouter = require('./routes/posts');
const designRouter = require('./routes/design');
const usersRouter = require('./routes/users');

const app = express();

// Merge configurations
API_PORT = userConfig.API_PORT || config.API_PORT;
API_BASE_URL = userConfig.API_BASE_URL || config.API_BASE_URL;
ORIGIN = userConfig.ORIGIN || config.ORIGIN;

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
  console.log(`API Server running on ${API_BASE_URL}`);
  console.log(`API Server port ${API_PORT}`);
  console.log('Server has started successfully!');
});