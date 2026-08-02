import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE"]
  }
});

// Real-time WebSockets event setup
io.on('connection', (socket) => {
  console.log(`⚡ Client connected to Socket.IO WebSocket: ${socket.id}`);

  socket.on('join_user_room', (userId) => {
    if (userId) socket.join(`user_${userId}`);
  });

  socket.on('join_farmer_room', (farmerId) => {
    if (farmerId) socket.join(`farmer_${farmerId}`);
  });

  socket.on('disconnect', () => {
    console.log(`🔥 Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Pass io instance to request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_v2';

mongoose.connect(MONGO_URI)
  .then(() => server.listen(PORT, () => console.log(`🚀 Server & Socket.IO running on port: ${PORT}`)))
  .catch((error) => {
    console.log(`❌ DB Connection Error: ${error.message}`);
    console.log(`💡 TIP: Make sure MongoDB is running on your machine (e.g., 'net start MongoDB') or check your MONGO_URI in .env`);
  });
