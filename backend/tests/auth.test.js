import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';

describe('Auth API Endpoints', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  const testUser = {
    name: 'Jest Test User',
    email: `jest_test_${Date.now()}@example.com`,
    password: 'password123',
    role: 'buyer',
  };

  it('should reject login with invalid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent_user_jest@example.com', password: 'wrongpassword' });

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should register a new user successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.result).toHaveProperty('email', testUser.email);
  });

  it('should login the registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.result).toHaveProperty('email', testUser.email);
  });
});
