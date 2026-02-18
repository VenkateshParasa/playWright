import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Dashboard Page Object Model
 */
export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly streakCounter: Locator;
  readonly progressOverview: Locator;
  readonly quickActions: Locator;
  readonly upcomingReviews: Locator;
  readonly recentAchievements: Locator;
  readonly studyTimeChart: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.streakCounter = page.locator('[data-testid="streak-counter"]');
    this.progressOverview = page.locator('[data-testid="progress-overview"]');
    this.quickActions = page.locator('[data-testid="quick-actions"]');
    this.upcomingReviews = page.locator('[data-testid="upcoming-reviews"]');
    this.recentAchievements = page.locator('[data-testid="recent-achievements"]');
    this.studyTimeChart = page.locator('[data-testid="study-time-chart"]');
  }

  async goto() {
    await super.goto('/dashboard');
  }

  async getStreakCount(): Promise<number> {
    const text = await this.streakCounter.textContent();
    return parseInt(text?.match(/\d+/)?.[0] || '0');
  }

  async clickQuickAction(action: string) {
    await this.page.click(`[data-testid="quick-action-${action}"]`);
  }

  async getProgressPercentage(): Promise<number> {
    const text = await this.progressOverview.textContent();
    return parseInt(text?.match(/(\d+)%/)?.[1] || '0');
  }
}

/**
 * Lessons Page Object Model
 */
export class LessonsPage extends BasePage {
  readonly searchInput: Locator;
  readonly filterButtons: Locator;
  readonly lessonCards: Locator;
  readonly sortDropdown: Locator;
  readonly trackFilter: Locator;
  readonly difficultyFilter: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = page.locator('[data-testid="lesson-search"]');
    this.filterButtons = page.locator('[data-testid="filter-button"]');
    this.lessonCards = page.locator('[data-testid="lesson-card"]');
    this.sortDropdown = page.locator('[data-testid="sort-dropdown"]');
    this.trackFilter = page.locator('[data-testid="track-filter"]');
    this.difficultyFilter = page.locator('[data-testid="difficulty-filter"]');
  }

  async goto() {
    await super.goto('/lessons');
  }

  async searchLessons(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500); // Debounce
  }

  async filterByTrack(track: '30-day' | '60-day' | 'both' | 'all') {
    await this.trackFilter.click();
    await this.page.click(`[data-value="${track}"]`);
  }

  async filterByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced' | 'all') {
    await this.difficultyFilter.click();
    await this.page.click(`[data-value="${difficulty}"]`);
  }

  async sortBy(option: 'order' | 'difficulty' | 'duration' | 'title') {
    await this.sortDropdown.click();
    await this.page.click(`[data-value="${option}"]`);
  }

  async getLessonCount(): Promise<number> {
    return await this.lessonCards.count();
  }

  async clickLesson(index: number) {
    await this.lessonCards.nth(index).click();
  }

  async clickLessonById(lessonId: string) {
    await this.page.click(`[data-lesson-id="${lessonId}"]`);
  }
}

/**
 * Lesson Detail Page Object Model
 */
export class LessonDetailPage extends BasePage {
  readonly lessonTitle: Locator;
  readonly lessonContent: Locator;
  readonly progressBar: Locator;
  readonly completeButton: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly tableOfContents: Locator;
  readonly codeExamples: Locator;
  readonly bookmarkButton: Locator;

  constructor(page: Page) {
    super(page);
    this.lessonTitle = page.locator('[data-testid="lesson-title"]');
    this.lessonContent = page.locator('[data-testid="lesson-content"]');
    this.progressBar = page.locator('[data-testid="progress-bar"]');
    this.completeButton = page.locator('[data-testid="complete-lesson"]');
    this.nextButton = page.locator('[data-testid="next-lesson"]');
    this.previousButton = page.locator('[data-testid="previous-lesson"]');
    this.tableOfContents = page.locator('[data-testid="table-of-contents"]');
    this.codeExamples = page.locator('[data-testid="code-example"]');
    this.bookmarkButton = page.locator('[data-testid="bookmark-button"]');
  }

  async goto(lessonId: string) {
    await super.goto(`/lessons/${lessonId}`);
  }

  async completeLesson() {
    await this.completeButton.click();
  }

  async goToNextLesson() {
    await this.nextButton.click();
  }

  async goToPreviousLesson() {
    await this.previousButton.click();
  }

  async clickTocItem(index: number) {
    await this.tableOfContents.locator('a').nth(index).click();
  }

  async copyCodeExample(index: number) {
    await this.codeExamples.nth(index).locator('[data-testid="copy-button"]').click();
  }

  async toggleBookmark() {
    await this.bookmarkButton.click();
  }

  async getProgress(): Promise<number> {
    const value = await this.progressBar.getAttribute('value');
    return parseInt(value || '0');
  }
}

/**
 * Quiz Page Object Model
 */
