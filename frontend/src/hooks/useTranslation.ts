import { useTranslation as useI18nextTranslation, UseTranslationOptions } from 'react-i18next';
import { format as formatDate, formatDistance, formatRelative } from 'date-fns';
import { enUS, es, fr, de, ja, zhCN, ar, he } from 'date-fns/locale';

// Date-fns locale mapping
const dateFnsLocales: Record<string, Locale> = {
  en: enUS,
  es: es,
  fr: fr,
  de: de,
  ja: ja,
  zh: zhCN,
  ar: ar,
  he: he,
};

/**
 * Enhanced translation hook with additional utilities
 */
export const useTranslation = (ns?: string | string[], options?: UseTranslationOptions) => {
  const { t, i18n, ready } = useI18nextTranslation(ns, options);

  /**
   * Format a date according to the current locale
   */
  const formatLocalizedDate = (
    date: Date | number,
    formatStr: string = 'PP'
  ): string => {
    const locale = dateFnsLocales[i18n.language] || dateFnsLocales.en;
    return formatDate(date, formatStr, { locale });
  };

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (
    date: Date | number,
    baseDate: Date | number = new Date()
  ): string => {
    const locale = dateFnsLocales[i18n.language] || dateFnsLocales.en;
    return formatDistance(date, baseDate, { addSuffix: true, locale });
  };

  /**
   * Format relative date (e.g., "yesterday at 3:00 PM")
   */
  const formatRelativeDate = (
    date: Date | number,
    baseDate: Date | number = new Date()
  ): string => {
    const locale = dateFnsLocales[i18n.language] || dateFnsLocales.en;
    return formatRelative(date, baseDate, { locale });
  };

  /**
   * Format numbers according to locale
   */
  const formatNumber = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(i18n.language, options).format(value);
  };

  /**
   * Format currency according to locale
   */
  const formatCurrency = (
    value: number,
    currency: string = 'USD',
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'currency',
      currency,
      ...options,
    }).format(value);
  };

  /**
   * Format percentage
   */
  const formatPercent = (
    value: number,
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'percent',
      ...options,
    }).format(value);
  };

  /**
   * Pluralize based on count
   */
  const pluralize = (
    key: string,
    count: number,
    options?: Record<string, unknown>
  ): string => {
    return t(key, { count, ...options });
  };

  /**
   * Check if current language is RTL
   */
  const isRTL = ['ar', 'he'].includes(i18n.language);

  /**
   * Get text direction
   */
  const direction = isRTL ? 'rtl' : 'ltr';

  /**
   * Format list according to locale
   */
  const formatList = (
    items: string[],
    options?: Intl.ListFormatOptions
  ): string => {
    if (!Intl.ListFormat) {
      return items.join(', ');
    }
    return new Intl.ListFormat(i18n.language, options).format(items);
  };

  /**
   * Format unit according to locale
   */
  const formatUnit = (
    value: number,
    unit: Intl.NumberFormatOptions['unit'],
    options?: Intl.NumberFormatOptions
  ): string => {
    return new Intl.NumberFormat(i18n.language, {
      style: 'unit',
      unit,
      ...options,
    }).format(value);
  };

  /**
   * Get ordinal number (1st, 2nd, 3rd, etc.)
   */
  const getOrdinal = (n: number): string => {
    if (i18n.language !== 'en') {
      return n.toString();
    }

    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  /**
   * Translate with fallback
   */
  const tWithFallback = (
    key: string,
    fallback: string,
    options?: Record<string, unknown>
  ): string => {
    const translation = t(key, options);
    return translation === key ? fallback : translation;
  };

  /**
   * Get nested translation
   */
  const tNested = (
    prefix: string,
    key: string,
    options?: Record<string, unknown>
  ): string => {
    return t(`${prefix}.${key}`, options);
  };

  return {
    t,
    i18n,
    ready,
    formatLocalizedDate,
    formatRelativeTime,
    formatRelativeDate,
    formatNumber,
    formatCurrency,
    formatPercent,
    formatList,
    formatUnit,
    pluralize,
    isRTL,
    direction,
    getOrdinal,
    tWithFallback,
    tNested,
  };
};

/**
 * Hook for namespaced translations
 */
export const useNamespacedTranslation = (namespace: string) => {
  return useTranslation(namespace);
};

/**
 * Hook for common translations
 */
export const useCommonTranslation = () => {
  return useTranslation('common');
};

/**
 * Hook for navigation translations
 */
export const useNavigationTranslation = () => {
  return useTranslation('navigation');
};

/**
 * Hook for auth translations
 */
export const useAuthTranslation = () => {
  return useTranslation('auth');
};

/**
 * Hook for error translations
 */
export const useErrorTranslation = () => {
  return useTranslation('errors');
};

/**
 * Hook for validation translations
 */
export const useValidationTranslation = () => {
  return useTranslation('validation');
};

/**
 * Hook for notification translations
 */
export const useNotificationTranslation = () => {
  return useTranslation('notifications');
};

export default useTranslation;
