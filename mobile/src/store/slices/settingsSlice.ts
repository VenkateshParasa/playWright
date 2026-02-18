import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SettingsState, Settings } from '../../types';
import { storage } from '../../utils';
import { STORAGE_KEYS } from '../../constants';

const initialState: SettingsState = {
  notifications: {
    enabled: true,
    dailyReminder: true,
    reminderTime: '09:00',
    achievementAlerts: true,
    lessonUpdates: true,
  },
  appearance: {
    theme: 'system',
    fontSize: 'medium',
  },
  study: {
    dailyGoal: 30,
    autoPlayVideos: true,
    showHints: true,
  },
  privacy: {
    shareProgress: true,
    showProfile: true,
  },
  security: {
    biometricEnabled: false,
    requirePinOnLaunch: false,
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<Settings>) => {
      return action.payload;
    },
    updateNotificationSettings: (
      state,
      action: PayloadAction<Partial<Settings['notifications']>>
    ) => {
      state.notifications = { ...state.notifications, ...action.payload };
      storage.set(STORAGE_KEYS.SETTINGS, state);
    },
    updateAppearanceSettings: (
      state,
      action: PayloadAction<Partial<Settings['appearance']>>
    ) => {
      state.appearance = { ...state.appearance, ...action.payload };
      storage.set(STORAGE_KEYS.SETTINGS, state);
    },
    updateStudySettings: (state, action: PayloadAction<Partial<Settings['study']>>) => {
      state.study = { ...state.study, ...action.payload };
      storage.set(STORAGE_KEYS.SETTINGS, state);
    },
    updatePrivacySettings: (state, action: PayloadAction<Partial<Settings['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload };
      storage.set(STORAGE_KEYS.SETTINGS, state);
    },
    updateSecuritySettings: (
      state,
      action: PayloadAction<Partial<Settings['security']>>
    ) => {
      state.security = { ...state.security, ...action.payload };
      storage.set(STORAGE_KEYS.SETTINGS, state);
    },
    resetSettings: () => {
      storage.set(STORAGE_KEYS.SETTINGS, initialState);
      return initialState;
    },
  },
});

export const {
  setSettings,
  updateNotificationSettings,
  updateAppearanceSettings,
  updateStudySettings,
  updatePrivacySettings,
  updateSecuritySettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
