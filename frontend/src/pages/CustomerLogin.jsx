import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ShoppingBag, Loader2, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { signIn } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const CustomerLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const { data } = await signIn(formData);
      const serverRole = data?.result?.role || 'customer';

      login(data);

      // Server-side role verification
      if (serverRole === 'farmer') {
        setNotice("Authenticated as verified Farmer. Redirecting to Farmer Dashboard...");
        setTimeout(() => navigate('/dashboard', { replace: true }), 900);
      } else if (serverRole === 'delivery') {
        setNotice("Authenticated as Delivery Partner. Redirecting to Delivery Hub...");
        setTimeout(() => navigate('/delivery', { replace: true }), 900);
      } else if (serverRole === 'admin') {
        setNotice("Authenticated as Administrator. Redirecting to Admin Panel...");
        setTimeout(() => navigate('/admin', { replace: true }), 900);
      } else {
        // Customer / Buyer
        navigate('/products', { replace: true });
      }
    } catch (err) {
      if (err.response?.data?.unverified) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Please check your network connection.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Access denied. Account is unauthorized or suspended.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-xl space-y-7">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-primary dark:text-emerald-400 mb-2">
            <ShoppingBag size={32} />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 inline-block">
            {t('customerPortal')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('customerLogin')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('customerDesc')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs border border-red-200 dark:border-red-500/30">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {notice && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 p-3.5 rounded-xl flex items-center gap-2.5 text-xs border border-emerald-200 dark:border-emerald-500/30">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-500" />
            <span className="font-bold">{notice}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {t('emailAddress')}
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                type="email"
                placeholder="customer@example.com"
                className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3 text-gray-400" size={18} />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-[#0c4a29] text-white font-bold py-3 px-4 rounded-xl text-sm flex justify-center items-center gap-2 shadow-md hover:shadow-primary/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {t('accessAccount')} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Links to Register & Switch Portals */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>
            {t('newToFarmConnect')}{' '}
            <Link to="/register?role=customer" className="text-primary dark:text-emerald-400 font-bold hover:underline">
              {t('createAccount')}
            </Link>
          </p>

          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <Link to="/login/farmer" className="hover:text-primary dark:hover:text-emerald-400 font-medium">
              🌾 {t('farmerLogin')}
            </Link>
            <span>&bull;</span>
            <Link to="/login/delivery" className="hover:text-primary dark:hover:text-emerald-400 font-medium">
              🛵 {t('deliveryLogin')}
            </Link>
            <span>&bull;</span>
            <Link to="/login" className="hover:text-primary dark:hover:text-emerald-400 font-medium">
              🧭 All Portals
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CustomerLogin;
