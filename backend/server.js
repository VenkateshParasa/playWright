const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'],
  credentials: true
}));

// Parse JSON bodies
app.use(express.json());

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

// API endpoint to list all exercises (JavaScript + Java)
app.get('/api/exercises', (req, res) => {
  try {
    const exercisesDir = path.join(__dirname, 'data', 'exercises');

    // Read JavaScript exercises
    const jsIndexPath = path.join(exercisesDir, 'javascript-exercises.json');
    const jsIndexData = fs.readFileSync(jsIndexPath, 'utf8');
    const jsExercises = JSON.parse(jsIndexData);

    // Read Java exercises
    const javaIndexPath = path.join(exercisesDir, 'java-exercises.json');
    const javaIndexData = fs.readFileSync(javaIndexPath, 'utf8');
    const javaExercises = JSON.parse(javaIndexData);

    // Combine both exercise lists
    const allExercises = {
      version: '1.0.0',
      lastUpdated: new Date().toISOString().split('T')[0],
      totalExercises: jsExercises.exercises.length + javaExercises.exercises.length,
      categories: {
        javascript: {
          ...jsExercises,
          count: jsExercises.exercises.length
        },
        java: {
          ...javaExercises,
          count: javaExercises.exercises.length
        }
      },
      exercises: [
        ...jsExercises.exercises,
        ...javaExercises.exercises
      ].sort((a, b) => {
        // Sort by ID to maintain consistent ordering
        return a.id.localeCompare(b.id);
      }),
      statistics: {
        totalExercises: jsExercises.exercises.length + javaExercises.exercises.length,
        totalEstimatedTime: jsExercises.statistics.totalEstimatedTime + javaExercises.statistics.totalEstimatedTime,
        byLanguage: {
          javascript: jsExercises.exercises.length,
          java: javaExercises.exercises.length
        },
        byDifficulty: {
          beginner: jsExercises.difficultyBreakdown.beginner + javaExercises.difficultyBreakdown.beginner,
          intermediate: jsExercises.difficultyBreakdown.intermediate + javaExercises.difficultyBreakdown.intermediate,
          advanced: jsExercises.difficultyBreakdown.advanced + javaExercises.difficultyBreakdown.advanced
        }
      }
    };

    res.json(allExercises);
  } catch (error) {
    console.error('Error reading exercises index:', error);
    res.status(500).json({
      error: 'Failed to load exercises',
      details: error.message
    });
  }
});

// API endpoint to get a specific exercise by ID
app.get('/api/exercises/:id', (req, res) => {
  try {
    const { id } = req.params;
    const exercisePath = path.join(__dirname, 'data', 'exercises', `${id}.json`);

    // Check if file exists
    if (!fs.existsSync(exercisePath)) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const exerciseData = fs.readFileSync(exercisePath, 'utf8');
    const exercise = JSON.parse(exerciseData);
    res.json(exercise);
  } catch (error) {
    console.error('Error reading exercise:', error);
    res.status(500).json({ error: 'Failed to load exercise' });
  }
});

// API endpoint for code execution (placeholder for now)
// Client-side execution using web workers is recommended for security
app.post('/api/exercises/execute', (req, res) => {
  const { code, testCases } = req.body;

  // For now, just return a success response
  // In a production environment, consider using a sandboxed execution environment
  // or rely entirely on client-side execution
  res.json({
    success: true,
    message: 'Code execution should be handled client-side using web workers for security',
    note: 'This endpoint is a placeholder for validation purposes'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📚 Lessons available at http://localhost:${PORT}/data/lessons/`);
  console.log(`💪 Exercises available at http://localhost:${PORT}/api/exercises`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
});