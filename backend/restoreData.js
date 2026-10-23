import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

const restoreDatabase = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const backupDir = path.resolve('backups');
    const usersFile = path.join(backupDir, 'latest_users.json');
    const productsFile = path.join(backupDir, 'latest_products.json');
    const ordersFile = path.join(backupDir, 'latest_orders.json');

    if (!fs.existsSync(usersFile) || !fs.existsSync(productsFile)) {
      console.error('❌ No latest backup files found in backend/backups folder. Run node backupData.js first.');
      process.exit(1);
    }

    const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
    const orders = fs.existsSync(ordersFile) ? JSON.parse(fs.readFileSync(ordersFile, 'utf-8')) : [];

    // Upsert Users
    let usersRestored = 0;
    for (const u of users) {
      await User.findByIdAndUpdate(u._id, u, { upsert: true, new: true });
      usersRestored++;
    }

    // Upsert Products
    let productsRestored = 0;
    for (const p of products) {
      await Product.findByIdAndUpdate(p._id, p, { upsert: true, new: true });
      productsRestored++;
    }

    // Upsert Orders
    let ordersRestored = 0;
    for (const o of orders) {
      await Order.findByIdAndUpdate(o._id, o, { upsert: true, new: true });
      ordersRestored++;
    }

    console.log(`\n🎉 Permanent Restore Complete!`);
    console.log(`   - Users Restored:    ${usersRestored}`);
    console.log(`   - Products Restored: ${productsRestored}`);
    console.log(`   - Orders Restored:   ${ordersRestored}`);

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
  } catch (err) {
    console.error('❌ Restore Failed:', err.message);
    process.exit(1);
  }
};

restoreDatabase();
