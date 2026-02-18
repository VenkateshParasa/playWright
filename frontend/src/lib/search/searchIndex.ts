import Fuse from 'fuse.js';
import { SearchIndexItem, SearchResultType } from '../../types/search.types';
import { Lesson } from '../../types/lesson.types';
import { FlashCard } from '../../types/flashcard.types';
import { extractKeywords, DEFAULT_SEARCH_OPTIONS } from './searchAlgorithm';

/**
 * SearchIndex class for managing and searching all content
 */
export class SearchIndex {
  private fuseInstance: Fuse<SearchIndexItem> | null = null;
  private indexedItems: SearchIndexItem[] = [];

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the search index
   */
  private async initialize() {
    await this.buildIndex();
  }

  /**
   * Build the search index from all content types
   */
  async buildIndex(): Promise<void> {
    try {
      // In production, fetch from API
      // For now, we'll index from stores
      const lessons = await this.indexLessons();
      const flashcards = await this.indexFlashcards();
      const exercises = await this.indexExercises();
      const quizzes = await this.indexQuizzes();

      this.indexedItems = [...lessons, ...flashcards, ...exercises, ...quizzes];

      // Create Fuse instance
      this.fuseInstance = new Fuse(this.indexedItems, DEFAULT_SEARCH_OPTIONS);
    } catch (error) {
      console.error('Error building search index:', error);
    }
  }

  /**
   * Index lessons
   */
  private async indexLessons(): Promise<SearchIndexItem[]> {
    try {
      // Import mock data
      const { mockLessons } = await import('../../data/mockLessons');

      return mockLessons.map((lesson: Lesson) => ({
        id: lesson.id,
        type: 'lesson' as SearchResultType,
        title: lesson.title,
        description: lesson.description,
        content: `${lesson.title} ${lesson.description} ${lesson.topics.join(' ')} ${lesson.learningObjectives.join(' ')}`,
        category: `Week ${lesson.week}`,
        tags: lesson.tags.map((t) => t.name),
        difficulty: lesson.difficulty,
        keywords: [
          ...extractKeywords(lesson.title),
          ...extractKeywords(lesson.description),
          ...lesson.topics.flatMap((t) => extractKeywords(t)),
          ...lesson.tags.map((t) => t.name.toLowerCase()),
        ],
        metadata: {
          week: lesson.week,
          module: lesson.module,
          duration: lesson.estimatedDuration,
          track: lesson.track,
          status: lesson.status,
          order: lesson.order,
        },
      }));
    } catch (error) {
      console.error('Error indexing lessons:', error);
      return [];
    }
  }

  /**
   * Index flashcards
   */
  private async indexFlashcards(): Promise<SearchIndexItem[]> {
    try {
      const { mockFlashcards } = await import('../../data/mockFlashcards');

      return mockFlashcards.map((card: FlashCard) => ({
        id: card.id,
        type: 'flashcard' as SearchResultType,
        title: card.front,
        description: card.back.slice(0, 150),
        content: `${card.front} ${card.back}`,
        category: card.category,
        tags: card.tags,
        difficulty: card.difficulty,
        keywords: [
          ...extractKeywords(card.front),
          ...extractKeywords(card.back),
          ...card.tags.flatMap((t) => extractKeywords(t)),
        ],
        metadata: {
          category: card.category,
          successRate: card.successRate,
          repetitions: card.repetitions,
        },
      }));
    } catch (error) {
      console.error('Error indexing flashcards:', error);
      return [];
    }
  }

  /**
   * Index exercises (placeholder)
   */
  private async indexExercises(): Promise<SearchIndexItem[]> {
    // TODO: Implement when exercise data is available
    return [];
  }

  /**
   * Index quizzes
   */
  private async indexQuizzes(): Promise<SearchIndexItem[]> {
    try {
      const { mockQuizzes } = await import('../../data/mockQuizzes');

      return mockQuizzes.map((quiz: any) => ({
        id: quiz.id,
        type: 'quiz' as SearchResultType,
        title: quiz.title,
        description: quiz.description,
        content: `${quiz.title} ${quiz.description}`,
        category: `Week ${quiz.week}`,
        tags: quiz.tags || [],
        difficulty: quiz.difficulty,
        keywords: [
          ...extractKeywords(quiz.title),
          ...extractKeywords(quiz.description),
        ],
        metadata: {
          week: quiz.week,
          duration: quiz.timeLimit,
          totalQuestions: quiz.totalQuestions,
          passingScore: quiz.passingScore,
        },
      }));
    } catch (error) {
      console.error('Error indexing quizzes:', error);
      return [];
    }
  }

  /**
   * Search the index
   */
  search(query: string, limit: number = 20): Fuse.FuseResult<SearchIndexItem>[] {
    if (!this.fuseInstance || !query.trim()) {
      return [];
    }

    const results = this.fuseInstance.search(query, { limit });
    return results;
  }

  /**
   * Get all indexed items
   */
  getAllItems(): SearchIndexItem[] {
    return this.indexedItems;
  }

  /**
   * Get items by type
   */
  getItemsByType(type: SearchResultType): SearchIndexItem[] {
    return this.indexedItems.filter((item) => item.type === type);
  }

  /**
   * Get all categories
   */
  getCategories(): string[] {
    const categories = new Set(this.indexedItems.map((item) => item.category));
    return Array.from(categories).sort();
  }

  /**
   * Get all tags
   */
  getTags(): string[] {
    const tags = new Set(this.indexedItems.flatMap((item) => item.tags));
    return Array.from(tags).sort();
  }

  /**
   * Rebuild index (useful for updates)
   */
  async rebuild(): Promise<void> {
    await this.buildIndex();
  }

  /**
   * Clear the index
   */
  clear(): void {
    this.indexedItems = [];
    this.fuseInstance = null;
  }
}

// Singleton instance
let searchIndexInstance: SearchIndex | null = null;

/**
 * Get or create the search index instance
 */
export function getSearchIndex(): SearchIndex {
  if (!searchIndexInstance) {
    searchIndexInstance = new SearchIndex();
  }
  return searchIndexInstance;
}

/**
 * Rebuild the search index
 */
export async function rebuildSearchIndex(): Promise<void> {
  const index = getSearchIndex();
  await index.rebuild();
}
