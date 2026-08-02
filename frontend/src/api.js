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

export const fetchProducts = (params) => API.get('/products', { params });
export const createProduct = (newProduct) => API.post('/products', newProduct, {
  headers: { 'Content-Type': 'multipart/form-data' }
});

export const placeOrder = (orderData) => API.post('/orders', orderData);
export const fetchOrders = () => API.get('/orders');

export const fetchAllUsers = () => API.get('/admin/users');
export const verifyFarmer = (id) => API.patch(`/admin/verify/${id}`);
export const deleteUser = (id) => API.delete(`/admin/users/${id}`);

export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const updateProductStock = (id, quantity) => API.patch(`/products/${id}/stock`, { quantity });
