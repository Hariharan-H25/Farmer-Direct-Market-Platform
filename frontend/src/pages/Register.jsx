import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { signUp } from '../api';
import { User, Mail, Phone, Lock, Home, Loader2, AlertCircle, ChevronRight } from 'lucide-react';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'customer';
  
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '', 
    phone: '', role: initialRole, farmName: '', district: '', state: ''
  });
  const [produceImage, setProduceImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (produceImage) data.append('produceImage', produceImage);

    try {
      const { data: responseData } = await signUp(data);
      localStorage.setItem('profile', JSON.stringify(responseData));
      navigate('/');
      window.location.reload();
    } catch (err) {
      if (err.code === 'ERR_NETWORK') {
        setError('Database connection error. Please ensure MongoDB is running.');
      } else {
        setError(err.response?.data?.message || 'Registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 px-4 flex items-center justify-center bg-gray-50/50">
      <div className="max-w-4xl w-full card p-12 space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-5xl font-black text-dark">Join the Community</h2>
          <p className="text-gray-500 font-medium text-lg">Choose your journey and start direct trade today</p>
        </div>

        {/* Role Selection */}
        <div className="flex p-2 bg-gray-100 rounded-2xl max-w-sm mx-auto">
          <button
            onClick={() => setFormData({ ...formData, role: 'customer' })}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${formData.role === 'customer' ? 'bg-white shadow-xl text-primary scale-105' : 'text-gray-500 hover:text-dark'}`}
          >
            Customer
          </button>
          <button
            onClick={() => setFormData({ ...formData, role: 'farmer' })}
            className={`flex-1 py-3 rounded-xl font-bold transition-all text-sm ${formData.role === 'farmer' ? 'bg-white shadow-xl text-primary scale-105' : 'text-gray-500 hover:text-dark'}`}
          >
            Farmer
          </button>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-5 rounded-2xl flex items-center space-x-3 text-sm border border-red-100 animate-in slide-in-from-top duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-black text-lg text-dark flex items-center gap-2">
                <User size={18} className="text-primary" /> Basic Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name"
                  className="input-field"
                  required
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  className="input-field"
                  required
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </div>
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
                <Phone className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Phone Number"
                  className="input-field pl-12"
                  required
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-black text-lg text-dark flex items-center gap-2">
                <Lock size={18} className="text-primary" /> Security
              </h3>
              <input
                type="password"
                placeholder="Password"
                className="input-field"
                required
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-field"
                required
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              
              {formData.role === 'farmer' && (
                <div className="pt-4 space-y-4 animate-in fade-in duration-500">
                  <h3 className="font-black text-lg text-dark flex items-center gap-2">
                    <Home size={18} className="text-primary" /> Farm Details
                  </h3>
                  <input
                    type="text"
                    placeholder="Farm Name"
                    className="input-field"
                    required
                    onChange={(e) => setFormData({ ...formData, farmName: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="District"
                      className="input-field"
                      required
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      className="input-field"
                      required
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-sm font-bold text-gray-400 ml-1">Produce Sample Image</label>
                    <input
                      type="file"
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 transition-all border border-gray-100 p-2 rounded-xl"
                      required
                      onChange={(e) => setProduceImage(e.target.files[0])}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-5 rounded-[1.5rem] text-xl flex justify-center items-center gap-3 shadow-2xl shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={28} /> : (
              <>
                Create My Account <ChevronRight size={24} />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 font-medium text-lg">
          Already a member?{' '}
          <Link to="/login" className="text-primary font-black hover:underline">Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
