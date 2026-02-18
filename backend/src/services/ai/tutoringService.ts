/**
 * Intelligent Tutoring Service
 * Provides step-by-step guidance, hints, and personalized explanations
 */

import type {
  TutoringRequest,
  TutoringResponse,
  HintGeneration,
  MistakeDetection,
  LearningPathRecommendation,
} from '../../types/ai.js';

interface HintLevel {
  level: number;
  description: string;
  hint: string;
  revealsSolution: boolean;
}

export class TutoringService {
  private hintCache = new Map<string, HintLevel[]>();
  private commonMistakes = new Map<string, MistakeDetection[]>();

  /**
   * Get tutoring assistance for a student
   */
  async getTutoringResponse(request: TutoringRequest): Promise<TutoringResponse> {
    switch (request.type) {
      case 'hint':
        return await this.generateHint(request);
      case 'explanation':
        return await this.generateExplanation(request);
      case 'debug':
        return await this.generateDebugHelp(request);
      case 'concept':
        return await this.explainConcept(request);
      default:
        throw new Error(`Unknown tutoring type: ${request.type}`);
    }
  }

  /**
   * Generate progressive hints
   */
  private async generateHint(request: TutoringRequest): Promise<TutoringResponse> {
    const hints = await this.getHintsForExercise(request.exerciseId);

    // Determine which hint level to give based on attempts
    const hintLevel = Math.min(request.context.attempts, hints.length - 1);
    const currentHint = hints[hintLevel];

    const nextHintAvailable = hintLevel < hints.length - 1;

    return {
      type: 'hint',
      content: currentHint.hint,
      progressive: true,
      level: hintLevel + 1,
      suggestions: this.generateSuggestions(request.context),
      relatedConcepts: this.getRelatedConcepts(request.exerciseId),
      nextSteps: nextHintAvailable
        ? ['Try implementing with this hint', 'Request another hint if needed']
        : ['You have all the hints', 'Try to complete the solution'],
    };
  }

  /**
   * Generate concept explanation
   */
  private async generateExplanation(request: TutoringRequest): Promise<TutoringResponse> {
    const explanation = await this.generateDetailedExplanation(
      request.exerciseId,
      request.context
    );

    return {
      type: 'explanation',
      content: explanation,
      progressive: false,
      level: 0,
      suggestions: [
        'Review the explanation carefully',
        'Try to implement step by step',
        'Test your understanding with examples',
      ],
      relatedConcepts: this.getRelatedConcepts(request.exerciseId),
      nextSteps: [
        'Start with a simple case',
        'Build up to more complex scenarios',
        'Test edge cases',
      ],
    };
  }

  /**
   * Generate debugging help
   */
  private async generateDebugHelp(request: TutoringRequest): Promise<TutoringResponse> {
    if (!request.context.currentCode) {
      return {
        type: 'debug',
        content: 'Please provide your code for debugging assistance.',
        progressive: false,
        level: 0,
        suggestions: [],
        relatedConcepts: [],
        nextSteps: ['Share your current code'],
      };
    }

    // Detect common mistakes
    const mistakes = this.detectMistakes(
      request.context.currentCode,
      request.context.errors
    );

    let debugContent = 'I found some issues in your code:\n\n';

    mistakes.forEach((mistake, index) => {
      debugContent += `${index + 1}. ${mistake.description}\n`;
      debugContent += `   Suggestion: ${mistake.suggestion}\n\n`;
    });

    if (mistakes.length === 0) {
      debugContent = 'Your code structure looks good! ';
      if (request.context.errors.length > 0) {
        debugContent += 'Let\'s analyze the specific errors you\'re encountering.';
      }
    }

    return {
      type: 'debug',
      content: debugContent,
      progressive: false,
      level: 0,
      suggestions: mistakes.map(m => m.suggestion),
      relatedConcepts: this.getRelatedConcepts(request.exerciseId),
      nextSteps: [
        'Fix the identified issues',
        'Test your code',
        'Compare output with expected results',
      ],
    };
  }

