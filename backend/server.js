import dns from 'node:dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (_) {}
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import compression from 'compression';
import morgan from 'morgan';

import logger from './utils/logger.js';
import { setupSwagger } from './swagger.js';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import weatherRoutes from './routes/weatherRoutes.js';
import marketRoutes from './routes/marketRoutes.js';
import farmerRoutes from './routes/farmerRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io Real-time WebSockets
const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
  },
});

io.on('connection', (socket) => {
  logger.info(`⚡ Client connected to Socket.IO WebSocket: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_farmer_room', (farmerId) => {
    if (farmerId) socket.join(`farmer_${farmerId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`🔥 Client disconnected: ${socket.id}`);
  });
});

// Security & Performance Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Helmet for HTTP security headers
app.use(compression()); // Gzip compression
app.use(mongoSanitize()); // Prevent NoSQL injection attacks

// Rate Limiting — 150 requests per 15 minutes per IP for general API
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for authentication (15 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// HTTP Request Logging via Morgan -> Winston stream
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Body Parser Middleware
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// CORS setup
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:80'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error('CORS policy restriction: origin not allowed'));
      }
    },
    credentials: true,
  })
);

app.use('/uploads', express.static('uploads'));

// Inject Socket.io into req object for controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Monitoring Health Endpoint
app.use('/health', healthRoutes);

// Setup Swagger API Documentation UI (/api-docs)
setupSwagger(app);

// Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Phase 4 Routes - AI, Weather, Market Intelligence, Farmer Maps
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/farmers', farmerRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  logger.error(`Server Error [${req.method} ${req.url}]: ${err.message}`, { stack: err.stack });
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

// Connect to MongoDB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    logger.info(`✅ MongoDB Connected`);
    // Only start HTTP listener in non-serverless environments (local dev)
    if (process.env.VERCEL !== '1') {
      server.listen(PORT, () => {
        logger.info(`🚀 FarmConnect Server running on port: ${PORT}`);
        logger.info(`📖 API Docs: http://localhost:${PORT}/api-docs`);
        logger.info(`🩺 Health Check: http://localhost:${PORT}/health`);
      });
    }
  })
  .catch((error) => {
    logger.error(`❌ DB Connection Error: ${error.message}`);
    console.log(`💡 TIP: Make sure MongoDB is running or check MONGO_URI in .env`);
  });

// Named exports for local dev & tests
export { app, server };

// Default export for Vercel serverless (@vercel/node uses this)
export default app;

