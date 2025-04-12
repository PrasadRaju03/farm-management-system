import Task from '../models/Task.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getTasks = asyncHandler(async (req, res) => {
  const tasks = await Task.find({ technician: req.user.id }).populate('createdBy', 'name email');
  res.json(tasks);
});