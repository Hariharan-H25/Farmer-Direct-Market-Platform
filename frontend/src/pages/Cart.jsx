import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, CheckCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placeOrder } from '../api';
import { useState } from 'react';

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('GPay');
  const navigate = useNavigate();

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  const deliveryFee = subtotal > 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  const handleCheckout = async () => {
    const profile = localStorage.getItem('profile');
    if (!profile) {
      alert('Please log in to place an order.');
      navigate('/login');
      return;
    }

    const user = JSON.parse(profile);

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          farmer: item.farmer
        })),
        totalAmount: total,
        shippingAddress: {
          address: '123 Main Street',
          city: 'Local City',
          phone: user?.result?.phone || user?.phone || '9999999999'
        },
        // Order model enum: 'COD' | 'Online' — map GPay → Online
        paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Online'
      };

      await placeOrder(orderData);
      setSuccess(true);
      clearCart();
    } catch (error) {
      console.error('Checkout failed', error?.response?.data || error);
      const msg = error?.response?.data?.message || 'Failed to place order. Please ensure you are logged in and the backend is running.';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 px-4">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-500 mb-4 animate-bounce">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-4xl font-black text-dark text-center">Order Placed Successfully!</h2>
        <p className="text-gray-500 max-w-md text-center text-lg">
          Your fresh farm produce is being processed and will be delivered soon.
        </p>
        <Link to="/products" className="btn-primary mt-8 py-4 px-8 text-lg">Continue Shopping</Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-6 px-4">
        <div className="bg-primary/10 p-6 rounded-full text-primary">
          <ShoppingBag size={64} />
        </div>
        <h2 className="text-3xl font-black text-dark">Your Cart is Empty</h2>
        <p className="text-gray-500 max-w-md text-center">Looks like you haven't added any fresh farm produce to your cart yet.</p>
        <Link to="/products" className="btn-primary mt-4">Browse Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-black text-dark mb-10">Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-dark">Items ({totalItems})</h2>
              <button onClick={clearCart} className="text-red-500 text-sm font-bold hover:text-red-600 transition-colors">Clear Cart</button>
            </div>
            
            <div className="space-y-6">
              {cart.map((item) => (
                <div key={item._id || item.id} className="flex gap-4 sm:gap-6 items-center">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden shrink-0 bg-gray-50">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <h3 className="text-lg font-bold text-dark leading-tight">{item.name}</h3>
                    <div className="text-sm text-gray-500 font-medium">₹{item.price} / {item.unit}</div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
                        <button 
                          onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item._id || item.id)}
                          className="p-2 hover:bg-gray-200 transition-colors text-gray-600"
                        >
                          <Minus size={16} strokeWidth={3} />
                        </button>
                        <span className="w-10 text-center font-bold text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => addToCart(item, 1)}
                          className="p-2 hover:bg-gray-200 transition-colors text-gray-600 disabled:opacity-30"
                          disabled={item.quantity >= 50}
                        >
                          <Plus size={16} strokeWidth={3} />
                        </button>
                      </div>
                      
                      <div className="text-xl font-black text-dark">
                        ₹{item.price * item.quantity}
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item._id || item.id)}
                    className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-28 space-y-6">
            <h2 className="text-xl font-bold text-dark">Order Summary</h2>
            
            <div className="space-y-4 text-sm font-medium text-gray-500">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-dark">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="text-dark">{deliveryFee === 0 ? <span className="text-primary font-bold">FREE</span> : `₹${deliveryFee}`}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="text-xs text-primary/80 bg-primary/5 p-3 rounded-lg">
                  Add ₹{500 - subtotal} more to your order for free delivery!
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between items-end">
                <span className="font-bold text-dark">Total</span>
                <div className="text-right">
                  <span className="text-3xl font-black text-primary">₹{total}</span>
                  <div className="text-xs text-gray-400 mt-1">Including GST</div>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-100 space-y-4 pb-2">
              <h3 className="font-bold text-dark text-sm">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('GPay')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'GPay' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/f/f2/Google_Pay_Logo.svg" alt="GPay" className="h-5" />
                </button>
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold transition-all ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  Cash (COD)
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className={`w-full py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${
                paymentMethod === 'GPay' 
                ? 'bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-blue-500/30' 
                : 'bg-primary text-white hover:bg-primary-dark shadow-primary/30'
              }`}
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>{paymentMethod === 'GPay' ? 'Pay Securely with GPay' : 'Place Order'} <ArrowRight size={20} /></>
              )}
            </button>
            
            <div className="text-center text-xs text-gray-400 font-medium">
              Secure Checkout • Fast Delivery • Farm Fresh Guarantee
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
