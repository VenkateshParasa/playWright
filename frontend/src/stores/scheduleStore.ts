/**
 * Schedule Store - Manages calendar, forecast, and retention data
 * Zustand store with persistence and devtools
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { format } from 'date-fns';
import type {
  ScheduleStore,
  CalendarData,
  ForecastData,
  HeatmapData,
  DayBreakdown,
  ScheduleSettings,
  StudyTimeAnalytics,
  ManualRescheduleItem,
  RetentionCurve,
  DEFAULT_SCHEDULE_SETTINGS,
} from '../types/schedule.types';

// API base URL
const API_BASE = '/api/schedule';

// Helper to get auth token
const getAuthToken = () => localStorage.getItem('auth_token');

// Helper to make authenticated requests
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getAuthToken()}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new Error(error.message || 'API request failed');
  }

  return response.json();
}

// Initial state
const initialState = {
  calendarData: {},
  calendarLoading: false,
  calendarError: null,

  forecastData: [],
  forecastRange: 7 as const,
  forecastLoading: false,
  forecastError: null,

  heatmapData: [],
  heatmapYear: new Date().getFullYear(),
  heatmapLoading: false,
  heatmapError: null,

  retentionCurve: null,
  retentionLoading: false,
  retentionError: null,

  selectedDate: null,
  dayBreakdown: null,
  breakdownLoading: false,
  breakdownError: null,

  settings: DEFAULT_SCHEDULE_SETTINGS,
  settingsLoading: false,
  settingsError: null,

  studyTimeAnalytics: null,
  studyTimeLoading: false,
  studyTimeError: null,
};

export const useScheduleStore = create<ScheduleStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // ====================================================================
        // Load Calendar Data
        // ====================================================================
        loadCalendarData: async (startDate: Date, endDate: Date) => {
          set({ calendarLoading: true, calendarError: null }, false, 'schedule/loadCalendar/start');

          try {
            const start = format(startDate, 'yyyy-MM-dd');
            const end = format(endDate, 'yyyy-MM-dd');

            const data = await fetchAPI<{ calendar: CalendarData[] }>(
              `/calendar?start=${start}&end=${end}`
            );

            // Convert array to map for quick lookups
            const calendarMap: Record<string, CalendarData> = {};
            data.calendar.forEach(entry => {
              calendarMap[entry.date] = entry;
            });

            set(
              {
                calendarData: calendarMap,
                calendarLoading: false,
              },
              false,
              'schedule/loadCalendar/success'
            );
          } catch (error) {
            set(
              {
                calendarError: error instanceof Error ? error.message : 'Failed to load calendar',
                calendarLoading: false,
              },
              false,
              'schedule/loadCalendar/error'
            );
          }
        },

        // ====================================================================
        // Load Forecast Data
        // ====================================================================
        loadForecastData: async (days: number) => {
          set({ forecastLoading: true, forecastError: null }, false, 'schedule/loadForecast/start');

          try {
            const data = await fetchAPI<{ forecast: ForecastData[] }>(`/forecast?days=${days}`);

            set(
              {
                forecastData: data.forecast,
                forecastRange: days as any,
                forecastLoading: false,
              },
              false,
              'schedule/loadForecast/success'
            );
          } catch (error) {
            set(
              {
                forecastError: error instanceof Error ? error.message : 'Failed to load forecast',
                forecastLoading: false,
              },
              false,
              'schedule/loadForecast/error'
            );
          }
        },

        // ====================================================================
        // Load Heatmap Data
        // ====================================================================
        loadHeatmapData: async (year: number) => {
          set({ heatmapLoading: true, heatmapError: null }, false, 'schedule/loadHeatmap/start');

          try {
            const data = await fetchAPI<{ heatmap: HeatmapData[] }>(`/heatmap?year=${year}`);

            set(
              {
                heatmapData: data.heatmap,
                heatmapYear: year,
                heatmapLoading: false,
              },
              false,
              'schedule/loadHeatmap/success'
            );
          } catch (error) {
            set(
              {
                heatmapError: error instanceof Error ? error.message : 'Failed to load heatmap',
                heatmapLoading: false,
              },
              false,
              'schedule/loadHeatmap/error'
            );
          }
        },

        // ====================================================================
        // Load Retention Curve
        // ====================================================================
        loadRetentionCurve: async (categoryId?: string) => {
          set({ retentionLoading: true, retentionError: null }, false, 'schedule/loadRetention/start');

          try {
            const query = categoryId ? `?category=${categoryId}` : '';
            const data = await fetchAPI<{ retentionCurve: RetentionCurve }>(`/retention${query}`);

            set(
              {
                retentionCurve: data.retentionCurve,
                retentionLoading: false,
              },
              false,
              'schedule/loadRetention/success'
            );
          } catch (error) {
            set(
              {
                retentionError:
                  error instanceof Error ? error.message : 'Failed to load retention data',
                retentionLoading: false,
              },
              false,
              'schedule/loadRetention/error'
            );
          }
        },

        // ====================================================================
        // Load Day Breakdown
        // ====================================================================
        loadDayBreakdown: async (date: string) => {
          set({ breakdownLoading: true, breakdownError: null }, false, 'schedule/loadBreakdown/start');

          try {
            const data = await fetchAPI<{ breakdown: DayBreakdown }>(`/breakdown/${date}`);

            set(
              {
                dayBreakdown: data.breakdown,
                selectedDate: date,
                breakdownLoading: false,
              },
              false,
              'schedule/loadBreakdown/success'
            );
          } catch (error) {
            set(
              {
                breakdownError: error instanceof Error ? error.message : 'Failed to load breakdown',
                breakdownLoading: false,
              },
              false,
              'schedule/loadBreakdown/error'
            );
          }
        },

        // ====================================================================
        // Load Settings
        // ====================================================================
        loadSettings: async () => {
          set({ settingsLoading: true, settingsError: null }, false, 'schedule/loadSettings/start');

          try {
            const data = await fetchAPI<{ settings: ScheduleSettings }>('/settings');

            set(
              {
                settings: data.settings,
                settingsLoading: false,
              },
              false,
              'schedule/loadSettings/success'
            );
          } catch (error) {
            set(
              {
                settingsError: error instanceof Error ? error.message : 'Failed to load settings',
                settingsLoading: false,
              },
              false,
              'schedule/loadSettings/error'
            );
          }
        },

        // ====================================================================
        // Update Settings
        // ====================================================================
        updateSettings: async (newSettings: Partial<ScheduleSettings>) => {
          set({ settingsLoading: true, settingsError: null }, false, 'schedule/updateSettings/start');

          try {
            const data = await fetchAPI<{ settings: ScheduleSettings }>('/settings', {
              method: 'PUT',
              body: JSON.stringify(newSettings),
            });

            set(
              {
                settings: data.settings,
                settingsLoading: false,
              },
              false,
              'schedule/updateSettings/success'
            );
          } catch (error) {
            set(
              {
                settingsError: error instanceof Error ? error.message : 'Failed to update settings',
                settingsLoading: false,
              },
              false,
              'schedule/updateSettings/error'
            );
          }
        },

        // ====================================================================
        // Load Study Time Analytics
        // ====================================================================
        loadStudyTimeAnalytics: async () => {
          set({ studyTimeLoading: true, studyTimeError: null }, false, 'schedule/loadStudyTime/start');

          try {
            const data = await fetchAPI<{ analytics: StudyTimeAnalytics }>('/study-time');

            set(
              {
                studyTimeAnalytics: data.analytics,
                studyTimeLoading: false,
              },
              false,
              'schedule/loadStudyTime/success'
            );
          } catch (error) {
            set(
              {
                studyTimeError:
                  error instanceof Error ? error.message : 'Failed to load study time analytics',
                studyTimeLoading: false,
              },
              false,
              'schedule/loadStudyTime/error'
            );
          }
        },

        // ====================================================================
        // Reschedule Cards
        // ====================================================================
        rescheduleCards: async (items: ManualRescheduleItem[]) => {
          try {
            await fetchAPI('/reschedule', {
              method: 'POST',
              body: JSON.stringify({ items }),
            });

            // Refresh calendar and forecast data
            const state = get();
            if (Object.keys(state.calendarData).length > 0) {
              const dates = Object.keys(state.calendarData);
              const startDate = new Date(dates[0]);
              const endDate = new Date(dates[dates.length - 1]);
              await get().loadCalendarData(startDate, endDate);
            }

            if (state.forecastData.length > 0) {
              await get().loadForecastData(state.forecastRange);
            }
          } catch (error) {
            throw new Error(
              error instanceof Error ? error.message : 'Failed to reschedule cards'
            );
          }
        },

        // ====================================================================
        // Set Selected Date
        // ====================================================================
        setSelectedDate: (date: string | null) => {
          set({ selectedDate: date }, false, 'schedule/setSelectedDate');

          if (date) {
            get().loadDayBreakdown(date);
          } else {
            set({ dayBreakdown: null }, false, 'schedule/clearBreakdown');
          }
        },

        // ====================================================================
        // Set Forecast Range
        // ====================================================================
        setForecastRange: (days: 7 | 14 | 30 | 60 | 90) => {
          set({ forecastRange: days }, false, 'schedule/setForecastRange');
          get().loadForecastData(days);
        },

        // ====================================================================
        // Set Heatmap Year
        // ====================================================================
        setHeatmapYear: (year: number) => {
          set({ heatmapYear: year }, false, 'schedule/setHeatmapYear');
          get().loadHeatmapData(year);
        },

        // ====================================================================
        // Clear Errors
        // ====================================================================
        clearErrors: () => {
          set(
            {
              calendarError: null,
              forecastError: null,
              heatmapError: null,
              retentionError: null,
              breakdownError: null,
              settingsError: null,
              studyTimeError: null,
            },
            false,
            'schedule/clearErrors'
          );
        },
      }),
      {
        name: 'schedule-storage',
        partialize: state => ({
          settings: state.settings,
          forecastRange: state.forecastRange,
          heatmapYear: state.heatmapYear,
        }),
      }
    ),
    {
      name: 'ScheduleStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors
export const selectCalendarData = (state: ScheduleStore) => state.calendarData;
export const selectForecastData = (state: ScheduleStore) => state.forecastData;
export const selectHeatmapData = (state: ScheduleStore) => state.heatmapData;
export const selectRetentionCurve = (state: ScheduleStore) => state.retentionCurve;
export const selectDayBreakdown = (state: ScheduleStore) => state.dayBreakdown;
export const selectSettings = (state: ScheduleStore) => state.settings;
export const selectStudyTimeAnalytics = (state: ScheduleStore) => state.studyTimeAnalytics;
