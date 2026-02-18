/**
 * Card Import/Export Utilities
 * Handles parsing and generating different card formats
 */

import type { Card } from '../../stores/cardManagementStore';

// =============================================================================
// Types
// =============================================================================

export interface ImportResult {
  success: boolean;
  imported: Card[];
  skipped: any[];
  errors: Array<{ card: any; reason: string }>;
}

export interface CSVCard {
  front: string;
  back: string;
  category: string;
  tags: string;
  difficulty?: string;
  deckName?: string;
}

// =============================================================================
// JSON Import/Export
// =============================================================================

/**
 * Parse JSON format
 */
export const parseJSON = (jsonString: string): Partial<Card>[] => {
  try {
    const data = JSON.parse(jsonString);

    // Handle single card or array of cards
    const cards = Array.isArray(data) ? data : data.cards || [data];

    return cards.map((card: any) => ({
      front: card.front || '',
      back: card.back || '',
      frontImages: card.frontImages || [],
      backImages: card.backImages || [],
      category: card.category || 'General',
      tags: Array.isArray(card.tags) ? card.tags : [],
      difficulty: card.difficulty,
      deckId: card.deckId,
    }));
  } catch (error) {
    console.error('Failed to parse JSON:', error);
    throw new Error('Invalid JSON format');
  }
};

/**
 * Generate JSON export
 */
export const generateJSON = (cards: Card[]): string => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    count: cards.length,
    cards: cards.map(card => ({
      front: card.front,
      back: card.back,
      frontImages: card.frontImages,
      backImages: card.backImages,
      category: card.category,
      tags: card.tags,
      difficulty: card.difficulty,
    })),
  };

  return JSON.stringify(exportData, null, 2);
};

// =============================================================================
// CSV Import/Export
// =============================================================================

/**
 * Parse CSV format
 */
export const parseCSV = (csvString: string): Partial<Card>[] => {
  const lines = csvString.trim().split('\n');

  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row');
  }

  // Parse header
  const header = parseCSVLine(lines[0]);
  const frontIndex = header.findIndex(h => h.toLowerCase() === 'front');
  const backIndex = header.findIndex(h => h.toLowerCase() === 'back');
  const categoryIndex = header.findIndex(h => h.toLowerCase() === 'category');
  const tagsIndex = header.findIndex(h => h.toLowerCase() === 'tags');
  const difficultyIndex = header.findIndex(h => h.toLowerCase() === 'difficulty');

  if (frontIndex === -1 || backIndex === -1) {
    throw new Error('CSV must contain "Front" and "Back" columns');
  }

  // Parse data rows
  const cards: Partial<Card>[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines

    const values = parseCSVLine(lines[i]);

    const front = values[frontIndex] || '';
    const back = values[backIndex] || '';

    if (!front || !back) {
      console.warn(`Skipping row ${i + 1}: Missing front or back`);
      continue;
    }

    const card: Partial<Card> = {
      front,
      back,
      category: categoryIndex !== -1 ? values[categoryIndex] || 'General' : 'General',
      tags: tagsIndex !== -1 ? parseTags(values[tagsIndex]) : [],
      difficulty: difficultyIndex !== -1
        ? (values[difficultyIndex] as any)
        : undefined,
    };

    cards.push(card);
  }

  return cards;
};

/**
 * Parse a single CSV line (handles quoted values)
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++;
      } else {
        // Toggle quotes
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  // Add last field
  result.push(current.trim());

  return result;
};

/**
 * Parse tags from string
 */
const parseTags = (tagsString: string): string[] => {
  if (!tagsString) return [];

  return tagsString
    .split(/[,;]/)
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
};

/**
 * Generate CSV export
 */
export const generateCSV = (cards: Card[]): string => {
  const rows: string[] = [];

  // Header
  rows.push('Front,Back,Category,Tags,Difficulty,Status');

  // Data rows
  for (const card of cards) {
    const row = [
      escapeCSV(card.front),
      escapeCSV(card.back),
      card.category,
      escapeCSV(card.tags.join(', ')),
      card.difficulty || '',
      card.status,
    ];

    rows.push(row.join(','));
  }

  return rows.join('\n');
};

/**
 * Escape CSV value (add quotes if needed)
 */
const escapeCSV = (value: string): string => {
  if (!value) return '';

  // Add quotes if value contains comma, quote, or newline
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
};

// =============================================================================
// Anki Format (Optional)
// =============================================================================

/**
 * Parse Anki format (tab-separated)
 */
