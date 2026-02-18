/**
 * Quick Reference Guide for SRS Implementation
 * Copy this for quick access to common patterns
 */

// ============================================================================
// IMPORTS
// ============================================================================

// Basic imports
import {
  createNewCard,
  calculateNextReview,
  applyReviewResult,
  type Card,
  type QualityRating,
} from '@/lib/srs';

// Scheduler
import { CardScheduler } from '@/lib/srs';

// All exports
import {
  // Types
  type Card,
  type QualityRating,
  type ReviewResult,
  type Schedule,
  type RetentionStats,
  type WorkloadForecast,
  CardState,

  // Algorithm
  calculateNextReview,
  updateEasinessFactor,
  calculateNextInterval,

  // Scheduler
  CardScheduler,

  // Utils
  createNewCard,
  isCardDue,
  formatDuration,
} from '@/lib/srs';

// ============================================================================
// COMMON PATTERNS
// ============================================================================

// Pattern 1: Create and review a card
function reviewCard() {
  const card = createNewCard('Question', 'Answer');
  const result = calculateNextReview(card, 4); // Quality: 0-5
  const updated = applyReviewResult(card, result);
  return updated;
}

// Pattern 2: Batch review multiple cards
function batchReview(cards: Card[], qualities: QualityRating[]) {
  return cards.map((card, i) => {
    const result = calculateNextReview(card, qualities[i]);
    return applyReviewResult(card, result);
  });
}

// Pattern 3: Get today's due cards
function getTodayCards(cards: Card[]) {
  const scheduler = new CardScheduler();
  const due = scheduler.getDueCards(cards);
  const schedule = scheduler.scheduleTodayCards(cards);
  return { due, schedule };
}

// Pattern 4: Calculate statistics
function getStats(cards: Card[], reviews: any[]) {
  const scheduler = new CardScheduler();
  const retention = scheduler.calculateRetentionRate(cards);
  const stats = scheduler.calculateRetentionStats(cards, reviews);
  const progress = scheduler.getLearningProgress(cards);
  return { retention, stats, progress };
}

// Pattern 5: Predict workload
function predictWorkload(cards: Card[], days: number = 7) {
  const scheduler = new CardScheduler();
  const forecast = scheduler.predictFutureWorkload(cards, days);
  const times = scheduler.getRecommendedStudyTime(cards);
  return { forecast, times };
}

// ============================================================================
// QUALITY RATING GUIDE
// ============================================================================

/**
 * Quality ratings for card reviews:
 *
 * 5 = Perfect response (immediate recall, no hesitation)
 * 4 = Correct response after some hesitation
 * 3 = Correct response with significant difficulty
 * 2 = Incorrect response, but correct answer seemed easy
 * 1 = Incorrect response, correct answer remembered
 * 0 = Complete blackout (no recall at all)
 *
 * Ratings >= 3 are "passing" (increment progress)
 * Ratings < 3 are "failing" (reset progress)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Default configuration
const defaultConfig = {
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
  newCardSteps: [1, 10],
  graduatingInterval: 1,
  easyInterval: 4,
  minimumEasinessFactor: 1.3,
  maximumInterval: 36500,
  hardInterval: 1.2,
  easyBonus: 1.3,
};

// Custom configuration
const customScheduler = new CardScheduler({
  maxNewCardsPerDay: 30,
  maxReviewsPerDay: 150,
  minimumEasinessFactor: 1.5,
});

// ============================================================================
// CARD STATES
// ============================================================================

/**
 * CardState enum values:
 *
 * NEW        - Card has never been reviewed
 * LEARNING   - Card is being learned (repetition < 2)
 * REVIEW     - Card is in review mode (repetition >= 2)
 * RELEARNING - Card failed and needs relearning
 * SUSPENDED  - Card is suspended by user
 */

// ============================================================================
// TYPICAL WORKFLOW
// ============================================================================

// 1. Initialize
const cards: Card[] = [];
const scheduler = new CardScheduler();

// 2. Create cards
const newCard = createNewCard('Question?', 'Answer!', {
  category: 'JavaScript',
  tags: ['async', 'promises'],
});
cards.push(newCard);

// 3. Get due cards for today
const dueCards = scheduler.getDueCards(cards);
const schedule = scheduler.scheduleTodayCards(cards);

// 4. Review cards
const reviewedCards = dueCards.map(card => {
  // Get user's quality rating (0-5)
  const quality = getUserRating(); // Your UI logic

  // Calculate next review
  const result = calculateNextReview(card, quality);

  // Update card
  return applyReviewResult(card, result);
});

// 5. Save updated cards
// saveCards(reviewedCards); // Your persistence logic

// 6. Show statistics
const retention = scheduler.calculateRetentionRate(cards);
const progress = scheduler.getLearningProgress(cards);
const times = scheduler.getRecommendedStudyTime(cards);

// Helper function (implement based on your UI)
function getUserRating(): QualityRating {
  // Return 0-5 based on user input
  return 4;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

import { validateQuality, type Result } from '@/lib/srs';

function safeReview(card: Card, quality: number) {
  const validation = validateQuality(quality);

  if (!validation.success) {
    console.error('Invalid quality rating:', validation.error);
    return card;
  }

  const result = calculateNextReview(card, validation.data);
  return applyReviewResult(card, result);
}

// ============================================================================
// PERFORMANCE TIPS
// ============================================================================

// ✅ DO: Use bulk operations for multiple cards
import { calculateBulkReviews, applyBulkReviews } from '@/lib/srs';

const reviews = calculateBulkReviews([
  { card: card1, quality: 4 },
  { card: card2, quality: 5 },
]);
const updated = applyBulkReviews([card1, card2], reviews);

// ❌ DON'T: Process cards one by one in a loop
// cards.forEach(card => {
//   const result = calculateNextReview(card, quality);
//   updateInDatabase(card, result); // Multiple DB calls
// });

// ✅ DO: Batch database updates
// const results = calculateBulkReviews(reviewData);
// batchUpdateDatabase(results); // Single DB transaction

// ============================================================================
// TESTING
// ============================================================================

// Run tests
// npm test src/lib/srs

// Run specific test file
// npm test src/lib/srs/__tests__/sm2-algorithm.test.ts

// Run with coverage
// npm test -- --coverage src/lib/srs

// ============================================================================
// HELPFUL UTILITIES
// ============================================================================

import {
  formatDuration,
  isCardDue,
  isCardOverdue,
  daysUntilDue,
  sortCardsByPriority,
  getCardsDueToday,
} from '@/lib/srs';

// Format time
console.log(formatDuration(125000)); // "2m 5s"

// Check card status
const isDue = isCardDue(card);
const isOverdue = isCardOverdue(card);
const daysLeft = daysUntilDue(card);

// Sort and filter
const prioritized = sortCardsByPriority(cards);
const todayCards = getCardsDueToday(cards);

// ============================================================================
// INTEGRATION WITH UI
// ============================================================================

// Example React component pattern
/*
function FlashcardReview() {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const scheduler = useMemo(() => new CardScheduler(), []);

  const handleReview = (quality: QualityRating) => {
    const card = cards[currentIndex];
    const result = calculateNextReview(card, quality);
    const updated = applyReviewResult(card, result);

    // Update state
    setCards(prev => {
      const newCards = [...prev];
      newCards[currentIndex] = updated;
      return newCards;
    });

    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  return (
    <div>
      <FlashCard card={cards[currentIndex]} />
      <QualityButtons onRate={handleReview} />
    </div>
  );
}
*/

export {};
