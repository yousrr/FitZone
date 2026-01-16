import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

console.log('VITE_API_BASE_URL =', import.meta.env.VITE_API_BASE_URL);
console.log('API_BASE_URL used =', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});


// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Public endpoints
export const getPlans = () => api.get('/api/public/plans');
export const getCategories = () => api.get('/api/public/categories');
export const createVisit = (data: {
  fullName: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  message?: string;
}) => api.post('/api/visits', data);

// Contract code
export const validateContractCode = (contractCode: string) =>
  api.post('/api/contract-codes/validate', { contractCode });

// Auth endpoints
export const signup = (data: {
  contractCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  trainingFrequency: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => api.post('/api/auth/signup', data);

export const login = (email: string, password: string) =>
  api.post('/api/auth/login', { email, password });

export const getMe = () => api.get('/api/auth/me');

// Member endpoints
export const getSchedule = (params?: { dayOfWeek?: string; category?: string }) =>
  api.get('/api/member/schedule', { params });

export default api;
