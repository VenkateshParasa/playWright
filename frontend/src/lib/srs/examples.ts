/**
 * Example usage of the SRS library
 * This file demonstrates common use cases and patterns
 */

import {
  createNewCard,
  calculateNextReview,
  applyReviewResult,
  CardScheduler,
  type Card,
  type QualityRating,
} from './index';

// ============================================================================
// Example 1: Basic Card Review Flow
// ============================================================================

export function basicReviewExample() {
  console.log('=== Basic Review Example ===\n');

  // Create a new card
  let card = createNewCard(
    'What is the purpose of Playwright?',
    'End-to-end testing framework for web applications'
  );

  console.log('Initial card state:');
  console.log(`- Repetition: ${card.repetition}`);
  console.log(`- Interval: ${card.interval} days`);
  console.log(`- Easiness Factor: ${card.easinessFactor}`);
  console.log(`- State: ${card.state}\n`);

  // Simulate multiple reviews
  const reviews: QualityRating[] = [4, 5, 4, 3, 5];

  reviews.forEach((quality, index) => {
    const result = calculateNextReview(card, quality);
    card = applyReviewResult(card, result);

    console.log(`Review ${index + 1} (Quality: ${quality}):`);
    console.log(`- Next review: ${card.nextReviewDate.toLocaleDateString()}`);
    console.log(`- Interval: ${card.interval} days`);
    console.log(`- Repetition: ${card.repetition}`);
    console.log(`- Easiness Factor: ${card.easinessFactor}`);
    console.log(`- State: ${card.state}\n`);
  });

  return card;
}

// ============================================================================
// Example 2: Failed Recall and Recovery
// ============================================================================

export function failedRecallExample() {
  console.log('=== Failed Recall Example ===\n');

  // Create a card with some progress
  let card = createNewCard('What is async/await?', 'Syntactic sugar for Promises', {
    repetition: 3,
    interval: 15,
    easinessFactor: 2.5,
  });

  console.log('Card with progress:');
  console.log(`- Repetition: ${card.repetition}`);
  console.log(`- Interval: ${card.interval} days\n`);

  // User forgets the answer (quality: 1)
  const result = calculateNextReview(card, 1);
  card = applyReviewResult(card, result);

  console.log('After failed recall:');
  console.log(`- Repetition: ${card.repetition} (reset to 0)`);
  console.log(`- Interval: ${card.interval} (reset to 0)`);
  console.log(`- State: ${card.state} (moved to relearning)`);
  console.log(`- Next review: ${card.nextReviewDate.toLocaleTimeString()} (10 minutes later)\n`);

  // Relearn the card
  const relearn1 = calculateNextReview(card, 4);
  card = applyReviewResult(card, relearn1);

  console.log('After successful relearning:');
  console.log(`- Repetition: ${card.repetition}`);
  console.log(`- Interval: ${card.interval} day`);
  console.log(`- State: ${card.state}\n`);

  return card;
}

// ============================================================================
// Example 3: Batch Processing
// ============================================================================

export function batchProcessingExample() {
  console.log('=== Batch Processing Example ===\n');

  // Create multiple cards
  const cards: Card[] = [
    createNewCard('What is Selenium?', 'Web automation tool'),
    createNewCard('What is WebDriver?', 'Browser automation API'),
    createNewCard('What is a locator?', 'Element selector in automation'),
    createNewCard('What is POM?', 'Page Object Model pattern'),
    createNewCard('What is a test fixture?', 'Setup/teardown code for tests'),
  ];

  console.log(`Created ${cards.length} cards\n`);

  // Simulate reviewing all cards
  const qualities: QualityRating[] = [5, 4, 3, 5, 4];

  const updatedCards = cards.map((card, index) => {
    const result = calculateNextReview(card, qualities[index]);
    return applyReviewResult(card, result);
  });

  console.log('Review results:');
  updatedCards.forEach((card, index) => {
    console.log(
      `${index + 1}. ${card.front.substring(0, 30)}... - ` +
      `Next: ${card.nextReviewDate.toLocaleDateString()}, ` +
      `Interval: ${card.interval} day(s)`
    );
  });
  console.log();

  return updatedCards;
}

