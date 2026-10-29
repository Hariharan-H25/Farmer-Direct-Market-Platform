import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { 
  ShoppingBag, Sprout, Truck, Mail, Lock, 
  LogIn, Loader2, AlertCircle, ArrowRight, CheckCircle2 
} from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const handleRoleRedirect = (role) => {
    switch (role) {
      case 'farmer':
        navigate('/dashboard', { replace: true });
        break;
      case 'delivery':
        navigate('/delivery', { replace: true });
        break;
      case 'admin':
        navigate('/admin', { replace: true });
        break;
      case 'buyer':
      case 'customer':
      default:
        navigate('/products', { replace: true });
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const { data } = await signIn(formData);
      login(data);
      const userRole = data?.result?.role || 'customer';
      setNotice(`Authenticated as ${userRole}. Redirecting to your portal...`);
      setTimeout(() => handleRoleRedirect(userRole), 600);
    } catch (err) {
      if (err.response?.data?.unverified) {
        navigate(`/verify-otp?email=${encodeURIComponent(formData.email.trim())}`);
      } else if (err.code === 'ERR_NETWORK') {
        setError('Cannot reach backend server. Please verify network connectivity.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Access denied. Account is unauthorized or suspended.');
      } else {
        setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const portalCards = [
    {
      title: t('customerPortal'),
      loginText: t('customerLogin'),
      desc: t('customerDesc'),
      route: '/user-login',
      icon: ShoppingBag,
      color: 'emerald',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80',
      textColor: 'text-emerald-700 dark:text-emerald-300'
    },
    {
      title: t('farmerPortal'),
      loginText: t('farmerLogin'),
      desc: t('farmerDesc'),
      route: '/farmer-login',
      icon: Sprout,
      color: 'green',
      bgLight: 'bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800/80',
      textColor: 'text-green-700 dark:text-green-300'
    },
    {
      title: t('deliveryPortal'),
      loginText: t('deliveryLogin'),
      desc: t('deliveryDesc'),
      route: '/delivery-login',
      icon: Truck,
      color: 'sky',
      bgLight: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800/80',
      textColor: 'text-sky-700 dark:text-sky-300'
    }
  ];

  return (
    <div className="min-h-[90vh] py-12 px-4 sm:px-6 lg:px-8 bg-gray-50/70 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-black tracking-widest text-primary dark:text-emerald-400 bg-primary/10 dark:bg-emerald-950 px-3 py-1 rounded-full">
            FarmConnect Authentication
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white">
            {t('choosePortal')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
            {t('portalSubtitle')}
          </p>
        </div>

        {/* 3 Dedicated Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {portalCards.map((portal) => {
            const IconComponent = portal.icon;
            return (
              <div 
                key={portal.route}
                className={`p-6 rounded-3xl border ${portal.bgLight} flex flex-col justify-between hover:shadow-lg transition-all duration-150`}
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-2xl bg-white dark:bg-gray-900 flex items-center justify-center ${portal.textColor} shadow-sm border border-gray-100 dark:border-gray-800`}>
                    <IconComponent size={24} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white">
                      {portal.title}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {portal.desc}
                    </p>
                  </div>
                </div>

                <Link
                  to={portal.route}
                  className={`mt-6 inline-flex items-center justify-between w-full px-4 py-2.5 rounded-xl font-bold text-xs bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-emerald-500 hover:text-primary transition-all shadow-xs`}
                >
                  <span>{portal.loginText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            );
          })}
        </div>

        {/* Quick Direct Sign-In Card */}
        <div className="max-w-md mx-auto card p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-black text-gray-900 dark:text-white">
              {t('welcomeBack')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Quick access for all authorized FarmConnect accounts
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 p-3.5 rounded-xl flex items-center gap-2.5 text-xs border border-red-200 dark:border-red-500/30">
              <AlertCircle size={18} className="shrink-0" />
              <span className="font-semibold leading-relaxed">{error}</span>
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
                  placeholder="name@example.com"
                  className="input-field pl-10"
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
                  className="input-field pl-10"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl text-sm flex justify-center items-center gap-2 shadow-md shadow-primary/20"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (
                <>
                  <LogIn size={16} /> {t('accessAccount')}
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400">
            <p>
              {t('newToFarmConnect')}{' '}
              <Link to="/register" className="text-primary dark:text-emerald-400 font-bold hover:underline">
                {t('createAccount')}
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
