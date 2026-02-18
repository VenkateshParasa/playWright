/**
 * Export utilities for analytics data
 * Supports CSV, JSON, and PDF export formats
 */

/**
 * Convert data to CSV format
 */
export function exportToCSV(data: any[], filename: string = 'export.csv'): void {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to JSON format
 */
export function exportToJSON(data: any, filename: string = 'export.json'): void {
  const jsonContent = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export chart as image (PNG)
 */
export async function exportChartAsImage(
  chartElement: HTMLElement,
  filename: string = 'chart.png'
): Promise<void> {
  try {
    // Use html2canvas if available (would need to be installed)
    // For now, we'll use a simple canvas approach for SVG charts

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Get the SVG element from the chart
    const svg = chartElement.querySelector('svg');
    if (!svg) {
      throw new Error('No SVG found in chart element');
    }

    const svgData = new XMLSerializer().serializeToString(svg);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const link = document.createElement('a');
          const imageUrl = URL.createObjectURL(blob);
          link.setAttribute('href', imageUrl);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';

          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          URL.revokeObjectURL(imageUrl);
        }
      });

      URL.revokeObjectURL(url);
    };

    img.src = url;
  } catch (error) {
    console.error('Error exporting chart as image:', error);
  }
}

/**
 * Generate and download PDF report
 * Note: This is a simplified version. For production, consider using jsPDF library
 */
export function exportToPDF(
  content: string,
  filename: string = 'report.pdf'
): void {
  // This is a placeholder. In production, you would use jsPDF:
  // import jsPDF from 'jspdf';
  // const doc = new jsPDF();
  // doc.text(content, 10, 10);
  // doc.save(filename);

  console.log('PDF export would generate file:', filename);
  alert('PDF export requires jsPDF library. This is a demo version.\nFor production, install: npm install jspdf');
}

/**
 * Format data for CSV export
 */
export function formatDataForExport(data: any): any[] {
  if (Array.isArray(data)) {
    return data;
  }

  // Convert object to array of key-value pairs
  if (typeof data === 'object') {
    return Object.entries(data).map(([key, value]) => ({
      metric: key,
      value: value,
    }));
  }

  return [data];
}

/**
 * Generate analytics report summary
 */
export function generateReportSummary(metrics: {
  users?: any;
  content?: any;
  engagement?: any;
  progress?: any;
  srs?: any;
}): string {
  const lines = [
    '=== ANALYTICS REPORT ===',
    `Generated: ${new Date().toLocaleString()}`,
    '',
  ];

  if (metrics.users) {
    lines.push('USER METRICS:');
    lines.push(`- Total Users: ${metrics.users.totalUsers}`);
    lines.push(`- Active Users (Today): ${metrics.users.activeUsersToday}`);
    lines.push(`- Retention Rate: ${metrics.users.userRetentionRate.toFixed(1)}%`);
    lines.push('');
  }

  if (metrics.content) {
    lines.push('CONTENT METRICS:');
    lines.push(`- Total Lessons: ${metrics.content.totalLessons}`);
    lines.push(`- Total Quizzes: ${metrics.content.totalQuizzes}`);
    lines.push(`- Total Exercises: ${metrics.content.totalExercises}`);
    lines.push('');
  }

  if (metrics.engagement) {
    lines.push('ENGAGEMENT METRICS:');
    lines.push(`- Total Study Time: ${metrics.engagement.totalStudyTime} minutes`);
    lines.push(`- Daily Active Sessions: ${metrics.engagement.dailyActiveSessions}`);
    lines.push('');
  }

  if (metrics.progress) {
    lines.push('PROGRESS METRICS:');
    lines.push(`- Overall Completion: ${metrics.progress.overallCompletionRate.toFixed(1)}%`);
    lines.push(`- Average Progress: ${metrics.progress.averageProgressPercentage.toFixed(1)}%`);
    lines.push('');
  }

  if (metrics.srs) {
    lines.push('SRS METRICS:');
    lines.push(`- Total Cards: ${metrics.srs.totalCards}`);
    lines.push(`- Average Retention: ${metrics.srs.averageRetentionRate}%`);
    lines.push('');
  }

  return lines.join('\n');
}
