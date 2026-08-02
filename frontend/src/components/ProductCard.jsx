import { useNavigate } from 'react-router-dom';
import { Star, ChevronDown, ShoppingBag, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const handleCardClick = () => {
    navigate(`/product/${product.id || product._id}`, { state: { product } });
  };

  const handleCartClick = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  // Use real DB discount data if available, else compute a fallback
  const hasRealDiscount = product.discount && product.discount > 0 && product.originalPrice;
  const originalPrice = hasRealDiscount ? product.originalPrice : Math.round(product.price * 1.35);
  const discountPercent = hasRealDiscount ? product.discount : Math.round(((originalPrice - product.price) / originalPrice) * 100);
  const savings = originalPrice - product.price;

  // Rating — support both `rating` (mock) and `averageRating` (MongoDB)
  const rating = product.averageRating || product.rating || 0;

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white rounded-xl border border-gray-200 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative group"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-0 left-0 bg-accent text-white text-[11px] font-black px-2.5 py-1 rounded-br-xl z-10 shadow-md">
          {discountPercent}% OFF
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 border-b border-gray-100 p-3 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image} 
          alt={product.name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
          onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1416879598555-220b8b2e35a1?w=400&h=400&fit=crop'; }}
        />
        {/* Rating Overlay */}
        {rating > 0 && (
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-sm text-gray-700 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200 shadow-sm">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] font-black text-primary/70 uppercase tracking-widest mb-1">
            {product.brand}
          </span>
        )}

        <h5 className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug mb-1 group-hover:text-primary transition-colors">
          {product.name}
        </h5>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-[11px] text-gray-400 mb-3">
          <MapPin size={10} className="shrink-0" />
          <span className="truncate">
            {product.location || (product.farmer?.location?.district ? `${product.farmer.location.district}, ${product.farmer.location.state}` : 'India')}
          </span>
        </div>

        <div className="mt-auto space-y-2.5">
          {/* Pricing Details */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-black text-gray-900">₹{product.price}</span>
              <span className="text-sm text-gray-400 line-through">₹{originalPrice}</span>
            </div>
            <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
              Save ₹{savings} · per {product.unit || 'unit'}
            </div>
          </div>

          {/* Size Selector */}
          <div className="w-full flex justify-between items-center py-1.5 px-3 border border-gray-200 rounded-lg text-xs bg-gray-50/80 text-gray-700 hover:border-primary/40 transition-colors">
            <span className="font-medium text-gray-400">Qty / Pack</span>
            <div className="flex items-center gap-1 font-bold text-gray-700">
              1 {product.unit} <ChevronDown size={12} className="text-gray-400"/>
            </div>
          </div>

          <button 
            onClick={handleCartClick}
            className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white active:scale-95 transition-all py-2 rounded-lg font-bold text-xs uppercase flex items-center justify-center gap-2 shadow-sm"
          >
            <ShoppingBag size={14} /> Add To Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
