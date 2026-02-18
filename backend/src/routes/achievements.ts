import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  getUserProgress,
  getAchievements,
  getUnseenAchievements,
  markAchievementsSeen,
  getLeaderboard,
  getDailyChallenges,
  awardXP,
  updateActivity,
} from '../controllers/achievementsController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user progress (XP, level, streak, stats)
router.get('/progress', getUserProgress);

// Get all achievements with progress
router.get('/achievements', getAchievements);

// Get unseen achievement notifications
router.get('/achievements/unseen', getUnseenAchievements);

// Mark achievements as seen
router.post('/achievements/seen', markAchievementsSeen);

// Get leaderboard
router.get('/leaderboard', getLeaderboard);

// Get daily challenges
router.get('/daily-challenges', getDailyChallenges);

// Award XP (for manual XP grants)
router.post('/xp/award', awardXP);

// Update activity (lessons, quizzes, exercises, etc.)
router.post('/activity', updateActivity);

export default router;
