/**
 * AI Routes
 * API endpoints for AI-powered features
 */

import express from 'express';
import { RecommendationEngine } from '../../services/ai/recommendationEngine.js';
import { AdaptiveLearningService } from '../../services/ai/adaptiveLearning.js';
import { PerformancePredictionService } from '../../services/ai/performancePrediction.js';
import { CodeAnalysisService } from '../../services/ai/codeAnalysis.js';
import { NLPService } from '../../services/ai/nlpService.js';
import { ChatbotService } from '../../services/ai/chatbot.js';
import { PatternAnalysisService } from '../../services/ai/patternAnalysis.js';

const router = express.Router();

// Recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, limit } = req.query;

    const recommendations = await RecommendationEngine.getRecommendations(
      userId,
      type as any,
      parseInt(limit as string) || 10
    );

    res.json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recommendations/next-lesson', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const recommendations = await RecommendationEngine.recommendNextLesson(userId);
    res.json({ recommendations });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recommendations/flashcards', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { limit } = req.query;
    const cards = await RecommendationEngine.recommendFlashcardsToReview(
      userId,
      parseInt(limit as string) || 20
    );

    res.json({ cards });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Adaptive Learning
router.get('/adaptive/learning-path', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const learningPath = await AdaptiveLearningService.generateLearningPath(userId);
    res.json({ learningPath });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/adaptive/performance-analysis', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const analysis = await AdaptiveLearningService.analyzePerformance(userId);
    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/adaptive/curriculum-adjustment', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const adjustment = await AdaptiveLearningService.adjustCurriculum(userId);
    res.json({ adjustment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Performance Prediction
router.get('/predict/quiz-score/:quizId', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { quizId } = req.params;
    const prediction = await PerformancePredictionService.predictQuizScore(
      userId,
      quizId
    );

    res.json({ prediction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/predict/completion-time/:topicId', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { topicId } = req.params;
    const prediction = await PerformancePredictionService.predictCompletionTime(
      userId,
      topicId
    );

    res.json({ prediction });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/predict/dropout-risk', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const risk = await PerformancePredictionService.assessDropoutRisk(userId);
    res.json({ risk });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/predict/learning-efficiency', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const efficiency = await PerformancePredictionService.calculateLearningEfficiency(userId);
    res.json({ efficiency });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Code Analysis
router.post('/code-analysis', async (req, res) => {
  try {
    const { code, language, exerciseId } = req.body;

    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }

    const analysis = await CodeAnalysisService.analyzeCode(
      code,
      language,
      exerciseId
    );

    res.json({ analysis });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// NLP Features
router.post('/search/semantic', async (req, res) => {
  try {
    const { query, contentTypes, limit } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const results = await NLPService.semanticSearch(
      query,
      contentTypes,
      limit || 10
    );

    res.json({ results });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/qa/answer', async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const answer = await NLPService.answerQuestion(question, context);
    res.json({ answer });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/content/summarize', async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const summary = NLPService.generateSummary(content);
    res.json({ summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Chatbot
router.post('/chat', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await ChatbotService.chat(userId, message, {
      userId,
      currentLesson: context?.currentLesson,
      currentExercise: context?.currentExercise,
      recentTopics: context?.recentTopics || [],
      userLevel: context?.userLevel || 'beginner',
    });

    res.json({ response });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/chat/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const history = ChatbotService.getHistory(userId);
    res.json({ history });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/chat/history', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    ChatbotService.clearHistory(userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Learning Patterns
router.get('/patterns/analysis', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const patterns = await PatternAnalysisService.analyzeLearningPatterns(userId);
    res.json({ patterns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/patterns/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const patterns = await PatternAnalysisService.analyzeLearningPatterns(userId);
    const recommendations = PatternAnalysisService.generateStudyRecommendations(patterns);

    res.json({ recommendations, patterns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
