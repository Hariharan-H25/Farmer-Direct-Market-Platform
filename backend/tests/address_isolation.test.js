import request from 'supertest';
import mongoose from 'mongoose';
import { app, server } from '../server.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

describe('Address Isolation & Data Privacy Security Tests', () => {
  let userAToken, userBToken;
  let userAId, userBId;
  let addressAId, addressBId;

  beforeAll(async () => {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
    }

    // Clean up test users
    await User.deleteMany({ email: { $in: ['usera_isolation@test.com', 'userb_isolation@test.com'] } });

    // Register User A
    const resA = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'usera_isolation@test.com',
        password: 'Password123!',
        firstName: 'UserA',
        lastName: 'Isolation',
        phone: '9876543211',
        role: 'buyer'
      });
    userAToken = resA.body.token;
    userAId = resA.body.result?._id || resA.body.result?.id;

    // Register User B
    const resB = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'userb_isolation@test.com',
        password: 'Password123!',
        firstName: 'UserB',
        lastName: 'Isolation',
        phone: '9876543212',
        role: 'buyer'
      });
    userBToken = resB.body.token;
    userBId = resB.body.result?._id || resB.body.result?.id;
  }, 30000);

  afterAll(async () => {
    await User.deleteMany({ email: { $in: ['usera_isolation@test.com', 'userb_isolation@test.com'] } });
    if (userAId || userBId) {
      await Order.deleteMany({ customer: { $in: [userAId, userBId].filter(Boolean) } });
    }
    await mongoose.connection.close();
    server.close();
  });

  it('1. User A successfully saves Address A', async () => {
    const res = await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        recipientName: 'User A Recipient',
        mobileNumber: '9876543211',
        houseFlat: 'Flat 101, A Block',
        streetArea: 'Orchard Road',
        city: 'Salem',
        district: 'Salem',
        state: 'Tamil Nadu',
        pincode: '636001',
        addressType: 'Home'
      });

    expect(res.status).toBe(201);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].recipientName).toBe('User A Recipient');
    expect(res.body[0].city).toBe('Salem');
    addressAId = res.body[0]._id;
  });

  it('2. User B successfully saves Address B', async () => {
    const res = await request(app)
      .post('/api/auth/addresses')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        recipientName: 'User B Recipient',
        mobileNumber: '9876543212',
        houseFlat: 'House 202, B Wing',
        streetArea: 'Palm Avenue',
        city: 'Coimbatore',
        district: 'Coimbatore',
        state: 'Tamil Nadu',
        pincode: '641001',
        addressType: 'Work'
      });

    expect(res.status).toBe(201);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].recipientName).toBe('User B Recipient');
    expect(res.body[0].city).toBe('Coimbatore');
    addressBId = res.body[0]._id;
  });

  it('3. User B requests saved addresses -> must see ONLY Address B, NEVER Address A', async () => {
    const res = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].recipientName).toBe('User B Recipient');
    expect(res.body[0].city).toBe('Coimbatore');

    // Confirm that Address A is completely absent
    const foundAddressA = res.body.find(a => a._id.toString() === addressAId.toString() || a.city === 'Salem');
    expect(foundAddressA).toBeUndefined();
  });

  it('4. User A requests saved addresses -> must see ONLY Address A, NEVER Address B', async () => {
    const res = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(1);
    expect(res.body[0].recipientName).toBe('User A Recipient');
    expect(res.body[0].city).toBe('Salem');

    // Confirm that Address B is completely absent
    const foundAddressB = res.body.find(a => a._id.toString() === addressBId.toString() || a.city === 'Coimbatore');
    expect(foundAddressB).toBeUndefined();
  });

  it('5. User A CANNOT delete User B\'s Address B via direct API request', async () => {
    const res = await request(app)
      .delete(`/api/auth/addresses/${addressBId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    // Must be rejected with 404 because Address B does not belong to User A
    expect(res.status).toBe(404);

    // Verify User B's address still exists intact
    const verifyB = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${userBToken}`);
    expect(verifyB.body.some(a => a._id.toString() === addressBId.toString())).toBe(true);
  });

  it('6. User A CANNOT update User B\'s Address B via manipulated identifier', async () => {
    const res = await request(app)
      .put(`/api/auth/addresses/${addressBId}`)
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        recipientName: 'Hacked Recipient Name'
      });

    // Must be rejected
    expect(res.status).toBe(404);

    // Verify User B's recipient name was not modified
    const verifyB = await request(app)
      .get('/api/auth/addresses')
      .set('Authorization', `Bearer ${userBToken}`);
    const addr = verifyB.body.find(a => a._id.toString() === addressBId.toString());
    expect(addr.recipientName).toBe('User B Recipient');
  });

  it('7. User B CANNOT select or checkout using User A\'s Address ID', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        items: [{
          product: new mongoose.Types.ObjectId(),
          quantity: 1,
          price: 100
        }],
        addressId: addressAId, // Manipulated address ID belonging to User A
        shippingAddress: {
          addressId: addressAId,
          recipientName: 'Spoofed Address',
          mobileNumber: '9876543210',
          houseFlat: 'Spoofed House',
          streetArea: 'Spoofed Area',
          city: 'Salem',
          pincode: '636001'
        }
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toMatch(/Security violation.*does not belong to your account/i);
  });
});
