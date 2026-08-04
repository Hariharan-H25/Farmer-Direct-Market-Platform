import { createContext, useContext, useState, useCallback } from 'react';

const translations = {
  en: {
    // Navbar
    home: 'Home', products: 'Products', cart: 'Cart', login: 'Login',
    register: 'Register', logout: 'Logout', dashboard: 'Dashboard',
    admin: 'Admin Panel', language: 'Language',
    // Home
    heroTitle: 'From Farmer to Your Table',
    heroSubtitle: 'Buy fresh, organic produce directly from verified Indian farmers. No middlemen, pure profits for growers.',
    shopNow: 'Shop Now', joinAsFarmer: 'Join as Farmer',
    // Products
    searchProducts: 'Search products...', filterByCategory: 'Category',
    filterByPrice: 'Price Range', sortBy: 'Sort By', allCategories: 'All Categories',
    addToCart: 'Add to Cart', addToWishlist: 'Add to Wishlist',
    viewDetails: 'View Details', inStock: 'In Stock', outOfStock: 'Out of Stock',
    // Orders
    myOrders: 'My Orders', orderStatus: 'Order Status', totalAmount: 'Total Amount',
    cancel: 'Cancel Order', trackOrder: 'Track Order', placeOrder: 'Place Order',
    // Farmer
    myProducts: 'My Products', addProduct: 'Add Product', editProduct: 'Edit Product',
    deleteProduct: 'Delete Product', myRevenue: 'Total Revenue', pendingOrders: 'Pending Orders',
    // AI Features
    aiChatbot: 'AI Farming Assistant', cropDisease: 'Crop Disease Detection',
    uploadLeaf: 'Upload Leaf Image', analyze: 'Analyze', chatPlaceholder: 'Ask about crops, prices, weather...',
    // Weather
    weather: 'Live Weather', forecast: '7-Day Forecast', humidity: 'Humidity',
    windSpeed: 'Wind Speed', farmingAdvice: 'Farming Advice',
    // Market
    marketPrices: 'Market Prices', trending: 'Trending', bestSellTime: 'Best Sell Time',
    demand: 'Demand',
    // General
    loading: 'Loading...', error: 'Something went wrong', save: 'Save', close: 'Close',
    success: 'Success', confirm: 'Confirm', noData: 'No data found',
  },
  ta: {
    // Navbar
    home: 'முகப்பு', products: 'பொருட்கள்', cart: 'கூடை', login: 'உள்நுழைக',
    register: 'பதிவு செய்க', logout: 'வெளியேறு', dashboard: 'டாஷ்போர்டு',
    admin: 'நிர்வாக பலகை', language: 'மொழி',
    // Home
    heroTitle: 'விவசாயியிடமிருந்து உங்கள் மேசைக்கு',
    heroSubtitle: 'சான்றளிக்கப்பட்ட இந்திய விவசாயிகளிடமிருந்து நேரடியாக புதிய, இயற்கை விளைபொருட்களை வாங்குங்கள். இடைத்தரகர்கள் இல்லை.',
    shopNow: 'இப்போது வாங்கு', joinAsFarmer: 'விவசாயியாக சேருங்கள்',
    // Products
    searchProducts: 'பொருட்களை தேடுங்கள்...', filterByCategory: 'வகை',
    filterByPrice: 'விலை வரம்பு', sortBy: 'வரிசைப்படுத்து', allCategories: 'அனைத்து வகைகள்',
    addToCart: 'கூடையில் சேர்', addToWishlist: 'விருப்பப்பட்டியலில் சேர்',
    viewDetails: 'விவரங்களை காண்க', inStock: 'கையிருப்பில் உள்ளது', outOfStock: 'கையிருப்பில் இல்லை',
    // Orders
    myOrders: 'என் ஆர்டர்கள்', orderStatus: 'ஆர்டர் நிலை', totalAmount: 'மொத்த தொகை',
    cancel: 'ஆர்டர் ரத்து செய்', trackOrder: 'ஆர்டரை கண்காணி', placeOrder: 'ஆர்டர் செய்',
    // Farmer
    myProducts: 'என் பொருட்கள்', addProduct: 'பொருள் சேர்க்க', editProduct: 'திருத்தம் செய்',
    deleteProduct: 'நீக்கு', myRevenue: 'மொத்த வருமானம்', pendingOrders: 'நிலுவை ஆர்டர்கள்',
    // AI Features
    aiChatbot: 'AI விவசாய உதவியாளர்', cropDisease: 'பயிர் நோய் கண்டறிதல்',
    uploadLeaf: 'இலை படத்தை பதிவேற்று', analyze: 'பகுப்பாய்வு செய்', chatPlaceholder: 'பயிர்கள், விலைகள், வானிலை பற்றி கேளுங்கள்...',
    // Weather
    weather: 'நேரடி வானிலை', forecast: '7 நாள் முன்னறிவிப்பு', humidity: 'ஈரப்பதம்',
    windSpeed: 'காற்று வேகம்', farmingAdvice: 'விவசாய ஆலோசனை',
    // Market
    marketPrices: 'சந்தை விலைகள்', trending: 'டிரெண்டிங்', bestSellTime: 'சிறந்த விற்பனை நேரம்',
    demand: 'தேவை',
    // General
    loading: 'ஏற்றுகிறது...', error: 'ஏதோ தவறு நடந்தது', save: 'சேமி', close: 'மூடு',
    success: 'வெற்றி', confirm: 'உறுதிப்படுத்து', noData: 'தரவு எதுவும் இல்லை',
  }
};

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('fc_lang') || 'en');

  const switchLanguage = useCallback((code) => {
    setLang(code);
    localStorage.setItem('fc_lang', code);
  }, []);

  const t = useCallback((key) => translations[lang]?.[key] || translations['en']?.[key] || key, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, switchLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
