# SCORM Implementation Guide

## Overview

The Playwright & Selenium Learning Platform supports SCORM 1.2 and SCORM 2004 for importing and tracking e-learning content.

## Architecture

```
┌─────────────────┐
│  SCORM Package  │
│   (ZIP File)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SCORM Engine   │
│  - Parser       │
│  - Runtime API  │
│  - Tracker      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Data Model    │
│  - CMI Elements │
│  - Completion   │
│  - Scores       │
└─────────────────┘
```

## Importing SCORM Content

### Package Structure

```
course.zip
├── imsmanifest.xml
├── index.html
├── shared/
│   ├── launchpage.html
│   └── assessmenttemplate.html
└── resources/
    ├── images/
    ├── scripts/
    └── styles/
```

### Import API

```typescript
POST /api/scorm/import
Content-Type: multipart/form-data

Body:
- package: File (ZIP)
- userId: string
```

## SCORM Runtime API

### Initialize

```javascript
API.LMSInitialize("") // SCORM 1.2
API_1484_11.Initialize("") // SCORM 2004
```

### Get/Set Values

```javascript
// Get value
var status = API.LMSGetValue("cmi.core.lesson_status");

// Set value
API.LMSSetValue("cmi.core.score.raw", "85");

// Commit
API.LMSCommit("");

// Finish
API.LMSFinish("");
```

### Data Model Elements

**SCORM 1.2**
- `cmi.core.student_id`
- `cmi.core.student_name`
- `cmi.core.lesson_location`
- `cmi.core.lesson_status`
- `cmi.core.score.raw/max/min`
- `cmi.core.total_time`
- `cmi.core.session_time`
- `cmi.suspend_data`

**SCORM 2004**
- `cmi.learner_id`
- `cmi.learner_name`
- `cmi.location`
- `cmi.completion_status`
- `cmi.success_status`
- `cmi.score.scaled/raw/max/min`
- `cmi.total_time`
- `cmi.session_time`
- `cmi.suspend_data`

## Integration Example

```typescript
import { scormEngine } from './services/scorm/scormEngine';

// Import package
const packageBuffer = await fs.readFile('course.zip');
const scormPackage = await scormEngine.importPackage(packageBuffer, userId);

// Initialize session
const session = await scormEngine.initializeSession(
  userId,
  scormPackage.id,
  'item-1'
);

// Track progress
scormEngine.setValue(session.sessionId, 'cmi.core.lesson_status', 'completed');
scormEngine.setValue(session.sessionId, 'cmi.core.score.raw', 95);
scormEngine.commit(session.sessionId);

// Finish
scormEngine.terminate(session.sessionId);
```

## Tracking and Reporting

```typescript
// Get session data
GET /api/scorm/sessions/:sessionId

// Get completion status
GET /api/scorm/progress/:userId/:packageId

// Get scores
GET /api/scorm/scores/:userId/:packageId
```

## Best Practices

1. **Validation**: Validate SCORM packages before import
2. **Error Handling**: Implement proper error codes
3. **Data Persistence**: Save data on every commit
4. **Session Management**: Handle timeouts gracefully
5. **Cross-browser**: Test in multiple browsers

## Troubleshooting

### Common Issues

**Package Not Found**
- Verify imsmanifest.xml exists
- Check XML structure

**API Not Found**
- Ensure API object is in parent window
- Check iframe communication

**Data Not Saving**
- Call LMSCommit regularly
- Check network connectivity

## Testing

```typescript
describe('SCORM Engine', () => {
  it('should import valid package', async () => {
    const pkg = await scormEngine.importPackage(buffer, userId);
    expect(pkg.version).toBe('1.2');
  });

  it('should track completion', async () => {
    const session = await scormEngine.initializeSession(userId, pkgId, itemId);
    scormEngine.setValue(session.sessionId, 'cmi.core.lesson_status', 'completed');
    const result = scormEngine.getValue(session.sessionId, 'cmi.core.lesson_status');
    expect(result.value).toBe('completed');
  });
});
```

## Resources

- [SCORM 1.2 Specification](https://scorm.com/scorm-explained/technical-scorm/scorm-12-overview-for-developers/)
- [SCORM 2004 Specification](https://scorm.com/scorm-explained/technical-scorm/scorm-2004-overview/)
- [ADL SCORM Resources](https://adlnet.gov/projects/scorm/)
