import axios from 'axios';

// Create axios instance with base URL
const API = axios.create({
  baseURL: '/api',
});

// Request interceptor for adding auth token
API.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      try {
        const parsedUserInfo = JSON.parse(userInfo);
        const token = parsedUserInfo.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing userInfo:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auth services
export const loginUser = (email, password) => API.post('/users/login', { email, password });
export const registerUser = (name, email, password) => API.post('/users', { name, email, password });
export const getUserProfile = () => API.get('/users/profile');
export const updateUserProfile = (userData) => API.put('/users/profile', userData);

// User services (admin only)
export const getUsers = () => API.get('/users');
export const getUserById = (id) => API.get(`/users/${id}`);
export const updateUser = (id, userData) => API.put(`/users/${id}`, userData);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getPendingUsers = () => API.get('/users/pending');
export const approveUser = (id) => API.put(`/users/${id}/approve`);

// Dashboard services
export const getDashboardData = () => API.get('/users/dashboard');

// Payment services
export const createPayment = (paymentData) => API.post('/payments', paymentData);
export const getPayments = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.clientName) params.append('clientName', filters.clientName);
  if (filters.clientId) params.append('clientId', filters.clientId);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.weekNumber) params.append('weekNumber', filters.weekNumber);
  if (filters.year) params.append('year', filters.year);
  
  return API.get('/payments', { params });
};
export const getPaymentById = (id) => API.get(`/payments/${id}`);
export const updatePayment = (id, paymentData) => API.put(`/payments/${id}`, paymentData);
export const deletePayment = (id) => API.delete(`/payments/${id}`);
export const getWeeklyPayments = (weekNumber, year) => {
  const params = new URLSearchParams();
  if (weekNumber) params.append('weekNumber', weekNumber);
  if (year) params.append('year', year);
  
  return API.get('/payments/weekly', { params });
};

// Event services
export const createEvent = (eventData) => API.post('/events', eventData);
export const getEvents = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.name) params.append('name', filters.name);
  if (filters.status) params.append('status', filters.status);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  return API.get('/events', { params });
};
export const getEventById = (id) => API.get(`/events/${id}`);
export const updateEvent = (id, eventData) => API.put(`/events/${id}`, eventData);
export const deleteEvent = (id) => API.delete(`/events/${id}`);

// Report services
export const generatePaymentReport = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  
  return API.get('/payments/report', { 
    params,
    responseType: 'blob' 
  });
};

export const generateEventReport = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  
  return API.get('/events/report', { 
    params,
    responseType: 'blob' 
  });
};

export const generateUserReport = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  return API.get('/users/report', { 
    params,
    responseType: 'blob' 
  });
};

export default API;