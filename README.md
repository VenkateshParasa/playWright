# Test Automation Academy

A comprehensive learning platform for mastering Playwright and Selenium test automation.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation & Running

**Option 1: Easy Start (Recommended)**
```bash
./start.sh
```
This script will:
- Install all dependencies
- Start both backend and frontend
- Open the app automatically

**Option 2: Manual Start**

You need to run BOTH backend and frontend:

```bash
# Terminal 1: Start Backend Server
cd backend
npm install
npm start
# Backend runs on http://localhost:3001

# Terminal 2: Start Frontend
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

**Important:** The backend MUST be running for lessons to load!

### Verify Setup

1. Backend health check: http://localhost:3001/health
2. Lessons index: http://localhost:3001/data/lessons/index.json
3. Frontend: http://localhost:5173

## 📚 What's Included

### Content (in `/backend/data/`)
- **60 Lessons** - 30 Playwright + 30 Selenium lessons
  - Beginner (10 lessons each)
  - Intermediate (10 lessons each)
  - Advanced (10 lessons each)
- **Exercises** - Hands-on coding challenges
- **Quizzes** - Knowledge assessments
- **Flashcards** - Spaced repetition learning

### Features
- 📖 Interactive lessons with code examples
- 🎯 Progress tracking
- 🧠 Spaced repetition system (SRS)
- ✅ Auto-graded exercises
- 📱 Progressive Web App (PWA)
- 🌐 Works offline

## 🏗️ Project Structure

```
playWright/
├── backend/              # Express server serving lesson data
│   ├── data/            # All lessons, exercises, quizzes
│   ├── server.js        # Simple Express server
│   └── package.json
│
├── frontend/            # React PWA application
│   ├── src/
│   │   ├── pages/      # Lessons, Dashboard, etc.
│   │   ├── lib/        # API clients, utilities
│   │   └── types/      # TypeScript definitions
│   └── package.json
│
├── playwright-runner/   # Playwright test examples
├── selenium-java/       # Selenium Java examples
└── docs/               # Documentation
```

## 📖 Documentation

- [Backend README](./backend/README.md) - Backend server details
- [Frontend README](./frontend/README.md) - Frontend setup and development
- [Setup Instructions](./docs/SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [Known Issues](./docs/KNOWN_ISSUES.md) - TypeScript errors explained
- [Project Structure](./docs/PROJECT_STRUCTURE.md) - Complete file organization

## 🎓 Learning Tracks

### Playwright Track (30 lessons)
- **Beginner**: Introduction, setup, basic automation
- **Intermediate**: Page objects, fixtures, advanced selectors
- **Advanced**: Network mocking, performance, best practices

### Selenium Track (30 lessons)
- **Beginner**: WebDriver basics, locators, waits
- **Intermediate**: Page Object Model, TestNG, data-driven tests
- **Advanced**: Grid, parallel execution, CI/CD integration

## 🔧 Development

### Backend Development
```bash
cd backend
npm run dev  # Auto-reload with nodemon
```

### Frontend Development
```bash
cd frontend
npm run dev  # Hot reload with Vite
```

### Running Tests
```bash
# Playwright tests
cd playwright-runner
npm test

# Selenium tests
cd selenium-java
mvn test
```

## 🐛 Troubleshooting

### "Lesson ID is required" Error
**Cause:** Backend server is not running

**Solution:**
```bash
cd backend
npm install
npm start
```

### Port Already in Use
**Backend (3001):**
```bash
PORT=3002 npm start
```

**Frontend (5173):**
Edit `vite.config.ts` and change the port

### CORS Errors
Make sure both servers are running on the correct ports:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

## 📊 Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- React Router
- React Query

### Backend
- Node.js + Express
- CORS enabled
- Static file serving

### Testing
- Playwright (JavaScript/TypeScript)
- Selenium (Java + TestNG)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License

## 🆘 Support

- Check [Known Issues](./docs/KNOWN_ISSUES.md)
- Review [Setup Instructions](./docs/SETUP_INSTRUCTIONS.md)
- Open an issue on GitHub

---

**Ready to start learning?** Run the backend and frontend, then visit http://localhost:5173! 🚀