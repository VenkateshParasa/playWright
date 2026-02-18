/**
 * AI Content Generation Service
 * Generates quizzes, exercises, flashcards, and educational content using AI
 */

import type {
  GeneratedContent,
  QuizQuestion,
  FlashcardGeneration,
  ExerciseGeneration,
  ContentGenerationRequest,
  QuizGenerationOptions,
  ExerciseVariation,
} from '../../types/ai.js';

interface AIConfig {
  provider: 'openai' | 'local' | 'mock';
  apiKey?: string;
  model?: string;
  temperature?: number;
}

export class ContentGenerationService {
  private config: AIConfig = {
    provider: 'mock', // Default to mock for demo
    temperature: 0.7,
  };

  /**
   * Configure AI provider
   */
  configure(config: Partial<AIConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Generate quiz questions from lesson content
   */
  async generateQuiz(
    content: string,
    options: QuizGenerationOptions
  ): Promise<QuizQuestion[]> {
    const questions: QuizQuestion[] = [];

    // Extract key concepts from content
    const keyConcepts = this.extractKeyConcepts(content);

    let questionCount = 0;

    // Generate multiple choice questions
    if (options.includeMultipleChoice) {
      const mcqCount = Math.ceil(options.questionCount * 0.6);
      for (let i = 0; i < mcqCount && questionCount < options.questionCount; i++) {
        const concept = keyConcepts[i % keyConcepts.length];
        const question = await this.generateMultipleChoiceQuestion(
          concept,
          content,
          options.difficulty,
          options.distractorQuality
        );
        questions.push(question);
        questionCount++;
      }
    }

    // Generate true/false questions
    if (options.includeTrueFalse) {
      const tfCount = Math.ceil(options.questionCount * 0.2);
      for (let i = 0; i < tfCount && questionCount < options.questionCount; i++) {
        const concept = keyConcepts[i % keyConcepts.length];
        const question = await this.generateTrueFalseQuestion(concept, content, options.difficulty);
        questions.push(question);
        questionCount++;
      }
    }

    // Generate short answer questions
    if (options.includeShortAnswer) {
      const saCount = options.questionCount - questionCount;
      for (let i = 0; i < saCount; i++) {
        const concept = keyConcepts[i % keyConcepts.length];
        const question = await this.generateShortAnswerQuestion(concept, content, options.difficulty);
        questions.push(question);
        questionCount++;
      }
    }

    return questions;
  }

  /**
   * Generate multiple choice question
   */
  private async generateMultipleChoiceQuestion(
    concept: string,
    context: string,
    difficulty: string,
    distractorQuality: string
  ): Promise<QuizQuestion> {
    // In production, use OpenAI API or similar
    const prompt = `Generate a ${difficulty} multiple choice question about: ${concept}
Context: ${context.substring(0, 500)}
Include 4 options with one correct answer and 3 plausible distractors.`;

    const result = await this.callAI(prompt);

    // Mock implementation
    return {
      id: this.generateId(),
      type: 'multiple-choice',
      question: `What is the purpose of ${concept}?`,
      options: [
        `${concept} is used for automated testing`,
        `${concept} is a programming language`,
        `${concept} is a database system`,
        `${concept} is an operating system`,
      ],
      correctAnswer: `${concept} is used for automated testing`,
      explanation: `${concept} is primarily used in automated testing to verify application behavior.`,
      difficulty: difficulty as any,
      tags: [concept],
      estimatedTime: difficulty === 'easy' ? 60 : difficulty === 'medium' ? 90 : 120,
    };
  }

  /**
   * Generate true/false question
   */
  private async generateTrueFalseQuestion(
    concept: string,
    context: string,
    difficulty: string
  ): Promise<QuizQuestion> {
    return {
      id: this.generateId(),
      type: 'true-false',
      question: `${concept} can only be used in JavaScript applications.`,
      correctAnswer: 'false',
      explanation: `${concept} supports multiple programming languages including Java, Python, and C#.`,
      difficulty: difficulty as any,
      tags: [concept],
      estimatedTime: 30,
    };
  }

  /**
   * Generate short answer question
   */
  private async generateShortAnswerQuestion(
    concept: string,
    context: string,
    difficulty: string
  ): Promise<QuizQuestion> {
    return {
      id: this.generateId(),
      type: 'short-answer',
      question: `Explain how ${concept} works in your own words.`,
      correctAnswer: `${concept} works by...`, // Would be graded by essay grading service
      explanation: `A good answer should mention key aspects of ${concept} including its purpose and main features.`,
      difficulty: difficulty as any,
      tags: [concept],
      estimatedTime: 180,
    };
  }

  /**
   * Generate flashcards from lesson content
   */
  async generateFlashcards(
    content: string,
    count: number = 10
  ): Promise<FlashcardGeneration[]> {
    const concepts = this.extractKeyConcepts(content);
    const flashcards: FlashcardGeneration[] = [];

    for (let i = 0; i < Math.min(count, concepts.length); i++) {
      const concept = concepts[i];
      const definition = this.extractDefinition(concept, content);

      flashcards.push({
        front: `What is ${concept}?`,
        back: definition,
        category: 'general',
        tags: [concept],
      });

      // Generate application question
      if (i < count / 2) {
        flashcards.push({
          front: `How do you use ${concept}?`,
          back: `${concept} is used by implementing its methods and following best practices.`,
          category: 'application',
          tags: [concept, 'usage'],
        });
      }
    }

    return flashcards.slice(0, count);
  }

  /**
   * Generate exercise problems
   */
  async generateExercise(
    topic: string,
    difficulty: 'easy' | 'medium' | 'hard',
    language: string
  ): Promise<ExerciseGeneration> {
    const prompt = `Generate a ${difficulty} ${language} coding exercise about ${topic}.
Include:
- Clear description
- Starter code
- Test cases
- Hints`;

    const result = await this.callAI(prompt);

    // Mock implementation
    return {
      title: `${topic} Practice`,
      description: `Practice ${topic} by implementing a solution that demonstrates your understanding.`,
      instructions: [
        `Implement a function that handles ${topic}`,
        'Follow best practices',
        'Pass all test cases',
      ],
      starterCode: this.generateStarterCode(topic, language, difficulty),
      testCases: this.generateTestCases(topic, difficulty),
      hints: [
        `Start by understanding the problem requirements`,
        `Consider edge cases`,
        `Test your solution incrementally`,
      ],
      difficulty,
      estimatedTime: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 30 : 60,
    };
  }

  /**
   * Generate exercise variations
   */
  async generateExerciseVariations(
    originalExerciseId: string,
    exerciseContent: string,
    count: number = 3
  ): Promise<ExerciseVariation> {
    const variations = [];

    for (let i = 0; i < count; i++) {
      variations.push({
        id: this.generateId(),
        title: `Variation ${i + 1}`,
        description: `Modified version with different requirements`,
        difficulty: i === 0 ? 'easy' : i === 1 ? 'medium' : 'hard',
        changes: [
          'Different input constraints',
          'Additional edge cases',
          'Performance requirements',
        ],
      });
    }

    return {
      originalExerciseId,
      variations,
    };
  }

  /**
   * Generate summary from video transcript
   */
  async generateSummary(
    transcript: string,
    maxLength: number = 500
  ): Promise<string> {
    const prompt = `Summarize the following transcript in ${maxLength} characters or less:
${transcript}`;

    const result = await this.callAI(prompt);

    // Mock implementation
    const sentences = transcript.split('.').filter(s => s.trim().length > 0);
    return sentences.slice(0, 3).join('. ') + '.';
  }

  /**
   * Generate explanation for a concept
   */
  async generateExplanation(
    concept: string,
    context: string,
    level: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
  ): Promise<string> {
    const prompt = `Explain ${concept} for a ${level} level student.
Context: ${context}
Use clear language and examples.`;

    const result = await this.callAI(prompt);

    // Mock implementation
    return `${concept} is an important concept in software testing.
It helps developers automate browser interactions and verify application behavior.
At a ${level} level, you should understand how to use it effectively in your projects.`;
  }

  /**
   * Generate code snippets with explanations
   */
  async generateCodeSnippet(
    description: string,
    language: string
  ): Promise<{ code: string; explanation: string }> {
    const prompt = `Generate a ${language} code snippet that: ${description}
Include inline comments and explanation.`;

    const result = await this.callAI(prompt);

    // Mock implementation
    const code = language === 'javascript'
      ? `// Example code snippet\nfunction example() {\n  // Implementation\n  return true;\n}`
      : `# Example code snippet\ndef example():\n    # Implementation\n    return True`;

    return {
      code,
      explanation: `This code demonstrates ${description}. It follows best practices and includes error handling.`,
    };
  }

  /**
   * Extract key concepts from content
   */
  private extractKeyConcepts(content: string): string[] {
    // Simple extraction - in production, use NLP
    const words = content.toLowerCase().split(/\s+/);
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for']);

    // Find frequently mentioned technical terms
    const wordFreq = new Map<string, number>();

    words.forEach(word => {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length > 4 && !stopWords.has(cleaned)) {
        wordFreq.set(cleaned, (wordFreq.get(cleaned) || 0) + 1);
      }
    });

    // Sort by frequency
    const sorted = Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word);

