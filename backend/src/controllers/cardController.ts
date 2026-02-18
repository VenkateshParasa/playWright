import { Request, Response } from 'express';
import { Flashcard, CardStatus } from '../models/Flashcard';
import { Deck } from '../models/Deck';
import mongoose from 'mongoose';

// SM-2 Algorithm constants
const SM2_INITIAL_EASE_FACTOR = 2.5;
const SM2_MIN_EASE_FACTOR = 1.3;

/**
 * Calculate next review using SM-2 algorithm
 */
const calculateNextReview = (
  quality: number,
  easeFactor: number,
  interval: number,
  repetitions: number
): { easeFactor: number; interval: number; repetitions: number } => {
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5');
  }

  let newEaseFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  newEaseFactor = Math.max(newEaseFactor, SM2_MIN_EASE_FACTOR);

  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    newInterval = 1;
    newRepetitions = 0;
  } else {
    if (repetitions === 0) {
      newInterval = 1;
    } else if (repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
    newRepetitions = repetitions + 1;
  }

  return { easeFactor: newEaseFactor, interval: newInterval, repetitions: newRepetitions };
};

/**
 * List cards with filters and pagination
 */
export const listCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      deckId,
      category,
      tags,
      status,
      difficulty,
      search,
      sortBy = 'nextReviewDate',
      sortOrder = 'asc',
      page = 1,
      limit = 50,
      dueOnly = false,
    } = req.query;

    // Build filter
    const filter: any = { userId };

    if (deckId) filter.deckId = deckId;
    if (category) filter.category = category;
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }
    if (status) {
      const statusArray = Array.isArray(status) ? status : [status];
      filter.status = { $in: statusArray };
    }
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.$text = { $search: search as string };
    }
    if (dueOnly === 'true' || dueOnly === true) {
      filter.nextReviewDate = { $lte: new Date() };
      filter.isSuspended = false;
    }

    // Build sort
    const sort: any = {};
    sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Execute query
    const [cards, total] = await Promise.all([
      Flashcard.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Flashcard.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        cards,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error: any) {
    console.error('List cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list cards',
      error: error.message,
    });
  }
};

/**
 * Get single card by ID
 */
export const getCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const card = await Flashcard.findOne({ _id: id, userId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    res.json({
      success: true,
      data: card,
    });
  } catch (error: any) {
    console.error('Get card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get card',
      error: error.message,
    });
  }
};

/**
 * Create new card
 */
export const createCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const {
      deckId,
      front,
      back,
      frontImages,
      backImages,
      category,
      tags,
      difficulty,
      isDraft,
    } = req.body;

    // Validation
    if (!front || !back) {
      return res.status(400).json({
        success: false,
        message: 'Front and back content are required',
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: 'Category is required',
      });
    }

    const card = await Flashcard.create({
      userId,
      deckId: deckId || null,
      front,
      back,
      frontImages: frontImages || [],
      backImages: backImages || [],
      category,
      tags: tags || [],
      difficulty,
      isDraft: isDraft || false,
      easeFactor: SM2_INITIAL_EASE_FACTOR,
      interval: 0,
      repetitions: 0,
      status: CardStatus.NEW,
      nextReviewDate: new Date(),
      isNew: true,
    });

    res.status(201).json({
      success: true,
      message: 'Card created successfully',
      data: card,
    });
  } catch (error: any) {
    console.error('Create card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create card',
      error: error.message,
    });
  }
};

/**
 * Update card
 */
export const updateCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    // Don't allow updating SRS data directly
    delete updates.easeFactor;
    delete updates.interval;
    delete updates.repetitions;
    delete updates.reviewHistory;
    delete updates.totalReviews;
    delete updates.correctReviews;
    delete updates.incorrectReviews;

    const card = await Flashcard.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    res.json({
      success: true,
      message: 'Card updated successfully',
      data: card,
    });
  } catch (error: any) {
    console.error('Update card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update card',
      error: error.message,
    });
  }
};

/**
 * Delete card
 */
export const deleteCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const card = await Flashcard.findOneAndDelete({ _id: id, userId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    res.json({
      success: true,
      message: 'Card deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete card',
      error: error.message,
    });
  }
};

/**
 * Bulk operations
 */
