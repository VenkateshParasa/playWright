# Localization Implementation - Technical Documentation

Complete technical documentation for the internationalization and localization infrastructure.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Implementation Details](#implementation-details)
- [File Structure](#file-structure)
- [Component Reference](#component-reference)
- [API Reference](#api-reference)
- [Backend Integration](#backend-integration)
- [Performance Optimization](#performance-optimization)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Language    │  │  Translation │  │    RTL       │      │
│  │  Detector    │→ │    Engine    │→ │   Handler    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                  ↓                  ↓             │
│  ┌──────────────────────────────────────────────────┐      │
│  │         i18next Core + React Bindings            │      │
│  └──────────────────────────────────────────────────┘      │
│         ↓                                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │        Translation Resources (JSON files)         │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                         Backend                              │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Locale    │→ │   i18n Utils │→ │    Email     │      │
│  │  Middleware  │  │   (date/num) │  │  Templates   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Key Technologies

- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **i18next-browser-languagedetector**: Automatic language detection
- **date-fns**: Locale-aware date formatting
- **Intl API**: Native browser internationalization

### Data Flow

1. **Initial Load**
   - Language detector checks: localStorage → browser → default
   - Load base namespace (common)
   - Lazy load other namespaces as needed

2. **Language Change**
   - User selects new language
   - Update i18next instance
   - Update document direction (LTR/RTL)
   - Reload active namespaces
   - Save preference to localStorage

3. **Translation Rendering**
   - Component requests translation
   - i18next looks up key in active namespace
   - Apply interpolation and pluralization
   - Return translated string
   - React re-renders component

## Implementation Details

### Frontend Structure

#### i18n Configuration (`/frontend/src/i18n/config.ts`)

```typescript
// Core configuration
i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: namespaces,
    debug: import.meta.env.DEV,
    interpolation: { escapeValue: false },
    detection: detectionOptions,
    react: { useSuspense: true },
  });
```

**Key Configuration Options:**

- `fallbackLng`: Language to use if requested translation unavailable
- `defaultNS`: Default namespace if not specified
- `ns`: Array of available namespaces
- `debug`: Enable console logging in development
- `interpolation.escapeValue`: React already escapes by default
- `react.useSuspense`: Use React Suspense for async loading

#### Language Detection Order

1. **localStorage** - Persisted user preference
2. **navigator** - Browser language setting
3. **htmlTag** - HTML lang attribute
4. **path** - URL path (e.g., /es/lessons)
5. **subdomain** - Subdomain (e.g., es.example.com)

#### Namespace Organization

**Lazy Loading:**
```typescript
// Initial load: only 'common' namespace
// On-demand: load namespace when first used

function LessonPage() {
  const { t } = useTranslation('lessons'); // Loads 'lessons' namespace
  return <div>{t('list.title')}</div>;
}
```

**Namespace Preloading:**
```typescript
// Preload namespaces for faster access
i18n.loadNamespaces(['lessons', 'quizzes']);
```

### Translation File Format

#### Structure

```json
{
  "section": {
    "subsection": {
      "key": "value"
    },
    "simpleKey": "simple value",
    "withVariable": "Hello, {{name}}!",
    "count": "{{count}} item",
    "count_plural": "{{count}} items"
  }
}
```

#### Best Practices

1. **Nested Structure**: Group related translations
2. **Consistent Naming**: Use camelCase for keys
3. **Shallow Nesting**: Max 3-4 levels deep
4. **No HTML**: Keep HTML out of translations
5. **Placeholders**: Use descriptive names

### RTL Implementation

#### Automatic Direction Setting

```typescript
i18n.on('languageChanged', (lng) => {
  const direction = rtlLanguages.includes(lng) ? 'rtl' : 'ltr';
  document.documentElement.dir = direction;
  document.documentElement.lang = lng;
});
```

#### CSS Strategy

**Logical Properties (Preferred):**
```css
.element {
  margin-inline-start: 1rem;  /* Left in LTR, Right in RTL */
  padding-inline-end: 2rem;   /* Right in LTR, Left in RTL */
}
```

**Attribute Selectors:**
```css
[dir="rtl"] .element {
  margin-left: 0;
  margin-right: 1rem;
}
```

#### Component Considerations

```typescript
function RTLAwareComponent() {
  const { isRTL, direction } = useTranslation();

  return (
    <div dir={direction}>
      {/* LTR content in RTL context */}
      <code dir="ltr">{codeExample}</code>

      {/* Flipped icons */}
      <ChevronRight className={isRTL ? 'rtl-flip' : ''} />
    </div>
  );
}
```

## Component Reference

### LanguageSwitcher Component

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'dropdown' \| 'menu' \| 'compact' | 'dropdown' | Display variant |
| showFlag | boolean | true | Show language flag |
| showLabel | boolean | true | Show language name |
| className | string | '' | Additional CSS classes |

**Variants:**

1. **Dropdown**: Full-featured dropdown with flags and names
2. **Menu**: Inline list for settings pages
3. **Compact**: Icon-only for header/navbar

**Usage:**

```tsx
// Full dropdown
<LanguageSwitcher />

// Compact icon
<LanguageSwitcher variant="compact" showLabel={false} />

// Settings menu
<LanguageSwitcher variant="menu" />
```

### useTranslation Hook

**Basic Usage:**

```typescript
const { t, i18n, ready } = useTranslation('namespace');
```

**Enhanced Features:**

```typescript
const {
  t,                        // Translation function
  i18n,                     // i18next instance
  ready,                    // Loading state
  formatLocalizedDate,      // Date formatting
  formatRelativeTime,       // "2 hours ago"
  formatRelativeDate,       // "yesterday at 3:00 PM"
  formatNumber,             // Locale-aware numbers
  formatCurrency,           // Currency formatting
  formatPercent,            // Percentage formatting
  formatList,               // List formatting
  formatUnit,               // Unit formatting
  pluralize,                // Pluralization helper
  isRTL,                    // Is current language RTL
  direction,                // 'ltr' or 'rtl'
  getOrdinal,               // 1st, 2nd, 3rd
  tWithFallback,            // Translation with custom fallback
  tNested,                  // Nested translation helper
} = useTranslation();
```

**Examples:**

```typescript
// Date formatting
formatLocalizedDate(new Date(), 'PPP')
// English: "February 17, 2024"
// Spanish: "17 de febrero de 2024"

// Relative time
formatRelativeTime(pastDate)
// English: "2 hours ago"
// Spanish: "hace 2 horas"

// Number formatting
formatNumber(1234567.89)
// English: "1,234,567.89"
// German: "1.234.567,89"

// Currency
formatCurrency(99.99, 'USD')
// English: "$99.99"
// German: "99,99 $"

// List formatting
formatList(['apples', 'oranges', 'bananas'])
// English: "apples, oranges, and bananas"
// Spanish: "apples, oranges y bananas"
```

## API Reference

### Frontend API

#### i18n.changeLanguage(lng: string)

Change the active language.

```typescript
await i18n.changeLanguage('es');
```

#### i18n.getResourceBundle(lng: string, ns: string)

Get all translations for a namespace.

```typescript
const translations = i18n.getResourceBundle('en', 'common');
```

#### i18n.addResourceBundle(lng: string, ns: string, resources: object)

Add translations dynamically.

```typescript
i18n.addResourceBundle('en', 'custom', {
  key: 'value'
});
```

#### i18n.hasResourceBundle(lng: string, ns: string)

Check if namespace is loaded.

```typescript
if (i18n.hasResourceBundle('es', 'lessons')) {
  // Namespace is available
}
```

### Backend API

#### Middleware

```typescript
import { localeMiddleware } from './middleware/locale';

app.use(localeMiddleware);

// In routes
app.get('/api/data', (req, res) => {
  const locale = req.locale; // Detected language
  // ...
});
```

#### i18n Utility Class

```typescript
import { I18n } from './utils/i18n';

const i18n = new I18n('es');

// Translate
i18n.t('welcome', { name: 'User' });

// Format date
i18n.formatDate(new Date(), 'PPP');

// Format number
i18n.formatNumber(1234.56);

// Format currency
i18n.formatCurrency(99.99, 'EUR');

// Change locale
i18n.setLocale('fr');
```

#### Email Templates

```typescript
import { getEmailTemplate } from './utils/i18n';

const template = getEmailTemplate('welcome', 'es', {
  name: user.name,
  link: activationLink
});

await sendEmail({
  to: user.email,
  subject: template.subject,
  html: template.htmlBody
});
```

## Backend Integration

### Locale Detection

The locale middleware detects language from:

1. Query parameter: `?lang=es`
2. Custom header: `X-Language: es`
3. Accept-Language header
4. User preferences (from auth session)
5. Default: English

### API Response Localization

```typescript
app.get('/api/messages', localeMiddleware, (req, res) => {
  const messages = {
    en: { welcome: 'Welcome' },
    es: { welcome: 'Bienvenido' }
  };

  res.json({
    message: messages[req.locale].welcome
  });
});
```

### Database Content Localization

**Schema Design:**

```typescript
// Option 1: Separate fields
interface Lesson {
  id: string;
  title_en: string;
  title_es: string;
  title_fr: string;
  content_en: string;
  content_es: string;
  content_fr: string;
}

// Option 2: JSON field
interface Lesson {
  id: string;
  title: {
    en: string;
    es: string;
    fr: string;
  };
  content: {
    en: string;
    es: string;
    fr: string;
  };
}

// Option 3: Separate table
interface Lesson {
  id: string;
  translations: LessonTranslation[];
}

interface LessonTranslation {
  lessonId: string;
  locale: string;
  title: string;
  content: string;
}
```

**Query Helper:**

```typescript
function getLocalizedContent<T>(
  content: Record<string, T>,
  locale: string
): T {
  return content[locale] || content['en'] || content[Object.keys(content)[0]];
}
```

## Performance Optimization

### 1. Lazy Loading

```typescript
// Load namespaces on-demand
const { t } = useTranslation('lessons'); // Loads only when needed
```

### 2. Code Splitting

```typescript
// Dynamic imports for large translation files
const loadTranslations = async (lng: string) => {
  const translations = await import(`./locales/${lng}/common.json`);
  i18n.addResourceBundle(lng, 'common', translations.default);
};
```

### 3. Caching

```typescript
// Browser caching for translation files
// In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.json')) {
            return 'locales/[name]-[hash][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        }
      }
    }
  }
});
```

### 4. Preloading Critical Namespaces

```typescript
// In main.tsx
i18n.loadNamespaces(['common', 'navigation']).then(() => {
  ReactDOM.render(<App />, document.getElementById('root'));
});
```

### 5. Memoization

```typescript
import { useMemo } from 'react';

function TranslatedList({ items }: { items: string[] }) {
  const { t } = useTranslation();

  const translatedItems = useMemo(
    () => items.map(item => t(`items.${item}`)),
    [items, t]
  );

  return <ul>{translatedItems.map(item => <li>{item}</li>)}</ul>;
}
```

## Testing Strategy

### Unit Tests

```typescript
describe('useTranslation hook', () => {
  it('should translate keys correctly', () => {
    const { result } = renderHook(() => useTranslation('common'));
    expect(result.current.t('actions.save')).toBe('Save');
  });

  it('should handle missing keys', () => {
    const { result } = renderHook(() => useTranslation('common'));
    const translation = result.current.t('nonexistent.key');
    expect(typeof translation).toBe('string');
  });
});
```

### Component Tests

```typescript
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n/config';

describe('LanguageSwitcher', () => {
  it('should display all supported languages', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright)

```typescript
import { test, expect } from '@playwright/test';

test('language switching', async ({ page }) => {
  await page.goto('/');

  // Open language switcher
  await page.click('[aria-label="Change language"]');

  // Select Spanish
  await page.click('text=Español');

  // Verify UI is in Spanish
  await expect(page.locator('h1')).toContainText('Bienvenido');
});

test('RTL layout for Arabic', async ({ page }) => {
  await page.goto('/');

  // Switch to Arabic
  await page.click('[aria-label="Change language"]');
  await page.click('text=العربية');

  // Verify RTL direction
  const html = page.locator('html');
  await expect(html).toHaveAttribute('dir', 'rtl');
});
```

### Translation Validation Tests

```typescript
describe('Translation Files', () => {
  it('should have all required keys in all languages', () => {
    const baseKeys = getAllKeys(enTranslations);
    const languages = ['es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'];

    languages.forEach(lang => {
      const langKeys = getAllKeys(loadTranslation(lang));
      expect(langKeys).toEqual(expect.arrayContaining(baseKeys));
    });
  });

  it('should have consistent placeholders', () => {
    const checkPlaceholders = (enValue, translatedValue) => {
      const enPlaceholders = extractPlaceholders(enValue);
      const translatedPlaceholders = extractPlaceholders(translatedValue);
      expect(translatedPlaceholders.sort()).toEqual(enPlaceholders.sort());
    };

    // Test all keys
    // ...
  });
});
```

## Deployment

### Build Configuration

```json
{
  "scripts": {
    "build": "npm run i18n:check && vite build",
    "i18n:check": "node scripts/check-translations.js"
  }
}
```

### Environment Variables

```env
# .env
VITE_DEFAULT_LANGUAGE=en
VITE_SUPPORTED_LANGUAGES=en,es,fr,de,ja,zh,ar,he
VITE_I18N_DEBUG=false
```

### CDN Strategy

For large-scale deployments:

```typescript
// Load translations from CDN
i18n.use(Backend).init({
  backend: {
    loadPath: 'https://cdn.example.com/locales/{{lng}}/{{ns}}.json',
    crossDomain: true
  }
});
```

### Static File Serving

```nginx
# nginx.conf
location /locales/ {
  add_header Cache-Control "public, max-age=31536000, immutable";
  add_header Access-Control-Allow-Origin "*";
}
```

## Troubleshooting

### Common Issues

**1. Translations not loading**

Check:
- File path is correct
- File is valid JSON
- Namespace is registered in config
- Network requests succeed (dev tools)

```typescript
// Debug
i18n.init({ debug: true });
```

**2. Keys returning as-is**

Reasons:
- Key path is incorrect
- Namespace not loaded
- Language fallback not working

```typescript
// Check if namespace is loaded
if (!i18n.hasResourceBundle('es', 'lessons')) {
  await i18n.loadNamespaces('lessons');
}
```

**3. RTL layout broken**

Verify:
- Document direction is set
- RTL styles are imported
- Logical properties are used

```typescript
// Force direction
document.documentElement.dir = 'rtl';
```

**4. Placeholders not replaced**

Ensure:
- Placeholder syntax is correct: `{{var}}`
- Variables are passed to t() function

```typescript
// Correct
t('key', { name: 'John' })

// Incorrect
t('key', 'John')
```

**5. Performance issues**

Solutions:
- Enable lazy loading
- Preload critical namespaces only
- Use React.memo for translated components
- Check for unnecessary re-renders

```typescript
// Memoize translated component
export default React.memo(TranslatedComponent);
```

### Debug Mode

Enable detailed logging:

```typescript
i18n.init({
  debug: true,
  saveMissing: true,
  missingKeyHandler: (lng, ns, key, fallbackValue) => {
    console.warn(`Missing translation: ${lng}:${ns}:${key}`);
  }
});
```

### Browser Console Commands

```javascript
// Check current language
i18n.language

// Check loaded namespaces
i18n.languages

// Get all keys in a namespace
Object.keys(i18n.getResourceBundle('en', 'common'))

// Change language
i18n.changeLanguage('es')

// Check if key exists
i18n.exists('common:actions.save')

// Get translation without React
i18n.t('common:actions.save')
```

## Maintenance

### Adding New Translation Keys

1. Add key to English files first
2. Run extraction script
3. Update other languages
4. Run validation
5. Test in UI

### Updating Existing Translations

1. Modify English source
2. Mark other languages as needing update
3. Notify translators
4. Review and merge updates

### Managing Translation Debt

Track coverage:
```bash
npm run i18n:coverage
```

Generate report:
```json
{
  "en": { "coverage": "100%", "total": 500, "missing": 0 },
  "es": { "coverage": "95%", "total": 475, "missing": 25 },
  "fr": { "coverage": "70%", "total": 350, "missing": 150 }
}
```

---

**Version**: 1.0.0
**Last Updated**: February 17, 2024
**Maintained by**: Platform Engineering Team
