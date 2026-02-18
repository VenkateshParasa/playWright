/**
 * Essay Grading Service
 * NLP-based essay and short answer grading with rubric support
 */

import type {
  EssaySubmission,
  EssayGradingResult,
  Rubric,
  RubricCriterion,
} from '../../types/ai.js';

interface GrammarIssue {
  text: string;
  suggestion: string;
  type: string;
  position: { start: number; end: number };
}

export class EssayGradingService {
  /**
   * Grade an essay submission
   */
  async gradeEssay(submission: EssaySubmission): Promise<EssayGradingResult> {
    // Analyze key concepts
    const keyConcepts = await this.analyzeKeyConcepts(
      submission.content,
      submission.questionId
    );

    // Check grammar and spelling
    const grammarAnalysis = await this.analyzeGrammar(submission.content);

    // Calculate readability score
    const readabilityScore = this.calculateReadability(submission.content);

    // Check plagiarism
    const plagiarismScore = await this.checkPlagiarism(
      submission.content,
      submission.userId
    );

    // Grade based on rubric
    let criteriaScores: Array<{
      criterionId: string;
      score: number;
      feedback: string;
    }> = [];

    let totalScore = 0;
    let maxScore = 100;

    if (submission.rubric) {
      criteriaScores = await this.gradeWithRubric(
        submission.content,
        submission.rubric,
        keyConcepts
      );

      totalScore = criteriaScores.reduce((sum, cs) => sum + cs.score, 0);
      maxScore = submission.rubric.totalPoints;
    } else {
      // Default grading without rubric
      const grading = this.gradeWithoutRubric(
        submission.content,
        keyConcepts,
        grammarAnalysis,
        readabilityScore
      );
      totalScore = grading.score;
      maxScore = grading.maxScore;
    }

    const percentage = (totalScore / maxScore) * 100;

    // Generate feedback
    const feedback = this.generateEssayFeedback(
      submission.content,
      keyConcepts,
      grammarAnalysis,
      readabilityScore,
      criteriaScores
    );

    // Determine if human review is needed
    const requiresHumanReview = this.requiresHumanReview(
      percentage,
      grammarAnalysis,
      keyConcepts,
      plagiarismScore
    );

    return {
      score: totalScore,
      maxScore,
      percentage,
      criteriaScores,
      keyConcepts,
      grammarAnalysis: {
        errors: grammarAnalysis.issues.length,
        suggestions: grammarAnalysis.issues.map(issue => ({
          text: issue.text,
          suggestion: issue.suggestion,
          type: issue.type,
        })),
      },
      readabilityScore,
      plagiarismScore,
      feedback,
      requiresHumanReview,
      gradedAt: new Date(),
    };
  }

  /**
   * Grade using rubric
   */
  private async gradeWithRubric(
    content: string,
    rubric: Rubric,
    keyConcepts: { identified: string[]; missing: string[] }
  ): Promise<Array<{ criterionId: string; score: number; feedback: string }>> {
    const scores: Array<{ criterionId: string; score: number; feedback: string }> = [];

    for (const criterion of rubric.criteria) {
      const score = await this.gradeCriterion(content, criterion, keyConcepts);
      scores.push(score);
    }

    return scores;
  }

  /**
   * Grade a single rubric criterion
   */
  private async gradeCriterion(
    content: string,
    criterion: RubricCriterion,
    keyConcepts: { identified: string[]; missing: string[] }
  ): Promise<{ criterionId: string; score: number; feedback: string }> {
    // Analyze how well the essay addresses this criterion
    const contentLower = content.toLowerCase();
    const criterionLower = criterion.description.toLowerCase();

    // Extract keywords from criterion
    const keywords = criterionLower
      .split(/\s+/)
      .filter(word => word.length > 4);

    // Count how many keywords are present
    const keywordMatches = keywords.filter(keyword =>
      contentLower.includes(keyword)
    ).length;

    const matchRatio = keywordMatches / Math.max(keywords.length, 1);

    // Determine score based on match ratio and quality
    let score = 0;
    let feedback = '';

    if (matchRatio >= 0.7) {
      score = criterion.maxPoints;
      feedback = `Excellent coverage of ${criterion.name}`;
    } else if (matchRatio >= 0.5) {
      score = Math.floor(criterion.maxPoints * 0.75);
      feedback = `Good understanding of ${criterion.name}, but could be more comprehensive`;
    } else if (matchRatio >= 0.3) {
      score = Math.floor(criterion.maxPoints * 0.5);
      feedback = `Partial coverage of ${criterion.name}. Consider expanding on key points`;
    } else {
      score = Math.floor(criterion.maxPoints * 0.25);
      feedback = `${criterion.name} needs more development and detail`;
    }

    return {
      criterionId: criterion.id,
      score,
      feedback,
    };
  }

