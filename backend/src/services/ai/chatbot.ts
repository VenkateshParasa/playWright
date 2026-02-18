/**
 * AI Chatbot Assistant
 * Provides intelligent help and guidance to learners
 */

import { NLPService } from './nlpService.js';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatContext {
  userId: string;
  currentLesson?: string;
  currentExercise?: string;
  recentTopics: string[];
  userLevel: 'beginner' | 'intermediate' | 'advanced';
}

interface ChatbotResponse {
  message: string;
  suggestedActions?: Array<{
    label: string;
    action: string;
    data?: any;
  }>;
  relatedTopics?: string[];
  confidence: number;
}

export class ChatbotService {
  private static conversationHistory: Map<string, ChatMessage[]> = new Map();

  /**
   * Process user message and generate response
   */
  static async chat(
    userId: string,
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    // Get conversation history
    const history = this.getHistory(userId);
    history.push({
      role: 'user',
      content: message,
      timestamp: new Date(),
    });

    // Determine intent
    const intent = this.detectIntent(message);

    // Generate response based on intent
    let response: ChatbotResponse;

    switch (intent.type) {
      case 'question':
        response = await this.handleQuestion(message, context);
        break;
      case 'help':
        response = await this.handleHelpRequest(message, context);
        break;
      case 'hint':
        response = await this.handleHintRequest(message, context);
        break;
      case 'explanation':
        response = await this.handleExplanationRequest(message, context);
        break;
      case 'navigation':
        response = await this.handleNavigation(message, context);
        break;
      case 'motivation':
        response = this.provideMotivation(context);
        break;
      case 'feedback':
        response = this.acknowledgeFeedback(message);
        break;
      default:
        response = await this.handleGeneral(message, context);
    }

    // Add to history
    history.push({
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
    });

    // Limit history size
    if (history.length > 50) {
      history.splice(0, history.length - 50);
    }

    this.conversationHistory.set(userId, history);

    return response;
  }

  /**
   * Get conversation history
   */
  static getHistory(userId: string): ChatMessage[] {
    if (!this.conversationHistory.has(userId)) {
      this.conversationHistory.set(userId, []);
    }
    return this.conversationHistory.get(userId)!;
  }

  /**
   * Clear conversation history
   */
  static clearHistory(userId: string): void {
    this.conversationHistory.delete(userId);
  }

  /**
   * Get suggested questions based on context
   */
  static getSuggestedQuestions(context: ChatContext): string[] {
    const questions: string[] = [];

    if (context.currentLesson) {
      questions.push(
        `Can you explain ${context.currentLesson} in simpler terms?`,
        `What are the key concepts in this lesson?`,
        'Can you give me an example?'
      );
    }

    if (context.currentExercise) {
      questions.push(
        'Can you give me a hint?',
        'What approach should I take?',
        'Why is my solution not working?'
      );
    }

    questions.push(
      'What should I learn next?',
      'How can I improve my learning efficiency?',
      'Show me my progress'
    );

    return questions;
  }

  // ==================== Intent Handlers ====================

  private static async handleQuestion(
    question: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    // Use NLP service to find answer
    const answer = await NLPService.answerQuestion(question);

    return {
      message: answer.answer,
      suggestedActions: answer.sources.map((source) => ({
        label: `View: ${source.title}`,
        action: 'navigate',
        data: { type: 'lesson', id: source.id },
      })),
      relatedTopics: answer.relatedQuestions,
      confidence: answer.confidence,
    };
  }

  private static async handleHelpRequest(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    const helpTopics = {
      navigation: 'You can navigate using the menu on the left. Click on "Lessons" to browse all available content.',
      progress: 'Check your progress in the Dashboard. You can see your XP, level, and completed lessons.',
      flashcards: 'Go to the Flashcards section to review cards. Cards due for review will be highlighted.',
      exercises: 'Practice exercises are available in each lesson. Complete them to reinforce your learning.',
    };

    // Detect which help topic
    let helpMessage = 'How can I help you? You can ask me about:\n';
    helpMessage += '- Navigating the platform\n';
    helpMessage += '- Understanding your progress\n';
    helpMessage += '- Using flashcards\n';
    helpMessage += '- Completing exercises\n';
    helpMessage += '- Learning tips and strategies';

    // Try to match specific topic
    for (const [topic, response] of Object.entries(helpTopics)) {
      if (message.toLowerCase().includes(topic)) {
        helpMessage = response;
        break;
      }
    }

    return {
      message: helpMessage,
      suggestedActions: [
        { label: 'Go to Dashboard', action: 'navigate', data: { to: '/dashboard' } },
        { label: 'Browse Lessons', action: 'navigate', data: { to: '/lessons' } },
      ],
      confidence: 80,
    };
  }

  private static async handleHintRequest(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    if (!context.currentExercise) {
      return {
        message: 'Please start an exercise first, and I can provide hints!',
        confidence: 90,
      };
    }

    // Generate progressive hints
    const hints = this.generateHints(context.currentExercise, context.userLevel);

    return {
      message: hints[0],
      suggestedActions: [
        { label: 'Get another hint', action: 'hint' },
        { label: 'Show solution', action: 'solution' },
      ],
      confidence: 85,
    };
  }

