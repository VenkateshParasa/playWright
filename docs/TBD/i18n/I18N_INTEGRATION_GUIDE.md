# i18n Integration Guide for Developers

Step-by-step guide to integrate the i18n system into your existing application.

## Quick Start (5 minutes)

### 1. Install Dependencies

```bash
cd frontend
npm install
```

Dependencies are already added to `package.json`:
- `i18next@^23.7.0`
- `react-i18next@^13.5.0`
- `i18next-browser-languagedetector@^7.2.0`
- `i18next-http-backend@^2.4.0`

### 2. Initialize i18n

In your `main.tsx` or `App.tsx`, add this import at the top:

```tsx
import './i18n/config';
```

That's it! The i18n system is now initialized.

### 3. Import RTL Styles

In your main CSS file or `App.tsx`:

```tsx
import './styles/rtl.css';
```

### 4. Add Language Switcher

In your header component:

```tsx
import { LanguageSwitcher } from './components/LanguageSwitcher';

function Header() {
  return (
    <header>
      {/* ... other header content */}
      <LanguageSwitcher variant="compact" />
    </header>
  );
}
```

### 5. Start Using Translations

In any component:

```tsx
import { useTranslation } from './hooks/useTranslation';

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

**You're done!** The app now supports 8 languages. 🎉

---

## Detailed Integration

### Step 1: Update Main Entry Point

**File: `/frontend/src/main.tsx`**

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Initialize i18n
import './i18n/config';

// Import RTL styles
import './styles/rtl.css';

// Import other styles
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 2: Update App Component

**File: `/frontend/src/App.tsx`**

Add language switcher and ensure proper HTML attributes:

```tsx
import { useEffect } from 'react';
import { useLanguageSwitcher } from './components/LanguageSwitcher';