  /**
   * Grade without rubric (default scoring)
   */
  private gradeWithoutRubric(
    content: string,
    keyConcepts: { identified: string[]; missing: string[] },
    grammarAnalysis: { issues: GrammarIssue[] },
    readabilityScore: number
  ): { score: number; maxScore: number } {
    let score = 0;
    const maxScore = 100;

    // Content depth (40 points)
    const wordCount = content.split(/\s+/).length;
    if (wordCount >= 200) {
      score += 40;
    } else if (wordCount >= 150) {
      score += 30;
    } else if (wordCount >= 100) {
      score += 20;
    } else {
      score += 10;
    }

    // Key concepts (30 points)
    const conceptScore = Math.min(30, keyConcepts.identified.length * 10);
    score += conceptScore;

    // Grammar (20 points)
    const grammarScore = Math.max(0, 20 - grammarAnalysis.issues.length * 2);
    score += grammarScore;

    // Readability (10 points)
    const readabilityPoints = Math.floor(readabilityScore / 10);
    score += readabilityPoints;

    return { score, maxScore };
  }

  /**
   * Analyze key concepts in the essay
   */
  private async analyzeKeyConcepts(
    content: string,
    questionId: string
  ): Promise<{ identified: string[]; missing: string[] }> {
    // In production, use NLP models (BERT, etc.) to extract concepts
    const identified = this.extractConcepts(content);

    // Get expected concepts for this question (from database)
    const expected = this.getExpectedConcepts(questionId);

    const missing = expected.filter(concept =>
      !identified.some(id =>
        id.toLowerCase().includes(concept.toLowerCase())
      )
    );

    return { identified, missing };
  }

  /**
   * Extract concepts from text
   */
  private extractConcepts(text: string): string[] {
    // Simple extraction - in production, use NLP
    const technicalTerms: string[] = [];
    const words = text.toLowerCase().split(/\s+/);

    // Look for capitalized terms (proper nouns, technical terms)
    const sentences = text.split(/[.!?]+/);
    sentences.forEach(sentence => {
      const capitalizedWords = sentence.match(/\b[A-Z][a-z]+\b/g) || [];
      technicalTerms.push(...capitalizedWords);
    });

    // Look for common technical patterns
    const patterns = [
      /\b[A-Za-z]+Script\b/g,
      /\b[A-Za-z]+Test\b/g,
      /\b[A-Za-z]+Driver\b/g,
      /\bAPI\b/g,
      /\bHTTP\b/g,
      /\bJSON\b/g,
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      technicalTerms.push(...matches);
    });

