# Translation Contribution Guide

Thank you for helping make the Playwright & Selenium Learning Platform accessible to users worldwide!

## Table of Contents

- [Getting Started](#getting-started)
- [Translation Process](#translation-process)
- [Guidelines](#guidelines)
- [File Structure](#file-structure)
- [Translation Tips](#translation-tips)
- [Testing Your Translations](#testing-your-translations)
- [Submitting Translations](#submitting-translations)
- [FAQ](#faq)

## Getting Started

### Prerequisites

- Basic understanding of JSON format
- Familiarity with the target language
- Understanding of test automation concepts (helpful but not required)

### Setting Up

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/playwright-selenium-learning.git
   cd playwright-selenium-learning
   ```

2. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Create your language branch**
   ```bash
   git checkout -b translations/your-language-code
   ```

## Translation Process

### Step 1: Check if Language Exists

Check `/frontend/src/locales/` for your language code:
- English: `en`
- Spanish: `es`
- French: `fr`
- German: `de`
- Japanese: `ja`
- Chinese: `zh`
- Arabic: `ar`
- Hebrew: `he`

### Step 2: Generate Template Files (if new language)

```bash
npm run i18n:generate
```

This creates template files in `/frontend/src/locales/{your-lang}/`

### Step 3: Translate Files

Translate each JSON file while preserving:
- JSON structure
- Placeholder syntax: `{{variable}}`
- Special formatting

Example:

**English (en/common.json):**
```json
{
  "welcome": "Welcome, {{name}}!",
  "items": {
    "count": "{{count}} item",
    "count_plural": "{{count}} items"
  }
}
```

**Spanish (es/common.json):**
```json
{
  "welcome": "¡Bienvenido, {{name}}!",
  "items": {
    "count": "{{count}} artículo",
    "count_plural": "{{count}} artículos"
  }
}
```

### Step 4: Validate Translations

```bash
npm run i18n:check
```

This validates:
- JSON syntax
- Missing keys
- Placeholder consistency
- Empty values

### Step 5: Test in Browser

```bash
npm run dev
```

Change language in the UI and verify translations appear correctly.

## Guidelines

### General Principles

1. **Accuracy Over Literal Translation**
   - Translate meaning, not just words
   - Adapt idioms and expressions to the target culture

2. **Maintain Tone**
   - Keep the friendly, educational tone
   - Use appropriate formality level for your language

3. **Be Concise**
   - UI space is limited
   - Keep translations similar in length to English
   - Use abbreviations if culturally appropriate

4. **Technical Terms**
   - Don't translate: Playwright, Selenium, CSS selectors, API, JavaScript
   - DO translate: test, automation, lesson, quiz, flashcard

### Specific Guidelines

#### Placeholders

**Always preserve placeholder syntax:**

```json
// ✅ Correct
"welcome": "Bonjour, {{name}}!"

// ❌ Wrong
"welcome": "Bonjour, name!"
```

#### Pluralization

Use `_plural` suffix for plural forms:

```json
{
  "minutes": "{{count}} minute",
  "minutes_plural": "{{count}} minutes"
}
```

Different languages have different pluralization rules:
- **English**: 2 forms (one, other)
- **French**: 2 forms (one, other)
- **Arabic**: 6 forms (zero, one, two, few, many, other)
- **Japanese**: 1 form (no pluralization)

#### Gender-Specific Translations

For gendered languages (French, Spanish, German), use neutral forms when possible:

```json
// French - Use neutral form
"welcomeMessage": "Bienvenue sur la plateforme"

// If gender needed, provide both
"welcome": {
  "male": "Bienvenu",
  "female": "Bienvenue"
}
```

#### Formal vs. Informal

Be consistent with formality:
- **Spanish**: Use "tú" (informal) for consistency
- **German**: Use "Sie" (formal) for educational context
- **French**: Use "vous" (formal) for educational context

### Context-Specific Guidelines

#### Buttons and Actions

Keep short and actionable:
```json
{
  "save": "Guardar",      // Not "Guardar cambios ahora"
  "cancel": "Cancelar",   // Not "Cancelar esta acción"
  "delete": "Eliminar"    // Not "Eliminar permanentemente"
}
```

#### Error Messages

Be clear and helpful:
```json
{
  "error": {
    "required": "Este campo es obligatorio",
    "email": "Por favor, ingresa un correo válido"
  }
}
```

#### Success Messages

Be positive and encouraging:
```json
{
  "success": {
    "lessonCompleted": "¡Lección completada! ¡Buen trabajo!"
  }
}
```

## File Structure

### Priority Order

Translate files in this order for maximum impact:

1. **common.json** - Most frequently used strings
2. **navigation.json** - Main navigation
3. **auth.json** - Login/registration
4. **lessons.json** - Core learning content
5. **errors.json** - Error messages
6. **validation.json** - Form validation
7. **notifications.json** - User feedback
8. **flashcards.json** - Flashcard features
9. **quizzes.json** - Quiz features
10. **exercises.json** - Coding exercises

### File Contents

Each file contains:

```json
{
  "_meta": {
    "language": "es",
    "lastUpdated": "2024-02-17",
    "translator": "Your Name",
    "status": "complete"
  },
  "section": {
    "key": "translated value"
  }
}
```

## Translation Tips

### 1. Use Translation Memory

Keep consistent translations for repeated terms:

| English | Spanish | Notes |
|---------|---------|-------|
| lesson | lección | Always lowercase unless start of sentence |
| quiz | cuestionario | Not "examen" |
| flashcard | tarjeta | Short form, not "tarjeta de memoria" |
| save | guardar | Not "salvar" |

### 2. Handle Technical Terms

**Don't translate:**
- Playwright
- Selenium
- WebDriver
- API
- CSS
- XPath
- JSON
- Git
- npm

**Do translate:**
- test → prueba
- automation → automatización
- locator → localizador
- assertion → aserción/afirmación
- framework → marco de trabajo

### 3. Consider UI Space

Some languages are longer than English:

| English | German | Ratio |
|---------|--------|-------|
| Save | Speichern | 2.2x |
| Settings | Einstellungen | 2.4x |

Tips:
- Use abbreviations where culturally acceptable
- Request UI adjustments for problematic strings
- Prioritize clarity over brevity when necessary

### 4. Cultural Adaptation

Adapt examples and metaphors:
- Date formats: MM/DD/YYYY (US) vs DD/MM/YYYY (Europe)
- Phone number formats
- Address formats
- Cultural references

### 5. RTL Languages (Arabic, Hebrew)

Additional considerations:
- Text direction: right-to-left
- Number formatting: often LTR within RTL
- Punctuation: mirror when needed (« » vs. " ")
- Mixed content: handle LTR code in RTL text

Example:
```json
{
  "codeExample": "استخدم الأمر <span dir='ltr'>page.click()</span> للنقر"
}
```

## Testing Your Translations

### Visual Testing

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Switch to your language**
   - Use language switcher in UI
   - Or set in localStorage: `localStorage.setItem('i18nextLng', 'es')`

3. **Check all sections**
   - [ ] Home page
   - [ ] Lessons
   - [ ] Flashcards
   - [ ] Quizzes
   - [ ] Exercises
   - [ ] Settings
   - [ ] Profile
   - [ ] Auth pages

### Validation Testing

```bash
# Check for errors
npm run i18n:check

# Check coverage
npm run i18n:coverage
```

### RTL Testing (Arabic/Hebrew)

1. Verify all layouts work in RTL
2. Check that text aligns correctly
3. Ensure icons are flipped appropriately
4. Verify forms are usable
5. Test navigation flows

### Common Issues

**Issue: Key not found**
```
Solution: Ensure key path matches exactly, including namespace
```

**Issue: Placeholder not replaced**
```
Solution: Check placeholder syntax: {{variable}} not ${variable}
```

**Issue: Text overflowing**
```
Solution: Notify maintainers or use shorter alternative
```

**Issue: Special characters broken**
```
Solution: Ensure file is saved as UTF-8
```

## Submitting Translations

### Before Submitting

- [ ] All files pass validation
- [ ] Tested in browser
- [ ] No JSON syntax errors
- [ ] Placeholders preserved
- [ ] _meta section updated
- [ ] Git commit messages are clear

### Submission Process

1. **Commit your changes**
   ```bash
   git add frontend/src/locales/your-lang/
   git commit -m "Add Spanish translations for common and navigation"
   ```

2. **Push to your fork**
   ```bash
   git push origin translations/your-language-code
   ```

3. **Create Pull Request**
   - Go to GitHub repository
   - Click "New Pull Request"
   - Select your branch
   - Fill in PR template:

   ```markdown
   ## Translation Contribution

   **Language**: Spanish (es)
   **Files Translated**:
   - [x] common.json
   - [x] navigation.json
   - [ ] auth.json (in progress)

   **Translation Coverage**: 85%

   **Notes**:
   - Used formal "usted" form consistently
   - Some technical terms left in English as commonly used
   - Tested on Chrome and Firefox

   **Screenshots**:
   [Attach screenshots of key pages]
   ```

4. **Wait for review**
   - Maintainers will review translations
   - May request changes or clarifications
   - Native speakers may provide feedback

### After Approval

- Translations will be merged
- Your contribution will be credited
- Translation will be available in next release

## FAQ

### How long does translation take?

- **Complete translation**: 20-40 hours for all files
- **Core files only**: 5-10 hours
- **Single file**: 30-60 minutes

### Can I translate just one file?

Yes! Any contribution is valuable. Start with `common.json` for maximum impact.

### I'm not a professional translator, can I still help?

Absolutely! Native speaker intuition is more valuable than professional translation for most content.

### What if I make a mistake?

Don't worry! All translations are reviewed. Mistakes can be fixed in subsequent PRs.

### Can I update existing translations?

Yes! If you find errors or improvements, please submit corrections.

### How do I handle pluralization in my language?

Check i18next pluralization rules for your language:
https://www.i18next.com/translation-function/plurals

### Can I get credit for my work?

Yes! Contributors are listed in:
- GitHub contributors
- CONTRIBUTORS.md file
- App credits page

### I have a question not covered here

Open an issue on GitHub with the "translation" label, or contact the maintainers directly.

## Resources

### Translation Tools

- **JSON Validators**: https://jsonlint.com/
- **i18next Documentation**: https://www.i18next.com/
- **Unicode CLDR**: http://cldr.unicode.org/

### Language-Specific Resources

- **Spanish**: RAE (Real Academia Española)
- **French**: Académie Française
- **German**: Duden
- **Japanese**: jisho.org
- **Chinese**: chinese-tools.com
- **Arabic**: arabic-tools.com

### Community

- **GitHub Discussions**: Ask questions, share tips
- **Discord**: Real-time chat with other translators
- **Email**: translations@yourplatform.com

## Thank You!

Your contribution helps thousands of learners access quality test automation education in their native language. Thank you for being part of our global community!

---

**Last Updated**: February 17, 2024
**Version**: 1.0.0
**Maintainer**: Platform Team
