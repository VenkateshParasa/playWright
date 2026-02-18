export interface FlashCard {
  id: string;
  front: string;
  back: string;
  category: string;
  tags: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  dueDate: Date;
  interval: number;
  easinessFactor: number;
  repetitions: number;
  lastReviewed?: Date;
  successRate?: number;
}

export interface ReviewSession {
  id: string;
  startTime: Date;
  endTime?: Date;
  cardsReviewed: number;
  totalCards: number;
  correctCount: number;
  timeSpent: number;
  reviews: CardReview[];
}

export interface CardReview {
  cardId: string;
  quality: number; // 0-5
  timeSpent: number;
  timestamp: Date;
}

export interface SessionState {
  currentSession: ReviewSession | null;
  currentCardIndex: number;
  isFlipped: boolean;
  isPaused: boolean;
  undoHistory: CardReview[];
}

export type QualityRating = 0 | 1 | 2 | 3 | 4 | 5;

export const QUALITY_LABELS = {
  0: 'Complete Blackout',
  1: 'Incorrect',
  2: 'Hard to Recall',
  3: 'Recalled with Difficulty',
  4: 'Recalled with Hesitation',
  5: 'Perfect Recall'
};

export const MOTIVATIONAL_MESSAGES = [
  "Great progress! Keep it up!",
  "You're on fire! 🔥",
  "Excellent work!",
  "You're crushing it!",
  "Amazing effort!",
  "Keep up the momentum!",
  "Outstanding performance!",
  "You're doing great!",
  "Fantastic recall!",
  "Brilliant work!",
  "You're a learning machine!",
  "Superb effort!"
];
