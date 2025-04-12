import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import config from '../config/env.js';

const request = supertest(app);

describe('Admin API', () => {
  let adminToken;
  let adminId;

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    const admin = await new User({
      email: `admin-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'Admin',
      role: 'Farm Admin',
    }).save();

    adminId = admin._id;
    adminToken = jwt.sign({ id: admin._id, role: admin.role }, config.jwtSecret);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get all users for Farm Admin', async () => {
    const testUser = await new User({
      email: `test-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'Test User',
      role: 'End User',
    }).save();

    const res = await request
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body.some((user) => user.email === testUser.email)).toBe(true);
  });

  it('should deny access to non-admins', async () => {
    const user = await new User({
      email: `user-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'User',
      role: 'End User',
    }).save();

    const token = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret);

    const res = await request
      .get('/admin/users')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Access denied');
  });
});