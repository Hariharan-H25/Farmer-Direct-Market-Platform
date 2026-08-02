

import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { fetchProducts } from '../api';

const mockProducts = [
  // Vegetables
  { id: 1, name: 'Red Vine Tomatoes', category: 'Vegetables', price: 40, unit: 'kg', rating: 4.8, location: 'Nilgiris, TN', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' },
  { id: 2, name: 'Orange Carrots', category: 'Vegetables', price: 35, unit: 'kg', rating: 4.6, location: 'Ooty, TN', image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800' },
  { id: 3, name: 'Green Broccoli', category: 'Vegetables', price: 120, unit: 'kg', rating: 4.9, location: 'Kodaikanal, TN', image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?auto=format&fit=crop&q=80&w=800' },
  { id: 4, name: 'Yellow Bell Peppers', category: 'Vegetables', price: 90, unit: 'kg', rating: 4.7, location: 'Pune, MH', image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&q=80&w=800' },
  { id: 5, name: 'Fresh Spinach', category: 'Vegetables', price: 25, unit: 'bundle', rating: 4.5, location: 'Hosur, TN', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800' },
  { id: 6, name: 'Red Onions', category: 'Vegetables', price: 30, unit: 'kg', rating: 4.8, location: 'Nashik, MH', image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&q=80&w=800' },
  { id: 7, name: 'Russet Potatoes', category: 'Vegetables', price: 20, unit: 'kg', rating: 4.6, location: 'Agra, UP', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=800' },
  { id: 8, name: 'Green Cabbage', category: 'Vegetables', price: 22, unit: 'kg', rating: 4.3, location: 'Belgaum, KA', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { id: 9, name: 'White Cauliflower', category: 'Vegetables', price: 45, unit: 'piece', rating: 4.4, location: 'Hubli, KA', image: 'https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&q=80&w=800' },
  { id: 10, name: 'Fresh Green Peas', category: 'Vegetables', price: 60, unit: 'kg', rating: 4.9, location: 'Shimla, HP', image: 'https://images.unsplash.com/photo-1512805147242-b3b0b55500e1?auto=format&fit=crop&q=80&w=800' },
  { id: 11, name: 'Purple Eggplant', category: 'Vegetables', price: 35, unit: 'kg', rating: 4.5, location: 'Madurai, TN', image: 'https://images.unsplash.com/photo-1601315573456-427f711204d3?auto=format&fit=crop&q=80&w=800' },
  { id: 12, name: 'Crispy Cucumber', category: 'Vegetables', price: 28, unit: 'kg', rating: 4.7, location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800' },
  
  // Fruits
  { id: 13, name: 'Alphonso Mangoes', category: 'Fruits', price: 250, unit: 'kg', rating: 4.9, location: 'Ratnagiri, MH', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800' },
  { id: 14, name: 'Red Strawberries', category: 'Fruits', price: 180, unit: 'box', rating: 4.8, location: 'Mahabaleshwar, MH', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
  { id: 15, name: 'Green Apples', category: 'Fruits', price: 150, unit: 'kg', rating: 4.5, location: 'Shimla, HP', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800' },
  { id: 16, name: 'Robusta Bananas', category: 'Fruits', price: 40, unit: 'dozen', rating: 4.6, location: 'Trichy, TN', image: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&q=80&w=800' },
  { id: 17, name: 'Nagpur Oranges', category: 'Fruits', price: 80, unit: 'kg', rating: 4.7, location: 'Nagpur, MH', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800' },
  { id: 18, name: 'Ripe Papaya', category: 'Fruits', price: 45, unit: 'piece', rating: 4.4, location: 'Mysore, KA', image: 'https://images.unsplash.com/photo-1617112848923-cc22343940d1?auto=format&fit=crop&q=80&w=800' },
  { id: 19, name: 'Sweet Watermelon', category: 'Fruits', price: 30, unit: 'piece', rating: 4.8, location: 'Tirunelveli, TN', image: 'https://images.unsplash.com/photo-1589984662646-e7b2e4962f18?auto=format&fit=crop&q=80&w=800' },
  { id: 20, name: 'Red Pomegranate', category: 'Fruits', price: 120, unit: 'kg', rating: 4.9, location: 'Solapur, MH', image: 'https://images.unsplash.com/photo-1615486171431-1586bd206256?auto=format&fit=crop&q=80&w=800' },
  { id: 21, name: 'Seedless Grapes', category: 'Fruits', price: 90, unit: 'kg', rating: 4.6, location: 'Nashik, MH', image: 'https://images.unsplash.com/photo-1596363505729-4190a9506133?auto=format&fit=crop&q=80&w=800' },
  { id: 22, name: 'Fresh Pineapple', category: 'Fruits', price: 60, unit: 'piece', rating: 4.7, location: 'Thrissur, KL', image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&q=80&w=800' },
  { id: 23, name: 'Allahabad Guava', category: 'Fruits', price: 50, unit: 'kg', rating: 4.5, location: 'Allahabad, UP', image: 'https://images.unsplash.com/photo-1536511132770-e5058c7e8c46?auto=format&fit=crop&q=80&w=800' },
  { id: 24, name: 'Zespri Kiwi', category: 'Fruits', price: 200, unit: 'box', rating: 4.8, location: 'Imported', image: 'https://images.unsplash.com/photo-1585059895524-72359e06138a?auto=format&fit=crop&q=80&w=800' },

  // Spices
  { id: 25, name: 'Turmeric Powder', category: 'Spices', price: 180, unit: 'kg', rating: 4.7, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800' },
  { id: 26, name: 'Black Pepper', category: 'Spices', price: 600, unit: 'kg', rating: 4.9, location: 'Munnar, KL', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { id: 27, name: 'Cinnamon Sticks', category: 'Spices', price: 450, unit: 'kg', rating: 4.8, location: 'Wayanad, KL', image: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800' },
  { id: 28, name: 'Red Chilli Powder', category: 'Spices', price: 220, unit: 'kg', rating: 4.6, location: 'Guntur, AP', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800' },
  { id: 29, name: 'Green Cardamom', category: 'Spices', price: 1200, unit: 'kg', rating: 4.9, location: 'Idukki, KL', image: 'https://images.unsplash.com/photo-1564858066579-2479e0008068?auto=format&fit=crop&q=80&w=800' },
  { id: 30, name: 'Cumin Seeds (Jeera)', category: 'Spices', price: 300, unit: 'kg', rating: 4.7, location: 'Unjha, GJ', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800' },
  { id: 31, name: 'Coriander Seeds', category: 'Spices', price: 150, unit: 'kg', rating: 4.5, location: 'Kurnool, AP', image: 'https://images.unsplash.com/photo-1601114512536-cb9c20a8c2f1?auto=format&fit=crop&q=80&w=800' },
  { id: 32, name: 'Cloves (Laung)', category: 'Spices', price: 900, unit: 'kg', rating: 4.8, location: 'Kanyakumari, TN', image: 'https://images.unsplash.com/photo-1612015097486-5d665b1db35f?auto=format&fit=crop&q=80&w=800' },
  { id: 33, name: 'Mustard Seeds', category: 'Spices', price: 80, unit: 'kg', rating: 4.4, location: 'Indore, MP', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },
  { id: 34, name: 'Fenugreek (Methi)', category: 'Spices', price: 110, unit: 'kg', rating: 4.6, location: 'Jaipur, RJ', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { id: 35, name: 'Whole Nutmeg', category: 'Spices', price: 700, unit: 'kg', rating: 4.9, location: 'Kochi, KL', image: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800' },
  { id: 36, name: 'Dried Bay Leaves', category: 'Spices', price: 250, unit: 'kg', rating: 4.5, location: 'Siliguri, WB', image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800' },

  // Dairy
  { id: 37, name: 'Cow Milk', category: 'Dairy', price: 60, unit: 'Liter', rating: 4.6, location: 'Salem, TN', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },
  { id: 38, name: 'Homemade Ghee', category: 'Dairy', price: 550, unit: '500g', rating: 5.0, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
  { id: 39, name: 'Goat Cheese', category: 'Dairy', price: 350, unit: '200g', rating: 4.7, location: 'Pune, MH', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800' },
  { id: 40, name: 'Fresh Paneer', category: 'Dairy', price: 120, unit: '250g', rating: 4.8, location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80&w=800' },
  { id: 41, name: 'Natural Yogurt', category: 'Dairy', price: 50, unit: '500g', rating: 4.5, location: 'Madurai, TN', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800' },
  { id: 42, name: 'Buffalo Milk', category: 'Dairy', price: 70, unit: 'Liter', rating: 4.7, location: 'Anand, GJ', image: 'https://images.unsplash.com/photo-1528750717929-32abb73d3bd9?auto=format&fit=crop&q=80&w=800' },
  { id: 43, name: 'Fresh Butter', category: 'Dairy', price: 250, unit: '500g', rating: 4.9, location: 'Amul, GJ', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
  { id: 44, name: 'Mozzarella Cheese', category: 'Dairy', price: 400, unit: '200g', rating: 4.6, location: 'Bangalore, KA', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&q=80&w=800' },
  { id: 45, name: 'Thick Curd', category: 'Dairy', price: 40, unit: '500g', rating: 4.4, location: 'Chennai, TN', image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80&w=800' },
  { id: 46, name: 'Spiced Buttermilk', category: 'Dairy', price: 20, unit: 'Liter', rating: 4.8, location: 'Hyderabad, TS', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },

  // Grains
  { id: 47, name: 'Sona Masuri Rice', category: 'Grains', price: 55, unit: 'kg', rating: 4.8, location: 'Raichur, KA', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  { id: 48, name: 'Basmati Rice', category: 'Grains', price: 110, unit: 'kg', rating: 4.9, location: 'Karnal, HR', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
  { id: 49, name: 'Whole Wheat', category: 'Grains', price: 40, unit: 'kg', rating: 4.5, location: 'Ludhiana, PB', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },
  { id: 50, name: 'Organic Quinoa', category: 'Grains', price: 300, unit: 'kg', rating: 4.7, location: 'Bangalore, KA', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  { id: 51, name: 'Pearl Millet (Bajra)', category: 'Grains', price: 35, unit: 'kg', rating: 4.6, location: 'Jaipur, RJ', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },
  { id: 52, name: 'Toor Dal', category: 'Grains', price: 140, unit: 'kg', rating: 4.8, location: 'Latur, MH', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
  { id: 53, name: 'Moong Dal', category: 'Grains', price: 120, unit: 'kg', rating: 4.7, location: 'Indore, MP', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  { id: 54, name: 'Chana Dal', category: 'Grains', price: 90, unit: 'kg', rating: 4.5, location: 'Bhopal, MP', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
  { id: 55, name: 'Rolled Oats', category: 'Grains', price: 180, unit: 'kg', rating: 4.9, location: 'Imported', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },
  { id: 56, name: 'Finger Millet (Ragi)', category: 'Grains', price: 45, unit: 'kg', rating: 4.8, location: 'Tumkur, KA', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  { id: 57, name: 'Whole Barley', category: 'Grains', price: 60, unit: 'kg', rating: 4.4, location: 'Amritsar, PB', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
  { id: 58, name: 'Brown Rice', category: 'Grains', price: 80, unit: 'kg', rating: 4.7, location: 'Thanjavur, TN', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
];

const SkeletonCard = () => (
  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100/80 space-y-4 animate-pulse">
    <div className="h-64 bg-slate-100 rounded-[1.5rem]" />
    <div className="space-y-2">
      <div className="h-6 bg-slate-100 rounded w-2/3" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
    </div>
    <div className="pt-4 border-t border-slate-50 flex justify-between items-center">
      <div className="space-y-1 w-1/3">
        <div className="h-3 bg-slate-100 rounded" />
        <div className="h-6 bg-slate-100 rounded" />
      </div>
      <div className="w-10 h-10 bg-slate-100 rounded-xl" />
    </div>
  </div>
);

const ProductBrowse = () => {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const categories = [
    { name: 'All', image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=200' },
    { name: 'Vegetables', image: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=200' },
    { name: 'Fruits', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=200' },
    { name: 'Spices', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=200' },
    { name: 'Grains', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=200' },
    { name: 'Dairy', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=200' },
  ];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'All') {
          params.category = selectedCategory;
        }
        if (searchQuery.trim()) {
          params.search = searchQuery;
        }
        
        const { data } = await fetchProducts(params);
        
        // If server returns empty database, fallback to seeded mock list for user safety
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Client-side fallback filter
          const filteredMock = selectedCategory === 'All'
            ? mockProducts
            : mockProducts.filter(p => p.category === selectedCategory);
          const searchedMock = searchQuery.trim()
            ? filteredMock.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
            : filteredMock;
          setProducts(searchedMock);
        }
      } catch (err) {
        console.error("API error fetching products, using mock fallback", err);
        const filteredMock = selectedCategory === 'All'
          ? mockProducts
          : mockProducts.filter(p => p.category === selectedCategory);
        const searchedMock = searchQuery.trim()
          ? filteredMock.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
          : filteredMock;
        setProducts(searchedMock);
      } finally {
        setLoading(false);
      }
    };

    // Simple debounced trigger
    const timeoutId = setTimeout(loadProducts, 250);
    return () => clearTimeout(timeoutId);
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-black text-dark tracking-tight">
            Fresh <span className="text-primary">Marketplace</span>
          </h1>
          <p className="text-gray-500 text-lg">Browse 100% fresh organic produce directly from verified local farms.</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors animate-in" size={20} />
            <input 
              type="text" 
              placeholder="Search products..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white border border-slate-200/80 px-12 py-4 rounded-2xl w-full shadow-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>
          <button className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm hover:bg-slate-50 transition-colors text-slate-600 cursor-pointer">
            <SlidersHorizontal size={24} />
          </button>
        </div>
      </div>

      {/* Touchable Category Icons */}
      <div className="flex items-center space-x-6 md:space-x-10 overflow-x-auto pb-8 pt-4 no-scrollbar px-2">
        {categories.map(cat => (
          <button
            key={cat.name}
            onClick={() => setSelectedCategory(cat.name)}
            className="flex flex-col items-center gap-4 group shrink-0 cursor-pointer"
          >
            <div className={`w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden shadow-lg transition-all duration-300 ${
              selectedCategory === cat.name 
              ? 'ring-4 ring-primary ring-offset-4 scale-110 shadow-primary/30' 
              : 'ring-2 ring-slate-100 group-hover:ring-primary/50 group-hover:scale-105'
            }`}>
              <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" />
            </div>
            <span className={`font-black text-xs md:text-sm uppercase tracking-wider transition-colors ${
              selectedCategory === cat.name ? 'text-primary' : 'text-slate-500 group-hover:text-primary'
            }`}>
              {cat.name}
            </span>
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
          {products.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center text-slate-300 mx-auto">
            <ShoppingBag size={48} />
          </div>
          <h3 className="text-2xl font-bold text-dark">No Products Found</h3>
          <p className="text-slate-500">
            We couldn't find any products matching your search term. Try searching for other terms or checking other categories.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductBrowse;
