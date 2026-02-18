/**
 * NLP Service
 * Natural language processing features for content understanding
 */

interface SemanticSearchResult {
  id: string;
  type: 'lesson' | 'flashcard' | 'quiz' | 'exercise';
  title: string;
  content: string;
  relevanceScore: number;
  highlights: string[];
}

interface QuestionAnswerResult {
  answer: string;
  confidence: number;
  sources: Array<{ id: string; title: string; excerpt: string }>;
  relatedQuestions: string[];
}

interface ContentSummary {
  mainPoints: string[];
  keyTerms: string[];
  estimatedReadTime: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface ExtractedConcepts {
  concepts: Array<{
    term: string;
    definition: string;
    importance: number;
  }>;
  relationships: Array<{ from: string; to: string; type: string }>;
}

export class NLPService {
  /**
   * Semantic search across all content
   */
  static async semanticSearch(
    query: string,
    contentTypes?: string[],
    limit: number = 10
  ): Promise<SemanticSearchResult[]> {
    // Tokenize and process query
    const processedQuery = this.preprocessQuery(query);

    // Get all searchable content
    const content = await this.getAllSearchableContent(contentTypes);

    // Calculate relevance scores using TF-IDF
    const scored = content.map((item) => ({
      ...item,
      relevanceScore: this.calculateRelevance(processedQuery, item.content),
      highlights: this.extractHighlights(processedQuery, item.content),
    }));

    // Sort by relevance and return top results
    return scored
      .filter((item) => item.relevanceScore > 0.1)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Question answering system
   */
  static async answerQuestion(
    question: string,
    context?: string
  ): Promise<QuestionAnswerResult> {
    // Find relevant content
    const relevantContent = await this.semanticSearch(question, undefined, 5);

    // Extract answer from most relevant content
    const answer = this.extractAnswer(question, relevantContent);

    // Calculate confidence
    const confidence = this.calculateAnswerConfidence(
      answer,
      relevantContent
    );

    // Find related questions
    const relatedQuestions = this.generateRelatedQuestions(question);

    return {
      answer,
      confidence,
      sources: relevantContent.map((c) => ({
        id: c.id,
        title: c.title,
        excerpt: this.extractExcerpt(c.content, 150),
      })),
      relatedQuestions,
    };
  }

  /**
   * Automatic content tagging
   */
  static async generateTags(
    content: string,
    maxTags: number = 5
  ): Promise<string[]> {
    // Extract keywords using TF-IDF
    const keywords = this.extractKeywords(content, maxTags * 2);

    // Filter to most relevant
    const tags = keywords
      .filter((kw) => this.isRelevantTag(kw))
      .slice(0, maxTags);

    return tags;
  }

  /**
   * Generate study summary
   */
  static generateSummary(content: string): ContentSummary {
    // Extract sentences
    const sentences = this.extractSentences(content);

    // Score sentences by importance
    const scoredSentences = sentences.map((sentence) => ({
      sentence,
      score: this.scoreSentenceImportance(sentence, content),
    }));

    // Select top sentences as main points
    const mainPoints = scoredSentences
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((s) => s.sentence);

    // Extract key terms
    const keyTerms = this.extractKeyTerms(content);

    // Estimate read time (200 words per minute)
    const wordCount = content.split(/\s+/).length;
    const estimatedReadTime = Math.ceil(wordCount / 200);

    // Determine difficulty
    const difficulty = this.assessDifficulty(content);

    return {
      mainPoints,
      keyTerms,
      estimatedReadTime,
      difficulty,
    };
  }

  /**
   * Extract key concepts from lesson
   */
  static extractConcepts(content: string): ExtractedConcepts {
    const concepts: Array<{
      term: string;
      definition: string;
      importance: number;
    }> = [];

    const relationships: Array<{ from: string; to: string; type: string }> = [];

    // Find definition patterns
    const definitionPatterns = [
      /(\w+(?:\s+\w+)*)\s+is\s+(?:a|an|the)?\s*([^.]+)/gi,
      /(\w+(?:\s+\w+)*)\s*:\s*([^.\n]+)/gi,
      /(\w+(?:\s+\w+)*)\s+refers to\s+([^.]+)/gi,
    ];

    definitionPatterns.forEach((pattern) => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach((match) => {
        if (match[1] && match[2]) {
          concepts.push({
            term: match[1].trim(),
            definition: match[2].trim(),
            importance: this.calculateTermImportance(match[1], content),
          });
        }
      });
    });

    // Find relationships
    const relationshipPatterns = [
      { pattern: /(\w+)\s+extends\s+(\w+)/gi, type: 'extends' },
      { pattern: /(\w+)\s+implements\s+(\w+)/gi, type: 'implements' },
      { pattern: /(\w+)\s+uses\s+(\w+)/gi, type: 'uses' },
      { pattern: /(\w+)\s+requires\s+(\w+)/gi, type: 'requires' },
    ];

    relationshipPatterns.forEach(({ pattern, type }) => {
      const matches = [...content.matchAll(pattern)];
      matches.forEach((match) => {
        if (match[1] && match[2]) {
          relationships.push({
            from: match[1],
            to: match[2],
            type,
          });
        }
      });
    });

    return {
      concepts: concepts
        .sort((a, b) => b.importance - a.importance)
        .slice(0, 10),
      relationships,
    };
  }

