import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import config from '../config/env.js';
import { asyncHandler, errorHandler } from '../utils/errorHandler.js';

export const signup = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty(),
  body('role').optional().isIn(['Farm Admin', 'Farm Manager', 'Farm Technician', 'End User']),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errorHandler(400, errors.array()[0].msg));
    }

    const { email, password, name, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(errorHandler(400, 'User already exists'));
    }

    const user = new User({ email, password, name, role });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: '1d',
    });

    res.status(201).json({ token, user: { id: user._id, email, role, name } });
  }),
];

export const login = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errorHandler(400, errors.array()[0].msg));
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return next(errorHandler(401, 'Invalid credentials'));
    }

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret, {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, email, role: user.role, name: user.name } });
  }),
];