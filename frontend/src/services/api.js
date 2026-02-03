import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Transaction APIs
export const transactionAPI = {
  getAll: (params) => api.get('/transactions', { params }),
  getById: (id) => api.get(`/transactions/${id}`),
  create: (data) => api.post('/transactions', data),
  createFromNL: (input) => api.post('/transactions/natural-language', { input }),
  update: (id, data) => api.put(`/transactions/${id}`, data),
  delete: (id) => api.delete(`/transactions/${id}`),
  getStats: (params) => api.get('/transactions/stats', { params })
};

// Category APIs
export const categoryAPI = {
  getAll: () => api.get('/categories')
};

// Budget APIs
export const budgetAPI = {
  getAll: () => api.get('/budgets'),
  create: (data) => api.post('/budgets', data)
};

// Goal APIs
export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (data) => api.post('/goals', data)
};

// AI APIs
export const aiAPI = {
  chat: (question, context) => api.post('/ai/chat', { question, context }),
  getBudgetRecommendations: (monthlyIncome) =>
    api.post('/ai/budget-recommendations', { monthlyIncome }),
  getSpendingAnalysis: (period) => api.get('/ai/spending-analysis', { params: { period } })
};

// Admin APIs
export const adminAPI = {
  // AI Instructions
  getAIInstructions: () => api.get('/admin/ai-instructions'),
  createAIInstruction: (data) => api.post('/admin/ai-instructions', data),
  updateAIInstruction: (id, data) => api.put(`/admin/ai-instructions/${id}`, data),
  deleteAIInstruction: (id) => api.delete(`/admin/ai-instructions/${id}`),

  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSetting: (data) => api.put('/admin/settings', data),

  // Categories
  getCategories: () => api.get('/admin/categories'),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),

  // Category Rules
  getCategoryRules: () => api.get('/admin/category-rules'),
  createCategoryRule: (data) => api.post('/admin/category-rules', data),

  // Budget Templates
  getBudgetTemplates: () => api.get('/admin/budget-templates'),
  createBudgetTemplate: (data) => api.post('/admin/budget-templates', data),

  // AI Prompts
  getAIPrompts: () => api.get('/admin/ai-prompts'),
  createAIPrompt: (data) => api.post('/admin/ai-prompts', data),

  // Users
  getAllUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role`, { role })
};

export default api;
