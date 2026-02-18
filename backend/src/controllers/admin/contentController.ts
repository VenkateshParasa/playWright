import { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

// Mock database - replace with actual database models
const lessons: any[] = [];
const quizzes: any[] = [];
const exercises: any[] = [];
const flashcardDecks: any[] = [];

// Helper function to get all content
export const getAllContent = async (req: Request, res: Response) => {
  try {
    const allContent = [
      ...lessons.map((l) => ({ ...l, type: 'lesson' })),
      ...quizzes.map((q) => ({ ...q, type: 'quiz' })),
      ...exercises.map((e) => ({ ...e, type: 'exercise' })),
      ...flashcardDecks.map((f) => ({ ...f, type: 'flashcard' })),
    ];

    res.json(allContent);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch content' });
  }
};

// LESSON CONTROLLERS
export const getAllLessons = async (req: Request, res: Response) => {
  try {
    res.json(lessons);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

export const getLessonById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = lessons.find((l) => l.id === id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    res.json(lesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

export const createLesson = async (req: Request, res: Response) => {
  try {
    const newLesson = {
      ...req.body,
      id: `lesson-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: req.user?.id,
        name: req.user?.name || 'Admin',
      },
      version: 1,
      versionHistory: [],
    };

    lessons.push(newLesson);
    res.status(201).json(newLesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create lesson' });
  }
};

export const updateLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = lessons.findIndex((l) => l.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const oldLesson = lessons[index];
    const updatedLesson = {
      ...oldLesson,
      ...req.body,
      id, // Preserve ID
      updatedAt: new Date().toISOString(),
      version: oldLesson.version + 1,
      versionHistory: [
        ...oldLesson.versionHistory,
        {
          version: oldLesson.version,
          content: oldLesson.content,
          updatedAt: oldLesson.updatedAt,
          updatedBy: req.user?.name || 'Admin',
        },
      ],
    };

    lessons[index] = updatedLesson;
    res.json(updatedLesson);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

export const deleteLesson = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = lessons.findIndex((l) => l.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    lessons.splice(index, 1);
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

// QUIZ CONTROLLERS
export const getAllQuizzes = async (req: Request, res: Response) => {
  try {
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quizzes' });
  }
};

export const getQuizById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quiz = quizzes.find((q) => q.id === id);

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    res.json(quiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch quiz' });
  }
};

export const createQuiz = async (req: Request, res: Response) => {
  try {
    const newQuiz = {
      ...req.body,
      id: `quiz-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: req.user?.id,
        name: req.user?.name || 'Admin',
      },
    };

    quizzes.push(newQuiz);
    res.status(201).json(newQuiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create quiz' });
  }
};

export const updateQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = quizzes.findIndex((q) => q.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const updatedQuiz = {
      ...quizzes[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    quizzes[index] = updatedQuiz;
    res.json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update quiz' });
  }
};

export const deleteQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = quizzes.findIndex((q) => q.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    quizzes.splice(index, 1);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete quiz' });
  }
};

// EXERCISE CONTROLLERS
export const getAllExercises = async (req: Request, res: Response) => {
  try {
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercises' });
  }
};

export const getExerciseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const exercise = exercises.find((e) => e.id === id);

    if (!exercise) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch exercise' });
  }
};

export const createExercise = async (req: Request, res: Response) => {
  try {
    const newExercise = {
      ...req.body,
      id: `exercise-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: req.user?.id,
        name: req.user?.name || 'Admin',
      },
    };

    exercises.push(newExercise);
    res.status(201).json(newExercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
};

export const updateExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = exercises.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    const updatedExercise = {
      ...exercises[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    exercises[index] = updatedExercise;
    res.json(updatedExercise);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
};

export const deleteExercise = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = exercises.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Exercise not found' });
    }

    exercises.splice(index, 1);
    res.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
};

// FLASHCARD CONTROLLERS
export const getAllFlashcardDecks = async (req: Request, res: Response) => {
  try {
    res.json(flashcardDecks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcard decks' });
  }
};

export const getFlashcardDeckById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deck = flashcardDecks.find((f) => f.id === id);

    if (!deck) {
      return res.status(404).json({ error: 'Flashcard deck not found' });
    }

    res.json(deck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcard deck' });
  }
};

export const createFlashcardDeck = async (req: Request, res: Response) => {
  try {
    const newDeck = {
      ...req.body,
      id: `deck-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: {
        id: req.user?.id,
        name: req.user?.name || 'Admin',
      },
    };

    flashcardDecks.push(newDeck);
    res.status(201).json(newDeck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flashcard deck' });
  }
};

export const updateFlashcardDeck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = flashcardDecks.findIndex((f) => f.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Flashcard deck not found' });
    }

    const updatedDeck = {
      ...flashcardDecks[index],
      ...req.body,
      id,
      updatedAt: new Date().toISOString(),
    };

    flashcardDecks[index] = updatedDeck;
    res.json(updatedDeck);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard deck' });
  }
};

export const deleteFlashcardDeck = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const index = flashcardDecks.findIndex((f) => f.id === id);

    if (index === -1) {
      return res.status(404).json({ error: 'Flashcard deck not found' });
    }

    flashcardDecks.splice(index, 1);
    res.json({ message: 'Flashcard deck deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard deck' });
  }
};

