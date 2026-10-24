import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, Package, MapPin, Phone, CheckCircle, Navigation, 
  Clock, AlertCircle, Loader2, ArrowRight, Radio, ShieldCheck 
} from 'lucide-react';
import { 
  fetchDeliveryOrders, 
  acceptDeliveryOrder, 
  updateDeliveryStatus, 
  updateDeliveryLiveLocation 
} from '../api';
import DeliveryMap from '../components/DeliveryMap';

const DeliveryDashboard = () => {
  const navigate = useNavigate();
  const profile = localStorage.getItem('profile');
  const user = profile ? JSON.parse(profile) : null;
  const userRole = user?.result?.role || user?.role;

  const [assignedOrders, setAssignedOrders] = useState([]);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('assigned'); // 'assigned' | 'available'
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrderForMap, setSelectedOrderForMap] = useState(null);

  // Live GPS Tracking State
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastCoords, setBroadcastCoords] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (userRole !== 'delivery' && userRole !== 'admin') {
      alert("Access denied. Delivery partner credentials required.");
      navigate('/');
      return;
    }

    loadOrders();
  }, [user, userRole, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const { data } = await fetchDeliveryOrders();
      setAssignedOrders(data.assigned || []);
      setAvailableOrders(data.available || []);
      if (data.assigned?.length > 0 && !selectedOrderForMap) {
        setSelectedOrderForMap(data.assigned[0]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load delivery assignments.");
    } finally {
      setLoading(false);
    }
  };

  // Handle GPS Broadcast Toggle
  const toggleGpsBroadcast = (orderId) => {
    if (isBroadcasting) {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsBroadcasting(false);
      setBroadcastCoords(null);
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsBroadcasting(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        setBroadcastCoords({ lat: latitude, lng: longitude });

        try {
          await updateDeliveryLiveLocation(orderId, {
            lat: latitude,
            lng: longitude,
            speed: speed ? Math.round(speed * 3.6) : 0, // km/h
            heading: heading || 0
          });
        } catch (locErr) {
          console.error("Location broadcast error:", locErr);
        }
      },
      (err) => {
        console.error("GPS error:", err);
        alert(`Location permission error: ${err.message}`);
        setIsBroadcasting(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleAccept = async (orderId) => {
    try {
      setActionLoading(true);
      await acceptDeliveryOrder(orderId);
      await loadOrders();
      setActiveTab('assigned');
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept order.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusTransition = async (orderId, newStatus) => {
    try {
      setActionLoading(true);
      await updateDeliveryStatus(orderId, { status: newStatus });
      await loadOrders();
      if (newStatus === 'Delivered' && isBroadcasting) {
        toggleGpsBroadcast(orderId);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update delivery status.");
    } finally {
      setActionLoading(false);
    }
  };

  const openNavigation = (lat, lng, address) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    } else {
      window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`, '_blank');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Truck size={24} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Delivery Logistics Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Accept farmer pickups, navigate routes, and stream live GPS coordinates to buyers.
          </p>
        </div>

        {/* Live GPS Broadcast Indicator */}
        <div className="flex items-center gap-3">
          {isBroadcasting && (
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold animate-pulse">
              <Radio size={14} className="animate-spin" />
              <span>Broadcasting Live GPS: {broadcastCoords?.lat?.toFixed(4)}, {broadcastCoords?.lng?.toFixed(4)}</span>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 p-4 rounded-2xl text-red-700 dark:text-red-300 text-sm mb-6 flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 mb-6">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'assigned'
              ? 'border-primary text-primary dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          My Active Deliveries ({assignedOrders.length})
        </button>
        <button
          onClick={() => setActiveTab('available')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors cursor-pointer ${
            activeTab === 'available'
              ? 'border-primary text-primary dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          Available Pickups ({availableOrders.length})
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={36} />
          <p className="text-sm text-gray-500 font-medium">Loading delivery orders...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Order Cards List (Left Side) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* 1. Assigned Orders */}
            {activeTab === 'assigned' && assignedOrders.length === 0 && (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 text-center space-y-3">
                <Truck size={36} className="text-gray-400 mx-auto" />
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">No active deliveries assigned</h3>
                <p className="text-xs text-gray-500">Check the 'Available Pickups' tab to claim ready orders from local farms.</p>
              </div>
            )}

            {activeTab === 'assigned' && assignedOrders.map((order) => (
              <div 
                key={order._id}
                onClick={() => setSelectedOrderForMap(order)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white dark:bg-gray-900 ${
                  selectedOrderForMap?._id === order._id
                    ? 'border-primary ring-2 ring-primary/20 dark:border-emerald-500'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                  <div>
                    <span className="text-xs font-mono font-bold text-gray-400">Order #{order._id.slice(-6).toUpperCase()}</span>
                    <h4 className="font-black text-sm text-gray-900 dark:text-white mt-0.5">₹{order.totalAmount} &bull; {order.paymentMethod}</h4>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                    order.deliveryStatus === 'Delivered'
                      ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}>
                    {order.deliveryStatus}
                  </span>
                </div>

                {/* Pickup and Dropoff Address Details */}
                <div className="py-3 space-y-3 text-xs">
                  {/* Farm Pickup */}
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#0F5A32] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block">
                        Pickup: {order.pickupLocation?.farmName || order.items[0]?.farmer?.farmName || 'Farm'}
                      </span>
                      <p className="text-gray-500 text-[11px]">
                        {order.pickupLocation?.address || `${order.pickupLocation?.district || ''}, ${order.pickupLocation?.state || ''}`}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNavigation(order.pickupLocation?.lat, order.pickupLocation?.lng, order.pickupLocation?.address);
                        }}
                        className="text-[11px] font-bold text-primary dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <Navigation size={11} /> Navigate to Farm
                      </button>
                    </div>
                  </div>

                  {/* Customer Dropoff */}
                  <div className="flex items-start gap-2.5">
                    <MapPin size={16} className="text-[#ea580c] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-gray-700 dark:text-gray-300 block">
                        Dropoff: {order.shippingAddress?.recipientName || order.customer?.name} ({order.shippingAddress?.mobileNumber || order.customer?.phone})
                      </span>
                      <p className="text-gray-500 text-[11px]">
                        {order.shippingAddress?.houseFlat} {order.shippingAddress?.streetArea}, {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                      </p>
                      {order.shippingAddress?.deliveryInstructions && (
                        <p className="text-amber-600 dark:text-amber-400 text-[10px] italic mt-0.5">
                          Note: "{order.shippingAddress.deliveryInstructions}"
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          openNavigation(order.shippingAddress?.location?.lat, order.shippingAddress?.location?.lng, order.shippingAddress?.address);
                        }}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline inline-flex items-center gap-1 mt-1"
                      >
                        <Navigation size={11} /> Navigate to Customer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleGpsBroadcast(order._id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all ${
                      isBroadcasting
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    <Radio size={13} className={isBroadcasting ? 'animate-pulse' : ''} />
                    {isBroadcasting ? 'Stop GPS Broadcast' : 'Transmit Live GPS'}
                  </button>

                  {order.deliveryStatus === 'Pickup Pending' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusTransition(order._id, 'Picked Up');
                      }}
                      className="bg-primary hover:bg-[#0c4a29] text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Confirm Farm Pickup &rarr;
                    </button>
                  )}

                  {order.deliveryStatus === 'Picked Up' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusTransition(order._id, 'Out for Delivery');
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Start Route to Customer &rarr;
                    </button>
                  )}

                  {order.deliveryStatus === 'Out for Delivery' && (
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStatusTransition(order._id, 'Delivered');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      Confirm Order Delivered ✓
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* 2. Available Orders to Accept */}
            {activeTab === 'available' && availableOrders.length === 0 && (
              <div className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 text-center space-y-3">
                <CheckCircle size={36} className="text-emerald-500 mx-auto" />
                <h3 className="font-bold text-base text-gray-800 dark:text-gray-200">All pickups currently assigned</h3>
                <p className="text-xs text-gray-500">New farmer orders will appear here as soon as farmers prepare produce.</p>
              </div>
            )}

            {activeTab === 'available' && availableOrders.map((order) => (
              <div key={order._id} className="p-5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-gray-400">Order #{order._id.slice(-6).toUpperCase()}</span>
                  <span className="font-black text-sm text-primary dark:text-emerald-400">₹{order.totalAmount}</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-gray-800 dark:text-gray-200">
                    Pickup: {order.items[0]?.farmer?.farmName || 'Local Farm'} ({order.items[0]?.farmer?.location?.district || 'Tamil Nadu'})
                  </p>
                  <p className="text-gray-500">
                    Deliver To: {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAccept(order._id)}
                  className="w-full bg-primary hover:bg-[#0c4a29] text-white py-2.5 rounded-xl font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5"
                >
                  <CheckCircle size={14} /> Accept &amp; Assign to Me
                </button>
              </div>
            ))}

          </div>

          {/* Interactive Route Map (Right Side) */}
          <div className="lg:col-span-6 sticky top-20">
            {selectedOrderForMap ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm text-gray-800 dark:text-gray-200">
                    Route Map: #{selectedOrderForMap._id.slice(-6).toUpperCase()}
                  </h3>
                  <span className="text-xs text-gray-400">Live Navigation View</span>
                </div>

                <DeliveryMap
                  pickupLocation={selectedOrderForMap.pickupLocation}
                  deliveryLocation={selectedOrderForMap.shippingAddress?.location}
                  liveLocation={selectedOrderForMap.liveLocation || broadcastCoords}
                  deliveryStatus={selectedOrderForMap.deliveryStatus}
                  estimatedArrivalMinutes={selectedOrderForMap.estimatedArrivalMinutes}
                />
              </div>
            ) : (
              <div className="h-64 rounded-2xl border border-dashed border-gray-300 dark:border-gray-800 flex items-center justify-center text-gray-400 text-xs">
                Select an order to inspect route and map
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default DeliveryDashboard;
