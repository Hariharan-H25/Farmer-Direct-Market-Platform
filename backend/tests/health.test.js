import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';

describe('GET /health Monitoring Endpoint', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it('should return system health status with valid monitoring payload', async () => {
    const res = await request(app).get('/health');
    expect([200, 503]).toContain(res.statusCode);
    expect(res.body).toHaveProperty('status');
    expect(res.body).toHaveProperty('uptime');
    expect(res.body).toHaveProperty('database');
    expect(res.body).toHaveProperty('memory');
    expect(res.body).toHaveProperty('version', '5.0.0');
  });
});
