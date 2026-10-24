import { useState, useEffect, useCallback } from 'react';
import { 
  Sprout, Plus, Minus, Trash2, ShoppingBag, CheckCircle, 
  Clock, User, Phone, MapPin, DollarSign, 
  Package, PlusCircle, Loader2, Download
} from 'lucide-react';
import { fetchProducts, createProduct, deleteProduct, updateProductStock, fetchOrders, downloadSalesReportCSV } from '../api';
import socket from '../socket';

const categoryPresets = {
  Vegetables: [
    { name: 'Red Tomatoes', url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=800' },
    { name: 'Orange Carrots', url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&q=80&w=800' },
    { name: 'Fresh Spinach', url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&q=80&w=800' },
  ],
  Fruits: [
    { name: 'Alphonso Mangoes', url: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?auto=format&fit=crop&q=80&w=800' },
    { name: 'Red Strawberries', url: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&q=80&w=800' },
    { name: 'Nagpur Oranges', url: 'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&q=80&w=800' },
  ],
  Spices: [
    { name: 'Turmeric Powder', url: 'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?auto=format&fit=crop&q=80&w=800' },
    { name: 'Black Pepper', url: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800' },
    { name: 'Cinnamon Sticks', url: 'https://images.unsplash.com/photo-1559196307-e81880e6fc85?auto=format&fit=crop&q=80&w=800' },
  ],
  Grains: [
    { name: 'Basmati Rice', url: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&q=80&w=800' },
    { name: 'Whole Wheat', url: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Organic Quinoa', url: 'https://images.unsplash.com/photo-1586201375761-83865001e8ac?auto=format&fit=crop&q=80&w=800' },
  ],
  Dairy: [
    { name: 'Cow Milk', url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&q=80&w=800' },
    { name: 'Homemade Ghee', url: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&q=80&w=800' },
    { name: 'Fresh Paneer', url: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc0?auto=format&fit=crop&q=80&w=800' },
  ]
};

const FarmerDashboard = () => {
  const userProfile = JSON.parse(localStorage.getItem('profile'));
  const farmer = userProfile?.result;
  const farmerId = farmer?._id;

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('inventory');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Vegetables',
    price: '',
    unit: 'kg',
    quantity: '',
    description: '',
    image: categoryPresets.Vegetables[0].url
  });
  const [selectedPresetUrl, setSelectedPresetUrl] = useState(categoryPresets.Vegetables[0].url);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [productsRes, ordersRes] = await Promise.all([
        fetchProducts({ farmer: farmerId }),
        fetchOrders().catch(() => ({ data: [] }))
      ]);

      setProducts(productsRes.data || []);
      
      const allOrders = ordersRes.data || [];
      const farmerFilteredOrders = allOrders.filter(order => 
        order.items.some(item => {
          const itemFarmerId = item.farmer?._id || item.farmer;
          return itemFarmerId === farmerId;
        })
      );
      setOrders(farmerFilteredOrders);
    } catch (err) {
      console.error("Failed to load farmer dashboard statistics", err);
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  const [realtimeToast, setRealtimeToast] = useState(null);

  useEffect(() => {
    if (!farmerId) return;
    let ignore = false;
    (async () => {
      try {
        const [productsRes, ordersRes] = await Promise.all([
          fetchProducts({ farmer: farmerId }),
          fetchOrders().catch(() => ({ data: [] }))
        ]);
        if (!ignore) {
          setProducts(productsRes.data || []);
          const allOrders = ordersRes.data || [];
          const farmerFilteredOrders = allOrders.filter(order => 
            order.items.some(item => {
              const itemFarmerId = item.farmer?._id || item.farmer;
              return itemFarmerId === farmerId;
            })
          );
          setOrders(farmerFilteredOrders);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Failed to load farmer dashboard statistics", err);
          setLoading(false);
        }
      }
    })();

    // Socket.IO real-time event listeners
    socket.emit('join_farmer_room', farmerId);

    const handleOrderPlaced = (newOrder) => {
      const isForThisFarmer = newOrder?.items?.some(item => (item.farmer?._id || item.farmer) === farmerId);
      if (isForThisFarmer) {
        setOrders(prev => [newOrder, ...prev]);
        setRealtimeToast(`🎉 New order received! Total: ₹${newOrder.totalAmount}`);
        setTimeout(() => setRealtimeToast(null), 6000);
      }
    };

    const handleProductStock = (updatedProduct) => {
      if ((updatedProduct?.farmer?._id || updatedProduct?.farmer) === farmerId) {
        setProducts(prev => prev.map(p => p._id === updatedProduct._id ? updatedProduct : p));
      }
    };

    socket.on('order_placed', handleOrderPlaced);
    socket.on('product_stock_updated', handleProductStock);

    return () => { 
      ignore = true; 
      socket.off('order_placed', handleOrderPlaced);
      socket.off('product_stock_updated', handleProductStock);
    };
  }, [farmerId]);

  const handleStockUpdate = async (id, currentQty, delta) => {
    const newQty = Math.max(0, currentQty + delta);
    try {
      await updateProductStock(id, newQty);
      // Local updates for responsiveness
      setProducts(prev => prev.map(p => p._id === id ? { ...p, quantity: newQty } : p));
    } catch (err) {
      console.error("Failed to update stock level", err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product listing?")) {
      try {
        await deleteProduct(id);
        setProducts(prev => prev.filter(p => p._id !== id));
      } catch (err) {
        console.error("Failed to delete product listing", err);
      }
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Create product model
      await createProduct(newProduct);
      setNewProduct({
        name: '',
        category: 'Vegetables',
        price: '',
        unit: 'kg',
        quantity: '',
        description: '',
        image: categoryPresets.Vegetables[0].url
      });
      // reload
      await loadData();
      setActiveTab('inventory');
    } catch (err) {
      console.error("Product listing creation failed", err);
      alert("Failed to list product. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for analytics
  const totalEarnings = orders.reduce((sum, order) => {
    const farmerItemsTotal = order.items
      .filter(item => (item.farmer?._id || item.farmer) === farmerId)
      .reduce((s, item) => s + (item.price * item.quantity), 0);
    return sum + farmerItemsTotal;
  }, 0);

  const activeOrdersCount = orders.filter(o => o.deliveryStatus === 'Processing').length;

  const handleDownloadCSV = async () => {
    try {
      const response = await downloadSalesReportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Farmer_Sales_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export sales CSV: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]/50 p-4 md:p-10 space-y-12">
      {realtimeToast && (
        <div className="fixed top-20 right-8 z-50 bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 font-bold border border-emerald-400">
          <CheckCircle size={24} className="shrink-0 animate-bounce" />
          <span>{realtimeToast}</span>
        </div>
      )}
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Quote Hero Banner */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-emerald-800 to-green-700 p-8 md:p-12 text-white shadow-xl shadow-emerald-900/10">
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 opacity-10">
            <Sprout size={360} />
          </div>
          <div className="relative z-10 space-y-6 max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
              <Sprout size={14} className="text-emerald-300 animate-pulse" />
              Farmer Producer Portal
            </div>
            
            <div className="space-y-4">
              <h1 className="text-3xl md:text-5xl font-black leading-tight font-outfit" style={{ lineHeight: '1.3' }}>
                "உழவன் சேற்றில் கால் வைத்தால் தான், <br className="hidden md:block"/> நாம் சோற்றில் கை வைக்க முடியும்."
              </h1>
              <p className="text-xl md:text-2xl font-medium text-emerald-100 italic">
                "Only if the farmer puts his feet in the mud, can we put our hands in our food."
              </p>
            </div>

            <div className="pt-4 border-t border-white/20 flex flex-wrap gap-6 items-center">
              <div>
                <span className="text-xs text-emerald-200 font-bold uppercase block tracking-wider">Farm Name</span>
                <span className="font-bold text-lg">{farmer?.farmName || 'Verified Family Fields'}</span>
              </div>
              <div className="h-8 w-px bg-white/10 hidden sm:block"></div>
              <div>
                <span className="text-xs text-emerald-200 font-bold uppercase block tracking-wider">Location</span>
                <span className="font-bold text-lg">{farmer?.location?.district}, {farmer?.location?.state}</span>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider ${
                  farmer?.isVerified ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white animate-pulse'
                }`}>
                  {farmer?.isVerified ? <CheckCircle size={14} /> : <Clock size={14} />}
                  {farmer?.isVerified ? 'Verified Farm' : 'Pending Verification'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-emerald-50 text-emerald-600 p-4 rounded-2xl">
              <Sprout size={32} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block">My Listings</span>
              <span className="text-3xl font-black text-slate-800">{products.length} Items</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-amber-50 text-amber-600 p-4 rounded-2xl">
              <ShoppingBag size={32} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Active Orders</span>
              <span className="text-3xl font-black text-slate-800">{activeOrdersCount} Pending</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-blue-50 text-blue-600 p-4 rounded-2xl">
              <DollarSign size={32} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Total Earnings</span>
              <span className="text-3xl font-black text-slate-800">₹{totalEarnings}</span>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center gap-6">
            <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl">
              <Package size={32} />
            </div>
            <div>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Total Sales</span>
              <span className="text-3xl font-black text-slate-800">{orders.length} Orders</span>
            </div>
          </div>
        </div>

        {/* Tab Selection & Export Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-200 gap-4">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('inventory')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${
                activeTab === 'inventory' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              My Listings ({products.length})
              {activeTab === 'inventory' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('add')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${
                activeTab === 'add' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              List New Product
              {activeTab === 'add' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${
                activeTab === 'orders' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Recent Orders ({orders.length})
              {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
          </div>

          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition-all mb-2 cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export Sales CSV
          </button>
        </div>

        {/* Tabs Content */}
        {loading ? (
          <div className="py-24 flex items-center justify-center gap-2">
            <Loader2 className="animate-spin text-primary" size={32} />
            <span className="font-bold text-slate-500">Loading Dashboard details...</span>
          </div>
        ) : (
          <>
            {/* INVENTORY TAB */}
            {activeTab === 'inventory' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center flex-wrap gap-4">
                  <div>
                    <h2 className="text-2xl font-black text-dark">Active Listings</h2>
                    <p className="text-slate-400 font-medium text-sm mt-0.5">Edit inventory quantities or remove active listings.</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('add')}
                    className="btn-primary"
                  >
                    <PlusCircle size={20} /> Add Product
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-8 py-5">Product Details</th>
                        <th className="px-8 py-5">Category</th>
                        <th className="px-8 py-5">Price</th>
                        <th className="px-8 py-5">Stock Level</th>
                        <th className="px-8 py-5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((p) => (
                        <tr key={p._id} className="hover:bg-slate-50/30 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 shrink-0">
                                <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <span className="font-black text-slate-800 text-base leading-tight block">{p.name}</span>
                                <span className="text-slate-400 font-medium text-xs mt-1 block truncate max-w-xs">{p.description}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-8 py-6 font-black text-slate-800 text-lg">
                            ₹{p.price} <span className="text-xs text-slate-400 font-medium">/ {p.unit}</span>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleStockUpdate(p._id, p.quantity, -5)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                                disabled={p.quantity <= 0}
                              >
                                <Minus size={14} strokeWidth={3} />
                              </button>
                              <span className={`w-16 text-center font-black text-lg ${p.quantity === 0 ? 'text-rose-500' : 'text-slate-800'}`}>
                                {p.quantity} <span className="text-xs font-bold text-slate-400 block">{p.unit}</span>
                              </span>
                              <button 
                                onClick={() => handleStockUpdate(p._id, p.quantity, 5)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
                              >
                                <Plus size={14} strokeWidth={3} />
                              </button>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => handleDelete(p._id)}
                              className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 size={20} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {products.length === 0 && (
                    <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
                      <div className="bg-emerald-50 text-emerald-600 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <Sprout size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-dark">No Products Listed</h3>
                      <p className="text-slate-400">List your fresh farm produce so customers can view and buy them from the marketplace.</p>
                      <button onClick={() => setActiveTab('add')} className="btn-primary mx-auto">List a Product Now</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LIST NEW PRODUCT TAB */}
            {activeTab === 'add' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-dark">List New Produce</h2>
                  <p className="text-slate-400 font-medium text-sm mt-0.5">Add fresh fruits, vegetables, spices, or dairy to the market catalog.</p>
                </div>

                <form onSubmit={handleCreateProduct} className="p-8 md:p-10 space-y-8 max-w-4xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Left details fields */}
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Product Name</label>
                        <input 
                          type="text" 
                          required
                          value={newProduct.name}
                          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                          placeholder="e.g. Red Vine Tomatoes" 
                          className="input-field" 
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Category</label>
                          <select 
                            value={newProduct.category}
                            onChange={(e) => {
                              const cat = e.target.value;
                              const defaultImg = categoryPresets[cat]?.[0]?.url || '';
                              setSelectedPresetUrl(defaultImg);
                              setNewProduct({ ...newProduct, category: cat, image: defaultImg });
                            }}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                          >
                            <option value="Vegetables">Vegetables</option>
                            <option value="Fruits">Fruits</option>
                            <option value="Spices">Spices</option>
                            <option value="Grains">Grains</option>
                            <option value="Dairy">Dairy</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Unit of Sale</label>
                          <select 
                            value={newProduct.unit}
                            onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                            className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold"
                          >
                            <option value="kg">Per kg</option>
                            <option value="bundle">Per bundle</option>
                            <option value="Liter">Per Liter</option>
                            <option value="piece">Per piece</option>
                            <option value="box">Per box</option>
                            <option value="500g">Per 500g</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Price per Unit (₹)</label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                            placeholder="e.g. 40" 
                            className="input-field" 
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Initial Stock Qty</label>
                          <input 
                            type="number" 
                            required
                            min="1"
                            value={newProduct.quantity}
                            onChange={(e) => setNewProduct({ ...newProduct, quantity: Number(e.target.value) })}
                            placeholder="e.g. 100" 
                            className="input-field" 
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Short Description</label>
                        <textarea 
                          required
                          rows="3"
                          value={newProduct.description}
                          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                          placeholder="Tell customers about where and how this produce was harvested..."
                          className="w-full px-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium" 
                        />
                      </div>
                    </div>

                    {/* Right Preset Images block */}
                    <div className="space-y-6 bg-slate-50/50 border border-slate-200/60 p-6 rounded-3xl">
                      <div className="space-y-2">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Choose Preset Image</label>
                        <p className="text-xs font-medium text-slate-400">Select one of our preset farm-fresh photos matching your category.</p>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {(categoryPresets[newProduct.category] || []).map((preset, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setSelectedPresetUrl(preset.url);
                              setNewProduct({ ...newProduct, image: preset.url });
                            }}
                            className={`relative aspect-square rounded-2xl overflow-hidden cursor-pointer transition-all border-4 ${
                              selectedPresetUrl === preset.url ? 'border-primary scale-102 shadow-lg shadow-primary/15' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-dark/20 hover:bg-transparent transition-colors" />
                            <div className="absolute bottom-1 left-1.5 right-1.5 bg-white/95 backdrop-blur-md text-[8px] font-black text-dark text-center py-0.5 rounded-md leading-none truncate px-1">
                              {preset.name}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <label className="text-sm font-black text-slate-700 uppercase tracking-wider block">Or Paste Custom Image URL</label>
                        <input 
                          type="text"
                          value={newProduct.image}
                          onChange={(e) => {
                            setSelectedPresetUrl('');
                            setNewProduct({ ...newProduct, image: e.target.value });
                          }}
                          placeholder="https://images.unsplash.com/..." 
                          className="input-field" 
                        />
                      </div>

                      {newProduct.image && (
                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-inner mt-4 animate-in zoom-in-95">
                          <img src={newProduct.image} alt="Preview" className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-dark/60 text-white text-[10px] font-black px-2 py-1 rounded-lg">Preview Card Image</div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      type="button"
                      onClick={() => setActiveTab('inventory')}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={submitting}
                      className="btn-primary px-8"
                    >
                      {submitting ? <Loader2 className="animate-spin" size={20} /> : <PlusCircle size={20} />}
                      List Product to Market
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* CUSTOMER ORDERS TAB */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                  <h2 className="text-2xl font-black text-dark">Customer Orders</h2>
                  <p className="text-slate-400 font-medium text-sm mt-0.5">Monitor and process orders placed by consumers for your harvest.</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-slate-50/50 text-slate-400 text-xs font-black uppercase tracking-widest border-b border-slate-100">
                        <th className="px-8 py-5">Order ID & Date</th>
                        <th className="px-8 py-5">Customer Info</th>
                        <th className="px-8 py-5">Harvest Items Ordered</th>
                        <th className="px-8 py-5">Farmer Earnings</th>
                        <th className="px-8 py-5 text-right">Delivery Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((o) => {
                        // Filter items that belong to this farmer
                        const farmerItems = o.items.filter(item => 
                          (item.farmer?._id || item.farmer) === farmerId
                        );
                        
                        const farmerSubtotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

                        return (
                          <tr key={o._id} className="hover:bg-slate-50/30 transition-colors group">
                            <td className="px-8 py-6">
                              <span className="font-black text-slate-800 text-sm block">#{o._id.substring(o._id.length - 6).toUpperCase()}</span>
                              <span className="text-xs font-bold text-slate-400 block mt-1">{new Date(o.createdAt).toLocaleDateString()}</span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-1">
                                <span className="font-bold text-slate-700 text-sm flex items-center gap-1.5">
                                  <User size={14} className="text-slate-400" /> {o.customer?.name || 'Local Customer'}
                                </span>
                                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                                  <Phone size={12} className="text-slate-400" /> {o.shippingAddress?.phone}
                                </span>
                                <span className="text-xs text-slate-400 flex items-center gap-1.5 font-medium truncate max-w-xs">
                                  <MapPin size={12} className="text-slate-400" /> {o.shippingAddress?.city}
                                </span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <div className="space-y-2">
                                {farmerItems.map((item, idx) => (
                                  <div key={idx} className="flex items-center gap-2 text-sm">
                                    <div className="w-2 h-2 rounded-full bg-primary/40" />
                                    <span className="font-bold text-slate-800">{item.product?.name || 'Organic Item'}</span>
                                    <span className="text-slate-400 font-bold">x {item.quantity}</span>
                                  </div>
                                ))}
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <span className="font-black text-primary text-lg block">₹{farmerSubtotal}</span>
                              <span className="text-slate-400 font-bold text-xs">Method: {o.paymentMethod}</span>
                            </td>
                            <td className="px-8 py-6 text-right space-y-2">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider ${
                                o.deliveryStatus === 'Delivered' ? 'bg-green-100 text-green-700' :
                                o.deliveryStatus === 'Out for Delivery' ? 'bg-blue-100 text-blue-700' :
                                o.deliveryStatus === 'Pickup Pending' ? 'bg-purple-100 text-purple-700' :
                                o.deliveryStatus === 'Farmer Preparing' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {o.deliveryStatus}
                              </span>

                              {/* Assigned Delivery Driver Details */}
                              {o.deliveryPerson && (
                                <div className="text-[11px] text-gray-500 font-medium text-right">
                                  <span>Partner: <strong>{o.deliveryPerson.name}</strong></span>
                                  {o.deliveryPerson.phone && <span className="block text-gray-400">{o.deliveryPerson.phone}</span>}
                                </div>
                              )}

                              {/* Workflow Transition Buttons */}
                              <div className="flex justify-end gap-2 pt-1">
                                {(o.deliveryStatus === 'Pending' || o.deliveryStatus === 'Confirmed') && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await updateOrderStatus(o._id, { deliveryStatus: 'Farmer Preparing' });
                                        loadData();
                                      } catch (err) {
                                        alert("Failed to update status: " + (err.response?.data?.message || err.message));
                                      }
                                    }}
                                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Prepare Harvest &rarr;
                                  </button>
                                )}

                                {o.deliveryStatus === 'Farmer Preparing' && (
                                  <button
                                    onClick={async () => {
                                      try {
                                        await updateOrderStatus(o._id, { deliveryStatus: 'Pickup Pending' });
                                        loadData();
                                      } catch (err) {
                                        alert("Failed to update status: " + (err.response?.data?.message || err.message));
                                      }
                                    }}
                                    className="px-3 py-1 bg-primary hover:bg-[#0c4a29] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Ready for Pickup ✓
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {orders.length === 0 && (
                    <div className="py-24 text-center space-y-4 max-w-sm mx-auto">
                      <div className="bg-slate-50 text-slate-400 p-6 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
                        <ShoppingBag size={40} />
                      </div>
                      <h3 className="text-xl font-bold text-dark">No Customer Orders</h3>
                      <p className="text-slate-400">You haven't received any customer purchases for your listed farm produce yet.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FarmerDashboard;
