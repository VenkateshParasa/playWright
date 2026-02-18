# Analytics System Guide

## Overview

The Analytics and Reporting System provides comprehensive business intelligence capabilities for the Playwright & Selenium Learning Platform. It includes real-time dashboards, custom report builders, predictive analytics, and automated reporting.

## Table of Contents

1. [Features](#features)
2. [Dashboard Overview](#dashboard-overview)
3. [Real-Time Metrics](#real-time-metrics)
4. [User Engagement Analytics](#user-engagement-analytics)
5. [Learning Outcomes](#learning-outcomes)
6. [Content Performance](#content-performance)
7. [Cohort Analysis](#cohort-analysis)
8. [Funnel Analysis](#funnel-analysis)
9. [Predictive Analytics](#predictive-analytics)
10. [Admin Analytics](#admin-analytics)
11. [API Reference](#api-reference)

## Features

### Real-Time Analytics
- Live user activity monitoring (5-minute intervals)
- Active user counts (5 min, 1 hour, today)
- Recent lesson completions and quiz attempts
- Real-time dashboard updates via WebSocket

### Time-Series Analysis
- Daily, weekly, monthly, yearly granularity
- Customizable date ranges
- Multiple metric types:
  - New users
  - Active users
  - Lesson completions
  - Quiz attempts
  - Study time

### User Engagement Metrics
- **DAU (Daily Active Users)**: Users active in the last 24 hours
- **WAU (Weekly Active Users)**: Users active in the last 7 days
- **MAU (Monthly Active Users)**: Users active in the last 30 days
- **Stickiness Ratio**: DAU/MAU percentage
- **Retention Rates**: Day-over-day, 7-day, 30-day retention

### Learning Outcomes
- Completion rates by module
- Pass rates and perfect quiz percentages
- Average time-to-completion
- Learning velocity (activities per day)
- Active vs total learners

### Content Performance
- Most popular lessons
- Highest-rated content
- Content with high drop-off rates
- Average time spent per lesson
- Completion vs views ratios

### Cohort Analysis
- Weekly cohort tracking
- Retention heatmaps
- Week-over-week retention percentages
- Cohort size and behavior patterns

### Funnel Analysis
- User journey stages:
  1. Registered
  2. Email Verified
  3. Started Learning
  4. Completed First Module
  5. Completed Quiz
  6. Active Learner
- Drop-off rates between stages
- Conversion percentages

### Predictive Analytics
- **Churn Prediction**: Identify users at risk of leaving
  - Risk factors (inactivity, low completion, lost streak)
  - Probability scores (0-100%)
  - Actionable insights

- **Completion Probability**: Predict course completion likelihood
  - Based on current progress
  - Estimated days to completion
  - Success factors

- **Recommendation Effectiveness**: Track recommendation impact
  - Click-through rates
  - Completion rates
  - Overall effectiveness scores

### Admin Analytics
- System performance metrics
- Database statistics
- API usage and response times
- Error rate monitoring
- Resource utilization (CPU, memory, disk)

## Dashboard Overview

### Accessing the Dashboard

Navigate to `/analytics/dashboard` to view the main analytics dashboard.

### Dashboard Sections

1. **Metric Cards**: Quick overview of key metrics
2. **Time-Series Charts**: Trend analysis over time
3. **Engagement Metrics**: User activity and retention
4. **Content Performance**: Top and bottom-performing content
5. **Cohort Tables**: Retention analysis by cohort
6. **Prediction Panels**: Churn and completion predictions

### Time Range Selection

Use the time range selector to filter data:
- Last 7 days
- Last 30 days
- Last 90 days
- Last year

### Exporting Dashboard Data

Click the **Export** button to download dashboard data in:
- PDF format (visual report)
- CSV format (raw data)
- Excel format (formatted spreadsheet)

## Real-Time Metrics

### API Endpoint
```
GET /api/analytics/dashboard/realtime
```

### Response Example
```json
{
  "success": true,
  "data": {
    "activeUsers": {
      "last5Minutes": 23,
      "lastHour": 145
    },
    "recentActivity": {
      "lessonCompletions": 42,
      "quizAttempts": 18,
      "averageQuizScore": 78
    },
    "timestamp": "2024-02-17T10:30:00.000Z"
  }
}
```

### WebSocket Integration

For live updates, connect to the WebSocket endpoint:
```javascript
const ws = new WebSocket('wss://api.example.com/analytics/realtime');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  updateDashboard(data);
};
```

## User Engagement Analytics

### DAU/MAU/WAU Metrics

**Daily Active Users (DAU)**
- Definition: Users who logged in within the last 24 hours
- Use case: Track daily engagement levels

**Weekly Active Users (WAU)**
- Definition: Users who logged in within the last 7 days
- Use case: Monitor weekly engagement trends

**Monthly Active Users (MAU)**
- Definition: Users who logged in within the last 30 days
- Use case: Understand overall platform reach

### Stickiness Ratio

The stickiness ratio (DAU/MAU) measures how "sticky" your platform is:
- **High stickiness (>20%)**: Users return frequently
- **Medium stickiness (10-20%)**: Moderate engagement
- **Low stickiness (<10%)**: Users rarely return

### Retention Rates

**Day-over-Day Retention**
- Percentage of yesterday's users who returned today
- Quick indicator of immediate engagement

**7-Day Retention**
- Percentage of users from 7 days ago still active
- Medium-term engagement indicator

**30-Day Retention**
- Percentage of users from 30 days ago still active
- Long-term platform health indicator

### API Endpoint
```
GET /api/analytics/dashboard/engagement
```

## Learning Outcomes

### Completion Rate
Percentage of users who have completed at least one lesson.

### Pass Rate
Percentage of quiz attempts that resulted in a passing score.

### Perfect Quiz Rate
Percentage of quiz attempts with 100% score.

### Average Time-to-Completion
Average number of days to complete the full course.

### Learning Velocity
Average number of activities (lessons + quizzes + exercises) completed per day per user.

### API Endpoint
```
GET /api/analytics/dashboard/learning-outcomes
```

## Content Performance

### Most Popular Lessons
Ranked by:
- Total views
- Completion count
- Average rating
- Average time spent

### Highest-Rated Content
Content with the best user ratings and feedback.

### High Drop-Off Content
Content where users frequently abandon before completing.

### Performance Metrics
- **View-to-Completion Ratio**: Completions / Views
- **Average Rating**: User satisfaction score
- **Average Time Spent**: Engagement duration

### API Endpoint
```
GET /api/analytics/dashboard/content-performance
```

## Cohort Analysis

### What is Cohort Analysis?
Cohort analysis groups users by signup date and tracks their behavior over time.

### Reading the Cohort Table
- **Rows**: Each row represents a cohort (week of signup)
- **Columns**: Week 0, Week 1, Week 2, etc.
- **Values**: Number of active users in that week
- **Colors**: Darker = higher retention percentage

### Example Cohort Table
```
Cohort         | Week 0 | Week 1 | Week 2 | Week 3 | Week 4
Week of Feb 1  |   100  |   75   |   60   |   50   |   45
Week of Feb 8  |    85  |   68   |   55   |   48   |   --
Week of Feb 15 |    92  |   74   |   62   |   --   |   --
```

### API Endpoint
```
GET /api/analytics/dashboard/cohort?startDate=2024-01-01&endDate=2024-02-17
```

## Funnel Analysis

### User Journey Stages

1. **Registered**: User created an account
2. **Email Verified**: User confirmed their email
3. **Started Learning**: Completed at least one lesson
4. **Completed First Module**: Finished 5+ lessons
5. **Completed Quiz**: Attempted at least one quiz
6. **Active Learner**: Completed 10+ lessons

### Drop-Off Analysis
Identify where users leave the funnel:
- High drop-off between stages indicates friction
- Optimize stages with >30% drop-off

### API Endpoint
```
GET /api/analytics/dashboard/funnel
```

## Predictive Analytics

### Churn Prediction

**Risk Factors:**
- No activity for 2+ weeks (+30% risk)
- Low lesson completion (<10 lessons) (+20% risk)
- Few quiz attempts (<3 quizzes) (+15% risk)
- Lost learning streak (+20% risk)
- Low study time (<60 min) (+15% risk)

**Using Churn Predictions:**
1. Identify high-risk users (>70% probability)
2. Send re-engagement emails
3. Offer personalized incentives
4. Reach out with support

### Completion Probability

**Success Factors:**
- Current progress percentage
- Active learning streak
- Quiz pass rate
- Total study time

**Using Completion Predictions:**
1. Encourage high-probability users
2. Provide extra support to low-probability users
3. Adjust content difficulty
4. Personalize learning paths

### API Endpoints
```
GET /api/analytics/dashboard/churn-prediction
GET /api/analytics/dashboard/completion-prediction
```

## Admin Analytics

### System Performance Metrics

**Database Metrics:**
- Total collections
- Total documents
- Average query time
- Connection pool size

**Performance Metrics:**
- Average response time
- Requests per minute
- Error rate
- Uptime percentage

**Resource Utilization:**
- CPU usage
- Memory usage
- Disk usage
- Network throughput

### User Activity Logs

Track all user actions:
- Lesson completions
- Quiz attempts
- Login/logout events
- Content views
- Settings changes

### API Usage Statistics

Monitor API health:
- Total requests
- Requests by endpoint
- Average response times
- Status code distribution
- Error rates

### Error Rate Monitoring

Track application errors:
- Error count by hour/day
- Error rate percentages
- Top error types
- Affected endpoints

### API Endpoints
```
GET /api/analytics/dashboard/system-metrics (Admin only)
GET /api/analytics/dashboard/activity-logs (Admin only)
GET /api/analytics/dashboard/api-usage (Admin only)
GET /api/analytics/dashboard/error-rates (Admin only)
```

## API Reference

### Authentication
All analytics endpoints require authentication. Include JWT token in headers:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting
- Standard endpoints: 100 requests/minute
- Real-time endpoints: 1000 requests/minute
- Export endpoints: 10 requests/minute

### Error Codes
- `400`: Bad Request - Invalid parameters
- `401`: Unauthorized - Missing or invalid token
- `403`: Forbidden - Insufficient permissions
- `404`: Not Found - Resource not found
- `500`: Internal Server Error

### Common Query Parameters

**Time Range:**
```
?startDate=2024-01-01&endDate=2024-02-17
```

**Granularity:**
```
?granularity=daily|weekly|monthly|yearly
```

**Metric Type:**
```
?metric=newUsers|activeUsers|lessonCompletions
```

**Pagination:**
```
?page=1&limit=50
```

## Best Practices

### Dashboard Usage
1. Check real-time metrics daily
2. Review weekly trends every Monday
3. Analyze cohorts monthly
4. Act on churn predictions immediately

### Performance Optimization
1. Use appropriate time ranges
2. Cache frequently accessed data
3. Limit export operations
4. Use pagination for large datasets

### Data Interpretation
1. Look for trends, not single data points
2. Compare week-over-week and month-over-month
3. Consider external factors (holidays, campaigns)
4. Validate unusual spikes or drops

### Security
1. Restrict admin analytics to authorized users
2. Audit analytics access logs
3. Anonymize sensitive user data
4. Comply with data privacy regulations

## Troubleshooting

### Dashboard Not Loading
1. Check internet connection
2. Verify authentication token
3. Clear browser cache
4. Contact support if issue persists

### Incorrect Data
1. Verify time zone settings
2. Check date range parameters
3. Ensure data sync is complete
4. Report data discrepancies to admin

### Slow Performance
1. Reduce time range
2. Use lower granularity
3. Limit concurrent requests
4. Contact admin for optimization

## Support

For analytics-related questions or issues:
- Email: analytics-support@example.com
- Slack: #analytics-help
- Documentation: /docs/analytics
- Video Tutorials: /tutorials/analytics
