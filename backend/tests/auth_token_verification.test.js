import jwt from 'jsonwebtoken';
import { authenticateUser } from '../middleware/auth.js';

const makeResponse = () => {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (body) => { res.body = body; return res; };
  return res;
};

describe('Bearer token signature verification', () => {
  const originalSecret = process.env.JWT_SECRET;
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
  });

  it('accepts a correctly signed application token', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'test-secret';
    const token = jwt.sign({ id: 'user-123', role: 'buyer' }, process.env.JWT_SECRET, { algorithm: 'HS256' });
    const req = { headers: { authorization: `Bearer ${token}` }, ip: '127.0.0.1', originalUrl: '/api/orders' };
    const res = makeResponse();
    const next = jest.fn();

    await authenticateUser(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(req.userId).toBe('user-123');
    expect(req.userRole).toBe('buyer');
  });

  it('rejects a token whose signature was made with another secret', async () => {
    process.env.NODE_ENV = 'test';
    process.env.JWT_SECRET = 'expected-secret';
    const token = jwt.sign({ id: 'attacker', role: 'admin' }, 'attacker-secret', { algorithm: 'HS256' });
    const req = { headers: { authorization: `Bearer ${token}` }, ip: '127.0.0.1', originalUrl: '/api/admin' };
    const res = makeResponse();
    const next = jest.fn();

    await authenticateUser(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });

  it('fails closed when production JWT_SECRET is missing', async () => {
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;
    const token = jwt.sign({ id: 'user-123', role: 'admin' }, 'test', { algorithm: 'HS256' });
    const req = { headers: { authorization: `Bearer ${token}` }, ip: '127.0.0.1', originalUrl: '/api/admin' };
    const res = makeResponse();
    const next = jest.fn();

    await authenticateUser(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(401);
  });
});
