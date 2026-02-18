/**
 * Progress Export Utilities
 * Functions for exporting progress data to various formats
 */

import type { ProgressReport, ProgressStatistics, ProgressExportOptions } from '../../types/progress.types';

// ============================================================================
// CSV Export
// ============================================================================

export const exportToCSV = (data: ProgressStatistics, filename: string = 'progress-report'): void => {
  const csvRows: string[] = [];

  // Overall Progress Section
  csvRows.push('Overall Progress');
  csvRows.push('Metric,Value');
  csvRows.push(`Progress Percentage,${data.overall.percentage}%`);
  csvRows.push(`Lessons Completed,${data.overall.lessonsCompleted}/${data.overall.totalLessons}`);
  csvRows.push(`Quizzes Passed,${data.overall.quizzesPassed}/${data.overall.totalQuizzes}`);
  csvRows.push(`Exercises Completed,${data.overall.exercisesCompleted}/${data.overall.totalExercises}`);
  csvRows.push(`Flashcards Reviewed,${data.overall.flashcardsReviewed}/${data.overall.totalFlashcards}`);
  csvRows.push(`Current Streak,${data.overall.currentStreak} days`);
  csvRows.push(`Longest Streak,${data.overall.longestStreak} days`);
  csvRows.push(`Total Study Time,${formatTimeForCSV(data.overall.totalStudyTime)}`);
  csvRows.push(`Total Sessions,${data.overall.totalSessions}`);
  csvRows.push('');

  // Module Progress Section
  csvRows.push('Module Progress');
  csvRows.push('Module Name,Week,Progress %,Lessons,Quizzes,Exercises,Time Spent');
  data.modules.forEach((module) => {
    csvRows.push(
      `"${module.moduleName}",` +
      `${module.weekNumber},` +
      `${module.progress}%,` +
      `${module.lessonsCompleted}/${module.totalLessons},` +
      `${module.quizzesPassed}/${module.totalQuizzes},` +
      `${module.exercisesCompleted}/${module.totalExercises},` +
      `${formatTimeForCSV(module.timeSpent)}`
    );
  });
  csvRows.push('');

  // Weekly Progress Section
  csvRows.push('Weekly Progress');
  csvRows.push('Week,Date Range,Lessons,Quizzes,Exercises,Study Time,Sessions,Avg Score');
  data.weekly.forEach((week) => {
    csvRows.push(
      `Week ${week.weekNumber},` +
      `"${week.startDate} to ${week.endDate}",` +
      `${week.lessonsCompleted},` +
      `${week.quizzesPassed},` +
      `${week.exercisesCompleted},` +
      `${formatTimeForCSV(week.studyTime)},` +
      `${week.sessions},` +
      `${week.averageScore.toFixed(1)}%`
    );
  });
  csvRows.push('');

  // Daily Progress Section
  csvRows.push('Daily Activity (Last 30 Days)');
  csvRows.push('Date,Lessons,Quizzes,Exercises,Flashcards,Study Time,Sessions');
  data.daily.slice(-30).forEach((day) => {
    csvRows.push(
      `${day.date},` +
      `${day.lessonsCompleted},` +
      `${day.quizzesPassed},` +
      `${day.exercisesCompleted},` +
      `${day.flashcardsReviewed},` +
      `${formatTimeForCSV(day.studyTime)},` +
      `${day.sessions}`
    );
  });
  csvRows.push('');

  // Milestones Section
  csvRows.push('Milestones');
  csvRows.push('Title,Category,Progress,Status');
  data.milestones.forEach((milestone) => {
    csvRows.push(
      `"${milestone.title}",` +
      `${milestone.category},` +
      `${milestone.current}/${milestone.target},` +
      `${milestone.isCompleted ? 'Completed' : 'In Progress'}`
    );
  });

  // Create and download CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadFile(blob, `${filename}.csv`);
};

// ============================================================================
// JSON Export
// ============================================================================

export const exportToJSON = (data: ProgressStatistics, filename: string = 'progress-data'): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json' });
  downloadFile(blob, `${filename}.json`);
};

// ============================================================================
// PDF Export (HTML-based)
// ============================================================================

export const exportToPDF = (report: ProgressReport, options: ProgressExportOptions): void => {
  // Create HTML content for PDF
  const htmlContent = generateReportHTML(report, options);

  // Open in new window for printing
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();

    // Wait for content to load, then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
};

