# Playwright & Selenium Learning Platform

A comprehensive 30-60 day learning program for mastering Playwright (JavaScript/TypeScript) and Selenium (Java) with a React PWA frontend, spaced repetition system, and automated assessments.

## 🎯 Overview

This platform is designed for developers with basic-medium JavaScript and medium Java knowledge who want to become proficient in browser automation and E2E testing within 30-60 days.

### Key Features

- 📚 **Structured Curriculum**: 30-day intensive and 60-day extended learning tracks
- 🧠 **Spaced Repetition System**: SM-2 algorithm for optimal knowledge retention
- ✅ **Automated Assessments**: Auto-graded quizzes and coding exercises
- 💻 **Interactive Code Editor**: Practice with instant feedback
- 📱 **Progressive Web App**: Works offline, installable on any device
- 🔄 **CI/CD Integration**: Automated testing and grading pipelines
- 📊 **Progress Tracking**: Visual dashboards and analytics

## 🚀 Quick Start

### Prerequisites

```bash
# Required
Node.js 20+
Java JDK 17+
Maven 3.9+
Git

# Optional (for development)
Docker
VS Code with recommended extensions
```

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/playwright-selenium-learning.git
cd playwright-selenium-learning

# Install frontend dependencies
cd frontend
npm install

# Install Playwright
cd ../playwright-runner
npm install
npx playwright install --with-deps

# Build Selenium project
cd ../selenium-java
mvn clean install

# Return to root
cd ..
```

### Running the Application

```bash
# Start the frontend development server
cd frontend
npm run dev

# Open browser to http://localhost:3000
```

### Running Tests

```bash
# Run Playwright tests
cd playwright-runner
npm test

# Run Selenium tests
cd selenium-java
mvn test

# Run frontend tests
cd frontend
npm run test
```

## 📁 Project Structure

```
learning-platform/
├── frontend/                 # React PWA application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── lib/             # Core libraries (SRS, DB, API)
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # State management
│   │   └── data/            # Curriculum and content
│   └── public/              # Static assets
├── playwright-runner/        # Playwright examples and exercises
│   ├── tests/
│   ├── pages/               # Page Object Models
│   └── fixtures/            # Test fixtures
├── selenium-java/           # Selenium Java examples
│   └── src/
│       ├── main/java/       # Page Objects and utilities
│       └── test/java/       # Test cases
├── backend/                 # Optional backend API
├── docs/                    # Documentation
└── .github/workflows/       # CI/CD pipelines
```

## 📚 Learning Tracks

### 30-Day Intensive Track

**Week 1: Foundations**
- Days 1-2: Environment setup and tooling
- Days 3-4: Browser automation basics
- Days 5-7: Selectors and locators mastery

**Week 2: Intermediate Skills**
- Days 8-10: Waits, assertions, and synchronization
- Days 11-14: Page Object Model and test architecture

**Week 3: Advanced Features**
- Days 15-17: Advanced Playwright features
- Days 18-21: Cross-browser and parallel testing

**Week 4: Integration & Capstone**
- Days 22-25: React PWA testing
- Days 26-30: Capstone project and CI/CD

### 60-Day Extended Track

Same modules with 2x time allocation, additional exercises, code reviews, and advanced topics including visual regression testing, performance testing, and Docker containerization.

## 🧠 Spaced Repetition System

The platform uses the SM-2 algorithm to optimize knowledge retention:

- **Flashcards**: 100+ cards covering key concepts
- **Smart Scheduling**: Cards appear when you're about to forget
- **Quality Ratings**: Rate your recall (0-5) to adjust scheduling
- **Progress Tracking**: See your retention rate over time
- **Offline Support**: Review cards without internet connection

## ✅ Assessment System

### Quiz Types

1. **Multiple Choice Quizzes**: Auto-graded with instant feedback
2. **Coding Exercises**: Write code with automated test validation
3. **Capstone Projects**: Comprehensive projects with manual review

### Auto-Grading

- Exercises run in sandboxed environment
- Test harnesses validate solutions
- Detailed feedback on failures
- Code quality analysis
- CI/CD integration for submissions

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand + React Query
- **PWA**: Vite PWA Plugin + Workbox
- **Storage**: IndexedDB (idb)
- **Editor**: Monaco Editor

### Testing
- **Playwright**: E2E testing framework
- **Selenium**: WebDriver for Java
- **TestNG**: Java testing framework
- **Vitest**: Unit testing for frontend

### CI/CD
- **GitHub Actions**: Automated workflows
- **Docker**: Containerization for grading
- **Vercel**: Frontend deployment

## 📖 Documentation

### Core Documentation (in `/docs`)
- [**Comprehensive Implementation Prompt**](./docs/COMPREHENSIVE_IMPLEMENTATION_PROMPT.md) - Detailed technical specifications
- [**Features Implementation Guide**](./docs/FEATURES_IMPLEMENTATION.md) - Complete feature breakdown and checklist
- [**Project Structure**](./docs/PROJECT_STRUCTURE.md) - Complete folder tree and file organization
- [**Setup Instructions**](./docs/SETUP_INSTRUCTIONS.md) - Detailed setup guide with troubleshooting
- [**Known Issues**](./docs/KNOWN_ISSUES.md) - Expected TypeScript errors and solutions
- [**Learning Program Spec**](./docs/learning_program_spec.md) - Original specification document

### Project-Specific Documentation
- [**Frontend Guide**](./frontend/README.md) - React PWA setup and development
- [**Playwright Guide**](./playwright-runner/README.md) - Playwright test examples and exercises
- [**Selenium Java Guide**](./selenium-java/README.md) - Java/Maven setup and testing

## 🎓 Learning Objectives

By completing this program, you will be able to:

- ✅ Write production-ready Playwright tests in TypeScript
- ✅ Create robust Selenium tests in Java
- ✅ Implement Page Object Model architecture
- ✅ Handle complex scenarios (auth, file uploads, network mocking)
- ✅ Configure cross-browser and parallel testing
- ✅ Integrate tests with CI/CD pipelines
- ✅ Debug and fix flaky tests
- ✅ Test React PWA applications
- ✅ Apply testing best practices

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Run linter
npm run lint

# Format code
npm run format
```

## 📊 Success Metrics

- **Knowledge Retention**: 80%+ after 30 days
- **Completion Rate**: 70%+ complete the track
- **Skill Proficiency**: 90%+ pass capstone
- **Time to Competency**: Average 35 days

## 🔒 Security

- Sandboxed code execution for exercises
- No untrusted code runs on host
- Docker containers for grading
- Secure authentication (if backend enabled)

## 📝 License

MIT License - see [LICENSE](./LICENSE) file for details

## 🙏 Acknowledgments

- Playwright team for excellent documentation
- Selenium community for comprehensive guides
- React and TypeScript communities
- All contributors and learners

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/playwright-selenium-learning/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/playwright-selenium-learning/discussions)
- **Email**: support@example.com

## 🗺️ Roadmap

### Phase 1 (Current)
- ✅ Core curriculum content
- ✅ SRS implementation
- ✅ Basic assessments
- ✅ PWA functionality

### Phase 2 (Next)
- [ ] Video tutorials
- [ ] Live coding sessions
- [ ] Community features
- [ ] Mobile app

### Phase 3 (Future)
- [ ] AI-powered hints
- [ ] Personalized learning paths
- [ ] Certification program
- [ ] Enterprise features

---

**Start your journey to test automation mastery today!** 🚀

For detailed implementation instructions, see [COMPREHENSIVE_IMPLEMENTATION_PROMPT.md](./docs/COMPREHENSIVE_IMPLEMENTATION_PROMPT.md)