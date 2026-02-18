import { Request, Response } from 'express';
import { Quiz, QuizAttempt } from '../../models/Quiz.js';
import Course from '../../models/Course.js';

/**
 * Get all quizzes
 */
export const getQuizzes = async (req: Request, res: Response) => {
  try {
    const {
      courseId,
      lessonId,
      isPublished,
      search,
      page = 1,
      limit = 20
    } = req.query;

    const query: any = {};

    if (courseId) query.courseId = courseId;
    if (lessonId) query.lessonId = lessonId;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [quizzes, total] = await Promise.all([
      Quiz.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('createdBy', 'name email')
        .populate('courseId', 'title')
        .select('-questions.codeQuestion.solution -questionBank')
        .lean(),
      Quiz.countDocuments(query)
    ]);

    res.json({
      quizzes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Get quizzes error:', error);
    res.status(500).json({ message: 'Failed to fetch quizzes', error: (error as Error).message });
  }
};

/**
 * Get single quiz
 */
export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email')
      .populate('courseId', 'title slug')
      .populate('lessonId', 'title slug');

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Hide solutions from non-instructors
    if (!req.user?.roles?.includes('instructor') && !req.user?.roles?.includes('admin')) {
      quiz.questions.forEach(q => {
        if (q.codeQuestion) {
          (q.codeQuestion as any).solution = undefined;
        }
      });
    }

    res.json(quiz);
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz', error: (error as Error).message });
  }
};

/**
 * Create a new quiz
 */
export const createQuiz = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      courseId,
      lessonId,
      passingScore,
      timeLimit,
      maxAttempts,
      shuffleQuestions,
      shuffleOptions,
      showCorrectAnswers,
      showScoreImmediately,
      allowReview
    } = req.body;

    // Generate slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const quiz = new Quiz({
      title,
      slug,
      description,
      courseId,
      lessonId,
      passingScore: passingScore || 70,
      timeLimit,
      maxAttempts,
      shuffleQuestions: shuffleQuestions || false,
      shuffleOptions: shuffleOptions || false,
      showCorrectAnswers: showCorrectAnswers !== false,
      showScoreImmediately: showScoreImmediately !== false,
      allowReview: allowReview !== false,
      questions: [],
      questionBank: [],
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await quiz.save();
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Create quiz error:', error);
    res.status(500).json({ message: 'Failed to create quiz', error: (error as Error).message });
  }
};

/**
 * Update a quiz
 */
export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check permissions
    if (
      !req.user.roles?.includes('admin') &&
      quiz.createdBy.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    Object.assign(quiz, updateData);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Update quiz error:', error);
    res.status(500).json({ message: 'Failed to update quiz', error: (error as Error).message });
  }
};

/**
 * Delete a quiz
 */
export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Check permissions
    if (!req.user.roles?.includes('admin') && quiz.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if there are attempts
    const attemptCount = await QuizAttempt.countDocuments({ quizId: id });
    if (attemptCount > 0 && !req.query.force) {
      return res.status(400).json({
        message: 'Cannot delete quiz with attempts. Use force=true to delete anyway.',
        attemptCount
      });
    }

    await quiz.deleteOne();
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    res.status(500).json({ message: 'Failed to delete quiz', error: (error as Error).message });
  }
};

/**
 * Add question to quiz
 */
export const addQuestion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.questions.push(questionData);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({ message: 'Failed to add question', error: (error as Error).message });
  }
};

/**
 * Update question
 */
export const updateQuestion = async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;
    const questionData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const question = quiz.questions.find(q => q._id?.toString() === questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    Object.assign(question, questionData);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({ message: 'Failed to update question', error: (error as Error).message });
  }
};

/**
 * Delete question
 */
export const deleteQuestion = async (req: Request, res: Response) => {
  try {
    const { id, questionId } = req.params;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.questions = quiz.questions.filter(q => q._id?.toString() !== questionId);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({ message: 'Failed to delete question', error: (error as Error).message });
  }
};

/**
 * Reorder questions
 */
