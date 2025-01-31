import { Router } from 'express';
import adminAuth from '../middleware/adminAuth.js'; // or use verifyToken + isAdmin check
import { getLogs, blockIP, unblockIP } from '../controllers/admin.controller.js';

const router = Router();

// GET logs
router.get('/logs', adminAuth, getLogs);

// POST block IP
router.post('/block', adminAuth, blockIP);

// DELETE unblock IP
router.delete('/unblock/:ip', adminAuth, unblockIP);

export default router;
