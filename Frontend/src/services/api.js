import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Debug logging for all requests
    console.log('🚀 Making API request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data
    });
    
    // Check for both regular token and admin token
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔑 Added auth token to request');
    } else {
      console.log('⚠️ No auth token found - proceeding without authentication (AUTH_ENABLED=false)');
    }
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('✅ API response received:', {
      status: response.status,
      url: response.config?.url,
      data: response.data
    });
    return response.data;
  },
  (error) => {
    console.error('❌ API response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      responseData: error.response?.data
    });
    
    if (error.response?.status === 401) {
      // Token expired or invalid - clear both regular and admin tokens
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      
      // Redirect based on current path
      if (window.location.pathname.includes('/admin')) {
        window.location.href = '/admin';
      } else {
        window.location.href = '/login';
      }
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(errorMessage));
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/me'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
  logout: () => api.post('/auth/logout'),
  
  // Admin authentication
  adminRegister: (adminData) => api.post('/auth/admin/register', adminData),
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  adminVerify: () => api.get('/auth/admin/verify'),
};

// Projects API calls
export const projectsAPI = {
  getAll: (params = {}) => api.get('/projects', { params }),
  getById: (id) => api.get(`/projects/${id}`),
  create: (projectData) => api.post('/projects', projectData),
  update: (id, projectData) => api.put(`/projects/${id}`, projectData),
  partialUpdate: (id, projectData) => api.patch(`/projects/${id}`, projectData),
  delete: (id) => api.delete(`/projects/${id}`),
  getStats: () => api.get('/projects/stats/overview'),
};

// Research API calls
export const researchAPI = {
  getAll: (params = {}) => api.get('/research', { params }),
  getById: (id) => api.get(`/research/${id}`),
  create: (researchData) => api.post('/research', researchData),
  update: (id, researchData) => api.put(`/research/${id}`, researchData),
  partialUpdate: (id, researchData) => api.patch(`/research/${id}`, researchData),
  delete: (id) => api.delete(`/research/${id}`),
  getStats: () => api.get('/research/stats/overview'),
  getYearlyStats: () => api.get('/research/stats/yearly'),
};

// Achievements API calls
export const achievementsAPI = {
  getAll: (params = {}) => api.get('/achievements', { params }),
  getById: (id) => api.get(`/achievements/${id}`),
  create: (achievementData) => api.post('/achievements', achievementData),
  update: (id, achievementData) => api.put(`/achievements/${id}`, achievementData),
  partialUpdate: (id, achievementData) => api.patch(`/achievements/${id}`, achievementData),
  delete: (id) => api.delete(`/achievements/${id}`),
  getStats: () => api.get('/achievements/stats/overview'),
  getByCategory: (category) => api.get(`/achievements/category/${category}`),
};

// File upload API calls
export const uploadAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadImages: (files) => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadPDF: (file) => {
    const formData = new FormData();
    formData.append('pdf', file);
    return api.post('/upload/pdf', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteFile: (filename) => api.delete(`/upload/file/${filename}`),
  getFileInfo: (filename) => api.get(`/upload/file/${filename}`),
  listFiles: (type) => api.get(`/upload/files/${type}`),
};

// Utility functions
export const apiUtils = {
  // Build query string from object
  buildQueryString: (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, v));
        } else {
          searchParams.append(key, value);
        }
      }
    });
    return searchParams.toString();
  },

  // Handle API errors consistently
  handleError: (error, defaultMessage = 'An error occurred') => {
    console.error('API Error:', error);
    return error.message || defaultMessage;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Set authentication data
  setAuthData: (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  // Clear authentication data
  clearAuthData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;