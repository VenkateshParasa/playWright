import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  getUnreadCount,
  archiveConversation,
  searchMessages,
} from '../../controllers/community/messageController.js';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Conversation routes
router.get('/conversations', getConversations);
router.post('/conversations', getOrCreateConversation);
router.post('/conversations/:conversationId/archive', archiveConversation);

// Message routes
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/conversations/:conversationId/messages', sendMessage);
router.put('/messages/:messageId', editMessage);
router.delete('/messages/:messageId', deleteMessage);

// Utility routes
router.get('/unread-count', getUnreadCount);
router.get('/search', searchMessages);

export default router;
