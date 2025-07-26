import { API_CONFIG } from '../config/config';
import { ApiErrorClass } from '../types';
import { Platform } from 'react-native';

// Simplified API service without external dependencies for now
class ApiService {
  private baseURL: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseURL = Platform.OS !== 'web' ? API_CONFIG.BASE_URL : 'http://localhost:8000';
  }

  // Set access token for requests
  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Get default headers
  private getHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
    }

    return headers;
  }

  // Generic fetch wrapper
  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiErrorClass(
          errorData.detail || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error;
      }
      // Create serializable error details
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new ApiErrorClass(
        'Network error occurred',
        0,
        { message: errorMessage }
      );
    }
  }

  // Auth endpoints
  async signup(email: string, password: string, name: string) {
    return this.request(API_CONFIG.ENDPOINTS.SIGNUP_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  }

  async login(email: string, password: string) {
    return this.request(API_CONFIG.ENDPOINTS.LOGIN_EMAIL, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async loginWithGoogle(idToken: string) {    
    return this.request(API_CONFIG.ENDPOINTS.LOGIN_GOOGLE, {
      method: 'POST',
      body: JSON.stringify({ id_token: idToken }),
    });
  }

  async refreshToken(refreshToken: string) {
    return this.request(API_CONFIG.ENDPOINTS.REFRESH_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  }

  async verifyToken(accessToken: string) {
    return this.request(API_CONFIG.ENDPOINTS.VERIFY_TOKEN, {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  }

  async requestPasswordReset(email: string) {
    return this.request(API_CONFIG.ENDPOINTS.PASSWORD_RESET_REQUEST, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.request(API_CONFIG.ENDPOINTS.USER_PROFILE);
  }

  async updateUserProfile(updates: Partial<{
    name: string;
    currency: string;
    avatar: string;
  }>) {
    return this.request(API_CONFIG.ENDPOINTS.UPDATE_PROFILE, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  // Groups endpoints
  async getGroups() {
    const response = await this.request(API_CONFIG.ENDPOINTS.GROUPS);
    // Handle potential response formats: array directly or wrapped in a property
    return Array.isArray(response) ? response : response.groups || response;
  }

  async createGroup(name: string, currency: string = 'USD') {
    const response = await this.request(API_CONFIG.ENDPOINTS.GROUPS, {
      method: 'POST',
      body: JSON.stringify({ name, currency }),
    });
    
    // Handle the potential wrapping of response in a 'group' property
    return response.group || response;
  }

  async getGroupDetails(groupId: string) {
    const response = await this.request(API_CONFIG.ENDPOINTS.GROUP_DETAILS(groupId));
    // Handle potential wrapping of response in a 'group' property
    return response.group || response;
  }

  async joinGroup(joinCode: string) {
    const response = await this.request(API_CONFIG.ENDPOINTS.JOIN_GROUP, {
      method: 'POST',
      body: JSON.stringify({ joinCode }),
    });
    
    // Handle the potential wrapping of response in a 'group' property
    return response.group || response;
  }

  // Expenses endpoints
  async getGroupExpenses(groupId: string) {
    const response = await this.request(API_CONFIG.ENDPOINTS.GROUP_EXPENSES(groupId));
    // Handle potential response formats: array directly or wrapped in a property
    return Array.isArray(response) ? response : response.expenses || response;
  }

  async createExpense(groupId: string, expenseData: {
    description: string;
    amount: number;
    category: string;
    date: string;
    payers: Array<{ userId: string; amount: number }>;
    splits: Array<{ userId: string; amount: number }>;
  }) {
    const response = await this.request(API_CONFIG.ENDPOINTS.GROUP_EXPENSES(groupId), {
      method: 'POST',
      body: JSON.stringify(expenseData),
    });
    
    // Handle the potential wrapping of response in an 'expense' property
    return response.expense || response;
  }

  // Clear tokens (simplified without SecureStore for now)
  async clearTokens() {
    this.accessToken = null;
    // TODO: Clear from SecureStore when dependencies are available
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
