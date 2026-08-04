import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, MapPin, Phone, LogOut, Package, Heart, Sun, Moon, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { signOut } from '../api';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem('profile'));
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { lang, switchLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const logout = async () => {
    try { await signOut(); } catch { /* Ignore API errors — clear local session anyway */ }
    localStorage.removeItem('profile');
    navigate('/login');
    window.location.reload();
  };

  const categories = ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Seeds", "Crop Care", "Farming Tools"];

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-200 relative">
      {/* 1. Top Bar */}
      <div className="bg-secondary text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs font-medium">
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-gray-200 transition-colors">About Us</Link>
            <Link to="/contact" className="hover:text-gray-200 transition-colors">Bulk Order Inquiry</Link>
            {user?.result?.role === 'farmer' || user?.role === 'farmer' ? (
              <Link to="/dashboard" className="text-accent font-bold hover:text-white transition-colors">Sell on FarmConnect</Link>
            ) : (
              <Link to="/register?role=farmer" className="hover:text-gray-200 transition-colors">Sell on FarmConnect</Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-200"><MapPin size={12} className="mr-1" /> Delivering across India</span>
            <div className="bg-[#427053] px-3 py-1 rounded flex items-center shadow-inner">
              <Phone size={12} className="mr-2" />
              <span>Missed Call To Order: <strong>1800-3000-2434</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 lg:py-4">
        <div className="flex items-center justify-between gap-4 lg:gap-8">

          {/* Mobile Menu Toggle */}
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2 -ml-2 text-gray-600 hover:text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <span className="text-2xl md:text-3xl font-black tracking-tight text-primary flex items-center">
              Farm<span className="text-gray-800">Connect</span>
            </span>
          </Link>

          {/* Search Bar - Center */}
          <div className="hidden lg:flex flex-1 max-w-2xl relative">
            <div className="flex w-full">
              <select className="bg-gray-50 border border-gray-300 border-r-0 rounded-l-md px-3 text-sm text-gray-600 outline-none focus:ring-1 focus:ring-primary w-32 cursor-pointer relative z-10">
                <option>{t('allCategories')}</option>
                <option>Vegetables</option>
                <option>Fruits</option>
                <option>Seeds</option>
              </select>
              <input
                type="text"
                placeholder={t('searchProducts')}
                className="flex-1 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
              />
              <button className="bg-secondary hover:bg-primary transition-colors text-white px-6 rounded-r-md flex items-center justify-center">
                <Search size={18} />
              </button>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2 md:space-x-4 shrink-0">

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => switchLanguage(lang === 'en' ? 'ta' : 'en')}
              className="hidden md:flex flex-col items-end cursor-pointer hover:opacity-85 select-none focus:outline-none bg-transparent border-0"
              title={t('language')}
            >
              <span className="text-xs text-gray-400 font-medium">{t('language')}</span>
              <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                {lang === 'en' ? 'English' : 'தமிழ்'}
                <span className="text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded hover:bg-gray-200">
                  {lang === 'en' ? 'தமிழ்' : 'EN'}
                </span>
              </span>
            </button>

            {user ? (
              <div className="relative group hidden lg:block">
                <div className="flex flex-col items-center cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors">
                  <User size={20} className="text-gray-700" />
                  <span className="text-xs font-bold text-gray-700 mt-1 truncate max-w-[80px]">
                    {(user?.result?.name || user?.name || 'User').split(' ')[0]}
                  </span>
                </div>
                {/* Dropdown */}
                <div className="absolute top-full right-0 mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                  <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                    <p className="font-bold text-sm text-gray-800">My Account</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.result?.role || user?.role}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <Link to="/orders" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"><Package size={16} className="mr-2" />{t('myOrders')}</Link>
                    <Link to="/wishlist" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"><Heart size={16} className="mr-2" />Wishlist</Link>
                    <Link to="/market" className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg"><TrendingUp size={16} className="mr-2" />Market &amp; AI</Link>
                    <button onClick={logout} className="w-full text-left flex items-center px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"><LogOut size={16} className="mr-2" />{t('logout')}</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden lg:flex flex-col items-center p-2 rounded-md hover:bg-gray-50 transition-colors">
                <User size={20} className="text-gray-700" />
                <span className="text-xs font-medium text-gray-700 mt-1">Login / Register</span>
              </Link>
            )}

            <Link to="/cart" className="flex flex-col items-center relative p-2 rounded-md hover:bg-gray-50 transition-colors">
              <div className="relative">
                <ShoppingCart size={22} className="text-gray-700" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-gray-700 mt-1 hidden md:block">{t('cart')}</span>
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-3 lg:hidden flex w-full relative">
          <input
            type="text"
            placeholder={t('searchProducts')}
            className="flex-1 border border-gray-300 rounded-l-md px-4 py-2 text-sm focus:outline-none focus:border-primary"
          />
          <button className="bg-secondary text-white px-4 rounded-r-md flex items-center justify-center">
            <Search size={18} />
          </button>
        </div>
      </div>

      {/* 3. Category Sub-navbar */}
      <div className="hidden lg:block border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center space-x-6 text-[13px] font-bold text-gray-600 uppercase tracking-wide overflow-x-auto scrollbar-hide">
            <li>
              <Link to="/products" className="block py-3 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors whitespace-nowrap">All Products</Link>
            </li>
            {categories.map(cat => (
              <li key={cat}>
                <Link to={`/products?category=${cat}`} className="block py-3 border-b-2 border-transparent hover:border-primary hover:text-primary transition-colors whitespace-nowrap">
                  {cat}
                </Link>
              </li>
            ))}
            <li className="ml-auto whitespace-nowrap">
              <Link to="/market" className="flex items-center gap-1.5 py-3 text-emerald-600 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-600 transition-colors">
                <TrendingUp size={14} /> Market &amp; AI
              </Link>
            </li>
            {user?.result?.role === 'admin' || user?.role === 'admin' ? (
              <li>
                <Link to="/admin" className="block py-3 text-red-600 hover:text-red-700">Admin Panel</Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-200 z-50">
          <div className="flex flex-col py-2">
            {!user ? (
              <div className="px-4 py-4 border-b border-gray-100 flex gap-2">
                <Link to="/login" className="flex-1 text-center bg-gray-100 text-gray-800 py-2 rounded-md font-bold text-sm">Login</Link>
                <Link to="/register" className="flex-1 text-center bg-primary text-white py-2 rounded-md font-bold text-sm">Register</Link>
              </div>
            ) : (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <div>
                  <p className="font-bold text-gray-800">Hi, {user?.result?.name || user?.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.result?.role || user?.role}</p>
                </div>
                <button onClick={logout} className="text-red-500 text-sm font-bold p-2">{t('logout')}</button>
              </div>
            )}

            {/* Language & Theme toggles for mobile */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <button
                onClick={() => switchLanguage(lang === 'en' ? 'ta' : 'en')}
                className="text-sm font-bold text-gray-700 flex items-center gap-2"
              >
                🌐 {lang === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
              </button>
              <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            </div>

            <Link to="/products" className="px-4 py-3 text-sm font-bold text-gray-700 border-b border-gray-50">All Products</Link>
            {categories.map(cat => (
              <Link key={cat} to={`/products?category=${cat}`} className="px-4 py-3 text-sm text-gray-600 border-b border-gray-50 hover:bg-gray-50">
                {cat}
              </Link>
            ))}
            <Link to="/market" className="px-4 py-3 text-sm font-bold text-emerald-600 border-b border-gray-50 flex items-center gap-2">
              <TrendingUp size={16} /> Market &amp; AI
            </Link>
            {user?.result?.role === 'farmer' || user?.role === 'farmer' ? (
              <Link to="/dashboard" className="px-4 py-3 text-sm font-bold text-primary bg-green-50 border-b border-gray-50">Farmer Dashboard</Link>
            ) : null}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
