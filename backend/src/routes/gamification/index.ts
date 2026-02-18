import express from 'express';
import { achievementController } from '../../controllers/gamification/achievementController';
import { leaderboardController } from '../../controllers/gamification/leaderboardController';
import { questController } from '../../controllers/gamification/questController';
import { rewardController } from '../../controllers/gamification/rewardController';
import { competitionController } from '../../controllers/gamification/competitionController';

const router = express.Router();

// Achievement routes
router.get('/progress', achievementController.getUserProgress);
router.get('/achievements', achievementController.getAchievements);
router.get('/achievements/unseen', achievementController.getUnseenAchievements);
router.post('/achievements/seen', achievementController.markAchievementsSeen);
router.post('/activity', achievementController.trackActivity);

// Leaderboard routes
router.get('/leaderboard', leaderboardController.getLeaderboard);
router.get('/leaderboard/rank', leaderboardController.getUserRank);

// Quest routes
router.get('/quests/daily', questController.getDailyQuests);
router.get('/quests', questController.getAllQuests);
router.get('/quests/:questId', questController.getQuestDetails);
router.post('/quests/:questId/start', questController.startQuest);

// Reward routes
router.get('/rewards', rewardController.getAllRewards);
router.post('/rewards/:rewardId/purchase', rewardController.purchaseReward);
router.get('/inventory', rewardController.getUserInventory);
router.post('/inventory/equip', rewardController.equipItem);
router.post('/boosters/:rewardId/activate', rewardController.activateBooster);

// Competition routes
router.get('/competitions', competitionController.getAllCompetitions);
router.get('/competitions/active', competitionController.getActiveCompetitions);
router.get('/competitions/mine', competitionController.getUserCompetitions);
router.get('/competitions/:competitionId', competitionController.getCompetitionDetails);
router.get('/competitions/:competitionId/leaderboard', competitionController.getCompetitionLeaderboard);
router.post('/competitions/:competitionId/join', competitionController.joinCompetition);

export default router;
