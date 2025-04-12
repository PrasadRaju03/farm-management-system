import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import config from '../config/env.js';

const request = supertest(app);

describe('Technician API', () => {
  let technicianToken;
  let technicianId;
  let managerId;

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    const technician = await new User({
      email: `technician-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'Technician',
      role: 'Farm Technician',
    }).save();

    const manager = await new User({
      email: `manager-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'Manager',
      role: 'Farm Manager',
    }).save();

    technicianId = technician._id;
    managerId = manager._id;
    technicianToken = jwt.sign({ id: technician._id, role: technician.role }, config.jwtSecret);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get assigned tasks for technician', async () => {
    await new Task({
      title: 'Fix Tractor',
      description: 'Check engine',
      deadline: new Date('2025-04-20T12:00:00Z'),
      technician: technicianId,
      createdBy: managerId,
    }).save();

    const res = await request
      .get('/technician/tasks')
      .set('Authorization', `Bearer ${technicianToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toMatchObject({
      title: 'Fix Tractor',
      description: 'Check engine',
    });
  });

  it('should deny access to non-technicians', async () => {
    const user = await new User({
      email: `user-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'User',
      role: 'End User',
    }).save();

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret);

    const res = await request
      .get('/technician/tasks')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Access denied');
  });
});