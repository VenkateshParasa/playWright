import { format, formatDistance, formatRelative } from 'date-fns';
import { enUS, es, fr, de, ja, zhCN, ar, he } from 'date-fns/locale';

/**
 * Backend i18n utilities
 */

export type SupportedLanguage = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'ar' | 'he';

// Date-fns locale mapping
const dateFnsLocales: Record<SupportedLanguage, Locale> = {
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
 * Translation strings storage
 * In production, these would be loaded from JSON files or a database
 */
const translations: Record<SupportedLanguage, Record<string, string>> = {
  en: {
    'welcome': 'Welcome',
    'goodbye': 'Goodbye',
    'error.notFound': 'Not found',
    'error.unauthorized': 'Unauthorized',
    'error.serverError': 'Server error',
    'success.created': 'Created successfully',
    'success.updated': 'Updated successfully',
    'success.deleted': 'Deleted successfully',
  },
  es: {
    'welcome': 'Bienvenido',
    'goodbye': 'Adiós',
    'error.notFound': 'No encontrado',
    'error.unauthorized': 'No autorizado',
    'error.serverError': 'Error del servidor',
    'success.created': 'Creado con éxito',
    'success.updated': 'Actualizado con éxito',
    'success.deleted': 'Eliminado con éxito',
  },
  fr: {
    'welcome': 'Bienvenue',
    'goodbye': 'Au revoir',
    'error.notFound': 'Pas trouvé',
    'error.unauthorized': 'Non autorisé',
    'error.serverError': 'Erreur du serveur',
    'success.created': 'Créé avec succès',
    'success.updated': 'Mis à jour avec succès',
    'success.deleted': 'Supprimé avec succès',
  },
  de: {
    'welcome': 'Willkommen',
    'goodbye': 'Auf Wiedersehen',
    'error.notFound': 'Nicht gefunden',
    'error.unauthorized': 'Nicht autorisiert',
    'error.serverError': 'Serverfehler',
    'success.created': 'Erfolgreich erstellt',
    'success.updated': 'Erfolgreich aktualisiert',
    'success.deleted': 'Erfolgreich gelöscht',
  },
  ja: {
    'welcome': 'ようこそ',
    'goodbye': 'さようなら',
    'error.notFound': '見つかりません',
    'error.unauthorized': '権限がありません',
    'error.serverError': 'サーバーエラー',
    'success.created': '正常に作成されました',
    'success.updated': '正常に更新されました',
    'success.deleted': '正常に削除されました',
  },
  zh: {
    'welcome': '欢迎',
    'goodbye': '再见',
    'error.notFound': '未找到',
    'error.unauthorized': '未授权',
    'error.serverError': '服务器错误',
    'success.created': '创建成功',
    'success.updated': '更新成功',
    'success.deleted': '删除成功',
  },
  ar: {
    'welcome': 'مرحبا',
    'goodbye': 'وداعا',
    'error.notFound': 'غير موجود',
    'error.unauthorized': 'غير مصرح',
    'error.serverError': 'خطأ في الخادم',
    'success.created': 'تم الإنشاء بنجاح',
    'success.updated': 'تم التحديث بنجاح',
    'success.deleted': 'تم الحذف بنجاح',
  },
  he: {
    'welcome': 'ברוך הבא',
    'goodbye': 'להתראות',
    'error.notFound': 'לא נמצא',
    'error.unauthorized': 'לא מורשה',
    'error.serverError': 'שגיאת שרת',
    'success.created': 'נוצר בהצלחה',
    'success.updated': 'עודכן בהצלחה',
    'success.deleted': 'נמחק בהצלחה',
  },
};

/**
 * Translate a key to the given language
 */
export function translate(
  key: string,
  locale: SupportedLanguage = 'en',
  replacements?: Record<string, string | number>
): string {
  let translation = translations[locale]?.[key] || translations.en[key] || key;

  // Replace placeholders like {{name}}
  if (replacements) {
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(
        new RegExp(`{{${placeholder}}}`, 'g'),
        String(value)
      );
    });
  }

  return translation;
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | number,
  formatStr: string,
  locale: SupportedLanguage = 'en'
): string {
  const localeObj = dateFnsLocales[locale] || dateFnsLocales.en;
  return format(date, formatStr, { locale: localeObj });
}