export const parseAnki = (ankiString: string): Partial<Card>[] => {
  const lines = ankiString.trim().split('\n');
  const cards: Partial<Card>[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split('\t');

    if (parts.length < 2) {
      console.warn('Skipping invalid Anki line:', line);
      continue;
    }

    const card: Partial<Card> = {
      front: parts[0].trim(),
      back: parts[1].trim(),
      category: 'Imported from Anki',
      tags: parts.length > 2 ? parseTags(parts[2]) : [],
    };

    cards.push(card);
  }

  return cards;
};

/**
 * Generate Anki format
 */
export const generateAnki = (cards: Card[]): string => {
  return cards
    .map(card => {
      const parts = [
        card.front.replace(/\t/g, ' '),
        card.back.replace(/\t/g, ' '),
        card.tags.join(' '),
      ];
      return parts.join('\t');
    })
    .join('\n');
};

// =============================================================================
// Validation
// =============================================================================

/**
 * Validate card data
 */
export const validateCard = (card: Partial<Card>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!card.front || card.front.trim().length === 0) {
    errors.push('Front content is required');
  }

  if (!card.back || card.back.trim().length === 0) {
    errors.push('Back content is required');
  }

  if (!card.category || card.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (card.difficulty && !['easy', 'medium', 'hard'].includes(card.difficulty)) {
    errors.push('Difficulty must be easy, medium, or hard');
  }

  if (card.front && card.front.length > 10000) {
    errors.push('Front content is too long (max 10,000 characters)');
  }

  if (card.back && card.back.length > 10000) {
    errors.push('Back content is too long (max 10,000 characters)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate all cards
 */
export const validateCards = (cards: Partial<Card>[]): {
  valid: Card[];
  invalid: Array<{ card: Partial<Card>; errors: string[] }>;
} => {
  const valid: Card[] = [];
  const invalid: Array<{ card: Partial<Card>; errors: string[] }> = [];

  for (const card of cards) {
    const validation = validateCard(card);

    if (validation.valid) {
      valid.push(card as Card);
    } else {
      invalid.push({ card, errors: validation.errors });
    }
  }

  return { valid, invalid };
};

// =============================================================================
// Duplicate Detection
// =============================================================================

/**
 * Find duplicate cards (based on front content)
 */
export const findDuplicates = (
  newCards: Partial<Card>[],
  existingCards: Card[]
): {
  duplicates: Array<{ newCard: Partial<Card>; existingCard: Card }>;
  unique: Partial<Card>[];
} => {
  const duplicates: Array<{ newCard: Partial<Card>; existingCard: Card }> = [];
  const unique: Partial<Card>[] = [];

  const existingFronts = new Set(existingCards.map(c => c.front.toLowerCase().trim()));

  for (const card of newCards) {
    const front = card.front?.toLowerCase().trim();

    if (front && existingFronts.has(front)) {
      const existingCard = existingCards.find(
        c => c.front.toLowerCase().trim() === front
      );
      if (existingCard) {
        duplicates.push({ newCard: card, existingCard });
      }
    } else {
      unique.push(card);
    }
  }

  return { duplicates, unique };
};

// =============================================================================
// File Utilities
// =============================================================================

/**
 * Read file as text
 */
export const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target?.result as string;
      resolve(text);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Download text as file
 */
export const downloadTextFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Export cards to JSON file
 */
export const exportCardsToJSON = (cards: Card[], filename = 'flashcards.json') => {
  const json = generateJSON(cards);
  downloadTextFile(json, filename, 'application/json');
};

/**
 * Export cards to CSV file
 */
export const exportCardsToCSV = (cards: Card[], filename = 'flashcards.csv') => {
  const csv = generateCSV(cards);
  downloadTextFile(csv, filename, 'text/csv');
};

/**
 * Export cards to Anki file
 */
export const exportCardsToAnki = (cards: Card[], filename = 'flashcards.txt') => {
  const anki = generateAnki(cards);
  downloadTextFile(anki, filename, 'text/plain');
};

// =============================================================================
// Format Detection
// =============================================================================

/**
 * Detect file format from extension or content
 */
export const detectFormat = (
  file: File,
  content: string
): 'json' | 'csv' | 'anki' | 'unknown' => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  // Check extension
  if (extension === 'json') return 'json';
  if (extension === 'csv') return 'csv';
  if (extension === 'txt') {
    // Check if it's Anki format (tab-separated)
    if (content.includes('\t')) return 'anki';
  }

  // Try to detect from content
  const trimmed = content.trim();

  // JSON starts with { or [
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return 'json';
  }

  // CSV likely has commas and quotes
  if (trimmed.includes(',') && trimmed.includes('"')) {
    return 'csv';
  }

  // Anki has tabs
  if (trimmed.includes('\t')) {
    return 'anki';
  }

  return 'unknown';
};