    return [...new Set(technicalTerms)].slice(0, 10);
  }

  /**
   * Get expected concepts for a question
   */
  private getExpectedConcepts(questionId: string): string[] {
    // In production, fetch from database
    return [
      'selenium',
      'webdriver',
      'automation',
      'testing',
      'browser',
    ];
  }

  /**
   * Analyze grammar and spelling
   */
  private async analyzeGrammar(text: string): Promise<{ issues: GrammarIssue[] }> {
    const issues: GrammarIssue[] = [];

    // Basic grammar checks (in production, use LanguageTool API or similar)

    // Check for repeated words
    const words = text.split(/\s+/);
    for (let i = 0; i < words.length - 1; i++) {
      if (words[i].toLowerCase() === words[i + 1].toLowerCase()) {
        issues.push({
          text: `${words[i]} ${words[i + 1]}`,
          suggestion: words[i],
          type: 'repeated-word',
          position: { start: i, end: i + 2 },
        });
      }
    }

    // Check for common spelling errors
    const commonErrors = {
      'thier': 'their',
      'recieve': 'receive',
      'occured': 'occurred',
      'seperate': 'separate',
    };

    words.forEach((word, index) => {
      const cleaned = word.toLowerCase().replace(/[^a-z]/g, '');
      if (commonErrors[cleaned as keyof typeof commonErrors]) {
        issues.push({
          text: word,
          suggestion: commonErrors[cleaned as keyof typeof commonErrors],
          type: 'spelling',
          position: { start: index, end: index + 1 },
        });
      }
    });

    // Check sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    sentences.forEach((sentence, index) => {
      // Check for very long sentences (>40 words)
      const wordCount = sentence.split(/\s+/).length;
      if (wordCount > 40) {
        issues.push({
          text: sentence.substring(0, 50) + '...',
          suggestion: 'Consider breaking this into shorter sentences',
          type: 'sentence-length',
          position: { start: index, end: index + 1 },
        });
      }

      // Check for sentence fragments
      if (wordCount < 3) {
        issues.push({
          text: sentence,
          suggestion: 'This may be a sentence fragment',
          type: 'fragment',
          position: { start: index, end: index + 1 },
        });
      }
    });

    return { issues };
  }

  /**
   * Calculate readability score (Flesch Reading Ease)
   */
  private calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    if (sentences.length === 0 || words.length === 0) {
      return 0;
    }

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    // Normalize to 0-100
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Count syllables in text
   */
  private countSyllables(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let count = 0;

    words.forEach(word => {
      // Remove non-alphabetic characters
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Simple syllable counting (not perfect but reasonable)
      const vowels = word.match(/[aeiouy]+/g);
      count += vowels ? vowels.length : 1;

      // Adjust for silent e
      if (word.endsWith('e')) {
        count--;
      }

      // At least one syllable per word
      count = Math.max(1, count);
    });

    return count;
  }

  /**
   * Check for plagiarism
   */
  private async checkPlagiarism(text: string, userId: string): Promise<number> {
    // In production, integrate with plagiarism detection service
    // For now, return a mock score
    return 0.15; // 15% similarity (acceptable)
  }

  /**
   * Generate comprehensive feedback
   */
  private generateEssayFeedback(
    content: string,
    keyConcepts: { identified: string[]; missing: string[] },
    grammarAnalysis: { issues: GrammarIssue[] },
    readabilityScore: number,
    criteriaScores: Array<{ criterionId: string; score: number; feedback: string }>
  ): string[] {
    const feedback: string[] = [];

    // Word count feedback
    const wordCount = content.split(/\s+/).length;
    if (wordCount < 100) {
      feedback.push('Your response is quite brief. Consider adding more detail and examples.');
    } else if (wordCount > 500) {
      feedback.push('Good depth in your response. Ensure all content is relevant.');
    } else {
      feedback.push('Good length for your response.');
    }

    // Concept coverage feedback
    if (keyConcepts.identified.length > 5) {
      feedback.push('Excellent coverage of key concepts!');
    } else if (keyConcepts.identified.length > 2) {
      feedback.push('Good understanding of main concepts.');
    } else {
      feedback.push('Consider incorporating more key concepts into your response.');
    }

    if (keyConcepts.missing.length > 0) {
      feedback.push(
        `Consider addressing: ${keyConcepts.missing.slice(0, 3).join(', ')}`
      );
    }

    // Grammar feedback
    if (grammarAnalysis.issues.length === 0) {
      feedback.push('Excellent grammar and spelling!');
    } else if (grammarAnalysis.issues.length <= 3) {
      feedback.push('Minor grammar issues. Review for accuracy.');
    } else {
      feedback.push(`${grammarAnalysis.issues.length} grammar/spelling issues found. Please review.`);
    }

    // Readability feedback
    if (readabilityScore >= 70) {
      feedback.push('Very readable and clear writing style.');
    } else if (readabilityScore >= 50) {
      feedback.push('Generally clear, but some sentences could be simplified.');
    } else {
      feedback.push('Consider using shorter sentences and simpler language for clarity.');
    }

    // Rubric-specific feedback
    criteriaScores.forEach(cs => {
      if (cs.feedback) {
        feedback.push(cs.feedback);
      }
    });

    return feedback;
  }

  /**
   * Determine if human review is needed
   */
  private requiresHumanReview(
    percentage: number,
    grammarAnalysis: { issues: GrammarIssue[] },
    keyConcepts: { identified: string[]; missing: string[] },
    plagiarismScore: number
  ): boolean {
    // Edge cases that need human review
    if (percentage > 85 && percentage < 95) {
      return true; // Borderline excellent scores
    }

    if (percentage > 55 && percentage < 65) {
      return true; // Borderline passing scores
    }

    if (plagiarismScore > 0.5) {
      return true; // High plagiarism
    }

    if (grammarAnalysis.issues.length > 10) {
      return true; // Many grammar issues
    }

    if (keyConcepts.identified.length === 0) {
      return true; // No concepts identified
    }

    return false;
  }

  /**
   * Grade multiple essays in batch
   */
  async gradeBatch(submissions: EssaySubmission[]): Promise<EssayGradingResult[]> {
    const results: EssayGradingResult[] = [];

    for (const submission of submissions) {
      const result = await this.gradeEssay(submission);
      results.push(result);
    }

    return results;
  }

  /**
   * Generate rubric from question description
   */
  async generateRubric(
    questionDescription: string,
    totalPoints: number = 100
  ): Promise<Rubric> {
    // Extract key aspects from question
    const aspects = this.extractAspects(questionDescription);

    const pointsPerCriterion = Math.floor(totalPoints / aspects.length);

    const criteria: RubricCriterion[] = aspects.map((aspect, index) => ({
      id: `criterion-${index}`,
      name: aspect,
      description: `Addresses ${aspect} thoroughly`,
      maxPoints: pointsPerCriterion,
      levels: [
        { score: pointsPerCriterion, description: 'Excellent' },
        { score: Math.floor(pointsPerCriterion * 0.75), description: 'Good' },
        { score: Math.floor(pointsPerCriterion * 0.5), description: 'Satisfactory' },
        { score: Math.floor(pointsPerCriterion * 0.25), description: 'Needs Improvement' },
      ],
    }));

    return {
      criteria,
      totalPoints,
    };
  }

  /**
   * Extract aspects from question
   */
  private extractAspects(description: string): string[] {
    // Default aspects for technical essays
    const aspects = [
      'Understanding of concepts',
      'Technical accuracy',
      'Use of examples',
      'Clarity of explanation',
    ];

    // Could be enhanced with NLP to extract specific aspects from question

    return aspects;
  }
}

export const essayGradingService = new EssayGradingService();
