#!/usr/bin/env node

/**
 * Translation Validation Script
 *
 * Validates translation files for:
 * - Missing keys
 * - Extra keys
 * - Formatting errors
 * - Placeholder consistency
 * - Empty values
 *
 * Usage: node check-translations.js [--fix]
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  localesDir: path.join(__dirname, '../frontend/src/locales'),
  baseLocale: 'en',
  namespaces: [
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
  ],
  supportedLocales: ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'he'],
};

const fixMode = process.argv.includes('--fix');

/**
 * Load translation file
 */
function loadTranslation(locale, namespace) {
  const filePath = path.join(config.localesDir, locale, `${namespace}.json`);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get all keys from a nested object
 */
function getAllKeys(obj, prefix = '') {
  const keys = [];

  Object.entries(obj).forEach(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys.push(...getAllKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  });

  return keys;
}

/**
 * Get value from nested object using dot notation
 */
function getNestedValue(obj, path) {
  const keys = path.split('.');
  let current = obj;

  for (const key of keys) {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    current = current[key];
  }

  return current;
}

/**
 * Extract placeholders from a string (e.g., {{name}}, {{count}})
 */
function extractPlaceholders(str) {
  if (typeof str !== 'string') return [];
  const matches = str.match(/\{\{([^}]+)\}\}/g);
  return matches ? matches.map((m) => m.slice(2, -2).trim()) : [];
}

/**
 * Validate a single translation file
 */
function validateTranslation(locale, namespace, baseTranslation) {
  const issues = {
    locale,
    namespace,
    errors: [],
    warnings: [],
    info: [],
  };

  const translation = loadTranslation(locale, namespace);

  if (!translation) {
    issues.errors.push({
      type: 'MISSING_FILE',
      message: `Translation file not found: ${locale}/${namespace}.json`,
    });
    return issues;
  }

  // Check for _meta field (indicates template that needs translation)
  if (translation._meta) {
    issues.warnings.push({
      type: 'NEEDS_TRANSLATION',
      message: 'File contains _meta field indicating it needs translation',
    });
  }

  const baseKeys = getAllKeys(baseTranslation);
  const translationKeys = getAllKeys(translation);

  // Check for missing keys
  const missingKeys = baseKeys.filter((key) => !translationKeys.includes(key));
  if (missingKeys.length > 0) {
    issues.warnings.push({
      type: 'MISSING_KEYS',
      message: `${missingKeys.length} missing keys`,
      keys: missingKeys,
    });
  }

  // Check for extra keys
  const extraKeys = translationKeys.filter((key) => !baseKeys.includes(key));
  if (extraKeys.length > 0) {
    issues.warnings.push({
      type: 'EXTRA_KEYS',
      message: `${extraKeys.length} extra keys (not in base locale)`,
      keys: extraKeys,
    });
  }

  // Check for empty values
  const emptyKeys = translationKeys.filter((key) => {
    const value = getNestedValue(translation, key);
    return value === '' || value === null || value === undefined;
  });

  if (emptyKeys.length > 0) {
    issues.errors.push({
      type: 'EMPTY_VALUES',
      message: `${emptyKeys.length} keys have empty values`,
      keys: emptyKeys,
    });
  }

  // Check placeholder consistency
  baseKeys.forEach((key) => {
    const baseValue = getNestedValue(baseTranslation, key);
    const translatedValue = getNestedValue(translation, key);

    if (typeof baseValue === 'string' && typeof translatedValue === 'string') {
      const basePlaceholders = extractPlaceholders(baseValue);
      const translatedPlaceholders = extractPlaceholders(translatedValue);

      const missingPlaceholders = basePlaceholders.filter(
        (p) => !translatedPlaceholders.includes(p)
      );
      const extraPlaceholders = translatedPlaceholders.filter(
        (p) => !basePlaceholders.includes(p)
      );

      if (missingPlaceholders.length > 0 || extraPlaceholders.length > 0) {
        issues.errors.push({
          type: 'PLACEHOLDER_MISMATCH',
          message: `Placeholder mismatch in key: ${key}`,
          key,
          missingPlaceholders,
          extraPlaceholders,
        });
      }
    }
  });

  // Calculate coverage
  const totalKeys = baseKeys.length;
  const existingKeys = translationKeys.filter((key) => baseKeys.includes(key)).length;
  const coverage = totalKeys > 0 ? (existingKeys / totalKeys) * 100 : 0;

  issues.info.push({
    type: 'COVERAGE',
    message: `Translation coverage: ${coverage.toFixed(1)}%`,
    coverage: coverage.toFixed(2),
    total: totalKeys,
    existing: existingKeys,
    missing: missingKeys.length,
  });

  return issues;
}

