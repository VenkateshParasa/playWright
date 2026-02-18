const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));

// Serve static files from data directory
app.use('/data', express.static(path.join(__dirname, 'data')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend server is running' });
});

// API endpoint to list available lessons
app.get('/api/lessons', (req, res) => {
  res.json({
    message: 'Lessons are available at /data/lessons/',
    endpoints: {
      index: '/data/lessons/index.json',
      playwright_beginner: '/data/lessons/playwright/beginner/',
      playwright_intermediate: '/data/lessons/playwright/intermediate/',
      playwright_advanced: '/data/lessons/playwright/advanced/',
      selenium_beginner: '/data/lessons/selenium/beginner/',
      selenium_intermediate: '/data/lessons/selenium/intermediate/',
      selenium_advanced: '/data/lessons/selenium/advanced/'
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📚 Lessons available at http://localhost:${PORT}/data/lessons/`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});