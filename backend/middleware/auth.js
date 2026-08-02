import jwt from 'jsonwebtoken';

const auth = async (req, res, next) => {
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

export const adminAuth = async (req, res, next) => {
  auth(req, res, () => {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: "Access denied. Admin permissions required." });
    }
    next();
  });
};

export default auth;
