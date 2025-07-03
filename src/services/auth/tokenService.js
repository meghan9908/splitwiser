import * as SecureStore from 'expo-secure-store';

export const REFRESH_TOKEN_KEY = 'splitwiser_refreshToken';
export const ACCESS_TOKEN_KEY = 'splitwiser_accessToken'; // Mostly for consistency, as access token often in memory

export const storeRefreshToken = async (refreshToken) => {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Error storing refresh token in SecureStore', error);
    // Potentially throw the error or handle it as per app's error strategy
    throw error;
  }
};

export const getRefreshToken = async () => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error getting refresh token from SecureStore', error);
    // Potentially throw or return null
    return null;
  }
};

export const removeRefreshToken = async () => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Error removing refresh token from SecureStore', error);
    // Potentially throw or handle
  }
};

// Example functions if access token were also managed by SecureStore (generally not recommended for web security model)
// export const storeAccessToken = async (accessToken) => {
//   try {
//     await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
//   } catch (error) {
//     console.error('Error storing access token', error);
//   }
// };

// export const getAccessToken = async () => {
//   try {
//     return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
//   } catch (error) {
//     console.error('Error getting access token', error);
//     return null;
//   }
// };

// export const removeAccessToken = async () => {
//   try {
//     await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
//   } catch (error) {
//     console.error('Error removing access token', error);
//   }
// };

// Clear all auth tokens (useful for logout)
export const clearAuthTokens = async () => {
  try {
    await removeRefreshToken();
    // if (managingAccessTokenInSecureStore) await removeAccessToken();
    console.log('Auth tokens cleared from SecureStore.');
  } catch (error) {
    console.error('Error clearing auth tokens from SecureStore', error);
  }
};

// Note: The interceptor (src/services/api/interceptors.js) currently hardcodes REFRESH_TOKEN_KEY.
// It should ideally import it from this tokenService to ensure consistency.
// This will be addressed when refactoring AuthContext/useAuth, which will coordinate these services.
