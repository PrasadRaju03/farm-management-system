import mongoose from 'mongoose';
import supertest from 'supertest';
import { jest } from '@jest/globals';
import app from '../server.js';
import User from '../models/User.js';
import config from '../config/env.js';

const request = supertest(app);

describe('Auth API', () => {
  beforeAll(async () => {
    await mongoose.connect(config.mongoUri);
    await mongoose.connection.dropDatabase();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('should signup a new user', async () => {
    const res = await request.post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'End User',
    });

    if (res.status !== 201) {
      console.log('Signup error:', res.body);
    }

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toMatchObject({
      email: 'test@example.com',
      role: 'End User',
      name: 'Test User',
    });
  });

  it('should fail signup with existing email', async () => {
    await request.post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'End User',
    });

    const res = await request.post('/auth/signup').send({
      email: 'test@example.com',
      password: 'password123',
      name: 'Test User',
      role: 'End User',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toBe('User already exists');
  });

  it('should login an existing user', async () => {
    const signupRes = await request.post('/auth/signup').send({
      email: 'login@example.com',
      password: 'password123',
      name: 'Login User',
      role: 'End User',
    });

    if (signupRes.status !== 201) {
      console.log('Signup before login error:', signupRes.body);
    }

    const res = await request.post('/auth/login').send({
      email: 'login@example.com',
      password: 'password123',
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login@example.com');
  });

  it('should fail login with wrong password', async () => {
    await request.post('/auth/signup').send({
      email: 'login@example.com',
      password: 'password123',
      name: 'Login User',
      role: 'End User',
    });

    const res = await request.post('/auth/login').send({
      email: 'login@example.com',
      password: 'wrongpassword',
    });

    expect(res.status).toBe(401);
    expect(res.body.error.message).toBe('Invalid credentials');
  });
});