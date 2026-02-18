# Quiz Question Bank

## Overview

Comprehensive quiz question bank for Playwright and Selenium knowledge assessment, featuring **60 quizzes** with **600 questions** across multiple difficulty levels.

## Quick Stats

- **Total Quizzes**: 60
- **Total Questions**: 600
- **Tracks**: 2 (Playwright & Selenium)
- **Difficulty Levels**: 3 (Beginner, Intermediate, Advanced)
- **Question Types**: 5 (Multiple Choice, True/False, Code Completion, Code Output, Debugging)

## Structure

### Playwright Track (30 quizzes, 300 questions)

**Beginner (10 quizzes, 100 questions)**
- 001: Introduction to Playwright
- 002: Setup and Installation
- 003: Writing Your First Test
- 004: Locators in Playwright
- 005: Interactions and Actions
- 006: Assertions in Playwright
- 007: Page Object Model
- 008: Running Tests
- 009: Debugging Tests
- 010: Configuration

**Intermediate (10 quizzes, 100 questions)**
- 011: Advanced Locators
- 012: Element Handling
- 013: Network Testing
- 014: API Testing
- 015: Authentication
- 016: Browser Contexts
- 017: File Operations
- 018: Visual Testing
- 019: Fixtures
- 020: Parallel Testing

**Advanced (10 quizzes, 100 questions)**
- 021: Visual Regression
- 022: Component Testing
- 023: Accessibility Testing
- 024: Performance Testing
- 025: Mobile Testing
- 026: CI/CD Integration
- 027: Custom Reporters
- 028: Trace Viewer
- 029: Test Strategies
- 030: Best Practices

### Selenium Track (30 quizzes, 300 questions)

**Beginner (10 quizzes, 100 questions)**
- 031: Introduction to Selenium
- 032: Selenium Setup
- 033: First Selenium Test
- 034: Locators in Selenium
- 035: Web Elements
- 036: Wait Strategies
- 037: Browser Operations
- 038: Navigation Commands
- 039: WebDriver Basics
- 040: Test Structure

**Intermediate (10 quizzes, 100 questions)**
- 041: Advanced Locators
- 042: Page Objects
- 043: Handling Alerts
- 044: Frames and Windows
- 045: Actions API
- 046: JavaScript Executor
- 047: Screenshots
- 048: Test Data Management
- 049: Exception Handling
- 050: Selenium Grid

**Advanced (10 quizzes, 100 questions)**
- 051: Advanced Grid
- 052: CI/CD with Selenium
- 053: Docker Selenium
- 054: Performance Testing
- 055: Mobile Automation
- 056: Database Testing
- 057: API Integration
- 058: Custom Frameworks
- 059: Advanced Patterns
- 060: Enterprise Best Practices

## Question Type Distribution

| Type | Count | Percentage | Points |
|------|-------|------------|--------|
| Multiple Choice | 240 | 40% | 10 |
| True/False | 120 | 20% | 5 |
| Code Completion | 120 | 20% | 15 |
| Code Output | 60 | 10% | 15 |
| Debugging | 60 | 10% | 20 |

## Difficulty Distribution

| Level | Count | Percentage |
|-------|-------|------------|
| Easy | 300 | 50% |
| Medium | 240 | 40% |
| Hard | 60 | 10% |

## Rewards

### XP Rewards
- Beginner: 150 XP per quiz
- Intermediate: 200 XP per quiz
- Advanced: 250 XP per quiz

### Coin Rewards
- Beginner: 30 coins per quiz
- Intermediate: 40 coins per quiz
- Advanced: 50 coins per quiz

## Configuration

- **Time Limit**: 600 seconds (10 minutes) per quiz
- **Passing Score**: 70%
- **Questions per Quiz**: 10
- **Average Points per Quiz**: 115

## Files

