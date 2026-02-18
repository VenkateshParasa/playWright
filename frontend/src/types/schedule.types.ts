/**
 * Schedule Types for Review Calendar System
 * Defines interfaces for calendar, forecast, heatmap, and retention analytics
 */

export interface CalendarData {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of cards due on this date
  breakdown: {
    new: number;
    learning: number;
    review: number;
  };
}

export interface ForecastData {
  date: string; // ISO date string (YYYY-MM-DD)
  new: number;
  learning: number;
  review: number;
  total: number;
  estimatedTime: number; // in minutes
}

export interface HeatmapData {
  date: string; // ISO date string (YYYY-MM-DD)
  count: number; // Number of cards reviewed
  intensity: number; // 0-4 (for color coding)
}

export interface RetentionData {
  interval: string; // e.g., '1 day', '1 week', '1 month'
  days: number; // Number of days since initial review
  retentionRate: number; // Percentage (0-100)
  sampleSize: number; // Number of cards in this interval
}

export interface DayBreakdown {
  date: string;
  cards: {
    id: string;
    front: string;
    back: string;
    category: string;
    difficulty: 'easy' | 'medium' | 'hard';
    type: 'new' | 'learning' | 'review';
    interval: number;
  }[];
  summary: {
    total: number;
    byCategory: Record<string, number>;
    byType: {
      new: number;
      learning: number;
      review: number;
    };
    averageInterval: number;
    estimatedTime: number; // in minutes
  };
}

export interface ScheduleSettings {
  maxNewCardsPerDay: number;
  maxReviewsPerDay: number;
  learningSteps: number[]; // in minutes, e.g., [1, 10, 60, 1440]
  graduatingInterval: number; // in days
  easyIntervalMultiplier: number;
  maximumInterval: number; // in days
  reviewOrder: 'due-date' | 'random' | 'difficulty';
  newCardIntroductionRate: number; // cards per day
}

export interface StudyTimeData {
  date: string;
  duration: number; // in seconds
  cardsReviewed: number;
  sessionCount: number;
}

export interface StudyTimeAnalytics {
  totalTime: number; // in seconds, all-time
  weekTime: number; // in seconds, this week
  monthTime: number; // in seconds, this month
  averageSessionDuration: number; // in seconds
  byDeck: Record<string, number>; // deck name -> time in seconds
  byCategory: Record<string, number>; // category -> time in seconds
  byHourOfDay: number[]; // 24-hour array of time spent
  streak: number; // consecutive days studied
  studyDays: string[]; // ISO date strings of days studied
  mostProductiveHours: number[]; // hours of day (0-23)
}

export interface ManualRescheduleItem {
  cardId: string;
  front: string;
  currentDueDate: string;
  newDueDate: string;
  reason?: string;
}

export interface RescheduleAudit {
  id: string;
  cardId: string;
  oldDueDate: string;
  newDueDate: string;
  reason: string;
  userId: string;
  timestamp: string;
}

export interface CalendarViewState {
  date: Date;
  view: 'month' | 'week' | 'day';
}

export interface ForecastRange {
  days: 7 | 14 | 30 | 60 | 90;
  label: string;
}

export interface HeatmapYear {
  year: number;
  data: HeatmapData[];
  streaks: {
    current: number;
    longest: number;
  };
}

export interface RetentionCurve {
  intervals: RetentionData[];
  averageRetention: number;
  confidenceInterval?: {
    lower: number;
    upper: number;
  };
}

export interface ScheduleStore {
  // Calendar data
  calendarData: Record<string, CalendarData>;
  calendarLoading: boolean;
  calendarError: string | null;

  // Forecast data
  forecastData: ForecastData[];
  forecastRange: ForecastRange['days'];
  forecastLoading: boolean;
  forecastError: string | null;

  // Heatmap data
  heatmapData: HeatmapData[];
  heatmapYear: number;
  heatmapLoading: boolean;
  heatmapError: string | null;

  // Retention data
  retentionCurve: RetentionCurve | null;
  retentionLoading: boolean;
  retentionError: string | null;

  // Selected day breakdown
  selectedDate: string | null;
  dayBreakdown: DayBreakdown | null;
  breakdownLoading: boolean;
  breakdownError: string | null;

  // Schedule settings
  settings: ScheduleSettings;
  settingsLoading: boolean;
  settingsError: string | null;

  // Study time analytics
  studyTimeAnalytics: StudyTimeAnalytics | null;
  studyTimeLoading: boolean;
  studyTimeError: string | null;

  // Actions
  loadCalendarData: (startDate: Date, endDate: Date) => Promise<void>;
  loadForecastData: (days: number) => Promise<void>;
  loadHeatmapData: (year: number) => Promise<void>;
  loadRetentionCurve: (categoryId?: string) => Promise<void>;
  loadDayBreakdown: (date: string) => Promise<void>;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<ScheduleSettings>) => Promise<void>;
  loadStudyTimeAnalytics: () => Promise<void>;
  rescheduleCards: (items: ManualRescheduleItem[]) => Promise<void>;
  setSelectedDate: (date: string | null) => void;
  setForecastRange: (days: ForecastRange['days']) => void;
  setHeatmapYear: (year: number) => void;
  clearErrors: () => void;
}

export const DEFAULT_SCHEDULE_SETTINGS: ScheduleSettings = {
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
  learningSteps: [1, 10, 60, 1440], // 1min, 10min, 1hr, 1day
  graduatingInterval: 1, // 1 day
  easyIntervalMultiplier: 1.3,
  maximumInterval: 36500, // ~100 years
  reviewOrder: 'due-date',
  newCardIntroductionRate: 20,
};

export const FORECAST_RANGES: ForecastRange[] = [
  { days: 7, label: 'Next 7 days' },
  { days: 14, label: 'Next 2 weeks' },
  { days: 30, label: 'Next month' },
  { days: 60, label: 'Next 2 months' },
  { days: 90, label: 'Next 3 months' },
];

export const RETENTION_INTERVALS = [
  { label: '1 day', days: 1 },
  { label: '3 days', days: 3 },
  { label: '1 week', days: 7 },
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '2 months', days: 60 },
  { label: '3 months', days: 90 },
  { label: '6 months', days: 180 },
  { label: '1 year', days: 365 },
];

// Color intensity levels for heatmap
export const HEATMAP_COLORS = [
  '#ebedf0', // 0 cards - light gray
  '#9be9a8', // 1-5 cards - light green
  '#40c463', // 6-10 cards - medium green
  '#30a14e', // 11-20 cards - dark green
  '#216e39', // 21+ cards - darkest green
];

export const HEATMAP_LEGEND = [
  { label: 'None', min: 0, max: 0, color: HEATMAP_COLORS[0] },
  { label: 'Low', min: 1, max: 5, color: HEATMAP_COLORS[1] },
  { label: 'Medium', min: 6, max: 10, color: HEATMAP_COLORS[2] },
  { label: 'High', min: 11, max: 20, color: HEATMAP_COLORS[3] },
  { label: 'Very High', min: 21, max: Infinity, color: HEATMAP_COLORS[4] },
];

/**
 * Get heatmap intensity level (0-4) based on card count
 */
export function getHeatmapIntensity(count: number): number {
  if (count === 0) return 0;
  if (count <= 5) return 1;
  if (count <= 10) return 2;
  if (count <= 20) return 3;
  return 4;
}

/**
 * Get heatmap color based on count
 */
export function getHeatmapColor(count: number): string {
  const intensity = getHeatmapIntensity(count);
  return HEATMAP_COLORS[intensity];
}
