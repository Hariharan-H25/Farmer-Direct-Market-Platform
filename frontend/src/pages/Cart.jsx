import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Minus, Plus, Trash2, ArrowRight, ShoppingBag, CheckCircle, 
  Loader2, Printer, X, FileText, ShieldCheck, MapPin, 
  Home, Briefcase, PlusCircle, Navigation, AlertCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  placeOrder, 
  fetchOrderInvoice, 
  fetchSavedAddresses, 
  addSavedAddress 
} from '../api';

const Cart = () => {
  const { cart, addToCart, removeFromCart, clearCart, totalItems } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Swiggy/Zomato Style Delivery Address State
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [locatingGps, setLocatingGps] = useState(false);
  const [addressError, setAddressError] = useState('');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState('COD'); // 'COD' | 'Online'

  // New Address Form
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    mobileNumber: '',
    houseFlat: '',
    streetArea: '',
    city: '',
    district: '',
    state: 'Tamil Nadu',
    pincode: '',
    landmark: '',
    deliveryInstructions: '',
    addressType: 'Home',
    saveForFuture: true,
    location: null
  });

  const navigate = useNavigate();
  const profile = localStorage.getItem('profile');
  const user = profile ? JSON.parse(profile) : null;

  // Load saved addresses on mount
  useEffect(() => {
    if (!user) return;

    // Set default recipient details from user profile
    setNewAddress(prev => ({
      ...prev,
      recipientName: user.result?.name || user.name || '',
      mobileNumber: user.result?.phone || user.phone || ''
    }));

    const loadAddresses = async () => {
      try {
        const { data } = await fetchSavedAddresses();
        setSavedAddresses(data || []);
        if (data && data.length > 0) {
          const defaultAddr = data.find(a => a.isDefault) || data[0];
          setSelectedAddressId(defaultAddr._id);
        } else {
          setShowAddAddressForm(true);
        }
      } catch (err) {
        console.error("Failed to fetch saved addresses:", err);
        setShowAddAddressForm(true);
      }
    };

    loadAddresses();
  }, []);

  const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  // Explicit Delivery Pricing Rule: Free above ₹500, else ₹50
  const deliveryFee = subtotal >= 500 ? 0 : 50;
  const total = subtotal + deliveryFee;

  // Use Current Location via Geolocation + Reverse Geocoding
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLocatingGps(true);
    setAddressError('');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setNewAddress(prev => ({
          ...prev,
          location: { lat: latitude, lng: longitude }
        }));

        try {
          // OpenStreetMap Reverse Geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            setNewAddress(prev => ({
              ...prev,
              streetArea: addr.suburb || addr.neighbourhood || addr.road || prev.streetArea,
              city: addr.city || addr.town || addr.village || prev.city,
              district: addr.state_district || addr.county || prev.district,
              state: addr.state || prev.state,
              pincode: addr.postcode ? addr.postcode.replace(/\D/g, '').slice(0, 6) : prev.pincode
            }));
          }
        } catch (geoErr) {
          console.warn("Reverse geocode fetch skipped or failed:", geoErr);
        } finally {
          setLocatingGps(false);
        }
      },
      (err) => {
        setLocatingGps(false);
        setAddressError(`GPS Location access denied or unavailable: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const getSelectedAddressObject = () => {
    if (!showAddAddressForm && selectedAddressId) {
      return savedAddresses.find(a => a._id === selectedAddressId);
    }
    return newAddress;
  };

  const handleCheckout = async () => {
    if (!profile) {
      alert('Please log in to place an order.');
      navigate('/login');
      return;
    }

    setAddressError('');
    const targetAddress = getSelectedAddressObject();

    // Validate Address
    if (!targetAddress.recipientName || !targetAddress.mobileNumber || !targetAddress.houseFlat || !targetAddress.streetArea || !targetAddress.city || !targetAddress.pincode) {
      setAddressError("Please provide all required delivery address fields (Name, Phone, Flat/House, Area, City, PIN code).");
      setShowAddAddressForm(true);
      return;
    }

    // Validate 6-digit PIN code
    if (!/^[1-9][0-9]{5}$/.test(targetAddress.pincode.toString().trim())) {
      setAddressError("Please enter a valid 6-digit Indian PIN code.");
      return;
    }

    setLoading(true);

    try {
      // Save address to user profile if requested
      if (showAddAddressForm && targetAddress.saveForFuture) {
        try {
          await addSavedAddress(targetAddress);
        } catch {
          // ignore save error, continue with checkout
        }
      }

      const orderPayload = {
        items: cart.map(item => ({
          product: item._id || item.id,
          quantity: item.quantity,
          price: item.price,
          farmer: item.farmer
        })),
        totalAmount: total,
        shippingAddress: {
          recipientName: targetAddress.recipientName.trim(),
          mobileNumber: targetAddress.mobileNumber.trim(),
          houseFlat: targetAddress.houseFlat.trim(),
          streetArea: targetAddress.streetArea.trim(),
          city: targetAddress.city.trim(),
          district: targetAddress.district?.trim() || 'Tamil Nadu',
          state: targetAddress.state?.trim() || 'Tamil Nadu',
          pincode: targetAddress.pincode.trim(),
          landmark: targetAddress.landmark?.trim() || '',
          deliveryInstructions: targetAddress.deliveryInstructions?.trim() || '',
          location: targetAddress.location || undefined,
          address: `${targetAddress.houseFlat}, ${targetAddress.streetArea}, ${targetAddress.city} - ${targetAddress.pincode}`,
          phone: targetAddress.mobileNumber.trim()
        },
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'Online' ? 'Completed' : 'Pending'
      };

      const { data } = await placeOrder(orderPayload);
      setPlacedOrder(data);
      setSuccess(true);
      clearCart();
    } catch (error) {
      setAddressError(error?.response?.data?.message || 'Failed to place order.');
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
          name: placedOrder.customer?.name || placedOrder.shippingAddress?.recipientName || "Customer",
          phone: placedOrder.shippingAddress?.mobileNumber || "N/A",
          shippingAddress: placedOrder.shippingAddress
        },
        items: placedOrder.items || [],
        summary: {
          subtotal: placedOrder.totalAmount - (placedOrder.totalAmount >= 500 ? 0 : 50),
          deliveryFee: placedOrder.totalAmount >= 500 ? 0 : 50,
          totalAmount: placedOrder.totalAmount,
          paymentMethod: placedOrder.paymentMethod,
          paymentStatus: placedOrder.paymentStatus,
          paymentId: placedOrder.paymentMethod === 'Online' ? 'Online UPI' : 'COD'
        }
      });
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center space-y-6 px-4 py-12">
        <div className="bg-emerald-100 dark:bg-emerald-950 p-6 rounded-full text-emerald-600 dark:text-emerald-400 mb-2 animate-bounce">
          <CheckCircle size={64} />
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white text-center">
          Order Placed Successfully!
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md text-center text-sm sm:text-base">
          Your order <span className="font-bold text-gray-900 dark:text-white">#{placedOrder?._id?.slice(-8).toUpperCase()}</span> has been confirmed. Fresh farm produce is being harvested for direct delivery.
        </p>

        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-6 rounded-2xl shadow-sm w-full max-w-md space-y-3 text-sm">
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Delivery Destination:</span>
            <span className="font-bold text-gray-800 dark:text-gray-200 text-right truncate max-w-[200px]">
              {placedOrder?.shippingAddress?.houseFlat} {placedOrder?.shippingAddress?.streetArea}, {placedOrder?.shippingAddress?.city}
            </span>
          </div>
          <div className="flex justify-between text-gray-500 dark:text-gray-400">
            <span>Payment Method:</span>
            <span className="font-bold text-gray-900 dark:text-white">{placedOrder?.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}</span>
          </div>
          <div className="flex justify-between border-t border-gray-100 dark:border-gray-700 pt-3 text-base">
            <span className="font-bold text-gray-900 dark:text-white">Total Amount:</span>
            <span className="font-black text-primary dark:text-emerald-400 text-xl">₹{placedOrder?.totalAmount}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center items-center pt-4">
          <Link
            to="/orders"
            className="flex items-center gap-2 bg-primary hover:bg-[#0c4a29] text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md"
          >
            Track Delivery Live &rarr;
          </Link>
          <button
            onClick={handleOpenInvoice}
            className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-6 py-3.5 rounded-xl font-bold transition-all shadow-sm cursor-pointer"
          >
            <FileText size={18} /> Tax Invoice
          </button>
        </div>

        {/* Invoice Modal */}
        {showInvoiceModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <h3 className="font-black text-lg text-primary dark:text-emerald-400">FarmConnect Tax Invoice</h3>
                  <p className="text-xs text-gray-400">{invoiceData?.invoiceNumber}</p>
                </div>
                <button onClick={() => setShowInvoiceModal(false)} className="p-1 text-gray-400 hover:text-gray-700">
                  <X size={20} />
                </button>
              </div>

              {invoiceData && (
                <div className="space-y-4 text-xs">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white">{invoiceData.platform?.name}</p>
                      <p className="text-gray-500">{invoiceData.platform?.address}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400">Date: {new Date(invoiceData.invoiceDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-1">
                    <p><strong>Deliver To:</strong> {invoiceData.customer?.name} ({invoiceData.customer?.phone})</p>
                    <p className="text-gray-500">{invoiceData.customer?.shippingAddress?.houseFlat} {invoiceData.customer?.shippingAddress?.streetArea}, {invoiceData.customer?.shippingAddress?.city} - {invoiceData.customer?.shippingAddress?.pincode}</p>
                  </div>

                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-center">Qty</th>
                        <th className="p-2 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {invoiceData.items?.map((it, i) => (
                        <tr key={i}>
                          <td className="p-2">{it.name || it.product?.name}</td>
                          <td className="p-2 text-center">{it.quantity}</td>
                          <td className="p-2 text-right font-bold">₹{it.price * it.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between font-black text-sm">
                    <span>Total</span>
                    <span className="text-primary dark:text-emerald-400">₹{invoiceData.summary?.totalAmount}</span>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button onClick={() => window.print()} className="btn-primary py-2 px-4 text-xs">
                      <Printer size={14} /> Print
                    </button>
                    <button onClick={() => setShowInvoiceModal(false)} className="px-4 py-2 border rounded-lg text-xs">
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
        <h2 className="text-3xl font-black text-gray-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-gray-500 max-w-md text-center">Looks like you haven't added any fresh farm produce to your cart yet.</p>
        <Link to="/products" className="btn-primary mt-4">Browse Marketplace</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">
        Checkout &amp; Delivery
      </h1>

      {addressError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs sm:text-sm flex items-center gap-2">
          <AlertCircle size={18} className="shrink-0" />
          <span className="font-semibold">{addressError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Delivery Address & Cart Items */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Zomato/Swiggy Delivery Address Selector Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-xl">
                  <MapPin size={20} />
                </span>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-gray-900 dark:text-white">
                    Delivery Address
                  </h2>
                  <p className="text-xs text-gray-400">Select where you'd like your farm fresh produce delivered</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                className="text-xs font-bold text-primary dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <PlusCircle size={14} /> {showAddAddressForm ? 'Choose Saved' : 'Add New'}
              </button>
            </div>

            {/* Saved Addresses Radio Grid */}
            {!showAddAddressForm && savedAddresses.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr._id}
                    onClick={() => setSelectedAddressId(addr._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      selectedAddressId === addr._id
                        ? 'border-primary ring-2 ring-primary/20 bg-emerald-50/20 dark:border-emerald-500 dark:bg-emerald-950/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider text-primary dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                        {addr.addressType === 'Work' ? <Briefcase size={10} /> : <Home size={10} />}
                        {addr.addressType || 'Home'}
                      </span>
                      {selectedAddressId === addr._id && (
                        <CheckCircle size={16} className="text-primary dark:text-emerald-400" />
                      )}
                    </div>

                    <h4 className="font-bold text-xs text-gray-900 dark:text-white truncate">
                      {addr.recipientName} ({addr.mobileNumber})
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                      {addr.houseFlat}, {addr.streetArea}, {addr.city} - {addr.pincode}
                    </p>
                    {addr.deliveryInstructions && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 italic">
                        Note: {addr.deliveryInstructions}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* "+ Add New Delivery Address" Form */}
            {showAddAddressForm && (
              <div className="space-y-4 pt-1 animate-in fade-in duration-200">
                {/* Geolocation Button */}
                <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/60 p-3 rounded-2xl border border-gray-200 dark:border-gray-700">
                  <div className="text-xs">
                    <span className="font-bold text-gray-800 dark:text-gray-200 block">Detect Exact Coordinates</span>
                    <span className="text-gray-400 text-[11px]">Enables pinpoint live delivery tracking</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locatingGps}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {locatingGps ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
                    {locatingGps ? 'Locating...' : 'Use Current Location'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Recipient Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.recipientName}
                      onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">10-Digit Mobile Number *</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="9876543210"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.mobileNumber}
                      onChange={(e) => setNewAddress({ ...newAddress, mobileNumber: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">House / Flat / Floor No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flat 402, Green Meadows"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.houseFlat}
                      onChange={(e) => setNewAddress({ ...newAddress, houseFlat: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Street / Area / Colony *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Perundurai Road"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.streetArea}
                      onChange={(e) => setNewAddress({ ...newAddress, streetArea: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Town / City *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Erode"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">6-Digit PIN Code *</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="638001"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none focus:border-primary"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">District &amp; State</label>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="District"
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        value={newAddress.district}
                        onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="State"
                        className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Landmark (Optional)</label>
                    <input
                      type="text"
                      placeholder="Near Temple / Opposite Bank"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                      value={newAddress.landmark}
                      onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-gray-500 dark:text-gray-400 font-bold mb-1">Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave at door, call when arriving"
                      className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white outline-none"
                      value={newAddress.deliveryInstructions}
                      onChange={(e) => setNewAddress({ ...newAddress, deliveryInstructions: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1 text-xs">
                  <input
                    type="checkbox"
                    id="saveForFuture"
                    checked={newAddress.saveForFuture}
                    onChange={(e) => setNewAddress({ ...newAddress, saveForFuture: e.target.checked })}
                    className="rounded text-primary focus:ring-primary"
                  />
                  <label htmlFor="saveForFuture" className="text-gray-600 dark:text-gray-400 font-medium">
                    Save this address to my profile for future 1-click orders
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* 2. Cart Items Review */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-4">
            <h3 className="font-bold text-base text-gray-900 dark:text-white">
              Selected Produce Items ({totalItems})
            </h3>
            
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {cart.map((item) => (
                <div key={item._id || item.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-12 h-12 rounded-xl object-cover bg-gray-50 shrink-0" 
                    />
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">{item.name}</h4>
                      <p className="text-[11px] text-gray-400">₹{item.price} / {item.unit}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 text-xs">
                      <button 
                        onClick={() => item.quantity > 1 ? addToCart(item, -1) : removeFromCart(item._id || item.id)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="px-2 font-bold">{item.quantity}</span>
                      <button 
                        onClick={() => addToCart(item, 1)}
                        className="px-2 py-1 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <span className="font-black text-sm text-gray-900 dark:text-white w-16 text-right">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing Summary & Checkout Button */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700/80 space-y-5">
            <h2 className="text-lg font-black text-gray-900 dark:text-white">Order Summary</h2>

            {/* Bill Details */}
            <div className="space-y-3 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">
              <div className="flex justify-between">
                <span>Item Subtotal</span>
                <span className="text-gray-900 dark:text-white font-bold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-bold text-gray-900 dark:text-white">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-600 dark:text-emerald-400">FREE</span>
                  ) : (
                    `₹${deliveryFee}`
                  )}
                </span>
              </div>
              {deliveryFee > 0 && (
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900">
                  Add ₹{500 - subtotal} more of farm goods to qualify for <strong>FREE delivery</strong>!
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <span className="font-bold text-gray-900 dark:text-white text-base">To Pay</span>
              <span className="text-2xl font-black text-primary dark:text-emerald-400">₹{total}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300">Payment Option</label>
              
              <div 
                onClick={() => setPaymentMethod('COD')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-primary bg-emerald-50/30 ring-1 ring-primary/20 dark:border-emerald-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center">
                    {paymentMethod === 'COD' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">Cash on Delivery (COD)</span>
                    <span className="text-gray-400 text-[11px]">Pay upon receiving fresh produce</span>
                  </div>
                </div>
                <span className="font-black text-emerald-600 text-xs">Standard</span>
              </div>

              <div 
                onClick={() => setPaymentMethod('Online')}
                className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between text-xs transition-all ${
                  paymentMethod === 'Online'
                    ? 'border-primary bg-emerald-50/30 ring-1 ring-primary/20 dark:border-emerald-500'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full border flex items-center justify-center">
                    {paymentMethod === 'Online' && <span className="w-2 h-2 rounded-full bg-primary" />}
                  </span>
                  <div>
                    <span className="font-bold text-gray-900 dark:text-white block">Online (UPI / Razorpay)</span>
                    <span className="text-gray-400 text-[11px]">GPay, PhonePe, Cards, NetBanking</span>
                  </div>
                </div>
                <span className="font-black text-primary text-xs">Fast</span>
              </div>
            </div>

            {/* Place Order CTA */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-primary hover:bg-[#0c4a29] text-white font-black py-4 rounded-2xl text-base shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={22} />
              ) : (
                <>
                  Place Order &bull; ₹{total} <ArrowRight size={18} />
                </>
              )}
            </button>

            <div className="text-center text-[11px] text-gray-400 flex items-center justify-center gap-1">
              <ShieldCheck size={14} className="text-primary dark:text-emerald-400" />
              100% Direct Farmer Trade &bull; Live GPS Delivery
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
