import { Router } from 'express';
import { sendBroadcastMessage, helloApi } from '../controllers/messageController.js';

const router = Router();

router.get('/hello', helloApi);
router.post('/send', sendBroadcastMessage);

export default router;