# Spaced Repetition System (SRS) - SM-2 Algorithm

A pure TypeScript implementation of the SuperMemo SM-2 algorithm for spaced repetition learning.

## Features

- **SM-2 Algorithm**: Full implementation of the SuperMemo SM-2 algorithm
- **Card Scheduling**: Intelligent card scheduling with workload prediction
- **Retention Analysis**: Calculate retention rates and learning statistics
- **Bulk Operations**: Optimized for handling large card collections
- **Type Safety**: Fully typed with TypeScript
- **Pure Functions**: No side effects, easy to test
- **Comprehensive Tests**: 100% test coverage

## Installation

The SRS library is part of the project. Import from `@/lib/srs`:

```typescript
import { createNewCard, calculateNextReview, CardScheduler } from '@/lib/srs';
```

## Quick Start

### 1. Create a Card

```typescript
import { createNewCard } from '@/lib/srs';

const card = createNewCard(
  'What is the capital of France?',
  'Paris'
);
```

### 2. Review a Card

```typescript
import { calculateNextReview, applyReviewResult } from '@/lib/srs';

// User reviews the card with quality rating 4 (good recall)
const result = calculateNextReview(card, 4);

// Apply the result to update the card
const updatedCard = applyReviewResult(card, result);

console.log(`Next review: ${updatedCard.nextReviewDate}`);
console.log(`Interval: ${updatedCard.interval} days`);
```

### 3. Schedule Cards

```typescript
import { CardScheduler } from '@/lib/srs';

const scheduler = new CardScheduler();

// Get cards due today
const dueCards = scheduler.getDueCards(allCards);

// Get recommended study time
const times = scheduler.getRecommendedStudyTime(allCards);
console.log(`Recommended study time: ${times.recommendedTime / 60000} minutes`);

// Predict future workload
const forecast = scheduler.predictFutureWorkload(allCards, 30);
```

## Quality Ratings

The SM-2 algorithm uses quality ratings from 0 to 5:

| Rating | Description |
|--------|-------------|
| 5 | Perfect response - immediate recall |
| 4 | Correct response after some hesitation |
| 3 | Correct response with significant difficulty |
| 2 | Incorrect, but correct answer seemed easy to recall |
| 1 | Incorrect, correct answer remembered |
| 0 | Complete blackout - no recall |

Ratings below 3 are considered "failing" and reset the card's progress.

## API Reference

### Core Functions

#### `createNewCard(front, back, options?)`

Create a new flashcard with default SRS values.

```typescript
const card = createNewCard(
  'Question text',
  'Answer text',
  {
    category: 'JavaScript',
    tags: ['async', 'promises'],
  }
);
```

#### `calculateNextReview(card, quality, reviewDate?, config?)`

Calculate the next review schedule based on quality rating.

```typescript
const result = calculateNextReview(card, 4);
// Returns: ReviewResult with updated parameters
```

#### `applyReviewResult(card, result)`

Apply a review result to a card (immutable update).

```typescript
const updatedCard = applyReviewResult(card, result);
```

#### `calculateBulkReviews(reviews, config?)`

Process multiple reviews efficiently.

```typescript
const results = calculateBulkReviews([
  { card: card1, quality: 4 },
  { card: card2, quality: 5 },
  { card: card3, quality: 2 },
]);
```

### Scheduler Class

#### `new CardScheduler(config?)`

Create a scheduler instance.

```typescript
const scheduler = new CardScheduler({
  maxNewCardsPerDay: 20,
  maxReviewsPerDay: 200,
});
```

#### `getDueCards(cards, now?)`

Get all cards that are due for review.

```typescript
const dueCards = scheduler.getDueCards(allCards);
```

#### `scheduleTodayCards(cards, now?)`

Get prioritized schedule for today's study session.

```typescript
const schedule = scheduler.scheduleTodayCards(allCards);
```

#### `calculateRetentionRate(cards)`

Calculate overall retention rate as a percentage.

```typescript
const retention = scheduler.calculateRetentionRate(allCards);
console.log(`Retention: ${retention}%`);
```

#### `calculateRetentionStats(cards, reviews)`

Get detailed retention statistics.

```typescript
const stats = scheduler.calculateRetentionStats(allCards, reviewHistory);
console.log(`Mature cards: ${stats.matureCards}`);
console.log(`Overall retention: ${stats.overallRetention}%`);
```

#### `predictFutureWorkload(cards, days, averageReviewTime?, startDate?)`

Predict workload for upcoming days.

```typescript
const forecast = scheduler.predictFutureWorkload(allCards, 30);
forecast.forEach(day => {
  console.log(`${day.date}: ${day.dueCards} cards, ${day.estimatedTime}ms`);
});
```

#### `getRecommendedStudyTime(cards, averageReviewTime?)`

Get study time recommendations.

```typescript
const times = scheduler.getRecommendedStudyTime(allCards);
console.log(`Minimum: ${formatDuration(times.minimumTime)}`);
console.log(`Recommended: ${formatDuration(times.recommendedTime)}`);
console.log(`All due: ${formatDuration(times.allDueTime)}`);
```

### Utility Functions

#### Date Utilities

```typescript
import { addDays, startOfDay, isCardDue, daysBetween } from '@/lib/srs';

const tomorrow = addDays(new Date(), 1);
const today = startOfDay(new Date());
const isDue = isCardDue(card);
const days = daysBetween(date1, date2);
```

#### Validation

```typescript
import { validateQuality, validateEasinessFactor } from '@/lib/srs';

const qualityResult = validateQuality(4);
if (qualityResult.success) {
  console.log('Valid quality:', qualityResult.data);
}
```