// BULK OPERATIONS
export const bulkPublish = async (req: Request, res: Response) => {
  try {
    const { contentIds } = req.body;

    if (!Array.isArray(contentIds)) {
      return res.status(400).json({ error: 'contentIds must be an array' });
    }

    // Update status for all content types
    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      collection.forEach((item) => {
        if (contentIds.includes(item.id)) {
          item.status = 'published';
          item.publishedAt = new Date().toISOString();
          item.updatedAt = new Date().toISOString();
        }
      });
    });

    res.json({ message: `Published ${contentIds.length} items` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish content' });
  }
};

export const bulkUnpublish = async (req: Request, res: Response) => {
  try {
    const { contentIds } = req.body;

    if (!Array.isArray(contentIds)) {
      return res.status(400).json({ error: 'contentIds must be an array' });
    }

    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      collection.forEach((item) => {
        if (contentIds.includes(item.id)) {
          item.status = 'draft';
          item.updatedAt = new Date().toISOString();
        }
      });
    });

    res.json({ message: `Unpublished ${contentIds.length} items` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish content' });
  }
};

export const bulkDelete = async (req: Request, res: Response) => {
  try {
    const { contentIds } = req.body;

    if (!Array.isArray(contentIds)) {
      return res.status(400).json({ error: 'contentIds must be an array' });
    }

    let deletedCount = 0;

    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      const initialLength = collection.length;
      for (let i = collection.length - 1; i >= 0; i--) {
        if (contentIds.includes(collection[i].id)) {
          collection.splice(i, 1);
        }
      }
      deletedCount += initialLength - collection.length;
    });

    res.json({ message: `Deleted ${deletedCount} items` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

export const publishContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let found = false;

    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      const item = collection.find((i) => i.id === id);
      if (item) {
        item.status = 'published';
        item.publishedAt = new Date().toISOString();
        item.updatedAt = new Date().toISOString();
        found = true;
      }
    });

    if (!found) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content published successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish content' });
  }
};

export const unpublishContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let found = false;

    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      const item = collection.find((i) => i.id === id);
      if (item) {
        item.status = 'draft';
        item.updatedAt = new Date().toISOString();
        found = true;
      }
    });

    if (!found) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content unpublished successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to unpublish content' });
  }
};

export const deleteContent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let found = false;

    [lessons, quizzes, exercises, flashcardDecks].forEach((collection) => {
      const index = collection.findIndex((i) => i.id === id);
      if (index !== -1) {
        collection.splice(index, 1);
        found = true;
      }
    });

    if (!found) {
      return res.status(404).json({ error: 'Content not found' });
    }

    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete content' });
  }
};

// MEDIA UPLOAD
export const uploadMedia = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/uploads/media/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload file' });
  }
};