export const bulkOperations = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { operation, cardIds, data } = req.body;

    if (!operation || !cardIds || !Array.isArray(cardIds)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request',
      });
    }

    let result;

    switch (operation) {
      case 'suspend':
        result = await Flashcard.updateMany(
          { _id: { $in: cardIds }, userId },
          { $set: { isSuspended: true, status: CardStatus.SUSPENDED } }
        );
        break;

      case 'resume':
        result = await Flashcard.updateMany(
          { _id: { $in: cardIds }, userId },
          { $set: { isSuspended: false } }
        );
        // Update status for each card
        const cards = await Flashcard.find({ _id: { $in: cardIds }, userId });
        for (const card of cards) {
          (card as any).updateStatus();
          await card.save();
        }
        break;

      case 'reset':
        const resetCards = await Flashcard.find({ _id: { $in: cardIds }, userId });
        for (const card of resetCards) {
          (card as any).resetProgress();
          await card.save();
        }
        result = { modifiedCount: resetCards.length };
        break;

      case 'delete':
        result = await Flashcard.deleteMany({ _id: { $in: cardIds }, userId });
        break;

      case 'changeCategory':
        if (!data?.category) {
          return res.status(400).json({
            success: false,
            message: 'Category is required',
          });
        }
        result = await Flashcard.updateMany(
          { _id: { $in: cardIds }, userId },
          { $set: { category: data.category } }
        );
        break;

      case 'changeDeck':
        result = await Flashcard.updateMany(
          { _id: { $in: cardIds }, userId },
          { $set: { deckId: data?.deckId || null } }
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation',
        });
    }

    res.json({
      success: true,
      message: 'Bulk operation completed',
      data: {
        modifiedCount: result.modifiedCount || result.deletedCount || 0,
      },
    });
  } catch (error: any) {
    console.error('Bulk operations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation',
      error: error.message,
    });
  }
};

/**
 * Suspend card
 */
export const suspendCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const card = await Flashcard.findOneAndUpdate(
      { _id: id, userId },
      { $set: { isSuspended: true, status: CardStatus.SUSPENDED } },
      { new: true }
    );

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    res.json({
      success: true,
      message: 'Card suspended successfully',
      data: card,
    });
  } catch (error: any) {
    console.error('Suspend card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suspend card',
      error: error.message,
    });
  }
};

/**
 * Reset card progress
 */
export const resetCard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const card = await Flashcard.findOne({ _id: id, userId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    (card as any).resetProgress();
    await card.save();

    res.json({
      success: true,
      message: 'Card progress reset successfully',
      data: card,
    });
  } catch (error: any) {
    console.error('Reset card error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset card',
      error: error.message,
    });
  }
};

/**
 * Get card statistics
 */
export const getCardStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;

    const card = await Flashcard.findOne({ _id: id, userId });

    if (!card) {
      return res.status(404).json({
        success: false,
        message: 'Card not found',
      });
    }

    const stats = {
      totalReviews: card.totalReviews,
      correctReviews: card.correctReviews,
      incorrectReviews: card.incorrectReviews,
      successRate: card.totalReviews > 0 ? (card.correctReviews / card.totalReviews) * 100 : 0,
      easeFactor: card.easeFactor,
      interval: card.interval,
      nextReviewDate: card.nextReviewDate,
      lastReviewedAt: card.lastReviewedAt,
      totalTimeSpent: card.totalTimeSpent,
      averageTimeSpent: card.averageTimeSpent,
      reviewHistory: card.reviewHistory,
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('Get card stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get card statistics',
      error: error.message,
    });
  }
};

/**
 * Import cards
 */
export const importCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { cards, deckId, duplicateHandling = 'skip' } = req.body;

    if (!cards || !Array.isArray(cards)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid cards data',
      });
    }

    const imported = [];
    const skipped = [];
    const errors = [];

    for (const cardData of cards) {
      try {
        // Validate required fields
        if (!cardData.front || !cardData.back || !cardData.category) {
          errors.push({ card: cardData, reason: 'Missing required fields' });
          continue;
        }

        // Check for duplicates
        if (duplicateHandling === 'skip') {
          const existing = await Flashcard.findOne({
            userId,
            front: cardData.front,
          });

          if (existing) {
            skipped.push(cardData);
            continue;
          }
        }

        // Create card
        const card = await Flashcard.create({
          userId,
          deckId: deckId || cardData.deckId || null,
          front: cardData.front,
          back: cardData.back,
          frontImages: cardData.frontImages || [],
          backImages: cardData.backImages || [],
          category: cardData.category,
          tags: cardData.tags || [],
          difficulty: cardData.difficulty,
          easeFactor: SM2_INITIAL_EASE_FACTOR,
          interval: 0,
          repetitions: 0,
          status: CardStatus.NEW,
          nextReviewDate: new Date(),
          isNew: true,
        });

        imported.push(card);
      } catch (err: any) {
        errors.push({ card: cardData, reason: err.message });
      }
    }

    res.json({
      success: true,
      message: 'Import completed',
      data: {
        imported: imported.length,
        skipped: skipped.length,
        errors: errors.length,
        details: {
          imported,
          skipped,
          errors,
        },
      },
    });
  } catch (error: any) {
    console.error('Import cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import cards',
      error: error.message,
    });
  }
};

