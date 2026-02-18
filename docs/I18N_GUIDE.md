# Internationalization (i18n) Guide

Complete guide to internationalization and localization in the Playwright & Selenium Learning Platform.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Supported Languages](#supported-languages)
- [Usage](#usage)
- [Translation Files](#translation-files)
- [RTL Support](#rtl-support)
- [Backend i18n](#backend-i18n)
- [Best Practices](#best-practices)
- [Tools & Scripts](#tools--scripts)
- [Contributing](#contributing)

## Overview

The platform supports 8 languages with full internationalization:

- **LTR Languages**: English, Spanish, French, German, Japanese, Chinese
- **RTL Languages**: Arabic, Hebrew

### Features

- ✅ Automatic language detection from browser settings
- ✅ User preference persistence in localStorage
- ✅ Namespace-based translation organization
- ✅ Lazy loading of translation files
- ✅ RTL (Right-to-Left) layout support
- ✅ Locale-aware date, time, and number formatting
- ✅ Pluralization support
- ✅ Hot-reloading in development
- ✅ Translation key validation tools
- ✅ SEO-friendly localized URLs

## Quick Start

### 1. Using Translations in Components

```tsx
import { useTranslation } from '../hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### 2. Using Multiple Namespaces

```tsx
function LessonPage() {
  const { t: tCommon } = useTranslation('common');
  const { t: tLessons } = useTranslation('lessons');

  return (
    <div>
      <h1>{tLessons('list.title')}</h1>
      <button>{tCommon('actions.cancel')}</button>
    </div>
  );
}
```

### 3. Interpolation

```tsx
const { t } = useTranslation('common');

// Usage
<p>{t('pagination.page', { current: 1, total: 10 })}</p>
// Output: "Page 1 of 10"
```

### 4. Pluralization

```tsx
const { t } = useTranslation('common');

// Usage
<p>{t('time.minutes', { count: 1 })}</p>  // "1 minute"
<p>{t('time.minutes', { count: 5 })}</p>  // "5 minutes"
```

## Supported Languages

| Code | Language | Native Name | Direction | Status |
|------|----------|-------------|-----------|---------|
| en | English | English | LTR | ✅ Complete |
| es | Spanish | Español | LTR | ✅ Complete |
| fr | French | Français | LTR | 🟡 In Progress |
| de | German | Deutsch | LTR | 🟡 In Progress |
| ja | Japanese | 日本語 | LTR | 🟡 In Progress |
| zh | Chinese | 中文 | LTR | 🟡 In Progress |
| ar | Arabic | العربية | RTL | 🟡 In Progress |
| he | Hebrew | עברית | RTL | 🟡 In Progress |

## Usage

### Language Switcher Component

```tsx
import { LanguageSwitcher } from '../components/LanguageSwitcher';

// Dropdown variant (default)
<LanguageSwitcher variant="dropdown" />

// Compact variant (icon only)
<LanguageSwitcher variant="compact" />

// Menu variant (inline list)
<LanguageSwitcher variant="menu" />
```

### Custom Hook

```tsx
import { useLanguageSwitcher } from '../components/LanguageSwitcher';

function MyComponent() {
  const {
    currentLanguage,
    changeLanguage,
    isRTL,
    supportedLanguages
  } = useLanguageSwitcher();

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'}>
      <p>Current: {currentLanguage.nativeName}</p>
      <button onClick={() => changeLanguage('es')}>
        Switch to Spanish
      </button>
    </div>
  );
}
```

### Enhanced Translation Hook

```tsx
import { useTranslation } from '../hooks/useTranslation';

function Example() {
  const {
    t,
    formatLocalizedDate,
    formatRelativeTime,
    formatNumber,
    formatCurrency,
    isRTL,
    direction,
  } = useTranslation();

  return (
    <div dir={direction}>
      {/* Date formatting */}
      <p>{formatLocalizedDate(new Date(), 'PPP')}</p>

      {/* Relative time */}
      <p>{formatRelativeTime(new Date('2024-01-01'))}</p>

      {/* Number formatting */}
      <p>{formatNumber(1234567.89)}</p>

      {/* Currency formatting */}
      <p>{formatCurrency(99.99, 'USD')}</p>
    </div>
  );
}
```

## Translation Files

### File Structure

```
frontend/src/locales/
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── auth.json
│   ├── lessons.json
│   ├── flashcards.json
│   ├── quizzes.json
│   ├── exercises.json
│   ├── errors.json
│   ├── validation.json
│   └── notifications.json
├── es/
│   └── ... (same structure)
└── ... (other languages)
```

### Namespace Organization

**common.json** - Common UI elements
- App metadata
- Actions (save, cancel, delete, etc.)
- Status messages
- Labels
- Time-related strings
- Pagination
- Confirmation dialogs

**navigation.json** - Navigation elements
- Menu items
- Breadcrumbs
- Tabs
- Categories

**auth.json** - Authentication
- Login/Register forms
- Password reset
- Email verification
- Two-factor authentication

**lessons.json** - Lesson content
- Lesson lists
- Lesson player
- Progress tracking
- Completion messages

**flashcards.json** - Flashcard system
- Study sessions
- Card creation
- Statistics
- Settings

**quizzes.json** - Quiz system
- Quiz interface
- Results
- Navigation
- Instructions

**exercises.json** - Coding exercises
- Editor interface
- Submissions
- Results
- Hints

**errors.json** - Error messages
- General errors
- Network errors
- Authentication errors
- Validation errors

**validation.json** - Form validation
- Field validation messages
- Format requirements
- Constraints

**notifications.json** - Notification messages
- Success messages
- Info messages
- Warnings
- System notifications

### Translation File Format

```json
{
  "app": {
    "name": "Playwright & Selenium Learning Platform",
    "tagline": "Master Test Automation"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete"
  },
  "time": {
    "minutes": "{{count}} minute",
    "minutes_plural": "{{count}} minutes"
  }
}
```

## RTL Support

### Automatic Direction Setting

The platform automatically sets the document direction based on the selected language:

```typescript
// Automatically applied when language changes
document.documentElement.dir = 'rtl'; // for Arabic/Hebrew
document.documentElement.lang = 'ar';
```

### RTL Styles

RTL-specific styles are in `/frontend/src/styles/rtl.css`:

```css
/* Automatically applied for RTL languages */
[dir="rtl"] .ml-4 {
  margin-left: 0;
  margin-right: 1rem;
}

[dir="rtl"] .text-left {
  text-align: right;
}
```

### RTL-Aware Components

Use logical properties for RTL-friendly layouts:

```css
/* ✅ Good - RTL-friendly */
.element {
  margin-inline-start: 1rem;
  padding-inline-end: 2rem;
}

/* ❌ Bad - Not RTL-friendly */
.element {
  margin-left: 1rem;
  padding-right: 2rem;
}
```

### Code Blocks and Numbers

Code blocks and numbers should remain LTR in RTL layouts:

```tsx
<div dir={isRTL ? 'rtl' : 'ltr'}>
  <pre dir="ltr">{code}</pre>
  <span className="number" dir="ltr">{price}</span>
</div>
```

## Backend i18n

### Locale Middleware

```typescript
import { localeMiddleware } from './middleware/locale';

app.use(localeMiddleware);

// Access locale in routes
app.get('/api/content', (req, res) => {
  const locale = req.locale; // 'en', 'es', etc.
  // Return localized content
});
```

### Localized Responses

```typescript
import { I18n } from './utils/i18n';

const i18n = new I18n(req.locale);

res.json({
  message: i18n.t('success.created'),
  data: result
});
```

### Email Localization

```typescript
import { getEmailTemplate } from './utils/i18n';

const template = getEmailTemplate('welcome', req.locale, {
  name: user.name,
  link: verificationLink
});

await sendEmail({
  to: user.email,
  subject: template.subject,
  html: template.htmlBody
});
```

## Best Practices

### 1. Use Descriptive Keys

```typescript
// ✅ Good
t('lessons.card.duration', { minutes: 30 })

// ❌ Bad
t('duration', { minutes: 30 })
```

### 2. Avoid Concatenation

```typescript
// ✅ Good
t('welcome.message', { name: 'John' })
// "Welcome, John!"

// ❌ Bad
t('welcome') + ', ' + name + '!'
```

### 3. Keep HTML Out of Translations

```typescript
// ✅ Good
<p>{t('terms.accept')} <Link>{t('terms.link')}</Link></p>

// ❌ Bad
t('terms.accept_html') // "I accept the <a>Terms</a>"
```

### 4. Use Pluralization

```typescript
// ✅ Good
t('items.count', { count: items.length })

// ❌ Bad
items.length === 1 ? t('item') : t('items')
```

### 5. Provide Context

```json
{
  "button": {
    "submit": "Submit",
    "submit_form": "Submit Form",
    "submit_quiz": "Submit Quiz"
  }
}
```

## Tools & Scripts

### Extract Translation Keys

```bash
npm run i18n:extract
```

Scans source code and extracts all translation keys used.

### Validate Translations

```bash
npm run i18n:check
```

Validates all translation files for:
- Missing keys
- Extra keys
- Placeholder consistency
- Empty values

### Generate Translation Templates

```bash
npm run i18n:generate
```

Generates translation file templates for new languages.

### Translation Coverage Report

```bash
npm run i18n:coverage
```

Generates a report showing translation coverage per language.

## Contributing

See [TRANSLATION_GUIDE.md](./TRANSLATION_GUIDE.md) for detailed instructions on contributing translations.

### Adding a New Language

1. Add language to `supportedLanguages` in `/frontend/src/i18n/config.ts`
2. Create directory: `/frontend/src/locales/{language-code}/`
3. Run `npm run i18n:generate` to create template files
4. Translate all JSON files
5. Test with `npm run i18n:check`
6. Submit PR with translations

### Translation Guidelines

- Maintain consistent tone across translations
- Preserve placeholder syntax: `{{variable}}`
- Keep translations concise and clear
- Consider cultural context
- Test in the actual UI
- Verify RTL layout for Arabic/Hebrew

## Troubleshooting

### Translations Not Loading

Check that:
1. Translation files exist in correct directory
2. Files are valid JSON
3. Language code matches exactly
4. Namespace is imported in config

### RTL Layout Issues

Verify:
1. `dir="rtl"` is set on HTML element
2. RTL styles are imported
3. Logical properties are used
4. Icons are flipped correctly

### Missing Translations

Run validation:
```bash
npm run i18n:check
```

Check translation coverage:
```bash
npm run i18n:coverage
```

## Resources

- [i18next Documentation](https://www.i18next.com/)
- [React i18next](https://react.i18next.com/)
- [date-fns Locales](https://date-fns.org/docs/Locale)
- [MDN: Intl](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Unicode CLDR](http://cldr.unicode.org/)

## Support

For questions or issues:
- Check existing translations for patterns
- Review this guide
- Check [TRANSLATION_GUIDE.md](./TRANSLATION_GUIDE.md)
- Open an issue on GitHub
