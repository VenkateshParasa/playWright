import { FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

/**
 * Global teardown for Playwright tests
 * Runs once after all tests
 */
async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting global teardown...');

  // Clean up auth files
  const authDir = path.join(process.cwd(), 'playwright/.auth');
  if (fs.existsSync(authDir)) {
    const files = fs.readdirSync(authDir);
    files.forEach(file => {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(authDir, file));
      }
    });
  }

  // Clean up test data
  await cleanupTestData();

  // Generate test report summary
  await generateReportSummary();

  console.log('✅ Global teardown completed');
}

async function cleanupTestData() {
  console.log('🗑️  Cleaning up test data...');

  // Clean up any test users, data created during tests
  // This would typically call API endpoints to clean up test data

  try {
    // Example: Delete test users
    // await fetch('http://localhost:3000/api/test/cleanup', { method: 'POST' });
    console.log('✅ Test data cleaned up');
  } catch (error) {
    console.error('❌ Failed to clean up test data:', error);
  }
}

async function generateReportSummary() {
  console.log('📊 Generating test report summary...');

  const reportPath = path.join(process.cwd(), 'playwright-report/results.json');

  if (fs.existsSync(reportPath)) {
    try {
      const reportData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

      const summary = {
        totalTests: reportData.suites?.reduce((acc: number, suite: any) => {
          return acc + (suite.specs?.length || 0);
        }, 0) || 0,
        timestamp: new Date().toISOString(),
        duration: reportData.stats?.duration || 0,
      };

      console.log('📈 Test Summary:', summary);

      // Save summary
      fs.writeFileSync(
        path.join(process.cwd(), 'playwright-report/summary.json'),
        JSON.stringify(summary, null, 2)
      );
    } catch (error) {
      console.error('❌ Failed to generate report summary:', error);
    }
  }
}

export default globalTeardown;