#### Card Utilities

```typescript
import {
  sortCardsByPriority,
  getCardsDueToday,
  shuffleArray
} from '@/lib/srs';

const prioritized = sortCardsByPriority(cards);
const todayCards = getCardsDueToday(cards);
const shuffled = shuffleArray(cards);
```

## Configuration

The scheduler accepts a configuration object:

```typescript
interface SchedulerConfig {
  maxNewCardsPerDay: number;       // Default: 20
  maxReviewsPerDay: number;        // Default: 200
  newCardSteps: number[];          // Default: [1, 10] (minutes)
  graduatingInterval: number;      // Default: 1 (days)
  easyInterval: number;            // Default: 4 (days)
  minimumEasinessFactor: number;   // Default: 1.3
  maximumInterval: number;         // Default: 36500 (100 years)
  hardInterval: number;            // Default: 1.2
  easyBonus: number;               // Default: 1.3
}
```

Example:

```typescript
const scheduler = new CardScheduler({
  maxNewCardsPerDay: 30,
  maxReviewsPerDay: 150,
  minimumEasinessFactor: 1.5,
});
```

## Card States

Cards progress through different states:

- **NEW**: Never been reviewed
- **LEARNING**: Being learned (repetition < 2)
- **REVIEW**: Regular review (repetition >= 2)
- **RELEARNING**: Failed and needs to be relearned
- **SUSPENDED**: Manually suspended by user

## Algorithm Details

### Easiness Factor (EF)

- Starts at 2.5 for new cards
- Adjusted based on quality ratings
- Minimum value: 1.3
- Formula: `EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))`

### Intervals

- First successful review: 1 day
- Second successful review: 6 days
- Subsequent reviews: `previous_interval * EF`
- Failed review: reset to 0 (relearn in 10 minutes)

### Repetition Count

- Increments on successful review (quality >= 3)
- Resets to 0 on failed review (quality < 3)

## Examples

### Complete Review Flow

```typescript
import {
  createNewCard,
  calculateNextReview,
  applyReviewResult,
  formatDuration
} from '@/lib/srs';

// Create a new card
let card = createNewCard(
  'What is async/await in JavaScript?',
  'Syntactic sugar for working with Promises'
);

// First review - good recall
let result1 = calculateNextReview(card, 4);
card = applyReviewResult(card, result1);
console.log(`Next review in ${card.interval} day(s)`);

// Second review - perfect recall
let result2 = calculateNextReview(card, 5);
card = applyReviewResult(card, result2);
console.log(`Next review in ${card.interval} days`);

// Third review - forgot
let result3 = calculateNextReview(card, 1);
card = applyReviewResult(card, result3);
console.log(`Card needs relearning`);
```

### Batch Processing

```typescript
import { calculateBulkReviews, applyBulkReviews } from '@/lib/srs';

// Process multiple reviews at once
const reviewData = [
  { card: card1, quality: 4, reviewDate: new Date() },
  { card: card2, quality: 5, reviewDate: new Date() },
  { card: card3, quality: 3, reviewDate: new Date() },
];

const results = calculateBulkReviews(reviewData);
const updatedCards = applyBulkReviews(
  [card1, card2, card3],
  results
);
```

### Progress Tracking

```typescript
import { CardScheduler } from '@/lib/srs';

const scheduler = new CardScheduler();

// Get learning progress
const progress = scheduler.getLearningProgress(allCards);
console.log(`Completion: ${progress.completionRate}%`);
console.log(`Mastered: ${progress.masteredCards}`);
console.log(`In progress: ${progress.inProgressCards}`);
console.log(`Not started: ${progress.notStartedCards}`);

// Analyze difficulty
const difficulty = scheduler.analyzeDifficulty(allCards);
console.log(`Easy: ${difficulty.easy}`);
console.log(`Medium: ${difficulty.medium}`);
console.log(`Hard: ${difficulty.hard}`);
```

### Workload Planning

```typescript
import { CardScheduler, formatDuration } from '@/lib/srs';

const scheduler = new CardScheduler();

// Get 30-day forecast
const forecast = scheduler.predictFutureWorkload(allCards, 30);

forecast.slice(0, 7).forEach(day => {
  const date = day.date.toLocaleDateString();
  const total = day.dueCards + day.newCards;
  const time = formatDuration(day.estimatedTime);
  console.log(`${date}: ${total} cards (${time})`);
});

// Get summary for next week
const startDate = new Date();
const endDate = addDays(startDate, 7);
const summary = scheduler.getWorkloadSummary(allCards, startDate, endDate);
console.log(`Total cards: ${summary.totalCards}`);
console.log(`Average per day: ${summary.averagePerDay}`);
console.log(`Peak day: ${summary.peakDay.date} (${summary.peakDay.count} cards)`);
```

## Testing

Run the test suite:

```bash
npm test src/lib/srs
```

Run with coverage:

```bash
npm test -- --coverage src/lib/srs
```

## Performance

The SRS implementation is optimized for performance:

- Bulk operations for processing multiple cards
- Immutable updates (no mutations)
- Efficient date calculations
- O(n) complexity for most operations

Tested with datasets of 10,000+ cards with excellent performance.

## References

- [SuperMemo SM-2 Algorithm](https://www.supermemo.com/en/archives1990-2015/english/ol/sm2)
- [Spaced Repetition on Wikipedia](https://en.wikipedia.org/wiki/Spaced_repetition)

## License

Part of the Playwright & Selenium Learning Platform project.
