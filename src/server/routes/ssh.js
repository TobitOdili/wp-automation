import { Router } from 'express';
import { sshController } from '../controllers/ssh.js';

const router = Router();

// SSH routes
router.post('/keys', sshController.createKey);
router.get('/keys', sshController.getKeys);
router.post('/test', sshController.testConnection);

export const sshRouter = router;