import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ContentType = 'lesson' | 'quiz' | 'exercise' | 'flashcard';
export type ContentStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface ContentMetadata {
  id: string;
  title: string;
  type: ContentType;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  scheduledFor?: string;
  author: {
    id: string;
    name: string;
  };
  category?: string;
  tags?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface LessonContent {
  id: string;
  title: string;
  description: string;
  content: string; // Markdown content
  duration: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  tags: string[];
  prerequisites: string[]; // lesson IDs
  learningObjectives: string[];
  images: string[];
  videos: string[];
  status: ContentStatus;
  version: number;
  versionHistory: LessonVersion[];
  scheduledFor?: string;
  track?: '30-day' | '60-day' | 'both';
}

export interface LessonVersion {
  version: number;
  content: string;
  updatedAt: string;
  updatedBy: string;
  changeNote?: string;
}

export interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  image?: string;
  points: number;
}

export interface QuizContent {
  id: string;
  title: string;
  description: string;
  timeLimit: number; // in minutes
  passingScore: number; // percentage
  questions: QuizQuestion[];
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: ContentStatus;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showFeedback: boolean;
  allowRetry: boolean;
  scheduledFor?: string;
}

export interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  description?: string;
  isHidden?: boolean; // Hidden test cases for validation
}

export interface ExerciseContent {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  language: 'typescript' | 'javascript' | 'java';
  starterCode: string;
  solutionCode: string;
  testCases: TestCase[];
  hints: string[];
  learningObjectives: string[];
  category: string;
  tags: string[];
  status: ContentStatus;
  timeEstimate: number; // in minutes
  scheduledFor?: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  cards: FlashcardItem[];
  status: ContentStatus;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scheduledFor?: string;
}

export interface FlashcardItem {
  id: string;
  front: string;
  back: string;
  category?: string;
  tags?: string[];
}

export interface UploadProgress {
  fileName: string;
  progress: number;
  status: 'uploading' | 'complete' | 'error';
  url?: string;
  error?: string;
}

interface AdminContentState {
  // Content list
  contentList: ContentMetadata[];
  filteredContent: ContentMetadata[];
  filters: {
    type?: ContentType;
    status?: ContentStatus;
    search?: string;
    category?: string;
    tags?: string[];
  };

  // Currently editing content
  currentLesson: LessonContent | null;
  currentQuiz: QuizContent | null;
  currentExercise: ExerciseContent | null;
  currentFlashcardDeck: FlashcardDeck | null;

  // Draft auto-save
  lastAutoSave: string | null;
  hasUnsavedChanges: boolean;

  // Upload state
  uploadProgress: Record<string, UploadProgress>;

  // UI state
  isLoading: boolean;
  error: string | null;
  selectedContentIds: string[];

  // Actions
  setContentList: (content: ContentMetadata[]) => void;
  setFilters: (filters: Partial<AdminContentState['filters']>) => void;
  applyFilters: () => void;

  // Lesson actions
  setCurrentLesson: (lesson: LessonContent | null) => void;
  updateLessonField: <K extends keyof LessonContent>(
    field: K,
    value: LessonContent[K]
  ) => void;
  saveLessonDraft: () => void;
  publishLesson: () => Promise<void>;

  // Quiz actions
  setCurrentQuiz: (quiz: QuizContent | null) => void;
  updateQuizField: <K extends keyof QuizContent>(
    field: K,
    value: QuizContent[K]
  ) => void;
  addQuizQuestion: (question: QuizQuestion) => void;
  updateQuizQuestion: (questionId: string, updates: Partial<QuizQuestion>) => void;
  deleteQuizQuestion: (questionId: string) => void;
  reorderQuizQuestions: (startIndex: number, endIndex: number) => void;
  saveQuizDraft: () => void;
  publishQuiz: () => Promise<void>;

  // Exercise actions
  setCurrentExercise: (exercise: ExerciseContent | null) => void;
  updateExerciseField: <K extends keyof ExerciseContent>(
    field: K,
    value: ExerciseContent[K]
  ) => void;
  addTestCase: (testCase: TestCase) => void;
  updateTestCase: (testCaseId: string, updates: Partial<TestCase>) => void;
  deleteTestCase: (testCaseId: string) => void;
  addHint: (hint: string) => void;
  updateHint: (index: number, hint: string) => void;
  deleteHint: (index: number) => void;
  saveExerciseDraft: () => void;
  publishExercise: () => Promise<void>;