/**
 * Export cards
 */
export const exportCards = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { cardIds, format = 'json' } = req.query;

    let filter: any = { userId };

    if (cardIds) {
      const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
      filter._id = { $in: ids };
    }

    const cards = await Flashcard.find(filter).lean();

    if (format === 'csv') {
      // Generate CSV
      const csv = [
        'Front,Back,Category,Tags,Difficulty,Status',
        ...cards.map(card =>
          [
            `"${card.front.replace(/"/g, '""')}"`,
            `"${card.back.replace(/"/g, '""')}"`,
            card.category,
            `"${card.tags.join(', ')}"`,
            card.difficulty || '',
            card.status,
          ].join(',')
        ),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=cards.csv');
      return res.send(csv);
    }

    // Default to JSON
    res.json({
      success: true,
      data: {
        cards: cards.map(card => ({
          front: card.front,
          back: card.back,
          frontImages: card.frontImages,
          backImages: card.backImages,
          category: card.category,
          tags: card.tags,
          difficulty: card.difficulty,
        })),
        exportedAt: new Date(),
        count: cards.length,
      },
    });
  } catch (error: any) {
    console.error('Export cards error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export cards',
      error: error.message,
    });
  }
};

// =============================================================================
// Deck Management
// =============================================================================

/**
 * List decks
 */
export const listDecks = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    const decks = await Deck.find({ userId }).sort({ createdAt: -1 });

    // Get stats for each deck
    const decksWithStats = await Promise.all(
      decks.map(async deck => {
        const [
          totalCards,
          newCards,
          learningCards,
          reviewCards,
          masteredCards,
          suspendedCards,
          dueCards,
        ] = await Promise.all([
          Flashcard.countDocuments({ userId, deckId: deck._id }),
          Flashcard.countDocuments({ userId, deckId: deck._id, status: CardStatus.NEW }),
          Flashcard.countDocuments({ userId, deckId: deck._id, status: CardStatus.LEARNING }),
          Flashcard.countDocuments({ userId, deckId: deck._id, status: CardStatus.REVIEW }),
          Flashcard.countDocuments({ userId, deckId: deck._id, status: CardStatus.MASTERED }),
          Flashcard.countDocuments({ userId, deckId: deck._id, status: CardStatus.SUSPENDED }),
          Flashcard.countDocuments({
            userId,
            deckId: deck._id,
            nextReviewDate: { $lte: new Date() },
            isSuspended: false,
          }),
        ]);

        return {
          ...deck.toJSON(),
          stats: {
            totalCards,
            newCards,
            learningCards,
            reviewCards,
            masteredCards,
            suspendedCards,
            dueCards,
          },
        };
      })
    );

    res.json({
      success: true,
      data: decksWithStats,
    });
  } catch (error: any) {
    console.error('List decks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list decks',
      error: error.message,
    });
  }
};

/**
 * Create deck
 */
export const createDeck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, color, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Deck name is required',
      });
    }

    const deck = await Deck.create({
      userId,
      name,
      description,
      color: color || '#3B82F6',
      icon: icon || '📚',
    });

    res.status(201).json({
      success: true,
      message: 'Deck created successfully',
      data: deck,
    });
  } catch (error: any) {
    console.error('Create deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create deck',
      error: error.message,
    });
  }
};

/**
 * Update deck
 */
export const updateDeck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const updates = req.body;

    const deck = await Deck.findOneAndUpdate(
      { _id: id, userId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found',
      });
    }

    res.json({
      success: true,
      message: 'Deck updated successfully',
      data: deck,
    });
  } catch (error: any) {
    console.error('Update deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update deck',
      error: error.message,
    });
  }
};

/**
 * Delete deck
 */
export const deleteDeck = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { id } = req.params;
    const { moveCardsTo } = req.query;

    const deck = await Deck.findOne({ _id: id, userId });

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Deck not found',
      });
    }

    // Move cards to another deck or set deckId to null
    await Flashcard.updateMany(
      { userId, deckId: id },
      { $set: { deckId: moveCardsTo || null } }
    );

    await deck.deleteOne();

    res.json({
      success: true,
      message: 'Deck deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete deck error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete deck',
      error: error.message,
    });
  }
};
