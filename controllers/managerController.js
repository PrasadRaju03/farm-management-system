import { body, validationResult } from 'express-validator';
import Task from '../models/Task.js';
import User from '../models/User.js';
import { asyncHandler, errorHandler } from '../utils/errorHandler.js';

export const assignTask = [
  body('title').trim().notEmpty(),
  body('description').optional().trim(),
  body('deadline').isISO8601().toDate(),
  body('technicianId').isMongoId(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(errorHandler(400, errors.array()[0].msg));
    }

    const { title, description, deadline, technicianId } = req.body;

    console.log('Received technicianId:', technicianId);
    const technician = await User.findById(technicianId);
    console.log('Found technician:', technician ? { id: technician._id, role: technician.role } : null);

    if (!technician || technician.role !== 'Farm Technician') {
      return next(errorHandler(400, 'Invalid technician'));
    }

    const task = new Task({
      title,
      description,
      deadline,
      technician: technicianId,
      createdBy: req.user.id,
    });

    await task.save();
    res.status(201).json(task);
  }),
];