    return sorted.slice(0, 10);
  }

  /**
   * Extract definition from content
   */
  private extractDefinition(concept: string, content: string): string {
    // Find sentences containing the concept
    const sentences = content.split(/[.!?]+/);
    const relevantSentence = sentences.find(s =>
      s.toLowerCase().includes(concept.toLowerCase())
    );

    return relevantSentence?.trim() || `${concept} is a key concept in this domain.`;
  }

  /**
   * Generate starter code
   */
  private generateStarterCode(
    topic: string,
    language: string,
    difficulty: string
  ): string {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return `/**
 * TODO: Implement your solution here
 */
function solve() {
  // Your code here
}

module.exports = { solve };`;

      case 'python':
        return `"""
TODO: Implement your solution here
"""

def solve():
    # Your code here
    pass`;

      case 'java':
        return `public class Solution {
    /**
     * TODO: Implement your solution here
     */
    public static void solve() {
        // Your code here
    }
}`;

      default:
        return '// Your code here';
    }
  }

  /**
   * Generate test cases
   */
  private generateTestCases(topic: string, difficulty: string): any[] {
    const baseTests = [
      {
        id: '1',
        input: 'basic input',
        expectedOutput: 'basic output',
        weight: 1,
      },
      {
        id: '2',
        input: 'edge case',
        expectedOutput: 'edge output',
        weight: 1,
      },
    ];

    if (difficulty === 'hard') {
      baseTests.push({
        id: '3',
        input: 'complex input',
        expectedOutput: 'complex output',
        weight: 2,
      });
    }

    return baseTests;
  }

  /**
   * Call AI provider (OpenAI, etc.)
   */
  private async callAI(prompt: string): Promise<string> {
    if (this.config.provider === 'mock') {
      return this.mockAIResponse(prompt);
    }

    // In production, integrate with OpenAI API:
    /*
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.config.model || 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: this.config.temperature,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
    */

    return this.mockAIResponse(prompt);
  }

  /**
   * Mock AI response for demo
   */
  private mockAIResponse(prompt: string): string {
    return `AI-generated response for: ${prompt.substring(0, 50)}...`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Auto-tag content based on analysis
   */
  async autoTagContent(content: string): Promise<string[]> {
    const concepts = this.extractKeyConcepts(content);
    const additionalTags: string[] = [];

    // Detect content type
    if (content.toLowerCase().includes('selenium')) {
      additionalTags.push('selenium', 'automation');
    }
    if (content.toLowerCase().includes('playwright')) {
      additionalTags.push('playwright', 'testing');
    }
    if (content.toLowerCase().includes('async') || content.toLowerCase().includes('await')) {
      additionalTags.push('asynchronous');
    }

    return [...concepts.slice(0, 5), ...additionalTags];
  }

  /**
   * Detect prerequisites from content
   */
  async detectPrerequisites(content: string): Promise<string[]> {
    const prerequisites: string[] = [];

    if (content.toLowerCase().includes('advanced')) {
      prerequisites.push('basic-concepts', 'fundamentals');
    }

    if (content.includes('async') || content.includes('Promise')) {
      prerequisites.push('javascript-basics', 'callbacks');
    }

    return prerequisites;
  }

  /**
   * Estimate difficulty level
   */
  async estimateDifficulty(content: string): Promise<'beginner' | 'intermediate' | 'advanced'> {
    const complexityIndicators = {
      beginner: ['introduction', 'basic', 'getting started', 'hello world'],
      intermediate: ['advanced features', 'complex', 'optimization'],
      advanced: ['architecture', 'design patterns', 'performance tuning', 'scalability'],
    };

    const contentLower = content.toLowerCase();

    let beginnerScore = 0;
    let intermediateScore = 0;
    let advancedScore = 0;

    complexityIndicators.beginner.forEach(indicator => {
      if (contentLower.includes(indicator)) beginnerScore++;
    });

    complexityIndicators.intermediate.forEach(indicator => {
      if (contentLower.includes(indicator)) intermediateScore++;
    });

    complexityIndicators.advanced.forEach(indicator => {
      if (contentLower.includes(indicator)) advancedScore++;
    });

    if (advancedScore > intermediateScore) return 'advanced';
    if (intermediateScore > beginnerScore) return 'intermediate';
    return 'beginner';
  }

  /**
   * Extract learning objectives
   */
  async extractLearningObjectives(content: string): Promise<string[]> {
    const objectives: string[] = [];

    // Look for common patterns
    const lines = content.split('\n');
    lines.forEach(line => {
      if (
        line.toLowerCase().includes('learn') ||
        line.toLowerCase().includes('understand') ||
        line.toLowerCase().includes('master')
      ) {
        objectives.push(line.trim());
      }
    });

    // If no explicit objectives, generate from key concepts
    if (objectives.length === 0) {
      const concepts = this.extractKeyConcepts(content);
      return concepts.slice(0, 3).map(c => `Understand ${c}`);
    }

    return objectives.slice(0, 5);
  }
}

export const contentGenerationService = new ContentGenerationService();
