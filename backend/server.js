import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(express.json({ limit: '30mb', extended: true }));
app.use(express.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/farmconnect_v2';

mongoose.connect(MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`🚀 Server running on port: ${PORT}`)))
  .catch((error) => {
    console.log(`❌ DB Connection Error: ${error.message}`);
    console.log(`💡 TIP: Make sure MongoDB is running on your machine (e.g., 'net start MongoDB') or check your MONGO_URI in .env`);
  });
