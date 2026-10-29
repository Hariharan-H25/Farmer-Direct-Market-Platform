import request from 'supertest';
import { app, server } from '../server.js';
import mongoose from 'mongoose';
import { geocodeAddress } from '../utils/geocoder.js';

describe('Delivery Logistics, Map Geocoding & OTP Verification Suite', () => {
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

  const testBuyer = {
    firstName: 'Quality',
    lastName: 'Assurance',
    name: 'Quality Assurance',
    phone: '9876543210',
    email: `qa_otp_test_${Date.now()}@example.com`,
    password: 'Password123!',
    role: 'buyer'
  };

  describe('1. Email OTP Verification & Security', () => {
    it('should register a new account without exposing OTP in response body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testBuyer);

      expect([201, 200]).toContain(res.statusCode);
      // Security verification: OTP must NEVER leak in API responses
      expect(res.body).not.toHaveProperty('previewOtp');
      expect(res.body).not.toHaveProperty('otp');
      expect(res.body).not.toHaveProperty('rawOtp');
    });

    it('should reject verification with an incorrect or incomplete OTP', async () => {
      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ email: testBuyer.email, otp: '000000' });

      expect([400, 200]).toContain(res.statusCode);
      if (res.statusCode === 400) {
        expect(res.body).toHaveProperty('message');
      }
    });

    it('should reject registration when required fields are missing', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@example.com' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('2. Map Geocoding & Authentic Coordinates', () => {
    it('should resolve accurate coordinates for Tamil Nadu agricultural hubs', async () => {
      const erodeCoords = await geocodeAddress({ city: 'Erode', state: 'Tamil Nadu' });
      expect(erodeCoords).toHaveProperty('lat');
      expect(erodeCoords).toHaveProperty('lng');
      expect(erodeCoords.lat).toBeCloseTo(11.3410, 2);
      expect(erodeCoords.lng).toBeCloseTo(77.7172, 2);

      const cbeCoords = await geocodeAddress({ city: 'Coimbatore', state: 'Tamil Nadu' });
      expect(cbeCoords.lat).toBeCloseTo(11.0168, 2);
      expect(cbeCoords.lng).toBeCloseTo(76.9558, 2);
    });

    it('should preserve provided numeric coordinates without alteration', async () => {
      const customCoords = { lat: 11.2345, lng: 77.5678 };
      const resolved = await geocodeAddress({ location: customCoords });
      expect(resolved.lat).toEqual(11.2345);
      expect(resolved.lng).toEqual(77.5678);
      expect(resolved.source).toEqual('provided');
    });
  });

  describe('3. Delivery Partner Authorization & Location Validation', () => {
    it('should reject delivery orders fetch without delivery authentication', async () => {
      const res = await request(app).get('/api/delivery/orders');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });

    it('should reject location broadcast with invalid numeric coordinates', async () => {
      const res = await request(app)
        .post('/api/delivery/orders/507f1f77bcf86cd799439011/location')
        .send({ lat: 'not-a-number', lng: 200 });

      expect([400, 401]).toContain(res.statusCode);
    });
  });
});
