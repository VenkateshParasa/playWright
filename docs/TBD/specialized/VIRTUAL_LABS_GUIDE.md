# Virtual Labs Guide

Hands-on learning experiences with guided tutorials, checkpoints, and real development environments.

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [Lab Structure](#lab-structure)
4. [Available Labs](#available-labs)
5. [Lab Interface](#lab-interface)
6. [Checkpoints](#checkpoints)
7. [Progress Tracking](#progress-tracking)
8. [Tips & Strategies](#tips--strategies)
9. [Troubleshooting](#troubleshooting)
10. [Creating Custom Labs](#creating-custom-labs)

## Introduction

Virtual Labs provide immersive, project-based learning experiences where you build real applications in isolated environments with step-by-step guidance.

### What Makes Labs Special?

- **Structured Learning**: Follow clear instructions and milestones
- **Real Environments**: Work with actual tools and frameworks
- **Instant Validation**: Check your progress with automated checkpoints
- **Safe to Experiment**: Isolated sandboxes protect you from mistakes
- **Complete Projects**: Build portfolio-worthy applications

## Getting Started

### Accessing Labs

1. Navigate to `/playground/labs`
2. Browse available labs
3. Select a lab based on your skill level
4. Click "Start Lab" to begin

### Lab Selection Criteria

Choose labs based on:

| Criteria | Considerations |
|----------|---------------|
| **Difficulty** | Beginner, Intermediate, Advanced |
| **Duration** | Time you can commit (30-120 minutes) |
| **Topic** | What you want to learn |
| **Prerequisites** | Required prior knowledge |

### First Lab Recommendation

Start with **"Express API Basics"**:
- Duration: 60 minutes
- Difficulty: Beginner
- No prerequisites
- Covers fundamental concepts

## Lab Structure

### Components

Every lab consists of:

```
Lab
├── Overview
│   ├── Title
│   ├── Description
│   ├── Learning objectives
│   └── Prerequisites
├── Instructions (Steps)
│   ├── Step 1
│   ├── Step 2
│   └── Step N
├── Checkpoints
│   ├── Checkpoint 1
│   ├── Checkpoint 2
│   └── Checkpoint N
├── Resources
│   ├── Documentation links
│   ├── Tutorial videos
│   └── Reference materials
└── Completion Criteria
```

### Lab Phases

```
Start → Setup → Learn → Build → Validate → Complete
```

#### 1. Setup Phase
- Lab environment initializes
- Sandbox container starts
- Template files load
- Dependencies install

#### 2. Learn Phase
- Read instructions
- Understand concepts
- Review examples

#### 3. Build Phase
- Write code
- Test functionality
- Iterate on solution

#### 4. Validate Phase
- Run checkpoint tests
- Fix issues
- Verify completion

#### 5. Complete Phase
- All checkpoints passed
- Review achievements
- Export project

## Available Labs

### Beginner Labs

#### 1. Express API Basics
**Duration**: 60 minutes
**Topics**: Node.js, Express, REST APIs

Build a RESTful API with Express.js:
- Set up Express server
- Create CRUD endpoints
- Implement error handling
- Test with curl/Postman

**Checkpoints**:
- ✓ Server running on port 3000
- ✓ GET /users returns user list
- ✓ POST /users creates user
- ✓ Error handling works

#### 2. Playwright Testing Basics
**Duration**: 90 minutes
**Topics**: Playwright, Browser Automation, Testing

Learn browser automation:
- Install and configure Playwright
- Write first test
- Interact with elements
- Handle async operations
- Generate test reports

**Checkpoints**:
- ✓ Playwright installed
- ✓ Test file created
- ✓ Tests pass successfully

#### 3. Python Flask API
**Duration**: 60 minutes
**Topics**: Python, Flask, APIs

Create a REST API with Flask:
- Setup Flask application
- Define routes and endpoints
- Handle request validation
- Return JSON responses

**Checkpoints**:
- ✓ Flask server running
- ✓ API endpoints working
- ✓ Request validation implemented

### Intermediate Labs

#### 4. React + Express Full-Stack
**Duration**: 120 minutes
**Topics**: React, Express, PostgreSQL

Build a full-stack application:
- Set up backend API
- Create React frontend
- Connect to database
- Implement authentication

#### 5. Selenium WebDriver Advanced
**Duration**: 90 minutes
**Topics**: Selenium, Page Object Model, CI/CD

Advanced Selenium patterns:
- Page Object Model
- Wait strategies
- Custom assertions
- CI/CD integration

#### 6. Playwright E2E Testing Suite
**Duration**: 100 minutes
**Topics**: Playwright, Testing, Fixtures

Complete E2E testing setup:
- Test organization
- Fixtures and hooks
- Parallel execution
- Visual regression

### Advanced Labs

#### 7. Microservices Architecture
**Duration**: 180 minutes
**Topics**: Microservices, Docker, API Gateway

Build microservices system:
- Service design
- Inter-service communication
- API Gateway
- Service discovery

#### 8. Performance Testing
**Duration**: 120 minutes
**Topics**: Load Testing, Performance, Optimization

Performance testing with Playwright:
- Load test scenarios
- Performance metrics
- Bottleneck identification
- Optimization strategies

## Lab Interface

### Layout Overview

```
┌────────────────────────────────────────────────────┐
│ [Lab Title]              Time: 45m  Progress: 66%  │
├──────────────┬─────────────────────────────────────┤
│              │                                      │
│ Instructions │         Code Editor                 │
│              │                                      │
│ ├─ Step 1    │                                      │
│ ├─ Step 2 ✓  │                                      │
│ ├─ Step 3 ⟳  │                                      │
│              │                                      │
│ Checkpoints  │                                      │
│ ├─ Setup ✓   │─────────────────────────────────────│
│ ├─ Build ⟳   │                                      │
│ └─ Test      │         Terminal                    │
│              │                                      │
│ Resources    │                                      │
│              │                                      │
└──────────────┴─────────────────────────────────────┘
```

### Left Sidebar

#### Instructions Panel
Shows current step with:
- Step number and title
- Detailed instructions
- Code examples
- Helpful hints

#### Checkpoints Panel
Lists all validation points:
- ✓ Completed checkpoints (green)
- ⟳ In-progress checkpoints (blue)
- ○ Pending checkpoints (gray)

#### Resources Panel
Quick access to:
- Documentation links
- Tutorial videos
- Reference materials
- Community discussions

### Right Panel

#### Code Editor
Full-featured Monaco editor:
- Syntax highlighting
- Auto-completion
- Error detection
- File management

#### Terminal
Interactive terminal for:
- Running commands
- Installing packages
- Testing code
- Debugging

## Checkpoints

### What Are Checkpoints?

Checkpoints are automated validation points that verify your progress.

### Types of Checkpoints

#### 1. Command Validation
Runs a command and checks output:

```javascript
Checkpoint: "Server is running"
Validation: curl http://localhost:3000
Expected: HTTP 200 OK
```

#### 2. File Validation
Checks if files exist:

```javascript
Checkpoint: "Created routes file"
Validation: Check if src/routes/users.js exists
Expected: File present with required exports
```

#### 3. Output Validation
Verifies program output:

```javascript
Checkpoint: "Correct output"
Validation: Run program and check console
Expected: "Hello, World!"
```

#### 4. Test Validation
Runs test suite:

```javascript
Checkpoint: "Tests pass"
Validation: npm test
Expected: All tests pass (exitCode: 0)
```

### Running Checkpoints

1. Complete the step instructions
2. Write your code
3. Click **Validate** on checkpoint
4. Review results:
   - ✓ **Passed**: Checkpoint completed
   - ✗ **Failed**: Review error message and try again

### Checkpoint Strategies

#### Strategy 1: Sequential Validation
Complete and validate each checkpoint in order:

```
Step 1 → Validate → Pass → Step 2 → Validate → Pass → ...
```

#### Strategy 2: Batch Validation
Complete multiple steps, then validate all:

```
Steps 1-3 → Validate All → Fix Issues → Revalidate
```

#### Strategy 3: Test-Driven
Write tests first, then implement:

```
Write Test → Run (Fail) → Implement → Run (Pass)
```

## Progress Tracking

### Progress Metrics

Your progress is tracked by:

```javascript
{
  currentStep: 3,              // Current instruction step
  completedCheckpoints: 2,     // Passed checkpoints
  timeSpent: 45,              // Minutes in lab
  attempts: {                 // Validation attempts
    checkpoint1: 1,
    checkpoint2: 3
  }
}
```

### Progress Bar

Visual progress indicator:

```
██████████░░░░░░░░░░ 50% Complete (3/6 checkpoints)
```

### Completion Criteria

Lab is complete when:
- ✓ All checkpoints validated
- ✓ Required files created
- ✓ Tests pass (if applicable)

### Certificates

Upon completion, receive:
- Lab completion certificate
- Shareable badge
- GitHub-ready project
- Learning statistics

## Tips & Strategies

### 1. Read Everything First

Before coding, read:
- Full lab description
- All instructions
- Checkpoint requirements
- Available resources

### 2. Follow Instructions Carefully

```
❌ Don't Skip Steps
✅ Complete Each Step Thoroughly
```

### 3. Use Hints Wisely

Hints are there to help:
- Try solving first
- Use hints when stuck
- Don't rely on hints exclusively

### 4. Test Frequently

Test your code often:

```bash
# After each significant change
$ npm test
$ curl http://localhost:3000
```

### 5. Understand, Don't Copy

Copy-pasting defeats learning:
- Type code manually
- Understand each line
- Experiment with changes

### 6. Use Resources

External resources are encouraged:
- Official documentation
- Stack Overflow
- Community forums
- Tutorial videos

### 7. Take Breaks

For long labs:
- Save progress regularly
- Take 5-minute breaks
- Return with fresh perspective

### 8. Experiment Safely

Sandboxes are safe to break:
- Try different approaches
- Break things and fix them
- Learn from mistakes

## Troubleshooting

### Issue: Sandbox Won't Start

**Symptoms**:
- Loading spinner indefinitely
- "Failed to create sandbox" error

**Solutions**:
1. Refresh the page
2. Check internet connection
3. Try different browser
4. Contact support if persists

### Issue: Checkpoint Won't Validate

**Symptoms**:
- Validation fails despite correct code
- "Validation timeout" error

**Solutions**:
1. Verify all requirements met
2. Check file locations
3. Ensure services running
4. Review validation criteria

### Issue: Terminal Not Responding

**Symptoms**:
- Commands don't execute
- No output displayed

**Solutions**:
1. Restart terminal (close and reopen)
2. Check sandbox status
3. Try reloading page

### Issue: Code Changes Not Saving

**Symptoms**:
- Changes disappear on refresh
- Old code reappears

**Solutions**:
1. Manual save (Cmd/Ctrl + S)
2. Check connection status
3. Wait for auto-save indicator
4. Copy code before refreshing

### Issue: Out of Time

**Symptoms**:
- Session expired warning
- Can't access sandbox

**Solutions**:
1. Export your code first
2. Restart lab with saved code
3. Request time extension

## Creating Custom Labs

### Lab Definition Format

```typescript
interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  type: 'nodejs' | 'python' | 'fullstack';
  template: string;

  instructions: [{
    step: number;
    title: string;
    content: string;
    code?: string;
    hints?: string[];
  }];

  checkpoints: [{
    id: string;
    title: string;
    description: string;
    validation: {
      type: 'command' | 'file' | 'test';
      criteria: string;
    };
  }];

  resources: [{
    type: 'documentation' | 'video' | 'tutorial';
    title: string;
    url: string;
  }];

  completionCriteria: {
    checkpoints: number;
    tests?: string[];
    files?: string[];
  };
}
```

### Example Lab

```javascript
{
  id: 'my-custom-lab',
  title: 'Build a Todo API',
  description: 'Create a REST API for todo management',
  difficulty: 'beginner',
  duration: 45,
  type: 'nodejs',
  template: 'express-api',

  instructions: [
    {
      step: 1,
      title: 'Setup Express Server',
      content: 'Create an Express server on port 3000...',
      code: 'const express = require("express");...',
      hints: ['Import express', 'Use app.listen()']
    }
  ],

  checkpoints: [
    {
      id: 'server-running',
      title: 'Server is running',
      description: 'Express server responds on port 3000',
      validation: {
        type: 'command',
        criteria: 'curl http://localhost:3000'
      }
    }
  ]
}
```

### Submitting Labs

To submit custom labs:

1. Create lab definition
2. Test thoroughly
3. Submit via GitHub PR
4. Wait for review
5. Lab published upon approval

## Best Practices

### For Learners

1. **Complete in Order**: Follow the curriculum path
2. **Don't Rush**: Quality over speed
3. **Ask Questions**: Use community forums
4. **Review Completed Labs**: Reinforce learning
5. **Build on Labs**: Extend projects after completion

### For Lab Creators

1. **Clear Instructions**: Be specific and detailed
2. **Realistic Checkpoints**: Achievable validations
3. **Provide Resources**: Link to helpful materials
4. **Test Thoroughly**: Validate all paths work
5. **Include Hints**: Help without giving answers

## FAQ

**Q: Can I pause a lab?**
A: Yes, progress auto-saves. Return anytime within session duration.

**Q: Can I restart a lab?**
A: Yes, click "Restart Lab" to start fresh.

**Q: Are labs timed?**
A: Estimated duration is provided, but no hard time limit.

**Q: Can I skip checkpoints?**
A: No, all checkpoints must be completed.

**Q: Can I access sandbox after completing lab?**
A: Yes, for 24 hours. Export your project to keep longer.

**Q: Can I share my lab project?**
A: Yes! Export and share on GitHub, portfolio, etc.

## Support

Need help with labs?

- **Documentation**: Full guides available
- **Community**: Forum for questions
- **Live Chat**: Real-time support
- **Email**: support@example.com

## What's Next?

After completing labs:

1. **Try Interactive Tutorials**: [Guide](./INTERACTIVE_TUTORIALS.md)
2. **Build Personal Projects**: Apply your skills
3. **Contribute Labs**: Share your knowledge
4. **Join Community**: Connect with other learners
