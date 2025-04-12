import express from 'express';
import { getTasks } from '../controllers/technicianController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate, restrictTo('Farm Technician'));
router.get('/tasks', getTasks);

export default router;