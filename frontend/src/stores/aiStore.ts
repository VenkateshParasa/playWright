/**
 * AI Features Store
 * State management for AI-powered features
 */

import { create } from 'zustand';

interface Recommendation {
  item: any;
  score: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

interface LearningPath {
  currentLevel: string;
  recommendedPath: string[];
  skippableContent: string[];
  requiredRemediation: string[];
  paceSuggestion: 'fast-track' | 'normal' | 'slower';
  difficultyAdjustment: 'easier' | 'same' | 'harder';
}

interface PerformancePrediction {
  predictedScore: number;
  confidence: number;
  factors: Array<{ factor: string; impact: number }>;
  recommendation: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface LearningPattern {
  optimalStudyTime: { hour: number; dayOfWeek: number; confidence: number };
  learningStyle: { type: string; confidence: number; indicators: string[] };
  sessionQuality: { avgDuration: number; avgProductivity: number; optimalDuration: number };
  productivityMetrics: { xpPerHour: number; completionRate: number; consistencyScore: number };
}

interface AIState {
  // Recommendations
  recommendations: Recommendation[];
  nextLesson: Recommendation | null;
  flashcardsToReview: any[];
  loadingRecommendations: boolean;

  // Adaptive Learning
  learningPath: LearningPath | null;
  performanceAnalysis: any;
  loadingAdaptive: boolean;

  // Predictions
  quizPredictions: Map<string, PerformancePrediction>;
  dropoutRisk: any;
  learningEfficiency: any;
  loadingPredictions: boolean;

  // Code Analysis
  codeAnalysis: any;
  loadingAnalysis: boolean;

  // Chatbot
  chatMessages: ChatMessage[];
  chatLoading: boolean;

  // Learning Patterns
  learningPatterns: LearningPattern | null;
  studyRecommendations: string[];
  loadingPatterns: boolean;

  // Actions
  fetchRecommendations: (type?: string, limit?: number) => Promise<void>;
  fetchNextLesson: () => Promise<void>;
  fetchFlashcardsToReview: (limit?: number) => Promise<void>;

  fetchLearningPath: () => Promise<void>;
  fetchPerformanceAnalysis: () => Promise<void>;

  predictQuizScore: (quizId: string) => Promise<void>;
  fetchDropoutRisk: () => Promise<void>;
  fetchLearningEfficiency: () => Promise<void>;

  analyzeCode: (code: string, language: string, exerciseId?: string) => Promise<void>;

  sendChatMessage: (message: string, context?: any) => Promise<void>;
  clearChatHistory: () => void;

  fetchLearningPatterns: () => Promise<void>;