  /**
   * Classify content by category and difficulty
   */
  static classifyContent(content: string): {
    category: string;
    subcategories: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    topics: string[];
  } {
    // Category detection using keyword matching
    const categories = {
      'playwright-basics': ['playwright', 'browser', 'page', 'locator'],
      'playwright-advanced': ['fixture', 'pom', 'intercept', 'mock'],
      'selenium-basics': ['webdriver', 'findElement', 'selenium'],
      'selenium-advanced': ['grid', 'parallel', 'framework'],
      testing: ['test', 'assert', 'expect', 'verify'],
    };

    let category = 'general';
    let maxScore = 0;

    Object.entries(categories).forEach(([cat, keywords]) => {
      const score = keywords.filter((kw) =>
        content.toLowerCase().includes(kw.toLowerCase())
      ).length;
      if (score > maxScore) {
        maxScore = score;
        category = cat;
      }
    });

    // Extract topics
    const topics = this.extractTopics(content);

    // Assess difficulty
    const difficulty = this.assessDifficulty(content);

    // Determine subcategories
    const subcategories = topics.slice(0, 3);

    return {
      category,
      subcategories,
      difficulty,
      topics,
    };
  }

  /**
   * Detect sentiment in feedback/comments
   */
  static analyzeSentiment(text: string): {
    sentiment: 'positive' | 'neutral' | 'negative';
    score: number;
    emotions: string[];
  } {
    const positiveWords = [
      'good',
      'great',
      'excellent',
      'helpful',
      'clear',
      'easy',
      'love',
      'awesome',
      'perfect',
    ];
    const negativeWords = [
      'bad',
      'poor',
      'difficult',
      'confusing',
      'unclear',
      'hard',
      'hate',
      'terrible',
      'wrong',
    ];

    const words = text.toLowerCase().split(/\s+/);

    let score = 0;
    words.forEach((word) => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    const normalizedScore = score / words.length;

    let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
    if (normalizedScore > 0.05) sentiment = 'positive';
    else if (normalizedScore < -0.05) sentiment = 'negative';

    // Detect emotions
    const emotions: string[] = [];
    if (/frustrat|annoy/.test(text.toLowerCase())) emotions.push('frustrated');
    if (/confus/.test(text.toLowerCase())) emotions.push('confused');
    if (/excit|happy/.test(text.toLowerCase())) emotions.push('excited');

    return {
      sentiment,
      score: normalizedScore,
      emotions,
    };
  }

  /**
   * Generate practice questions from content
   */
  static generateQuestions(
    content: string,
    count: number = 5
  ): Array<{
    question: string;
    type: 'multiple-choice' | 'true-false' | 'short-answer';
    difficulty: 'easy' | 'medium' | 'hard';
  }> {
    const questions: Array<any> = [];
    const concepts = this.extractConcepts(content);

    // Generate questions from concepts
    concepts.concepts.slice(0, count).forEach((concept) => {
      // True/false question
      questions.push({
        question: `True or False: ${concept.definition}`,
        type: 'true-false',
        difficulty: 'easy',
      });

      // Definition question
      questions.push({
        question: `What is ${concept.term}?`,
        type: 'short-answer',
        difficulty: 'medium',
      });
    });

    return questions.slice(0, count);
  }

  // ==================== Helper Methods ====================

  private static preprocessQuery(query: string): string {
    // Convert to lowercase, remove special chars
    let processed = query.toLowerCase().trim();

    // Remove common stop words
    const stopWords = [
      'the',
      'a',
      'an',
      'and',
      'or',
      'but',
      'in',
      'on',
      'at',
      'to',
      'for',
    ];
    const words = processed.split(/\s+/);
    processed = words.filter((w) => !stopWords.includes(w)).join(' ');

    return processed;
  }

  private static async getAllSearchableContent(
    types?: string[]
  ): Promise<any[]> {
    // Would query from database
    // Simplified mock data
    return [
      {
        id: 'lesson-1',
        type: 'lesson',
        title: 'Introduction to Playwright',
        content:
          'Playwright is a modern test automation framework. It supports multiple browsers...',
      },
      {
        id: 'lesson-2',
        type: 'lesson',
        title: 'Locators in Playwright',
        content:
          'Locators are ways to find elements on a page. Playwright provides getByRole, getByLabel...',
      },
    ];
  }

  private static calculateRelevance(query: string, content: string): number {
    const queryWords = query.toLowerCase().split(/\s+/);
    const contentLower = content.toLowerCase();

    // Simple TF-IDF approximation
    let score = 0;
    queryWords.forEach((word) => {
      const count = (contentLower.match(new RegExp(word, 'g')) || []).length;
      score += count * Math.log(2 / (count + 1)); // IDF approximation
    });

    // Normalize by content length
    return score / Math.max(contentLower.length / 100, 1);
  }

  private static extractHighlights(
    query: string,
    content: string
  ): string[] {
    const queryWords = query.split(/\s+/);
    const sentences = this.extractSentences(content);

    const highlights = sentences
      .filter((sentence) =>
        queryWords.some((word) =>
          sentence.toLowerCase().includes(word.toLowerCase())
        )
      )
      .slice(0, 3);

    return highlights;
  }

  private static extractSentences(content: string): string[] {
    return content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 10);
  }

