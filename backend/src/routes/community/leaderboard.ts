import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getGlobalLeaderboard,
  getUserPosition,
  getCategoryLeaderboard,
  updateLeaderboardOptIn,
} from '../../controllers/community/leaderboardController.js';

const router = Router();

// Public leaderboard routes
router.get('/global', getGlobalLeaderboard);
router.get('/category/:category', getCategoryLeaderboard);

// Authenticated routes
router.use(authenticate);
router.get('/my-position', getUserPosition);
router.put('/opt-in', updateLeaderboardOptIn);

export default router;
