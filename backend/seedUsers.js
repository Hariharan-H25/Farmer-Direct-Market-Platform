import dns from 'node:dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (_) {}
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

const users = [
  // ─── Admin ────────────────────────────────────────────────
  {
    name: 'Hariharan Admin',
    email: 'nhariharan757@gmail.com',
    password: 'admin123',
    phone: '9000000000',
    role: 'admin',
    isVerified: true,
    isAuthorized: true,
  },
  {
    name: 'Admin Kumar',
    email: 'admin@farmconnect.com',
    password: 'admin123',
    phone: '9000000001',
    role: 'admin',
    isVerified: true,
    isAuthorized: true,
  },

  // ─── Farmers ──────────────────────────────────────────────
  {
    name: 'Ravi Shankar',
    email: 'ravi@farmer.com',
    password: 'farmer123',
    phone: '9111111111',
    role: 'farmer',
    farmName: 'Green Valley Farm',
    location: { district: 'Coimbatore', state: 'Tamil Nadu' },
    isVerified: true,
    languages: ['Tamil', 'English'],
  },
  {
    name: 'Meena Devi',
    email: 'meena@farmer.com',
    password: 'farmer123',
    phone: '9222222222',
    role: 'farmer',
    farmName: 'Sunrise Organic Fields',
    location: { district: 'Madurai', state: 'Tamil Nadu' },
    isVerified: true,
    languages: ['Tamil'],
  },
  {
    name: 'Suresh Patel',
    email: 'suresh@farmer.com',
    password: 'farmer123',
    phone: '9333333333',
    role: 'farmer',
    farmName: 'Patel Agro Farm',
    location: { district: 'Surat', state: 'Gujarat' },
    isVerified: false,
    languages: ['Gujarati', 'Hindi'],
  },
  {
    name: 'Lakshmi Reddy',
    email: 'lakshmi@farmer.com',
    password: 'farmer123',
    phone: '9444444444',
    role: 'farmer',
    farmName: 'Reddy Natural Farms',
    location: { district: 'Guntur', state: 'Andhra Pradesh' },
    isVerified: true,
    languages: ['Telugu', 'English'],
  },
  {
    name: 'Arjun Singh',
    email: 'arjun@farmer.com',
    password: 'farmer123',
    phone: '9555555555',
    role: 'farmer',
    farmName: 'Punjab Golden Fields',
    location: { district: 'Ludhiana', state: 'Punjab' },
    isVerified: true,
    languages: ['Punjabi', 'Hindi'],
  },

  // ─── Customers ────────────────────────────────────────────
  {
    name: 'Priya Nair',
    email: 'priya@customer.com',
    password: 'customer123',
    phone: '9600000001',
    role: 'customer',
    isVerified: true,
  },
  {
    name: 'Rahul Verma',
    email: 'rahul@customer.com',
    password: 'customer123',
    phone: '9700000002',
    role: 'customer',
    isVerified: true,
  },
  {
    name: 'Anjali Sharma',
    email: 'anjali@customer.com',
    password: 'customer123',
    phone: '9800000003',
    role: 'customer',
    isVerified: true,
  },
  {
    name: 'Kiran Kumar',
    email: 'kiran@customer.com',
    password: 'customer123',
    phone: '9900000004',
    role: 'customer',
    isVerified: true,
  },
  {
    name: 'Deepa Menon',
    email: 'deepa@customer.com',
    password: 'customer123',
    phone: '9100000005',
    role: 'customer',
    isVerified: true,
  },
];

