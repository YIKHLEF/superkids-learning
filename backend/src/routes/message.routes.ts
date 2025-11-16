import { Router } from 'express';
import {
  getMessages,
  sendMessage,
  markAsRead,
  deleteMessage,
} from '../controllers/message.controller';

const router = Router();

router.get('/user/:userId', getMessages);
router.post('/', sendMessage);
router.patch('/:messageId/read', markAsRead);
router.delete('/:messageId', deleteMessage);

export default router;
