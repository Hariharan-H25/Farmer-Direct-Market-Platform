import { useNavigate } from 'react-router-dom';
import { Star, ShoppingBag, MapPin } from 'lucide-react';
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

  // Graceful fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop';

  return (
    <div 
      onClick={handleCardClick}
      className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700/80 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full overflow-hidden relative group"
    >
      {/* Discount Badge */}
      {discountPercent > 0 && (
        <div className="absolute top-0 left-0 bg-accent text-white text-[9px] sm:text-[11px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-br-lg sm:rounded-br-xl z-10 shadow-md">
          {discountPercent}% OFF
        </div>
      )}

      {/* Image Container */}
      <div className="relative w-full aspect-square bg-gray-50 dark:bg-gray-900/60 border-b border-gray-100 dark:border-gray-700/50 p-2 sm:p-3 flex items-center justify-center overflow-hidden">
        <img 
          src={product.image || fallbackImage} 
          alt={product.name}
          className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { 
            e.target.onerror = null; 
            e.target.src = fallbackImage; 
          }}
        />
        {/* Rating Overlay */}
        {rating > 0 && (
          <div className="absolute bottom-1.5 left-1.5 sm:bottom-2 sm:left-2 bg-white/95 dark:bg-gray-900/90 backdrop-blur-xs text-gray-800 dark:text-gray-100 text-[10px] sm:text-[11px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 border border-gray-200/80 dark:border-gray-700 shadow-sm">
            <Star size={10} className="fill-amber-400 text-amber-400" /> {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2.5 sm:p-3.5 flex flex-col flex-grow">
        {/* Brand */}
        {product.brand && (
          <span className="text-[9px] sm:text-[10px] font-black text-primary/80 dark:text-emerald-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">
            {product.brand}
          </span>
        )}

        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-snug mb-1 group-hover:text-primary dark:group-hover:text-emerald-400 transition-colors min-h-[2rem]">
          {product.name}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-gray-400 mb-2 sm:mb-3">
          <MapPin size={10} className="shrink-0 text-gray-400" />
          <span className="truncate">
            {product.location || (product.farmer?.location?.district ? `${product.farmer.location.district}, ${product.farmer.location.state}` : 'Local Farm')}
          </span>
        </div>

        <div className="mt-auto space-y-2">
          {/* Pricing Details */}
          <div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-sm sm:text-base md:text-lg font-black text-gray-900 dark:text-white">
                ₹{product.price}
              </span>
              {originalPrice > product.price && (
                <span className="text-[11px] sm:text-xs text-gray-400 line-through">
                  ₹{originalPrice}
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-[11px] font-bold text-emerald-600 dark:text-emerald-400 truncate">
              Save ₹{savings} · /{product.unit || 'kg'}
            </div>
          </div>

          {/* Quantity Selector - Compact on mobile */}
          <div className="w-full flex justify-between items-center py-1 px-2 sm:py-1.5 sm:px-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-[10px] sm:text-xs bg-gray-50/80 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
            <span className="text-gray-400">Pack:</span>
            <span className="font-bold">1 {product.unit || 'unit'}</span>
          </div>

          {/* Add to Cart Button */}
          <button 
            onClick={handleCartClick}
            className="w-full bg-primary hover:bg-[#0c4a29] dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white active:scale-95 transition-all py-1.5 sm:py-2 px-2 rounded-lg sm:rounded-xl font-bold text-[11px] sm:text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20"
            aria-label={`Add ${product.name} to cart`}
          >
            <ShoppingBag size={13} />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
