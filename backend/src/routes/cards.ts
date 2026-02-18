import express from 'express';
import {
  listCards,
  getCard,
  createCard,
  updateCard,
  deleteCard,
  bulkOperations,
  suspendCard,
  resetCard,
  getCardStats,
  importCards,
  exportCards,
  listDecks,
  createDeck,
  updateDeck,
  deleteDeck,
} from '../controllers/cardController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// =============================================================================
// Card Routes
// =============================================================================

// List cards with filters and pagination
router.get('/cards', listCards);

// Get single card
router.get('/cards/:id', getCard);

// Create new card
router.post('/cards', createCard);

// Update card
router.put('/cards/:id', updateCard);

// Delete card
router.delete('/cards/:id', deleteCard);

// Bulk operations
router.post('/cards/bulk', bulkOperations);

// Suspend card
router.post('/cards/:id/suspend', suspendCard);

// Reset card progress
router.post('/cards/:id/reset', resetCard);

// Get card statistics
router.get('/cards/:id/stats', getCardStats);

// Import cards
router.post('/cards/import', importCards);

// Export cards
router.get('/cards/export', exportCards);

// =============================================================================
// Deck Routes
// =============================================================================

// List decks
router.get('/decks', listDecks);

// Create deck
router.post('/decks', createDeck);

// Update deck
router.put('/decks/:id', updateDeck);

// Delete deck
router.delete('/decks/:id', deleteDeck);

export default router;
