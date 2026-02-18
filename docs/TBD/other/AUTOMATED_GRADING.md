# Automated Grading System

## Overview

The Automated Grading System provides comprehensive code and essay grading with test execution, style checking, security analysis, performance metrics, and plagiarism detection.

## Code Grading

### Features

1. **Test Case Execution** - Automated test running and validation
2. **Style Checking** - ESLint/Prettier rules enforcement
3. **Security Analysis** - Vulnerability detection
4. **Performance Analysis** - Complexity and efficiency metrics
5. **Plagiarism Detection** - Similarity analysis
6. **Partial Credit** - Weighted scoring system
7. **Detailed Feedback** - Actionable improvement suggestions

### Usage

```typescript
import { codeGradingService } from './services/ai/codeGradingService';

const submission = {
  code: '/* student code */',
  language: 'javascript',
  exerciseId: 'ex-123',
  userId: 'user-456',
  testCases: [
    {
      id: 'test-1',
      input: '5',
      expectedOutput: '120',
      weight: 1,
    },
  ],
};

const result = await codeGradingService.gradeSubmission(submission);
```

### Grading Configuration

```typescript
const config = {
  enableStyleCheck: true,
  enableSecurityCheck: true,
  enablePerformanceCheck: true,
  enablePlagiarismCheck: true,
  weights: {
    tests: 0.6,        // 60% for test results
    style: 0.15,       // 15% for code style
    security: 0.15,    // 15% for security
    performance: 0.1,  // 10% for performance
  },
};

const result = await codeGradingService.gradeSubmission(submission, config);
```

### Grading Result Structure

```typescript
interface GradingResult {
  score: number;               // Total score earned
  maxScore: number;            // Maximum possible score
  percentage: number;          // Percentage score
  passed: boolean;             // Pass/fail status
  testResults: TestResult[];   // Individual test outcomes
  styleIssues: StyleIssue[];   // Code style problems
  securityVulnerabilities: SecurityVulnerability[];
  performanceMetrics: PerformanceMetrics;
  plagiarismResult?: PlagiarismResult;
  feedback: string[];          // Human-readable feedback
  partialCredits: {            // Breakdown by category
    tests: number;
    style: number;
    security: number;
    performance: number;
  };
  gradedAt: Date;
}
```

## Test Execution

### Test Case Format

```typescript
const testCases = [
  {
    id: 'test-basic',
    input: '5',
    expectedOutput: '120',
    weight: 1,
    hidden: false,
  },
  {
    id: 'test-edge',
    input: '0',
    expectedOutput: '1',
    weight: 1,
    hidden: false,
  },
  {
    id: 'test-large',
    input: '10',
    expectedOutput: '3628800',
    weight: 2,        // Weighted test worth 2x
    hidden: true,     // Hidden from students
  },
];
```

### Sandboxed Execution

Code is executed in isolated environments using Docker:

```bash
docker run \
  --rm \
  --network=none \
  --memory=128m \
  --memory-swap=128m \
  --cpus=0.5 \
  --pids-limit=50 \
  --read-only \
  --user=nobody \
  python:3.11-alpine python -c "$CODE"
```

## Style Checking

### JavaScript/TypeScript Rules

- No `var` declarations (use `const`/`let`)
- Missing semicolons
- Console.log statements
- Proper indentation (2 spaces)
- Line length limits
- Naming conventions

### Python Rules (PEP 8)

- Line length (79 characters)
- Indentation (4 spaces)
- Trailing whitespace
- Import ordering
- Docstring requirements

### Java Rules

- Class naming (PascalCase)
- Constant naming (UPPER_CASE)
- Method naming (camelCase)
- Bracket placement
- Indentation

## Security Analysis

### Vulnerability Detection

**Critical Issues:**
- `eval()` usage
- Command injection risks
- SQL injection patterns
- Hardcoded credentials

**High Issues:**
- XSS vulnerabilities
- Unsafe deserialization
- Path traversal
- Insecure randomness

**Medium Issues:**
- Weak cryptography
- Unvalidated redirects
- Missing error handling

