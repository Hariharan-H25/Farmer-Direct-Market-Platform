import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';
import Order from './models/Order.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

const backupDatabase = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    const backupDir = path.resolve('backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFolder = path.join(backupDir, `backup_${timestamp}`);
    fs.mkdirSync(backupFolder, { recursive: true });

    // Fetch collections
    const users = await User.find({}).lean();
    const products = await Product.find({}).lean();
    const orders = await Order.find({}).lean();

    fs.writeFileSync(path.join(backupFolder, 'users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(backupFolder, 'products.json'), JSON.stringify(products, null, 2));
    fs.writeFileSync(path.join(backupFolder, 'orders.json'), JSON.stringify(orders, null, 2));

    // Also write a latest snapshot for quick restore
    fs.writeFileSync(path.join(backupDir, 'latest_users.json'), JSON.stringify(users, null, 2));
    fs.writeFileSync(path.join(backupDir, 'latest_products.json'), JSON.stringify(products, null, 2));
    fs.writeFileSync(path.join(backupDir, 'latest_orders.json'), JSON.stringify(orders, null, 2));

    console.log(`\n🎉 Permanent Backup Successfully Created!`);
    console.log(`📁 Saved to: ${backupFolder}`);
    console.log(`📊 Backup Summary:`);
    console.log(`   - Users:    ${users.length}`);
    console.log(`   - Products: ${products.length}`);
    console.log(`   - Orders:   ${orders.length}`);

    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB. All data is safely archived.');
  } catch (err) {
    console.error('❌ Backup Failed:', err.message);
    process.exit(1);
  }
};

backupDatabase();