  /**
   * Explain a concept
   */
  private async explainConcept(request: TutoringRequest): Promise<TutoringResponse> {
    const concept = request.specificQuestion || 'general concepts';

    const explanation = await this.generateConceptExplanation(concept, request.exerciseId);

    return {
      type: 'concept',
      content: explanation,
      progressive: false,
      level: 0,
      suggestions: [
        'Try examples to solidify understanding',
        'Relate to real-world scenarios',
        'Practice with similar problems',
      ],
      relatedConcepts: this.getRelatedConcepts(request.exerciseId),
      nextSteps: [
        'Apply the concept in code',
        'Experiment with variations',
        'Check documentation for details',
      ],
    };
  }

  /**
   * Get progressive hints for an exercise
   */
  private async getHintsForExercise(exerciseId: string): Promise<HintLevel[]> {
    // Check cache first
    if (this.hintCache.has(exerciseId)) {
      return this.hintCache.get(exerciseId)!;
    }

    // Generate hints (in production, fetch from database)
    const hints: HintLevel[] = [
      {
        level: 1,
        description: 'General approach',
        hint: 'Start by breaking down the problem into smaller steps. What is the main goal?',
        revealsSolution: false,
      },
      {
        level: 2,
        description: 'Structure guidance',
        hint: 'Consider using a function that takes the input and processes it step by step.',
        revealsSolution: false,
      },
      {
        level: 3,
        description: 'Implementation detail',
        hint: 'You\'ll need to iterate through the data. Think about which loop structure works best.',
        revealsSolution: false,
      },
      {
        level: 4,
        description: 'Specific guidance',
        hint: 'Initialize your variables before the loop. Process each item and accumulate results.',
        revealsSolution: true,
      },
      {
        level: 5,
        description: 'Near solution',
        hint: 'Here\'s the basic structure:\n```\nfunction solve(input) {\n  // initialize\n  // process\n  // return result\n}\n```',
        revealsSolution: true,
      },
    ];

    this.hintCache.set(exerciseId, hints);
    return hints;
  }

  /**
   * Generate detailed explanation
   */
  private async generateDetailedExplanation(
    exerciseId: string,
    context: TutoringRequest['context']
  ): Promise<string> {
    // In production, use AI to generate personalized explanations
    let explanation = 'Let me explain this problem:\n\n';

    explanation += '1. **Problem Understanding**: ';
    explanation += 'We need to solve this by implementing the required functionality.\n\n';

    explanation += '2. **Approach**: ';
    explanation += 'Break down the problem into manageable steps:\n';
    explanation += '   - Understand the input format\n';
    explanation += '   - Process the data\n';
    explanation += '   - Return the expected output\n\n';

    explanation += '3. **Key Concepts**: ';
    explanation += 'This problem involves understanding of loops, conditionals, and data structures.\n\n';

    explanation += '4. **Common Pitfalls**: ';
    explanation += 'Watch out for edge cases and null/undefined values.\n\n';

    if (context.attempts > 3) {
      explanation += '5. **Specific Help**: ';
      explanation += 'Since you\'ve tried multiple times, focus on ';
      explanation += 'validating your logic step-by-step with console.log statements.';
    }

    return explanation;
  }

