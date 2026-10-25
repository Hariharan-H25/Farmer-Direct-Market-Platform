import { useState, useEffect } from 'react';
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { verifyOTP, resendOTP } from '../api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();

  const queryEmail = searchParams.get('email') || '';
  const stateEmail = location.state?.email || '';
  const initialEmail = queryEmail || stateEmail;

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(''); // Strictly blank until entered by user
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const canResend = cooldown === 0;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const cleanOtp = otp.trim();
    if (!cleanOtp || cleanOtp.length < 6) {
      setError(t('otpLengthError') || "Please enter the complete 6-digit verification code.");
      return;
    }

    if (!email || !email.trim()) {
      setError(t('emailAddress') + " is required.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await verifyOTP({ email: email.trim(), otp: cleanOtp });
      if (data?.token && data?.result) {
        login(data);
        setSuccessMsg(data.message || "Account activated successfully!");
        
        // Immediate role-based routing
        setTimeout(() => {
          const userRole = data.result.role;
          if (userRole === 'farmer') navigate('/dashboard', { replace: true });
          else if (userRole === 'delivery') navigate('/delivery', { replace: true });
          else if (userRole === 'admin') navigate('/admin', { replace: true });
          else navigate('/products', { replace: true });
        }, 800);
      }
    } catch (err) {
      if (err.response?.status === 429) {
        setError(err.response.data?.message || "Maximum attempts exceeded. Please request a new verification code.");
      } else {
        setError(err.response?.data?.message || "Verification failed. Please check the code in your email and try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setError('');
    setSuccessMsg('');
    setResending(true);

    try {
      const { data } = await resendOTP({ email: email.trim() });
      setSuccessMsg(data.message || t('otpSentNotice'));
      setCooldown(60);
      setCanResend(false);
    } catch (err) {
      if (err.response?.status === 429 && err.response.data?.waitSeconds) {
        setCooldown(err.response.data.waitSeconds);
        setCanResend(false);
        setError(err.response.data.message);
      } else {
        setError(err.response?.data?.message || "Failed to resend verification code. Please try again later.");
      }
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-white transition-colors">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 text-center">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldCheck size={36} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-gray-900 dark:text-white">
            {t('verifyAccount')}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 leading-relaxed">
            {t('otpSentNotice')} <br />
            <span className="font-bold text-emerald-700 dark:text-emerald-400 block mt-1">
              {email || t('emailAddress')}
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-3.5 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={18} className="shrink-0 text-red-500" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 p-3.5 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {!initialEmail && (
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 mb-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-400" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
              {t('enterOtpCode')}
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              autoFocus
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-gray-50 dark:bg-slate-950 border border-gray-300 dark:border-white/15 focus:border-emerald-500 rounded-2xl py-3 px-4 text-center text-3xl font-mono font-black tracking-[10px] text-emerald-700 dark:text-emerald-400 outline-none transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {t('otpExpiresNotice')}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                {t('verifyAndActivate')} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{t('didNotReceiveCode')}</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend || resending}
            className={`font-bold flex items-center gap-1.5 ${
              canResend && !resending
                ? 'text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer'
                : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={12} className={resending ? 'animate-spin' : ''} />
            {canResend ? t('resendCode') : `${t('resendIn')} ${cooldown}${t('seconds')}`}
          </button>
        </div>

        <div className="pt-2">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            &larr; {t('returnToSignIn')}
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
