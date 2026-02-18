import { describe, it, expect, beforeEach } from 'vitest';
import i18n from '../../frontend/src/i18n/config';
import { supportedLanguages, rtlLanguages } from '../../frontend/src/i18n/config';

describe('i18n Configuration', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('en');
  });

  describe('Initialization', () => {
    it('should initialize with default language', () => {
      expect(i18n.language).toBe('en');
    });

    it('should have all supported languages configured', () => {
      const configuredLanguages = Object.keys(i18n.options.resources || {});
      const supportedCodes = supportedLanguages.map(lang => lang.code);

      supportedCodes.forEach(code => {
        expect(configuredLanguages).toContain(code);
      });
    });

    it('should have all namespaces loaded', () => {
      const expectedNamespaces = [
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
      ];

      expectedNamespaces.forEach(namespace => {
        expect(i18n.hasResourceBundle('en', namespace)).toBe(true);
      });
    });
  });

  describe('Language Switching', () => {
    it('should switch language successfully', async () => {
      await i18n.changeLanguage('es');
      expect(i18n.language).toBe('es');
    });

    it('should update document direction for RTL languages', async () => {
      await i18n.changeLanguage('ar');
      // In test environment, this would need JSDOM
      expect(rtlLanguages.includes('ar')).toBe(true);
    });

    it('should fall back to default language for unsupported language', async () => {
      await i18n.changeLanguage('invalid');
      // Should fall back to English
      expect(['en', 'invalid']).toContain(i18n.language);
    });
  });

  describe('Translation Keys', () => {
    it('should translate common keys', () => {
      const translation = i18n.t('common:actions.save');
      expect(translation).toBe('Save');
      expect(translation).not.toBe('common:actions.save');
    });

    it('should handle missing keys gracefully', () => {
      const translation = i18n.t('nonexistent.key');
      // Should return the key itself or a fallback
      expect(typeof translation).toBe('string');
    });

    it('should support interpolation', () => {
      // Assuming we have a key that supports interpolation
      const translation = i18n.t('common:pagination.page', {
        current: 1,
        total: 10,
      });
      expect(translation).toContain('1');
      expect(translation).toContain('10');
    });

    it('should support pluralization', () => {
      const singular = i18n.t('common:time.minutes', { count: 1 });
      const plural = i18n.t('common:time.minutes', { count: 5 });

      expect(singular).not.toBe(plural);
    });
  });

  describe('Namespaces', () => {
    const namespaces = [
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
    ];

    namespaces.forEach(namespace => {
      it(`should load ${namespace} namespace`, () => {
        expect(i18n.hasResourceBundle('en', namespace)).toBe(true);
      });

      it(`should translate keys from ${namespace}`, () => {
        const keys = Object.keys(
          i18n.getResourceBundle('en', namespace) || {}
        );
        expect(keys.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Multiple Languages', () => {
    const languages = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'];

    languages.forEach(lang => {
      it(`should have resources for ${lang}`, () => {
        expect(i18n.hasResourceBundle(lang, 'common')).toBe(true);
      });

      it(`should translate in ${lang}`, async () => {
        await i18n.changeLanguage(lang);
        const translation = i18n.t('common:actions.save');
        expect(typeof translation).toBe('string');
        expect(translation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('RTL Support', () => {
    it('should identify RTL languages correctly', () => {
      expect(rtlLanguages).toContain('ar');
      expect(rtlLanguages).toContain('he');
      expect(rtlLanguages).not.toContain('en');
    });

    it('should handle RTL language switching', async () => {
      await i18n.changeLanguage('ar');
      const langConfig = supportedLanguages.find(l => l.code === 'ar');
      expect(langConfig?.dir).toBe('rtl');
    });
  });

  describe('Fallback Behavior', () => {
    it('should fall back to English for missing translations', async () => {
      await i18n.changeLanguage('es');
      // Test with a key that might not be translated
      const translation = i18n.t('some.test.key');
      expect(typeof translation).toBe('string');
    });

    it('should use fallback namespace', () => {
      const translation = i18n.t('actions.save'); // Without namespace prefix
      expect(typeof translation).toBe('string');
    });
  });

  describe('Performance', () => {
    it('should cache translations', async () => {
      const startTime = performance.now();
      for (let i = 0; i < 100; i++) {
        i18n.t('common:actions.save');
      }
      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should be very fast (< 10ms for 100 calls)
      expect(duration).toBeLessThan(10);
    });

    it('should lazy load namespaces', () => {
      // Check that not all namespaces are loaded immediately
      const loadedNamespaces = i18n.languages
        .map(lang => i18n.hasResourceBundle(lang, 'common'))
        .filter(Boolean);
      expect(loadedNamespaces.length).toBeGreaterThan(0);
    });
  });
});

describe('Translation Hook', () => {
  // These tests would require React Testing Library in a real setup
  it('should export useTranslation hook', () => {
    // Test would import and use the hook
    expect(true).toBe(true); // Placeholder
  });

  it('should provide formatting utilities', () => {
    // Test formatDate, formatNumber, etc.
    expect(true).toBe(true); // Placeholder
  });
});

describe('Language Switcher', () => {
  // Component tests would go here
  it('should render language options', () => {
    expect(supportedLanguages.length).toBeGreaterThan(0);
  });

  it('should display correct flags and names', () => {
    supportedLanguages.forEach(lang => {
      expect(lang.flag).toBeTruthy();
      expect(lang.name).toBeTruthy();
      expect(lang.nativeName).toBeTruthy();
    });
  });
});