/**
 * Format relative time
 */
export function formatRelativeTime(
  date: Date | number,
  baseDate: Date | number,
  locale: SupportedLanguage = 'en'
): string {
  const localeObj = dateFnsLocales[locale] || dateFnsLocales.en;
  return formatDistance(date, baseDate, { addSuffix: true, locale: localeObj });
}

/**
 * Format relative date
 */
export function formatRelativeDate(
  date: Date | number,
  baseDate: Date | number,
  locale: SupportedLanguage = 'en'
): string {
  const localeObj = dateFnsLocales[locale] || dateFnsLocales.en;
  return formatRelative(date, baseDate, { locale: localeObj });
}

/**
 * Format number according to locale
 */
export function formatNumber(
  value: number,
  locale: SupportedLanguage = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  value: number,
  currency: string,
  locale: SupportedLanguage = 'en',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

/**
 * Create an i18n instance for a specific locale
 */
export class I18n {
  private locale: SupportedLanguage;

  constructor(locale: SupportedLanguage = 'en') {
    this.locale = locale;
  }

  t(key: string, replacements?: Record<string, string | number>): string {
    return translate(key, this.locale, replacements);
  }

  formatDate(date: Date | number, formatStr: string): string {
    return formatDate(date, formatStr, this.locale);
  }

  formatRelativeTime(date: Date | number, baseDate: Date | number): string {
    return formatRelativeTime(date, baseDate, this.locale);
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    return formatNumber(value, this.locale, options);
  }

  formatCurrency(
    value: number,
    currency: string,
    options?: Intl.NumberFormatOptions
  ): string {
    return formatCurrency(value, currency, this.locale, options);
  }

  setLocale(locale: SupportedLanguage): void {
    this.locale = locale;
  }

  getLocale(): SupportedLanguage {
    return this.locale;
  }
}

/**
 * Email template localization
 */
export interface EmailTemplate {
  subject: string;
  body: string;
  htmlBody?: string;
}

const emailTemplates: Record<
  SupportedLanguage,
  Record<string, EmailTemplate>
> = {
  en: {
    welcome: {
      subject: 'Welcome to Playwright & Selenium Learning Platform',
      body: 'Welcome {{name}}! We are excited to have you on board.',
      htmlBody: '<h1>Welcome {{name}}!</h1><p>We are excited to have you on board.</p>',
    },
    passwordReset: {
      subject: 'Password Reset Request',
      body: 'Click the link to reset your password: {{link}}',
      htmlBody: '<p>Click <a href="{{link}}">here</a> to reset your password.</p>',
    },
  },
  es: {
    welcome: {
      subject: 'Bienvenido a la Plataforma de Aprendizaje Playwright & Selenium',
      body: '¡Bienvenido {{name}}! Estamos emocionados de tenerte a bordo.',
      htmlBody: '<h1>¡Bienvenido {{name}}!</h1><p>Estamos emocionados de tenerte a bordo.</p>',
    },
    passwordReset: {
      subject: 'Solicitud de Restablecimiento de Contraseña',
      body: 'Haz clic en el enlace para restablecer tu contraseña: {{link}}',
      htmlBody: '<p>Haz clic <a href="{{link}}">aquí</a> para restablecer tu contraseña.</p>',
    },
  },
  // Add other languages...
  fr: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
  de: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
  ja: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
  zh: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
  ar: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
  he: { welcome: { subject: '', body: '' }, passwordReset: { subject: '', body: '' } },
};

/**
 * Get localized email template
 */
export function getEmailTemplate(
  templateName: string,
  locale: SupportedLanguage = 'en',
  replacements?: Record<string, string>
): EmailTemplate {
  let template =
    emailTemplates[locale]?.[templateName] ||
    emailTemplates.en[templateName];

  if (!template) {
    throw new Error(`Email template '${templateName}' not found`);
  }

  // Replace placeholders
  if (replacements) {
    template = { ...template };
    Object.entries(replacements).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      template.subject = template.subject.replace(regex, value);
      template.body = template.body.replace(regex, value);
      if (template.htmlBody) {
        template.htmlBody = template.htmlBody.replace(regex, value);
      }
    });
  }

  return template;
}

export default I18n;