  // Flashcard actions
  setCurrentFlashcardDeck: (deck: FlashcardDeck | null) => void;
  updateFlashcardDeckField: <K extends keyof FlashcardDeck>(
    field: K,
    value: FlashcardDeck[K]
  ) => void;
  addFlashcard: (card: FlashcardItem) => void;
  updateFlashcard: (cardId: string, updates: Partial<FlashcardItem>) => void;
  deleteFlashcard: (cardId: string) => void;
  bulkImportFlashcards: (cards: Omit<FlashcardItem, 'id'>[]) => void;
  saveFlashcardDeckDraft: () => void;
  publishFlashcardDeck: () => Promise<void>;

  // Media upload
  addUploadProgress: (fileName: string, progress: UploadProgress) => void;
  updateUploadProgress: (fileName: string, updates: Partial<UploadProgress>) => void;
  removeUploadProgress: (fileName: string) => void;

  // Bulk operations
  selectContent: (contentId: string) => void;
  deselectContent: (contentId: string) => void;
  selectAllContent: () => void;
  deselectAllContent: () => void;
  bulkPublish: (contentIds: string[]) => Promise<void>;
  bulkUnpublish: (contentIds: string[]) => Promise<void>;
  bulkDelete: (contentIds: string[]) => Promise<void>;

  // Utility
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  markAsUnsaved: () => void;
  markAsSaved: () => void;
  resetEditor: () => void;
}

