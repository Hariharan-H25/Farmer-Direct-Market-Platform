import { useCart } from '../context/CartContext';
import { 
  Minus, Plus, Trash2, ArrowRight, ShoppingBag, CheckCircle, 
  Loader2, Printer, Download, CreditCard, ShieldCheck, X, FileText,
  Smartphone, QrCode, Copy, ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { placeOrder, createRazorpayOrder, verifyRazorpayPayment, fetchOrderInvoice } from '../api';
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = '9842055757-1@naviaxis';
const UPI_NAME = 'FarmConnect';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Online'); // 'Online' | 'COD'
  const [placedOrder, setPlacedOrder] = useState(null);
  
  // UPI Payment Modal state
  const [showUPIModal, setShowUPIModal] = useState(false);
  const [pendingRzpOrder, setPendingRzpOrder] = useState(null);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');
  const [copied, setCopied] = useState(false);

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

    const baseOrderPayload = {
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
      paymentMethod: paymentMethod === 'COD' ? 'COD' : 'Online'
    };

    setLoading(true);

    // Online Payment Flow (Razorpay / UPI)
    if (paymentMethod === 'Online') {
      try {
        const { data: rzpOrder } = await createRazorpayOrder({
          amount: total,
          receipt: `rcpt_${Date.now()}`
        });

        const isLoaded = await loadRazorpayScript();
        if (isLoaded && window.Razorpay && rzpOrder.mode === 'live') {
          const options = {
            key: rzpOrder.key,
            amount: rzpOrder.amount,
            currency: 'INR',
            name: 'FarmConnect Marketplace',
            description: 'Direct Produce Payment',
            order_id: rzpOrder.id,
            handler: async (response) => {
              try {
                await verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                });
                baseOrderPayload.paymentStatus = 'Completed';
                baseOrderPayload.razorpayOrderId = response.razorpay_order_id;
                baseOrderPayload.razorpayPaymentId = response.razorpay_payment_id;
                baseOrderPayload.razorpaySignature = response.razorpay_signature;

                const { data } = await placeOrder(baseOrderPayload);
                setPlacedOrder(data);
                setSuccess(true);
                clearCart();
              } catch (err) {
                alert('Payment verification failed: ' + (err.response?.data?.message || err.message));
              } finally {
                setLoading(false);
              }
            },
            prefill: {
              name: user?.result?.name || user?.name || 'Customer',
              email: user?.result?.email || user?.email || '',
              contact: user?.result?.phone || user?.phone || '9876543210'
            },
            theme: { color: '#0F5A32' },
            modal: {
              ondismiss: () => setLoading(false)
            }
          };
          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
          return;
        } else {
          // Open UPI QR payment modal
          setPendingRzpOrder(rzpOrder);
          setShowUPIModal(true);
          setUtrNumber('');
          setUtrError('');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Razorpay live endpoint, opening UPI QR modal:', err.message);
        setPendingRzpOrder({ id: `order_upi_${Date.now()}`, amount: total * 100, mode: 'upi' });
        setShowUPIModal(true);
        setUtrNumber('');
        setUtrError('');
        setLoading(false);
        return;
      }
    }

    // Cash on Delivery Flow
    try {
      baseOrderPayload.paymentStatus = 'Pending';
      const { data } = await placeOrder(baseOrderPayload);
      setPlacedOrder(data);
      setSuccess(true);
      clearCart();
    } catch (error) {
      alert(error?.response?.data?.message || 'Failed to place order.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleConfirmUPIPayment = async () => {
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setUtrError('Please enter a valid UTR / Transaction Reference Number (min 6 characters).');
      return;
    }
    setUtrError('');
    const profile = JSON.parse(localStorage.getItem('profile'));
    setLoading(true);
    try {
      const upiPayId = `upi_${utrNumber.trim().replace(/\s+/g, '_')}`;
      const orderData = {
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
          phone: profile?.result?.phone || profile?.phone || '9876543210'
        },
        paymentMethod: 'Online',
        paymentStatus: 'Completed',
        razorpayOrderId: pendingRzpOrder?.id || `order_upi_${Date.now()}`,
        razorpayPaymentId: upiPayId,
        razorpaySignature: `upi_verified_${UPI_ID}`
      };

      await verifyRazorpayPayment({
        razorpay_order_id: orderData.razorpayOrderId,
        razorpay_payment_id: upiPayId,
        razorpay_signature: orderData.razorpaySignature
      });

      const { data } = await placeOrder(orderData);
      setPlacedOrder(data);
      setShowUPIModal(false);
      setSuccess(true);
      clearCart();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
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
    } catch (err) {
      // Fallback invoice data from placedOrder object
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
          paymentId: placedOrder.razorpayPaymentId || 'N/A'
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
            <span className="font-bold text-dark">{placedOrder?.paymentMethod === 'Online' ? 'UPI / Online' : 'Cash on Delivery (COD)'}</span>
          </div>
          <div className="flex justify-between text-gray-500">
            <span>Payment Status:</span>
            <span className={`font-bold ${placedOrder?.paymentStatus === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>
              {placedOrder?.paymentStatus || 'Completed'}
            </span>
          </div>
          {placedOrder?.razorpayPaymentId && (
            <div className="flex justify-between text-gray-500 text-xs">
              <span>Transaction Ref:</span>
              <span className="font-mono text-dark">{placedOrder.razorpayPaymentId}</span>
            </div>
          )}
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
            <FileText size={18} /> Download Tax Invoice (PDF / Print)
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
                      <p className="text-xs text-gray-400">{new Date(invoiceData?.invoiceDate || Date.now()).toLocaleDateString('en-IN')}</p>
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
                      <span className="font-bold text-gray-400 uppercase tracking-wider block mb-1">Payment Status</span>
                      <p className="font-bold text-emerald-600 text-sm">{invoiceData?.summary?.paymentStatus} ({invoiceData?.summary?.paymentMethod})</p>
                      {invoiceData?.summary?.paymentId && <p className="text-gray-400 font-mono text-[10px]">Ref: {invoiceData.summary.paymentId}</p>}
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
                      <span>Total Paid:</span>
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
            
            <div className="pt-4 border-t border-gray-100 space-y-4 pb-2">
              <h3 className="font-bold text-dark text-sm">Payment Method</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod('Online')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 font-bold transition-all cursor-pointer ${paymentMethod === 'Online' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <div className="flex items-center gap-1">
                    <QrCode size={16} />
                    <span className="text-xs">UPI / GPay / PhonePe</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium">Scan & Pay Instantly</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('COD')}
                  className={`flex flex-col items-center justify-center gap-1.5 py-3 rounded-xl border-2 font-bold transition-all cursor-pointer ${paymentMethod === 'COD' ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 text-gray-500 hover:border-gray-200'}`}
                >
                  <span className="text-xs">Cash on Delivery</span>
                  <span className="text-[10px] text-gray-400 font-medium">Pay on Delivery</span>
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-4 text-lg font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg bg-primary text-white hover:bg-[#0c4a29] shadow-primary/30 cursor-pointer"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : (
                <>{paymentMethod === 'Online' ? `Pay ₹${total} via UPI QR` : 'Place Cash Order'} <ArrowRight size={20} /></>
              )}
            </button>
            
            <div className="text-center text-xs text-gray-400 font-medium flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-primary" /> 100% Direct Trade • Concurrency Protected
            </div>
          </div>
        </div>
      </div>

      {/* Real UPI QR Payment Modal */}
      {showUPIModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative space-y-5 max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowUPIModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="text-center space-y-1">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-green-700 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-200">
                <QrCode size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900">Pay via UPI</h3>
              <p className="text-xs text-gray-400">Scan with any UPI app or use the UPI ID below</p>
            </div>

            {/* Amount Banner */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Amount Payable</p>
              <p className="text-4xl font-black text-emerald-700">₹{total}</p>
              <p className="text-[11px] text-gray-400 mt-1">Order ref: <span className="font-mono">{pendingRzpOrder?.id?.slice(-12) || 'UPI-ORDER'}</span></p>
            </div>

            {/* QR Code — programmatically generated, always scannable */}
            <div className="flex flex-col items-center gap-2">
              <div className="bg-white border-4 border-emerald-100 rounded-2xl p-4 shadow-inner">
                <QRCodeSVG
                  value={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('FarmConnect Order')}`}
                  size={192}
                  bgColor="#ffffff"
                  fgColor="#14532d"
                  level="H"
                  includeMargin={false}
                />
              </div>
              <p className="text-[11px] text-gray-400 font-medium">Scan with GPay · PhonePe · Paytm · Any UPI App</p>
            </div>

            {/* UPI ID copy row */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">UPI ID</p>
                <p className="font-mono font-bold text-gray-800 text-sm">{UPI_ID}</p>
              </div>
              <button
                onClick={handleCopyUPI}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  copied ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Copy size={13} />
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            {/* Open UPI App deep link */}
            <a
              href={`upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${total}&cu=INR&tn=${encodeURIComponent('FarmConnect Order ' + (pendingRzpOrder?.id || ''))}`}
              className="w-full py-3 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-200 cursor-pointer"
            >
              <ExternalLink size={16} /> Open UPI App (GPay / PhonePe / Paytm)
            </a>

            {/* UTR confirmation */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">
                After Payment — Enter UTR / Transaction ID
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={e => { setUtrNumber(e.target.value); setUtrError(''); }}
                placeholder="e.g. 426301234567 or T2610231234"
                className="w-full border-2 border-gray-100 focus:border-emerald-400 outline-none rounded-xl px-4 py-3 text-sm font-mono placeholder:text-gray-300 transition-colors"
              />
              {utrError && <p className="text-red-500 text-xs font-medium">{utrError}</p>}
              <p className="text-[11px] text-gray-400">Find this in your UPI app under payment history / receipt.</p>
            </div>

            {/* Confirm button */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handleConfirmUPIPayment}
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-200 cursor-pointer disabled:opacity-60"
              >
                {loading ? <Loader2 className="animate-spin" size={18} /> : (
                  <><CheckCircle size={18} /> I've Paid — Confirm Order</>
                )}
              </button>
              <button
                onClick={() => setShowUPIModal(false)}
                className="w-full py-3 border-2 border-gray-100 text-gray-500 hover:bg-gray-50 rounded-xl font-bold text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
