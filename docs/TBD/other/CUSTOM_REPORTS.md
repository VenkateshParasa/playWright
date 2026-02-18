# Custom Reports Guide

## Overview

The Custom Report Builder allows you to create, schedule, and share custom analytics reports tailored to your specific needs. Build reports with drag-and-drop simplicity, export in multiple formats, and automate delivery via email.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Report Components](#report-components)
3. [Creating Custom Reports](#creating-custom-reports)
4. [Report Templates](#report-templates)
5. [Scheduling Reports](#scheduling-reports)
6. [Sharing Reports](#sharing-reports)
7. [Exporting Reports](#exporting-reports)
8. [API Reference](#api-reference)
9. [Examples](#examples)

## Getting Started

### Accessing the Report Builder

Navigate to `/analytics/reports` to access the custom report builder.

### Permissions

- **Students**: Can create personal reports
- **Instructors**: Can create and share reports with students
- **Admins**: Can create public reports and templates

## Report Components

### Data Sources

Available data sources:
- **Users**: User account information
- **Progress**: Learning progress and achievements
- **Lessons**: Lesson content and metadata
- **Quizzes**: Quiz attempts and scores
- **Flashcards**: SRS card data and reviews
- **Combined**: Multiple data sources joined

### Metrics

Aggregation types:
- **Count**: Number of records
- **Sum**: Total of numeric values
- **Average**: Mean of numeric values
- **Min**: Minimum value
- **Max**: Maximum value
- **Distinct**: Unique count

### Dimensions

Group data by:
- Date fields (day, week, month, year)
- Category fields (role, status, level)
- Custom fields from your data source

### Filters

Filter operators:
- **Equals (eq)**: Exact match
- **Not Equals (ne)**: Exclude value
- **Greater Than (gt)**: Numeric comparison
- **Greater Than or Equal (gte)**: Inclusive comparison
- **Less Than (lt)**: Numeric comparison
- **Less Than or Equal (lte)**: Inclusive comparison
- **In**: Match any of provided values
- **Contains**: Text search

### Visualizations

Chart types:
- **Bar Chart**: Compare categories
- **Line Chart**: Show trends over time
- **Pie Chart**: Show proportions
- **Area Chart**: Cumulative trends
- **Table**: Raw data view
- **Scatter Plot**: Correlation analysis
- **Heatmap**: Two-dimensional patterns

## Creating Custom Reports

### Step 1: Basic Information

```javascript
{
  name: "My Custom Report",
  description: "Monthly user engagement metrics",
  category: "engagement" // user, content, engagement, progress, srs, custom
}
```

### Step 2: Select Data Source

Choose from available data sources:
```javascript
{
  dataSource: "progress" // users, progress, lessons, quizzes, flashcards, combined
}
```

### Step 3: Configure Date Range

**Fixed Date Range:**
```javascript
{
  dateRange: {
    type: "fixed",
    startDate: "2024-01-01",
    endDate: "2024-01-31"
  }
}
```

**Relative Date Range:**
```javascript
{
  dateRange: {
    type: "relative",
    relativeDays: 30 // Last 30 days
  }
}
```

### Step 4: Add Filters

Filter the data:
```javascript
{
  filters: [
    {
      field: "currentLevel",
      operator: "gte",
      value: 5
    },
    {
      field: "quizzesPassed",
      operator: "gt",
      value: 0
    }
  ]
}
```

### Step 5: Define Metrics

Specify what to measure:
```javascript
{
  metrics: [
    {
      field: "totalXP",
      aggregation: "sum",
      alias: "Total XP"
    },
    {
      field: "lessonsCompleted",
      aggregation: "avg",
      alias: "Avg Lessons"
    }
  ]
}
```

### Step 6: Add Dimensions

Group the data:
```javascript
{
  dimensions: [
    {
      field: "currentLevel",
      alias: "Level"
    }
  ]
}
```

### Step 7: Choose Visualization

```javascript
{
  visualization: {
    type: "bar",
    config: {
      xAxis: "Level",
      yAxis: "Total XP",
      showLegend: true,
      showGrid: true,
      colors: ["#3b82f6", "#10b981"]
    }
  }
}
```

### Complete Example

```javascript
const report = {
  name: "Level Progress Report",
  description: "XP and completion metrics by user level",
  category: "progress",
  dataSource: "progress",
  dateRange: {
    type: "relative",
    relativeDays: 30
  },
  filters: [
    {
      field: "currentLevel",
      operator: "gte",
      value: 1
    }
  ],
  metrics: [
    {
      field: "totalXP",
      aggregation: "sum",
      alias: "Total XP"
    },
    {
      field: "lessonsCompleted",
      aggregation: "avg",
      alias: "Avg Lessons"
    }
  ],
  dimensions: [
    {
      field: "currentLevel",
      alias: "Level"
    }
  ],
  visualization: {
    type: "bar",
    config: {
      xAxis: "Level",
      yAxis: "Total XP",
      showLegend: true,
      showGrid: true
    }
  }
};

// Create the report
const response = await fetch('/api/reports', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(report)
});
```

## Report Templates

### Using Templates

1. Navigate to the **Templates** tab
2. Browse available templates
3. Click **Use Template** to create a copy
4. Customize as needed
5. Save with a new name

### Available Templates

**User Growth Template**
- Data Source: Users
- Metrics: User count by signup date
- Visualization: Line chart

**Course Completion Template**
- Data Source: Progress
- Metrics: Completion rates by module
- Visualization: Bar chart

**Quiz Performance Template**
- Data Source: Progress
- Metrics: Pass rates and average scores
- Visualization: Table view

**SRS Review Template**
- Data Source: Flashcards
- Metrics: Review counts and retention rates
- Visualization: Area chart

### Creating Templates

Admins can create templates:
```javascript
const template = {
  ...reportConfig,
  isTemplate: true,
  isPublic: true
};
```

## Scheduling Reports

### Enable Scheduling

```javascript
{
  schedule: {
    enabled: true,
    frequency: "weekly", // daily, weekly, monthly
    dayOfWeek: 1, // 0 = Sunday, 1 = Monday, etc. (for weekly)
    dayOfMonth: 1, // 1-31 (for monthly)
    time: "09:00", // HH:mm format
    recipients: ["user1@example.com", "user2@example.com"],
    format: "pdf" // csv, excel, pdf
  }
}
```

### Scheduling Options

**Daily Reports:**
```javascript
{
  frequency: "daily",
  time: "08:00"
}
```

**Weekly Reports:**
```javascript
{
  frequency: "weekly",
  dayOfWeek: 1, // Monday
  time: "09:00"
}
```

**Monthly Reports:**
```javascript
{
  frequency: "monthly",
  dayOfMonth: 1, // First day of month
  time: "10:00"
}
```

### Email Delivery

Scheduled reports are automatically emailed to recipients in the specified format (CSV, Excel, or PDF).

### Managing Scheduled Reports

View upcoming scheduled reports:
```
GET /api/reports?scheduled=true
```

Disable scheduling:
```javascript
{
  schedule: {
    enabled: false
  }
}
```

## Sharing Reports

### Share with Specific Users

```javascript
// Share report with view permission
await fetch(`/api/reports/${reportId}/share`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userIds: ['user123', 'user456'],
    permission: 'view' // or 'edit'
  })
});
```

### Permission Levels

**View Permission:**
- Run the report
- View results
- Export data
- Cannot modify report configuration

**Edit Permission:**
- All view permissions
- Modify report configuration
- Update filters and metrics
- Cannot delete report (only owner can delete)

### Making Reports Public

Admins can make reports public:
```javascript
{
  isPublic: true
}
```

Public reports are visible to all users.

### Cloning Shared Reports

Users can clone shared reports to create their own versions:
```javascript
await fetch(`/api/reports/${reportId}/clone`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'My Copy of Shared Report'
  })
});
```

## Exporting Reports

### Export Formats

**CSV (Comma-Separated Values)**
- Best for: Data analysis in spreadsheet software
- Includes: Raw data only
- File size: Smallest

**Excel (XLSX)**
- Best for: Formatted reports with styling
- Includes: Data + metadata + formatting
- File size: Medium

**PDF**
- Best for: Presentation and printing
- Includes: Data + charts + metadata
- File size: Largest

### Export via UI

1. Run the report
2. Click **Export** button
3. Select format (CSV, Excel, or PDF)
4. Download automatically starts

### Export via API

```javascript
// Export as CSV
const response = await fetch(
  `/api/reports/${reportId}/export?format=csv&includeMetadata=true`
);
const blob = await response.blob();

// Create download link
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `report-${reportId}.csv`;
a.click();
```

### Bulk Export

Export multiple reports:
```javascript
const reportIds = ['report1', 'report2', 'report3'];

for (const id of reportIds) {
  await fetch(`/api/reports/${id}/export?format=excel`);
}
```

### Scheduled Exports

Use report scheduling to automatically generate and email exports.

## API Reference

### Create Report

```
POST /api/reports
```

**Request Body:**
```json
{
  "name": "Report Name",
  "description": "Description",
  "category": "user",
  "dataSource": "users",
  "dateRange": {
    "type": "relative",
    "relativeDays": 30
  },
  "filters": [],
  "metrics": [],
  "dimensions": [],
  "visualization": {
    "type": "bar"
  }
}
```

### Get User Reports

```
GET /api/reports
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "report123",
      "name": "My Report",
      "category": "user",
      "lastGenerated": "2024-02-17T10:00:00Z"
    }
  ]
}
```

### Execute Report

```
GET /api/reports/:id/execute
```

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [...],
    "metadata": {
      "reportName": "My Report",
      "generatedAt": "2024-02-17T10:00:00Z",
      "rowCount": 150,
      "executionTime": 234
    }
  }
}
```

### Update Report

```
PUT /api/reports/:id
```

### Delete Report

```
DELETE /api/reports/:id
```

### Export Report

```
GET /api/reports/:id/export?format=csv&includeMetadata=true
```

### Share Report

```
POST /api/reports/:id/share
```

### Clone Report

```
POST /api/reports/:id/clone
```

### Get Templates

```
GET /api/reports/templates
```

### Get Data Source Schema

```
GET /api/reports/schema/:dataSource
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fields": [
      {
        "name": "totalXP",
        "type": "number",
        "filterable": true,
        "aggregatable": true
      }
    ],
    "metrics": [
      { "name": "count", "aggregation": "count" },
      { "name": "sum", "aggregation": "sum" }
    ]
  }
}
```

## Examples

### Example 1: User Registration Report

Track new user registrations by week:

```javascript
const report = {
  name: "Weekly Registrations",
  dataSource: "users",
  dateRange: { type: "relative", relativeDays: 90 },
  metrics: [
    { field: "_id", aggregation: "count", alias: "Users" }
  ],
  dimensions: [
    { field: "createdAt", alias: "Week" }
  ],
  visualization: {
    type: "line",
    config: { xAxis: "Week", yAxis: "Users" }
  }
};
```

### Example 2: Course Progress Report

Monitor student progress across levels:

```javascript
const report = {
  name: "Progress by Level",
  dataSource: "progress",
  filters: [
    { field: "lessonsCompleted", operator: "gt", value: 0 }
  ],
  metrics: [
    { field: "lessonsCompleted", aggregation: "avg", alias: "Avg Lessons" },
    { field: "totalStudyTime", aggregation: "avg", alias: "Avg Study Time" }
  ],
  dimensions: [
    { field: "currentLevel", alias: "Level" }
  ],
  visualization: {
    type: "bar",
    config: { xAxis: "Level", yAxis: "Avg Lessons" }
  }
};
```

### Example 3: Quiz Performance Report

Analyze quiz pass rates:

```javascript
const report = {
  name: "Quiz Pass Rates",
  dataSource: "progress",
  filters: [
    { field: "quizzesCompleted", operator: "gt", value: 0 }
  ],
  metrics: [
    { field: "quizzesCompleted", aggregation: "sum", alias: "Total Quizzes" },
    { field: "quizzesPassed", aggregation: "sum", alias: "Passed Quizzes" }
  ],
  dimensions: [
    { field: "currentLevel", alias: "Level" }
  ],
  visualization: {
    type: "table"
  }
};
```

### Example 4: Scheduled Weekly Report

Create a weekly engagement report delivered every Monday:

```javascript
const report = {
  name: "Weekly Engagement Summary",
  dataSource: "progress",
  dateRange: { type: "relative", relativeDays: 7 },
  metrics: [
    { field: "lessonsCompleted", aggregation: "sum", alias: "Lessons" },
    { field: "quizzesCompleted", aggregation: "sum", alias: "Quizzes" },
    { field: "totalStudyTime", aggregation: "sum", alias: "Study Time" }
  ],
  dimensions: [
    { field: "createdAt", alias: "Date" }
  ],
  visualization: { type: "area" },
  schedule: {
    enabled: true,
    frequency: "weekly",
    dayOfWeek: 1,
    time: "09:00",
    recipients: ["manager@example.com"],
    format: "pdf"
  }
};
```

## Best Practices

### Report Design

1. **Keep it focused**: One report = one question
2. **Use clear names**: Descriptive report and metric names
3. **Choose appropriate visualizations**: Tables for details, charts for trends
4. **Limit data range**: Shorter ranges = faster execution
5. **Test before scheduling**: Run manually first

### Performance Optimization

1. **Use relative date ranges**: More efficient than fixed ranges
2. **Add appropriate filters**: Reduce dataset size
3. **Limit dimensions**: Fewer groupings = faster queries
4. **Use indexes**: Ensure filtered fields are indexed
5. **Cache results**: Store frequently accessed reports

### Data Quality

1. **Validate filters**: Ensure logical filter combinations
2. **Check metrics**: Verify aggregations match intent
3. **Review results**: Spot-check data accuracy
4. **Handle nulls**: Consider missing data in calculations
5. **Document assumptions**: Note calculation methods

### Security

1. **Limit sensitive data**: Don't expose PII in reports
2. **Use appropriate permissions**: Share carefully
3. **Audit report access**: Track who views what
4. **Encrypt exports**: Secure downloaded files
5. **Comply with regulations**: Follow GDPR, CCPA, etc.

## Troubleshooting

### Report Takes Too Long

- Reduce date range
- Add more specific filters
- Simplify aggregations
- Contact admin for optimization

### No Data Returned

- Check filters (too restrictive?)
- Verify date range
- Ensure data exists for period
- Review data source selection

### Incorrect Results

- Validate filter operators
- Check aggregation types
- Review dimension grouping
- Verify data source schema

### Export Fails

- Try smaller dataset
- Use different format
- Check disk space
- Contact support

## Support

For custom reports assistance:
- Email: reports-support@example.com
- Documentation: /docs/custom-reports
- Video Tutorials: /tutorials/report-builder
- Community Forum: /forum/analytics
