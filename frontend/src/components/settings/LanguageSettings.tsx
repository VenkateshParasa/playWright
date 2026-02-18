/**
 * LanguageSettings Component
 * Manages language preferences for i18n support
 */

import { useSettingsStore } from '../../stores/settingsStore';
import type { Language } from '../../types/store';

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  available: boolean;
}

export default function LanguageSettings() {
  const { language, updateLanguage } = useSettingsStore();

  const languages: LanguageOption[] = [
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', available: true },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', available: false },
    { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', available: false },
    { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', available: false },
  ];

  const handleLanguageChange = (newLanguage: Language) => {
    const selectedLanguage = languages.find((lang) => lang.code === newLanguage);
    if (selectedLanguage && !selectedLanguage.available) {
      return; // Don't allow selection of unavailable languages
    }
    updateLanguage(newLanguage);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Language Preferences
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Choose your preferred language for the interface
        </p>
      </div>

      {/* Language Selection */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={!lang.available}
              className={`relative p-6 border-2 rounded-lg transition-all ${
                language === lang.code
                  ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                  : lang.available
                  ? 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  : 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-4xl">{lang.flag}</div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 dark:text-gray-100">{lang.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{lang.nativeName}</p>
                  {!lang.available && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      Coming Soon
                    </span>
                  )}
                </div>
              </div>
              {language === lang.code && (
                <div className="absolute top-3 right-3">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Current Language Info */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start space-x-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
              About Language Support
            </p>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Currently, only English is fully supported. Additional languages are being translated
              and will be available soon. Content and lessons are primarily in English.
            </p>
          </div>
        </div>
      </div>

      {/* Help with Translation */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
        <div className="p-6 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Help Translate
              </h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Are you fluent in another language? Help us translate the platform to make it
                accessible to more learners worldwide.
              </p>
              <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
                Become a Translator
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Regional Settings */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
        <div>
          <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            Regional Settings
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Additional regional preferences (coming soon)
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Time Zone
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Automatically detected from your browser
                </p>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Intl.DateTimeFormat().resolvedOptions().timeZone}
              </span>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Date Format
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Based on language setting
                </p>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
