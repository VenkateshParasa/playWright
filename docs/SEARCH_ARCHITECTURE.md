# Global Search Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐    │
│  │                         Header Component                            │    │
│  │  ┌──────────┐    Keyboard: Cmd/Ctrl+K                              │    │
│  │  │ 🔍 Icon  │ ───────────────────────────────────────────┐         │    │
│  │  └──────────┘                                              │         │    │
│  └────────────────────────────────────────────────────────────┼─────────┘    │
│                                                                ▼              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      GlobalSearch Modal                              │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │                       SearchBar                                │  │   │
│  │  │  [🔍 Search lessons, exercises, flashcards...]     [Clear]    │  │   │
│  │  │                                                                 │  │   │
│  │  │  Debounce: 300ms ───────────────────────────────┐              │  │   │
│  │  └─────────────────────────────────────────────────┼──────────────┘  │   │
│  │                                                      ▼                 │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                   SearchResults                               │   │   │
│  │  │  ┌────────────────────────────────────────────────────┐      │   │   │
│  │  │  │ 📄 Lesson: Introduction to Playwright       >      │      │   │   │
│  │  │  │    Learn the basics... [Beginner] [Week 1]         │      │   │   │
│  │  │  │    keyboard-nav-selected: selectedIndex            │      │   │   │
│  │  │  ├────────────────────────────────────────────────────┤      │   │   │
│  │  │  │ 💻 Exercise: Page Object Pattern          >        │      │   │   │
│  │  │  │    Build a POM... [Medium] [Week 3]                │      │   │   │
│  │  │  ├────────────────────────────────────────────────────┤      │   │   │
│  │  │  │ 🎴 Flashcard: What is Playwright?         >        │      │   │   │
│  │  │  │    Test automation framework... [Easy]             │      │   │   │
│  │  │  └────────────────────────────────────────────────────┘      │   │   │
│  │  │  Text Highlighting: <mark>matched terms</mark>                │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                   SearchFilters                               │   │   │
│  │  │  [All Types ▼] [All Levels ▼] [All Tracks ▼]                │   │   │
│  │  │  Active: Type=Lesson, Difficulty=Medium                      │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                 SearchSuggestions                             │   │   │
│  │  │  Recent Searches:                                             │   │   │
│  │  │  🕐 "playwright selectors" - 15 results (2m ago)              │   │   │
│  │  │  🕐 "page object" - 8 results (1h ago)                        │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                       │   │
│  │  Footer: [↑↓ navigate] [Enter select] [Esc close] [42 results]     │   │
│  └───────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                       ▲ ▼
                                       │ │
                                       │ │ State Updates
                                       ▼ │

┌─────────────────────────────────────────────────────────────────────────────┐
│                          STATE MANAGEMENT (Zustand)                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                          searchStore.ts                                │ │
│  │                                                                         │ │
│  │  State:                        Actions:                                │ │
│  │  • query: string               • setQuery()                            │ │
│  │  • results: SearchResult[]     • setResults()                          │ │
│  │  • filters: SearchFilters      • setFilters()                          │ │
│  │  • isOpen: boolean             • openSearch()                          │ │
│  │  • isLoading: boolean          • closeSearch()                         │ │
│  │  • recentSearches[]            • addRecentSearch()                     │ │
│  │  • analytics[]                 • trackAnalytics()                      │ │
│  │  • selectedIndex: number       • moveSelectionUp/Down()                │ │
│  │                                                                         │ │
│  │  Persistence:                  Computed:                               │ │
│  │  • localStorage                • selectResults                         │ │
│  │  • recentSearches (max 10)    • selectSelectedResult                  │ │
│  │  • analytics (max 100)         • selectFilters                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                       ▲ ▼
                                       │ │
                              Search Operations
                                       ▼ │

