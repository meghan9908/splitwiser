// API Configuration
const isDevelopment = true; // Set this based on your environment

export const API_CONFIG = {
  BASE_URL: isDevelopment 
    ? 'http://localhost:8000' // Development - adjust IP for physical device
    : 'https://your-production-api.com', // Production
  TIMEOUT: 10000,
  ENDPOINTS: {
    // Auth endpoints
    SIGNUP_EMAIL: '/auth/signup/email',
    LOGIN_EMAIL: '/auth/login/email',
    LOGIN_GOOGLE: '/auth/login/google',
    REFRESH_TOKEN: '/auth/refresh',
    VERIFY_TOKEN: '/auth/token/verify',
    PASSWORD_RESET_REQUEST: '/auth/password/reset/request',
    PASSWORD_RESET_CONFIRM: '/auth/password/reset/confirm',
    
    // User endpoints
    USER_PROFILE: '/users/me',
    UPDATE_PROFILE: '/users/me',
    DELETE_ACCOUNT: '/users/me',
    
    // Groups endpoints
    GROUPS: '/groups',
    GROUP_DETAILS: (id: string) => `/groups/${id}`,
    JOIN_GROUP: '/groups/join',
    GROUP_MEMBERS: (id: string) => `/groups/${id}/members`,
    
    // Expenses endpoints
    GROUP_EXPENSES: (groupId: string) => `/groups/${groupId}/expenses`,
    EXPENSE_DETAILS: (groupId: string, expenseId: string) => `/groups/${groupId}/expenses/${expenseId}`,
    
    // Settlement endpoints
    GROUP_SETTLEMENTS: (groupId: string) => `/groups/${groupId}/settlements`,
    OPTIMIZE_SETTLEMENTS: (groupId: string) => `/groups/${groupId}/settlements/optimize`,
  }
};

// App Configuration
export const APP_CONFIG = {
  APP_NAME: 'SplitWiser',
  VERSION: '1.0.0',
  SUPPORTED_CURRENCIES: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
  DEFAULT_CURRENCY: 'USD',
  
  // Authentication
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes before expiry
  MAX_LOGIN_ATTEMPTS: 5,
  
  // UI Configuration
  BOTTOM_TAB_HEIGHT: 80,
  HEADER_HEIGHT: 56,
  
  // Expense Categories
  EXPENSE_CATEGORIES: [
    { id: 'food', name: 'Food & Dining', icon: '🍽️' },
    { id: 'transportation', name: 'Transportation', icon: '🚗' },
    { id: 'housing', name: 'Housing', icon: '🏠' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'healthcare', name: 'Healthcare', icon: '💊' },
    { id: 'travel', name: 'Travel', icon: '✈️' },
    { id: 'utilities', name: 'Utilities', icon: '📱' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'gifts', name: 'Gifts', icon: '🎁' },
    { id: 'other', name: 'Other', icon: '🔧' },
  ],
};

export default { API_CONFIG, APP_CONFIG };
