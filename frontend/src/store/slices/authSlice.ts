import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { apiService } from '../../services/apiService';
import {
    ApiErrorClass,
    AuthResponse,
    AuthState,
    LoginRequest,
    SignupRequest,
    User
} from '../../types';

// Secure storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
};

// Initial state
const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  user: null,
  accessToken: null,
  refreshToken: null,
};

// Async thunks
export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      
      // Store tokens securely
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      // Set token in API service
      apiService.setAccessToken(response.access_token);
      
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details,
        });
      }
      return rejectWithValue({
        message: 'Login failed. Please try again.',
        status: 0,
      });
    }
  }
);

export const signupUser = createAsyncThunk<AuthResponse, SignupRequest>(
  'auth/signupUser',
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(email, password, name);
      
      // Store tokens securely
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      // Set token in API service
      apiService.setAccessToken(response.access_token);
      
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details,
        });
      }
      return rejectWithValue({
        message: 'Signup failed. Please try again.',
        status: 0,
      });
    }
  }
);

export const loginWithGoogle = createAsyncThunk<AuthResponse, string>(
  'auth/loginWithGoogle',
  async (idToken, { rejectWithValue }) => {
    try {
      const response = await apiService.loginWithGoogle(idToken);
      
      // Store tokens securely
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
      await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
      
      // Set token in API service
      apiService.setAccessToken(response.access_token);
      
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({
          message: error.message,
          status: error.status,
          details: error.details,
        });
      }
      return rejectWithValue({
        message: 'Google login failed. Please try again.',
        status: 0,
      });
    }
  }
);

export const refreshAccessToken = createAsyncThunk<string, void>(
  'auth/refreshAccessToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await apiService.refreshToken(auth.refreshToken);
      
      // Store new access token
      await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      apiService.setAccessToken(response.access_token);
      
      return response.access_token;
    } catch (error) {
      // Clear all tokens if refresh fails
      await SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);
      apiService.setAccessToken(null);
      
      return rejectWithValue('Session expired. Please login again.');
    }
  }
);

export const loadStoredAuth = createAsyncThunk<AuthResponse | null, void>(
  'auth/loadStoredAuth',
  async (_, { rejectWithValue }) => {
    try {
      const [accessToken, refreshToken, userData] = await Promise.all([
        SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA),
      ]);
      
      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData);
        
        // Verify token is still valid
        try {
          await apiService.verifyToken(accessToken);
          apiService.setAccessToken(accessToken);
          
          return {
            access_token: accessToken,
            refresh_token: refreshToken,
            user,
          };
        } catch (error) {
          // Token invalid, try to refresh
          try {
            const refreshResponse = await apiService.refreshToken(refreshToken);
            await SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, refreshResponse.access_token);
            apiService.setAccessToken(refreshResponse.access_token);
            
            return {
              access_token: refreshResponse.access_token,
              refresh_token: refreshToken,
              user,
            };
          } catch (refreshError) {
            // Both tokens invalid, clear storage
            await Promise.all([
              SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
              SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
              SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
            ]);
            return null;
          }
        }
      }
      
      return null;
    } catch (error) {
      return rejectWithValue('Failed to load stored authentication');
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  'auth/logoutUser',
  async () => {
    // Clear all stored tokens
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
    ]);
    
    // Clear token from API service
    apiService.setAccessToken(null);
  }
);

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthError: (state) => {
      // Can be used to clear any auth errors if needed
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        // Update stored user data
        SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Signup user
    builder
      .addCase(signupUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(signupUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Google login
    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
      })
      .addCase(loginWithGoogle.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Refresh token
    builder
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Load stored auth
    builder
      .addCase(loadStoredAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadStoredAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.accessToken = action.payload.access_token;
          state.refreshToken = action.payload.refresh_token;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });

    // Logout user
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
      });
  },
});

export const { clearAuthError, updateUser } = authSlice.actions;
export default authSlice.reducer;