- `index.json` - Master index of all quizzes
- `QUIZ_CREATION_GUIDE.md` - Comprehensive documentation
- `playwright/` - Playwright quiz directory
  - `beginner/` - Beginner level quizzes
  - `intermediate/` - Intermediate level quizzes
  - `advanced/` - Advanced level quizzes
- `selenium/` - Selenium quiz directory
  - `beginner/` - Beginner level quizzes
  - `intermediate/` - Intermediate level quizzes
  - `advanced/` - Advanced level quizzes

## Usage

### Loading a Quiz

```javascript
// Load specific quiz
const quiz = require('./playwright/beginner/001-introduction.json');

// Access quiz metadata
console.log(quiz.title);        // "Introduction to Playwright"
console.log(quiz.questions.length); // 10
console.log(quiz.totalPoints);  // 115

// Iterate through questions
quiz.questions.forEach(question => {
  console.log(question.question);
  console.log(question.type);
  console.log(question.points);
});
```

### Loading by Track and Category

```javascript
const fs = require('fs');
const path = require('path');

function loadQuizzes(track, category) {
  const dir = path.join(__dirname, track, category);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));
  return files.map(file => require(path.join(dir, file)));
}

// Load all Playwright beginner quizzes
const beginnerQuizzes = loadQuizzes('playwright', 'beginner');
```

### Validating Quiz Data

```javascript
function validateQuiz(quiz) {
  // Required fields
  if (!quiz.id || !quiz.title || !quiz.track || !quiz.category) {
    throw new Error('Missing required fields');
  }

  // Must have 10 questions
  if (quiz.questions.length !== 10) {
    throw new Error('Quiz must have exactly 10 questions');
  }

  // Validate total points
  const calculatedPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  if (quiz.totalPoints !== calculatedPoints) {
    throw new Error('Total points mismatch');
  }

  return true;
}
```

## Content Quality

All questions are:
- ✅ Clear and unambiguous
- ✅ Technically accurate
- ✅ Relevant to real-world scenarios
- ✅ Properly difficulty-rated
- ✅ Well-explained with detailed explanations
- ✅ Tagged for easy filtering and search

## Topics Covered

### Playwright Topics
- Test setup and configuration
- Locator strategies and best practices
- Element interactions and actions
- Assertions and expectations
- Page Object Model patterns
- Network interception and mocking
- API testing
- Authentication flows
- Browser contexts and isolation
- File operations
- Visual testing and screenshots
- Fixtures and test organization
- Parallel test execution
- Visual regression testing
- Component testing
- Accessibility testing
- Performance testing
- Mobile emulation
- CI/CD integration
- Custom reporters
- Trace viewer and debugging
- Enterprise best practices

### Selenium Topics
- WebDriver fundamentals
- Setup and configuration
- Locator strategies (ID, CSS, XPath, etc.)
- Element interactions
- Wait strategies (implicit, explicit, fluent)
- Browser operations
- Navigation commands
- Page Object Model
- Alert, frame, and window handling
- Actions API
- JavaScript executor
- Screenshot capture
- Test data management
- Exception handling
- Selenium Grid
- Docker containers
- CI/CD integration
- Performance testing
- Mobile automation with Appium
- Database testing
- API integration
- Custom framework development
- Design patterns
- Enterprise practices

## Future Enhancements

Potential additions for future versions:
- Video walkthroughs for complex questions
- Interactive code playgrounds
- Adaptive difficulty based on performance
- Timed challenges and leaderboards
- Certification paths
- Practice mode vs. exam mode
- Community-submitted questions
- Multi-language support
- Question analytics and insights

## Support

For detailed information on:
- Creating new quizzes
- Question formatting
- Best practices
- Maintenance procedures

See: `QUIZ_CREATION_GUIDE.md`

## Version

Current Version: **1.0.0**
Last Updated: **2026-02-17**

---

**Note**: All quiz content is designed for educational purposes to help learners assess and improve their Playwright and Selenium testing knowledge.
