# Coding Exercises - Playwright & Selenium

## 📚 Complete Exercise Library

This repository contains **80 comprehensive coding exercises** for learning Playwright and Selenium test automation.

## 📊 Quick Stats

| Metric | Count |
|--------|-------|
| Total Exercises | 80 |
| Playwright Exercises | 40 |
| Selenium Exercises | 40 |
| Total XP Available | 26,850 |
| Total Coins Available | 6,710 |
| Languages Supported | 6 (JS, TS, Python, Java) |

## 🎯 Exercise Breakdown

### Playwright Track (40 Exercises)
- **Beginner**: 15 exercises (001-015)
- **Intermediate**: 15 exercises (016-030)
- **Advanced**: 10 exercises (031-040)

### Selenium Track (40 Exercises)
- **Beginner**: 15 exercises (001-015)
- **Intermediate**: 15 exercises (016-030)
- **Advanced**: 10 exercises (031-040)

## 📂 Directory Structure

```
exercises/
├── index.json                    # Master index
├── EXERCISE_CREATION_GUIDE.md   # Comprehensive documentation
├── README.md                     # This file
├── playwright/
│   ├── beginner/        (15 exercises)
│   ├── intermediate/    (15 exercises)
│   └── advanced/        (10 exercises)
└── selenium/
    ├── beginner/        (15 exercises)
    ├── intermediate/    (15 exercises)
    └── advanced/        (10 exercises)
```

## 🚀 Quick Start

### Load All Exercises
```javascript
const exercises = require('./index.json');
console.log(`Total exercises: ${exercises.totalExercises}`);
```

### Load Specific Exercise
```javascript
const exercise = require('./playwright/beginner/001-navigate-url.json');
console.log(exercise.title);
console.log(exercise.objectives);
```

### Get Exercises by Track
```javascript
const playwrightExercises = exercises.tracks.playwright;
const seleniumExercises = exercises.tracks.selenium;
```

## 📖 Exercise Topics

### Playwright Exercises Cover:
- Navigation & Basic Interactions
- Locators & Selectors
- Forms & User Input
- Waits & Synchronization
- Page Object Model
- API Testing
- Network Interception
- Authentication Flows
- Visual Regression Testing
- Component Testing
- Accessibility Testing
- Performance Testing
- CI/CD Integration
- Framework Architecture

### Selenium Exercises Cover:
- WebDriver Setup
- Element Location Strategies
- Waits (Implicit, Explicit, Fluent)
- Page Object Model
- Actions Class
- JavaScript Executor
- TestNG/JUnit Integration
- Data-Driven Testing
- Selenium Grid
- Cross-Browser Testing
- Cucumber BDD
- Cloud Testing
- Docker Integration
- Framework Architecture

## 💡 Exercise Structure

Each exercise includes:
- **Starter Code** in multiple languages
- **Complete Solution** with explanations
- **3-5 Test Cases** for validation
- **Helpful Hints** for guidance
- **Resources** for further learning
- **XP & Coin Rewards** for gamification
- **Tags** for easy discovery

## 🎓 Learning Paths

### For Beginners
Start with exercises 001-015 in either track:
- Estimated time: 3-5 hours per track
- XP earned: ~2,500 per track
- Covers fundamentals and basic operations

### For Intermediate Learners
Progress to exercises 016-030:
- Estimated time: 6-8 hours per track
- XP earned: ~5,000 per track
- Covers design patterns and advanced techniques

### For Advanced Practitioners
Master exercises 031-040:
- Estimated time: 8-12 hours per track
- XP earned: ~5,500 per track
- Covers architecture and best practices

## 🏆 Reward System

### XP Distribution
- Easy exercises: 100-250 XP
- Medium exercises: 250-400 XP
- Hard exercises: 400-900 XP

### Coin Distribution
- Easy exercises: 25-60 coins
- Medium exercises: 60-100 coins
- Hard exercises: 100-225 coins

