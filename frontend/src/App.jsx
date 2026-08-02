import { Routes, Route, Link } from 'react-router-dom';
import { Phone, Mail, ExternalLink, Globe } from 'lucide-react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ProductBrowse from './pages/ProductBrowse';
import ProductDetails from './pages/ProductDetails';
import AdminDashboard from './pages/AdminDashboard';
import FarmerDashboard from './pages/FarmerDashboard';
import Cart from './pages/Cart';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-poppins selection:bg-primary/30">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<ProductBrowse />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/dashboard" element={<FarmerDashboard />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </main>

      <footer className="bg-[#121c15] text-[#e3e7e5] pt-16 pb-8 border-t border-emerald-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 pb-12 border-b border-emerald-900/60">
            {/* Column 1: Brand Info */}
            <div className="space-y-4">
              <div className="text-2xl font-black tracking-tight text-white">
                Farm<span className="text-primary">Connect</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Directly linking hardworking Indian farmers with smart consumers for a healthier, transparent, and sustainable marketplace.
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

            {/* Column 2: Categories */}
            <div>
              <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider text-primary">Marketplace</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/products?category=Vegetables" className="hover:text-primary transition-colors">Fresh Vegetables</Link></li>
                <li><Link to="/products?category=Fruits" className="hover:text-primary transition-colors">Organic Fruits</Link></li>
                <li><Link to="/products?category=Seeds" className="hover:text-primary transition-colors">Hybrid Seeds</Link></li>
                <li><Link to="/products?category=Fertilizers" className="hover:text-primary transition-colors">Crop Nutrition</Link></li>
              </ul>
            </div>

            {/* Column 3: Quick Links */}
            <div>
              <h4 className="text-white font-bold text-base mb-5 uppercase tracking-wider text-primary">Useful Links</h4>
              <ul className="space-y-3 text-sm text-gray-400">
                <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                <li><Link to="/dashboard" className="hover:text-primary transition-colors">Farmer Dashboard</Link></li>
                <li><Link to="/register?role=farmer" className="hover:text-primary transition-colors">Sell with Us</Link></li>
                <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Support</Link></li>
              </ul>
            </div>

            {/* Column 4: Official Reference / Partner Link */}
            <div className="bg-[#18271e] p-6 rounded-2xl border border-emerald-900/50 space-y-4">
              <h4 className="text-white font-black text-sm uppercase tracking-widest flex items-center gap-2">
                <Globe size={16} className="text-primary" /> Inspiration Partner
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                Referencing top-tier agriculture portals like BigHaat to bring Indian farmers state-of-the-art agricultural technology and tools.
              </p>
              <a 
                href="https://www.bighaat.com/?srsltid=AfmBOopWo-rovUMRUg2t9SRaky0nNS4mjOm2VlE6SRKD7mF55WYzwa9o"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-black bg-primary text-white hover:bg-primary-dark transition-colors px-4 py-2.5 rounded-xl shadow-lg shadow-primary/10 w-full justify-center"
              >
                Visit BigHaat Official <ExternalLink size={12} />
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-medium">
            <div>
              © 2026 FarmConnect. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:underline">Privacy Policy</a>
              <a href="#" className="hover:underline">Terms & Conditions</a>
              <a href="#" className="hover:underline">Sitemap</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
