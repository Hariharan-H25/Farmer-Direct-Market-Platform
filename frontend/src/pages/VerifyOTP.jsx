import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Mail, ArrowRight, Loader2, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { verifyOTP, resendOTP } from '../api';

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get('email') || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(prev => prev - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { data } = await verifyOTP({ email: email.trim(), otp: otp.trim() });
      if (data?.token && data?.result) {
        localStorage.setItem('profile', JSON.stringify(data));
        setSuccessMsg(data.message || "Account activated successfully!");
        
        // Role-based redirect
        setTimeout(() => {
          const userRole = data.result.role;
          if (userRole === 'farmer') navigate('/dashboard');
          else if (userRole === 'delivery') navigate('/delivery');
          else if (userRole === 'admin') navigate('/admin');
          else navigate('/products');
          window.location.reload();
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed. Please check the code and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    setError('');
    setSuccessMsg('');
    try {
      const { data } = await resendOTP({ email: email.trim() });
      setSuccessMsg(data.message || "A fresh verification code has been dispatched to your email.");
      setCooldown(60);
      setCanResend(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code. Please try again later.");
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-slate-950 text-white">
      <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
        
        {/* Header Icon */}
        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
          <ShieldCheck size={36} />
        </div>

        <div>
          <h2 className="text-2xl font-black text-white">Verify Your Account</h2>
          <p className="text-xs text-gray-400 mt-1">
            We sent a 6-digit activation code to: <br />
            <span className="font-bold text-emerald-400">{email || 'your email address'}</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-red-300 text-xs flex items-center gap-2 text-left">
            <AlertCircle size={18} className="shrink-0 text-red-400" />
            <span className="font-medium leading-relaxed">{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-3.5 rounded-xl text-emerald-300 text-xs flex items-center gap-2 text-left">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
            <span className="font-bold leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-5">
          {!initialEmail && (
            <div className="text-left">
              <label className="block text-xs font-bold text-gray-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-gray-500" size={16} />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  className="w-full bg-slate-950 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
              Enter 6-Digit Code
            </label>
            <input
              type="text"
              maxLength={6}
              autoFocus
              placeholder="••••••"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-950 border border-white/15 focus:border-emerald-500 rounded-2xl py-3 px-4 text-center text-3xl font-mono font-black tracking-[10px] text-emerald-400 outline-none transition-all shadow-inner"
            />
            <p className="text-[11px] text-gray-500">Code expires in 10 minutes</p>
          </div>

          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-3.5 px-4 rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 cursor-pointer"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : (
              <>
                Confirm &amp; Activate Account <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
          <span>Didn't receive the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={!canResend}
            className={`font-bold flex items-center gap-1 ${
              canResend
                ? 'text-emerald-400 hover:underline cursor-pointer'
                : 'text-gray-600 cursor-not-allowed'
            }`}
          >
            <RefreshCw size={12} className={canResend ? '' : 'animate-spin'} />
            {canResend ? 'Resend Code' : `Resend in ${cooldown}s`}
          </button>
        </div>

        <div className="pt-2">
          <Link to="/" className="text-xs text-gray-500 hover:text-gray-300">
            &larr; Return to Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTP;