  /**
   * Detect common mistakes in code
   */
  private detectMistakes(
    code: string,
    errors: string[]
  ): MistakeDetection[] {
    const mistakes: MistakeDetection[] = [];

    // Check for common syntax errors
    if (code.includes('function') && !code.includes('return')) {
      mistakes.push({
        type: 'missing-return',
        description: 'Your function may be missing a return statement',
        suggestion: 'Add a return statement to return the result',
        commonMistake: true,
        resources: [
          {
            title: 'Understanding Return Statements',
            url: '/docs/functions',
            type: 'documentation',
          },
        ],
      });
    }

    // Check for variable declaration issues
    if (code.includes('var ')) {
      mistakes.push({
        type: 'var-usage',
        description: 'Using var instead of let or const',
        suggestion: 'Use let for variables that change and const for constants',
        commonMistake: true,
        resources: [
          {
            title: 'Modern JavaScript Variables',
            url: '/docs/variables',
            type: 'tutorial',
          },
        ],
      });
    }

    // Check for missing semicolons (if not using ASI)
    const lines = code.split('\n');
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (
        trimmed.length > 0 &&
        !trimmed.endsWith(';') &&
        !trimmed.endsWith('{') &&
        !trimmed.endsWith('}') &&
        !trimmed.startsWith('//')
      ) {
        if (mistakes.length < 5) { // Limit to first 5
          mistakes.push({
            type: 'missing-semicolon',
            description: `Line ${index + 1} may be missing a semicolon`,
            lineNumber: index + 1,
            suggestion: 'Add semicolons to end statements',
            commonMistake: true,
            resources: [],
          });
        }
      }
    });

    // Check for infinite loops
    if (code.includes('while(true)') || code.includes('while (true)')) {
      if (!code.includes('break') && !code.includes('return')) {
        mistakes.push({
          type: 'infinite-loop',
          description: 'Potential infinite loop detected',
          suggestion: 'Add a break condition or ensure the loop will terminate',
          commonMistake: true,
          resources: [
            {
              title: 'Loop Control',
              url: '/docs/loops',
              type: 'documentation',
            },
          ],
        });
      }
    }

    // Check for callback/async issues
    if (code.includes('async') && !code.includes('await')) {
      mistakes.push({
        type: 'async-await',
        description: 'Async function without await',
        suggestion: 'Use await with promises inside async functions',
        commonMistake: true,
        resources: [
          {
            title: 'Async/Await Tutorial',
            url: '/docs/async',
            type: 'tutorial',
          },
        ],
      });
    }

    // Analyze errors
    errors.forEach(error => {
      if (error.includes('undefined')) {
        mistakes.push({
          type: 'undefined-error',
          description: 'Accessing undefined variable or property',
          suggestion: 'Check that all variables are defined before use',
          commonMistake: true,
          resources: [],
        });
      }

      if (error.includes('is not a function')) {
        mistakes.push({
          type: 'not-a-function',
          description: 'Trying to call something that is not a function',
          suggestion: 'Verify the variable is a function before calling it',
          commonMistake: true,
          resources: [],
        });
      }
    });

    return mistakes;
  }

  /**
   * Generate suggestions based on context
   */
  private generateSuggestions(context: TutoringRequest['context']): string[] {
    const suggestions: string[] = [];

    if (context.attempts === 0) {
      suggestions.push('Start by reading the problem carefully');
      suggestions.push('Think about the input and output');
    } else if (context.attempts < 3) {
      suggestions.push('Review your approach');
      suggestions.push('Test with simple examples first');
    } else {
      suggestions.push('Try a different approach');
      suggestions.push('Break the problem into smaller pieces');
      suggestions.push('Use console.log to debug your logic');
    }

    if (context.timeSpent > 600) { // 10 minutes
      suggestions.push('Take a short break and come back with fresh eyes');
    }

    if (context.errors.length > 5) {
      suggestions.push('Focus on fixing one error at a time');
    }

    return suggestions;
  }

  /**
   * Get related concepts for an exercise
   */
  private getRelatedConcepts(exerciseId: string): string[] {
    // In production, fetch from database based on exercise
    return [
      'Functions',
      'Loops',
      'Conditionals',
      'Arrays',
      'String manipulation',
    ];
  }

  /**
   * Generate concept explanation
   */
  private async generateConceptExplanation(
    concept: string,
    exerciseId: string
  ): Promise<string> {
    // In production, use AI or fetch from knowledge base
    let explanation = `## Understanding ${concept}\n\n`;

    explanation += `${concept} is an important concept in programming. `;
    explanation += 'Let me break it down for you:\n\n';

    explanation += '**Definition**: A clear, concise explanation of what this concept means.\n\n';

    explanation += '**Why it matters**: Understanding this concept helps you write better code.\n\n';

    explanation += '**How to use it**: Here are the key steps:\n';
    explanation += '1. First step\n';
    explanation += '2. Second step\n';
    explanation += '3. Third step\n\n';

    explanation += '**Example**:\n';
    explanation += '```javascript\n';
    explanation += '// Example code demonstrating the concept\n';
    explanation += 'function example() {\n';
    explanation += '  // Implementation\n';
    explanation += '}\n';
    explanation += '```\n\n';

    explanation += '**Common mistakes to avoid**:\n';
    explanation += '- Mistake 1\n';
    explanation += '- Mistake 2\n';

    return explanation;
  }

  /**
   * Generate learning path recommendations
   */
  async generateLearningPath(userId: string): Promise<LearningPathRecommendation> {
    // In production, analyze user's performance and progress
    return {
      userId,
      currentLevel: 'intermediate',
      recommendations: [
        {
          lessonId: 'lesson-1',
          title: 'Advanced Array Methods',
          reason: 'Based on your recent exercises',
          priority: 1,
          estimatedTime: 30,
          prerequisites: ['basic-arrays'],
        },
        {
          lessonId: 'lesson-2',
          title: 'Async Programming',
          reason: 'Fills a gap in your knowledge',
          priority: 2,
          estimatedTime: 45,
          prerequisites: ['promises', 'callbacks'],
        },
        {
          lessonId: 'lesson-3',
          title: 'Error Handling',
          reason: 'Recommended for your skill level',
          priority: 3,
          estimatedTime: 25,
          prerequisites: [],
        },
      ],
      skills: {
        current: ['variables', 'functions', 'loops', 'conditionals'],
        target: ['async-await', 'error-handling', 'testing', 'debugging'],
        gaps: ['async-await', 'error-handling'],
      },
      adaptiveDifficulty: 'medium',
    };
  }

  /**
   * Analyze student's learning style
   */
  async analyzeLearningStyle(userId: string): Promise<{
    style: string;
    preferences: string[];
    recommendations: string[];
  }> {
    // In production, analyze user interactions and preferences
    return {
      style: 'visual-kinesthetic',
      preferences: [
        'Video tutorials',
        'Interactive exercises',
        'Code examples',
      ],
      recommendations: [
        'Focus on visual diagrams',
        'Practice with hands-on exercises',
        'Review code examples thoroughly',
      ],
    };
  }

  /**
   * Generate study plan
   */
  async generateStudyPlan(
    userId: string,
    goals: string[],
    timeAvailable: number
  ): Promise<any> {
    const weeksAvailable = Math.ceil(timeAvailable / 7);
    const plan = [];

    for (let week = 1; week <= Math.min(weeksAvailable, 12); week++) {
      plan.push({
        week,
        topics: [`Topic ${week}`, `Subtopic ${week}`],
        exercises: [`Exercise ${week}.1`, `Exercise ${week}.2`],
        estimatedHours: Math.ceil(timeAvailable / weeksAvailable),
        milestones: [`Complete ${week} exercises`],
      });
    }

    return {
      userId,
      goals,
      timeAvailable,
      plan,
      adaptiveAdjustments: true,
    };
  }

  /**
   * Provide real-time coding assistance
   */
  async provideRealtimeAssistance(
    code: string,
    cursorPosition: { line: number; column: number }
  ): Promise<{
    suggestions: string[];
    warnings: string[];
    autocompletions: string[];
  }> {
    return {
      suggestions: [
        'Consider adding error handling',
        'This variable could be const instead of let',
      ],
      warnings: [
        'Unused variable detected',
      ],
      autocompletions: [
        'function',
        'const',
        'return',
      ],
    };
  }
}

export const tutoringService = new TutoringService();
