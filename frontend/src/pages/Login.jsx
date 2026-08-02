import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../api';
import { Mail, Lock, LogIn, Loader2, AlertCircle } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await signIn(formData);
      localStorage.setItem('profile', JSON.stringify(data));
      navigate('/');
      window.location.reload();
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Database connection error. Please ensure MongoDB is running.');
      } else if (err.response?.status === 403) {
        setError(err.response.data?.message || 'Access denied. Your email address is not authorized to log in.');
      } else {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center px-4 py-20 bg-gray-50/50">
      <div className="max-w-md w-full card p-12 space-y-10">
        <div className="text-center space-y-3">
          <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto text-primary mb-4">
            <LogIn size={40} />
          </div>
          <h2 className="text-4xl font-black text-dark">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Continue your direct farm journey</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center space-x-3 text-sm border border-red-200 animate-in fade-in zoom-in duration-300">
            <AlertCircle size={20} className="shrink-0 text-red-500" />
            <span className="font-bold leading-relaxed">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="input-field pl-12"
                required
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-4 text-gray-400" size={20} />
              <input
                type="password"
                placeholder="Password"
                className="input-field pl-12"
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 rounded-2xl text-lg flex justify-center items-center gap-3 shadow-2xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={24} /> : 'Access Account'}
          </button>
        </form>

        <div className="text-center pt-4">
          <p className="text-gray-500 font-medium">
            New to FarmConnect?{' '}
            <Link to="/register" className="text-primary font-black hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
