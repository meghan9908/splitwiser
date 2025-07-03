import apiClient from '../api/client';
import * as tokenService from './tokenService';

// Helper function to process successful authentication response
const processAuthResponse = async (response) => {
  const { access_token, refresh_token, user } = response.data;

  if (!access_token || !user) {
    throw new Error('Authentication response missing access_token or user data.');
  }

  // Store refresh token securely
  if (refresh_token) {
    await tokenService.storeRefreshToken(refresh_token);
  }

  // Set the authorization header for subsequent API calls
  apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

  // Return what AuthContext/useAuth might need: accessToken and user object
  return { accessToken: access_token, user };
};

export const signup = async (name, email, password) => {
  try {
    const response = await apiClient.post('/auth/signup/email', { name, email, password });
    // Assuming signup also returns tokens and user data like login
    return await processAuthResponse(response);
  } catch (error) {
    console.error('AuthService Signup Error:', error.response ? error.response.data : error.message);
    // Clear any potentially partially stored tokens if signup fails mid-process (though processAuthResponse is after successful API call)
    await tokenService.clearAuthTokens();
    delete apiClient.defaults.headers.common['Authorization'];
    throw error.response ? error.response.data : new Error('Signup failed');
  }
};

export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login/email', { email, password });
    return await processAuthResponse(response);
  } catch (error) {
    console.error('AuthService Login Error:', error.response ? error.response.data : error.message);
    await tokenService.clearAuthTokens();
    delete apiClient.defaults.headers.common['Authorization'];
    throw error.response ? error.response.data : new Error('Login failed');
  }
};

export const logout = async () => {
  try {
    // Optional: Call a backend logout endpoint if available
    // const refreshToken = await tokenService.getRefreshToken();
    // if (refreshToken) {
    //   await apiClient.post('/auth/logout', { refresh_token: refreshToken });
    // }
    console.log('User logged out from authService.');
  } catch (error) {
    console.error('AuthService Logout API call failed:', error.response ? error.response.data : error.message);
    // Still proceed with local token clearing
  } finally {
    // Clear tokens from storage and remove auth header
    await tokenService.clearAuthTokens();
    delete apiClient.defaults.headers.common['Authorization'];
  }
};

// Placeholder for refreshToken function if needed directly by authService
// export const refreshToken = async () => {
//   const currentRefreshToken = await tokenService.getRefreshToken();
//   if (!currentRefreshToken) {
//     throw new Error('No refresh token available.');
//   }
//   try {
//     const response = await apiClient.post('/auth/refresh', { refresh_token: currentRefreshToken });
//     // This response might also include user data, handle accordingly
//     const { access_token, refresh_token: newRefreshToken } = response.data;
//     await tokenService.storeRefreshToken(newRefreshToken || currentRefreshToken);
//     apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
//     return { accessToken: access_token };
//   } catch (error) {
//     console.error('AuthService Refresh Token Error:', error.response ? error.response.data : error.message);
//     // On refresh failure, usually trigger a full logout
//     await logout(); // This will clear tokens and auth header
//     throw error.response ? error.response.data : new Error('Token refresh failed');
//   }
// };

// Note: The interceptor in src/services/api/interceptors.js already handles token refresh.
// The above refreshToken function would be if some other part of the app needed to trigger it manually AND
// the interceptor's automatic refresh wasn't sufficient or desired for that specific case.
// Generally, the interceptor should be the primary mechanism for refreshing tokens.
// The logout on refresh failure is currently handled by globalLogoutCallback in interceptor.
// If authService.logout() is more robust, interceptor could call that.

export default {
  signup,
  login,
  logout,
  // refreshToken, // if exposing it
};
