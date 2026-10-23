import dns from 'node:dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (_) {}

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
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

// Security & Performance Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(mongoSanitize());

// Rate Limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: { message: 'Too many authentication attempts, please try again after 15 minutes' },
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// HTTP Request Logging
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Body Parser
app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));

// CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

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

// Static uploads
app.use('/uploads', express.static('uploads'));

// Socket.io stub for Vercel (no persistent WebSocket in serverless)
app.use((req, res, next) => {
  req.io = { emit: () => {}, to: () => ({ emit: () => {} }) };
  next();
});

// MongoDB connection with caching (important for serverless cold starts)
let cachedConnection = null;

const connectDB = async () => {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) throw new Error('MONGO_URI environment variable is not set');
  cachedConnection = await mongoose.connect(MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  });
  return cachedConnection;
};

// DB connection middleware — runs before every API request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    logger.error('DB connection failed: ' + err.message);
    res.status(503).json({ message: 'Database connection failed. Please try again.' });
  }
});

// Health check (works even without DB)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    version: '2.0.0',
    platform: 'Vercel Serverless'
  });
});

// Legacy health route
app.use('/health', healthRoutes);

// Swagger API Docs
setupSwagger(app);

// Core API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

// Phase 4 Routes
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

// Local dev server (not used on Vercel)
if (process.env.VERCEL !== '1') {
  import('http').then(({ default: http }) => {
    import('socket.io').then(({ Server }) => {
      const server = http.createServer(app);
      const io = new Server(server, {
        cors: {
          origin: allowedOrigins,
          methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT'],
        },
      });

      io.on('connection', (socket) => {
        logger.info(`⚡ Socket.IO connected: ${socket.id}`);
        socket.on('join_user_room', (userId) => { if (userId) socket.join(`user_${userId}`); });
        socket.on('join_farmer_room', (farmerId) => { if (farmerId) socket.join(`farmer_${farmerId}`); });
        socket.on('disconnect', () => { logger.info(`🔥 Socket.IO disconnected: ${socket.id}`); });
      });

      // Override stub with real io
      app.use((req, res, next) => { req.io = io; next(); });

      const PORT = process.env.PORT || 5000;
      const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

      mongoose.connect(MONGO_URI).then(() => {
        logger.info('✅ MongoDB Connected (local)');
        server.listen(PORT, () => {
          logger.info(`🚀 FarmConnect Server running on port: ${PORT}`);
          logger.info(`📖 API Docs: http://localhost:${PORT}/api-docs`);
        });
      }).catch((error) => {
        logger.error(`❌ DB Connection Error: ${error.message}`);
      });
    });
  });
}

export default app;
