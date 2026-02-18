import { Request, Response, NextFunction } from 'express';

/**
 * Supported languages configuration
 */
export const supportedLanguages = [
  'en',
  'es',
  'fr',
  'de',
  'ja',
  'zh',
  'ar',
  'he',
] as const;

export type SupportedLanguage = typeof supportedLanguages[number];

export const defaultLanguage: SupportedLanguage = 'en';

/**
 * Extend Express Request to include locale
 */
declare global {
  namespace Express {
    interface Request {
      locale: SupportedLanguage;
      acceptsLanguages: (languages: string[]) => string | false;
    }
  }
}

/**
 * Parse Accept-Language header
 */
function parseAcceptLanguage(header: string): string[] {
  if (!header) return [];

  return header
    .split(',')
    .map((lang) => {
      const [locale, quality] = lang.trim().split(';');
      const q = quality ? parseFloat(quality.split('=')[1]) : 1.0;
      return { locale: locale.split('-')[0], quality: q };
    })
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.locale);
}

/**
 * Detect language from various sources
 */
function detectLanguage(req: Request): SupportedLanguage {
  // 1. Check query parameter (e.g., ?lang=es)
  const queryLang = req.query.lang as string;
  if (queryLang && supportedLanguages.includes(queryLang as SupportedLanguage)) {
    return queryLang as SupportedLanguage;
  }

  // 2. Check custom header (e.g., X-Language: es)
  const headerLang = req.get('X-Language');
  if (headerLang && supportedLanguages.includes(headerLang as SupportedLanguage)) {
    return headerLang as SupportedLanguage;
  }

  // 3. Check Accept-Language header
  const acceptLanguage = req.get('Accept-Language');
  if (acceptLanguage) {
    const preferredLanguages = parseAcceptLanguage(acceptLanguage);
    for (const lang of preferredLanguages) {
      if (supportedLanguages.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
      }
    }
  }

  // 4. Check user preferences from session/token
  if (req.user && (req.user as any).preferredLanguage) {
    const userLang = (req.user as any).preferredLanguage;
    if (supportedLanguages.includes(userLang as SupportedLanguage)) {
      return userLang as SupportedLanguage;
    }
  }

  // 5. Default to English
  return defaultLanguage;
}

/**
 * Locale middleware
 * Detects and sets the user's preferred language
 */
export const localeMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Detect language
    const locale = detectLanguage(req);
    req.locale = locale;

    // Add Content-Language header to response
    res.setHeader('Content-Language', locale);

    // Add Vary header for caching
    const varyHeader = res.getHeader('Vary');
    if (varyHeader) {
      res.setHeader('Vary', `${varyHeader}, Accept-Language`);
    } else {
      res.setHeader('Vary', 'Accept-Language');
    }

    // Helper method to check accepted languages
    req.acceptsLanguages = (languages: string[]): string | false => {
      const acceptLanguage = req.get('Accept-Language');
      if (!acceptLanguage) return false;

      const preferredLanguages = parseAcceptLanguage(acceptLanguage);
      for (const lang of preferredLanguages) {
        if (languages.includes(lang)) {
          return lang;
        }
      }
      return false;
    };

    next();
  } catch (error) {
    console.error('Error in locale middleware:', error);
    req.locale = defaultLanguage;
    next();
  }
};

/**
 * Get localized content helper
 */
export const getLocalizedContent = <T extends Record<string, any>>(
  content: Record<string, T>,
  locale: SupportedLanguage,
  fallbackLocale: SupportedLanguage = defaultLanguage
): T => {
  return content[locale] || content[fallbackLocale] || content[defaultLanguage];
};

/**
 * Middleware to validate locale parameter
 */
export const validateLocaleParam = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const locale = req.params.locale || req.query.locale;

  if (locale && !supportedLanguages.includes(locale as SupportedLanguage)) {
    res.status(400).json({
      error: 'Invalid locale',
      message: `Locale '${locale}' is not supported`,
      supportedLanguages,
    });
    return;
  }

  next();
};

/**
 * Format error message according to locale
 */
export const formatErrorMessage = (
  error: Error | string,
  locale: SupportedLanguage
): string => {
  const message = typeof error === 'string' ? error : error.message;

  // In a real implementation, this would fetch from translation files
  // For now, return the English message with a note about locale
  return message;
};

export default localeMiddleware;