function App() {
  const { currentLanguage } = useLanguageSwitcher();

  // Update HTML attributes on language change
  useEffect(() => {
    document.documentElement.lang = currentLanguage.code;
    document.documentElement.dir = currentLanguage.dir;
  }, [currentLanguage]);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

### Step 3: Update Header/Navigation

**File: `/frontend/src/components/Header.tsx`**

```tsx
import { LanguageSwitcher } from './LanguageSwitcher';
import { useTranslation } from '../hooks/useTranslation';

function Header() {
  const { t } = useTranslation('navigation');

  return (
    <header>
      <nav>
        <a href="/">{t('menu.home')}</a>
        <a href="/lessons">{t('menu.lessons')}</a>
        <a href="/quizzes">{t('menu.quizzes')}</a>
        {/* ... more links */}
      </nav>

      <div className="header-actions">
        <LanguageSwitcher variant="compact" />
      </div>
    </header>
  );
}

export default Header;
```

### Step 4: Update Auth Pages

**File: `/frontend/src/pages/Login.tsx`**

```tsx
import { useTranslation } from '../hooks/useTranslation';

function Login() {
  const { t } = useTranslation('auth');

  return (
    <div>
      <h1>{t('login.title')}</h1>
      <p>{t('login.subtitle')}</p>

      <form>
        <label>
          {t('login.emailLabel')}
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
          />
        </label>

        <label>
          {t('login.passwordLabel')}
          <input
            type="password"
            placeholder={t('login.passwordPlaceholder')}
          />
        </label>

        <button type="submit">
          {t('login.submitButton')}
        </button>
      </form>

      <p>
        {t('login.noAccount')}
        <a href="/register">{t('login.signUpLink')}</a>
      </p>
    </div>
  );
}

export default Login;
```

### Step 5: Update Common Components

**Example: Button Component**

```tsx
import { useTranslation } from '../hooks/useTranslation';

interface ButtonProps {
  action: 'save' | 'cancel' | 'delete' | 'submit';
  onClick?: () => void;
}

function ActionButton({ action, onClick }: ButtonProps) {
  const { t } = useTranslation('common');

  return (
    <button onClick={onClick}>
      {t(`actions.${action}`)}
    </button>
  );
}

// Usage
<ActionButton action="save" onClick={handleSave} />
```

### Step 6: Update Notifications/Toast

**File: `/frontend/src/components/Toast.tsx`**

```tsx
import { useTranslation } from '../hooks/useTranslation';

interface ToastProps {
  type: 'success' | 'error' | 'warning';
  messageKey: string;
}

function Toast({ type, messageKey }: ToastProps) {
  const { t } = useTranslation('notifications');

  return (
    <div className={`toast toast-${type}`}>
      {t(messageKey)}
    </div>
  );
}

// Usage
<Toast type="success" messageKey="success.saved" />
```

### Step 7: Update Forms with Validation

```tsx
import { useTranslation } from '../hooks/useTranslation';

function SignupForm() {
  const { t: tAuth } = useTranslation('auth');
  const { t: tValidation } = useTranslation('validation');

  const [errors, setErrors] = useState({});

  const validateEmail = (email: string) => {
    if (!email) {
      return tValidation('required.field', { field: tAuth('register.emailLabel') });
    }
    if (!isValidEmail(email)) {
      return tValidation('email.invalid');
    }
    return null;
  };

  return (
    <form>
      <input type="email" />
      {errors.email && <span className="error">{errors.email}</span>}
    </form>
  );
}
```

### Step 8: Update Date/Time Display

```tsx
import { useTranslation } from '../hooks/useTranslation';

function LessonCard({ lesson }) {
  const { formatLocalizedDate, formatRelativeTime } = useTranslation();

  return (
    <div>
      <h3>{lesson.title}</h3>
      <p>
        Created: {formatLocalizedDate(lesson.createdAt, 'PPP')}
      </p>
      <p>
        Last updated: {formatRelativeTime(lesson.updatedAt)}
      </p>
    </div>
  );
}
```

### Step 9: Update Number/Currency Display

```tsx
import { useTranslation } from '../hooks/useTranslation';

function PricingCard({ price }) {
  const { formatCurrency, formatNumber } = useTranslation();

  return (
    <div>
      <p>Price: {formatCurrency(price, 'USD')}</p>
      <p>Students: {formatNumber(12345)}</p>
    </div>
  );
}
```

---

## Backend Integration

### Step 1: Add Locale Middleware

**File: `/backend/src/server.ts`**

```typescript
import express from 'express';
import { localeMiddleware } from './middleware/locale';

const app = express();

// Add locale middleware early in the chain
app.use(localeMiddleware);

// Your routes can now access req.locale
app.get('/api/data', (req, res) => {
  console.log('User locale:', req.locale); // 'en', 'es', etc.
  // Return localized data
});
```

### Step 2: Use i18n in API Responses

```typescript
import { I18n } from './utils/i18n';

app.post('/api/lessons', async (req, res) => {
  try {
    const lesson = await createLesson(req.body);
    const i18n = new I18n(req.locale);

    res.json({
      success: true,
      message: i18n.t('success.created'),
      data: lesson
    });
  } catch (error) {
    const i18n = new I18n(req.locale);

    res.status(500).json({
      success: false,
      message: i18n.t('error.serverError')
    });
  }
});
```

### Step 3: Localized Email Templates

```typescript
import { getEmailTemplate } from './utils/i18n';
import { sendEmail } from './services/email';

async function sendWelcomeEmail(user) {
  const template = getEmailTemplate('welcome', user.preferredLanguage, {
    name: user.name,
    link: generateActivationLink(user)
  });

  await sendEmail({
    to: user.email,
    subject: template.subject,
    html: template.htmlBody
  });
}
```

---

## Migration Strategy

### Migrating Existing Components

**Before:**
```tsx
function OldComponent() {
  return (
    <div>
      <h1>Playwright & Selenium Learning Platform</h1>
      <button>Save</button>
    </div>
  );
}
```

**After:**
```tsx
import { useTranslation } from './hooks/useTranslation';

function NewComponent() {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('app.name')}</h1>
      <button>{t('actions.save')}</button>
    </div>
  );
}
```

### Gradual Migration Approach

1. **Start with new pages** - All new pages use translations from day one
2. **Migrate high-traffic pages** - Login, dashboard, main navigation
3. **Migrate by feature** - Complete one feature at a time
4. **Keep tracking** - Mark components as "i18n-ready"

### Finding Hard-coded Strings

Use grep to find hard-coded strings:

```bash
# Find string literals in JSX
grep -r ">[A-Z][^<]*<" src/

# Find button text
grep -r '<button>[^<]*</button>' src/

# Find heading text
grep -r '<h[1-6]>[^<]*</h[1-6]>' src/
```

---

## Testing Your Integration

### 1. Manual Testing Checklist

- [ ] Language switcher appears and works
- [ ] Can switch between all languages
- [ ] Language preference persists on reload
- [ ] RTL layout works (Arabic/Hebrew)
- [ ] Forms work in all languages
- [ ] Date/time formats correctly
- [ ] Numbers format correctly
- [ ] No English text remains (except proper nouns)
- [ ] Mobile layout works
- [ ] All pages accessible

### 2. Automated Testing

```bash
# Validate translations
npm run i18n:check

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e
```

### 3. Visual Testing

Take screenshots in each language:

```bash
# Using Playwright
npm run test:e2e -- --update-snapshots
```

---

## Common Patterns

### 1. Conditional Text

```tsx
const { t } = useTranslation('common');

<button>
  {isLoading ? t('status.loading') : t('actions.submit')}
</button>
```

### 2. Dynamic Keys

```tsx
const status = 'completed';
<span>{t(`status.${status}`)}</span>
```

### 3. Lists

```tsx
const items = ['apple', 'banana', 'orange'];
<ul>
  {items.map(item => (
    <li key={item}>{t(`fruits.${item}`)}</li>
  ))}
</ul>
```

### 4. Interpolation

```tsx
<p>{t('welcome.message', { name: user.name })}</p>
```

### 5. Pluralization

```tsx
<p>{t('items.count', { count: items.length })}</p>
```

### 6. With Components

```tsx
<p>
  {t('terms.accept')}{' '}
  <Link to="/terms">{t('terms.link')}</Link>
</p>
```

---

## Troubleshooting

### Issue: Translations not showing

**Check:**
1. Is i18n imported in main.tsx?
2. Is the namespace correct?
3. Does the key exist in the JSON file?
4. Is the JSON file valid?

```tsx
// Debug
import i18n from './i18n/config';
console.log('Current language:', i18n.language);
console.log('Has namespace:', i18n.hasResourceBundle('en', 'common'));
console.log('Key exists:', i18n.exists('common:actions.save'));
```

### Issue: Language not persisting

**Check localStorage:**
```javascript
console.log(localStorage.getItem('i18nextLng'));
```

**Manually set:**
```javascript
localStorage.setItem('i18nextLng', 'es');
window.location.reload();
```

### Issue: RTL not working

**Check:**
1. Is rtl.css imported?
2. Is dir attribute set on <html>?
3. Are you using logical properties?

```javascript
// Verify
console.log(document.documentElement.dir);
console.log(document.documentElement.lang);
```

---

## Performance Tips

1. **Use React.memo** for translated components
2. **Avoid translating in loops** - memoize results
3. **Preload critical namespaces**
4. **Use lazy loading** for less common namespaces
5. **Bundle translation files** separately

---

## Next Steps

1. ✅ Complete this integration guide
2. 🔄 Migrate existing components
3. 🔄 Complete Spanish/French translations
4. 🔄 Add E2E tests
5. 🔄 Set up monitoring
6. 🔄 Deploy to production

---

## Support

- **Documentation**: `/docs/I18N_GUIDE.md`
- **Quick Reference**: `/docs/I18N_QUICK_REFERENCE.md`
- **Issues**: GitHub with `i18n` label

---

**Ready to go global!** 🌍