// ============================================================================
// Example 4: Scheduler Usage
// ============================================================================

export function schedulerExample() {
  console.log('=== Scheduler Example ===\n');

  // Create a scheduler
  const scheduler = new CardScheduler({
    maxNewCardsPerDay: 10,
    maxReviewsPerDay: 50,
  });

  // Create a diverse card collection
  const now = new Date();
  const cards: Card[] = [
    // New cards
    ...Array(15).fill(null).map((_, i) =>
      createNewCard(`New Question ${i + 1}`, `New Answer ${i + 1}`)
    ),

    // Due today
    ...Array(10).fill(null).map((_, i) =>
      createNewCard(`Due Today ${i + 1}`, `Answer ${i + 1}`, {
        repetition: 2,
        interval: 5,
        nextReviewDate: now,
      })
    ),

    // Due in future
    ...Array(5).fill(null).map((_, i) =>
      createNewCard(`Future ${i + 1}`, `Answer ${i + 1}`, {
        repetition: 3,
        interval: 10,
        nextReviewDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
      })
    ),
  ];

  console.log(`Total cards: ${cards.length}`);
  console.log(`New cards: ${scheduler.getNewCards(cards).length}`);
  console.log(`Due today: ${scheduler.getDueCards(cards).length}`);
  console.log(`Learning cards: ${scheduler.getLearningCards(cards).length}`);
  console.log(`Review cards: ${scheduler.getReviewCards(cards).length}\n`);

  // Get today's schedule
  const schedule = scheduler.scheduleTodayCards(cards);
  console.log(`Scheduled for today: ${schedule.length} cards`);
  console.log(`(Limited by maxNewCardsPerDay: 10 and maxReviewsPerDay: 50)\n`);

  // Get study time recommendations
  const times = scheduler.getRecommendedStudyTime(cards, 10000); // 10 seconds per card
  console.log('Study time recommendations:');
  console.log(`- Minimum: ${Math.round(times.minimumTime / 60000)} minutes`);
  console.log(`- Recommended: ${Math.round(times.recommendedTime / 60000)} minutes`);
  console.log(`- All due: ${Math.round(times.allDueTime / 60000)} minutes\n`);

  // Calculate retention rate
  const cardsWithHistory = cards.map(c => ({
    ...c,
    totalReviews: Math.floor(Math.random() * 10) + 1,
    correctReviews: Math.floor(Math.random() * 8) + 1,
  }));

  const retention = scheduler.calculateRetentionRate(cardsWithHistory);
  console.log(`Overall retention rate: ${retention.toFixed(1)}%\n`);

  // Get learning progress
  const progress = scheduler.getLearningProgress(cards);
  console.log('Learning progress:');
  console.log(`- Completion rate: ${progress.completionRate.toFixed(1)}%`);
  console.log(`- Mastered cards: ${progress.masteredCards}`);
  console.log(`- In progress: ${progress.inProgressCards}`);
  console.log(`- Not started: ${progress.notStartedCards}\n`);

  return { scheduler, cards, schedule };
}

// ============================================================================
// Example 5: Workload Prediction
// ============================================================================

