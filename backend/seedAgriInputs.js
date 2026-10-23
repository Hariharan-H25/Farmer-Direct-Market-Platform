import dns from 'node:dns';
try { dns.setServers(['8.8.8.8', '8.8.4.4']); } catch (_) {}
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from './models/Product.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/farmconnect_v2';

const agriInputProducts = [
  // ─── SEEDS ───────────────────────────────────────────────────────────────
  {
    name: 'Hybrid Tomato Seeds (F1)',
    description: 'High-yield F1 hybrid tomato seeds with excellent disease resistance. Produces round, firm, red fruits with long shelf life. Suitable for both open field and greenhouse cultivation.',
    category: 'Seeds',
    price: 350,
    originalPrice: 450,
    discount: 22,
    unit: '10g pack',
    quantity: 500,
    brand: 'Syngenta',
    location: 'Pune, MH',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.8,
  },
  {
    name: 'Basmati Rice Seed (PB-1121)',
    description: 'Premium PB-1121 Basmati rice seeds with excellent germination rate (95%+). Long slender grains, aromatic, ideal for Kharif season sowing in Indo-Gangetic plains.',
    category: 'Seeds',
    price: 120,
    originalPrice: 150,
    discount: 20,
    unit: 'kg',
    quantity: 1000,
    brand: 'National Seeds',
    location: 'Karnal, HR',
    image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.7,
  },
  {
    name: 'Chilli Seeds (Pusa Jwala)',
    description: 'Pusa Jwala variety chilli seeds known for high pungency, profuse bearing, and excellent drying quality. Best suited for dry chilli production.',
    category: 'Seeds',
    price: 180,
    originalPrice: 220,
    discount: 18,
    unit: '50g pack',
    quantity: 300,
    brand: 'IARI Seeds',
    location: 'New Delhi',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },
  {
    name: 'Okra (Bhindi) Seeds - Arka Anamika',
    description: 'IIHR-developed Arka Anamika Okra seeds with YVMV virus resistance. High-yielding, tender green pods, best for fresh market and processing.',
    category: 'Seeds',
    price: 85,
    originalPrice: 100,
    discount: 15,
    unit: '100g pack',
    quantity: 400,
    brand: 'IIHR Seeds',
    location: 'Bangalore, KA',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },

  // ─── FERTILIZERS ─────────────────────────────────────────────────────────
  {
    name: 'NPK 19-19-19 Water Soluble Fertilizer',
    description: 'Fully balanced water-soluble fertilizer with equal ratios of Nitrogen, Phosphorus, and Potassium. Ideal for fertigation and foliar spray. Promotes balanced vegetative and root growth.',
    category: 'Fertilizers',
    price: 420,
    originalPrice: 500,
    discount: 16,
    unit: '1kg',
    quantity: 600,
    brand: 'Coromandel',
    location: 'Hyderabad, TS',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.8,
  },
  {
    name: 'Urea 46% N Granules',
    description: 'High-nitrogen urea granules (46% N) for boosting vegetative growth in all crops. Slow-releasing for sustained nutrition. Suitable for paddy, wheat, maize, and vegetables.',
    category: 'Fertilizers',
    price: 310,
    originalPrice: 350,
    discount: 11,
    unit: '50kg bag',
    quantity: 800,
    brand: 'IFFCO',
    location: 'Lucknow, UP',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },
  {
    name: 'DAP (Di-Ammonium Phosphate)',
    description: 'DAP fertilizer provides essential Phosphorus (46% P2O5) and Nitrogen (18% N) for robust root development, early plant establishment, and improved grain formation.',
    category: 'Fertilizers',
    price: 1350,
    originalPrice: 1500,
    discount: 10,
    unit: '50kg bag',
    quantity: 500,
    brand: 'IFFCO',
    location: 'Ahmedabad, GJ',
    image: 'https://images.unsplash.com/photo-1593113543329-a1fc10bba131?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },
  {
    name: 'Zinc Sulphate 33% Micronutrient',
    description: 'Corrects zinc deficiency in all crops. Zinc is crucial for chlorophyll synthesis, enzyme activation, and increased disease resistance. Suitable for soil and foliar application.',
    category: 'Fertilizers',
    price: 290,
    originalPrice: 350,
    discount: 17,
    unit: '1kg',
    quantity: 400,
    brand: 'Tradeindia Agro',
    location: 'Surat, GJ',
    image: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.4,
  },

  // ─── CROP PROTECTION ─────────────────────────────────────────────────────
  {
    name: 'Mancozeb 75% WP Fungicide',
    description: 'Broad-spectrum contact fungicide effective against early and late blights, leaf spots, and downy mildew in tomato, potato, grapes, and cucurbits. Non-systemic with protective action.',
    category: 'Crop Protection',
    price: 185,
    originalPrice: 220,
    discount: 16,
    unit: '500g',
    quantity: 700,
    brand: 'Dhanuka Agritech',
    location: 'Gurugram, HR',
    image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.7,
  },
  {
    name: 'Imidacloprid 17.8% SL Insecticide',
    description: 'Systemic insecticide for control of sucking pests like aphids, whiteflies, jassids, thrips, and mealy bugs. Acts through soil and foliar application. Effective at low doses.',
    category: 'Crop Protection',
    price: 250,
    originalPrice: 310,
    discount: 19,
    unit: '100ml',
    quantity: 500,
    brand: 'Bayer CropScience',
    location: 'Mumbai, MH',
    image: 'https://images.unsplash.com/photo-1416879598555-220b8b2e35a1?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.9,
  },
  {
    name: 'Copper Oxychloride 50% WP',
    description: 'A broad-spectrum fungicide and bactericide used to control fungal and bacterial diseases including blights, leaf spots, and cankers in fruits, vegetables, and plantation crops.',
    category: 'Crop Protection',
    price: 140,
    originalPrice: 170,
    discount: 18,
    unit: '500g',
    quantity: 600,
    brand: 'PI Industries',
    location: 'Udaipur, RJ',
    image: 'https://images.unsplash.com/photo-1564858066579-2479e0008068?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },
  {
    name: 'Neem Oil 10000 PPM (Organic Pesticide)',
    description: '100% pure cold-pressed Neem Oil with 10000 PPM Azadirachtin content. Effective insect repellent, fungicide, and miticide. Safe for humans, pets, and beneficial insects. OMRI listed.',
    category: 'Crop Protection',
    price: 320,
    originalPrice: 390,
    discount: 18,
    unit: '500ml',
    quantity: 400,
    brand: 'Agri Life',
    location: 'Hyderabad, TS',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.8,
  },

  // ─── TOOLS ────────────────────────────────────────────────────────────────
  {
    name: 'Stainless Steel Garden Khurpi (Weeder)',
    description: 'Heavy-duty stainless steel khurpi/weeding tool with ergonomic wooden handle. Ideal for soil loosening, weeding between crop rows, and transplanting seedlings.',
    category: 'Tools',
    price: 180,
    originalPrice: 220,
    discount: 18,
    unit: 'piece',
    quantity: 200,
    brand: 'Falcon Garden',
    location: 'Jalandhar, PB',
    image: 'https://images.unsplash.com/photo-1416879598555-220b8b2e35a1?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },
  {
    name: 'Hand Pruning Shears (Bypass)',
    description: 'Professional bypass pruning shears with high-carbon SK5 steel blades. Ergonomic non-slip grips, safety lock mechanism. Suitable for trimming, pruning, and training vines and fruit trees.',
    category: 'Tools',
    price: 450,
    originalPrice: 590,
    discount: 24,
    unit: 'piece',
    quantity: 150,
    brand: 'Burgon & Ball',
    location: 'Nagpur, MH',
    image: 'https://images.unsplash.com/photo-1593113543329-a1fc10bba131?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.7,
  },
  {
    name: 'Battery-Powered Knapsack Sprayer 16L',
    description: '16-litre battery-operated knapsack sprayer with 12V rechargeable Li-Ion battery. Adjustable nozzle for fine mist to coarse spray. Perfect for pesticide, herbicide, and fertilizer application.',
    category: 'Tools',
    price: 2800,
    originalPrice: 3500,
    discount: 20,
    unit: 'piece',
    quantity: 80,
    brand: 'Neptune Agri',
    location: 'Coimbatore, TN',
    image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },

  // ─── IRRIGATION ───────────────────────────────────────────────────────────
  {
    name: 'Drip Irrigation Kit (1 Acre)',
    description: 'Complete drip irrigation kit for 1 acre, includes main line, lateral pipes, inline drippers, filters, and connectors. Reduces water consumption by up to 60% while ensuring uniform crop nutrition delivery.',
    category: 'Irrigation',
    price: 4500,
    originalPrice: 5500,
    discount: 18,
    unit: 'set',
    quantity: 50,
    brand: 'Jain Irrigation',
    location: 'Jalgaon, MH',
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.9,
  },
  {
    name: 'Mini Sprinkler System (Garden)',
    description: 'Pop-up micro-sprinkler system for kitchen gardens, nurseries, and small plots. 360-degree coverage, easy installation, connects to standard garden hose. Covers up to 10 sq. meters per head.',
    category: 'Irrigation',
    price: 850,
    originalPrice: 1000,
    discount: 15,
    unit: 'set (5 heads)',
    quantity: 120,
    brand: 'Netafim',
    location: 'Pune, MH',
    image: 'https://images.unsplash.com/photo-1564858066579-2479e0008068?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },

  // ─── ORGANIC ──────────────────────────────────────────────────────────────
  {
    name: 'Vermicompost (Earthworm Compost)',
    description: 'Premium quality vermicompost produced from decomposed organic matter through red Eisenia worm activity. Rich in NPK, humic acid, and beneficial microorganisms. Improves soil structure dramatically.',
    category: 'Organic',
    price: 180,
    originalPrice: 220,
    discount: 18,
    unit: '5kg bag',
    quantity: 800,
    brand: 'Krishidhan',
    location: 'Nashik, MH',
    image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.8,
  },
  {
    name: 'Pseudomonas fluorescens Bio-Fungicide',
    description: 'PGPR-based bio-fungicide using Pseudomonas fluorescens (10^8 CFU/ml). Effective against soil-borne pathogens including Fusarium, Pythium, and Rhizoctonia. Safe for soil ecology and earthworms.',
    category: 'Organic',
    price: 220,
    originalPrice: 270,
    discount: 19,
    unit: '500ml',
    quantity: 300,
    brand: 'T-Stanes',
    location: 'Coimbatore, TN',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },
  {
    name: 'Panchagavya Organic Growth Promoter',
    description: 'Traditional Indian bio-stimulant formulated from 9 cow-derived products. Promotes root development, improves crop immunity, and enhances nutrient uptake. Certified organic, zero chemical content.',
    category: 'Organic',
    price: 290,
    originalPrice: 350,
    discount: 17,
    unit: '1 Liter',
    quantity: 200,
    brand: 'Agri Gold',
    location: 'Erode, TN',
    image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.7,
  },

  // ─── FARMING EQUIP ────────────────────────────────────────────────────────
  {
    name: 'Poly Mulch Film (Black, 25 Micron)',
    description: 'UV-stabilized black polyethylene mulch film controls weeds, retains soil moisture, and regulates soil temperature. Suitable for vegetable cultivation, especially tomatoes, capsicum, and cucumbers.',
    category: 'Farming Equip',
    price: 1100,
    originalPrice: 1350,
    discount: 19,
    unit: '1 kg roll (250m)',
    quantity: 150,
    brand: 'Supreme Industries',
    location: 'Vadodara, GJ',
    image: 'https://images.unsplash.com/photo-1586771107445-d3ca888129ce?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },
  {
    name: 'Greenhouse Shade Net (50%)',
    description: 'HDPE monofilament knitted shade net with 50% shade factor. Reduces temperature by 8-10°C, protects crops from heavy rains and hail. Suitable for nurseries, vegetable gardens, and ornamental plants.',
    category: 'Farming Equip',
    price: 1800,
    originalPrice: 2200,
    discount: 18,
    unit: '10x4m roll',
    quantity: 80,
    brand: 'Garware Technics',
    location: 'Pune, MH',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.8,
  },

  // ─── SPECIALTY ────────────────────────────────────────────────────────────
  {
    name: 'Pheromone Trap (Fruit Fly)',
    description: 'Delta-shaped pheromone trap with methyl eugenol lure for monitoring and mass-trapping of Fruit Fly (Bactrocera dorsalis). Eco-friendly, reusable trap — reduces pesticide usage significantly.',
    category: 'Specialty',
    price: 120,
    originalPrice: 150,
    discount: 20,
    unit: 'set (trap + lure)',
    quantity: 500,
    brand: 'PCI India',
    location: 'Chennai, TN',
    image: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.6,
  },
  {
    name: 'Sticky Yellow Traps (Aphid & Whitefly)',
    description: 'Yellow chromatic sticky traps for mass trapping of flying pests like aphids, whiteflies, and leafminers. Effective, chemical-free monitoring tool. Weatherproof, suitable for outdoor and greenhouse use.',
    category: 'Specialty',
    price: 280,
    originalPrice: 350,
    discount: 20,
    unit: 'pack of 25',
    quantity: 400,
    brand: 'Spraymaster',
    location: 'Bangalore, KA',
    image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800',
    averageRating: 4.5,
  },
];

async function seedAgriInputs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB:', MONGO_URI);

    let added = 0;
    let skipped = 0;

    for (const p of agriInputProducts) {
      const exists = await Product.findOne({ name: p.name });
      if (exists) {
        console.log(`⚠️  Skipped (exists): ${p.name}`);
        skipped++;
        continue;
      }

      await Product.create({
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        originalPrice: p.originalPrice || null,
        discount: p.discount || 0,
        unit: p.unit,
        quantity: p.quantity,
        brand: p.brand || '',
        location: p.location || '',
        image: p.image,
        averageRating: p.averageRating || 0,
        status: 'Available',
      });

      console.log(`✔  Added [${p.category.padEnd(14)}] ${p.name}`);
      added++;
    }

    console.log(`\n🎉 Agri Input Seeding Done! Added: ${added}, Skipped: ${skipped}`);
    console.log('\n📦 Categories seeded: Seeds, Fertilizers, Crop Protection, Tools, Irrigation, Organic, Farming Equip, Specialty');

  } catch (err) {
    console.error('❌ Seed Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

seedAgriInputs();
