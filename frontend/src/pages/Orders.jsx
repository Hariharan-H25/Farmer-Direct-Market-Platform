import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle2, Truck, ShoppingBag, FileText, ArrowRight, X, Radio, Phone, MapPin } from 'lucide-react';
import { fetchBuyerOrders, fetchOrderInvoice, fetchOrderTracking } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import DeliveryMap from '../components/DeliveryMap';
import socket from '../socket';

const Orders = () => {
  const { t } = useLanguage();
  const { userResult, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  // Live Tracking Modal State
  const [trackingOrder, setTrackingOrder] = useState(null);
  const [loadingTracking, setLoadingTracking] = useState(false);

  const userId = userResult?._id || userResult?.id;

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const loadOrders = async () => {
      try {
        setLoading(true);
        setFetchError('');
        const { data } = await fetchBuyerOrders();
        setOrders(data || []);
      } catch (err) {
        console.error('Failed to fetch buyer orders:', err);
        setFetchError(err.response?.data?.message || 'Unable to load orders at this time.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();

    // Real-time socket room and updates
    if (userId) {
      socket.emit('join_user_room', userId);
    }

    const handleLocationUpdate = (payload) => {
      setTrackingOrder(prev => {
        if (prev && prev.orderId === payload.orderId) {
          return {
            ...prev,
            liveLocation: payload.liveLocation,
            estimatedArrivalMinutes: payload.estimatedArrivalMinutes,
            deliveryStatus: payload.deliveryStatus || prev.deliveryStatus
          };
        }
        return prev;
      });
    };

    const handleStatusUpdate = (updatedOrder) => {
      setOrders(prev => prev.map(o => (o._id === updatedOrder._id ? updatedOrder : o)));
      setTrackingOrder(prev => {
        if (prev && prev.orderId === updatedOrder._id) {
          return {
            ...prev,
            deliveryStatus: updatedOrder.deliveryStatus,
            statusHistory: updatedOrder.statusHistory
          };
        }
        return prev;
      });
    };

    socket.on('delivery_location_update', handleLocationUpdate);
    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('delivery_location_update', handleLocationUpdate);
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [userId, isAuthenticated, navigate]);

  // Resilient real-time polling for live tracking (guarantees real-time updates on Vercel serverless)
  useEffect(() => {
    if (!trackingOrder?.orderId) return;

    // Stop polling once delivery completes or cancels
    if (trackingOrder.deliveryStatus === 'Delivered' || trackingOrder.deliveryStatus === 'Cancelled') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const { data } = await fetchOrderTracking(trackingOrder.orderId);
        if (data) {
          setTrackingOrder(prev => (prev ? { ...prev, ...data } : data));
        }
      } catch (err) {
        console.debug('Tracking poll error:', err?.message);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [trackingOrder?.orderId, trackingOrder?.deliveryStatus]);

  const handleTrackOrder = async (orderId) => {
    setLoadingTracking(true);
    try {
      const { data } = await fetchOrderTracking(orderId);
      setTrackingOrder(data);
    } catch (err) {
      // Fallback tracking info from local order
      const ord = orders.find(o => (o._id || o.id) === orderId);
      if (ord) {
        setTrackingOrder({
          orderId: ord._id || ord.id,
          deliveryStatus: ord.deliveryStatus || 'Pending',
          totalAmount: ord.totalAmount,
          shippingAddress: ord.shippingAddress,
          pickupLocation: ord.pickupLocation,
          liveLocation: ord.liveLocation,
          estimatedArrivalMinutes: ord.estimatedArrivalMinutes,
          deliveryPerson: ord.deliveryPerson,
          statusHistory: ord.statusHistory || []
        });
      } else {
        alert(err.response?.data?.message || "Failed to load tracking data.");
      }
    } finally {
      setLoadingTracking(false);
    }
  };

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

  if (!isAuthenticated) {
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

      {fetchError && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-2xl mb-6 text-sm flex items-center justify-between">
          <span>{fetchError}</span>
          <button 
            onClick={() => window.location.reload()} 
            className="text-xs font-bold underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

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
                  <div className="flex items-center gap-2.5">
                    {getStatusBadge(order.deliveryStatus || order.orderStatus || order.status)}
                    <button
                      onClick={() => handleTrackOrder(orderId)}
                      className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <Truck size={13} /> Live Tracking &amp; ETA
                    </button>
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

      {/* Live Map & Order Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 max-h-[92vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <Truck size={20} />
                </span>
                <div>
                  <h3 className="font-black text-base text-gray-900 dark:text-white">
                    Live Delivery Tracking
                  </h3>
                  <p className="text-xs text-gray-500 font-mono">
                    Order #{trackingOrder.orderId?.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            {/* Status Progress Stepper */}
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1">
                <span>Placed</span>
                <span>Harvesting</span>
                <span>Picked Up</span>
                <span className={trackingOrder.deliveryStatus === 'Delivered' ? 'text-green-600' : ''}>Delivered</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-primary h-full transition-all duration-500"
                  style={{
                    width: 
                      trackingOrder.deliveryStatus === 'Delivered' ? '100%' :
                      trackingOrder.deliveryStatus === 'Out for Delivery' ? '80%' :
                      trackingOrder.deliveryStatus === 'Picked Up' ? '60%' :
                      trackingOrder.deliveryStatus === 'Pickup Pending' ? '45%' :
                      trackingOrder.deliveryStatus === 'Farmer Preparing' ? '30%' : '15%'
                  }}
                />
              </div>
            </div>

            {/* Interactive Map */}
            <DeliveryMap
              pickupLocation={trackingOrder.pickupLocation}
              deliveryLocation={trackingOrder.shippingAddress?.location}
              liveLocation={trackingOrder.liveLocation}
              deliveryStatus={trackingOrder.deliveryStatus}
              estimatedArrivalMinutes={trackingOrder.estimatedArrivalMinutes}
            />

            {/* Driver & Delivery Information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Assigned Delivery Partner</span>
                {trackingOrder.deliveryPerson ? (
                  <div className="space-y-0.5">
                    <p className="font-bold text-gray-900 dark:text-white">{trackingOrder.deliveryPerson.name}</p>
                    <p className="text-gray-500 flex items-center gap-1">
                      <Phone size={11} /> {trackingOrder.deliveryPerson.phone || 'Protected Contact'}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-400 italic">Farmer preparing produce. Assigning driver shortly...</p>
                )}
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Dropoff Address</span>
                <p className="font-bold text-gray-900 dark:text-white truncate">
                  {trackingOrder.shippingAddress?.recipientName} ({trackingOrder.shippingAddress?.mobileNumber})
                </p>
                <p className="text-gray-500 truncate text-[11px]">
                  {trackingOrder.shippingAddress?.houseFlat} {trackingOrder.shippingAddress?.streetArea}, {trackingOrder.shippingAddress?.city}
                </p>
              </div>
            </div>

            <button
              onClick={() => setTrackingOrder(null)}
              className="w-full bg-primary hover:bg-[#0c4a29] text-white py-2.5 rounded-xl font-bold text-xs transition-colors"
            >
              Close Live Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
