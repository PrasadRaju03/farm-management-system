import { errorHandler } from '../utils/errorHandler.js';

export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(errorHandler(403, 'Access denied'));
    }
    next();
  };
};