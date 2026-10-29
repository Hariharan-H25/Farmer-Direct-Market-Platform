import { Suspense, lazy } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import Navbar from './components/Navbar';
import AIChatbot from './components/AIChatbot';
import { useAuth } from './context/AuthContext';
import { useLanguage } from './context/LanguageContext';

// Eagerly loaded landing, auth, and critical pages
import AuthLanding from './pages/AuthLanding';
import VerifyOTP from './pages/VerifyOTP';
import Home from './pages/Home';
import Login from './pages/Login';
import CustomerLogin from './pages/CustomerLogin';
import FarmerLogin from './pages/FarmerLogin';
import DeliveryLogin from './pages/DeliveryLogin';
import Register from './pages/Register';

// Lazy-loaded routes — split into separate JS chunks
const ProductBrowse = lazy(() => import('./pages/ProductBrowse'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard'));
const DeliveryDashboard = lazy(() => import('./pages/DeliveryDashboard'));
const Cart = lazy(() => import('./pages/Cart'));
const MarketIntelligence = lazy(() => import('./pages/MarketIntelligence'));
const Orders = lazy(() => import('./pages/Orders'));

// Loading skeleton shown while lazy pages fetch
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-400 text-sm font-medium">Loading FarmConnect...</p>
    </div>
  </div>
);

// Protected Route Wrapper using centralized AuthContext
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, isVerified, userResult } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (!isVerified) {
    const email = userResult?.email || '';
    return <Navigate to={`/verify-otp?email=${encodeURIComponent(email)}`} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role) && role !== 'admin') {
    if (role === 'farmer') return <Navigate to="/dashboard" replace />;
    if (role === 'delivery') return <Navigate to="/delivery" replace />;
    return <Navigate to="/products" replace />;
  }

  return children;
};

// Priority Root Route Handler
const RootRoute = () => {
  const { isAuthenticated, role, isVerified, userResult } = useAuth();

  if (!isAuthenticated) {
    return <AuthLanding />;
  }

  if (!isVerified) {
    const email = userResult?.email || '';
    return <Navigate to={`/verify-otp?email=${encodeURIComponent(email)}`} replace />;
  }

  if (role === 'farmer') return <Navigate to="/dashboard" replace />;
  if (role === 'delivery') return <Navigate to="/delivery" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Home />;
};

function App() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const isAuthLanding = location.pathname === '/' && !isAuthenticated;

  return (
    <div className="min-h-screen flex flex-col font-poppins bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 selection:bg-primary/30 transition-colors duration-150">
      {/* Hide standard navbar on unauthenticated landing page so it doesn't leak market links before auth */}
      {!isAuthLanding && <Navbar />}

      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Priority 1: Landing / Root Route */}
            <Route path="/" element={<RootRoute />} />

            {/* 3 Separate Role-Based Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/user-login" element={<CustomerLogin />} />
            <Route path="/farmer-login" element={<FarmerLogin />} />
            <Route path="/delivery-login" element={<DeliveryLogin />} />
            {/* Aliases for backwards compatibility */}
            <Route path="/login/customer" element={<CustomerLogin />} />
            <Route path="/login/farmer" element={<FarmerLogin />} />
            <Route path="/login/delivery" element={<DeliveryLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />

            {/* Customer & Marketplace Protected Routes */}
            <Route path="/products" element={<ProtectedRoute><ProductBrowse /></ProtectedRoute>} />
            <Route path="/product/:id" element={<ProtectedRoute><ProductDetails /></ProtectedRoute>} />
            <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/market" element={<ProtectedRoute><MarketIntelligence /></ProtectedRoute>} />

            {/* Farmer Dashboard (Authorized for Farmers and Admins) */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['farmer', 'admin']}><FarmerDashboard /></ProtectedRoute>} />

            {/* Delivery Logistics Hub (Authorized for Delivery personnel and Admins) */}
            <Route path="/delivery" element={<ProtectedRoute allowedRoles={['delivery', 'admin']}><DeliveryDashboard /></ProtectedRoute>} />

            {/* Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>

        {/* Global AI Chatbot floating button - ONLY visible for authenticated users */}
        {isAuthenticated && !isAuthLanding && <AIChatbot />}
      </main>

      {/* Footer is only displayed when navbar is active */}
      {!isAuthLanding && (
        <footer className="bg-[#121c15] text-[#e3e7e5] pt-16 pb-8 border-t border-emerald-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-emerald-900/60">
              {/* Column 1: Brand Info */}
              <div className="space-y-4">
                <div className="text-2xl font-black tracking-tight text-white">
                  Farm<span className="text-primary">Connect</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {t('heroSubtitle')}
                </p>
                <div className="space-y-2.5 pt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-primary" />
                    <span>1800-3000-2434 (Toll Free)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-primary" />
                    <span>support@farmconnect.com</span>
                  </div>
                </div>
              </div>

              {/* Column 2: Categories with Tamil localization */}
              <div>
                <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider text-primary">
                  {t('products')}
                </h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to="/products?category=Vegetables" className="hover:text-primary transition-colors">{t('Vegetables')}</Link></li>
                  <li><Link to="/products?category=Fruits" className="hover:text-primary transition-colors">{t('Fruits')}</Link></li>
                  <li><Link to="/products?category=Seeds" className="hover:text-primary transition-colors">{t('Seeds')}</Link></li>
                  <li><Link to="/products?category=Fertilizers" className="hover:text-primary transition-colors">{t('Fertilizers')}</Link></li>
                </ul>
              </div>

              {/* Column 3: Quick Links */}
              <div>
                <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider text-primary">
                  Portals & Hubs
                </h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><Link to="/login/customer" className="hover:text-primary transition-colors">{t('customerPortal')}</Link></li>
                  <li><Link to="/dashboard" className="hover:text-primary transition-colors">{t('farmerDashboard')}</Link></li>
                  <li><Link to="/delivery" className="hover:text-primary transition-colors">{t('deliveryPortal')}</Link></li>
                  <li><Link to="/orders" className="hover:text-primary transition-colors">{t('myOrders')}</Link></li>
                </ul>
              </div>

              {/* Column 4: 100% Direct Market Guarantee */}
              <div className="bg-[#18271e] p-6 rounded-2xl border border-emerald-900/50 space-y-4">
                <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                  <ShieldCheck size={16} className="text-primary" /> {t('freshProduceGuaranteed')}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {t('transparentPricing')}. Zero middlemen commission ensures fresh produce at fair and transparent prices.
                </p>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 text-xs font-black bg-primary text-white hover:bg-[#0c4a29] transition-colors px-4 py-2.5 rounded-xl shadow-lg shadow-primary/10 w-full justify-center"
                >
                  {t('allProducts')}
                </Link>
              </div>
            </div>

            <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
              <div>
                © 2026 FarmConnect. All rights reserved. | Production Ready v5.2.0
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:underline">Privacy Policy</a>
                <a href="#" className="hover:underline">Terms &amp; Conditions</a>
                <a href="#" className="hover:underline">Sitemap</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
