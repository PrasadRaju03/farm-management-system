import User from '../models/User.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({}).select('-password');
  res.json(users);
});