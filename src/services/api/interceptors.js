import axios from 'axios'; // For the refresh call if not using apiClient for it
import * as SecureStore from 'expo-secure-store';
import apiClient, { API_URL } from './client'; // Import apiClient and API_URL
import { REFRESH_TOKEN_KEY } from '../auth/tokenService'; // Import key from tokenService

let isRefreshing = false;
let failedQueue = [];

// Placeholder for a logout function to be injected by AuthContext/useAuth
let globalLogoutCallback = () => {
  console.error("Logout callback not initialized in interceptor. User may not be logged out on token refresh failure.");
};

export const injectLogout = (logoutCallback) => {
  globalLogoutCallback = logoutCallback;
};


const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Check if the error is relevant for token refresh
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return apiClient(originalRequest); // Use apiClient for the retry
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
        if (!refreshToken) {
          console.log('No refresh token found, cannot refresh session.');
          processQueue(error, null);
          isRefreshing = false;
          globalLogoutCallback(); // Attempt to logout
          return Promise.reject(error);
        }

        // Use a new axios instance or the global one for the refresh token request
        // to avoid circular dependency if apiClient itself is failing.
        const refreshResponse = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });

        const { access_token: newAccessToken, refresh_token: newRefreshToken } = refreshResponse.data;

        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken || refreshToken); // Store new or old if not rotated
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return apiClient(originalRequest); // Retry original request with new token
      } catch (refreshError) {
        console.error('Token refresh error:', refreshError.response ? refreshError.response.data : refreshError.message);
        processQueue(refreshError, null);
        globalLogoutCallback(); // Attempt to logout as refresh failed
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// Export something to ensure the module runs and attaches the interceptor.
// Or this file can just be imported once in client.js or App.js.
export const setupInterceptors = () => {
  // This function can be called once to ensure interceptors are attached.
  // console.log("API interceptors set up.");
};
