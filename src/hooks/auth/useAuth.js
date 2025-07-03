import { useCallback } from 'react';
import { useAuthContext, actionTypes } from '../../context/AuthContext';
import authService from '../../services/auth/authService'; // Default import
import * as tokenService from '../../services/auth/tokenService';
import apiClient from '../../services/api/client';


export const useAuth = () => {
  const { user, accessToken, isAuthenticated, isLoading, error, dispatch, performLogout: contextPerformLogout } = useAuthContext();

  const initializeAuth = useCallback(async () => {
    dispatch({ type: actionTypes.SET_LOADING, payload: { isLoading: true } });
    try {
      const storedRefreshToken = await tokenService.getRefreshToken();
      if (storedRefreshToken) {
        // Attempt to get a new access token using the refresh token
        // This logic might be better suited inside authService.refreshToken if it becomes complex
        // For now, direct call:
        console.log("Found refresh token, attempting to refresh session...");
        const refreshResponse = await apiClient.post('/auth/refresh', { refresh_token: storedRefreshToken });
        const { access_token: newAccessToken, refresh_token: newRefreshToken, user: userData } = refreshResponse.data;

        if (!newAccessToken || !userData) {
            throw new Error("Refresh response missing token or user data.");
        }

        await tokenService.storeRefreshToken(newRefreshToken || storedRefreshToken);
        // Dispatch login success with the new access token and user data
        dispatch({
          type: actionTypes.LOGIN_SUCCESS,
          payload: { user: userData, accessToken: newAccessToken },
        });
        console.log("Session refreshed successfully on init.");
        return true;
      } else {
        console.log("No refresh token found on init.");
        dispatch({ type: actionTypes.LOGOUT }); // Ensure clean state if no token
        return false;
      }
    } catch (e) {
      console.error('Failed to initialize auth or refresh token:', e.message);
      // If refresh fails, treat as logout
      await contextPerformLogout(true); // Use context's logout which handles service call and dispatch
      return false;
    } finally {
      // dispatch({ type: actionTypes.SET_LOADING, payload: { isLoading: false } });
      //isLoading is set to false by LOGIN_SUCCESS or LOGOUT
    }
  }, [dispatch, contextPerformLogout]);

  const login = async (email, password) => {
    dispatch({ type: actionTypes.LOGIN_START });
    try {
      const { accessToken: newAccessToken, user: userData } = await authService.login(email, password);
      dispatch({
        type: actionTypes.LOGIN_SUCCESS,
        payload: { user: userData, accessToken: newAccessToken },
      });
    } catch (e) {
      dispatch({ type: actionTypes.LOGIN_FAILURE, payload: { error: e } });
      // Error is now in context state, UI can pick it up.
    }
  };

  const signup = async (name, email, password) => {
    dispatch({ type: actionTypes.SIGNUP_START });
    try {
      // authService.signup internally calls processAuthResponse which sets the apiClient header
      const { accessToken: newAccessToken, user: userData } = await authService.signup(name, email, password);
      dispatch({
        type: actionTypes.SIGNUP_SUCCESS, // Similar to LOGIN_SUCCESS
        payload: { user: userData, accessToken: newAccessToken },
      });
    } catch (e) {
      dispatch({ type: actionTypes.SIGNUP_FAILURE, payload: { error: e } });
    }
  };

  const logout = async () => {
    // Use the performLogout from context which is already set up to call authService.logout
    // and dispatch the LOGOUT action.
    await contextPerformLogout(false);
  };

  return {
    user,
    accessToken,
    isAuthenticated,
    isLoading,
    error,
    initializeAuth,
    login,
    signup,
    logout,
  };
};