**Low Issues:**
- Deprecated functions
- Information disclosure
- Missing headers

### Example Output

```typescript
{
  type: 'dangerous-function',
  severity: 'critical',
  line: 42,
  description: 'Use of eval() is dangerous and can lead to code injection',
  recommendation: 'Avoid using eval(). Use JSON.parse() for JSON data'
}
```

## Performance Analysis

### Metrics Collected

1. **Execution Time**: Average runtime across test cases
2. **Memory Usage**: Peak memory consumption
3. **Cyclomatic Complexity**: Number of decision points
4. **Cognitive Complexity**: Mental effort to understand code

### Complexity Scoring

```typescript
const complexity = {
  cyclomatic: 5,    // Good (< 10)
  cognitive: 8,      // Acceptable (< 15)
};

// Thresholds:
// Cyclomatic: < 10 (good), 10-15 (warning), > 15 (poor)
// Cognitive: < 15 (good), 15-20 (warning), > 20 (poor)
```

### Performance Suggestions

- "Consider using array methods like map(), filter(), reduce()"
- "Nested loops may have O(n²) complexity. Consider optimizing"
- "Use enumerate() instead of range(len())" (Python)

## Plagiarism Detection

### How It Works

1. **Code Normalization**: Remove comments, whitespace, formatting
2. **Variable Renaming**: Normalize identifier names
3. **Tokenization**: Convert to token sequences
4. **Fingerprinting**: Generate k-gram hashes (Winnowing algorithm)
5. **Similarity Calculation**: Jaccard similarity on fingerprints

### Similarity Scoring

```typescript
const plagiarismResult = {
  similarity: 0.85,  // 85% similar
  matchedSubmissions: [
    {
      submissionId: 'sub-789',
      userId: 'user-101',
      similarity: 0.85,
      matchedLines: [5, 6, 7, 15, 16, 20],
    },
  ],
};

// Interpretation:
// < 30%: Acceptable
// 30-70%: Moderate concern
// > 70%: High similarity - review required
```

## Essay Grading

### Features

1. **Rubric-Based Scoring** - Criterion-by-criterion evaluation
2. **Key Concept Detection** - Identifies required topics
3. **Grammar Analysis** - Spelling and grammar checking
4. **Readability Scoring** - Flesch Reading Ease
5. **Plagiarism Detection** - Text similarity analysis
6. **Human Review Flagging** - Edge cases for manual review

### Usage

```typescript
const submission = {
  content: 'Student essay text...',
  questionId: 'q-123',
  userId: 'user-456',
  rubric: {
    criteria: [
      {
        id: 'understanding',
        name: 'Demonstrates Understanding',
        description: 'Shows clear understanding of concepts',
        maxPoints: 30,
      },
      {
        id: 'examples',
        name: 'Uses Examples',
        description: 'Provides relevant examples',
        maxPoints: 20,
      },
    ],
    totalPoints: 100,
  },
};

const result = await essayGradingService.gradeEssay(submission);
```

### Rubric-Based Grading

```typescript
interface Rubric {
  criteria: RubricCriterion[];
  totalPoints: number;
}

interface RubricCriterion {
  id: string;
  name: string;
  description: string;
  maxPoints: number;
  levels: Array<{
    score: number;
    description: string;
  }>;
}
```

### Grammar Analysis

Detects:
- Repeated words
- Common spelling errors
- Sentence fragments
- Run-on sentences (> 40 words)
- Passive voice overuse
- Subject-verb agreement

### Readability Score

Uses Flesch Reading Ease formula:

```
Score = 206.835 - 1.015 × (words/sentences) - 84.6 × (syllables/words)

Interpretation:
90-100: Very easy (5th grade)
80-90: Easy (6th grade)
70-80: Fairly easy (7th grade)
60-70: Standard (8th-9th grade)
50-60: Fairly difficult (10th-12th grade)
30-50: Difficult (college)
0-30: Very difficult (graduate)
```

## API Endpoints

### Grade Code Submission

