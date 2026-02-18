# Quiz Creation Guide

## Overview

This guide documents the comprehensive quiz question bank system for Playwright and Selenium knowledge assessment. The system includes 60 quizzes with 600 questions covering beginner to advanced levels.

## Directory Structure

```
backend/data/quizzes/
├── index.json                      # Master index of all quizzes
├── playwright/
│   ├── beginner/                   # 10 quizzes, 100 questions
│   │   ├── 001-introduction.json
│   │   ├── 002-setup-installation.json
│   │   ├── 003-first-test.json
│   │   ├── 004-locators.json
│   │   ├── 005-interactions.json
│   │   ├── 006-assertions.json
│   │   ├── 007-page-objects.json
│   │   ├── 008-running-tests.json
│   │   ├── 009-debugging.json
│   │   └── 010-configuration.json
│   ├── intermediate/               # 10 quizzes, 100 questions
│   │   ├── 011-advanced-locators.json
│   │   ├── 012-element-handling.json
│   │   ├── 013-network-testing.json
│   │   ├── 014-api-testing.json
│   │   ├── 015-authentication.json
│   │   ├── 016-browser-contexts.json
│   │   ├── 017-file-operations.json
│   │   ├── 018-visual-testing.json
│   │   ├── 019-fixtures.json
│   │   └── 020-parallel-testing.json
│   └── advanced/                   # 10 quizzes, 100 questions
│       ├── 021-visual-regression.json
│       ├── 022-component-testing.json
│       ├── 023-accessibility.json
│       ├── 024-performance.json
│       ├── 025-mobile-testing.json
│       ├── 026-cicd-integration.json
│       ├── 027-custom-reporters.json
│       ├── 028-trace-viewer.json
│       ├── 029-test-strategies.json
│       └── 030-best-practices.json
└── selenium/
    ├── beginner/                   # 10 quizzes, 100 questions
    │   ├── 031-intro-selenium.json
    │   ├── 032-setup.json
    │   ├── 033-first-test.json
    │   ├── 034-locators.json
    │   ├── 035-web-elements.json
    │   ├── 036-waits.json
    │   ├── 037-browser-operations.json
    │   ├── 038-navigation.json
    │   ├── 039-webdriver-basics.json
    │   └── 040-test-structure.json
    ├── intermediate/               # 10 quizzes, 100 questions
    │   ├── 041-advanced-locators.json
    │   ├── 042-page-objects.json
    │   ├── 043-alerts.json
    │   ├── 044-frames-windows.json
    │   ├── 045-actions-api.json
    │   ├── 046-javascript-executor.json
    │   ├── 047-screenshots.json
    │   ├── 048-test-data.json
    │   ├── 049-exceptions.json
    │   └── 050-selenium-grid.json
    └── advanced/                   # 10 quizzes, 100 questions
        ├── 051-advanced-grid.json
        ├── 052-cicd-selenium.json
        ├── 053-docker-selenium.json
        ├── 054-performance-selenium.json
        ├── 055-mobile-selenium.json
        ├── 056-database-testing.json
        ├── 057-api-integration.json
        ├── 058-custom-frameworks.json
        ├── 059-advanced-patterns.json
        └── 060-enterprise-practices.json
```

## Quiz Structure

Each quiz JSON file follows this structure:

```json
{
  "id": "quiz-pw-001",
  "title": "Introduction to Playwright",
  "slug": "intro-to-playwright",
  "track": "playwright",
  "category": "beginner",
  "description": "Test your understanding of Playwright fundamentals",
  "timeLimit": 600,
  "passingScore": 70,
  "questions": [...],
  "totalPoints": 100,
  "relatedLesson": "lesson-001",
  "prerequisites": [],
  "xpReward": 150,
  "coinReward": 30
}
```

## Question Types

### 1. Multiple Choice (40% of questions)

```json
{
  "id": "quiz-pw-q001",
  "type": "multiple-choice",
  "question": "Which method is recommended for locating a button in Playwright?",
  "options": [
    "page.locator('#button-id')",
    "page.getByRole('button')",
    "page.$('#button-id')",
    "page.querySelector('button')"
  ],
  "correctAnswer": 1,
  "explanation": "getByRole() is recommended as it's more resilient to changes.",
  "difficulty": "easy",
  "points": 10,
  "tags": ["locators", "best-practices"]
}
```