## 🔧 Language Support

### Playwright
- JavaScript
- TypeScript
- Python

### Selenium
- Java
- Python
- JavaScript

## 📝 Example Exercise

```json
{
  "id": "exercise-pw-001",
  "title": "Navigate to a URL",
  "slug": "navigate-url",
  "track": "playwright",
  "category": "beginner",
  "difficulty": "easy",
  "estimatedTime": 10,
  "xpReward": 100,
  "coinReward": 25,
  "objectives": [
    "Import Playwright test framework",
    "Navigate to a specific URL",
    "Verify successful page load"
  ]
}
```

## 🎮 Integration Examples

### Backend API
```javascript
// Get exercise by ID
app.get('/api/exercises/:id', (req, res) => {
  const exercise = loadExercise(req.params.id);
  res.json(exercise);
});

// Submit solution
app.post('/api/exercises/:id/submit', async (req, res) => {
  const result = await validateSolution(req.params.id, req.body.code);
  res.json(result);
});
```

### Frontend Usage
```javascript
// Display exercise
function loadExercise(exerciseId) {
  fetch(`/api/exercises/${exerciseId}`)
    .then(res => res.json())
    .then(exercise => {
      displayTitle(exercise.title);
      displayObjectives(exercise.objectives);
      loadStarterCode(exercise.starterCode);
    });
}
```

## 🧪 Validation System

Each exercise includes automated test cases that validate:
1. Basic functionality
2. Core implementation
3. Edge cases
4. Best practices

Points are awarded based on test case success:
- Test 1: 30-35% of total points
- Test 2: 30-40% of total points
- Test 3: 25-35% of total points

## 📚 Documentation

For detailed information, see:
- **EXERCISE_CREATION_GUIDE.md** - Complete documentation
- **index.json** - Master index with metadata
- Individual exercise JSON files

## 🔍 Search & Filter

Exercises can be filtered by:
- Track (Playwright/Selenium)
- Category (Beginner/Intermediate/Advanced)
- Difficulty (Easy/Medium/Hard)
- Tags (navigation, forms, api, etc.)
- Time estimate
- XP reward

## 🎯 Use Cases

### Educational Platforms
- Interactive coding challenges
- Progress tracking
- Gamification
- Skill assessment

### Interview Preparation
- Hands-on practice
- Real-world scenarios
- Multiple difficulty levels
- Comprehensive coverage

### Self-Learning
- Structured curriculum
- Progressive difficulty
- Immediate feedback
- Resource links

## 🤝 Contributing

To add new exercises:
1. Follow the JSON structure in existing exercises
2. Provide complete starter code and solutions
3. Include comprehensive test cases
4. Add helpful hints and resources
5. Update index.json
6. Test in all supported languages

## 📊 Statistics by Track

### Playwright
- Total exercises: 40
- Average time: 32 minutes
- Total XP: 13,425
- Total coins: 3,355
- Languages: 3

### Selenium
- Total exercises: 40
- Average time: 32 minutes
- Total XP: 13,425
- Total coins: 3,355
- Languages: 3

## 🌟 Key Features

✅ **80 Complete Exercises** - Comprehensive coverage
✅ **Multiple Languages** - JS, TS, Python, Java
✅ **Progressive Difficulty** - Beginner to Advanced
✅ **Real-World Scenarios** - Practical applications
✅ **Automated Validation** - Test case system
✅ **Gamification** - XP and coin rewards
✅ **Extensive Documentation** - Easy to use
✅ **Production Ready** - JSON-based structure

## 📞 Support

For questions or issues:
- Review EXERCISE_CREATION_GUIDE.md
- Check index.json for structure
- Examine sample exercises
- Test locally before deploying

## 📜 License

MIT License - Feel free to use in your educational projects

---

**Created**: 2026-02-17
**Version**: 1.0.0
**Status**: Production Ready
**Total Files**: 82 (80 exercises + 2 metadata files)
