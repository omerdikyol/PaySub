export const API_URL = __DEV__ 
  ? 'http://10.0.2.2:3000/api' // Android Emulator
  : 'https://your-production-api-url.com/api';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
  },
  EXPENSES: {
    BASE: '/expenses',
    PAYMENT: (id: string) => `/expenses/${id}/payment`,
  },
  INCOMES: {
    BASE: '/incomes',
  },
  SERVICES: {
    BASE: '/services',
    CATEGORIES: '/services/categories',
    SEARCH: '/services/search',
    BY_CATEGORY: (categoryId: string) => `/services/category/${categoryId}`,
  },
}; 