**Best Practices:**
- Provide 4 plausible options
- Make distractors realistic but clearly wrong
- Include one "obvious wrong" answer
- Ensure only one correct answer
- Write clear, unambiguous questions

### 2. True/False (20% of questions)

```json
{
  "id": "quiz-pw-q002",
  "type": "true-false",
  "question": "Playwright automatically waits for elements to be actionable.",
  "correctAnswer": true,
  "explanation": "Playwright has built-in auto-waiting.",
  "difficulty": "easy",
  "points": 5,
  "tags": ["auto-wait", "fundamentals"]
}
```

**Best Practices:**
- Test single, specific concepts
- Avoid absolute terms unless accurate
- Don't use trick questions
- Provide clear explanations

### 3. Code Completion (20% of questions)

```json
{
  "id": "quiz-pw-q003",
  "type": "code-completion",
  "question": "Complete the code to click a button with text 'Submit':",
  "codeTemplate": "await page.____(____).click();",
  "correctAnswer": "await page.getByText('Submit').click();",
  "acceptedAnswers": [
    "await page.getByText('Submit').click();",
    "await page.getByRole('button', { name: 'Submit' }).click();"
  ],
  "explanation": "Multiple correct ways exist.",
  "difficulty": "easy",
  "points": 15,
  "tags": ["locators", "actions", "code"]
}
```

**Best Practices:**
- Use realistic code scenarios
- Accept multiple valid solutions
- Include proper syntax in template
- Test practical knowledge

### 4. Code Output (10% of questions)

```json
{
  "id": "quiz-pw-q004",
  "type": "code-output",
  "question": "What will this code return?",
  "code": "await page.locator('button').count();",
  "options": [
    "An array of buttons",
    "The number of button elements",
    "The first button element",
    "A Promise<number>"
  ],
  "correctAnswer": 1,
  "explanation": "count() returns the number of elements.",
  "difficulty": "medium",
  "points": 15,
  "tags": ["locators", "methods"]
}
```

**Best Practices:**
- Use actual working code
- Test understanding, not memorization
- Include edge cases
- Explain the "why" not just "what"

### 5. Debugging (10% of questions)

```json
{
  "id": "quiz-pw-q005",
  "type": "debugging",
  "question": "What's wrong with this code?",
  "code": "await page.goto('https://example.com');\npage.click('button');",
  "options": [
    "Missing await before page.click()",
    "Wrong URL in goto",
    "Should use getByRole",
    "Nothing is wrong"
  ],
  "correctAnswer": 0,
  "explanation": "page.click() returns a Promise and must be awaited.",
  "difficulty": "medium",
  "points": 20,
  "tags": ["debugging", "async", "common-errors"]
}
```

**Best Practices:**
- Focus on common mistakes
- Include realistic errors
- Explain correct solution
- Test problem-solving skills

## Difficulty Levels

### Easy (50% of questions)
- 5-10 points per question
- Basic concepts and syntax
- Direct application of knowledge
- Clear, straightforward questions

### Medium (40% of questions)
- 10-15 points per question
- Requires understanding and application
- Multiple concepts combined
- Some analytical thinking required

### Hard (10% of questions)
- 15-20 points per question
- Complex scenarios
- Deep understanding required
- Advanced problem-solving

## Point Distribution

- **True/False**: 5 points
- **Multiple Choice**: 10 points
- **Code Completion**: 15 points
- **Code Output**: 15 points
- **Debugging**: 20 points

Each quiz totals **115 points** (approximately)

## Reward System

### XP Rewards
- **Beginner**: 150 XP per quiz
- **Intermediate**: 200 XP per quiz
- **Advanced**: 250 XP per quiz

### Coin Rewards
- **Beginner**: 30 coins per quiz
- **Intermediate**: 40 coins per quiz
- **Advanced**: 50 coins per quiz

## Content Guidelines

### Question Quality

1. **Clarity**: Questions should be unambiguous
2. **Accuracy**: All information must be correct
3. **Relevance**: Focus on practical knowledge
4. **Difficulty**: Appropriate for the level
5. **Variety**: Mix question types and topics

### Explanation Quality

