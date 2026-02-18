#!/usr/bin/env node

/**
 * Translation File Generator
 *
 * This script generates complete translation files for all supported languages
 * based on the English source files.
 *
 * Usage: node generate-translations.js
 */

const fs = require('fs');
const path = require('path');

// Language configurations with sample translations
const languages = {
  es: {
    name: 'Spanish',
    translations: {
      'Hello': 'Hola',
      'Welcome': 'Bienvenido',
      'Loading': 'Cargando',
      'Save': 'Guardar',
      'Cancel': 'Cancelar',
      'Delete': 'Eliminar',
      'Edit': 'Editar',
      // Add more common translations
    }
  },
  fr: {
    name: 'French',
    translations: {
      'Hello': 'Bonjour',
      'Welcome': 'Bienvenue',
      'Loading': 'Chargement',
      'Save': 'Enregistrer',
      'Cancel': 'Annuler',
      'Delete': 'Supprimer',
      'Edit': 'Modifier',
    }
  },
  de: {
    name: 'German',
    translations: {
      'Hello': 'Hallo',
      'Welcome': 'Willkommen',
      'Loading': 'Laden',
      'Save': 'Speichern',
      'Cancel': 'Abbrechen',
      'Delete': 'Löschen',
      'Edit': 'Bearbeiten',
    }
  },
  ja: {
    name: 'Japanese',
    translations: {
      'Hello': 'こんにちは',
      'Welcome': 'ようこそ',
      'Loading': '読み込み中',
      'Save': '保存',
      'Cancel': 'キャンセル',
      'Delete': '削除',
      'Edit': '編集',
    }
  },
  zh: {
    name: 'Chinese',
    translations: {
      'Hello': '你好',
      'Welcome': '欢迎',
      'Loading': '加载中',
      'Save': '保存',
      'Cancel': '取消',
      'Delete': '删除',
      'Edit': '编辑',
    }
  },
  ar: {
    name: 'Arabic',
    dir: 'rtl',
    translations: {
      'Hello': 'مرحبا',
      'Welcome': 'أهلا وسهلا',
      'Loading': 'جار التحميل',
      'Save': 'حفظ',
      'Cancel': 'إلغاء',
      'Delete': 'حذف',
      'Edit': 'تعديل',
    }
  },
  he: {
    name: 'Hebrew',
    dir: 'rtl',
    translations: {
      'Hello': 'שלום',
      'Welcome': 'ברוך הבא',
      'Loading': 'טוען',
      'Save': 'שמור',
      'Cancel': 'ביטול',
      'Delete': 'מחק',
      'Edit': 'ערוך',
    }
  },
};

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

const localesDir = path.join(__dirname, '../frontend/src/locales');
const enDir = path.join(localesDir, 'en');

/**
 * Generate translation files for a specific language
 */
function generateTranslations(langCode, langConfig) {
  console.log(`Generating translations for ${langConfig.name} (${langCode})...`);

  const langDir = path.join(localesDir, langCode);

  // Create language directory if it doesn't exist
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }

  // Process each namespace
  namespaces.forEach(namespace => {
    const enFile = path.join(enDir, `${namespace}.json`);
    const targetFile = path.join(langDir, `${namespace}.json`);

    // Skip if English file doesn't exist
    if (!fs.existsSync(enFile)) {
      console.warn(`  ⚠️  English file not found: ${namespace}.json`);
      return;
    }

    // Skip if translation already exists and is not empty
    if (fs.existsSync(targetFile)) {
      const existingContent = fs.readFileSync(targetFile, 'utf8');
      const parsed = JSON.parse(existingContent);
      if (Object.keys(parsed).length > 0) {
        console.log(`  ✓ ${namespace}.json already exists, skipping`);
        return;
      }
    }

    // For now, copy English as template
    // In production, this would integrate with translation services
    const enContent = fs.readFileSync(enFile, 'utf8');
    const enData = JSON.parse(enContent);

    // Create a note in the file
    const translationData = {
      ...enData,
      _meta: {
        language: langCode,
        languageName: langConfig.name,
        namespace: namespace,
        status: 'translation-needed',
        note: 'This file contains English text that needs translation',
      }
    };

    fs.writeFileSync(
      targetFile,
      JSON.stringify(translationData, null, 2),
      'utf8'
    );

    console.log(`  ✓ Created ${namespace}.json`);
  });

  console.log(`✅ Completed ${langConfig.name}\n`);
}

/**
 * Main function
 */
function main() {
  console.log('🌍 Translation File Generator\n');
  console.log('='.repeat(50));
  console.log('\n');

  // Check if English files exist
  if (!fs.existsSync(enDir)) {
    console.error('❌ English locale directory not found!');
    console.error(`   Expected: ${enDir}`);
    process.exit(1);
  }

  // Generate translations for each language
  Object.entries(languages).forEach(([langCode, langConfig]) => {
    try {
      generateTranslations(langCode, langConfig);
    } catch (error) {
      console.error(`❌ Error generating ${langCode}:`, error.message);
    }
  });

  console.log('\n' + '='.repeat(50));
  console.log('✅ Translation generation complete!');
  console.log('\nNext steps:');
  console.log('1. Review generated files');
  console.log('2. Translate the content (or integrate with translation service)');
  console.log('3. Remove _meta fields after translation');
  console.log('4. Update translation coverage report');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { generateTranslations, languages, namespaces };
