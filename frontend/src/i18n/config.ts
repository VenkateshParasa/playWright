import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

// Import translation files
import enCommon from '../locales/en/common.json';
import enNavigation from '../locales/en/navigation.json';
import enAuth from '../locales/en/auth.json';
import enLessons from '../locales/en/lessons.json';
import enFlashcards from '../locales/en/flashcards.json';
import enQuizzes from '../locales/en/quizzes.json';
import enExercises from '../locales/en/exercises.json';
import enErrors from '../locales/en/errors.json';
import enValidation from '../locales/en/validation.json';
import enNotifications from '../locales/en/notifications.json';

import esCommon from '../locales/es/common.json';
import esNavigation from '../locales/es/navigation.json';
import esAuth from '../locales/es/auth.json';
import esLessons from '../locales/es/lessons.json';
import esFlashcards from '../locales/es/flashcards.json';
import esQuizzes from '../locales/es/quizzes.json';
import esExercises from '../locales/es/exercises.json';
import esErrors from '../locales/es/errors.json';
import esValidation from '../locales/es/validation.json';
import esNotifications from '../locales/es/notifications.json';

import frCommon from '../locales/fr/common.json';
import frNavigation from '../locales/fr/navigation.json';
import frAuth from '../locales/fr/auth.json';
import frLessons from '../locales/fr/lessons.json';
import frFlashcards from '../locales/fr/flashcards.json';
import frQuizzes from '../locales/fr/quizzes.json';
import frExercises from '../locales/fr/exercises.json';
import frErrors from '../locales/fr/errors.json';
import frValidation from '../locales/fr/validation.json';
import frNotifications from '../locales/fr/notifications.json';

import deCommon from '../locales/de/common.json';
import deNavigation from '../locales/de/navigation.json';
import deAuth from '../locales/de/auth.json';
import deLessons from '../locales/de/lessons.json';
import deFlashcards from '../locales/de/flashcards.json';
import deQuizzes from '../locales/de/quizzes.json';
import deExercises from '../locales/de/exercises.json';
import deErrors from '../locales/de/errors.json';
import deValidation from '../locales/de/validation.json';
import deNotifications from '../locales/de/notifications.json';

import jaCommon from '../locales/ja/common.json';
import jaNavigation from '../locales/ja/navigation.json';
import jaAuth from '../locales/ja/auth.json';
import jaLessons from '../locales/ja/lessons.json';
import jaFlashcards from '../locales/ja/flashcards.json';
import jaQuizzes from '../locales/ja/quizzes.json';
import jaExercises from '../locales/ja/exercises.json';
import jaErrors from '../locales/ja/errors.json';
import jaValidation from '../locales/ja/validation.json';
import jaNotifications from '../locales/ja/notifications.json';

import zhCommon from '../locales/zh/common.json';
import zhNavigation from '../locales/zh/navigation.json';
import zhAuth from '../locales/zh/auth.json';
import zhLessons from '../locales/zh/lessons.json';
import zhFlashcards from '../locales/zh/flashcards.json';
import zhQuizzes from '../locales/zh/quizzes.json';
import zhExercises from '../locales/zh/exercises.json';
import zhErrors from '../locales/zh/errors.json';
import zhValidation from '../locales/zh/validation.json';
import zhNotifications from '../locales/zh/notifications.json';

import arCommon from '../locales/ar/common.json';
import arNavigation from '../locales/ar/navigation.json';
import arAuth from '../locales/ar/auth.json';
import arLessons from '../locales/ar/lessons.json';
import arFlashcards from '../locales/ar/flashcards.json';
import arQuizzes from '../locales/ar/quizzes.json';
import arExercises from '../locales/ar/exercises.json';
import arErrors from '../locales/ar/errors.json';
import arValidation from '../locales/ar/validation.json';
import arNotifications from '../locales/ar/notifications.json';

