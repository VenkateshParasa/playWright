# i18n Quick Reference

Quick reference for using internationalization in the Playwright & Selenium Learning Platform.

## Installation

```bash
cd frontend
npm install
```

Dependencies are already added to `package.json`:
- i18next
- react-i18next
- i18next-browser-languagedetector
- i18next-http-backend

## Basic Usage

### 1. Import and Use

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

### 2. With Namespace

```tsx
const { t } = useTranslation('lessons');
<h1>{t('list.title')}</h1>
```

### 3. With Interpolation

```tsx
const { t } = useTranslation('common');
<p>{t('pagination.page', { current: 1, total: 10 })}</p>
// Output: "Page 1 of 10"
```

### 4. Pluralization

```tsx
<p>{t('time.minutes', { count: 1 })}</p>  // "1 minute"
<p>{t('time.minutes', { count: 5 })}</p>  // "5 minutes"
```

## Available Namespaces

| Namespace | Purpose |
|-----------|---------|
| common | UI labels, buttons, general text |
| navigation | Menus, breadcrumbs, tabs |
| auth | Login, register, password reset |
| lessons | Lesson content and player |
| flashcards | Flashcard system |
| quizzes | Quiz interface |
| exercises | Coding exercises |
| errors | Error messages |
| validation | Form validation |
| notifications | User notifications |

## Language Switcher

### Add to Header

```tsx
import { LanguageSwitcher } from '../components/LanguageSwitcher';

<LanguageSwitcher variant="compact" />
```

### Variants

```tsx
// Full dropdown with flags
<LanguageSwitcher variant="dropdown" />

// Compact icon only
<LanguageSwitcher variant="compact" />

// Menu list for settings
<LanguageSwitcher variant="menu" />
```

## Formatting Utilities

### Date Formatting

```tsx
const { formatLocalizedDate } = useTranslation();

formatLocalizedDate(new Date(), 'PPP')
// English: "February 17, 2024"
// Spanish: "17 de febrero de 2024"
```

### Relative Time

```tsx
const { formatRelativeTime } = useTranslation();

formatRelativeTime(pastDate)
// English: "2 hours ago"
// Spanish: "hace 2 horas"
```

### Numbers

```tsx
const { formatNumber, formatCurrency, formatPercent } = useTranslation();

formatNumber(1234567.89)        // "1,234,567.89" (US)
formatCurrency(99.99, 'USD')    // "$99.99"
formatPercent(0.75)             // "75%"
```

## RTL Support

### Check if RTL

```tsx
const { isRTL, direction } = useTranslation();

<div dir={direction}>
  {/* Content adapts automatically */}
</div>
```

### Force LTR (for code)

```tsx
<code dir="ltr">{code}</code>
```

## Translation Management

### Extract Keys

```bash
npm run i18n:extract
```

### Validate Translations

```bash
npm run i18n:check
```

### Generate Templates

```bash
npm run i18n:generate
```

### Coverage Report

```bash
npm run i18n:coverage
```

## Common Patterns

### Conditional Text

```tsx
const { t } = useTranslation('common');

<button>
  {isLoading ? t('status.loading') : t('actions.submit')}
</button>
```

### Dynamic Keys

```tsx
const status = 'completed';
<span>{t(`status.${status}`)}</span>
```

### Lists

```tsx
const items = ['apple', 'banana', 'orange'];
<ul>
  {items.map(item => (
    <li key={item}>{t(`fruits.${item}`)}</li>
  ))}
</ul>
```

## Supported Languages

| Code | Language | Native | Direction | Status |
|------|----------|--------|-----------|--------|
| en | English | English | LTR | ✅ Complete |
| es | Spanish | Español | LTR | 🟡 40% |
| fr | French | Français | LTR | 🟡 40% |
| de | German | Deutsch | LTR | 🔄 Template |
| ja | Japanese | 日本語 | LTR | 🔄 Template |
| zh | Chinese | 中文 | LTR | 🔄 Template |
| ar | Arabic | العربية | RTL | 🔄 Template |
| he | Hebrew | עברית | RTL | 🔄 Template |

## Translation File Location

```
frontend/src/locales/
├── en/
│   ├── common.json
│   ├── navigation.json
│   ├── auth.json
│   └── ...
├── es/
│   └── ...
└── ...
```

## Key Naming Convention

```json
{
  "section": {
    "subsection": {
      "key": "value"
    }
  }
}
```

Usage: `t('section.subsection.key')`

## Placeholder Syntax

```json
{
  "welcome": "Hello, {{name}}!",
  "items": "You have {{count}} items"
}
```

Usage:
```tsx
t('welcome', { name: 'John' })
t('items', { count: 5 })
```

## Backend Usage

### Detect Locale

```typescript
import { localeMiddleware } from './middleware/locale';

app.use(localeMiddleware);

app.get('/api/data', (req, res) => {
  const locale = req.locale; // 'en', 'es', etc.
  // ...
});
```

### Translate on Server

```typescript
import { I18n } from './utils/i18n';

const i18n = new I18n(req.locale);
res.json({
  message: i18n.t('success.created')
});
```

### Email Templates

```typescript
import { getEmailTemplate } from './utils/i18n';

const template = getEmailTemplate('welcome', req.locale, {
  name: user.name
});

await sendEmail({
  to: user.email,
  subject: template.subject,
  html: template.htmlBody
});
```

## Troubleshooting

### Translation not showing?

1. Check namespace is correct
2. Verify key path is exact
3. Check file exists in locales/{lang}/
4. Ensure JSON is valid

```tsx
// Debug
console.log(i18n.hasResourceBundle('en', 'common'));
console.log(i18n.exists('common:actions.save'));
```

### RTL layout broken?

1. Import RTL styles: `import './styles/rtl.css'`
2. Check document direction: `document.documentElement.dir`
3. Use logical properties where possible

### Performance issues?

1. Use React.memo for translated components
2. Avoid translating in loops
3. Preload critical namespaces

## Tips

1. **Always use namespaces** - More organized and performant
2. **Keep keys descriptive** - `lessons.card.duration` not just `duration`
3. **No HTML in translations** - Keep styling separate
4. **Test with long strings** - German text is often longer
5. **Test RTL layouts** - Arabic/Hebrew need special attention

## Need Help?

- **Documentation**: `/docs/I18N_GUIDE.md`
- **Contributing**: `/docs/TRANSLATION_GUIDE.md`
- **Technical**: `/docs/LOCALIZATION_IMPLEMENTATION.md`
- **Issues**: GitHub with `i18n` label

---

**Quick Start**: Import `useTranslation`, call `t()`, enjoy multilingual app! 🌍
