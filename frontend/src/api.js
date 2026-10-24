import axios from 'axios';

// Default live cloud backend URL deployed on Vercel
const CLOUD_BACKEND_URL = 'https://farmer-direct-market-platform-nfkk.vercel.app';

// Always resolve to the valid backend URL across local dev, preview, and Vercel production
const resolveApiBase = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  return `${CLOUD_BACKEND_URL}/api`;
};

const BASE_URL = resolveApiBase();

const API = axios.create({
  baseURL: BASE_URL,
  withCredentials: false,
});

export { API };

API.interceptors.request.use((req) => {
  if (localStorage.getItem('profile')) {
    req.headers.Authorization = `Bearer ${JSON.parse(localStorage.getItem('profile')).token}`;
  }
  return req;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('profile');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const signIn = (formData) => API.post('/auth/login', formData);
export const signUp = (formData) => API.post('/auth/register', formData);
export const verifyOTP = (otpData) => API.post('/auth/verify-otp', otpData);
export const resendOTP = (emailData) => API.post('/auth/resend-otp', emailData);
export const signOut = () => API.post('/auth/logout');
export const fetchProfile = () => API.get('/auth/profile');
export const updateProfile = (updatedData) => API.put('/auth/profile', updatedData);

// Saved Addresses (Swiggy/Zomato style)
export const fetchSavedAddresses = () => API.get('/auth/addresses');
export const addSavedAddress = (addressData) => API.post('/auth/addresses', addressData);
export const deleteSavedAddress = (addressId) => API.delete(`/auth/addresses/${addressId}`);

export const fetchProducts = (params) => API.get('/products', { params });
export const fetchProductById = (id) => API.get(`/products/${id}`);
export const createProduct = (newProduct) => API.post('/products', newProduct, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const updateProduct = (id, updatedProduct) => API.put(`/products/${id}`, updatedProduct, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const updateProductStock = (id, quantity) => API.patch(`/products/${id}/stock`, { quantity });
export const addReview = (id, reviewData) => API.post(`/products/${id}/review`, reviewData);

export const fetchWishlist = () => API.get('/auth/wishlist');
export const addToWishlist = (productId) => API.post(`/auth/wishlist/${productId}`);
export const removeFromWishlist = (productId) => API.delete(`/auth/wishlist/${productId}`);

export const placeOrder = (orderData) => API.post('/orders', orderData);
export const fetchOrders = () => API.get('/orders');
export const fetchBuyerOrders = () => API.get('/orders/my-orders');
export const fetchFarmerOrders = () => API.get('/orders/farmer-orders');
export const fetchOrderById = (id) => API.get(`/orders/${id}`);
export const updateOrderStatus = (id, statusData) => API.patch(`/orders/${id}/status`, statusData);
export const cancelOrder = (id) => API.patch(`/orders/${id}/cancel`);
export const requestReturn = (id, reasonData) => API.patch(`/orders/${id}/return`, reasonData);

// Delivery & Live Tracking
export const fetchDeliveryOrders = () => API.get('/delivery/orders');
export const acceptDeliveryOrder = (id) => API.patch(`/delivery/orders/${id}/accept`);
export const updateDeliveryStatus = (id, statusData) => API.patch(`/delivery/orders/${id}/status`, statusData);
export const updateDeliveryLiveLocation = (id, locationData) => API.post(`/delivery/orders/${id}/location`, locationData);
export const fetchOrderTracking = (id) => API.get(`/delivery/track/${id}`);

// Payment Gateway: Razorpay & UPI
export const createRazorpayOrder = (orderData) => API.post('/orders/razorpay-order', orderData);
export const verifyRazorpayPayment = (paymentData) => API.post('/orders/verify-payment', paymentData);

// Export & Printable Invoices
export const fetchOrderInvoice = (id) => API.get(`/orders/${id}/invoice`);
export const downloadSalesReportCSV = () => API.get('/orders/export/csv', { responseType: 'blob' });

export const fetchAllUsers = (params) => API.get('/admin/users', { params });
export const toggleUserStatus = (id, status) => API.patch(`/admin/users/${id}/status`, { status });
export const verifyFarmer = (id) => API.patch(`/admin/verify/${id}`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchFarmerStats = () => API.get('/admin/farmer-stats');
export const fetchDeliveryPersonnel = () => API.get('/admin/delivery-personnel');
export const createDeliveryPersonnel = (data) => API.post('/admin/delivery-personnel', data);
export const assignDeliveryToOrder = (data) => API.post('/admin/assign-delivery', data);
export const fetchAuditLogs = () => API.get('/admin/audit-logs');

// Phase 4 - AI Features
export const chatWithBot = (message, language) => API.post('/ai/chat', { message, language });
export const diagnoseCropDisease = (formData) => API.post('/ai/diagnose-crop', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getCropRecommendation = (data) => API.post('/ai/crop-recommendation', data);
export const getPriceRecommendation = (data) => API.post('/ai/price-recommendation', data);
export const getSmartRecommendations = () => API.get('/ai/recommendations');

// Phase 4 - Weather
export const fetchWeather = (city) => API.get('/weather', { params: { city } });

// Phase 4 - Market Intelligence
export const fetchMarketTrends = () => API.get('/market/trends');

// Phase 4 - Farmer Maps
export const fetchNearbyFarmers = (params) => API.get('/farmers/nearby', { params });

