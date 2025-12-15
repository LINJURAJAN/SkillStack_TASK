import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // This is important for session authentication
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use(
  (config) => {
    // Get CSRF token from cookie if it exists
    const csrfToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('csrftoken='))
      ?.split('=')[1];
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle authentication errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401/403 errors by redirecting to login
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Remove user from localStorage
      localStorage.removeItem('user');
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// User API
export const registerUser = (data) => api.post('/users/register/', data);
export const loginUser = (data) => api.post('/users/login/', data);
export const logoutUser = () => api.post('/users/logout/');
export const getUserProfile = () => api.get('/users/profile/');

// Skills API
export const getAllSkills = () => api.get('/skills/');
export const getSkill = (id) => api.get(`/skills/${id}/`);
export const createSkill = (data) => api.post('/skills/', data);
export const updateSkill = (id, data) => api.put(`/skills/${id}/`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}/`);
export const getSkillRecommendations = (id) => api.get(`/skills/${id}/recommend_resources/`);

// Resources API
export const getAllResources = () => api.get('/resources/');
export const getResource = (id) => api.get(`/resources/${id}/`);
export const createResource = (data) => api.post('/resources/', data);
export const updateResource = (id, data) => api.put(`/resources/${id}/`, data);
export const deleteResource = (id) => api.delete(`/resources/${id}/`);
export const startLearningResource = (id) => api.post(`/resources/${id}/start_learning/`);
export const markResourceComplete = (id) => api.post(`/resources/${id}/mark_complete/`);
export const getResourceRecommendations = () => api.get('/resources/recommend/');

// Progress API
export const getProgressItems = () => api.get('/progress/');
export const getProgress = (id) => api.get(`/progress/${id}/`);
export const updateProgress = (id, data) => api.patch(`/progress/${id}/`, data);
export const getWeeklySummary = () => api.get('/progress/weekly_summary/');

// Categories API
export const getAllCategories = () => api.get('/categories/');
export const getCategory = (id) => api.get(`/categories/${id}/`);
export const createCategory = (data) => api.post('/categories/', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}/`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}/`);

// Dashboard API
export const getDashboardStats = () => api.get('/dashboard/stats/');
export const getSkillsBreakdown = () => api.get('/dashboard/skills_breakdown/');
export const getDashboardRecommendations = () => api.get('/dashboard/recommendations/');

// Certifications API
export const getAllCertifications = () => api.get('/certifications/');
export const getCertification = (id) => api.get(`/certifications/${id}/`);
export const createCertification = (data) => api.post('/certifications/', data);
export const updateCertification = (id, data) => api.put(`/certifications/${id}/`, data);
export const deleteCertification = (id) => api.delete(`/certifications/${id}/`);

export default api;