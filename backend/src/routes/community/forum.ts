import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getThreads,
  getThread,
  createThread,
  createReply,
  upvoteThread,
  downvoteThread,
  markBestAnswer,
  bookmarkThread,
  flagThread,
  deleteThread,
  getBookmarkedThreads,
} from '../../controllers/community/forumController.js';

const router = Router();

// All forum routes require authentication
router.use(authenticate);

// Thread routes
router.get('/threads', getThreads);
router.get('/threads/bookmarked', getBookmarkedThreads);
router.get('/threads/:id', getThread);
router.post('/threads', createThread);
router.delete('/threads/:id', deleteThread);

// Reply routes
router.post('/threads/:threadId/replies', createReply);

// Voting routes
router.post('/threads/:id/upvote', upvoteThread);
router.post('/threads/:id/downvote', downvoteThread);

// Best answer
router.post('/threads/:threadId/replies/:replyId/best-answer', markBestAnswer);

// Bookmark
router.post('/threads/:id/bookmark', bookmarkThread);

// Moderation
router.post('/threads/:id/flag', flagThread);

export default router;
