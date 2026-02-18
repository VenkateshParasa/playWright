import Fuse from 'fuse.js';
import {
  SearchIndexItem,
  SearchResult,
  SearchOptions,
  SearchFiltersState,
} from '../../types/search.types';

/**
 * Default Fuse.js options for fuzzy search
 */
export const DEFAULT_SEARCH_OPTIONS: Fuse.IFuseOptions<SearchIndexItem> = {
  threshold: 0.4, // 0.0 = perfect match, 1.0 = match anything
  minMatchCharLength: 2,
  ignoreLocation: true,
  useExtendedSearch: false,
  findAllMatches: false,
  includeScore: true,
  includeMatches: true,
  keys: [
    { name: 'title', weight: 3 },
    { name: 'keywords', weight: 2.5 },
    { name: 'tags', weight: 2 },
    { name: 'description', weight: 1.5 },
    { name: 'category', weight: 1.2 },
    { name: 'content', weight: 1 },
  ],
};

/**
 * Custom scoring algorithm for ranking search results
 */
export function calculateResultScore(
  result: Fuse.FuseResult<SearchIndexItem>,
  filters: SearchFiltersState
): number {
  let score = result.score ? 1 - result.score : 0; // Invert Fuse score (higher is better)

  // Boost exact title matches
  if (result.item.title.toLowerCase().includes(filters.type.toLowerCase())) {
    score *= 1.5;
  }

  // Boost by difficulty match
  if (filters.difficulty !== 'all' && result.item.difficulty === filters.difficulty) {
    score *= 1.2;
  }

  // Boost by category match
  if (filters.category !== 'all' && result.item.category === filters.category) {
    score *= 1.3;
  }

  // Boost by type match
  if (filters.type !== 'all' && result.item.type === filters.type) {
    score *= 1.4;
  }

  return score;
}

/**
 * Highlight matching text in search results
 */
export function highlightMatches(
  text: string,
  matches: readonly Fuse.FuseResultMatch[] | undefined,
  key: string
): string {
  if (!matches || matches.length === 0) return text;

  const match = matches.find((m) => m.key === key);
  if (!match || !match.indices || match.indices.length === 0) return text;

  let highlighted = '';
  let lastIndex = 0;

  // Sort indices by start position
  const sortedIndices = [...match.indices].sort((a, b) => a[0] - b[0]);

  for (const [start, end] of sortedIndices) {
    // Add non-matching text
    highlighted += text.slice(lastIndex, start);
    // Add matching text with highlight
    highlighted += `<mark class="bg-yellow-200 font-semibold">${text.slice(start, end + 1)}</mark>`;
    lastIndex = end + 1;
  }

  // Add remaining text
  highlighted += text.slice(lastIndex);

  return highlighted;
}

/**
 * Convert Fuse.js results to SearchResult format
 */
export function convertToSearchResults(
  fuseResults: Fuse.FuseResult<SearchIndexItem>[],
  filters: SearchFiltersState
): SearchResult[] {
  return fuseResults.map((result) => {
    const item = result.item;
    const score = calculateResultScore(result, filters);

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      url: getResultUrl(item.type, item.id),
      difficulty: item.difficulty,
      category: item.category,
      tags: item.tags,
      score,
      highlights: {
        title: highlightMatches(item.title, result.matches, 'title'),
        description: highlightMatches(item.description, result.matches, 'description'),
        content: highlightMatches(
          item.content.slice(0, 200),
          result.matches,
          'content'
        ),
      },
      metadata: item.metadata,
    };
  });
}

/**
 * Generate URL for a search result based on its type
 */
function getResultUrl(type: string, id: string): string {
  const urlMap: Record<string, string> = {
    lesson: `/lessons/${id}`,
    exercise: `/exercises/${id}`,
    flashcard: `/flashcards`,
    quiz: `/quizzes/${id}`,
  };
  return urlMap[type] || '/';
}

/**
 * Filter search results based on active filters
 */
export function applyFilters(
  results: SearchResult[],
  filters: SearchFiltersState
): SearchResult[] {
  let filtered = [...results];

  // Filter by type
  if (filters.type !== 'all') {
    filtered = filtered.filter((r) => r.type === filters.type);
  }

  // Filter by difficulty
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter((r) => r.difficulty === filters.difficulty);
  }

  // Filter by category
  if (filters.category !== 'all') {
    filtered = filtered.filter((r) => r.category === filters.category);
  }

  // Filter by track
  if (filters.track && filters.track !== 'all') {
    filtered = filtered.filter(
      (r) =>
        r.metadata?.track === filters.track ||
        r.metadata?.track === 'both'
    );
  }

  return filtered;
}

/**
 * Sort search results by score (descending)
 */
export function sortByRelevance(results: SearchResult[]): SearchResult[] {
  return [...results].sort((a, b) => (b.score || 0) - (a.score || 0));
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Extract keywords from text for better searchability
 */
export function extractKeywords(text: string): string[] {
  // Remove special characters and split into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2);

  // Remove duplicates
  return Array.from(new Set(words));
}

/**
 * Generate search suggestions based on query
 */
export function generateSuggestions(
  query: string,
  allItems: SearchIndexItem[]
): string[] {
  if (!query || query.length < 2) return [];

  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  // Find matching titles and categories
  allItems.forEach((item) => {
    if (item.title.toLowerCase().includes(queryLower)) {
      suggestions.add(item.title);
    }
    if (item.category.toLowerCase().includes(queryLower)) {
      suggestions.add(item.category);
    }
    // Check tags
    item.tags.forEach((tag) => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.add(tag);
      }
    });
  });

  // Return top 5 suggestions
  return Array.from(suggestions).slice(0, 5);
}