1. **Comprehensive**: Explain why the answer is correct
2. **Educational**: Include additional context
3. **Concise**: Keep it brief but complete
4. **Actionable**: Provide learning value

### Tag Usage

Use consistent tags for filtering and organization:

- **Topic tags**: locators, assertions, api, network
- **Skill tags**: fundamentals, advanced, best-practices
- **Type tags**: code, debugging, troubleshooting
- **Feature tags**: auto-wait, fixtures, contexts

## Quiz Coverage

### Playwright Beginner
- Introduction and setup
- Basic test writing
- Locators and interactions
- Assertions and expectations
- Page Object Model basics
- Test execution and debugging
- Basic configuration

### Playwright Intermediate
- Advanced locator strategies
- Element handling and frames
- Network interception
- API testing
- Authentication flows
- Browser contexts
- File operations
- Visual testing
- Fixtures
- Parallel execution

### Playwright Advanced
- Visual regression testing
- Component testing
- Accessibility testing
- Performance testing
- Mobile testing
- CI/CD integration
- Custom reporters
- Trace viewer
- Test strategies
- Enterprise best practices

### Selenium Beginner
- Selenium fundamentals
- Setup and WebDriver basics
- Locator strategies
- Web element interactions
- Wait strategies
- Browser operations
- Navigation
- Test structure

### Selenium Intermediate
- Advanced locators
- Page Object Model
- Handling alerts and frames
- Actions API
- JavaScript executor
- Screenshots and reporting
- Test data management
- Exception handling
- Selenium Grid basics

### Selenium Advanced
- Advanced Grid configuration
- CI/CD integration
- Docker and containerization
- Performance testing
- Mobile automation (Appium)
- Database testing
- API integration
- Custom frameworks
- Advanced design patterns
- Enterprise practices

## Adding New Quizzes

### Steps to Add a Quiz

1. **Create JSON file** in appropriate directory
2. **Follow naming convention**: `NNN-slug.json`
3. **Include all required fields**
4. **Write 10 quality questions**
5. **Test JSON validity**
6. **Update index.json**
7. **Add to version control**

### Question Writing Checklist

- [ ] Question is clear and unambiguous
- [ ] Answer is definitively correct
- [ ] Explanation adds value
- [ ] Difficulty is appropriate
- [ ] Tags are relevant
- [ ] Points are correct
- [ ] No typos or errors
- [ ] Code samples work
- [ ] Follows style guide

## Maintenance

### Regular Reviews

- **Quarterly**: Review accuracy
- **Bi-annually**: Update for new features
- **Annually**: Comprehensive content refresh

### Quality Metrics

- Pass rate per quiz
- Average completion time
- Question difficulty correlation
- User feedback scores

### Updates

When updating quizzes:
1. Increment version number
2. Document changes
3. Test all modifications
4. Update lastUpdated date
5. Notify users of changes

## API Integration

### Loading Quizzes

```javascript
// Load quiz by ID
const quiz = require('./quizzes/playwright/beginner/001-introduction.json');

// Load track
const track = 'playwright';
const category = 'beginner';
const quizzes = loadQuizzesByTrackAndCategory(track, category);

// Load random quiz
const randomQuiz = loadRandomQuiz(track, category);
```

### Validation

```javascript
function validateQuiz(quiz) {
  // Check required fields
  const required = ['id', 'title', 'track', 'category', 'questions'];
  for (const field of required) {
    if (!quiz[field]) throw new Error(`Missing ${field}`);
  }

  // Validate questions
  if (quiz.questions.length !== 10) {
    throw new Error('Quiz must have exactly 10 questions');
  }

  // Validate total points
  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0);
  if (quiz.totalPoints !== totalPoints) {
    throw new Error('Total points mismatch');
  }
}
```

## Statistics

- **Total Quizzes**: 60
- **Total Questions**: 600
- **Tracks**: 2 (Playwright, Selenium)
- **Categories**: 3 per track (Beginner, Intermediate, Advanced)
- **Question Types**: 5
- **Average Quiz Time**: 10 minutes
- **Passing Score**: 70%

## Support

For questions or issues with the quiz system:
- Review this guide
- Check index.json for structure
- Validate JSON format
- Test locally before deployment
- Document any customizations

## Version History

- **v1.0.0** (2026-02-17): Initial release with 60 quizzes and 600 questions