```http
POST /api/ai/grade/code
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "function factorial(n) { ... }",
  "language": "javascript",
  "exerciseId": "ex-123",
  "testCases": [...]
}

Response:
{
  "success": true,
  "result": {
    "score": 85.5,
    "maxScore": 100,
    "percentage": 85.5,
    "passed": true,
    ...
  }
}
```

### Grade Essay

```http
POST /api/ai/grade/essay
Content-Type: application/json

{
  "content": "Essay text...",
  "questionId": "q-123",
  "rubric": {...}
}
```

### Batch Grade Essays

```http
POST /api/ai/grade/essay/batch
Content-Type: application/json

{
  "submissions": [
    {
      "content": "Essay 1...",
      "questionId": "q-123"
    },
    {
      "content": "Essay 2...",
      "questionId": "q-123"
    }
  ]
}
```

### Request Human Review

```http
POST /api/ai/grade/review/request
Content-Type: application/json

{
  "submissionId": "sub-123",
  "reason": "Borderline passing score"
}
```

## Human Review Workflow

### When Required

1. **Borderline Scores**: 55-65% or 85-95%
2. **High Plagiarism**: > 50% similarity
3. **Many Errors**: > 10 grammar issues
4. **No Concepts**: Zero key concepts identified
5. **Edge Cases**: Unusual patterns

### Review Interface

```typescript
// Get pending reviews (instructors only)
GET /api/ai/grade/review/pending

// Submit review
POST /api/ai/grade/review/submit
{
  "submissionId": "sub-123",
  "score": 75,
  "feedback": "Good effort, but...",
  "approved": true
}
```

## Grading Statistics

```typescript
const stats = {
  totalSubmissions: 1234,
  averageScore: 78.5,
  passRate: 0.82,
  commonIssues: [
    { issue: 'Missing semicolons', count: 456 },
    { issue: 'Console.log statements', count: 234 },
  ],
  scoreDistribution: {
    '0-50': 45,
    '51-60': 123,
    '61-70': 234,
    '71-80': 345,
    '81-90': 345,
    '91-100': 142,
  },
};
```

## Best Practices

### 1. Test Case Design

- Cover basic functionality
- Include edge cases
- Test error handling
- Use weighted tests for complex cases
- Hide critical test cases from students

### 2. Rubric Design

- Clear, measurable criteria
- Specific descriptions
- Appropriate point distribution
- Multiple scoring levels
- Aligned with learning objectives

### 3. Feedback Quality

- Be specific and actionable
- Highlight strengths
- Explain why errors matter
- Provide resources for improvement
- Encourage growth mindset

### 4. Security

- Sandbox all code execution
- Limit resource usage
- Timeout long-running code
- Validate all inputs
- Log security incidents

## Performance Optimization

### Caching

```typescript
// Cache grading results
const cacheKey = `grade-${submissionHash}`;
const cached = cache.get(cacheKey);

if (!cached) {
  const result = await gradeSubmission(...);
  cache.set(cacheKey, result, 3600);
}
```

### Parallel Processing

```typescript
// Grade multiple submissions in parallel
const results = await Promise.all(
  submissions.map(sub => codeGradingService.gradeSubmission(sub))
);
```

### Background Jobs

```typescript
// Queue large grading batches
queue.add('grade-batch', {
  submissions: largeSubmissionArray,
  priority: 'normal',
});
```

## Troubleshooting

### Common Issues

**1. Timeout Errors**
- Increase execution timeout
- Optimize test cases
- Check for infinite loops

**2. False Positives (Style)**
- Adjust style rules
- Create exception patterns
- Update linter configuration

**3. Incorrect Plagiarism Detection**
- Check normalization logic
- Adjust similarity threshold
- Review common code patterns

**4. Poor Performance**
- Enable caching
- Use parallel processing
- Optimize test execution

## Export Grading Results

```typescript
// Export as CSV
GET /api/ai/grade/export/ex-123?format=csv

// Export as JSON
GET /api/ai/grade/export/ex-123?format=json
```

## Future Enhancements

- ML-based code quality prediction
- Automated test case generation
- Real-time grading feedback
- Comparative analysis across cohorts
- Adaptive difficulty adjustment
- Multi-language support expansion
