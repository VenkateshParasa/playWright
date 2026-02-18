import { Router } from 'express';
import forumRoutes from './forum.js';
import studyGroupRoutes from './studyGroup.js';
import messageRoutes from './message.js';
import leaderboardRoutes from './leaderboard.js';
import profileRoutes from './profile.js';

const router = Router();

// Mount community routes
router.use('/forum', forumRoutes);
router.use('/study-groups', studyGroupRoutes);
router.use('/messages', messageRoutes);
router.use('/leaderboard', leaderboardRoutes);
router.use('/profiles', profileRoutes);

export default router;