export const reorderQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questionIds } = req.body; // Array of question IDs in new order

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Reorder questions based on provided IDs
    const reorderedQuestions = questionIds
      .map((qid: string) => quiz.questions.find(q => q._id?.toString() === qid))
      .filter(Boolean);

    quiz.questions = reorderedQuestions;
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Reorder questions error:', error);
    res.status(500).json({ message: 'Failed to reorder questions', error: (error as Error).message });
  }
};

/**
 * Bulk import questions
 */
export const bulkImportQuestions = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions array is required' });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.questions.push(...questions);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json({
      message: `${questions.length} questions imported successfully`,
      quiz
    });
  } catch (error) {
    console.error('Bulk import questions error:', error);
    res.status(500).json({ message: 'Failed to import questions', error: (error as Error).message });
  }
};

/**
 * Add to question bank
 */
export const addToQuestionBank = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const questionData = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    quiz.questionBank.push(questionData);
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Add to question bank error:', error);
    res.status(500).json({ message: 'Failed to add to question bank', error: (error as Error).message });
  }
};

/**
 * Publish/Unpublish quiz
 */
export const toggleQuizPublish = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { publish } = req.body;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    // Validate quiz has questions before publishing
    if (publish && quiz.questions.length === 0) {
      return res.status(400).json({ message: 'Cannot publish a quiz without questions' });
    }

    quiz.isPublished = publish;
    quiz.lastModifiedBy = req.user._id;
    await quiz.save();

    res.json(quiz);
  } catch (error) {
    console.error('Toggle quiz publish error:', error);
    res.status(500).json({ message: 'Failed to toggle quiz publish status', error: (error as Error).message });
  }
};

/**
 * Get quiz statistics
 */
export const getQuizStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [quiz, attempts] = await Promise.all([
      Quiz.findById(id),
      QuizAttempt.find({ quizId: id, status: 'graded' })
    ]);

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const stats = {
      totalAttempts: attempts.length,
      averageScore: attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        : 0,
      passRate: attempts.length > 0
        ? (attempts.filter(a => a.passed).length / attempts.length) * 100
        : 0,
      averageTimeSpent: attempts.length > 0
        ? attempts.reduce((sum, a) => sum + a.timeSpent, 0) / attempts.length
        : 0,
      questionStats: quiz.questions.map((q, index) => {
        const questionAttempts = attempts.map(a => a.answers[index]).filter(Boolean);
        const correctCount = questionAttempts.filter(a => a.isCorrect).length;

        return {
          questionId: q._id,
          question: q.question,
          correctRate: questionAttempts.length > 0
            ? (correctCount / questionAttempts.length) * 100
            : 0,
          attempts: questionAttempts.length
        };
      })
    };

    res.json(stats);
  } catch (error) {
    console.error('Get quiz stats error:', error);
    res.status(500).json({ message: 'Failed to fetch quiz statistics', error: (error as Error).message });
  }
};

/**
 * Duplicate quiz
 */
export const duplicateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const originalQuiz = await Quiz.findById(id);
    if (!originalQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    const slug = (title || `${originalQuiz.title} Copy`)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const quizData = originalQuiz.toObject();
    delete quizData._id;
    delete quizData.createdAt;
    delete quizData.updatedAt;

    const newQuiz = new Quiz({
      ...quizData,
      title: title || `${originalQuiz.title} Copy`,
      slug,
      isPublished: false,
      attemptCount: 0,
      averageScore: 0,
      completionRate: 0,
      createdBy: req.user._id,
      lastModifiedBy: req.user._id
    });

    await newQuiz.save();
    res.status(201).json(newQuiz);
  } catch (error) {
    console.error('Duplicate quiz error:', error);
    res.status(500).json({ message: 'Failed to duplicate quiz', error: (error as Error).message });
  }
};

export default {
  getQuizzes,
  getQuiz,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  reorderQuestions,
  bulkImportQuestions,
  addToQuestionBank,
  toggleQuizPublish,
  getQuizStats,
  duplicateQuiz
};