import heCommon from '../locales/he/common.json';
import heNavigation from '../locales/he/navigation.json';
import heAuth from '../locales/he/auth.json';
import heLessons from '../locales/he/lessons.json';
import heFlashcards from '../locales/he/flashcards.json';
import heQuizzes from '../locales/he/quizzes.json';
import heExercises from '../locales/he/exercises.json';
import heErrors from '../locales/he/errors.json';
import heValidation from '../locales/he/validation.json';
import heNotifications from '../locales/he/notifications.json';

export const resources = {
  en: {
    common: enCommon,
    navigation: enNavigation,
    auth: enAuth,
    lessons: enLessons,
    flashcards: enFlashcards,
    quizzes: enQuizzes,
    exercises: enExercises,
    errors: enErrors,
    validation: enValidation,
    notifications: enNotifications,
  },
  es: {
    common: esCommon,
    navigation: esNavigation,
    auth: esAuth,
    lessons: esLessons,
    flashcards: esFlashcards,
    quizzes: esQuizzes,
    exercises: esExercises,
    errors: esErrors,
    validation: esValidation,
    notifications: esNotifications,
  },
  fr: {
    common: frCommon,
    navigation: frNavigation,
    auth: frAuth,
    lessons: frLessons,
    flashcards: frFlashcards,
    quizzes: frQuizzes,
    exercises: frExercises,
    errors: frErrors,
    validation: frValidation,
    notifications: frNotifications,
  },
  de: {
    common: deCommon,
    navigation: deNavigation,
    auth: deAuth,
    lessons: deLessons,
    flashcards: deFlashcards,
    quizzes: deQuizzes,
    exercises: deExercises,
    errors: deErrors,
    validation: deValidation,
    notifications: deNotifications,
  },
  ja: {
    common: jaCommon,
    navigation: jaNavigation,
    auth: jaAuth,
    lessons: jaLessons,
    flashcards: jaFlashcards,
    quizzes: jaQuizzes,
    exercises: jaExercises,
    errors: jaErrors,
    validation: jaValidation,
    notifications: jaNotifications,
  },
  zh: {
    common: zhCommon,
    navigation: zhNavigation,
    auth: zhAuth,
    lessons: zhLessons,
    flashcards: zhFlashcards,
    quizzes: zhQuizzes,
    exercises: zhExercises,
    errors: zhErrors,
    validation: zhValidation,
    notifications: zhNotifications,
  },
  ar: {
    common: arCommon,
    navigation: arNavigation,
    auth: arAuth,
    lessons: arLessons,
    flashcards: arFlashcards,
    quizzes: arQuizzes,
    exercises: arExercises,
    errors: arErrors,
    validation: arValidation,
    notifications: arNotifications,
  },
  he: {
    common: heCommon,
    navigation: heNavigation,
    auth: heAuth,
    lessons: heLessons,
    flashcards: heFlashcards,
    quizzes: heQuizzes,
    exercises: heExercises,
    errors: heErrors,
    validation: heValidation,
    notifications: heNotifications,
  },
} as const;

// Language configuration
export const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', dir: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', dir: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', dir: 'ltr' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', dir: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', dir: 'rtl' },
] as const;

export const defaultLanguage = 'en';

export const namespaces = [
  'common',
  'navigation',
  'auth',
  'lessons',
  'flashcards',
  'quizzes',
  'exercises',
  'errors',
  'validation',
  'notifications',
] as const;

// RTL languages
export const rtlLanguages = ['ar', 'he'];

// Language detection order
const detectionOptions = {
  order: ['localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
  lookupLocalStorage: 'i18nextLng',
  caches: ['localStorage'],
  excludeCacheFor: ['cimode'],
};

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: defaultLanguage,
    defaultNS: 'common',
    ns: namespaces,

    debug: import.meta.env.DEV,

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: detectionOptions,

    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },

    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },

    // Performance optimizations
    load: 'languageOnly', // 'en' instead of 'en-US'
    preload: [defaultLanguage],

    // Missing key handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`Missing translation key: ${lng} > ${ns} > ${key}`);
      }
    },

    // Formatting
    returnEmptyString: false,
    returnNull: false,
    returnObjects: false,
  });

// Update document direction when language changes
i18n.on('languageChanged', (lng) => {
  const direction = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = lng;
});

export default i18n;