┌─────────────────────────────────────────────────────────────────────────────┐
│                          SEARCH ENGINE (Fuse.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      searchIndex.ts (Singleton)                        │ │
│  │                                                                         │ │
│  │  Index Building:                                                        │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │ │
│  │  │   Lessons    │  │  Flashcards  │  │   Exercises  │  │  Quizzes  │ │ │
│  │  │  mockLessons │  │mockFlashcards│  │   (future)   │  │mockQuizzes│ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │ │
│  │         │                  │                  │                │       │ │
│  │         └──────────────────┼──────────────────┼────────────────┘       │ │
│  │                            ▼                  ▼                        │ │
│  │                   extractKeywords() + indexing                         │ │
│  │                            │                                            │ │
│  │                            ▼                                            │ │
│  │               ┌────────────────────────────┐                           │ │
│  │               │  Fuse Instance (In-Memory) │                           │ │
│  │               │  • Fuzzy matching          │                           │ │
│  │               │  • Weighted fields         │                           │ │
│  │               │  • Score calculation       │                           │ │
│  │               └────────────────────────────┘                           │ │
│  │                                                                         │ │
│  │  Methods:                                                               │ │
│  │  • search(query, limit)  → Fuse.FuseResult[]                          │ │
│  │  • getAllItems()         → SearchIndexItem[]                          │ │
│  │  • getItemsByType(type)  → SearchIndexItem[]                          │ │
│  │  • getCategories()       → string[]                                    │ │
│  │  • getTags()             → string[]                                    │ │
│  │  • rebuild()             → Promise<void>                               │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                      searchAlgorithm.ts                                │ │
│  │                                                                         │ │
│  │  Fuse.js Configuration:                Result Processing:              │ │
│  │  • threshold: 0.4                       • convertToSearchResults()     │ │
│  │  • minMatchCharLength: 2                • applyFilters()               │ │
│  │  • ignoreLocation: true                 • sortByRelevance()            │ │
│  │  • includeScore: true                   • highlightMatches()           │ │
│  │  • includeMatches: true                 • calculateResultScore()       │ │
│  │                                                                         │ │
│  │  Field Weights:                        Utilities:                      │ │
│  │  • title: 3.0         (highest)        • debounce()                    │ │
│  │  • keywords: 2.5                       • extractKeywords()             │ │
│  │  • tags: 2.0                           • generateSuggestions()         │ │
│  │  • description: 1.5                                                    │ │
│  │  • category: 1.2                                                       │ │
│  │  • content: 1.0       (lowest)                                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                       ▲ ▼
                                       │ │
                                  API Calls
                                       ▼ │

┌─────────────────────────────────────────────────────────────────────────────┐
│                          BACKEND API (Express)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                         search.ts (Routes)                             │ │
│  │                                                                         │ │
│  │  GET  /api/search              → Main search endpoint                 │ │
│  │  GET  /api/search/suggestions  → Autocomplete suggestions             │ │
│  │  GET  /api/search/trending     → Popular searches                     │ │
│  │  POST /api/search/analytics    → Track search events                  │ │
│  │  GET  /api/search/categories   → Get all categories                   │ │
│  │  GET  /api/search/tags         → Get all tags                         │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │                   searchController.ts (Handlers)                       │ │
│  │                                                                         │ │
│  │  • search(req, res)                                                    │ │
│  │    - Validate query                                                    │ │
│  │    - Sanitize input                                                    │ │
│  │    - Apply filters                                                     │ │
│  │    - Paginate results                                                  │ │
│  │    - Return JSON response                                              │ │
│  │                                                                         │ │
│  │  • suggestions(req, res)                                               │ │
│  │    - Partial query matching                                            │ │
│  │    - Return top N suggestions                                          │ │
│  │                                                                         │ │
│  │  • trackAnalytics(req, res)                                            │ │
│  │    - Log search events                                                 │ │
│  │    - Store for analysis                                                │ │
│  │    - Calculate metrics                                                 │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

                                       ▲ ▼
                                       │ │
                                  Future: DB
                                       ▼ │

┌─────────────────────────────────────────────────────────────────────────────┐
│                          DATA LAYER (Future)                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Database Tables:                    Indexes:                               │
│  • lessons                           • full_text_search                     │
│  • exercises                         • category_index                       │
│  • flashcards                        • tag_index                            │
│  • quizzes                           • difficulty_index                     │
│  • search_analytics                                                         │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘

═══════════════════════════════════════════════════════════════════════════════

DATA FLOW EXAMPLE: User searches "playwright"

1. User types "p" → "pl" → "pla" → "play" → "playw" → "playwri" → "playwright"
   │
   ├─→ SearchBar (300ms debounce)
   │
2. After 300ms of no typing:
   │
   ├─→ setQuery("playwright") in searchStore
   │
3. useEffect triggers performSearch()
   │
   ├─→ getSearchIndex().search("playwright", 50)
   │
4. Fuse.js fuzzy search:
   │
   ├─→ Matches: title="Introduction to Playwright" (score: 0.95)
   │   ├─→ Matches: title="Playwright Selectors" (score: 0.92)
   │   ├─→ Matches: description="...playwright framework..." (score: 0.65)
   │
5. convertToSearchResults(fuseResults, filters)
   │
   ├─→ Calculate scores with boosts
   │   ├─→ Title match boost (1.5x)
   │   ├─→ Filter preference boosts
   │
6. applyFilters(results, filters)
   │
   ├─→ Filter by type, difficulty, category
   │
7. sortByRelevance(results)
   │
   ├─→ Sort by final score (descending)
   │
8. setResults(sortedResults)
   │
   ├─→ Store updates
   │   ├─→ Component re-renders
   │   ├─→ SearchResults displays with highlighting
   │
9. User presses Enter or clicks result:
   │
   ├─→ trackAnalytics(query, resultId, resultType)
   │   ├─→ addRecentSearch(query, resultsCount)
   │   ├─→ navigate(result.url)
   │   ├─→ closeSearch()

═══════════════════════════════════════════════════════════════════════════════

PERFORMANCE CHARACTERISTICS:

• Index Build Time:     ~100ms (500 items)
• Search Time:          <50ms (typical query)
• Debounce Delay:       300ms
• Keyboard Latency:     <16ms (instant)
• Re-render Time:       <10ms (optimized)
• Memory Usage:         ~2MB (indexed data)
• Storage Usage:        ~50KB (recent + analytics)

═══════════════════════════════════════════════════════════════════════════════
```