const generateReportHTML = (report: ProgressReport, options: ProgressExportOptions): string => {
  const { user, summary, details } = report;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Progress Report - ${user.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #1f2937;
      padding: 40px;
      background: white;
    }
    .header {
      border-bottom: 3px solid #3B82F6;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    h1 { font-size: 32px; color: #1f2937; margin-bottom: 10px; }
    h2 { font-size: 24px; color: #374151; margin: 30px 0 15px; }
    h3 { font-size: 18px; color: #4b5563; margin: 20px 0 10px; }
    .meta { color: #6b7280; font-size: 14px; }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin: 30px 0;
    }
    .summary-card {
      background: #f9fafb;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
    }
    .summary-card .label { color: #6b7280; font-size: 14px; }
    .summary-card .value { font-size: 32px; font-weight: bold; color: #3B82F6; margin-top: 5px; }
    .summary-card .unit { font-size: 16px; color: #6b7280; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background: #f9fafb;
      font-weight: 600;
      color: #374151;
    }
    .progress-bar {
      background: #e5e7eb;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 5px 0;
    }
    .progress-fill {
      background: #3B82F6;
      height: 100%;
      transition: width 0.3s;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      background: #dbeafe;
      color: #1e40af;
    }
    .badge.completed { background: #d1fae5; color: #065f46; }
    .recommendations {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 20px;
      margin: 30px 0;
    }
    .recommendations li { margin: 8px 0; }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Progress Report</h1>
    <div class="meta">
      <strong>${user.name}</strong> | ${user.email}<br>
      Learning Track: ${user.learningTrack}<br>
      Report Period: ${new Date(report.periodStart).toLocaleDateString()} - ${new Date(report.periodEnd).toLocaleDateString()}<br>
      Generated: ${new Date(report.generatedAt).toLocaleString()}
    </div>
  </div>

  <h2>Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Overall Progress</div>
      <div class="value">${summary.overallProgress}<span class="unit">%</span></div>
    </div>
    <div class="summary-card">
      <div class="label">Lessons Completed</div>
      <div class="value">${summary.lessonsCompleted}</div>
    </div>
    <div class="summary-card">
      <div class="label">Study Time</div>
      <div class="value">${Math.round(summary.totalStudyTime / 3600)}<span class="unit">h</span></div>
    </div>
    <div class="summary-card">
      <div class="label">Current Streak</div>
      <div class="value">${summary.currentStreak}<span class="unit">days</span></div>
    </div>
    <div class="summary-card">
      <div class="label">Achievements</div>
      <div class="value">${summary.achievementsEarned}</div>
    </div>
    <div class="summary-card">
      <div class="label">Average Score</div>
      <div class="value">${summary.averageScore}<span class="unit">%</span></div>
    </div>
  </div>

  ${options.includeDetails ? `
  <h2>Module Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Module</th>
        <th>Week</th>
        <th>Progress</th>
        <th>Lessons</th>
        <th>Quizzes</th>
        <th>Exercises</th>
      </tr>
    </thead>
    <tbody>
      ${details.moduleBreakdown.map(module => `
        <tr>
          <td>${module.moduleName}</td>
          <td>${module.weekNumber}</td>
          <td>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${module.progress}%"></div>
            </div>
            ${module.progress}%
          </td>
          <td>${module.lessonsCompleted}/${module.totalLessons}</td>
          <td>${module.quizzesPassed}/${module.totalQuizzes}</td>
          <td>${module.exercisesCompleted}/${module.totalExercises}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Performance Metrics</h2>
  <table>
    <tr>
      <td><strong>Average Quiz Score</strong></td>
      <td>${details.performanceMetrics.averageQuizScore}%</td>
    </tr>
    <tr>
      <td><strong>Quiz Score Trend</strong></td>
      <td><span class="badge">${details.performanceMetrics.quizScoreTrend}</span></td>
    </tr>
    <tr>
      <td><strong>Average Exercise Score</strong></td>
      <td>${details.performanceMetrics.averageExerciseScore}%</td>
    </tr>
    <tr>
      <td><strong>Flashcard Retention</strong></td>
      <td>${details.performanceMetrics.flashcardRetention}%</td>
    </tr>
    <tr>
      <td><strong>Completion Rate</strong></td>
      <td>${details.performanceMetrics.completionRate}%</td>
    </tr>
    <tr>
      <td><strong>Consistency Score</strong></td>
      <td>${details.performanceMetrics.consistencyScore}%</td>
    </tr>
  </table>

  <h2>Milestones Achieved</h2>
  <table>
    <thead>
      <tr>
        <th>Milestone</th>
        <th>Category</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${details.milestones.map(milestone => `
        <tr>
          <td>${milestone.icon} ${milestone.title}</td>
          <td>${milestone.category}</td>
          <td>
            <span class="badge ${milestone.isCompleted ? 'completed' : ''}">
              ${milestone.isCompleted ? 'Completed' : `${milestone.current}/${milestone.target}`}
            </span>
          </td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <h2>Topics Mastered</h2>
  <ul>
    ${details.topicsMastered.map(topic => `<li>${topic}</li>`).join('')}
  </ul>

  ${details.topicsNeedingWork.length > 0 ? `
  <h2>Areas for Improvement</h2>
  <ul>
    ${details.topicsNeedingWork.map(topic => `<li>${topic}</li>`).join('')}
  </ul>
  ` : ''}
  ` : ''}

  ${report.recommendations.length > 0 ? `
  <div class="recommendations">
    <h3>Recommendations</h3>
    <ul>
      ${report.recommendations.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  </div>
  ` : ''}

  <div class="footer">
    <p>Playwright & Selenium Learning Platform | Generated on ${new Date().toLocaleDateString()}</p>
  </div>
</body>
</html>
  `;
};

// ============================================================================
// Helper Functions
// ============================================================================

const formatTimeForCSV = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// ============================================================================
// Report Generation
// ============================================================================

export const generateProgressReport = (
  statistics: ProgressStatistics,
  user: { name: string; email: string; learningTrack: '30-day' | '60-day' },
  periodStart: string,
  periodEnd: string
): ProgressReport => {
  const { overall, modules, milestones } = statistics;

  // Generate recommendations
  const recommendations: string[] = [];

  if (overall.currentStreak < 3) {
    recommendations.push('Try to study consistently for at least 3 days in a row to build a strong learning habit.');
  }

  if (overall.percentage < 50) {
    recommendations.push('You\'re making good progress! Consider dedicating more time to complete more lessons this week.');
  }

  const incompleteLessons = overall.totalLessons - overall.lessonsCompleted;
  if (incompleteLessons > 0 && incompleteLessons <= 5) {
    recommendations.push(`You're close to completing all lessons! Just ${incompleteLessons} more to go.`);
  }

  if (overall.averageSessionTime < 1800) { // Less than 30 minutes
    recommendations.push('Consider longer study sessions for better retention and understanding.');
  }

  const completedMilestones = milestones.filter(m => m.isCompleted);
  const nextMilestone = milestones.find(m => !m.isCompleted && m.current > 0);
  if (nextMilestone) {
    recommendations.push(`You're ${nextMilestone.target - nextMilestone.current} steps away from achieving "${nextMilestone.title}"!`);
  }

  // Determine topics mastered and needing work
  const topicsMastered = modules
    .filter(m => m.progress === 100)
    .map(m => m.moduleName);

  const topicsNeedingWork = modules
    .filter(m => m.progress > 0 && m.progress < 70)
    .sort((a, b) => a.progress - b.progress)
    .slice(0, 5)
    .map(m => m.moduleName);

  return {
    generatedAt: new Date().toISOString(),
    periodStart,
    periodEnd,
    user,
    summary: {
      overallProgress: overall.percentage,
      lessonsCompleted: overall.lessonsCompleted,
      totalStudyTime: overall.totalStudyTime,
      currentStreak: overall.currentStreak,
      achievementsEarned: completedMilestones.length,
      averageScore: 0, // Will be calculated from performance metrics
    },
    details: {
      moduleBreakdown: modules,
      weeklyActivity: statistics.weekly,
      performanceMetrics: {
        averageQuizScore: 0,
        quizScoreTrend: 'stable',
        averageExerciseScore: 0,
        exerciseScoreTrend: 'stable',
        flashcardRetention: 0,
        completionRate: 0,
        consistencyScore: 0,
      },
      topicsMastered,
      topicsNeedingWork,
      milestones: completedMilestones,
    },
    recommendations,
  };
};
