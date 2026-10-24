import { useCart } from '../context/CartContext';
import { 
  Minus, Plus, Trash2, ArrowRight, ShoppingBag, CheckCircle, 
  Loader2, Printer, X, FileText, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placeOrder, fetchOrderInvoice } from '../api';
import { useState } from 'react';

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

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
      const orderPayload = {
        items: cart.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          farmer: item.farmer
        })),
        totalAmount: total,
        shippingAddress: {
          address: 'Farm Road, Green Sector',
          city: 'Erode, Tamil Nadu',
          phone: user?.result?.phone || user?.phone || '9876543210'
        },
        paymentMethod: 'COD',
        paymentStatus: 'Pending'
      };

      const { data } = await placeOrder(orderPayload);
      setPlacedOrder(data);
      setSuccess(true);
      clearCart();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenInvoice = async () => {
    if (!placedOrder?._id) return;
    setLoadingInvoice(true);
    setShowInvoiceModal(true);
    try {
      const { data } = await fetchOrderInvoice(placedOrder._id);
      setInvoiceData(data);
    } catch {
      setInvoiceData({
        invoiceNumber: `INV-${placedOrder._id.slice(-8).toUpperCase()}`,
        invoiceDate: placedOrder.createdAt || new Date(),
        platform: {
          name: "FarmConnect Direct Market",
          address: "Tamil Nadu, India",
          gstin: "33AAAAA0000A1Z5 (Direct Farmer Sale)",
          email: "support@farmconnect.com",
          phone: "1800-3000-2434"
        },
        customer: {
          name: placedOrder.customer?.name || "Customer",
          phone: placedOrder.customer?.phone || placedOrder.shippingAddress?.phone || "N/A",
          shippingAddress: placedOrder.shippingAddress
        },
        items: placedOrder.items || [],
        summary: {
          subtotal: placedOrder.totalAmount - (placedOrder.totalAmount > 500 ? 0 : 50),
          deliveryFee: placedOrder.totalAmount > 500 ? 0 : 50,
          totalAmount: placedOrder.totalAmount,
          paymentMethod: placedOrder.paymentMethod,
          paymentStatus: placedOrder.paymentStatus,
          paymentId: 'COD'
        }
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-6 px-4 py-12">
        <div className="bg-emerald-100 p-6 rounded-full text-emerald-600 mb-2 animate-bounce">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-dark text-center">Order Placed Successfully!</h2>
        <p className="text-gray-500 max-w-md text-center text-sm sm:text-base">
          Your order <span className="font-bold text-dark">#{placedOrder?._id?.slice(-8).toUpperCase()}</span> has been confirmed. Fresh farm produce is being harvested for direct delivery.
        </p>

        <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm w-full max-w-md space-y-3 text-sm">
          <div className="flex justify-between text-gray-500">
            <span>Payment Method:</span>
            <span className="font-bold text-dark">Cash on Delivery (COD)</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payment Status:</span>
            <span className="font-bold text-amber-600">Pending — Pay on Delivery</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
            <span className="font-bold text-dark">Total Amount:</span>
            <span className="font-black text-primary text-xl">₹{placedOrder?.totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
          <button
            onClick={handleOpenInvoice}
            className="flex items-center gap-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText size={18} /> Download Invoice (PDF / Print)
          </button>
          <Link to="/products" className="btn-primary py-3.5 px-8">
            Continue Shopping
          </Link>
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              {loadingInvoice ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={36} />
                  <span className="font-bold text-gray-400">Generating Invoice...</span>
                </div>
              ) : (
                <div className="space-y-6" id="printable-invoice">
                  <div className="flex justify-between items-start border-b border-gray-100 pb-6">
                    <div>
                      <h3 className="text-2xl font-black text-primary">FarmConnect</h3>
                      <p className="text-xs text-gray-400">Direct Farmer Market Platform</p>
                      <p className="text-xs text-gray-500 mt-1">GSTIN: 33AAAAA0000A1Z5</p>
                      <p className="text-xs text-gray-500">Tamil Nadu, India</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-black uppercase tracking-wider mb-1">
                        Tax Invoice
                      </span>
                      <p className="font-mono text-sm font-bold text-dark">{invoiceData?.invoiceNumber}</p>
                      <p className="text-xs text-gray-400">{invoiceData?.invoiceDate ? new Date(invoiceData.invoiceDate).toLocaleDateString('en-IN') : 'Recent'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Billed To</span>
                      <p className="font-bold text-dark text-sm">{invoiceData?.customer?.name}</p>
                      <p className="text-gray-500">{invoiceData?.customer?.phone}</p>
                      <p className="text-gray-500">{invoiceData?.customer?.shippingAddress?.address}, {invoiceData?.customer?.shippingAddress?.city}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment</span>
                      <p className="font-bold text-amber-600 text-sm">Cash on Delivery</p>
                      <p className="text-gray-400 text-[10px]">Pay on Delivery</p>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-100">
                        <tr>
                          <th className="p-3">Item</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Price</th>
                          <th className="p-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {invoiceData?.items?.map((it, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-medium text-dark">{it.name || it.product?.name}</td>
                            <td className="p-3 text-center text-gray-500">{it.quantity}</td>
                            <td className="p-3 text-right text-gray-500">₹{it.unitPrice || it.price}</td>
                            <td className="p-3 text-right font-bold text-dark">₹{(it.unitPrice || it.price) * it.quantity}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="space-y-2 border-t border-gray-100 pt-4 text-xs">
                    <div className="flex justify-between text-gray-500">
                      <span>Subtotal:</span>
                      <span className="font-bold text-dark">₹{invoiceData?.summary?.subtotal}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Delivery Fee:</span>
                      <span className="font-bold text-dark">{invoiceData?.summary?.deliveryFee === 0 ? 'FREE' : `₹${invoiceData?.summary?.deliveryFee}`}</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-dark border-t border-gray-100 pt-2">
                      <span>Total (Pay on Delivery):</span>
                      <span className="text-primary text-xl">₹{invoiceData?.summary?.totalAmount}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#0c4a29] transition-colors cursor-pointer"
                    >
                      <Printer size={16} /> Print / Save as PDF
                    </button>
                    <button
                      onClick={() => setShowInvoiceModal(false)}
                      className="px-5 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-xs hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
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
                  <div className="text-xs text-gray-400 mt-1">Direct Farmer Price</div>
                </div>
              </div>
            </div>

            {/* Payment Method: COD only */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-dark text-sm">Payment Method</h3>
              <div className="flex items-center gap-3 bg-amber-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-amber-700 font-black text-lg shrink-0">₹</div>
                <div>
                  <p className="font-bold text-amber-800 text-sm">Cash on Delivery</p>
                  <p className="text-xs text-amber-600">Pay when your order arrives at your door</p>
                </div>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg bg-primary text-white hover:bg-[#0c4a29] shadow-primary/30 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>Place Order (Pay on Delivery) <ArrowRight size={20} /></>
              )}
            </button>
            
            <div className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-primary" /> 100% Direct Trade • Secure Checkout
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