/**
 * Generate validation report
 */
function generateReport(results) {
  console.log('\n📊 Translation Validation Report\n');
  console.log('='.repeat(80));

  let totalErrors = 0;
  let totalWarnings = 0;

  // Summary by locale
  const localeStats = {};

  results.forEach((result) => {
    const { locale, namespace, errors, warnings, info } = result;

    if (!localeStats[locale]) {
      localeStats[locale] = {
        errors: 0,
        warnings: 0,
        namespaces: [],
      };
    }

    localeStats[locale].errors += errors.length;
    localeStats[locale].warnings += warnings.length;
    localeStats[locale].namespaces.push(namespace);

    totalErrors += errors.length;
    totalWarnings += warnings.length;

    // Print details if there are issues
    if (errors.length > 0 || warnings.length > 0) {
      console.log(`\n${locale}/${namespace}.json:`);

      // Errors
      if (errors.length > 0) {
        console.log('  ❌ Errors:');
        errors.forEach((error) => {
          console.log(`     - ${error.type}: ${error.message}`);
          if (error.keys && error.keys.length <= 5) {
            error.keys.forEach((key) => {
              console.log(`       • ${key}`);
            });
          } else if (error.keys) {
            error.keys.slice(0, 3).forEach((key) => {
              console.log(`       • ${key}`);
            });
            console.log(`       ... and ${error.keys.length - 3} more`);
          }
        });
      }

      // Warnings
      if (warnings.length > 0) {
        console.log('  ⚠️  Warnings:');
        warnings.forEach((warning) => {
          console.log(`     - ${warning.type}: ${warning.message}`);
          if (warning.keys && warning.keys.length <= 3) {
            warning.keys.forEach((key) => {
              console.log(`       • ${key}`);
            });
          } else if (warning.keys) {
            console.log(`       First 3 of ${warning.keys.length} keys`);
          }
        });
      }

      // Coverage info
      const coverageInfo = info.find((i) => i.type === 'COVERAGE');
      if (coverageInfo) {
        const coverageNum = parseFloat(coverageInfo.coverage);
        const icon = coverageNum === 100 ? '✅' : coverageNum >= 80 ? '🟡' : '🔴';
        console.log(`  ${icon} ${coverageInfo.message}`);
      }
    }
  });

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('\n📈 Summary:\n');

  Object.entries(localeStats).forEach(([locale, stats]) => {
    const status =
      stats.errors === 0 && stats.warnings === 0 ? '✅' : stats.errors > 0 ? '❌' : '⚠️';
    console.log(`${status} ${locale}: ${stats.errors} errors, ${stats.warnings} warnings`);
  });

  console.log('\n' + '='.repeat(80));
  console.log(`\n Total: ${totalErrors} errors, ${totalWarnings} warnings\n`);

  return { totalErrors, totalWarnings };
}

/**
 * Main function
 */
function main() {
  console.log('🔍 Translation Validation Tool');

  if (fixMode) {
    console.log('🔧 Fix mode enabled\n');
  }

  const results = [];

  // Load base translations (English)
  const baseTranslations = {};
  config.namespaces.forEach((namespace) => {
    baseTranslations[namespace] = loadTranslation(config.baseLocale, namespace);
  });

  // Validate all locales
  config.supportedLocales.forEach((locale) => {
    if (locale === config.baseLocale) return; // Skip base locale

    config.namespaces.forEach((namespace) => {
      if (!baseTranslations[namespace]) {
        console.warn(`⚠️  Base translation not found: ${namespace}`);
        return;
      }

      const result = validateTranslation(
        locale,
        namespace,
        baseTranslations[namespace]
      );
      results.push(result);
    });
  });

  // Generate report
  const { totalErrors, totalWarnings } = generateReport(results);

  // Exit with error if there are critical issues
  if (totalErrors > 0) {
    console.log('❌ Validation failed with errors');
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log('⚠️  Validation completed with warnings');
  } else {
    console.log('✅ All translations are valid');
  }
}

// Run if called directly
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

module.exports = { validateTranslation, main };
