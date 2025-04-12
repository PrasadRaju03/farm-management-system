import User from '../models/User.js';
import { asyncHandler } from '../utils/errorHandler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  res.json(user);
});