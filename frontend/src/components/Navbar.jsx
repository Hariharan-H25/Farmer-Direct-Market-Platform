import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, Menu, X, User, MapPin, Phone, LogOut, Package, 
  Sun, Moon, TrendingUp, ChevronRight, LogIn, UserPlus, Truck, 
  Sprout, ShieldCheck, ShoppingBag, Compass 
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef(null);

  const { userResult, isAuthenticated, role: userRole, logout: authLogout } = useAuth();
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { lang, switchLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Prevent background scrolling while mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Reliable outside click / touch tap handler using pointerdown
  useEffect(() => {
    const handlePointerOutside = (event) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('pointerdown', handlePointerOutside);
    return () => {
      document.removeEventListener('pointerdown', handlePointerOutside);
    };
  }, []);

  const closeDrawer = () => setIsOpen(false);

  const handleLogout = async () => {
    setUserDropdownOpen(false);
    setIsOpen(false);
    await authLogout();
    navigate('/');
  };

  const categories = ["Vegetables", "Fruits", "Spices", "Grains", "Dairy", "Seeds", "Crop Care", "Farming Tools"];
  const userName = userResult?.name || '';
  const shortName = userName ? userName.split(' ')[0] : '';
  const userEmail = userResult?.email || '';

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 relative z-40 transition-colors duration-150">
      {/* 1. Top Bar (Desktop Only) */}
      <div className="bg-secondary text-white hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between text-xs font-medium">
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-gray-200 transition-colors">
              {t('aboutUs')}
            </Link>
            <Link to="/contact" className="hover:text-gray-200 transition-colors">
              {t('contactUs')}
            </Link>
            {userRole === 'farmer' ? (
              <Link to="/dashboard" className="text-accent font-bold hover:text-white transition-colors">
                {t('farmerDashboard')}
              </Link>
            ) : (
              <Link to="/login/farmer" className="hover:text-gray-200 transition-colors">
                🌾 {t('sellOnFarmConnect')}
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center text-gray-200">
              <MapPin size={12} className="mr-1" /> {t('deliveringAcrossIndia')}
            </span>
            <div className="bg-[#427053] px-3 py-1 rounded flex items-center shadow-inner">
              <Phone size={12} className="mr-2" />
              <span>{t('missedCallToOrder')}: <strong>1800-3000-2434</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Main Header (Mobile & Desktop) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-8">

          {/* Left: Hamburger Menu (Mobile) & Logo */}
          <div className="flex items-center gap-1 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 -ml-1 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-emerald-400 focus:outline-none rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Logo */}
            <Link to="/" onClick={closeDrawer} className="flex items-center shrink-0">
              <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight text-primary dark:text-emerald-500 flex items-center">
                Farm<span className="text-gray-800 dark:text-gray-100">Connect</span>
              </span>
            </Link>
          </div>

          {/* Right Actions: Theme Toggle, Language, Account Icon, Cart */}
          <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-4 shrink-0">

            {/* Dark Mode Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun size={19} className="text-amber-400" /> : <Moon size={19} />}
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => switchLanguage(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-800 dark:text-gray-200"
              title={lang === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
              aria-label="Toggle language"
            >
              <span className="text-sm">🌐</span>
              <span className="hidden sm:inline">{lang === 'en' ? 'தமிழ்' : 'English'}</span>
              <span className="text-[10px] bg-primary text-white px-1.5 py-0.5 rounded font-black">
                {lang === 'en' ? 'TA' : 'EN'}
              </span>
            </button>

            {/* Account / Profile Icon & Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setUserDropdownOpen(prev => !prev);
                }}
                className="flex items-center gap-1.5 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors focus:outline-none cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                aria-label="Account options"
                aria-expanded={userDropdownOpen}
                title={isAuthenticated ? `Signed in as ${userName}` : "Sign in / Register"}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-primary dark:text-emerald-400">
                  <User size={18} />
                </div>
                {isAuthenticated && (
                  <span className="hidden lg:inline text-xs font-bold text-gray-700 dark:text-gray-200 max-w-[90px] truncate">
                    {shortName}
                  </span>
                )}
              </button>

              {/* Account Dropdown Menu */}
              {userDropdownOpen && (
                <div 
                  className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isAuthenticated ? (
                    <>
                      {/* User Header */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{userName || 'User'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userEmail}</p>
                        <span className="inline-block mt-1 text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          {userRole}
                        </span>
                      </div>

                      {/* Menu Options */}
                      <div className="p-1.5 space-y-0.5 text-sm">
                        <Link
                          to="/orders"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                        >
                          <Package size={16} className="mr-2.5 text-primary dark:text-emerald-400" />
                          {t('myOrders')}
                        </Link>

                        {userRole === 'farmer' && (
                          <Link
                            to="/dashboard"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-primary dark:text-emerald-400 font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
                          >
                            <Sprout size={16} className="mr-2.5" />
                            {t('farmerDashboard')}
                          </Link>
                        )}

                        {userRole === 'admin' && (
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-red-600 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors"
                          >
                            <ShieldCheck size={16} className="mr-2.5" />
                            {t('adminPanel')}
                          </Link>
                        )}

                        {(userRole === 'delivery' || userRole === 'admin') && (
                          <Link
                            to="/delivery"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center px-3 py-2 text-sky-600 dark:text-sky-400 font-bold hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-colors"
                          >
                            <Truck size={16} className="mr-2.5" />
                            {t('deliveryPortal')}
                          </Link>
                        )}

                        <Link
                          to="/market"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                        >
                          <TrendingUp size={16} className="mr-2.5 text-emerald-600 dark:text-emerald-400" />
                          {t('marketAi')}
                        </Link>

                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors font-medium border-t border-gray-100 dark:border-gray-800 mt-1 cursor-pointer"
                        >
                          <LogOut size={16} className="mr-2.5" />
                          {t('logout')}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Logged Out Role Menu */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{t('welcome')}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{t('directMarket')}</p>
                      </div>

                      <div className="p-2 space-y-1 text-sm">
                        <div className="px-2 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                          {t('choosePortal')}
                        </div>

                        <Link
                          to="/login/customer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <ShoppingBag size={15} className="text-primary dark:text-emerald-400" />
                            {t('customerLogin')}
                          </span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </Link>

                        <Link
                          to="/login/farmer"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-xl transition-colors font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <Sprout size={15} className="text-emerald-600 dark:text-emerald-400" />
                            {t('farmerLogin')}
                          </span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </Link>

                        <Link
                          to="/login/delivery"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-gray-700 dark:text-gray-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-xl transition-colors font-medium"
                        >
                          <span className="flex items-center gap-2">
                            <Truck size={15} className="text-sky-600 dark:text-sky-400" />
                            {t('deliveryLogin')}
                          </span>
                          <ChevronRight size={14} className="text-gray-400" />
                        </Link>

                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 space-y-1.5">
                          <Link
                            to="/login"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-[#0c4a29] text-white py-2 px-3 rounded-xl font-bold text-xs transition-colors shadow-xs"
                          >
                            <LogIn size={14} /> {t('login')}
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center justify-center gap-2 w-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 py-2 px-3 rounded-xl font-bold text-xs transition-colors"
                          >
                            <UserPlus size={14} /> {t('register')}
                          </Link>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Shopping Cart */}
            <Link
              to="/cart"
              onClick={closeDrawer}
              className="flex items-center p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200 transition-colors relative"
              aria-label="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] font-black h-4.5 min-w-[18px] px-1 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {totalItems}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1.5 hidden md:block">
                {t('cart')}
              </span>
            </Link>

          </div>
        </div>
      </div>

      {/* 3. Category Sub-navbar (Desktop Only) */}
      <div className="hidden lg:block border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors duration-150">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center space-x-6 text-[13px] font-bold text-gray-600 dark:text-gray-300 uppercase tracking-wide overflow-x-auto scrollbar-hide">
            <li>
              <Link to="/products" className="block py-3 border-b-2 border-transparent hover:border-primary hover:text-primary dark:hover:text-emerald-400 transition-colors whitespace-nowrap">
                {t('allProducts')}
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat}>
                <Link
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  className="block py-3 border-b-2 border-transparent hover:border-primary hover:text-primary dark:hover:text-emerald-400 transition-colors whitespace-nowrap"
                >
                  {t(cat) || cat}
                </Link>
              </li>
            ))}
            <li className="ml-auto whitespace-nowrap">
              <Link to="/market" className="flex items-center gap-1.5 py-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 border-b-2 border-transparent hover:border-emerald-600 transition-colors">
                <TrendingUp size={14} /> {t('marketAi')}
              </Link>
            </li>
            {userRole === 'admin' && (
              <li>
                <Link to="/admin" className="block py-3 text-red-600 hover:text-red-700 font-bold">
                  {t('adminPanel')}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* 4. Mobile Drawer Navigation */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={closeDrawer}
            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-xs z-40 animate-in fade-in duration-200"
            aria-hidden="true"
          />

          {/* Drawer Sheet */}
          <div className="lg:hidden fixed top-0 left-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-250">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/60">
              <Link to="/" onClick={closeDrawer} className="flex items-center">
                <span className="text-xl font-black text-primary dark:text-emerald-500">
                  Farm<span className="text-gray-900 dark:text-white">Connect</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* User Quick Bar or Login Portals in Drawer */}
            {!isAuthenticated ? (
              <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-2">
                <div className="grid grid-cols-3 gap-1.5 text-center text-xs font-bold">
                  <Link
                    to="/login/customer"
                    onClick={closeDrawer}
                    className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800"
                  >
                    🛒 {t('customerLogin')}
                  </Link>
                  <Link
                    to="/login/farmer"
                    onClick={closeDrawer}
                    className="p-2 bg-green-50 dark:bg-green-950/60 text-green-800 dark:text-green-300 rounded-xl border border-green-200 dark:border-green-800"
                  >
                    🌾 {t('farmerLogin')}
                  </Link>
                  <Link
                    to="/login/delivery"
                    onClick={closeDrawer}
                    className="p-2 bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 rounded-xl border border-sky-200 dark:border-sky-800"
                  >
                    🛵 {t('deliveryLogin')}
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="text-center bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 py-2 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeDrawer}
                    className="text-center bg-primary hover:bg-[#0c4a29] text-white py-2 rounded-xl font-bold text-xs transition-colors shadow-xs"
                  >
                    {t('register')}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-emerald-50/50 dark:bg-emerald-950/30 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[170px]">
                    {userName || 'User'}
                  </p>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                    {userRole}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 text-xs font-bold py-1 px-2.5 rounded-lg border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                >
                  {t('logout')}
                </button>
              </div>
            )}

            {/* Language Switcher in Drawer */}
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40">
              <button
                type="button"
                onClick={() => switchLanguage(lang === 'en' ? 'ta' : 'en')}
                className="w-full text-left text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between py-1 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  🌐 {lang === 'en' ? 'Switch to தமிழ்' : 'Switch to English'}
                </span>
                <span className="text-[10px] uppercase bg-primary text-white px-2 py-0.5 rounded-md font-bold">
                  {lang === 'en' ? 'தமிழ்' : 'EN'}
                </span>
              </button>
            </div>

            {/* Scrollable Navigation Links */}
            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-4 py-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                Marketplace Categories
              </div>

              {/* All Products */}
              <Link
                to="/products"
                onClick={closeDrawer}
                className="flex items-center justify-between px-4 py-2.5 text-sm font-bold text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800/50 transition-colors"
              >
                <span>{t('allProducts')}</span>
                <ChevronRight size={16} className="text-gray-400" />
              </Link>

              {/* Category Links with Tamil Localization */}
              {categories.map(cat => (
                <Link
                  key={cat}
                  to={`/products?category=${encodeURIComponent(cat)}`}
                  onClick={closeDrawer}
                  className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 border-b border-gray-50 dark:border-gray-800/50 transition-colors"
                >
                  <span>{t(cat) || cat}</span>
                  <ChevronRight size={14} className="text-gray-400" />
                </Link>
              ))}

              <div className="px-4 pt-3 pb-1 text-[11px] font-black uppercase tracking-wider text-gray-400">
                Navigation & Portals
              </div>

              <Link
                to="/market"
                onClick={closeDrawer}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
              >
                <TrendingUp size={16} /> {t('marketAi')}
              </Link>

              {isAuthenticated && (
                <Link
                  to="/orders"
                  onClick={closeDrawer}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <Package size={16} /> {t('myOrders')}
                </Link>
              )}

              {userRole === 'farmer' && (
                <Link
                  to="/dashboard"
                  onClick={closeDrawer}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-primary dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/20 transition-colors"
                >
                  🌾 {t('farmerDashboard')}
                </Link>
              )}

              {(userRole === 'delivery' || userRole === 'admin') && (
                <Link
                  to="/delivery"
                  onClick={closeDrawer}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-sky-600 dark:text-sky-400 transition-colors"
                >
                  🛵 {t('deliveryPortal')}
                </Link>
              )}

              {userRole === 'admin' && (
                <Link
                  to="/admin"
                  onClick={closeDrawer}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 transition-colors"
                >
                  🛡 {t('adminPanel')}
                </Link>
              )}
            </div>

            {/* Bottom Contact Footer */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/60 text-xs text-gray-500 dark:text-gray-400">
              <p className="flex items-center gap-1.5 font-bold text-gray-700 dark:text-gray-300">
                <Phone size={13} className="text-primary" /> Toll Free: 1800-3000-2434
              </p>
              <p className="text-[11px] mt-1 text-gray-400">{t('directMarket')}</p>
            </div>
          </div>
        </>
      )}
    </nav>
  );
};

export default Navbar;
