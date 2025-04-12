import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import config from '../config/env.js';

const request = supertest(app);

describe('Manager API', () => {
  let managerToken;
  let technicianId;

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Task.deleteMany({});

    const manager = await new User({
      email: `manager-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Manager',
      role: 'Farm Manager',
    }).save();

    const technician = await new User({
      email: `technician-${Date.now()}@example.com`,
      password: 'password123',
      name: 'Technician',
      role: 'Farm Technician',
    }).save();

    technicianId = technician._id;
    managerToken = jwt.sign({ id: manager._id, role: manager.role }, config.jwtSecret);

    // Debug: Verify technician
    const savedTechnician = await User.findById(technicianId);
    console.log('Technician details:', {
      id: technicianId.toString(),
      role: savedTechnician?.role,
      email: savedTechnician?.email,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should assign a task to a technician', async () => {
    const res = await request
      .post('/manager/tasks')
      .set('Authorization', `Bearer ${managerToken}`)
      .send({
        title: 'Fix Tractor',
        description: 'Check engine',
        deadline: '2025-04-20T12:00:00Z',
        technicianId: technicianId.toString(),
      });

    if (res.status !== 201) {
      console.log('Assign task error:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      title: 'Fix Tractor',
      description: 'Check engine',
      technician: technicianId.toString(),
    });
  });

  it('should deny task assignment for non-managers', async () => {
    const user = await new User({
      email: `user-${Date.now()}@example.com`,
      password: 'password123',
      name: 'User',
      role: 'End User',
    }).save();

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret);

    const res = await request
      .post('/manager/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Fix Tractor',
        description: 'Check engine',
        deadline: '2025-04-20T12:00:00Z',
        technicianId: technicianId.toString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Access denied');
  });
});