  private static extractAnswer(
    question: string,
    relevantContent: any[]
  ): string {
    if (relevantContent.length === 0) {
      return 'I could not find a specific answer to your question. Please try rephrasing or browse the lessons.';
    }

    // Extract most relevant sentence
    const bestContent = relevantContent[0].content;
    const sentences = this.extractSentences(bestContent);

    // Find sentence with highest relevance to question
    const questionWords = question.toLowerCase().split(/\s+/);

    const scored = sentences.map((sentence) => {
      const sentenceLower = sentence.toLowerCase();
      const matchCount = questionWords.filter((word) =>
        sentenceLower.includes(word)
      ).length;
      return { sentence, score: matchCount };
    });

    const bestMatch = scored.sort((a, b) => b.score - a.score)[0];

    return bestMatch?.sentence || sentences[0] || 'No answer found.';
  }

  private static calculateAnswerConfidence(
    answer: string,
    sources: any[]
  ): number {
    if (sources.length === 0) return 0;
    if (sources[0].relevanceScore > 0.5) return 85;
    if (sources[0].relevanceScore > 0.3) return 65;
    return 40;
  }

  private static generateRelatedQuestions(question: string): string[] {
    // Simplified - would use more sophisticated NLP
    const related = [
      'What are the benefits of this approach?',
      'How does this compare to alternatives?',
      'What are common mistakes to avoid?',
      'Can you show an example?',
    ];

    return related.slice(0, 3);
  }

  private static extractExcerpt(content: string, maxLength: number): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  private static extractKeywords(content: string, count: number): string[] {
    const words = content
      .toLowerCase()
      .match(/\b[a-z]{4,}\b/g) || [];

    // Count frequency
    const frequency = new Map<string, number>();
    words.forEach((word) => {
      frequency.set(word, (frequency.get(word) || 0) + 1);
    });

    // Sort by frequency
    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, count)
      .map(([word]) => word);
  }

  private static isRelevantTag(keyword: string): boolean {
    // Filter out common but not meaningful words
    const irrelevant = ['that', 'this', 'with', 'from', 'have', 'been'];
    return !irrelevant.includes(keyword);
  }

  private static scoreSentenceImportance(
    sentence: string,
    fullContent: string
  ): number {
    let score = 0;

    // First/last sentences are often important
    const sentences = this.extractSentences(fullContent);
    const index = sentences.indexOf(sentence);
    if (index === 0 || index === sentences.length - 1) score += 2;

    // Contains key phrases
    if (/important|key|main|essential|critical/.test(sentence.toLowerCase())) {
      score += 3;
    }

    // Length (medium sentences often important)
    const words = sentence.split(/\s+/).length;
    if (words >= 10 && words <= 25) score += 1;

    return score;
  }

  private static extractKeyTerms(content: string): string[] {
    // Extract capitalized terms and technical words
    const terms = new Set<string>();

    // Capitalized words (likely proper nouns/technical terms)
    const capitalMatches = content.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    capitalMatches.forEach((term) => terms.add(term));

    // Code-related terms
    const codeTerms = content.match(/`[^`]+`/g) || [];
    codeTerms.forEach((term) => terms.add(term.replace(/`/g, '')));

    return Array.from(terms).slice(0, 10);
  }

  private static assessDifficulty(
    content: string
  ): 'beginner' | 'intermediate' | 'advanced' {
    let score = 0;

    // Long words indicate complexity
    const words = content.split(/\s+/);
    const avgWordLength =
      words.reduce((sum, w) => sum + w.length, 0) / words.length;
    if (avgWordLength > 6) score += 2;

    // Technical terms
    const technicalTerms = ['asynchronous', 'polymorphic', 'encapsulation'];
    if (technicalTerms.some((term) => content.toLowerCase().includes(term))) {
      score += 3;
    }

    // Sentence complexity
    const avgSentenceLength = content.length / this.extractSentences(content).length;
    if (avgSentenceLength > 100) score += 2;

    if (score >= 5) return 'advanced';
    if (score >= 2) return 'intermediate';
    return 'beginner';
  }

  private static calculateTermImportance(term: string, content: string): number {
    const occurrences = (
      content.match(new RegExp(term, 'gi')) || []
    ).length;
    return Math.min(10, occurrences);
  }

  private static extractTopics(content: string): string[] {
    // Extract noun phrases as topics
    const topics = this.extractKeywords(content, 10);
    return topics;
  }
}
