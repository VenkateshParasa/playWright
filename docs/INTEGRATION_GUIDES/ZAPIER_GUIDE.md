# Zapier Integration Guide

Learn how to integrate the Playwright & Selenium Learning Platform with Zapier to automate workflows.

## Overview

The Zapier integration allows you to connect the Playwright & Selenium Learning Platform with 5000+ apps. Create automated workflows (Zaps) that trigger actions based on learning events.

## Available Triggers

### 1. Lesson Completed
Triggers when a user completes a lesson.

**Output Data:**
- User ID
- Lesson ID
- Lesson Title
- Completion Date
- Time Spent

**Example Uses:**
- Send congratulations email via Gmail
- Post to Slack channel
- Add row to Google Sheets
- Update CRM contact

### 2. Quiz Passed
Triggers when a user passes a quiz.

**Output Data:**
- User ID
- Quiz ID
- Quiz Title
- Score
- Passing Score
- Completion Date

**Example Uses:**
- Send certificate via email
- Update learning management system
- Award points in gamification system
- Notify instructor

### 3. Achievement Unlocked
Triggers when a user unlocks an achievement.

**Output Data:**
- User ID
- Achievement ID
- Achievement Title
- Achievement Description
- Unlock Date

**Example Uses:**
- Post to social media
- Send push notification
- Update user profile
- Trigger reward delivery

## Available Actions

### 1. Create User
Creates a new user account.

**Required Fields:**
- Email
- First Name
- Last Name
- Password

**Example Uses:**
- Sync users from external system
- Bulk user imports
- Integration with HR systems

### 2. Enroll User in Lesson
Enrolls a user in a specific lesson.

**Required Fields:**
- User ID
- Lesson ID

**Example Uses:**
- Auto-enroll based on role
- Scheduled enrollment
- Course recommendations

### 3. Update Progress
Updates user progress data.

**Required Fields:**
- User ID
- Progress Data

## Setup Instructions

### Step 1: Connect Your Account

