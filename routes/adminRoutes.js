import express from 'express';
import { getUsers } from '../controllers/adminController.js';
import { authenticate } from '../middleware/authMiddleware.js';
import { restrictTo } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(authenticate, restrictTo('Farm Admin'));
router.get('/users', getUsers);

export default router;