const productsToSeed = [
  {
    name: 'Red Vine Tomatoes',
    description: 'Naturally grown, vine-ripened red tomatoes from the valleys of Nilgiris. Juicy, sweet, and perfect for salads or cooking.',
    category: 'Vegetables',
    price: 40,
    unit: 'kg',
    quantity: 150,
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'ravi@farmer.com',
    averageRating: 4.8,
  },
  {
    name: 'Orange Carrots',
    description: 'Crunchy and sweet carrots freshly harvested from the hills of Ooty. High in Vitamin A.',
    category: 'Vegetables',
    price: 35,
    unit: 'kg',
    quantity: 200,
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'ravi@farmer.com',
    averageRating: 4.6,
  },
  {
    name: 'Fresh Spinach',
    description: 'Organic spinach leaves, rich in iron, harvested fresh early in the morning and packed carefully.',
    category: 'Vegetables',
    price: 25,
    unit: 'bundle',
    quantity: 80,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'meena@farmer.com',
    averageRating: 4.5,
  },
  {
    name: 'Cow Milk',
    description: '100% pure cow milk, raw and unadulterated. Sourced directly from grass-fed cows.',
    category: 'Dairy',
    price: 60,
    unit: 'Liter',
    quantity: 100,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'meena@farmer.com',
    averageRating: 4.6,
  },
  {
    name: 'Homemade Ghee',
    description: 'Traditional Vedic method ghee prepared from cow butter. Rich aroma and golden grainy texture.',
    category: 'Dairy',
    price: 550,
    unit: '500g',
    quantity: 40,
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'meena@farmer.com',
    averageRating: 5.0,
  },
  {
    name: 'Alphonso Mangoes',
    description: 'The king of mangoes. Naturally ripened, sweet, fiberless Alphonso mangoes from Konkan farms.',
    category: 'Fruits',
    price: 250,
    unit: 'kg',
    quantity: 120,
    image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'suresh@farmer.com',
    averageRating: 4.9,
  },
  {
    name: 'Nagpur Oranges',
    description: 'Juicy, tangy-sweet oranges directly from Nagpur orchards. Packed with Vitamin C.',
    category: 'Fruits',
    price: 80,
    unit: 'kg',
    quantity: 220,
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'suresh@farmer.com',
    averageRating: 4.7,
  },
  {
    name: 'Turmeric Powder',
    description: 'High curcumin turmeric powder ground from dried rhizomes grown organically in Erode. Pure golden color.',
    category: 'Spices',
    price: 180,
    unit: 'kg',
    quantity: 300,
    image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'lakshmi@farmer.com',
    averageRating: 4.7,
  },
  {
    name: 'Black Pepper',
    description: 'Handpicked bold black pepper seeds from Munnar pepper vines. Strongly aromatic and hot.',
    category: 'Spices',
    price: 600,
    unit: 'kg',
    quantity: 90,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'lakshmi@farmer.com',
    averageRating: 4.9,
  },
  {
    name: 'Basmati Rice',
    description: 'Long-grain premium Basmati rice aged for 12 months. Exquisite fragrance and fluffy texture.',
    category: 'Grains',
    price: 110,
    unit: 'kg',
    quantity: 500,
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'arjun@farmer.com',
    averageRating: 4.9,
  },
  {
    name: 'Whole Wheat',
    description: 'Sharbati wheat grains from Punjab fields. Excellent for soft rotis and parathas.',
    category: 'Grains',
    price: 40,
    unit: 'kg',
    quantity: 1000,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    farmerEmail: 'arjun@farmer.com',
    averageRating: 4.5,
  }
];

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    let addedUsers = 0;
    let skippedUsers = 0;

    for (const userData of users) {
      const exists = await User.findOne({ email: userData.email });
      if (exists) {
        console.log(`⚠️  Skipped User (already exists): ${userData.email}`);
        skippedUsers++;
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await User.create({ ...userData, password: hashedPassword });
      console.log(`✔  Added User [${userData.role.padEnd(8)}] ${userData.name} — ${userData.email}`);
      addedUsers++;
    }

    console.log(`\n🎉 User Seeding complete! Added: ${addedUsers}, Skipped: ${skippedUsers}`);

    // Seed Products
    let addedProducts = 0;
    let skippedProducts = 0;

    for (const p of productsToSeed) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) {
        console.log(`⚠️  Skipped Product (already exists): ${p.name}`);
        skippedProducts++;
        continue;
      }

      const farmerUser = await User.findOne({ email: p.farmerEmail });
      if (!farmerUser) {
        console.log(`❌ Farmer ${p.farmerEmail} not found! Cannot seed ${p.name}`);
        continue;
      }

      await Product.create({
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        unit: p.unit,
        quantity: p.quantity,
        image: p.image,
        farmer: farmerUser._id,
        averageRating: p.averageRating,
      });

      console.log(`✔  Added Product [${p.category.padEnd(11)}] ${p.name} mapped to farmer: ${farmerUser.name}`);
      addedProducts++;
    }

    console.log(`\n🎉 Product Seeding complete! Added: ${addedProducts}, Skipped: ${skippedProducts}`);

    console.log('\n─── Login Credentials ────────────────────────────────────');
    console.log('ADMIN    → nhariharan757@gmail.com / admin123');
    console.log('ADMIN    → admin@farmconnect.com   / admin123');
    console.log('FARMER   → ravi@farmer.com         / farmer123');
    console.log('FARMER   → meena@farmer.com        / farmer123');
    console.log('FARMER   → suresh@farmer.com       / farmer123');
    console.log('FARMER   → lakshmi@farmer.com      / farmer123');
    console.log('FARMER   → arjun@farmer.com        / farmer123');
    console.log('CUSTOMER → priya@customer.com      / customer123');
    console.log('CUSTOMER → rahul@customer.com      / customer123');
    console.log('CUSTOMER → anjali@customer.com     / customer123');
    console.log('CUSTOMER → kiran@customer.com      / customer123');
    console.log('CUSTOMER → deepa@customer.com      / customer123');
    console.log('──────────────────────────────────────────────────────────');

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedUsers();