  reset: () => void;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const useAIStore = create<AIState>((set, get) => ({
  // Initial State
  recommendations: [],
  nextLesson: null,
  flashcardsToReview: [],
  loadingRecommendations: false,

  learningPath: null,
  performanceAnalysis: null,
  loadingAdaptive: false,

  quizPredictions: new Map(),
  dropoutRisk: null,
  learningEfficiency: null,
  loadingPredictions: false,

  codeAnalysis: null,
  loadingAnalysis: false,

  chatMessages: [],
  chatLoading: false,

  learningPatterns: null,
  studyRecommendations: [],
  loadingPatterns: false,

  // Recommendations Actions
  fetchRecommendations: async (type?: string, limit?: number) => {
    set({ loadingRecommendations: true });
    try {
      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (limit) params.append('limit', limit.toString());

      const response = await fetch(`${API_BASE}/ai/recommendations?${params}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch recommendations');

      const data = await response.json();
      set({ recommendations: data.recommendations });
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  fetchNextLesson: async () => {
    set({ loadingRecommendations: true });
    try {
      const response = await fetch(`${API_BASE}/ai/recommendations/next-lesson`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch next lesson');

      const data = await response.json();
      set({ nextLesson: data.recommendations[0] || null });
    } catch (error) {
      console.error('Error fetching next lesson:', error);
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  fetchFlashcardsToReview: async (limit?: number) => {
    set({ loadingRecommendations: true });
    try {
      const params = limit ? `?limit=${limit}` : '';
      const response = await fetch(`${API_BASE}/ai/recommendations/flashcards${params}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch flashcards');

      const data = await response.json();
      set({ flashcardsToReview: data.cards });
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      set({ loadingRecommendations: false });
    }
  },

  // Adaptive Learning Actions
  fetchLearningPath: async () => {
    set({ loadingAdaptive: true });
    try {
      const response = await fetch(`${API_BASE}/ai/adaptive/learning-path`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch learning path');

      const data = await response.json();
      set({ learningPath: data.learningPath });
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      set({ loadingAdaptive: false });
    }
  },

  fetchPerformanceAnalysis: async () => {
    set({ loadingAdaptive: true });
    try {
      const response = await fetch(`${API_BASE}/ai/adaptive/performance-analysis`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch performance analysis');

      const data = await response.json();
      set({ performanceAnalysis: data.analysis });
    } catch (error) {
      console.error('Error fetching performance analysis:', error);
    } finally {
      set({ loadingAdaptive: false });
    }
  },

  // Prediction Actions
  predictQuizScore: async (quizId: string) => {
    set({ loadingPredictions: true });
    try {
      const response = await fetch(`${API_BASE}/ai/predict/quiz-score/${quizId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to predict quiz score');

      const data = await response.json();
      const predictions = new Map(get().quizPredictions);
      predictions.set(quizId, data.prediction);
      set({ quizPredictions: predictions });
    } catch (error) {
      console.error('Error predicting quiz score:', error);
    } finally {
      set({ loadingPredictions: false });
    }
  },

  fetchDropoutRisk: async () => {
    set({ loadingPredictions: true });
    try {
      const response = await fetch(`${API_BASE}/ai/predict/dropout-risk`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch dropout risk');

      const data = await response.json();
      set({ dropoutRisk: data.risk });
    } catch (error) {
      console.error('Error fetching dropout risk:', error);
    } finally {
      set({ loadingPredictions: false });
    }
  },

  fetchLearningEfficiency: async () => {
    set({ loadingPredictions: true });
    try {
      const response = await fetch(`${API_BASE}/ai/predict/learning-efficiency`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch learning efficiency');

      const data = await response.json();
      set({ learningEfficiency: data.efficiency });
    } catch (error) {
      console.error('Error fetching learning efficiency:', error);
    } finally {
      set({ loadingPredictions: false });
    }
  },

  // Code Analysis Actions
  analyzeCode: async (code: string, language: string, exerciseId?: string) => {
    set({ loadingAnalysis: true });
    try {
      const response = await fetch(`${API_BASE}/ai/code-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ code, language, exerciseId }),
      });

      if (!response.ok) throw new Error('Failed to analyze code');

      const data = await response.json();
      set({ codeAnalysis: data.analysis });
    } catch (error) {
      console.error('Error analyzing code:', error);
    } finally {
      set({ loadingAnalysis: false });
    }
  },

  // Chatbot Actions
  sendChatMessage: async (message: string, context?: any) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    set((state) => ({
      chatMessages: [...state.chatMessages, userMessage],
      chatLoading: true,
    }));

    try {
      const response = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ message, context }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const data = await response.json();
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response.message,
        timestamp: new Date(),
      };

      set((state) => ({
        chatMessages: [...state.chatMessages, assistantMessage],
      }));
    } catch (error) {
      console.error('Error sending chat message:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      set((state) => ({
        chatMessages: [...state.chatMessages, errorMessage],
      }));
    } finally {
      set({ chatLoading: false });
    }
  },

  clearChatHistory: () => {
    set({ chatMessages: [] });
    fetch(`${API_BASE}/ai/chat/history`, {
      method: 'DELETE',
      credentials: 'include',
    }).catch(console.error);
  },

  // Learning Patterns Actions
  fetchLearningPatterns: async () => {
    set({ loadingPatterns: true });
    try {
      const response = await fetch(`${API_BASE}/ai/patterns/recommendations`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch learning patterns');

      const data = await response.json();
      set({
        learningPatterns: data.patterns,
        studyRecommendations: data.recommendations,
      });
    } catch (error) {
      console.error('Error fetching learning patterns:', error);
    } finally {
      set({ loadingPatterns: false });
    }
  },

  // Reset
  reset: () => {
    set({
      recommendations: [],
      nextLesson: null,
      flashcardsToReview: [],
      learningPath: null,
      performanceAnalysis: null,
      quizPredictions: new Map(),
      dropoutRisk: null,
      learningEfficiency: null,
      codeAnalysis: null,
      chatMessages: [],
      learningPatterns: null,
      studyRecommendations: [],
    });
  },
}));
