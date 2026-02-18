# xAPI (Experience API) Guide

## Overview

xAPI (Tin Can API) is a modern e-learning specification that tracks learning experiences across platforms.

## Core Concepts

### Statement Structure

```json
{
  "actor": {
    "objectType": "Agent",
    "name": "John Doe",
    "mbox": "mailto:john@example.com"
  },
  "verb": {
    "id": "http://adlnet.gov/expapi/verbs/completed",
    "display": { "en-US": "completed" }
  },
  "object": {
    "objectType": "Activity",
    "id": "http://example.com/course-101",
    "definition": {
      "name": { "en-US": "Introduction to Playwright" },
      "description": { "en-US": "Learn Playwright basics" }
    }
  },
  "result": {
    "score": {
      "scaled": 0.95,
      "raw": 95,
      "min": 0,
      "max": 100
    },
    "completion": true,
    "success": true,
    "duration": "PT1H30M"
  },
  "context": {
    "registration": "uuid-123",
    "platform": "Playwright Learning Platform",
    "language": "en-US"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Learning Record Store (LRS)

### Storing Statements

```typescript
// Single statement
POST /api/xapi/statements
Content-Type: application/json
{
  "actor": {...},
  "verb": {...},
  "object": {...}
}

// Multiple statements
POST /api/xapi/statements
[
  { statement1 },
  { statement2 }
]
```

### Querying Statements

```typescript
// Get statements by agent
GET /api/xapi/statements?agent={"mbox":"mailto:john@example.com"}

// Get statements by verb
GET /api/xapi/statements?verb=http://adlnet.gov/expapi/verbs/completed

// Get statements by activity
GET /api/xapi/statements?activity=http://example.com/course-101

// Time-based queries
GET /api/xapi/statements?since=2024-01-01T00:00:00Z&until=2024-12-31T23:59:59Z

// With pagination
GET /api/xapi/statements?limit=50
```

## Common Verbs

### ADL Vocabulary

- `http://adlnet.gov/expapi/verbs/attempted` - Attempted
- `http://adlnet.gov/expapi/verbs/completed` - Completed
- `http://adlnet.gov/expapi/verbs/passed` - Passed
- `http://adlnet.gov/expapi/verbs/failed` - Failed
- `http://adlnet.gov/expapi/verbs/experienced` - Experienced
- `http://adlnet.gov/expapi/verbs/launched` - Launched
- `http://adlnet.gov/expapi/verbs/progressed` - Progressed

### Custom Verbs

```typescript
const customVerb = {
  id: "http://example.com/verbs/submitted",
  display: {
    "en-US": "submitted",
    "es": "presentó"
  }
};
```

## State API

### Store State Data

```typescript
// Save state
POST /api/xapi/states
{
  "activityId": "http://example.com/activity-1",
  "agent": {"mbox":"mailto:john@example.com"},
  "stateId": "bookmark",
  "content": {
    "page": 5,
    "progress": 0.5
  }
}

// Retrieve state
GET /api/xapi/states?activityId=...&agent=...&stateId=bookmark

// Delete state
DELETE /api/xapi/states?activityId=...&agent=...&stateId=bookmark

// Get state IDs
GET /api/xapi/states?activityId=...&agent=...
```

## Activity Profiles

```typescript
// Store activity profile
POST /api/xapi/activities/profile
{
  "activityId": "http://example.com/course-101",
  "profileId": "course-settings",
  "content": {
    "passingScore": 70,
    "attempts": 3
  }
}

// Retrieve profile
GET /api/xapi/activities/profile?activityId=...&profileId=...
```

## Agent Profiles

```typescript
// Store agent profile
POST /api/xapi/agents/profile
{
  "agent": {"mbox":"mailto:john@example.com"},
  "profileId": "preferences",
  "content": {
    "language": "en-US",
    "theme": "dark"
  }
}
```

## Analytics

```typescript
// Get analytics
GET /api/xapi/analytics?activityId=course-101

Response:
{
  "totalStatements": 1000,
  "uniqueActors": 50,
  "uniqueActivities": 10,
  "verbCounts": {
    "completed": 45,
    "passed": 40,
    "failed": 5
  },
  "completionRate": 0.9,
  "averageScore": 0.85
}
```

## Integration Example

```typescript
import { lrs } from './services/xapi/lrs';

// Generate statement helper
const statement = lrs.generateStatement(
  userId,
  userName,
  'http://adlnet.gov/expapi/verbs/completed',
  'completed',
  'http://example.com/course-101',
  'Introduction to Playwright',
  {
    score: { scaled: 0.95, raw: 95, min: 0, max: 100 },
    completion: true,
    success: true,
    duration: 'PT1H30M'
  },
  {
    registration: sessionId,
    platform: 'Playwright Learning Platform'
  }
);

// Store statement
await lrs.putStatement(statement);

// Query statements
const results = await lrs.queryStatements({
  agent: JSON.stringify({ mbox: `mailto:${userEmail}` }),
  verb: 'http://adlnet.gov/expapi/verbs/completed',
  limit: 50
});
```

## Best Practices

1. **Use Standard Verbs**: Prefer ADL vocabulary
2. **Consistent Actor IDs**: Use mbox or account consistently
3. **Meaningful Activity IDs**: Use IRIs that resolve to content
4. **Include Context**: Add registration, platform, language
5. **Store Regularly**: Don't wait until session end
6. **Handle Errors**: Implement retry logic
7. **Validate Statements**: Check structure before sending

## Visualization

### Dashboard Widgets

```typescript
// Completion over time
GET /api/xapi/analytics/completion-trend?days=30

// Popular activities
GET /api/xapi/analytics/popular-activities?limit=10

// Learner progress
GET /api/xapi/analytics/learner-progress?agent=...

// Verb distribution
GET /api/xapi/analytics/verb-distribution
```

## Testing

```typescript
describe('xAPI LRS', () => {
  it('should store statement', async () => {
    const statement = {
      actor: { name: 'Test User', mbox: 'mailto:test@example.com' },
      verb: { id: 'http://adlnet.gov/expapi/verbs/completed' },
      object: { id: 'http://example.com/test-activity' }
    };
    const [id] = await lrs.putStatement(statement);
    expect(id).toBeDefined();
  });

  it('should query statements', async () => {
    const results = await lrs.queryStatements({
      agent: JSON.stringify({ mbox: 'mailto:test@example.com' })
    });
    expect(results.statements.length).toBeGreaterThan(0);
  });
});
```

## Resources

- [xAPI Specification](https://github.com/adlnet/xAPI-Spec)
- [xAPI Vocabulary](https://registry.tincanapi.com/)
- [ADL xAPI Tools](https://adlnet.gov/projects/xapi/)
- [Learning Locker (Open Source LRS)](https://www.ht2labs.com/learning-locker-community/overview/)
