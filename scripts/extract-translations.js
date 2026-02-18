#!/usr/bin/env node

/**
 * Translation Key Extraction Tool
 *
 * Extracts translation keys from source code and generates a report
 * of all keys that need translation.
 *
 * Usage: node extract-translations.js
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuration
const config = {
  sourceDir: path.join(__dirname, '../frontend/src'),
  localesDir: path.join(__dirname, '../frontend/src/locales'),
  outputFile: path.join(__dirname, '../translation-keys.json'),
  filePatterns: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
  excludePatterns: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**'],
};

/**
 * Extract translation keys from a file
 */
function extractKeysFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const keys = new Set();

  // Pattern 1: t('key') or t("key")
  const pattern1 = /\bt\s*\(\s*['"]([^'"]+)['"]/g;
  let match;
  while ((match = pattern1.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Pattern 2: t(`key`) with template literals (without interpolation)
  const pattern2 = /\bt\s*\(\s*`([^`$]+)`/g;
  while ((match = pattern2.exec(content)) !== null) {
    keys.add(match[1]);
  }

  // Pattern 3: useTranslation hook with namespace
  const pattern3 = /useTranslation\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  const namespaces = [];
  while ((match = pattern3.exec(content)) !== null) {
    namespaces.push(match[1]);
  }

  return { keys: Array.from(keys), namespaces };
}

/**
 * Get all source files
 */
function getSourceFiles() {
  const files = [];

  config.filePatterns.forEach((pattern) => {
    const matches = glob.sync(path.join(config.sourceDir, pattern), {
      ignore: config.excludePatterns,
    });
    files.push(...matches);
  });

  return files;
}

/**
 * Parse namespace from key (e.g., "common.actions.save" -> "common")
 */
function getNamespaceFromKey(key) {
  const parts = key.split('.');
  if (parts.length > 1) {
    // Check if first part is a known namespace
    const knownNamespaces = [
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
    if (knownNamespaces.includes(parts[0])) {
      return parts[0];
    }
  }
  return 'common'; // default namespace
}

/**
 * Load existing translations
 */
function loadExistingTranslations(locale) {
  const translations = {};
  const localeDir = path.join(config.localesDir, locale);

  if (!fs.existsSync(localeDir)) {
    return translations;
  }

  const files = fs.readdirSync(localeDir);
  files.forEach((file) => {
    if (file.endsWith('.json')) {
      const namespace = file.replace('.json', '');
      const filePath = path.join(localeDir, file);
      try {
        translations[namespace] = JSON.parse(
          fs.readFileSync(filePath, 'utf8')
        );
      } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
      }
    }
  });

  return translations;
}

/**
 * Check if a key exists in translations
 */
function hasTranslation(translations, key) {
  const parts = key.split('.');
  let current = translations;

  for (const part of parts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      return false;
    }
    current = current[part];
  }

  return current !== undefined && current !== null && current !== '';
}

/**
 * Main extraction function
 */
function main() {
  console.log('🔍 Translation Key Extraction Tool\n');
  console.log('='.repeat(60));

  // Get all source files
  console.log('\n📁 Scanning source files...');
  const sourceFiles = getSourceFiles();
  console.log(`   Found ${sourceFiles.length} files to scan\n`);

  // Extract keys from all files
  console.log('🔑 Extracting translation keys...');
  const allKeys = new Set();
  const keysByFile = {};
  const namespaceUsage = {};

  sourceFiles.forEach((file) => {
    const { keys, namespaces } = extractKeysFromFile(file);
    const relativePath = path.relative(config.sourceDir, file);

    if (keys.length > 0) {
      keysByFile[relativePath] = keys;
      keys.forEach((key) => allKeys.add(key));
    }

    namespaces.forEach((ns) => {
      namespaceUsage[ns] = (namespaceUsage[ns] || 0) + 1;
    });
  });

  console.log(`   Extracted ${allKeys.size} unique keys\n`);

  // Group keys by namespace
  console.log('📋 Grouping keys by namespace...');
  const keysByNamespace = {};
  allKeys.forEach((key) => {
    const namespace = getNamespaceFromKey(key);
    if (!keysByNamespace[namespace]) {
      keysByNamespace[namespace] = [];
    }
    keysByNamespace[namespace].push(key);
  });

  console.log('   Namespaces found:');
  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    console.log(`   - ${namespace}: ${keys.length} keys`);
  });
  console.log('');

  // Check coverage in existing translations
  console.log('📊 Checking translation coverage...');
  const enTranslations = loadExistingTranslations('en');
  const missingKeys = {};
  const existingKeys = {};

  Object.entries(keysByNamespace).forEach(([namespace, keys]) => {
    const missing = [];
    const existing = [];

    keys.forEach((key) => {
      // Remove namespace prefix if present
      const keyWithoutNs = key.startsWith(`${namespace}.`)
        ? key.substring(namespace.length + 1)
        : key;

      if (hasTranslation(enTranslations[namespace], keyWithoutNs)) {
        existing.push(key);
      } else {
        missing.push(key);
      }
    });

    if (missing.length > 0) {
      missingKeys[namespace] = missing;
    }
    if (existing.length > 0) {
      existingKeys[namespace] = existing;
    }
  });

  // Calculate coverage
  const totalKeys = allKeys.size;
  const totalExisting = Object.values(existingKeys).flat().length;
  const totalMissing = Object.values(missingKeys).flat().length;
  const coverage = totalKeys > 0 ? (totalExisting / totalKeys) * 100 : 0;

  console.log(`   Total keys: ${totalKeys}`);
  console.log(`   Existing: ${totalExisting} (${coverage.toFixed(1)}%)`);
  console.log(`   Missing: ${totalMissing}\n`);

  // Show missing keys by namespace
  if (totalMissing > 0) {
    console.log('⚠️  Missing translations:');
    Object.entries(missingKeys).forEach(([namespace, keys]) => {
      console.log(`   ${namespace}:`);
      keys.slice(0, 5).forEach((key) => {
        console.log(`     - ${key}`);
      });
      if (keys.length > 5) {
        console.log(`     ... and ${keys.length - 5} more`);
      }
    });
    console.log('');
  }

  // Generate report
  const report = {
    generatedAt: new Date().toISOString(),
    summary: {
      totalFiles: sourceFiles.length,
      totalKeys: totalKeys,
      existingKeys: totalExisting,
      missingKeys: totalMissing,
      coverage: coverage.toFixed(2) + '%',
    },
    keysByNamespace,
    missingKeys,
    existingKeys,
    keysByFile,
    namespaceUsage,
  };

  // Save report
  fs.writeFileSync(
    config.outputFile,
    JSON.stringify(report, null, 2),
    'utf8'
  );

  console.log('='.repeat(60));
  console.log(`✅ Report saved to: ${config.outputFile}\n`);

  // Exit with error if missing keys
  if (totalMissing > 0) {
    console.log('⚠️  Warning: Missing translation keys detected');
    // Don't exit with error in development
    // process.exit(1);
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

module.exports = { extractKeysFromFile, main };
