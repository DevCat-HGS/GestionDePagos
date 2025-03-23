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
      const token = JSON.parse(userInfo).token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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

// Event report services
export const generateEventExcelReport = (filters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status) params.append('status', filters.status);
  
  return API.get('/events/report', { 
    params,
    responseType: 'blob' 
  });
};