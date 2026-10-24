import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Search, ShoppingBag, ChevronDown, ArrowUpDown } from 'lucide-react';
import { fetchProducts } from '../api';
import socket from '../socket';

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

  // Fruits
  { id: 13, name: 'Alphonso Mangoes', category: 'Fruits', price: 250, unit: 'kg', rating: 4.9, location: 'Ratnagiri, MH', image: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800' },
  { id: 14, name: 'Red Strawberries', category: 'Fruits', price: 180, unit: 'box', rating: 4.8, location: 'Mahabaleshwar, MH', image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
  { id: 15, name: 'Green Apples', category: 'Fruits', price: 150, unit: 'kg', rating: 4.5, location: 'Shimla, HP', image: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=800' },
  { id: 16, name: 'Robusta Bananas', category: 'Fruits', price: 40, unit: 'dozen', rating: 4.6, location: 'Trichy, TN', image: 'https://images.unsplash.com/photo-1571501679680-de32f1e7aad4?auto=format&fit=crop&q=80&w=800' },
  { id: 17, name: 'Nagpur Oranges', category: 'Fruits', price: 80, unit: 'kg', rating: 4.7, location: 'Nagpur, MH', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800' },

  // Spices
  { id: 25, name: 'Turmeric Powder', category: 'Spices', price: 180, unit: 'kg', rating: 4.7, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800' },
  { id: 26, name: 'Black Pepper', category: 'Spices', price: 600, unit: 'kg', rating: 4.9, location: 'Munnar, KL', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
  { id: 27, name: 'Cinnamon Sticks', category: 'Spices', price: 450, unit: 'kg', rating: 4.8, location: 'Wayanad, KL', image: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800' },
  { id: 28, name: 'Red Chilli Powder', category: 'Spices', price: 220, unit: 'kg', rating: 4.6, location: 'Guntur, AP', image: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?auto=format&fit=crop&q=80&w=800' },

  // Dairy
  { id: 37, name: 'Cow Milk', category: 'Dairy', price: 60, unit: 'Liter', rating: 4.6, location: 'Salem, TN', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },
  { id: 38, name: 'Homemade Ghee', category: 'Dairy', price: 550, unit: '500g', rating: 5.0, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
  { id: 40, name: 'Fresh Paneer', category: 'Dairy', price: 120, unit: '250g', rating: 4.8, location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80&w=800' },

  // Grains
  { id: 47, name: 'Sona Masuri Rice', category: 'Grains', price: 55, unit: 'kg', rating: 4.8, location: 'Raichur, KA', image: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  { id: 48, name: 'Basmati Rice', category: 'Grains', price: 110, unit: 'kg', rating: 4.9, location: 'Karnal, HR', image: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
  { id: 49, name: 'Whole Wheat', category: 'Grains', price: 40, unit: 'kg', rating: 4.5, location: 'Ludhiana, PB', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },

  // Seeds
  { id: 60, name: 'Hybrid Royal Bullet Chilli Seeds', category: 'Seeds', brand: 'Syngenta', price: 699, originalPrice: 816, discount: 14, unit: 'pack', rating: 4.8, location: 'Bangalore, KA', image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800' },
  { id: 61, name: 'HPH 5531 High Germination Seeds', category: 'Seeds', brand: 'Syngenta', price: 719, originalPrice: 999, discount: 28, unit: 'pack', rating: 4.7, location: 'Pune, MH', image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&q=80&w=800' },
  { id: 62, name: 'Certified Paddy Seeds (IR 64)', category: 'Seeds', brand: 'FarmDirect', price: 320, originalPrice: 400, discount: 20, unit: 'kg', rating: 4.9, location: 'Thanjavur, TN', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },

  // Crop Care
  { id: 70, name: 'Bio-Organic Neem Fungicide 1L', category: 'Crop Care', brand: 'EcoAgri', price: 349, originalPrice: 450, discount: 22, unit: 'Liter', rating: 4.8, location: 'Coimbatore, TN', image: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800' },
  { id: 71, name: 'Micronutrient Plant Growth Booster', category: 'Crop Care', brand: 'NutriGrow', price: 280, originalPrice: 380, discount: 26, unit: 'bottle', rating: 4.6, location: 'Erode, TN', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=800' },

  // Farming Tools
  { id: 80, name: 'Ergonomic Heavy-Duty Hand Trowel', category: 'Farming Tools', brand: 'AgriPro', price: 249, originalPrice: 350, discount: 28, unit: 'piece', rating: 4.7, location: 'Belgaum, KA', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=800' },
  { id: 81, name: 'High-Pressure 16L Backpack Knapsack Sprayer', category: 'Farming Tools', brand: 'KisanForce', price: 1450, originalPrice: 1899, discount: 23, unit: 'piece', rating: 4.9, location: 'Salem, TN', image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?auto=format&fit=crop&q=80&w=800' },
];

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-100 dark:border-gray-700 space-y-3 animate-pulse">
    <div className="aspect-square bg-slate-100 dark:bg-gray-700 rounded-lg sm:rounded-xl" />
    <div className="space-y-2">
      <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded w-2/3" />
      <div className="h-3 bg-slate-100 dark:bg-gray-700 rounded w-1/2" />
    </div>
    <div className="pt-2 flex justify-between items-center">
      <div className="h-5 bg-slate-100 dark:bg-gray-700 rounded w-1/3" />
      <div className="h-8 w-16 bg-slate-100 dark:bg-gray-700 rounded-lg" />
    </div>
  </div>
);

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Spices', 'Grains', 'Dairy', 'Seeds', 'Crop Care', 'Farming Tools'];

const PRICE_RANGES = [
  { label: 'All Prices', max: Infinity },
  { label: 'Under ₹50', max: 50 },
  { label: 'Under ₹200', max: 200 },
  { label: 'Under ₹500', max: 500 },
  { label: '₹500+', max: Infinity, min: 500 },
];

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest' },
  { label: 'Price: Low to High', value: 'price_asc' },
  { label: 'Price: High to Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const CATEGORY_IMAGES = {
  All: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=300',
  Vegetables: 'https://images.unsplash.com/photo-1566385101042-1a0aa0c1268c?auto=format&fit=crop&q=80&w=300',
  Fruits: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=300',
  Spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=300',
  Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=300',
  Dairy: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&q=80&w=300',
  Seeds: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=300',
  'Crop Care': 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=300',
  'Farming Tools': 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&q=80&w=300',
};

const ProductBrowse = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlCategory = searchParams.get('category');

  const [products, setProducts] = useState([]);
  const selectedCategory = (urlCategory && CATEGORIES.includes(urlCategory)) ? urlCategory : 'All';
  const [searchQuery, setSearchQuery] = useState('');
  const [priceRange, setPriceRange] = useState(0); // index into PRICE_RANGES
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

  const handleCategorySelect = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceRange(0);
    setSortBy('newest');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('category');
    setSearchParams(newParams);
  };

  // Derived price filter values
  const activePriceRange = PRICE_RANGES[priceRange];

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (searchQuery.trim()) params.search = searchQuery;
        if (sortBy) params.sort = sortBy;

        const { data } = await fetchProducts(params);

        if (data && data.length > 0) {
          setProducts(data);
        } else {
          applyMockFilters();
        }
      } catch (err) {
        console.error('API error fetching products, using fallback list', err);
        applyMockFilters();
      } finally {
        setLoading(false);
      }
    };

    const applyMockFilters = () => {
      let filtered = selectedCategory === 'All'
        ? mockProducts
        : mockProducts.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

      if (searchQuery.trim()) {
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      if (activePriceRange.min !== undefined) {
        filtered = filtered.filter(p => p.price >= activePriceRange.min);
      }
      if (activePriceRange.max !== Infinity) {
        filtered = filtered.filter(p => p.price <= activePriceRange.max);
      }

      if (sortBy === 'price_asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
      else if (sortBy === 'price_desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
      else if (sortBy === 'rating') filtered = [...filtered].sort((a, b) => (b.rating || 0) - (a.rating || 0));

      setProducts(filtered);
    };

    const timeoutId = setTimeout(loadProducts, 200);

    const handleProductChange = () => loadProducts();
    socket.on('product_created', handleProductChange);
    socket.on('product_stock_updated', handleProductChange);
    socket.on('product_deleted', handleProductChange);

    return () => {
      clearTimeout(timeoutId);
      socket.off('product_created', handleProductChange);
      socket.off('product_stock_updated', handleProductChange);
      socket.off('product_deleted', handleProductChange);
    };
  }, [selectedCategory, searchQuery, priceRange, sortBy, activePriceRange.min, activePriceRange.max]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 md:py-12 space-y-5 sm:space-y-8 animate-in fade-in duration-300">

      {/* Page Header - Responsive font sizing */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
          Fresh <span className="text-primary dark:text-emerald-500">Marketplace</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl">
          Browse 100% fresh organic produce and agricultural supplies directly from verified local farms.
        </p>
      </div>

      {/* Search + Filter Bar - Responsive on Mobile */}
      <div className="bg-white dark:bg-gray-800 border border-slate-200/90 dark:border-gray-700 rounded-2xl shadow-sm p-3 sm:p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">

          {/* Search Input */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
            <input
              id="product-search"
              type="text"
              placeholder="Search products, seeds, produce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 pl-10 pr-3 py-2.5 rounded-xl text-xs sm:text-sm text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => handleCategorySelect(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3.5 py-2.5 pr-8 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer w-full"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div className="relative">
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <select
              id="price-filter"
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="appearance-none bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 px-3.5 py-2.5 pr-8 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer w-full"
            >
              {PRICE_RANGES.map((range, idx) => (
                <option key={idx} value={idx}>{range.label}</option>
              ))}
            </select>
          </div>

          {/* Sort Option */}
          <div className="relative">
            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
            <select
              id="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-gray-700 pl-8.5 pr-8 py-2.5 rounded-xl text-xs sm:text-sm text-gray-700 dark:text-gray-200 font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all cursor-pointer w-full"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          </div>
        </div>

        {/* Active Filter Chips */}
        {(searchQuery || selectedCategory !== 'All' || priceRange !== 0 || sortBy !== 'newest') && (
          <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 text-xs">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary dark:text-emerald-400 font-semibold px-2.5 py-1 rounded-full">
                🔍 "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {selectedCategory !== 'All' && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                🏷 {selectedCategory}
                <button onClick={() => handleCategorySelect('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {priceRange !== 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                💰 {PRICE_RANGES[priceRange].label}
                <button onClick={() => setPriceRange(0)} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs text-gray-500 hover:text-red-500 underline font-medium ml-auto"
            >
              Clear All Filters
            </button>
            <span className="text-[11px] text-gray-400 font-medium">({products.length} items)</span>
          </div>
        )}
      </div>

      {/* Touchable Category Circles Carousel */}
      <div className="flex items-center space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto pb-3 pt-1 no-scrollbar px-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => handleCategorySelect(cat)}
            className="flex flex-col items-center gap-2 group shrink-0 cursor-pointer focus:outline-none"
          >
            <div className={`w-15 h-15 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full overflow-hidden shadow-sm transition-all duration-300 p-0.5 ${
              selectedCategory === cat
              ? 'ring-3 ring-primary dark:ring-emerald-400 ring-offset-2 scale-105 shadow-primary/20'
              : 'ring-1 ring-slate-200 dark:ring-gray-700 group-hover:ring-primary/50'
            }`}>
              <img 
                src={CATEGORY_IMAGES[cat] || CATEGORY_IMAGES.All} 
                alt={cat} 
                className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = CATEGORY_IMAGES.All;
                }}
              />
            </div>
            <span className={`font-bold text-[11px] sm:text-xs uppercase tracking-wide transition-colors ${
              selectedCategory === cat 
                ? 'text-primary dark:text-emerald-400' 
                : 'text-gray-600 dark:text-gray-300 group-hover:text-primary'
            }`}>
              {cat}
            </span>
          </button>
        ))}
      </div>

      {/* 2-Column Mobile Product Grid (Responsive for all screens) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6">
          {Array.from({ length: 8 }).map((_, idx) => (
            <SkeletonCard key={idx} />
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-5 md:gap-6">
          {products.map(product => (
            <ProductCard key={product._id || product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="py-16 sm:py-24 text-center space-y-4 max-w-md mx-auto">
          <div className="bg-slate-50 dark:bg-gray-800 w-20 h-20 rounded-full flex items-center justify-center text-slate-300 mx-auto">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Products Found</h3>
          <p className="text-gray-500 text-xs sm:text-sm">
            We couldn't find any products in "{selectedCategory}". Try selecting another category or clearing your filters.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-2 px-5 py-2.5 bg-primary hover:bg-[#0c4a29] text-white rounded-xl text-xs sm:text-sm font-bold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductBrowse;
