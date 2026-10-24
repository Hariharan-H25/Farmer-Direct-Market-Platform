import { useState, useEffect, useCallback } from 'react';
import { 
  fetchAllUsers, 
  verifyFarmer, 
  toggleUserStatus, 
  fetchDeliveryPersonnel, 
  createDeliveryPersonnel, 
  assignDeliveryToOrder, 
  fetchAuditLogs, 
  fetchOrders, 
  fetchProducts, 
  deleteProduct, 
  deleteUser, 
  fetchAdminStats, 
  downloadSalesReportCSV 
} from '../api';
import { 
  Users, Shield, Mail, Phone, Home, CheckCircle, Clock, 
  Package, Trash2, Settings as SettingsIcon, Download, 
  Truck, Sprout, Search, Filter, PlusCircle, AlertCircle, 
  Loader2, Radio, DollarSign, FileText, Activity 
} from 'lucide-react';
import socket from '../socket';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);

  // Data states
  const [users, setUsers] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [deliveryAgents, setDeliveryAgents] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [stats, setStats] = useState(null);

  // Filters & Search
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  // New Delivery Personnel Form Modal
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    city: 'Erode',
    state: 'Tamil Nadu'
  });
  const [submittingDelivery, setSubmittingDelivery] = useState(false);

  // Assign Delivery Modal
  const [selectedOrderForAssign, setSelectedOrderForAssign] = useState(null);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [assigning, setAssigning] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, ordersRes, productsRes, deliveryRes, statsRes, auditRes] = await Promise.all([
        fetchAllUsers().catch(() => ({ data: [] })),
        fetchOrders().catch(() => ({ data: [] })),
        fetchProducts({ limit: 100 }).catch(() => ({ data: [] })),
        fetchDeliveryPersonnel().catch(() => ({ data: [] })),
        fetchAdminStats().catch(() => ({ data: null })),
        fetchAuditLogs().catch(() => ({ data: [] }))
      ]);

      const allUsers = usersRes.data || [];
      setUsers(allUsers);
      setFarmers(allUsers.filter(u => u.role === 'farmer'));
      setDeliveryAgents(deliveryRes.data || allUsers.filter(u => u.role === 'delivery'));
      setOrders(ordersRes.data || []);
      setProducts(productsRes.data || []);
      setStats(statsRes.data || null);
      setAuditLogs(auditRes.data || []);
    } catch (err) {
      console.error("Admin loadData error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for real-time WebSocket events
    const handleRefresh = () => loadData();
    socket.on('admin_stats_updated', handleRefresh);
    socket.on('order_placed', handleRefresh);
    socket.on('farmer_verified', handleRefresh);
    socket.on('user_deleted', handleRefresh);

    return () => {
      socket.off('admin_stats_updated', handleRefresh);
      socket.off('order_placed', handleRefresh);
      socket.off('farmer_verified', handleRefresh);
      socket.off('user_deleted', handleRefresh);
    };
  }, [loadData]);

  // Actions
  const handleVerifyFarmer = async (id) => {
    try {
      await verifyFarmer(id);
      loadData();
    } catch (err) {
      alert("Failed to toggle verification: " + (err.response?.data?.message || err.message));
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    if (window.confirm(`Are you sure you want to mark this account as ${nextStatus}?`)) {
      try {
        await toggleUserStatus(id, nextStatus);
        loadData();
      } catch (err) {
        alert("Status update failed: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Permanently remove user "${name}"? This action cannot be undone.`)) {
      try {
        await deleteUser(id);
        loadData();
      } catch (err) {
        alert("Failed to delete user: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (window.confirm(`Remove product "${name}" from the marketplace?`)) {
      try {
        await deleteProduct(id);
        loadData();
      } catch (err) {
        alert("Failed to delete product: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleCreateDeliveryPartner = async (e) => {
    e.preventDefault();
    setSubmittingDelivery(true);
    try {
      await createDeliveryPersonnel(deliveryForm);
      setShowAddDeliveryModal(false);
      setDeliveryForm({ name: '', email: '', phone: '', password: '', city: 'Erode', state: 'Tamil Nadu' });
      loadData();
    } catch (err) {
      alert("Failed to create delivery account: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingDelivery(false);
    }
  };

  const handleAssignDelivery = async () => {
    if (!selectedOrderForAssign || !selectedAgentId) return;
    setAssigning(true);
    try {
      await assignDeliveryToOrder({
        orderId: selectedOrderForAssign._id,
        deliveryPersonId: selectedAgentId
      });
      setSelectedOrderForAssign(null);
      setSelectedAgentId('');
      loadData();
    } catch (err) {
      alert("Assignment failed: " + (err.response?.data?.message || err.message));
    } finally {
      setAssigning(false);
    }
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await downloadSalesReportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FarmConnect_Platform_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("CSV Export failed: " + (err.response?.data?.message || err.message));
    }
  };

  // Filtered users
  const filteredUsers = users.filter(u => {
    const matchesSearch = !userSearch || 
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.phone?.includes(userSearch);
    const matchesRole = userRoleFilter === 'all' || 
      (userRoleFilter === 'customer' ? (u.role === 'customer' || u.role === 'buyer') : u.role === userRoleFilter);
    return matchesSearch && matchesRole;
  });

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    if (orderStatusFilter === 'all') return true;
    return o.deliveryStatus?.toLowerCase() === orderStatusFilter.toLowerCase();
  });

  const activeDeliveriesList = orders.filter(o => 
    ['Pickup Pending', 'Picked Up', 'Out for Delivery'].includes(o.deliveryStatus)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 p-4 md:p-8 space-y-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 rounded-xl">
                <Shield size={22} />
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                Platform Administration
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Platform governance, farmer validations, delivery fleet management, and audit logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCSV}
              className="px-4 py-2 bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download size={14} /> Export Sales CSV
            </button>
            <button
              onClick={loadData}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold text-xs transition-colors cursor-pointer"
            >
              Refresh Data
            </button>
          </div>
        </div>

        {/* Platform Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Total Users</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">{users.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-emerald-500 block tracking-wider">Farmers</span>
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">{farmers.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-blue-500 block tracking-wider">Delivery Fleet</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1 block">{deliveryAgents.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-gray-400 block tracking-wider">Total Orders</span>
            <span className="text-2xl font-black text-gray-900 dark:text-white mt-1 block">{orders.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-amber-500 block tracking-wider">Active In-Transit</span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1 block">{activeDeliveriesList.length}</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800">
            <span className="text-[10px] font-black uppercase text-primary dark:text-emerald-400 block tracking-wider">Platform Revenue</span>
            <span className="text-xl font-black text-primary dark:text-emerald-400 mt-1 block">₹{stats?.totalRevenue || 0}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-2 p-1.5 bg-gray-200/60 dark:bg-gray-900 rounded-2xl no-scrollbar">
          {[
            { id: 'users', label: 'User Management', icon: Users, count: users.length },
            { id: 'farmers', label: 'Farmer Verifications', icon: Sprout, count: farmers.length },
            { id: 'delivery', label: 'Delivery Fleet', icon: Truck, count: deliveryAgents.length },
            { id: 'products', label: 'Product Catalog', icon: Package, count: products.length },
            { id: 'orders', label: 'Order Assignments', icon: FileText, count: orders.length },
            { id: 'tracking', label: 'Live Tracking Overview', icon: Radio, count: activeDeliveriesList.length },
            { id: 'audit', label: 'Audit Logs', icon: Activity, count: auditLogs.length }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-full font-bold">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="animate-spin text-primary mx-auto" size={36} />
            <p className="text-sm text-gray-400 font-medium">Fetching administrative records...</p>
          </div>
        ) : (
          <>
            {/* ─── TAB 1: USER MANAGEMENT ─────────────────────────── */}
            {activeTab === 'users' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3.5 top-3 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search users by name, email, phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select
                      value={userRoleFilter}
                      onChange={(e) => setUserRoleFilter(e.target.value)}
                      className="px-3 py-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white outline-none"
                    >
                      <option value="all">All Roles</option>
                      <option value="customer">Customers</option>
                      <option value="farmer">Farmers</option>
                      <option value="delivery">Delivery Personnel</option>
                      <option value="admin">Administrators</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold uppercase tracking-wider">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Contact</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Verification</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                      {filteredUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                          <td className="p-3">
                            <span className="font-bold text-gray-900 dark:text-white block">{u.name}</span>
                            <span className="text-[11px] text-gray-400">Joined: {new Date(u.createdAt).toLocaleDateString()}</span>
                          </td>
                          <td className="p-3">
                            <span className="block">{u.email}</span>
                            <span className="text-[11px] text-gray-400">{u.phone}</span>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                              u.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300' :
                              u.role === 'farmer' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                              u.role === 'delivery' ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' :
                              'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3">
                            {u.isVerified ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                <CheckCircle size={12} /> Verified
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-amber-600 font-bold">
                                <Clock size={12} /> Unverified
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              u.accountStatus === 'Suspended'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-green-100 text-green-700'
                            }`}>
                              {u.accountStatus || 'Active'}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-2">
                            <button
                              onClick={() => handleToggleStatus(u._id, u.accountStatus)}
                              className="px-2.5 py-1 text-[11px] font-bold border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                            >
                              {u.accountStatus === 'Suspended' ? 'Activate' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id, u.name)}
                              className="p-1 text-red-500 hover:text-red-700 cursor-pointer inline-block align-middle"
                              title="Delete User"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 2: FARMER MANAGEMENT ───────────────────────── */}
            {activeTab === 'farmers' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Registered Farmers &amp; Farm Profiles</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {farmers.map((farmer) => (
                    <div key={farmer._id} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-gray-900 dark:text-white">{farmer.name}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          farmer.isVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {farmer.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <p><strong>Farm:</strong> {farmer.farmName || 'N/A'}</p>
                        <p><strong>Email:</strong> {farmer.email}</p>
                        <p><strong>Phone:</strong> {farmer.phone}</p>
                        <p><strong>Location:</strong> {farmer.location?.district}, {farmer.location?.state}</p>
                      </div>
                      <button
                        onClick={() => handleVerifyFarmer(farmer._id)}
                        className={`w-full py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          farmer.isVerified
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                        }`}
                      >
                        {farmer.isVerified ? 'Revoke Verification' : 'Verify Farmer Badge ✓'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 3: DELIVERY FLEET ──────────────────────────── */}
            {activeTab === 'delivery' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-gray-900 dark:text-white">Authorized Delivery Fleet</h3>
                    <p className="text-xs text-gray-400">Personnel authorized to perform pickups, live GPS broadcasting, and drops.</p>
                  </div>
                  <button
                    onClick={() => setShowAddDeliveryModal(true)}
                    className="bg-primary hover:bg-[#0c4a29] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <PlusCircle size={14} /> Add Delivery Driver
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryAgents.map((agent) => (
                    <div key={agent._id} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-blue-50 dark:bg-blue-950 text-blue-600 rounded-xl">
                            <Truck size={18} />
                          </span>
                          <div>
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white">{agent.name}</h4>
                            <span className="text-[11px] text-gray-400">{agent.phone}</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                          {agent.accountStatus || 'Active'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p><strong>Email:</strong> {agent.email}</p>
                        <p><strong>Region:</strong> {agent.location?.district || 'Tamil Nadu'}</p>
                        <div className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                          <span>Active Deliveries: <strong>{agent.activeDeliveries || 0}</strong></span>
                          <span>Completed: <strong>{agent.completedDeliveries || 0}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Delivery Partner Modal */}
                {showAddDeliveryModal && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-md w-full space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800">
                      <div className="flex justify-between items-center border-b pb-3">
                        <h4 className="font-bold text-base text-gray-900 dark:text-white">Create Delivery Personnel Account</h4>
                        <button onClick={() => setShowAddDeliveryModal(false)} className="text-gray-400 hover:text-gray-600">
                          &times;
                        </button>
                      </div>

                      <form onSubmit={handleCreateDeliveryPartner} className="space-y-3 text-xs">
                        <div>
                          <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Karthik Selvan"
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            value={deliveryForm.name}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, name: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            placeholder="karthik@delivery.com"
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            value={deliveryForm.email}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, email: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">Mobile Number</label>
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            value={deliveryForm.phone}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, phone: e.target.value })}
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-gray-600 dark:text-gray-300 mb-1">Temporary Password</label>
                          <input
                            type="password"
                            required
                            placeholder="••••••••"
                            className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                            value={deliveryForm.password}
                            onChange={(e) => setDeliveryForm({ ...deliveryForm, password: e.target.value })}
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            type="submit"
                            disabled={submittingDelivery}
                            className="flex-1 bg-primary text-white py-2.5 rounded-xl font-bold"
                          >
                            {submittingDelivery ? 'Creating...' : 'Create Partner Account'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddDeliveryModal(false)}
                            className="px-4 py-2.5 border rounded-xl"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 4: PRODUCT MANAGEMENT ──────────────────────── */}
            {activeTab === 'products' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Platform Marketplace Products ({products.length})</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">Product</th>
                        <th className="p-3">Category</th>
                        <th className="p-3">Price</th>
                        <th className="p-3">Stock Available</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Delete</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {products.map((p) => (
                        <tr key={p._id || p.id}>
                          <td className="p-3 flex items-center gap-2.5">
                            <img src={p.image} alt={p.name} className="w-9 h-9 rounded-lg object-cover bg-gray-50" />
                            <span className="font-bold text-gray-900 dark:text-white">{p.name}</span>
                          </td>
                          <td className="p-3">{p.category}</td>
                          <td className="p-3 font-bold text-primary dark:text-emerald-400">₹{p.price} / {p.unit}</td>
                          <td className="p-3 font-bold">{p.quantity} {p.unit}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.quantity > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                            }`}>
                              {p.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleDeleteProduct(p._id || p.id, p.name)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ─── TAB 5: ORDER MANAGEMENT & ASSIGNMENTS ───────────── */}
            {activeTab === 'orders' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-base text-gray-900 dark:text-white">Platform Orders &amp; Delivery Assignments</h3>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="p-2 rounded-xl text-xs bg-gray-50 dark:bg-gray-800 border"
                  >
                    <option value="all">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Farmer Preparing">Farmer Preparing</option>
                    <option value="Pickup Pending">Pickup Pending</option>
                    <option value="Picked Up">Picked Up</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer &amp; Dropoff</th>
                        <th className="p-3">Total</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Assigned Driver</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {filteredOrders.map((ord) => (
                        <tr key={ord._id}>
                          <td className="p-3 font-mono font-bold">#{ord._id.slice(-6).toUpperCase()}</td>
                          <td className="p-3">
                            <span className="font-bold block">{ord.shippingAddress?.recipientName || ord.customer?.name}</span>
                            <span className="text-gray-400 text-[11px]">{ord.shippingAddress?.city} - {ord.shippingAddress?.pincode}</span>
                          </td>
                          <td className="p-3 font-black text-primary dark:text-emerald-400">₹{ord.totalAmount}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              {ord.deliveryStatus}
                            </span>
                          </td>
                          <td className="p-3">
                            {ord.deliveryPerson ? (
                              <span className="font-bold text-gray-800 dark:text-gray-200">
                                {ord.deliveryPerson.name || 'Assigned Driver'}
                              </span>
                            ) : (
                              <span className="text-amber-500 font-bold italic">Unassigned</span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setSelectedOrderForAssign(ord);
                                setSelectedAgentId(ord.deliveryPerson?._id || ord.deliveryPerson || '');
                              }}
                              className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg font-bold text-xs"
                            >
                              Assign Driver
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Assign Delivery Partner Modal */}
                {selectedOrderForAssign && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl max-w-sm w-full space-y-4 shadow-2xl border border-gray-200 dark:border-gray-800 text-xs">
                      <div className="flex justify-between items-center border-b pb-2">
                        <h4 className="font-bold text-sm">Assign Delivery Partner</h4>
                        <button onClick={() => setSelectedOrderForAssign(null)}>&times;</button>
                      </div>

                      <p>Order: <strong>#{selectedOrderForAssign._id.slice(-6).toUpperCase()}</strong></p>
                      
                      <div className="space-y-1">
                        <label className="block font-bold">Select Active Driver:</label>
                        <select
                          value={selectedAgentId}
                          onChange={(e) => setSelectedAgentId(e.target.value)}
                          className="w-full p-2.5 rounded-xl border bg-gray-50 dark:bg-gray-800"
                        >
                          <option value="">-- Choose Partner --</option>
                          {deliveryAgents.map((ag) => (
                            <option key={ag._id} value={ag._id}>
                              {ag.name} ({ag.phone})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={handleAssignDelivery}
                          disabled={!selectedAgentId || assigning}
                          className="flex-1 bg-primary text-white py-2 rounded-xl font-bold"
                        >
                          {assigning ? 'Assigning...' : 'Confirm Assignment'}
                        </button>
                        <button
                          onClick={() => setSelectedOrderForAssign(null)}
                          className="px-3 py-2 border rounded-xl"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── TAB 6: LIVE TRACKING OVERVIEW ──────────────────── */}
            {activeTab === 'tracking' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Active In-Transit Orders ({activeDeliveriesList.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {activeDeliveriesList.map((ord) => (
                    <div key={ord._id} className="p-4 rounded-2xl border border-gray-200 dark:border-gray-800 space-y-2">
                      <div className="flex justify-between items-center font-bold">
                        <span>Order #{ord._id.slice(-6).toUpperCase()}</span>
                        <span className="text-emerald-600">{ord.deliveryStatus}</span>
                      </div>
                      <p><strong>Pickup Farm:</strong> {ord.pickupLocation?.farmName || 'Farm'}</p>
                      <p><strong>Destination:</strong> {ord.shippingAddress?.city} ({ord.shippingAddress?.recipientName})</p>
                      <p><strong>Driver:</strong> {ord.deliveryPerson?.name || 'Assigned'}</p>
                      {ord.liveLocation ? (
                        <p className="text-emerald-600 font-bold">
                          Live GPS: {ord.liveLocation.lat.toFixed(4)}, {ord.liveLocation.lng.toFixed(4)} &bull; Speed: {ord.liveLocation.speed || 0} km/h
                        </p>
                      ) : (
                        <p className="text-gray-400 italic">Waiting for driver GPS stream</p>
                      )}
                    </div>
                  ))}
                  {activeDeliveriesList.length === 0 && (
                    <div className="col-span-2 py-12 text-center text-gray-400">
                      No active orders currently in transit.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 7: AUDIT LOGS ───────────────────────────────── */}
            {activeTab === 'audit' && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 shadow-sm">
                <h3 className="font-bold text-base text-gray-900 dark:text-white">Administrative Activity Audit Log</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-400 font-bold uppercase">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Admin Actor</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Target Entity</th>
                        <th className="p-3">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {auditLogs.map((log) => (
                        <tr key={log._id}>
                          <td className="p-3 text-gray-400 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-bold">{log.actorName} ({log.actorRole})</td>
                          <td className="p-3 font-bold text-primary dark:text-emerald-400">{log.action}</td>
                          <td className="p-3">{log.targetType} #{log.targetId ? log.targetId.slice(-6).toUpperCase() : 'N/A'}</td>
                          <td className="p-3 font-mono text-[11px] text-gray-500 truncate max-w-xs">
                            {JSON.stringify(log.details || {})}
                          </td>
                        </tr>
                      ))}
                      {auditLogs.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400">
                            No administrative audit records logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
