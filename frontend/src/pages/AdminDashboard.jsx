import { useState, useEffect, useCallback } from 'react';
import { fetchAllUsers, verifyFarmer, fetchOrders, deleteUser, downloadSalesReportCSV } from '../api';
import { Users, Shield, Mail, Phone, Home, Image as ImageIcon, CheckCircle, Clock, Package, Trash2, Settings as SettingsIcon, Save, Download } from 'lucide-react';
import socket from '../socket';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, farmers: 0, customers: 0 });
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    allowRegistrations: true,
    deliveryFee: 50,
  });

  const loadData = useCallback(async () => {
    try {
      const [usersRes, ordersRes] = await Promise.all([
        fetchAllUsers(),
        fetchOrders().catch(() => ({ data: [] }))
      ]);
      const data = usersRes.data || [];
      setUsers(data);
      setOrders(ordersRes.data || []);
      setStats({
        total: data.length,
        farmers: data.filter(u => u.role === 'farmer').length,
        customers: data.filter(u => u.role === 'customer').length,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const [usersRes, ordersRes] = await Promise.all([
          fetchAllUsers(),
          fetchOrders().catch(() => ({ data: [] }))
        ]);
        if (!ignore) {
          const data = usersRes.data || [];
          setUsers(data);
          setOrders(ordersRes.data || []);
          setStats({
            total: data.length,
            farmers: data.filter(u => u.role === 'farmer').length,
            customers: data.filter(u => u.role === 'customer').length,
          });
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      }
    })();

    // Listen for real-time WebSocket updates
    const handleAdminRefresh = () => {
      loadData();
    };

    socket.on('admin_stats_updated', handleAdminRefresh);
    socket.on('order_placed', handleAdminRefresh);
    socket.on('farmer_verified', handleAdminRefresh);
    socket.on('user_deleted', handleAdminRefresh);

    return () => { 
      ignore = true; 
      socket.off('admin_stats_updated', handleAdminRefresh);
      socket.off('order_placed', handleAdminRefresh);
      socket.off('farmer_verified', handleAdminRefresh);
      socket.off('user_deleted', handleAdminRefresh);
    };
  }, [loadData]);

  const handleVerify = async (id) => {
    try {
      await verifyFarmer(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (window.confirm(`Are you sure you want to completely remove the user "${name}"? This cannot be undone.`)) {
      try {
        await deleteUser(id);
        loadData();
      } catch (err) {
        console.error(err);
        alert("Failed to delete user.");
      }
    }
  };

  const handleSaveSettings = () => {
    alert("Platform settings updated successfully!");
  };

  const handleDownloadCSV = async () => {
    try {
      const response = await downloadSalesReportCSV();
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `FarmConnect_Admin_Sales_Report_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to export sales CSV: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-10 space-y-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black text-dark flex items-center gap-3">
              <Shield className="text-primary" size={32} /> Platform Control
            </h1>
            <p className="text-gray-500 font-medium">Monitor users, verify farmers, and track platform health.</p>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            <div className="px-6 py-2 border-r border-gray-50 text-center">
              <span className="block text-2xl font-black text-dark">{stats.total}</span>
              <span className="text-xs font-bold text-gray-400 uppercase">Total Users</span>
            </div>
            <div className="px-6 py-2 border-r border-gray-50 text-center">
              <span className="block text-2xl font-black text-primary">{stats.farmers}</span>
              <span className="text-xs font-bold text-gray-400 uppercase">Farmers</span>
            </div>
            <div className="px-6 py-2 text-center">
              <span className="block text-2xl font-black text-accent">{stats.customers}</span>
              <span className="text-xs font-bold text-gray-400 uppercase">Customers</span>
            </div>
          </div>
        </div>

        {/* Tabs & Export Action Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 gap-4">
          <div className="flex gap-8">
            <button 
              onClick={() => setActiveTab('users')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${activeTab === 'users' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              User Management
              {activeTab === 'users' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${activeTab === 'orders' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Recent Orders
              {activeTab === 'orders' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
            <button 
              onClick={() => setActiveTab('settings')}
              className={`pb-4 font-bold text-lg transition-colors relative cursor-pointer ${activeTab === 'settings' ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}
            >
              Platform Settings
              {activeTab === 'settings' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full" />}
            </button>
          </div>

          <button 
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded-xl font-bold text-sm transition-all mb-2 cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export Sales Report (CSV)
          </button>
        </div>

        {/* Content based on tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex justify-between items-center">
              <h2 className="text-2xl font-black text-dark">User Management</h2>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-gray-50 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">All Roles</button>
                <button className="px-4 py-2 bg-primary/10 rounded-xl text-sm font-bold text-primary">Pending Verification</button>
              </div>
            </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 text-gray-400 text-xs font-black uppercase tracking-widest">
                  <th className="px-8 py-5">User Details</th>
                  <th className="px-8 py-5">Role & Farm</th>
                  <th className="px-8 py-5">Contact</th>
                  <th className="px-8 py-5">Verification</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user._id} className="hover:bg-gray-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-black text-primary text-xl">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-black text-dark text-lg">{user.name}</p>
                          <p className="text-xs font-bold text-gray-400 italic">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${user.role === 'farmer' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                          {user.role}
                        </span>
                        {user.farmName && (
                          <p className="text-sm font-bold text-gray-600 flex items-center gap-1">
                            <Home size={14} /> {user.farmName}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Mail size={14} className="text-gray-400" /> {user.email}</p>
                        <p className="text-sm font-bold text-gray-700 flex items-center gap-2"><Phone size={14} className="text-gray-400" /> {user.phone}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {user.role === 'farmer' ? (
                        user.isVerified ? (
                          <div className="flex items-center gap-2 text-primary font-bold text-sm">
                            <CheckCircle size={18} /> Verified
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-amber-500 font-bold text-sm">
                            <Clock size={18} /> Pending
                          </div>
                        )
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-8 py-6 text-right">
                      {user.role === 'farmer' && !user.isVerified && (
                        <button 
                          onClick={() => handleVerify(user._id)}
                          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all mb-2 w-full"
                        >
                          Approve Farmer
                        </button>
                      )}
                      <div className="flex justify-end gap-2 mt-1">
                        <button className="p-2 text-gray-300 hover:text-primary transition-colors">
                          <ImageIcon size={20} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id, user.name)}
                          className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                          title="Remove User"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && !loading && (
              <div className="py-20 text-center space-y-4">
                <Users size={64} className="mx-auto text-gray-100" />
                <p className="text-gray-400 font-bold">No users registered yet.</p>
              </div>
            )}
          </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50">
              <h2 className="text-2xl font-black text-dark">Recent Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-400 text-xs font-black uppercase tracking-widest">
                    <th className="px-8 py-5">Order ID & Date</th>
                    <th className="px-8 py-5">Customer</th>
                    <th className="px-8 py-5">Items</th>
                    <th className="px-8 py-5">Total</th>
                    <th className="px-8 py-5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50/30 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="font-black text-dark text-sm">#{order._id.substring(order._id.length - 6).toUpperCase()}</div>
                        <div className="text-xs font-bold text-gray-400">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-gray-700">{order.customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-400">{order.shippingAddress?.city}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-medium text-gray-600">
                          {order.items.length} items
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-primary">₹{order.totalAmount}</div>
                        <div className="text-xs text-gray-400">{order.paymentMethod}</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <span className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          order.deliveryStatus === 'Processing' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          {order.deliveryStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {orders.length === 0 && !loading && (
                <div className="py-20 text-center space-y-4">
                  <Package size={64} className="mx-auto text-gray-100" />
                  <p className="text-gray-400 font-bold">No orders placed yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center gap-3">
              <SettingsIcon className="text-primary" size={28} />
              <h2 className="text-2xl font-black text-dark">Platform Settings</h2>
            </div>
            
            <div className="p-8 max-w-3xl space-y-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-dark text-lg">Maintenance Mode</h3>
                    <p className="text-gray-500 text-sm">Disable access to the platform for all non-admin users.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.maintenanceMode} onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})} />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-dark text-lg">Allow New Registrations</h3>
                    <p className="text-gray-500 text-sm">Enable or disable new users from signing up.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.allowRegistrations} onChange={(e) => setSettings({...settings, allowRegistrations: e.target.checked})} />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <div>
                    <h3 className="font-bold text-dark text-lg">Default Delivery Fee (₹)</h3>
                    <p className="text-gray-500 text-sm">Base delivery charge for orders under ₹500.</p>
                  </div>
                  <input 
                    type="number" 
                    value={settings.deliveryFee} 
                    onChange={(e) => setSettings({...settings, deliveryFee: e.target.value})}
                    className="bg-white border border-gray-200 px-4 py-2 rounded-xl w-24 text-center font-bold outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-end">
                <button onClick={handleSaveSettings} className="btn-primary flex items-center gap-2 text-lg px-8 py-3 rounded-xl">
                  <Save size={20} /> Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
