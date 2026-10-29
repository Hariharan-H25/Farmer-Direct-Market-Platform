import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Truck, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { signIn } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await signIn(formData);
      const serverRole = data?.result?.role || 'customer';

      // Strict role verification: only delivery partners or admins may log in here
      if (serverRole !== 'delivery' && serverRole !== 'admin') {
        setError(`Access denied. This account has role "${serverRole}". Delivery personnel credentials are required.`);
        setLoading(false);
        return;
      }

      login(data);
      navigate('/delivery', { replace: true });
    } catch (err) {
      if (err.response?.data?.unverified) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach server. Please check your network connection.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Access denied. Account is unauthorized or suspended.');
      } else {
        setError(err.response?.data?.message || 'Invalid delivery credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-sky-950/20 via-gray-50 to-gray-50 dark:from-sky-950/40 dark:via-gray-950 dark:to-gray-950 transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 border border-sky-200 dark:border-sky-900/60 rounded-3xl p-6 sm:p-10 shadow-xl space-y-7">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-2xl bg-sky-100 dark:bg-sky-950 border border-sky-300 dark:border-sky-800 flex items-center justify-center mx-auto text-sky-700 dark:text-sky-300 mb-2 shadow-inner">
            <Truck size={34} />
          </div>
          <span className="text-[11px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 inline-block border border-sky-300 dark:border-sky-800">
            🛵 {t('deliveryPortal')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
            {t('deliveryLogin')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {t('deliveryDesc')}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs border border-red-200 dark:border-red-500/30">
            <AlertCircle size={18} className="shrink-0" />
            <span className="font-semibold leading-relaxed">{error}</span>
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
                placeholder="delivery@farmconnect.com"
                className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors"
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
                className="w-full bg-gray-50 dark:bg-gray-800/60 border border-gray-300 dark:border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-sky-600 focus:ring-1 focus:ring-sky-600 transition-colors"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 px-4 rounded-xl text-sm flex justify-center items-center gap-2 shadow-md hover:shadow-sky-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {t('deliveryLogin')} &rarr; Logistics Hub
              </>
            )}
          </button>
        </form>

        {/* Onboarding Notice */}
        <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/30 rounded-2xl border border-sky-100 dark:border-sky-900/40 text-[11px] text-sky-900 dark:text-sky-300 space-y-1">
          <p className="font-bold flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-sky-600" /> Authorized Onboarding Required
          </p>
          <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('deliveryOnboardingNotice')} For onboarding inquiries, call toll-free support at <strong className="text-gray-700 dark:text-gray-200">1800-3000-2434</strong>.
          </p>
        </div>

        {/* Switch Portals */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-4 text-[11px] text-gray-500 dark:text-gray-400">
          <Link to="/user-login" className="hover:text-sky-600 dark:hover:text-sky-400 font-medium">
            🛒 {t('customerLogin')}
          </Link>
          <span>&bull;</span>
          <Link to="/farmer-login" className="hover:text-sky-600 dark:hover:text-sky-400 font-medium">
            🌾 {t('farmerLogin')}
          </Link>
          <span>&bull;</span>
          <Link to="/login" className="hover:text-sky-600 dark:hover:text-sky-400 font-medium">
            🧭 All Portals
          </Link>
        </div>

      </div>
    </div>
  );
};

export default DeliveryLogin;
