import mongoose from 'mongoose';
import supertest from 'supertest';
import jwt from 'jsonwebtoken';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import config from '../config/env.js';

const request = supertest(app);

describe('User API', () => {
  let userToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(config.mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});

    const user = await new User({
      email: `user-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'User',
      role: 'End User',
    }).save();

    userId = user._id;
    userToken = jwt.sign({ id: user._id, role: user.role }, config.jwtSecret);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should get profile for End User', async () => {
    const res = await request
      .get('/user/profile')
      .set('Authorization', `Bearer ${userToken}`);

    if (res.status !== 200 || !res.body) {
      console.log('Get profile error:', res.status, res.body);
    }

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      role: 'End User',
      name: 'User',
    });
  });

  it('should deny access to non-end-users', async () => {
    const admin = await new User({
      email: `admin-${Date.now()}@example.com`, // Unique email
      password: 'password123',
      name: 'Admin',
      role: 'Farm Admin',
    }).save();

    const token = jwt.sign({ id: admin._id, role: admin.role }, config.jwtSecret);

    const res = await request
      .get('/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Access denied');
  });
});