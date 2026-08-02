import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide both email and password." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (!existingUser) return res.status(404).json({ message: "User doesn't exist" });

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });

    // Check database authorization status
    if (existingUser.isAuthorized === false) {
      return res.status(403).json({ message: "Your email address is not authorized to access this platform. Please contact support." });
    }

    // Check environment whitelist if defined
    if (process.env.AUTHORIZED_EMAILS) {
      const allowedList = process.env.AUTHORIZED_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
      if (allowedList.length > 0 && !allowedList.includes(normalizedEmail)) {
        return res.status(403).json({ message: "Your email address is not in the authorized access list. Access denied." });
      }
    }

    const token = jwt.sign(
      { 
        email: existingUser.email, 
        id: existingUser._id, 
        role: existingUser.role,
        isAuthorized: existingUser.isAuthorized 
      }, 
      process.env.JWT_SECRET || 'test', 
      { expiresIn: "24h" }
    );

    res.status(200).json({ result: existingUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong during login." });
  }
};

export const register = async (req, res) => {
  const { email, password, confirmPassword, firstName, lastName, role, phone, farmName, district, state } = req.body;

  try {
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ message: "Please fill in all required fields." });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) return res.status(400).json({ message: "User already exists with this email address." });

    if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match." });

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await User.create({ 
      email: normalizedEmail, 
      password: hashedPassword, 
      name: `${firstName.trim()} ${lastName.trim()}`, 
      role: role || 'customer',
      phone: phone || '',
      farmName: role === 'farmer' ? farmName : '',
      location: role === 'farmer' ? { district, state } : {},
      produceImage: req.file ? req.file.path : '',
      isAuthorized: true
    });

    const token = jwt.sign(
      { 
        email: result.email, 
        id: result._id, 
        role: result.role,
        isAuthorized: result.isAuthorized 
      }, 
      process.env.JWT_SECRET || 'test', 
      { expiresIn: "24h" }
    );

    res.status(200).json({ result, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong during registration." });
  }
};

export const logout = async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    res.status(500).json({ message: "Logout failed." });
  }
};
