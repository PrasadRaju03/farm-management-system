import express from 'express';
import { getProfile } from '../controllers/userController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate, restrictTo('End User'));
router.get('/profile', getProfile);

export default router;