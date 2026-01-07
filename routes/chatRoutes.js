import express from 'express';
// import { body } from 'express-validator';
import { chatMessage, getConversations, getMessages } from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post(
    '/message',
    chatMessage
);

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);

export default router;
