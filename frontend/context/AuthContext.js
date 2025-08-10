// AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import {
  GoogleAuthProvider,
  signInWithCredential,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { auth } from './../firebase/firebaseConfig';
import * as authApi from '../api/auth';
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [idToken, setIdToken] = useState(null);

  // Configure Google Sign-In on component mount
  useEffect(() => {
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        offlineAccess: true,
      });
  }, []);


  // Load token and user data from AsyncStorage on app start
  useEffect(() => {
    const loadStoredAuth = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('auth_token');
        const storedUser = await AsyncStorage.getItem('user_data');
        const storedIdToken = await AsyncStorage.getItem('firebase_id_token');
        const storedFirebaseUser = await AsyncStorage.getItem('firebase_user');

        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }

        if (storedIdToken && storedFirebaseUser) {
          setIdToken(storedIdToken);
          setFirebaseUser(JSON.parse(storedFirebaseUser));
        }
      } catch (error) {
        console.error('Failed to load stored authentication:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredAuth();
  }, []);

  // Save token to AsyncStorage whenever it changes
  useEffect(() => {
    const saveToken = async () => {
      try {
        if (token) {
          await AsyncStorage.setItem('auth_token', token);
        } else {
          await AsyncStorage.removeItem('auth_token');
        }
      } catch (error) {
        console.error('Failed to save token to storage:', error);
      }
    };

    saveToken();
  }, [token]);

  // Save user data to AsyncStorage whenever it changes
  useEffect(() => {
    const saveUser = async () => {
      try {
        if (user) {
          await AsyncStorage.setItem('user_data', JSON.stringify(user));
        } else {
          await AsyncStorage.removeItem('user_data');
        }
      } catch (error) {
        console.error('Failed to save user data to storage:', error);
      }
    };

    saveUser();
  }, [user]);

  // Save Firebase data to AsyncStorage
  useEffect(() => {
    const saveFirebaseData = async () => {
      try {
        if (idToken) {
          await AsyncStorage.setItem('firebase_id_token', idToken);
        } else {
          await AsyncStorage.removeItem('firebase_id_token');
        }

        if (firebaseUser) {
          await AsyncStorage.setItem('firebase_user', JSON.stringify(firebaseUser));
        } else {
          await AsyncStorage.removeItem('firebase_user');
        }
      } catch (error) {
        console.error('Failed to save Firebase data to storage:', error);
      }
    };

    saveFirebaseData();
  }, [idToken, firebaseUser]);

  // Regular email/password login
  const login = async (email, password) => {
    try {

      const response = await authApi.login(email, password);

      const { access_token, user: userData } = response.data;
      setToken(access_token);
      setUser(userData);
      return true;
    } catch (error) {
      console.error('Login failed:', error.response?.data?.detail || error.message);
      return false;
    }
  };

  // Regular email/password signup
  const signup = async (name, email, password) => {
    try {
      await authApi.signup(name, email, password);
      return true;
    } catch (error) {
      console.error('Signup failed:', error.response?.data?.detail || error.message);
      return false;
    }
  };

  // Google Sign-In
  const signInWithGoogle = async () => {
    try {
      if (Platform.OS === 'web') {
        // ---- WEB FLOW ----
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);

        const firebaseIdToken = await result.user.getIdToken(true);
        console.log('Google ID Token:', result);
        setFirebaseUser(result.user);
        setIdToken(firebaseIdToken);

        // You can send this token to your backend for verification and user creation
        const backendResponse = await authApi.signInWithGoogle(firebaseIdToken);
        setToken(backendResponse.data.access_token);
        setUser(backendResponse.data.user);

        console.log('Google sign-in success (web)');
        return { idToken: firebaseIdToken, firebaseUser: result.user };
      } else {
        // ---- NATIVE FLOW ----
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

        const userInfo = await GoogleSignin.signIn();

        if (!userInfo?.data?.idToken) throw new Error('No Google ID token returned');

        const credential = GoogleAuthProvider.credential(userInfo.data.idToken);
        const userCredential = await signInWithCredential(auth, credential);

        const firebaseIdToken = await userCredential.user.getIdToken(true);
        setFirebaseUser(userCredential.user);
        setIdToken(firebaseIdToken);

        // You can send this token to your backend for verification and user creation
        // const backendResponse = await authApi.googleLogin(firebaseIdToken);
        // setToken(backendResponse.data.access_token);
        // setUser(backendResponse.data.user);

        console.log('Google sign-in success');
        const backendResponse = await authApi.signInWithGoogle(firebaseIdToken);
        setToken(backendResponse.data.access_token);
        setUser(backendResponse.data.user);
        console.log('Firebase ID Token:', firebaseIdToken, userCredential.user);
        return { idToken: firebaseIdToken, firebaseUser: userCredential.user };
      }
    } catch (error) {
      console.error('Google Sign-In error:', error);
      throw error;
    }
  };

  // Unified logout function
  const logout = async () => {
    try {
      // Clear stored authentication data
      await AsyncStorage.removeItem('auth_token');
      await AsyncStorage.removeItem('user_data');
      await AsyncStorage.removeItem('firebase_id_token');
      await AsyncStorage.removeItem('firebase_user');

      // Sign out from Google/Firebase if applicable
      if (firebaseUser) {
        if (Platform.OS === 'web') {
          await auth.signOut();
        } else {
          await GoogleSignin.signOut();
          await auth.signOut();
        }
      }
    } catch (error) {
      console.error('Failed to clear stored authentication:', error);
    }

    // Clear all state
    setToken(null);
    setUser(null);
    setFirebaseUser(null);
    setIdToken(null);
  };

  const updateUserInContext = (updatedUser) => {
    setUser(updatedUser);
  };

  // Helper function to check if user is authenticated (either way)
  const isAuthenticated = () => {
    return !!(token || idToken);
  };

  // Helper function to get current auth method
  const getAuthMethod = () => {
    if (token && user) return 'email';
    if (idToken && firebaseUser) return 'google';
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        // Original auth state
        user,
        token,
        isLoading,
        
        // Google auth state
        firebaseUser,
        idToken,
        
        // Auth methods
        login,
        signup,
        signInWithGoogle,
        logout,
        updateUserInContext,
        
        // Helper methods
        isAuthenticated,
        getAuthMethod,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};