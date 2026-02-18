import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getStudyGroups,
  getStudyGroup,
  createStudyGroup,
  joinStudyGroup,
  leaveStudyGroup,
  inviteToGroup,
  updateStudyGroup,
  addAnnouncement,
  createChallenge,
  getGroupLeaderboard,
  deleteStudyGroup,
} from '../../controllers/community/studyGroupController.js';

const router = Router();

// All study group routes require authentication
router.use(authenticate);

// Group routes
router.get('/groups', getStudyGroups);
router.get('/groups/:id', getStudyGroup);
router.post('/groups', createStudyGroup);
router.put('/groups/:id', updateStudyGroup);
router.delete('/groups/:id', deleteStudyGroup);

// Membership routes
router.post('/groups/:id/join', joinStudyGroup);
router.post('/groups/:id/leave', leaveStudyGroup);
router.post('/groups/:id/invite', inviteToGroup);

// Group content
router.post('/groups/:id/announcements', addAnnouncement);
router.post('/groups/:id/challenges', createChallenge);
router.get('/groups/:id/leaderboard', getGroupLeaderboard);

export default router;
