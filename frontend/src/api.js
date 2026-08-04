import axios from 'axios';

const API = axios.create({ 
  baseURL: '/api'
});

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
export const signOut = () => API.post('/auth/logout');
export const fetchProfile = () => API.get('/auth/profile');
export const updateProfile = (updatedData) => API.put('/auth/profile', updatedData);

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

export const fetchAllUsers = () => API.get('/admin/users');
export const verifyFarmer = (id) => API.patch(`/admin/verify/${id}`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);
export const fetchAdminStats = () => API.get('/admin/stats');
export const fetchFarmerStats = () => API.get('/admin/farmer-stats');

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

