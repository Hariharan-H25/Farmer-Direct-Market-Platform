import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';

describe('Product API Endpoints', () => {
  afterAll(async () => {
    await mongoose.connection.close();
    server.close();
  });

  it('should fetch list of products with pagination metadata', async () => {
    const res = await request(app).get('/api/products?page=1&limit=10');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('products');
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('should reject product creation without authentication token', async () => {
    const res = await request(app)
      .post('/api/products')
      .send({ name: 'Unauthorized Crop', price: 100, category: 'Vegetables' });

    expect(res.statusCode).toEqual(401);
  });
});