1. Go to Zapier.com and create a new Zap
2. Search for "Playwright & Selenium Learning"
3. Click "Connect an Account"
4. Enter your API key from the [Developer Portal](https://app.playwright-learning.com/developers)
5. Click "Yes, Continue"

### Step 2: Choose a Trigger

1. Select a trigger event (e.g., "Lesson Completed")
2. Zapier will test the connection
3. A sample data will be loaded

### Step 3: Add an Action

1. Choose an app to connect (e.g., Gmail, Slack)
2. Select the action (e.g., "Send Email")
3. Map the trigger data to action fields
4. Test the action

### Step 4: Turn On Your Zap

1. Review your Zap configuration
2. Give it a descriptive name
3. Turn on the Zap
4. Monitor execution in Zapier dashboard

## Example Zaps

### Example 1: Lesson Completed → Send Email

**Trigger:** Lesson Completed
**Action:** Gmail - Send Email

**Configuration:**
```
To: {{user_email}}
Subject: Congratulations on completing {{lesson_title}}!
Body: Great job completing the lesson! Your next recommended lesson is...
```

### Example 2: Quiz Passed → Update Google Sheets

**Trigger:** Quiz Passed
**Action:** Google Sheets - Create Row

**Configuration:**
```
Spreadsheet: Learning Progress
Sheet: Quiz Results
Row Data:
- User ID: {{user_id}}
- Quiz: {{quiz_title}}
- Score: {{score}}
- Date: {{completion_date}}
```

### Example 3: Achievement Unlocked → Post to Slack

**Trigger:** Achievement Unlocked
**Action:** Slack - Send Channel Message

**Configuration:**
```
Channel: #achievements
Message: 🏆 User {{user_id}} unlocked "{{achievement_title}}"!
```

### Example 4: New Form Entry → Create User & Enroll

**Trigger:** Google Forms - New Response
**Action 1:** Playwright Learning - Create User
**Action 2:** Playwright Learning - Enroll User in Lesson

**Configuration:**
```
Create User:
- Email: {{form_email}}
- First Name: {{form_first_name}}
- Last Name: {{form_last_name}}
- Password: {{generated_password}}

Enroll User:
- User ID: {{step_1_user_id}}
- Lesson ID: lesson_basics_001
```

### Example 5: Achievement → Award in External System

**Trigger:** Achievement Unlocked
**Action:** HTTP Request - POST

**Configuration:**
```
URL: https://your-rewards-system.com/api/award
Method: POST
Body:
{
  "user_id": "{{user_id}}",
  "achievement": "{{achievement_id}}",
  "points": 100
}
```

## Webhook vs Polling

The Zapier integration uses **webhooks** for instant triggers:

- ✅ Real-time execution (< 1 second)
- ✅ No API quota usage for polling
- ✅ More reliable
- ✅ Better user experience

Webhooks are automatically created when you set up a trigger in Zapier.

## Troubleshooting

### Trigger Not Firing

1. **Check webhook status**: Verify webhook is active in Developer Portal
2. **Test the trigger**: Use Zapier's "Find New Records" button
3. **Check logs**: View webhook logs in Developer Portal
4. **Verify events**: Ensure trigger events are being generated

### Action Failing

1. **Check API key**: Verify API key has required scopes
2. **Check rate limits**: View usage in Developer Portal
3. **Verify data**: Ensure all required fields are mapped
4. **Test in isolation**: Test the action manually in Zapier

### Authentication Issues

1. **Reconnect account**: Disconnect and reconnect in Zapier
2. **Generate new API key**: Create a new key in Developer Portal
3. **Check scopes**: Ensure API key has appropriate scopes
4. **Contact support**: Email api@playwright-learning.com

## Best Practices

### 1. Use Filters
Add filters to prevent unnecessary action executions:

```
Only continue if:
- Quiz Score > 80
- Lesson Category = "Playwright"
- User Role = "Premium"
```

### 2. Add Delays
Use delays between actions to prevent rate limiting:

```
Action 1: Create User
Delay: 1 second
Action 2: Enroll User
```

### 3. Handle Errors
Add error handling paths:

```
Action: Create User
Error Path: Send notification to admin
```

### 4. Use Multi-Step Zaps
Chain multiple actions:

```
Trigger: Lesson Completed
Action 1: Send congratulations email
Action 2: Update Google Sheets
Action 3: Post to Slack
Action 4: Update CRM
```

### 5. Test Thoroughly
Always test your Zaps before activating:

1. Use test data
2. Check all actions execute
3. Verify data mapping
4. Test error scenarios

## Advanced Features

### Custom Webhooks

For advanced use cases, create custom webhooks:

```javascript
const axios = require('axios');

const webhook = await axios.post(
  'https://api.playwright-learning.com/v1/webhooks',
  {
    url: 'https://hooks.zapier.com/hooks/catch/YOUR_HOOK/',
    events: ['lesson.completed', 'quiz.passed'],
    description: 'Custom Zapier webhook'
  },
  {
    headers: {
      'Authorization': 'Bearer YOUR_API_KEY'
    }
  }
);
```

### Data Transformation

Use Zapier's Code step for custom transformations:

```javascript
// Zapier Code (JavaScript)
const inputData = {
  score: input.score,
  passing_score: input.passing_score
};

const passed = inputData.score >= inputData.passing_score;
const grade = passed ? 'Pass' : 'Fail';
const percentage = (inputData.score / inputData.passing_score) * 100;

output = {
  passed: passed,
  grade: grade,
  percentage: percentage
};
```

### Conditional Logic

Use Paths for complex workflows:

```
Trigger: Quiz Completed

Path A (Score >= 80):
  → Send congratulations email
  → Award certificate

Path B (Score < 80):
  → Send encouragement email
  → Enroll in remedial lesson
```

## Rate Limits

Zapier actions respect your API rate limits:

- **Free Plan**: 100 tasks/month
- **Starter Plan**: 750 tasks/month
- **Professional Plan**: 2,000+ tasks/month

Each Zap execution counts as 1 task per action step.

## Pricing

The Zapier integration is free to use. You only pay for:

1. Zapier subscription (if using premium features)
2. API usage (based on your plan)

## Support

- **Zapier Help**: https://zapier.com/help
- **API Documentation**: https://api.playwright-learning.com/docs
- **Developer Portal**: https://app.playwright-learning.com/developers
- **Email Support**: api@playwright-learning.com

## Example Use Cases

### Education & Training
- Auto-enroll students in next course
- Send completion certificates
- Update LMS grades
- Track progress in spreadsheets

### Employee Onboarding
- Assign training based on role
- Track completion status
- Send reminders
- Report to HR systems

### Customer Training
- Enroll customers after purchase
- Send progress updates
- Award loyalty points
- Update CRM records

### Gamification
- Award badges and points
- Update leaderboards
- Send achievement notifications
- Trigger rewards

---

**Need Help?**
Contact our support team at api@playwright-learning.com or visit our [Developer Portal](https://app.playwright-learning.com/developers).