const useAdminContentStore = create<AdminContentState>()(
  persist(
    (set, get) => ({
      // Initial state
      contentList: [],
      filteredContent: [],
      filters: {},
      currentLesson: null,
      currentQuiz: null,
      currentExercise: null,
      currentFlashcardDeck: null,
      lastAutoSave: null,
      hasUnsavedChanges: false,
      uploadProgress: {},
      isLoading: false,
      error: null,
      selectedContentIds: [],

      // Actions
      setContentList: (content) => set({ contentList: content }),

      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      applyFilters: () => {
        const { contentList, filters } = get();
        let filtered = [...contentList];

        if (filters.type) {
          filtered = filtered.filter((c) => c.type === filters.type);
        }

        if (filters.status) {
          filtered = filtered.filter((c) => c.status === filters.status);
        }

        if (filters.category) {
          filtered = filtered.filter((c) => c.category === filters.category);
        }

        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter((c) =>
            filters.tags!.some((tag) => c.tags?.includes(tag))
          );
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(
            (c) =>
              c.title.toLowerCase().includes(searchLower) ||
              c.tags?.some((tag) => tag.toLowerCase().includes(searchLower))
          );
        }

        set({ filteredContent: filtered });
      },

      // Lesson actions
      setCurrentLesson: (lesson) =>
        set({ currentLesson: lesson, hasUnsavedChanges: false }),

      updateLessonField: (field, value) =>
        set((state) => ({
          currentLesson: state.currentLesson
            ? { ...state.currentLesson, [field]: value }
            : null,
          hasUnsavedChanges: true,
        })),

      saveLessonDraft: () => {
        const { currentLesson } = get();
        if (currentLesson) {
          // Save to localStorage or backend
          set({
            lastAutoSave: new Date().toISOString(),
            hasUnsavedChanges: false,
          });
        }
      },

      publishLesson: async () => {
        const { currentLesson } = get();
        if (!currentLesson) return;

        set({ isLoading: true, error: null });
        try {
          // API call to publish lesson
          const response = await fetch('/api/admin/lessons', {
            method: currentLesson.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...currentLesson, status: 'published' }),
          });

          if (!response.ok) throw new Error('Failed to publish lesson');

          set({
            currentLesson: null,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Quiz actions
      setCurrentQuiz: (quiz) =>
        set({ currentQuiz: quiz, hasUnsavedChanges: false }),

      updateQuizField: (field, value) =>
        set((state) => ({
          currentQuiz: state.currentQuiz
            ? { ...state.currentQuiz, [field]: value }
            : null,
          hasUnsavedChanges: true,
        })),

      addQuizQuestion: (question) =>
        set((state) => ({
          currentQuiz: state.currentQuiz
            ? {
                ...state.currentQuiz,
                questions: [...state.currentQuiz.questions, question],
              }
            : null,
          hasUnsavedChanges: true,
        })),

      updateQuizQuestion: (questionId, updates) =>
        set((state) => ({
          currentQuiz: state.currentQuiz
            ? {
                ...state.currentQuiz,
                questions: state.currentQuiz.questions.map((q) =>
                  q.id === questionId ? { ...q, ...updates } : q
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      deleteQuizQuestion: (questionId) =>
        set((state) => ({
          currentQuiz: state.currentQuiz
            ? {
                ...state.currentQuiz,
                questions: state.currentQuiz.questions.filter(
                  (q) => q.id !== questionId
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      reorderQuizQuestions: (startIndex, endIndex) =>
        set((state) => {
          if (!state.currentQuiz) return state;

          const questions = [...state.currentQuiz.questions];
          const [removed] = questions.splice(startIndex, 1);
          questions.splice(endIndex, 0, removed);

          return {
            currentQuiz: { ...state.currentQuiz, questions },
            hasUnsavedChanges: true,
          };
        }),

      saveQuizDraft: () => {
        const { currentQuiz } = get();
        if (currentQuiz) {
          set({
            lastAutoSave: new Date().toISOString(),
            hasUnsavedChanges: false,
          });
        }
      },

      publishQuiz: async () => {
        const { currentQuiz } = get();
        if (!currentQuiz) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/quizzes', {
            method: currentQuiz.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...currentQuiz, status: 'published' }),
          });

          if (!response.ok) throw new Error('Failed to publish quiz');

          set({
            currentQuiz: null,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Exercise actions
      setCurrentExercise: (exercise) =>
        set({ currentExercise: exercise, hasUnsavedChanges: false }),

      updateExerciseField: (field, value) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? { ...state.currentExercise, [field]: value }
            : null,
          hasUnsavedChanges: true,
        })),

      addTestCase: (testCase) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                testCases: [...state.currentExercise.testCases, testCase],
              }
            : null,
          hasUnsavedChanges: true,
        })),

      updateTestCase: (testCaseId, updates) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                testCases: state.currentExercise.testCases.map((tc) =>
                  tc.id === testCaseId ? { ...tc, ...updates } : tc
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      deleteTestCase: (testCaseId) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                testCases: state.currentExercise.testCases.filter(
                  (tc) => tc.id !== testCaseId
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      addHint: (hint) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                hints: [...state.currentExercise.hints, hint],
              }
            : null,
          hasUnsavedChanges: true,
        })),

      updateHint: (index, hint) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                hints: state.currentExercise.hints.map((h, i) =>
                  i === index ? hint : h
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      deleteHint: (index) =>
        set((state) => ({
          currentExercise: state.currentExercise
            ? {
                ...state.currentExercise,
                hints: state.currentExercise.hints.filter((_, i) => i !== index),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      saveExerciseDraft: () => {
        const { currentExercise } = get();
        if (currentExercise) {
          set({
            lastAutoSave: new Date().toISOString(),
            hasUnsavedChanges: false,
          });
        }
      },

      publishExercise: async () => {
        const { currentExercise } = get();
        if (!currentExercise) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/exercises', {
            method: currentExercise.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...currentExercise, status: 'published' }),
          });

          if (!response.ok) throw new Error('Failed to publish exercise');

          set({
            currentExercise: null,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Flashcard actions
      setCurrentFlashcardDeck: (deck) =>
        set({ currentFlashcardDeck: deck, hasUnsavedChanges: false }),

      updateFlashcardDeckField: (field, value) =>
        set((state) => ({
          currentFlashcardDeck: state.currentFlashcardDeck
            ? { ...state.currentFlashcardDeck, [field]: value }
            : null,
          hasUnsavedChanges: true,
        })),

      addFlashcard: (card) =>
        set((state) => ({
          currentFlashcardDeck: state.currentFlashcardDeck
            ? {
                ...state.currentFlashcardDeck,
                cards: [...state.currentFlashcardDeck.cards, card],
              }
            : null,
          hasUnsavedChanges: true,
        })),

      updateFlashcard: (cardId, updates) =>
        set((state) => ({
          currentFlashcardDeck: state.currentFlashcardDeck
            ? {
                ...state.currentFlashcardDeck,
                cards: state.currentFlashcardDeck.cards.map((c) =>
                  c.id === cardId ? { ...c, ...updates } : c
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      deleteFlashcard: (cardId) =>
        set((state) => ({
          currentFlashcardDeck: state.currentFlashcardDeck
            ? {
                ...state.currentFlashcardDeck,
                cards: state.currentFlashcardDeck.cards.filter(
                  (c) => c.id !== cardId
                ),
              }
            : null,
          hasUnsavedChanges: true,
        })),

      bulkImportFlashcards: (cards) =>
        set((state) => ({
          currentFlashcardDeck: state.currentFlashcardDeck
            ? {
                ...state.currentFlashcardDeck,
                cards: [
                  ...state.currentFlashcardDeck.cards,
                  ...cards.map((card, index) => ({
                    ...card,
                    id: `card-${Date.now()}-${index}`,
                  })),
                ],
              }
            : null,
          hasUnsavedChanges: true,
        })),

      saveFlashcardDeckDraft: () => {
        const { currentFlashcardDeck } = get();
        if (currentFlashcardDeck) {
          set({
            lastAutoSave: new Date().toISOString(),
            hasUnsavedChanges: false,
          });
        }
      },

      publishFlashcardDeck: async () => {
        const { currentFlashcardDeck } = get();
        if (!currentFlashcardDeck) return;

        set({ isLoading: true, error: null });
        try {
          const response = await fetch('/api/admin/flashcards', {
            method: currentFlashcardDeck.id ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...currentFlashcardDeck,
              status: 'published',
            }),
          });

          if (!response.ok) throw new Error('Failed to publish flashcard deck');

          set({
            currentFlashcardDeck: null,
            hasUnsavedChanges: false,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Media upload
      addUploadProgress: (fileName, progress) =>
        set((state) => ({
          uploadProgress: { ...state.uploadProgress, [fileName]: progress },
        })),

      updateUploadProgress: (fileName, updates) =>
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [fileName]: { ...state.uploadProgress[fileName], ...updates },
          },
        })),

      removeUploadProgress: (fileName) =>
        set((state) => {
          const { [fileName]: _, ...rest } = state.uploadProgress;
          return { uploadProgress: rest };
        }),

      // Bulk operations
      selectContent: (contentId) =>
        set((state) => ({
          selectedContentIds: [...state.selectedContentIds, contentId],
        })),

      deselectContent: (contentId) =>
        set((state) => ({
          selectedContentIds: state.selectedContentIds.filter(
            (id) => id !== contentId
          ),
        })),

      selectAllContent: () =>
        set((state) => ({
          selectedContentIds: state.filteredContent.map((c) => c.id),
        })),

      deselectAllContent: () => set({ selectedContentIds: [] }),

      bulkPublish: async (contentIds) => {
        set({ isLoading: true, error: null });
        try {
          await Promise.all(
            contentIds.map((id) =>
              fetch(`/api/admin/content/${id}/publish`, { method: 'POST' })
            )
          );
          set({ isLoading: false, selectedContentIds: [] });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      bulkUnpublish: async (contentIds) => {
        set({ isLoading: true, error: null });
        try {
          await Promise.all(
            contentIds.map((id) =>
              fetch(`/api/admin/content/${id}/unpublish`, { method: 'POST' })
            )
          );
          set({ isLoading: false, selectedContentIds: [] });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      bulkDelete: async (contentIds) => {
        set({ isLoading: true, error: null });
        try {
          await Promise.all(
            contentIds.map((id) =>
              fetch(`/api/admin/content/${id}`, { method: 'DELETE' })
            )
          );
          set({ isLoading: false, selectedContentIds: [] });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : 'Unknown error',
            isLoading: false,
          });
        }
      },

      // Utility
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      markAsUnsaved: () => set({ hasUnsavedChanges: true }),
      markAsSaved: () =>
        set({
          hasUnsavedChanges: false,
          lastAutoSave: new Date().toISOString(),
        }),

      resetEditor: () =>
        set({
          currentLesson: null,
          currentQuiz: null,
          currentExercise: null,
          currentFlashcardDeck: null,
          hasUnsavedChanges: false,
          lastAutoSave: null,
          error: null,
        }),
    }),
    {
      name: 'admin-content-storage',
      partialize: (state) => ({
        filters: state.filters,
        lastAutoSave: state.lastAutoSave,
      }),
    }
  )
);

export default useAdminContentStore;
