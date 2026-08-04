import jwt from 'jsonwebtoken';

export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "Authentication failed. No token provided." });
    }

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Authentication failed. Token missing." });

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
    console.error("Auth middleware error:", error.message);
    res.status(401).json({ message: "Authentication failed. Invalid or expired token." });
  }
};

export const authorizeAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: "Access denied. Admin permissions required." });
  }
  next();
};

export const authorizeFarmer = (req, res, next) => {
  if (req.userRole !== 'farmer' && req.userRole !== 'admin') {
    return res.status(403).json({ message: "Access denied. Farmer permissions required." });
  }
  next();
};

export const authorizeBuyer = (req, res, next) => {
  if (req.userRole !== 'buyer' && req.userRole !== 'customer' && req.userRole !== 'admin') {
    return res.status(403).json({ message: "Access denied. Buyer permissions required." });
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
