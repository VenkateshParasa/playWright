import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { supportedLanguages, rtlLanguages } from '../i18n/config';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'menu' | 'compact';
  showFlag?: boolean;
  showLabel?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'dropdown',
  showFlag = true,
  showLabel = true,
  className = '',
}) => {
  const { i18n, t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLanguageChange = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);

      // Update document direction
      const lang = supportedLanguages.find(l => l.code === languageCode);
      if (lang) {
        document.documentElement.dir = lang.dir;
        document.documentElement.lang = languageCode;
      }

      // Store preference
      localStorage.setItem('i18nextLng', languageCode);

      setIsOpen(false);

      // Dispatch custom event for other components
      window.dispatchEvent(
        new CustomEvent('languageChanged', {
          detail: { language: languageCode },
        })
      );
    } catch (error) {
      console.error('Error changing language:', error);
    }
  };

  // Compact variant (just flag)
  if (variant === 'compact') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Change language"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Globe className="w-5 h-5" />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                  currentLanguage.code === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                dir={lang.dir}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div className="font-medium">{lang.nativeName}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.name}
                    </div>
                  </div>
                </div>
                {currentLanguage.code === lang.code && (
                  <Check className="w-5 h-5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Dropdown variant (full display)
  if (variant === 'dropdown') {
    return (
      <div ref={dropdownRef} className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          aria-label="Select language"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          {showFlag && (
            <span className="text-xl">{currentLanguage.flag}</span>
          )}
          {showLabel && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {currentLanguage.nativeName}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-gray-500 transition-transform ${
              isOpen ? 'transform rotate-180' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50 max-h-96 overflow-y-auto">
            <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {t('common.labels.language')}
            </div>
            {supportedLanguages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between transition-colors ${
                  currentLanguage.code === lang.code
                    ? 'bg-blue-50 dark:bg-blue-900/20'
                    : ''
                }`}
                dir={lang.dir}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div>
                    <div
                      className={`font-medium ${
                        currentLanguage.code === lang.code
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-900 dark:text-gray-100'
                      }`}
                    >
                      {lang.nativeName}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {lang.name}
                    </div>
                  </div>
                </div>
                {currentLanguage.code === lang.code && (
                  <Check className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Menu variant (inline list)
  if (variant === 'menu') {
    return (
      <div className={`space-y-1 ${className}`}>
        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {t('common.labels.language')}
        </div>
        {supportedLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-between transition-colors rounded-lg ${
              currentLanguage.code === lang.code
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            }`}
            dir={lang.dir}
          >
            <div className="flex items-center space-x-3">
              {showFlag && <span className="text-xl">{lang.flag}</span>}
              <span className="text-sm font-medium">{lang.nativeName}</span>
            </div>
            {currentLanguage.code === lang.code && (
              <Check className="w-4 h-4" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return null;
};

// Hook for using language switcher functionality
export const useLanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const currentLanguage = supportedLanguages.find(
    (lang) => lang.code === i18n.language
  ) || supportedLanguages[0];

  const changeLanguage = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    const lang = supportedLanguages.find(l => l.code === languageCode);
    if (lang) {
      document.documentElement.dir = lang.dir;
      document.documentElement.lang = languageCode;
    }
    localStorage.setItem('i18nextLng', languageCode);
  };

  const isRTL = rtlLanguages.includes(i18n.language);

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
    supportedLanguages,
  };
};

export default LanguageSwitcher;
