import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Auth failed: No token provided from IP ${req.ip} for path ${req.originalUrl}`);
      return res.status(401).json({ message: "Authentication failed. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      logger.warn(`Auth failed: Token missing from IP ${req.ip} for path ${req.originalUrl}`);
      return res.status(401).json({ message: "Authentication failed. Token missing." });
    }

    const isCustomAuth = token.length < 500;
    let decodedData;

    if (isCustomAuth) {
      decodedData = jwt.verify(token, process.env.JWT_SECRET || 'test');
      req.userId = decodedData?.id;
      req.userEmail = decodedData?.email;
      req.userRole = decodedData?.role;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.sub;
      req.userEmail = decodedData?.email;
    }

    next();
  } catch (error) {
    logger.warn(`Auth failed: Invalid/Expired token from IP ${req.ip} - ${error.message}`);
    res.status(401).json({ message: "Authentication failed. Invalid or expired token." });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Admin path ${req.originalUrl}`);
    return res.status(403).json({ message: "Access denied. Admin permissions required." });
  }
  next();
};

export const authorizeFarmer = (req, res, next) => {
  if (req.userRole !== 'farmer' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Farmer path ${req.originalUrl}`);
    return res.status(403).json({ message: "Access denied. Farmer permissions required." });
  }
  next();
};

export const authorizeBuyer = (req, res, next) => {
  if (req.userRole !== 'buyer' && req.userRole !== 'customer' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Buyer path ${req.originalUrl}`);
    return res.status(403).json({ message: "Access denied. Buyer permissions required." });
  }
  next();
};

export const authorizeDelivery = (req, res, next) => {
  if (req.userRole !== 'delivery' && req.userRole !== 'admin') {
    logger.warn(`RBAC Forbidden: User ${req.userId} (Role: ${req.userRole}) attempted Delivery path ${req.originalUrl}`);
    return res.status(403).json({ message: "Access denied. Delivery partner permissions required." });
  }
  next();
};

// Aliases for backwards compatibility
export const auth = authenticateUser;
export const adminAuth = (req, res, next) => {
  authenticateUser(req, res, () => {
    authorizeAdmin(req, res, next);
  });
};

export default authenticateUser;
