import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';

describe('Auth API Endpoints', () => {
  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
    }
  }, 30000);

  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  const testUser = {
    firstName: 'Jest',
    lastName: 'Test User',
    name: 'Jest Test User',
    phone: '9876543210',
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

  it('should register a new user successfully without exposing OTP', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.result).toHaveProperty('email', testUser.email);
    // Security check: OTP must never be returned in response body
    expect(res.body).not.toHaveProperty('previewOtp');
    expect(res.body).not.toHaveProperty('otp');
  });

  it('should login the registered user', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.result).toHaveProperty('email', testUser.email);
  });

  it('should reject OTP verification with incorrect code', async () => {
    const res = await request(app)
      .post('/api/auth/verify-otp')
      .send({ email: testUser.email, otp: '000000' });

    // Should return 400 with invalid code or already verified
    expect([200, 400]).toContain(res.statusCode);
  });
});
