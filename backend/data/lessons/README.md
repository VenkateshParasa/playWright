# Lesson Content - Playwright & Selenium Learning Platform

## Overview

This directory contains comprehensive lesson content for learning Playwright and Selenium test automation frameworks.

## Contents

### Lesson Files

**Total Lessons**: 60
- **Playwright**: 30 lessons (Beginner: 10, Intermediate: 10, Advanced: 10)
- **Selenium**: 30 lessons (Beginner: 10, Intermediate: 10, Advanced: 10)

### Structure

```
lessons/
├── index.json                    # Master index of all lessons
├── curriculum.json               # Learning paths and progression
├── LESSON_CONTENT_GUIDE.md       # Documentation for lesson structure
├── playwright/
│   ├── beginner/                 # 10 beginner lessons (001-010)
│   ├── intermediate/             # 10 intermediate lessons (001-010)
│   └── advanced/                 # 10 advanced lessons (001-010)
└── selenium/
    ├── beginner/                 # 10 beginner lessons (001-010)
    ├── intermediate/             # 10 intermediate lessons (001-010)
    └── advanced/                 # 10 advanced lessons (001-010)
```

## Lesson Topics

### Playwright Track

#### Beginner (10 lessons)
1. Introduction to Playwright
2. Installation and Setup
3. Writing Your First Test
4. Locator Strategies
5. Basic Interactions (click, type, etc.)
6. Assertions and Expectations
7. Page Object Model Basics
8. Running Tests
9. Debugging Tests
10. Test Configuration

#### Intermediate (10 lessons)
1. Advanced Locators (CSS, XPath, nth, has)
2. Handling Different Elements
3. Network Interception
4. API Testing with Playwright
5. Authentication and Sessions
6. Browser Contexts
7. File Uploads and Downloads
8. Screenshots and Videos
9. Test Fixtures
10. Parallel Testing

#### Advanced (10 lessons)
1. Visual Regression Testing
2. Component Testing
3. Accessibility Testing
4. Performance Testing
5. Mobile Emulation
6. CI/CD Integration
7. Custom Reporters
8. Trace Viewer
9. Test Retry Strategies
10. Best Practices and Patterns

### Selenium Track

#### Beginner (10 lessons)
1. Introduction to Selenium WebDriver
2. Setup (Java/Python/JavaScript)
3. First Selenium Script
4. Element Location Strategies
5. WebDriver Commands
6. Waits (Implicit, Explicit, Fluent)
7. Handling Alerts and Popups
8. Working with Frames
9. Basic Test Structure
10. Running Tests with TestNG/JUnit/pytest

#### Intermediate (10 lessons)
1. Advanced Element Interactions
2. Select Dropdown and Multi-Select
3. JavaScript Executor
4. Actions Class (mouse, keyboard)
5. Window and Tab Handling
6. Cookies and Sessions
7. Taking Screenshots
8. Headless Browser Testing
9. Page Object Model
10. Data-Driven Testing

#### Advanced (10 lessons)
1. Selenium Grid Setup
2. Cross-Browser Testing
3. Cloud Testing (BrowserStack, Sauce Labs)
4. Framework Design Patterns
5. Extent Reports
6. Log4j Integration
7. Docker Selenium
8. Selenium with Cucumber/BDD
9. Performance Optimization
10. Best Practices and Patterns

## Learning Paths

The `curriculum.json` file defines several learning paths:

1. **Playwright Complete** - Full Playwright curriculum (30 lessons, ~15 hours)
2. **Selenium Complete** - Full Selenium curriculum (30 lessons, ~15 hours)
3. **Quick Start Playwright** - Essential Playwright lessons (5 lessons, ~2 hours)
4. **Quick Start Selenium** - Essential Selenium lessons (5 lessons, ~2 hours)
5. **API Testing Specialization** - Focus on API testing (4 lessons, ~3 hours)

## Content Quality

Each lesson includes:

