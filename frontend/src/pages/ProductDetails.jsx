import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Star, ShoppingCart, Minus, Plus, MapPin, Leaf, Truck, Shield, 
  ChevronLeft, Heart, Share2, CheckCircle, Package, Clock 
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [loaded, setLoaded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    if (!product) {
      navigate('/products');
      return;
    }
    // Trigger entrance animation
    requestAnimationFrame(() => setLoaded(true));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product, navigate]);

  if (!product) return null;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/cart');
  };

  const totalPrice = (product.price * quantity).toFixed(0);

  const highlights = [
    { icon: <Leaf size={20} />, title: '100% Organic', desc: 'No pesticides used' },
    { icon: <Truck size={20} />, title: 'Farm Fresh Delivery', desc: 'Within 24 hours' },
    { icon: <Shield size={20} />, title: 'Quality Guaranteed', desc: 'Return if not satisfied' },
    { icon: <Package size={20} />, title: 'Eco Packaging', desc: 'Biodegradable materials' },
  ];

  const reviews = [
    { name: 'Priya N.', rating: 5, comment: 'Absolutely fresh and delicious! Will order again.', date: '2 days ago' },
    { name: 'Rahul V.', rating: 4, comment: 'Great quality produce. Delivery was quick and packaging was excellent.', date: '1 week ago' },
    { name: 'Anjali S.', rating: 5, comment: 'Best organic produce I have found online. Highly recommended!', date: '2 weeks ago' },
  ];

  return (
    <div className={`min-h-screen bg-gray-50/50 transition-all duration-700 ${loaded ? 'opacity-100' : 'opacity-0 translate-y-4'}`}>
      
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <button 
          onClick={() => navigate(-1)} 
          className="group flex items-center gap-2 text-gray-500 hover:text-primary font-medium transition-colors"
        >
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Marketplace
        </button>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Product Image */}
          <div className={`space-y-4 transition-all duration-700 delay-100 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}>
            <div className="relative bg-white rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-200/50 border border-gray-100 aspect-square group">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              
              {/* Category badge */}
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-black text-primary shadow-lg">
                {product.category}
              </div>

              {/* Action buttons */}
              <div className="absolute top-6 right-6 flex flex-col gap-3">
                <button 
                  onClick={() => setIsFavorited(!isFavorited)}
                  className={`p-3 rounded-xl shadow-lg backdrop-blur-md transition-all duration-300 ${
                    isFavorited 
                      ? 'bg-red-500 text-white scale-110' 
                      : 'bg-white/90 text-gray-600 hover:text-red-500'
                  }`}
                >
                  <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
                <button className="bg-white/90 backdrop-blur-md p-3 rounded-xl shadow-lg text-gray-600 hover:text-primary transition-colors">
                  <Share2 size={20} />
                </button>
              </div>

              {/* Status badge */}
              <div className="absolute bottom-6 left-6 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg">
                <CheckCircle size={16} />
                {product.status || 'Available'}
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div className={`space-y-8 transition-all duration-700 delay-200 ${loaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            
            {/* Title & Rating */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-600 px-3 py-1.5 rounded-lg font-bold">
                  <Star size={14} fill="currentColor" />
                  <span>{product.rating}</span>
                </div>
                <span className="text-gray-400 font-medium">•</span>
                <div className="flex items-center gap-1 text-gray-500">
                  <MapPin size={14} />
                  <span className="font-medium">{product.location}</span>
                </div>
              </div>
              
              <h1 className="text-4xl lg:text-5xl font-black text-dark tracking-tight leading-tight">
                {product.name}
              </h1>
              
              <p className="text-gray-500 text-lg leading-relaxed">
                Premium quality {product.name.toLowerCase()} sourced directly from local farms. 
                Freshly harvested and delivered to your doorstep with care. No middlemen, no chemicals — 
                just pure, farm-fresh goodness.
              </p>

              {/* Farmer Info Banner */}
              <div className="flex items-center gap-4 p-4 bg-slate-50/50 border border-slate-100 rounded-2xl mt-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-lg shrink-0">
                  {(product.farmer?.name || 'Local Farmer').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verified Organic Farmer</div>
                  <div className="font-bold text-slate-800 text-base">
                    {product.farmer?.name || 'Verified Local Farmer'}
                  </div>
                  {product.farmer?.farmName && (
                    <div className="text-xs text-slate-500 font-medium mt-0.5">
                      🚜 {product.farmer.farmName}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-sm text-gray-500 font-bold uppercase tracking-wider">Price per {product.unit}</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-5xl font-black text-dark">₹{product.price}</span>
                    <span className="text-lg text-gray-400 line-through font-medium">₹{Math.round(product.price * 1.3)}</span>
                    <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-1 rounded-lg ml-1">-30%</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500 font-bold">Total</span>
                  <div className="text-3xl font-black text-primary">₹{totalPrice}</div>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-black text-dark uppercase tracking-wider">Quantity ({product.unit})</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border-2 border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-4 hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary disabled:opacity-30"
                    disabled={quantity <= 1}
                  >
                    <Minus size={20} strokeWidth={3} />
                  </button>
                  <span className="w-16 text-center text-2xl font-black text-dark">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(50, quantity + 1))}
                    className="p-4 hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary disabled:opacity-30"
                    disabled={quantity >= 50}
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Clock size={14} />
                  <span className="font-medium">In stock • Ships within 24hrs</span>
                </div>
              </div>
            </div>

            {/* Add to Cart / Buy Now */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <button 
                onClick={handleAddToCart}
                className={`flex-1 py-5 rounded-2xl text-lg font-black flex items-center justify-center gap-3 transition-all duration-500 shadow-2xl ${
                  addedToCart
                    ? 'bg-emerald-500 text-white shadow-emerald-200 scale-[0.98]'
                    : 'bg-primary text-white shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {addedToCart ? (
                  <>
                    <CheckCircle size={24} className="animate-bounce" />
                    Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart size={24} />
                    Add to Cart — ₹{totalPrice}
                  </>
                )}
              </button>
              <button 
                onClick={handleBuyNow}
                className="sm:w-auto px-8 py-5 rounded-2xl text-lg font-black border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all duration-300 hover:scale-[1.02] active:scale-95 shadow-sm hover:shadow-primary/30"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Highlights Row */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-700 delay-300 ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {highlights.map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 border border-gray-100 flex items-start gap-4 hover:shadow-lg hover:shadow-gray-100 transition-all duration-300 hover:-translate-y-1">
              <div className="bg-primary/10 text-primary p-3 rounded-xl shrink-0">
                {item.icon}
              </div>
              <div>
                <div className="font-black text-dark text-sm">{item.title}</div>
                <div className="text-gray-400 text-xs font-medium mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs Section */}
      <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 transition-all duration-700 delay-[400ms] ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100">
            {['description', 'location', 'reviews', 'delivery'].map(tab => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-5 text-center font-bold text-sm uppercase tracking-wider transition-all relative ${
                  activeTab === tab 
                    ? 'text-primary' 
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${reviews.length})` : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8 lg:p-10">
            {activeTab === 'description' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-2xl font-black text-dark">About this product</h3>
                <p className="text-gray-500 leading-relaxed text-lg">
                  Our {product.name.toLowerCase()} are carefully cultivated and harvested at peak ripeness 
                  from verified organic farms in {product.location}. Each batch undergoes quality checks 
                  to ensure you receive only the freshest produce.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Category</div>
                    <div className="text-lg font-black text-dark mt-1">{product.category}</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Unit</div>
                    <div className="text-lg font-black text-dark mt-1">Per {product.unit}</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Origin</div>
                    <div className="text-lg font-black text-dark mt-1">{product.location}</div>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-5">
                    <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">Rating</div>
                    <div className="text-lg font-black text-dark mt-1 flex items-center gap-1">
                      <Star size={16} fill="#f59e0b" className="text-amber-500" /> {product.rating}/5
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'location' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-2xl font-black text-dark">Farm Location</h3>
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin size={20} className="text-primary" />
                  <span className="font-bold text-lg">{product.location || 'Location unverified'}</span>
                </div>
                <div className="h-[400px] w-full rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 relative">
                  {product.location ? (
                    <iframe 
                      title="map"
                      width="100%" 
                      height="100%" 
                      frameBorder="0" 
                      scrolling="no" 
                      marginHeight="0" 
                      marginWidth="0"
                      src={`https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${encodeURIComponent(product.location)}&t=&z=13&ie=UTF8&iwloc=B&output=embed`}
                    ></iframe>
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-50 text-gray-400 font-medium">
                      Location data not available for this product.
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-2xl font-black text-dark">Customer Reviews</h3>
                <div className="space-y-4">
                  {reviews.map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 hover:bg-gray-100/80 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">
                            {review.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-dark">{review.name}</div>
                            <div className="text-xs text-gray-400">{review.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: review.rating }, (_, i) => (
                            <Star key={i} size={14} fill="#f59e0b" className="text-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-600 font-medium">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-2xl font-black text-dark">Delivery Information</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6">
                    <Truck className="text-primary shrink-0 mt-0.5" size={24} />
                    <div>
                      <div className="font-bold text-dark">Standard Delivery</div>
                      <div className="text-gray-500 text-sm mt-1">Delivered within 24-48 hours. Free delivery on orders above ₹500.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6">
                    <Package className="text-primary shrink-0 mt-0.5" size={24} />
                    <div>
                      <div className="font-bold text-dark">Eco-Friendly Packaging</div>
                      <div className="text-gray-500 text-sm mt-1">All products are packed in biodegradable materials to minimize environmental impact.</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6">
                    <Shield className="text-primary shrink-0 mt-0.5" size={24} />
                    <div>
                      <div className="font-bold text-dark">Freshness Guarantee</div>
                      <div className="text-gray-500 text-sm mt-1">Not satisfied? Get a full refund within 24 hours of delivery. No questions asked.</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
