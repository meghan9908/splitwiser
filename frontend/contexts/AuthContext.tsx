import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import React, { createContext, useContext, useEffect, useState } from 'react';

const API_URL = 'https://splitwiser-production.up.railway.app'; // Use production API

// Define the shape of our authentication context
type AuthContextType = {
  isAuthenticated: boolean;
  user: any;
  accessToken: string | null;
  refreshToken: string | null;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (userData: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
  loading: boolean;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Authentication provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Set up axios with interceptors for authentication
  useEffect(() => {
    // Configure axios defaults
    axios.defaults.baseURL = API_URL;

    // Set up request interceptor
    const requestInterceptor = axios.interceptors.request.use(
      (config: any) => {
        if (accessToken) {
          config.headers.Authorization = `Bearer ${accessToken}`;
        }
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Set up response interceptor for token refresh
    const responseInterceptor = axios.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        console.error('Authentication error:', error);
        return Promise.reject(error);
      }
    );

    // Check for existing session on app load
    const loadTokens = async () => {
      try {
        // Get refresh token from secure storage
        const storedRefreshToken = await SecureStore.getItemAsync('refreshToken');
        
        if (storedRefreshToken) {
          // Try to get a new access token
          const response = await axios.post('/auth/refresh', { refresh_token: storedRefreshToken });
          
          // Set authentication state
          setAccessToken(response.data.access_token);
          setRefreshToken(response.data.refresh_token || storedRefreshToken);
          setUser(response.data.user);
          setIsAuthenticated(true);
          
          // Update storage if we got a new refresh token
          if (response.data.refresh_token) {
            await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
          }
        }
      } catch (error) {
        // Clear any invalid tokens and log the error
        console.error('Token loading failed:', error);
        try {
          await SecureStore.deleteItemAsync('refreshToken');
        } catch (deleteError) {
          console.error('Error deleting token:', deleteError);
        }
      } finally {
        setLoading(false);
      }
    };

    loadTokens();

    // Cleanup interceptors on unmount
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Email/Password login
  const login = async (credentials: { email: string; password: string }) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login/email', credentials);
      
      // Store tokens and user data
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Save refresh token securely
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Email/Password signup
  const signup = async (userData: { email: string; password: string; name: string }) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/signup/email', userData);
      
      // Store tokens and user data
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
      setUser(response.data.user);
      setIsAuthenticated(true);
      
      // Save refresh token securely
      await SecureStore.setItemAsync('refreshToken', response.data.refresh_token);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Clear auth state
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear secure storage
      await SecureStore.deleteItemAsync('refreshToken');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Provide auth context to children
  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        accessToken,
        refreshToken,
        login,
        signup,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