export class QuizPage extends BasePage {
  readonly quizTitle: Locator;
  readonly questionText: Locator;
  readonly answerOptions: Locator;
  readonly nextButton: Locator;
  readonly previousButton: Locator;
  readonly submitButton: Locator;
  readonly timerDisplay: Locator;
  readonly progressIndicator: Locator;
  readonly markForReviewButton: Locator;

  constructor(page: Page) {
    super(page);
    this.quizTitle = page.locator('[data-testid="quiz-title"]');
    this.questionText = page.locator('[data-testid="question-text"]');
    this.answerOptions = page.locator('[data-testid="answer-option"]');
    this.nextButton = page.locator('[data-testid="next-question"]');
    this.previousButton = page.locator('[data-testid="previous-question"]');
    this.submitButton = page.locator('[data-testid="submit-quiz"]');
    this.timerDisplay = page.locator('[data-testid="timer"]');
    this.progressIndicator = page.locator('[data-testid="quiz-progress"]');
    this.markForReviewButton = page.locator('[data-testid="mark-for-review"]');
  }

  async goto(quizId: string) {
    await super.goto(`/quiz/${quizId}`);
  }

  async selectAnswer(index: number) {
    await this.answerOptions.nth(index).click();
  }

  async selectMultipleAnswers(indices: number[]) {
    for (const index of indices) {
      await this.answerOptions.nth(index).click();
    }
  }

  async nextQuestion() {
    await this.nextButton.click();
  }

  async previousQuestion() {
    await this.previousButton.click();
  }

  async submitQuiz() {
    await this.submitButton.click();
  }

  async markForReview() {
    await this.markForReviewButton.click();
  }

  async getRemainingTime(): Promise<string> {
    return await this.timerDisplay.textContent() || '';
  }

  async getCurrentQuestionNumber(): Promise<number> {
    const text = await this.progressIndicator.textContent();
    return parseInt(text?.match(/(\d+)/)?.[1] || '0');
  }
}

/**
 * Quiz Results Page Object Model
 */
export class QuizResultsPage extends BasePage {
  readonly scoreDisplay: Locator;
  readonly percentageDisplay: Locator;
  readonly passedBadge: Locator;
  readonly questionResults: Locator;
  readonly retryButton: Locator;
  readonly reviewButton: Locator;
  readonly continueButton: Locator;

  constructor(page: Page) {
    super(page);
    this.scoreDisplay = page.locator('[data-testid="score"]');
    this.percentageDisplay = page.locator('[data-testid="percentage"]');
    this.passedBadge = page.locator('[data-testid="passed-badge"]');
    this.questionResults = page.locator('[data-testid="question-result"]');
    this.retryButton = page.locator('[data-testid="retry-quiz"]');
    this.reviewButton = page.locator('[data-testid="review-answers"]');
    this.continueButton = page.locator('[data-testid="continue"]');
  }

  async getScore(): Promise<number> {
    const text = await this.scoreDisplay.textContent();
    return parseInt(text?.match(/(\d+)/)?.[1] || '0');
  }

  async getPercentage(): Promise<number> {
    const text = await this.percentageDisplay.textContent();
    return parseInt(text?.match(/(\d+)/)?.[1] || '0');
  }

  async isPassed(): Promise<boolean> {
    return await this.passedBadge.isVisible();
  }

  async retryQuiz() {
    await this.retryButton.click();
  }

  async reviewAnswers() {
    await this.reviewButton.click();
  }

  async continue() {
    await this.continueButton.click();
  }
}

/**
 * Flashcards Page Object Model
 */
export class FlashcardsPage extends BasePage {
  readonly startReviewButton: Locator;
  readonly cardFront: Locator;
  readonly cardBack: Locator;
  readonly flipButton: Locator;
  readonly qualityButtons: Locator;
  readonly progressDisplay: Locator;
  readonly skipButton: Locator;
  readonly pauseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.startReviewButton = page.locator('[data-testid="start-review"]');
    this.cardFront = page.locator('[data-testid="card-front"]');
    this.cardBack = page.locator('[data-testid="card-back"]');
    this.flipButton = page.locator('[data-testid="flip-card"]');
    this.qualityButtons = page.locator('[data-testid^="quality-"]');
    this.progressDisplay = page.locator('[data-testid="review-progress"]');
    this.skipButton = page.locator('[data-testid="skip-card"]');
    this.pauseButton = page.locator('[data-testid="pause-session"]');
  }

  async goto() {
    await super.goto('/flashcards');
  }

  async startReview() {
    await this.startReviewButton.click();
  }

  async flipCard() {
    await this.flipButton.click();
  }

  async rateCard(quality: 0 | 1 | 2 | 3 | 4 | 5) {
    await this.page.click(`[data-testid="quality-${quality}"]`);
  }

  async skipCard() {
    await this.skipButton.click();
  }

  async pauseSession() {
    await this.pauseButton.click();
  }

  async getProgress(): Promise<string> {
    return await this.progressDisplay.textContent() || '';
  }
}
