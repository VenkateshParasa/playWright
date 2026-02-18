# Translation Files

This directory contains all translation files for the Playwright & Selenium Learning Platform.

## Structure

```
locales/
├── en/          # English (default, complete)
├── es/          # Spanish (partial)
├── fr/          # French (partial)
├── de/          # German (templates)
├── ja/          # Japanese (templates)
├── zh/          # Chinese Simplified (templates)
├── ar/          # Arabic (templates, RTL)
└── he/          # Hebrew (templates, RTL)
```

## Namespaces

Each language directory contains 10 JSON files (namespaces):

| File | Purpose | Keys |
|------|---------|------|
| `common.json` | General UI text, buttons, labels | 150+ |
| `navigation.json` | Menus, breadcrumbs, categories | 30+ |
| `auth.json` | Authentication flows | 60+ |
| `lessons.json` | Lesson system | 50+ |
| `flashcards.json` | Flashcard features | 80+ |
| `quizzes.json` | Quiz interface | 90+ |
| `exercises.json` | Coding exercises | 70+ |
| `errors.json` | Error messages | 40+ |
| `validation.json` | Form validation | 60+ |
| `notifications.json` | User notifications | 70+ |

**Total**: 700+ translation keys

## Translation Status

### ✅ Complete (100%)
- **English (en)**: All namespaces fully translated

### 🟡 In Progress (40%)
- **Spanish (es)**: `common`, `navigation`, `auth` complete; others have placeholders
- **French (fr)**: `common`, `navigation`, `auth` complete; others have placeholders

### 🔄 Templates Ready (5%)
- **German (de)**: Placeholder files created, ready for translation
- **Japanese (ja)**: Placeholder files created, ready for translation
- **Chinese (zh)**: Placeholder files created, ready for translation
- **Arabic (ar)**: Placeholder files created, RTL support ready
- **Hebrew (he)**: Placeholder files created, RTL support ready

## File Format

Each file follows this structure:

```json
{
  "section": {
    "subsection": {
      "key": "Translated text here",
      "withPlaceholder": "Hello, {{name}}!",
      "count": "{{count}} item",
      "count_plural": "{{count}} items"
    }
  }
}
```

### Key Features:
- **Nested structure**: Organize related translations
- **Placeholders**: Use `{{variable}}` for dynamic values
- **Pluralization**: Add `_plural` suffix for plural forms
- **No HTML**: Keep translations pure text

## Contributing Translations

### Quick Start

1. **Choose a language** to translate
2. **Check status** above to see what's needed
3. **Copy English files** as reference
4. **Translate carefully** preserving placeholders
5. **Validate** with `npm run i18n:check`
6. **Submit PR** with your translations

### Detailed Guide

See [TRANSLATION_GUIDE.md](../../docs/TRANSLATION_GUIDE.md) for:
- Translation best practices
- Style guidelines
- Common pitfalls
- Testing procedures
- Submission process

### Placeholder Files

Files with `_meta` field are placeholders needing translation:

```json
{
  "_meta": {
    "language": "de",
    "namespace": "lessons",
    "status": "translation-needed"
  }
}
```

## Translation Guidelines

### Do's ✅
- Maintain consistent tone
- Keep similar length to English
- Preserve placeholder syntax: `{{variable}}`
- Use culturally appropriate terms
- Test translations in the UI
- Provide context in PR

### Don'ts ❌
- Don't translate: Playwright, Selenium, CSS, API, JSON
- Don't add HTML tags
- Don't change placeholder names
- Don't mix formality levels
- Don't skip testing

## Special Considerations

### RTL Languages (Arabic, Hebrew)
- Text flows right-to-left
- Punctuation may differ
- Numbers often stay LTR
- Code examples stay LTR
- Test layouts thoroughly

### Asian Languages (Japanese, Chinese)
- No spaces between words
- Different pluralization rules
- Consider character length
- Test vertical layouts if needed

### European Languages
- Watch for length (German is longer)
- Respect formal/informal distinctions
- Accents and special characters
- Regional variations (es-ES vs es-MX)

## Validation

Before submitting translations:

```bash
# Validate all translations
npm run i18n:check

# Check coverage
npm run i18n:coverage

# Extract any missing keys
npm run i18n:extract
```

## Testing

Test your translations:

1. **Start dev server**: `npm run dev`
2. **Switch language**: Use language switcher in UI
3. **Navigate all pages**: Check every section
4. **Test edge cases**: Long strings, empty states
5. **Mobile testing**: Verify responsive behavior
6. **RTL testing**: For Arabic/Hebrew only

## Translation Memory

Common terms to keep consistent:

| English | Spanish | French | German |
|---------|---------|--------|--------|
| lesson | lección | leçon | Lektion |
| quiz | cuestionario | quiz | Quiz |
| flashcard | tarjeta | carte mémoire | Lernkarte |
| test | prueba | test | Test |
| automation | automatización | automatisation | Automatisierung |

See full glossary in [TRANSLATION_GUIDE.md](../../docs/TRANSLATION_GUIDE.md)

## File Ownership

| Language | Primary Maintainer | Status |
|----------|-------------------|--------|
| en | Core Team | Maintained |
| es | Seeking | Open |
| fr | Seeking | Open |
| de | Seeking | Open |
| ja | Seeking | Open |
| zh | Seeking | Open |
| ar | Seeking | Open |
| he | Seeking | Open |

Want to maintain a language? Open an issue!

## Quality Standards

All translations must:
- [ ] Pass `npm run i18n:check` validation
- [ ] Have consistent placeholder usage
- [ ] Match tone and style of English
- [ ] Be tested in the UI
- [ ] Include translator attribution
- [ ] Have no empty values
- [ ] Use correct pluralization

## Resources

### External Tools
- **DeepL**: High-quality machine translation (starting point)
- **Google Translate**: Quick checks
- **Linguee**: Context and examples
- **Native speakers**: Best resource!

### Internal Documentation
- [I18N_GUIDE.md](../../docs/I18N_GUIDE.md) - Usage guide
- [TRANSLATION_GUIDE.md](../../docs/TRANSLATION_GUIDE.md) - Contributor guide
- [LOCALIZATION_IMPLEMENTATION.md](../../docs/LOCALIZATION_IMPLEMENTATION.md) - Technical details

## Recognition

Contributors to translations will be:
- Listed in CONTRIBUTORS.md
- Credited in app "About" section
- Mentioned in release notes
- Added to GitHub contributors

Thank you for helping make our platform accessible worldwide! 🌍

---

**Need help?** Open an issue with the `translation` label or contact the maintainers.
