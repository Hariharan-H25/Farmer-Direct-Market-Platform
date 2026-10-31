import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const getJwtSecret = () => {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  // Keep automated tests deterministic without permitting a production fallback secret.
  if (process.env.NODE_ENV === 'test') return 'test';
  return null;
};

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication failed. No token provided.' });
    }

    const token = authHeader.slice(7).trim();
    const secret = getJwtSecret();
    if (!token || !secret) {
      if (!secret) logger.error('Authentication unavailable: JWT_SECRET is not configured.');
      return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
    }

    // Never decode an untrusted token. Every accepted token must have a valid signature.
    const decodedData = jwt.verify(token, secret, { algorithms: ['HS256'] });
    const userId = decodedData.id || decodedData.sub;
    if (!userId) {
      return res.status(401).json({ message: 'Authentication failed. Invalid token claims.' });
    }

    req.userId = userId.toString();
    req.userEmail = decodedData.email;
    req.userRole = decodedData.role;
    next();
  } catch (error) {
    logger.warn(`Auth failed: Invalid/expired token from IP ${req.ip} - ${error.message}`);
    return res.status(401).json({ message: 'Authentication failed. Invalid or expired token.' });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Admin path ${req.originalUrl}`);
    return res.status(403).json({ message: 'Access denied. Admin permissions required.' });
  }
  next();
};

export const authorizeFarmer = (req, res, next) => {
  if (req.userRole !== 'farmer' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Farmer path ${req.originalUrl}`);
    return res.status(403).json({ message: 'Access denied. Farmer permissions required.' });
  }
  next();
};

export const authorizeBuyer = (req, res, next) => {
  if (req.userRole !== 'buyer' && req.userRole !== 'customer' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Buyer path ${req.originalUrl}`);
    return res.status(403).json({ message: 'Access denied. Buyer permissions required.' });
  }
  next();
};

export const authorizeDelivery = (req, res, next) => {
  if (req.userRole !== 'delivery' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Delivery path ${req.originalUrl}`);
    return res.status(403).json({ message: 'Access denied. Delivery partner permissions required.' });
  }
  next();
};

export const auth = authenticateUser;
export const adminAuth = (req, res, next) => authenticateUser(req, res, () => authorizeAdmin(req, res, next));
export default authenticateUser;