export function workloadPredictionExample() {
  console.log('=== Workload Prediction Example ===\n');

  const scheduler = new CardScheduler();

  // Create cards with various due dates
  const now = new Date();
  const cards: Card[] = [];

  // Distribute cards over the next 7 days
  for (let day = 0; day < 7; day++) {
    const cardCount = Math.floor(Math.random() * 20) + 5;
    const dueDate = new Date(now.getTime() + day * 24 * 60 * 60 * 1000);

    for (let i = 0; i < cardCount; i++) {
      cards.push(
        createNewCard(`Card ${cards.length + 1}`, `Answer ${cards.length + 1}`, {
          repetition: 2,
          interval: day + 1,
          nextReviewDate: dueDate,
        })
      );
    }
  }

  console.log(`Total cards: ${cards.length}\n`);

  // Predict workload for next 7 days
  const forecast = scheduler.predictFutureWorkload(cards, 7, 10000); // 10 seconds per card

  console.log('7-day workload forecast:');
  forecast.forEach((day, index) => {
    const date = day.date.toLocaleDateString();
    const minutes = Math.round(day.estimatedTime / 60000);
    console.log(
      `Day ${index + 1} (${date}): ${day.dueCards} cards, ~${minutes} minutes`
    );
  });
  console.log();

  // Get workload summary
  const startDate = now;
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const summary = scheduler.getWorkloadSummary(cards, startDate, endDate);

  console.log('Workload summary:');
  console.log(`- Total cards: ${summary.totalCards}`);
  console.log(`- Average per day: ${summary.averagePerDay}`);
  console.log(`- Peak day: ${summary.peakDay.date.toLocaleDateString()} (${summary.peakDay.count} cards)`);
  console.log(`- Lightest day: ${summary.lightestDay.date.toLocaleDateString()} (${summary.lightestDay.count} cards)\n`);

  return { cards, forecast, summary };
}

// ============================================================================
// Example 6: Difficulty Analysis
// ============================================================================

export function difficultyAnalysisExample() {
  console.log('=== Difficulty Analysis Example ===\n');

  const scheduler = new CardScheduler();

  // Create cards with varying difficulty (easiness factors)
  const cards: Card[] = [
    // Easy cards (EF > 2.5)
    ...Array(10).fill(null).map((_, i) =>
      createNewCard(`Easy ${i + 1}`, `Answer ${i + 1}`, {
        easinessFactor: 2.6 + Math.random() * 0.4,
        repetition: 5,
      })
    ),

    // Medium cards (2.0 <= EF <= 2.5)
    ...Array(15).fill(null).map((_, i) =>
      createNewCard(`Medium ${i + 1}`, `Answer ${i + 1}`, {
        easinessFactor: 2.0 + Math.random() * 0.5,
        repetition: 3,
      })
    ),

    // Hard cards (EF < 2.0)
    ...Array(5).fill(null).map((_, i) =>
      createNewCard(`Hard ${i + 1}`, `Answer ${i + 1}`, {
        easinessFactor: 1.3 + Math.random() * 0.7,
        repetition: 1,
      })
    ),
  ];

  const difficulty = scheduler.analyzeDifficulty(cards);

  console.log('Difficulty distribution:');
  console.log(`- Easy cards (EF > 2.5): ${difficulty.easy}`);
  console.log(`- Medium cards (2.0 ≤ EF ≤ 2.5): ${difficulty.medium}`);
  console.log(`- Hard cards (EF < 2.0): ${difficulty.hard}\n`);

  // Show some statistics
  const avgEF = cards.reduce((sum, c) => sum + c.easinessFactor, 0) / cards.length;
  console.log(`Average easiness factor: ${avgEF.toFixed(2)}\n`);

  return { cards, difficulty };
}

// ============================================================================
// Run all examples
// ============================================================================

export function runAllExamples() {
  console.log('\n' + '='.repeat(80));
  console.log('SRS Library Examples');
  console.log('='.repeat(80) + '\n');

  basicReviewExample();
  console.log('\n' + '-'.repeat(80) + '\n');

  failedRecallExample();
  console.log('\n' + '-'.repeat(80) + '\n');

  batchProcessingExample();
  console.log('\n' + '-'.repeat(80) + '\n');

  schedulerExample();
  console.log('\n' + '-'.repeat(80) + '\n');

  workloadPredictionExample();
  console.log('\n' + '-'.repeat(80) + '\n');

  difficultyAnalysisExample();

  console.log('\n' + '='.repeat(80));
  console.log('Examples completed!');
  console.log('='.repeat(80) + '\n');
}

// Uncomment to run examples
// runAllExamples();
