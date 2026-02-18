import { Router } from 'express';
import { authenticate, optionalAuthenticate } from '../../middleware/auth.js';
import {
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  blockUser,
  unblockUser,
  getUserThreads,
  getUserGroups,
  getCommunityDashboard,
} from '../../controllers/community/profileController.js';

const router = Router();

// Public routes (optional auth for personalization)
router.get('/dashboard', getCommunityDashboard);
router.get('/:userId', optionalAuthenticate, getUserProfile);
router.get('/:userId/threads', getUserThreads);
router.get('/:userId/groups', getUserGroups);

// Authenticated routes
router.use(authenticate);
router.put('/me', updateProfile);
router.post('/:targetUserId/follow', followUser);
router.post('/:targetUserId/unfollow', unfollowUser);
router.post('/:targetUserId/block', blockUser);
router.post('/:targetUserId/unblock', unblockUser);

export default router;
