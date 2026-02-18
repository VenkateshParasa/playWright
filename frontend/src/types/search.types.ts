export type SearchResultType = 'lesson' | 'exercise' | 'flashcard' | 'quiz';

export type SearchDifficulty = 'easy' | 'medium' | 'hard' | 'all';

export interface SearchResult {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  url: string;
  difficulty?: SearchDifficulty;
  category?: string;
  tags?: string[];
  highlights?: {
    title?: string;
    description?: string;
    content?: string;
  };
  score?: number;
  metadata?: {
    week?: number;
    module?: number;
    duration?: number;
    track?: string;
    status?: string;
  };
}

export interface SearchFiltersState {
  type: SearchResultType | 'all';
  difficulty: SearchDifficulty;
  category: string | 'all';
  track?: '30-day' | '60-day' | 'both' | 'all';
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: SearchResultType;
  count?: number;
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface SearchAnalytics {
  query: string;
  timestamp: Date;
  resultsCount: number;
  filters: SearchFiltersState;
  selectedResultId?: string;
  selectedResultType?: SearchResultType;
}

export interface SearchIndexItem {
  id: string;
  type: SearchResultType;
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  difficulty?: SearchDifficulty;
  keywords: string[];
  metadata: Record<string, any>;
}

export interface SearchOptions {
  threshold?: number;
  limit?: number;
  includeScore?: boolean;
  includeMatches?: boolean;
  minMatchCharLength?: number;
  ignoreLocation?: boolean;
  keys?: string[];
}

export interface SearchState {
  query: string;
  results: SearchResult[];
  suggestions: SearchSuggestion[];
  recentSearches: RecentSearch[];
  filters: SearchFiltersState;
  isLoading: boolean;
  isOpen: boolean;
  analytics: SearchAnalytics[];
  selectedIndex: number;
}
