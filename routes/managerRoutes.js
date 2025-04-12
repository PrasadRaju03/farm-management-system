import express from 'express';
import { assignTask } from '../controllers/managerController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate, restrictTo('Farm Manager'));
router.post('/tasks', assignTask);

export default router;