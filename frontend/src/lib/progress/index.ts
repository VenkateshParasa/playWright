/**
 * Progress Library
 * Central export for all progress tracking utilities
 */

// Calculations
export {
  calculateOverallProgress,
  calculateModuleProgress,
  calculateWeeklyProgress,
  calculateDailyProgress,
  calculatePerformanceMetrics,
  calculateProgressTrend,
  formatStudyTime,
  formatDetailedStudyTime,
  getDateRange,
  generateDateLabels,
  calculatePercentage,
  calculateWeightedPercentage,
} from './progressCalculations';

// Milestones
export {
  MILESTONES,
  calculateMilestones,
  getNewlyCompletedMilestones,
  getActiveMilestones,
  getCompletedMilestones,
  getMilestoneProgress,
  getNextMilestone,
  MILESTONE_CATEGORIES,
  getCelebrationMessage,
  getMilestoneMotivation,
} from './milestones';

// Export utilities
export {
  exportToCSV,
  exportToJSON,
  exportToPDF,
  generateProgressReport,
} from './exportUtils';
