import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Sprout, ShieldCheck, Truck, Users, ArrowRight, Lock, 
  Mail, Phone, User, Home, Loader2, AlertCircle, CheckCircle2,
  Sparkles, Award, MapPin, ShoppingBag
} from 'lucide-react';
import { signIn, signUp } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const AuthLanding = () => {
  const { lang, switchLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const [role, setRole] = useState('customer'); // 'customer' or 'farmer'

  // Login Form State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register Form State
  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    farmName: '',
    district: '',
    state: 'Tamil Nadu'
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const { login } = useAuth();

  const handleRoleRedirect = (userRole) => {
    switch (userRole) {
      case 'farmer':
        navigate('/dashboard');
        break;
      case 'delivery':
        navigate('/delivery');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'buyer':
      case 'customer':
      default:
        navigate('/products');
        break;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const { data } = await signIn(loginForm);
      login(data);
      const userRole = data?.result?.role || 'customer';
      handleRoleRedirect(userRole);
    } catch (err) {
      if (err.response?.data?.unverified) {
        navigate(`/verify-otp?email=${encodeURIComponent(loginForm.email.trim())}`);
      } else if (err.code === 'ERR_NETWORK') {
        setLoginError('Cannot reach backend server. Please check your network connection.');
      } else {
        setLoginError(err.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegisterLoading(true);
    setRegisterError('');

    if (registerForm.password !== registerForm.confirmPassword) {
      setRegisterError("Passwords do not match.");
      setRegisterLoading(false);
      return;
    }

    try {
      const payload = {
        ...registerForm,
        role: role === 'farmer' ? 'farmer' : 'buyer'
      };

      const { data } = await signUp(payload);

      // If in automated test mode and returns token directly
      if (data?.token && data?.result) {
        login(data);
        handleRoleRedirect(data.result.role);
        return;
      }

      // Navigate to OTP verification page without exposing OTP
      navigate(`/verify-otp?email=${encodeURIComponent(registerForm.email.trim())}`, {
        state: {
          email: registerForm.email.trim(),
          role: data?.role || role
        }
      });
    } catch (err) {
      setRegisterError(err.response?.data?.message || 'Registration failed. Please check your details.');
    } finally {
      setRegisterLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white selection:bg-emerald-500/30 selection:text-emerald-300">
      
      {/* 1. Header Bar with Logo, Language & Theme */}
      <header className="border-b border-white/10 bg-black/30 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-600/30">
              <Sprout className="text-white" size={22} />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Farm<span className="text-emerald-400">Connect</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Switch */}
            <button
              onClick={() => switchLanguage(lang === 'en' ? 'ta' : 'en')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-bold transition-colors border border-white/10"
              title="Toggle Language"
            >
              <span>{lang === 'en' ? 'தமிழ்' : 'English'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs transition-colors border border-white/10"
              title="Toggle Theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Hero & Auth Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Brand Hero & Value Propositions */}
          <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} /> 100% Direct Farmer Marketplace
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.15]">
              Fresh Farm Produce, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300">
                Direct to Your Table.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-2xl font-medium leading-relaxed">
              Empowering hardworking Indian agriculturists with zero middleman deductions. 
              Log in or register to shop certified organic harvests, manage farmer listings, or track live GPS deliveries.
            </p>

            {/* Feature Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-left">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <ShieldCheck className="text-emerald-400 mb-2" size={24} />
                <h4 className="font-bold text-sm text-white">Verified Growers</h4>
                <p className="text-xs text-gray-400 mt-1">100% verified farmers with authentic produce guarantees.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Truck className="text-emerald-400 mb-2" size={24} />
                <h4 className="font-bold text-sm text-white">Live GPS Tracking</h4>
                <p className="text-xs text-gray-400 mt-1">Map-based pickup &amp; dropoff routes with accurate minute-by-minute ETA.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <Award className="text-emerald-400 mb-2" size={24} />
                <h4 className="font-bold text-sm text-white">Fair Farm Pricing</h4>
                <p className="text-xs text-gray-400 mt-1">Zero commission cuts. Maximum earnings straight to farmers.</p>
              </div>
            </div>

            {/* Security Notice */}
            <div className="flex items-center justify-center lg:justify-start gap-4 text-xs text-gray-400 pt-2">
              <span className="flex items-center gap-1"><Lock size={14} className="text-emerald-400" /> Secure OTP Activation</span>
              <span>&bull;</span>
              <span className="flex items-center gap-1"><MapPin size={14} className="text-emerald-400" /> Pan-India Farm Delivery</span>
            </div>
          </div>

          {/* Right Column: Clean Login & Register Card */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-slate-900/90 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
              
              {/* 3 Separate Login Portals Selector Cards */}
              <div className="mb-5 space-y-2 text-left">
                <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block">
                  Choose Login Portal
                </span>
                <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950/70 rounded-2xl border border-white/10">
                  <Link
                    to="/user-login"
                    className="p-2 sm:p-2.5 rounded-xl text-center transition-all bg-emerald-600/25 border border-emerald-500/40 hover:bg-emerald-600/35 text-white flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <ShoppingBag size={18} className="text-emerald-400" />
                    <span className="text-[11px] font-bold">User</span>
                  </Link>

                  <Link
                    to="/farmer-login"
                    className="p-2 sm:p-2.5 rounded-xl text-center transition-all bg-white/5 border border-white/10 hover:border-green-500/40 hover:bg-green-950/40 text-gray-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Sprout size={18} className="text-green-400" />
                    <span className="text-[11px] font-bold">Farmer</span>
                  </Link>

                  <Link
                    to="/delivery-login"
                    className="p-2 sm:p-2.5 rounded-xl text-center transition-all bg-white/5 border border-white/10 hover:border-sky-500/40 hover:bg-sky-950/40 text-gray-300 hover:text-white flex flex-col items-center gap-1 cursor-pointer"
                  >
                    <Truck size={18} className="text-sky-400" />
                    <span className="text-[11px] font-bold">Delivery Boy</span>
                  </Link>
                </div>
              </div>

              {/* Tabs: Sign In vs Register */}
              <div className="flex p-1 bg-white/10 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); setRegisterError(''); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    authMode === 'login'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setLoginError(''); setRegisterError(''); }}
                  className={`flex-1 py-2.5 rounded-xl font-bold text-sm transition-all ${
                    authMode === 'register'
                      ? 'bg-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* ─── TAB 1: LOGIN FORM ───────────────────────────── */}
              {authMode === 'login' && (
                <form onSubmit={handleLoginSubmit} className="space-y-4 animate-in fade-in duration-300">
                  <div className="text-left mb-3">
                    <h2 className="text-xl font-black text-white">User Login Portal</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Sign in to your customer or producer account.</p>
                  </div>

                  {loginError && (
                    <div className="bg-red-500/15 border border-red-500/30 p-3.5 rounded-xl text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-red-400" />
                      <span className="font-semibold">{loginError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3 text-gray-400" size={17} />
                        <input
                          type="email"
                          placeholder="you@farmconnect.com"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                          required
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-300 mb-1">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3 text-gray-400" size={17} />
                        <input
                          type="password"
                          placeholder="••••••••"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
                          required
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        Sign In to FarmConnect <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <div className="pt-3 border-t border-white/10 text-center">
                    <p className="text-xs text-gray-400">
                      Need an account?{' '}
                      <button
                        type="button"
                        onClick={() => setAuthMode('register')}
                        className="text-emerald-400 font-bold hover:underline"
                      >
                        Register for free
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* ─── TAB 2: REGISTER FORM ────────────────────────── */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-in fade-in duration-300 text-left">
                  <div>
                    <h2 className="text-xl font-black text-white">Create an Account</h2>
                    <p className="text-xs text-gray-400 mt-0.5">We will send a 6-digit OTP to verify your email.</p>
                  </div>

                  {/* Role Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-300 mb-1.5">I am registering as a:</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          role === 'customer'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-slate-950/50 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <User size={14} /> Customer / Buyer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('farmer')}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          role === 'farmer'
                            ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                            : 'bg-slate-950/50 border-white/10 text-gray-400 hover:text-white'
                        }`}
                      >
                        <Sprout size={14} /> Farmer / Seller
                      </button>
                    </div>
                  </div>

                  {registerError && (
                    <div className="bg-red-500/15 border border-red-500/30 p-3 rounded-xl text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle size={16} className="shrink-0 text-red-400" />
                      <span className="font-semibold leading-relaxed">{registerError}</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">First Name</label>
                        <input
                          type="text"
                          placeholder="Ravi"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          required
                          value={registerForm.firstName}
                          onChange={(e) => setRegisterForm({ ...registerForm, firstName: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">Last Name</label>
                        <input
                          type="text"
                          placeholder="Kumar"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          required
                          value={registerForm.lastName}
                          onChange={(e) => setRegisterForm({ ...registerForm, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Email Address</label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        required
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-300 mb-1">Phone Number (10 digits)</label>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                        required
                        value={registerForm.phone}
                        onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                      />
                    </div>

                    {role === 'farmer' && (
                      <div className="space-y-2 bg-emerald-950/30 p-3 rounded-xl border border-emerald-900/50">
                        <div>
                          <label className="block text-[11px] font-bold text-emerald-300 mb-1">Farm / Enterprise Name</label>
                          <input
                            type="text"
                            placeholder="Green Valley Farms"
                            className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                            required
                            value={registerForm.farmName}
                            onChange={(e) => setRegisterForm({ ...registerForm, farmName: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[11px] font-bold text-emerald-300 mb-1">District</label>
                            <input
                              type="text"
                              placeholder="Erode"
                              className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                              required
                              value={registerForm.district}
                              onChange={(e) => setRegisterForm({ ...registerForm, district: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] font-bold text-emerald-300 mb-1">State</label>
                            <input
                              type="text"
                              placeholder="Tamil Nadu"
                              className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                              required
                              value={registerForm.state}
                              onChange={(e) => setRegisterForm({ ...registerForm, state: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">Password</label>
                        <input
                          type="password"
                          placeholder="Min 6 chars"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          required
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-300 mb-1">Confirm</label>
                        <input
                          type="password"
                          placeholder="Re-type password"
                          className="w-full bg-slate-950/70 border border-white/15 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none"
                          required
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm mt-3 cursor-pointer disabled:opacity-50"
                  >
                    {registerLoading ? <Loader2 className="animate-spin" size={18} /> : (
                      <>
                        Verify Email with OTP <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </main>

    </div>
  );
};

export default AuthLanding;
