import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { errorHandler } from '../utils/errorHandler.js';

export const authenticate = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next(errorHandler(401, 'No token provided'));
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    next(errorHandler(401, 'Invalid token'));
  }
};