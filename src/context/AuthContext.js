import React, { createContext, useReducer, useEffect, useContext } from 'react';
import *_authService from '../services/auth/authService'; // Renamed to avoid conflict
import * as _tokenService from '../services/auth/tokenService'; // Renamed
import { injectLogout } from '../services/api/interceptors';
import apiClient from '../services/api/client';

const AuthContext = createContext();

const actionTypes = {
  INITIALIZE: 'INITIALIZE',
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  SIGNUP_START: 'SIGNUP_START', // Similar to LOGIN_START
  SIGNUP_SUCCESS: 'SIGNUP_SUCCESS', // Similar to LOGIN_SUCCESS but might have nuances
  SIGNUP_FAILURE: 'SIGNUP_FAILURE', // Similar to LOGIN_FAILURE
  SET_LOADING: 'SET_LOADING',
};

const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true, // Start with loading true for initial auth check
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.INITIALIZE:
    case actionTypes.LOGIN_SUCCESS:
    case actionTypes.SIGNUP_SUCCESS:
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${action.payload.accessToken}`;
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case actionTypes.LOGIN_START:
    case actionTypes.SIGNUP_START:
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case actionTypes.LOGIN_FAILURE:
    case actionTypes.SIGNUP_FAILURE:
      return {
        ...state,
        isLoading: false,
        error: action.payload.error,
        user: null,
        accessToken: null,
        isAuthenticated: false,
      };
    case actionTypes.LOGOUT:
      delete apiClient.defaults.headers.common['Authorization'];
      return {
        ...initialState,
        isLoading: false, // No longer loading after logout
      };
    case actionTypes.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload.isLoading,
      };
    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Define the actual logout function that will be passed to the interceptor
  // This needs to use dispatch from the current scope.
  const performLogout = async (isInterceptorInitiated = false) => {
    if (!isInterceptorInitiated) { // Avoid calling authService.logout if interceptor already detected critical failure
        try {
            await _authService.logout(); // Calls backend logout, clears tokens via tokenService
        } catch (e) {
            console.error("Error during authService.logout call from AuthProvider:", e);
        }
    } else {
        // If interceptor initiated, means tokens might already be invalid or cleared by it partially
        // Ensure local state is cleared.
        await _tokenService.clearAuthTokens(); // Ensure local tokens are gone
    }
    dispatch({ type: actionTypes.LOGOUT });
  };

  useEffect(() => {
    // Pass the performLogout function to the interceptor
    // This ensures the interceptor uses the logout function tied to this AuthProvider instance's dispatch
    injectLogout(() => performLogout(true));
  }, []); // Empty dependency array ensures this runs once on mount

  // Expose context value: state and dispatch (or specific action methods)
  // For simplicity here, we pass dispatch. The useAuth hook will provide nicer methods.
  return (
    <AuthContext.Provider value={{ ...state, dispatch, performLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to easily access context
// This can be moved to src/hooks/auth/useAuth.js to combine with action logic
const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

export { AuthContext, AuthProvider, useAuthContext, actionTypes };