- **500-1500 words** of educational content
- **2-5 practical code examples** with explanations
- **Real-world scenarios** and use cases
- **Common pitfalls** and how to avoid them
- **Best practices** and tips
- **External resources** and documentation links
- **Progressive difficulty** building on previous lessons

## Usage

### For Developers

1. Read `LESSON_CONTENT_GUIDE.md` for detailed structure documentation
2. Review existing lessons as examples
3. Follow the JSON schema when creating new lessons

### For Students

1. Start with `index.json` to browse all available lessons
2. Use `curriculum.json` to follow structured learning paths
3. Complete lessons sequentially within each track
4. Earn XP and badges as you progress

## File Formats

### Lesson Files (lesson-XXX.json)

Each lesson is a JSON file containing:
- Metadata (id, title, track, category, duration)
- Learning objectives
- Content sections (text, code, video)
- Key takeaways
- Resources
- Prerequisites and next lesson links

### Index File (index.json)

Master index with:
- Total lesson count
- Track information
- Category details
- Lesson metadata summaries

### Curriculum File (curriculum.json)

Learning path definitions:
- Multiple learning paths
- Stage-based progression
- Milestone achievements
- XP and badge rewards

## XP and Progression

- **Beginner lessons**: 100-200 XP each
- **Intermediate lessons**: 150-250 XP each
- **Advanced lessons**: 200-300 XP each

**Milestones**:
- Beginner completion: 1,750 XP → Fundamentals Badge
- Intermediate completion: 3,750 XP → Practitioner Badge
- Advanced completion: 6,250 XP → Master Badge
- Both tracks complete: 12,500 XP → Dual Framework Expert Badge

## Technical Details

### Lesson ID Convention

- **Playwright**: `pw-{category}-{number:03d}` (e.g., `pw-beginner-001`)
- **Selenium**: `sel-{category}-{number:03d}` (e.g., `sel-beginner-001`)

### Categories

- `beginner` - Foundation concepts and basic skills
- `intermediate` - Advanced features and patterns
- `advanced` - Expert techniques and best practices

### Content Section Types

1. **text** - Markdown-formatted educational content
2. **code** - Code examples with syntax highlighting
3. **video** - Video tutorial references (optional)

## Adding New Lessons

See `LESSON_CONTENT_GUIDE.md` for detailed instructions on:
- Creating new lesson files
- Content quality guidelines
- Code example best practices
- Updating index and curriculum
- Maintenance procedures

## Scripts

Helper scripts for lesson management:

- `generate_lessons.py` - Generate Playwright beginner lessons
- `generate_all_lessons.py` - Generate all remaining lessons
- `generate_index.py` - Generate index and curriculum files

## Version

**Current Version**: 1.0.0
**Last Updated**: 2026-02-17

## Statistics

- **Total Lessons**: 60
- **Total Estimated Learning Time**: 30 hours
- **Total XP Available**: 10,500+
- **Tracks**: 2 (Playwright, Selenium)
- **Categories per Track**: 3 (Beginner, Intermediate, Advanced)
- **Learning Paths**: 5+

## Quality Assurance

All lessons have been:
- ✅ Validated for JSON syntax
- ✅ Structured with consistent schema
- ✅ Organized with progressive difficulty
- ✅ Tagged for searchability
- ✅ Linked with proper prerequisites
- ✅ Enriched with practical examples

## Support

For questions or issues:
1. Consult `LESSON_CONTENT_GUIDE.md`
2. Review example lessons
3. Check JSON schema
4. Contact content maintainers

## Future Enhancements

Potential additions:
- Video tutorials for each lesson
- Interactive coding exercises
- Quizzes and assessments
- Practice projects
- Community-contributed lessons
- Certification exams

## License

Content is provided for educational purposes as part of the Playwright & Selenium Learning Platform.

---

**Happy Learning!** 🎓

Start your journey with either:
- Playwright Quick Start: `playwright/beginner/lesson-001.json`
- Selenium Quick Start: `selenium/beginner/lesson-001.json`