  private static async handleExplanationRequest(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    // Extract topic from message
    const topic = this.extractTopic(message);

    // Get explanation from NLP service
    const answer = await NLPService.answerQuestion(
      `Explain ${topic}`,
      context.currentLesson
    );

    // Adapt explanation to user level
    let explanation = answer.answer;

    if (context.userLevel === 'beginner') {
      explanation = `Let me explain in simple terms:\n\n${explanation}\n\nWould you like a practical example?`;
    } else if (context.userLevel === 'advanced') {
      explanation = `${explanation}\n\nFor more advanced details, check the documentation.`;
    }

    return {
      message: explanation,
      suggestedActions: [
        { label: 'Show example', action: 'example' },
        { label: 'Practice exercise', action: 'exercise' },
      ],
      confidence: answer.confidence,
    };
  }

  private static async handleNavigation(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    const navigationMap: Record<string, any> = {
      dashboard: { to: '/dashboard', label: 'Dashboard' },
      lessons: { to: '/lessons', label: 'Lessons' },
      flashcards: { to: '/flashcards', label: 'Flashcards' },
      quizzes: { to: '/quizzes', label: 'Quizzes' },
      exercises: { to: '/exercises', label: 'Exercises' },
      progress: { to: '/progress', label: 'Progress' },
      settings: { to: '/settings', label: 'Settings' },
    };

    // Detect destination
    let destination = null;
    for (const [key, value] of Object.entries(navigationMap)) {
      if (message.toLowerCase().includes(key)) {
        destination = value;
        break;
      }
    }

    if (destination) {
      return {
        message: `Taking you to ${destination.label}...`,
        suggestedActions: [
          { label: `Go to ${destination.label}`, action: 'navigate', data: destination },
        ],
        confidence: 95,
      };
    }

    return {
      message: 'Where would you like to go?',
      suggestedActions: Object.values(navigationMap).map((dest) => ({
        label: dest.label,
        action: 'navigate',
        data: dest,
      })),
      confidence: 70,
    };
  }

  private static provideMotivation(context: ChatContext): ChatbotResponse {
    const motivationalMessages = [
      "You're doing great! Keep up the excellent work! 🌟",
      "Every expert was once a beginner. You're making progress!",
      "Learning takes time. Be patient with yourself! 💪",
      "Small steps every day lead to big achievements!",
      "You've got this! Your dedication will pay off!",
    ];

    const message =
      motivationalMessages[
        Math.floor(Math.random() * motivationalMessages.length)
      ];

    return {
      message,
      suggestedActions: [
        { label: 'Continue learning', action: 'next-lesson' },
        { label: 'View my progress', action: 'navigate', data: { to: '/progress' } },
      ],
      confidence: 100,
    };
  }

  private static acknowledgeFeedback(message: string): ChatbotResponse {
    const sentiment = NLPService.analyzeSentiment(message);

    let response = 'Thank you for your feedback! ';

    if (sentiment.sentiment === 'positive') {
      response += "I'm glad I could help! Keep learning!";
    } else if (sentiment.sentiment === 'negative') {
      response +=
        "I'm sorry if I couldn't help adequately. Would you like to speak with an instructor?";
    } else {
      response += 'Is there anything else I can help you with?';
    }

    return {
      message: response,
      suggestedActions:
        sentiment.sentiment === 'negative'
          ? [
              { label: 'Contact Instructor', action: 'contact' },
              { label: 'Browse Help Topics', action: 'help' },
            ]
          : undefined,
      confidence: 75,
    };
  }

  private static async handleGeneral(
    message: string,
    context: ChatContext
  ): Promise<ChatbotResponse> {
    return {
      message:
        "I'm your learning assistant! I can help you with:\n" +
        '- Answering questions about lessons\n' +
        '- Providing hints for exercises\n' +
        '- Navigating the platform\n' +
        '- Tracking your progress\n' +
        '- Study tips and motivation\n\n' +
        'What would you like to know?',
      suggestedActions: [
        { label: 'Ask a question', action: 'prompt', data: { prompt: 'question' } },
        { label: 'Get a hint', action: 'prompt', data: { prompt: 'hint' } },
        { label: 'Navigation help', action: 'prompt', data: { prompt: 'help' } },
      ],
      confidence: 60,
    };
  }

  // ==================== Helper Methods ====================

  private static detectIntent(message: string): { type: string; confidence: number } {
    const patterns = {
      question: [/what|how|why|when|where|who/i, /\?$/],
      help: [/help|guide|how do i|show me/i],
      hint: [/hint|clue|stuck|help me solve/i],
      explanation: [/explain|what is|what are|tell me about/i],
      navigation: [/go to|navigate|show|open|take me/i],
      motivation: [/motivate|encourage|stuck|frustrated/i],
      feedback: [/thank|thanks|good|bad|not helpful/i],
    };

    for (const [intent, regexps] of Object.entries(patterns)) {
      for (const regex of regexps) {
        if (regex.test(message)) {
          return { type: intent, confidence: 80 };
        }
      }
    }

    return { type: 'general', confidence: 50 };
  }

  private static generateHints(exerciseId: string, level: string): string[] {
    // Simplified - would be exercise-specific
    return [
      'Start by breaking down the problem into smaller steps.',
      'Think about what Playwright methods you need to use.',
      'Remember to use await for asynchronous operations.',
      'Check the documentation for the specific method you need.',
    ];
  }

  private static extractTopic(message: string): string {
    // Extract noun phrases (simplified)
    const words = message
      .toLowerCase()
      .replace(/explain|what is|tell me about/gi, '')
      .trim();
    return words;
  }
}
