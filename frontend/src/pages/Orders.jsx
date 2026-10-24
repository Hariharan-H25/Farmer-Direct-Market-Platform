import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, ShoppingBag, FileText, ArrowRight, X } from 'lucide-react';
import { fetchBuyerOrders, fetchOrderInvoice } from '../api';
import { useLanguage } from '../context/LanguageContext';

const Orders = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const profile = localStorage.getItem('profile');
  const user = profile ? JSON.parse(profile) : null;

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        const { data } = await fetchBuyerOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch buyer orders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [user, navigate]);

  const handleViewInvoice = async (orderId) => {
    try {
      const { data } = await fetchOrderInvoice(orderId);
      setSelectedInvoice(data);
    } catch (err) {
      console.error('Failed to load invoice:', err);
      // Fallback invoice data from local order
      const ord = orders.find(o => (o._id || o.id) === orderId);
      if (ord) {
        setSelectedInvoice({
          invoiceNumber: `INV-${(ord._id || ord.id).slice(-8).toUpperCase()}`,
          invoiceDate: ord.createdAt || new Date(),
          platform: {
            name: "FarmConnect Direct Market",
            address: "Tamil Nadu, India",
            gstin: "33AAAAA0000A1Z5 (Direct Farmer Sale)",
            email: "support@farmconnect.com",
            phone: "1800-3000-2434"
          },
          customer: {
            name: user?.result?.name || user?.name || "Customer",
            phone: ord.shippingAddress?.phone || "N/A",
            shippingAddress: ord.shippingAddress
          },
          items: ord.items || [],
          summary: {
            subtotal: ord.totalAmount,
            deliveryFee: 0,
            totalAmount: ord.totalAmount,
            paymentMethod: ord.paymentMethod || 'COD',
            paymentStatus: ord.paymentStatus || 'Pending'
          }
        });
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
            <Truck size={12} /> Shipped
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
            <Clock size={12} /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            <Clock size={12} /> Pending
          </span>
        );
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
            <Package className="text-primary dark:text-emerald-400" /> {t('myOrders')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and view invoices for your direct farm produce orders.
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary dark:text-emerald-400 hover:underline"
        >
          Continue Shopping <ArrowRight size={15} />
        </Link>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 animate-pulse h-32" />
          ))}
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => {
            const orderId = order._id || order.id;
            const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            }) : 'Recent';

            return (
              <div 
                key={orderId}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700/80 shadow-sm overflow-hidden"
              >
                {/* Order Top Bar */}
                <div className="px-5 py-3.5 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">
                      #{orderId.slice(-8).toUpperCase()}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-500 dark:text-gray-400">{dateStr}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.orderStatus || order.status)}
                    <button
                      onClick={() => handleViewInvoice(orderId)}
                      className="inline-flex items-center gap-1 text-primary dark:text-emerald-400 font-bold hover:underline"
                    >
                      <FileText size={13} /> Invoice
                    </button>
                  </div>
                </div>

                {/* Items */}
                <div className="p-5 space-y-3">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center text-primary text-base shrink-0">
                          🌱
                        </div>
                        <div>
                          <p className="font-bold text-gray-800 dark:text-gray-200">
                            {item.product?.name || item.name || 'Organic Farm Produce'}
                          </p>
                          <p className="text-xs text-gray-400">
                            Qty: {item.quantity} · ₹{item.price} each
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700/40 flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">
                    Payment: <strong className="text-gray-700 dark:text-gray-300">{order.paymentMethod || 'COD'}</strong>
                  </span>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400 mr-2">Total Amount:</span>
                    <strong className="text-base text-gray-900 dark:text-white font-black">₹{order.totalAmount}</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-200 dark:border-gray-700 max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-primary dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShoppingBag size={28} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">No Orders Placed Yet</h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Browse our organic marketplace and buy directly from verified Indian farmers.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 bg-primary hover:bg-[#0c4a29] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors"
          >
            Explore Fresh Produce
          </Link>
        </div>
      )}

      {/* Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-700 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div>
                <h3 className="font-black text-lg text-primary dark:text-emerald-400">FarmConnect Tax Invoice</h3>
                <p className="text-xs text-gray-400">{selectedInvoice.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              <p><strong>Platform:</strong> {selectedInvoice.platform?.name}</p>
              <p><strong>Customer:</strong> {selectedInvoice.customer?.name} ({selectedInvoice.customer?.phone})</p>
              <p><strong>Payment:</strong> {selectedInvoice.summary?.paymentMethod} ({selectedInvoice.summary?.paymentStatus})</p>
            </div>

            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden text-xs">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 font-bold text-gray-700 dark:text-gray-300">
                  <tr>
                    <th className="p-2 text-left">Item</th>
                    <th className="p-2 text-center">Qty</th>
                    <th className="p-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {selectedInvoice.items?.map((it, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{it.product?.name || it.name || 'Produce Item'}</td>
                      <td className="p-2 text-center">{it.quantity}</td>
                      <td className="p-2 text-right font-bold">₹{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center text-sm font-black text-gray-900 dark:text-white pt-2 border-t border-gray-100 dark:border-gray-800">
              <span>Grand Total</span>
              <span className="text-primary dark:text-emerald-400 text-lg">₹{selectedInvoice.summary?.totalAmount}</span>
            </div>

            <button
              onClick={() => setSelectedInvoice(null)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2.5 rounded-xl font-bold text-xs hover:bg-gray-200 transition-colors"
            >
              Close Invoice
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
