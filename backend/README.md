# Backend Server

Simple Express server to serve lesson data, exercises, quizzes, and flashcards.

## Quick Start

```bash
# Install dependencies
npm install

# Start server
npm start

# Or start with auto-reload (development)
npm run dev
```

The server will start on `http://localhost:3001`

## Endpoints

### Health Check
```
GET /health
```

### Lessons
```
GET /data/lessons/index.json                           # Lesson index
GET /data/lessons/playwright/beginner/lesson-001.json  # Specific lesson
GET /data/lessons/selenium/intermediate/lesson-005.json
```

### Exercises
```
GET /data/exercises/playwright/beginner/               # List exercises
GET /data/exercises/selenium/advanced/
```

### Quizzes
```
GET /data/quizzes/playwright/beginner/                 # List quizzes
GET /data/quizzes/selenium/intermediate/
```

### Flashcards
```
GET /data/flashcards/playwright/                       # Playwright flashcards
GET /data/flashcards/selenium/                         # Selenium flashcards
```

## Data Structure

All data is stored in the `/data` directory:

```
data/
├── lessons/
│   ├── index.json
│   ├── playwright/
│   │   ├── beginner/
│   │   ├── intermediate/
│   │   └── advanced/
│   └── selenium/
│       ├── beginner/
│       ├── intermediate/
│       └── advanced/
├── exercises/
│   ├── playwright/
│   └── selenium/
├── quizzes/
│   ├── playwright/
│   └── selenium/
└── flashcards/
    ├── playwright/
    └── selenium/
```

## CORS Configuration

The server allows requests from:
- `http://localhost:3000` (Create React App default)
- `http://localhost:5173` (Vite default)

## Environment Variables

```bash
PORT=3001  # Server port (default: 3001)
```

## Development

The server uses:
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing
- **Nodemon** - Auto-reload during development

## Testing the Server

```bash
# Check if server is running
curl http://localhost:3001/health

# Get lesson index
curl http://localhost:3001/data/lessons/index.json

# Get a specific lesson
curl http://localhost:3001/data/lessons/playwright/beginner/lesson-001.json
```

## Troubleshooting

### Port already in use
If port 3001 is already in use, change it:
```bash
PORT=3002 npm start
```

### CORS errors
Make sure your frontend URL is added to the CORS configuration in `server.js`

### Data not loading
Verify the data files exist in the `/data` directory