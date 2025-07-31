//authSlice.ts
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import { signOut, getAuth, onAuthStateChanged } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from "../../services/apiService";
import {
  ApiErrorClass,
  AuthResponse,
  AuthState,
  LoginRequest,
  SignupRequest,
  User,
  FirebaseUser,
} from "../../types";
import { auth } from "../../config/firebaseConfig";
import { Platform } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  USER_DATA: "user_data",
  FIREBASE_USER: "firebase_user",
};

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: true,
  user: null,
  accessToken: null,
  refreshToken: null,
  firebaseUser: null,
  hasCompletedOnboarding: false,
  isnewUser: false, // Track if the user is new
};
const setItem = async (key: string, value: string) => {
  if (Platform.OS === 'web') {
    AsyncStorage.setItem(key, value);
    return;
  }
  return SecureStore.setItemAsync(key, value);
};
const getItem = async (key: string): Promise<string | null> => {
  if (Platform.OS === 'web') {
    return AsyncStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
};
const deleteItem = async (key: string) => {
  if (Platform.OS === 'web') {
    await AsyncStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
};

// ---- Thunks ---- //
export const loginUser = createAsyncThunk<AuthResponse, LoginRequest>(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await apiService.login(email, password);
      try{
        console.log("Login response:", response);
        await setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
        await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));
        console.log("User data saved:", STORAGE_KEYS.USER_DATA);
        apiService.setAccessToken(response.access_token);

        return response;
      } catch (e) {
        console.error("Error during login:", e);
        return rejectWithValue({ message: "Login failed. Please try again.", status: 0 });
      }
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({ message: error.message, status: error.status, details: error.details });
      }
      return rejectWithValue({ message: "Login failed. Please try again.", status: 0 });
    }
  }
);

export const signupUser = createAsyncThunk<AuthResponse, SignupRequest>(
  "auth/signupUser",
  async ({ email, password, name }, { rejectWithValue }) => {
    try {
      const response = await apiService.signup(email, password, name);
      try{
        await setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
        await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);
        await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(response.user));

        apiService.setAccessToken(response.access_token);
      } catch (e) {
        console.error("Error during signup:", e);
        return rejectWithValue({ message: "Signup failed. Please try again.", status: 0 });
      }

      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return rejectWithValue({ message: error.message, status: error.status, details: error.details });
      }
      return rejectWithValue({ message: "Signup failed. Please try again.", status: 0 });
    }
  }
);

export const loginWithGoogle = createAsyncThunk<
  AuthResponse,
  { idToken: string; firebaseUser: FirebaseUser | null }
>("auth/loginWithGoogle", async ({ idToken, firebaseUser }, { rejectWithValue }) => {
  try {
    // Call backend API directly with Google/Firebase ID token
    const response = await apiService.loginWithGoogle(idToken);
    const newUser = response.new_user; // Check if the user is new
    // Save tokens locally
    await setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, response.refresh_token);

    // Save user data
    const userData = response.user ?? {
      id: firebaseUser?.uid ?? "",
      name: firebaseUser?.displayName ?? "",
      email: firebaseUser?.email ?? "",
      photo: firebaseUser?.photoURL ?? "",
    };
    await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));

    // Save FirebaseUser separately if required
    if (firebaseUser) {
      await setItem(STORAGE_KEYS.FIREBASE_USER, JSON.stringify(firebaseUser));
    }

    apiService.setAccessToken(response.access_token);

    return {
      ...response,
      firebaseUser,
      user: userData,
      isNewUser: newUser, // Pass new user status
    };
  } catch (error) {
    console.error("Error during Google login:", error);
    return rejectWithValue({ message: "Google login failed. Please try again.", status: 0 });
  }
});



export const refreshAccessToken = createAsyncThunk<string, void>(
  "auth/refreshAccessToken",
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth: authState } = getState() as { auth: AuthState };
      if (!authState.refreshToken) throw new Error("No refresh token available");

      const response = await apiService.refreshToken(authState.refreshToken);

      await setItem(STORAGE_KEYS.ACCESS_TOKEN, response.access_token);
      apiService.setAccessToken(response.access_token);
      return response.access_token;
    } catch {
      await Promise.all([
        deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
        deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
        deleteItem(STORAGE_KEYS.USER_DATA),
        deleteItem(STORAGE_KEYS.FIREBASE_USER),
      ]);

      apiService.setAccessToken(null);
      try {
        await signOut(auth);
      } catch (e) {
        console.error("Error signing out during token refresh:", e);
      }
      return rejectWithValue("Session expired. Please login again.");
    }
  }
);

export const loadStoredAuth = createAsyncThunk<AuthResponse | null, void>(
  "auth/loadStoredAuth",
  async (_, { rejectWithValue }) => {
    try {
      const [accessToken, refreshToken, userData, firebaseUserData] = await Promise.all([
        getItem(STORAGE_KEYS.ACCESS_TOKEN),
        getItem(STORAGE_KEYS.REFRESH_TOKEN),
        getItem(STORAGE_KEYS.USER_DATA),
        getItem(STORAGE_KEYS.FIREBASE_USER),
      ]);

      if (accessToken && refreshToken && userData) {
        const user = JSON.parse(userData);
        const firebaseUser = firebaseUserData ? JSON.parse(firebaseUserData) : null;

        try {
          await apiService.verifyToken(accessToken);
          apiService.setAccessToken(accessToken);
          return { access_token: accessToken, refresh_token: refreshToken, user, firebaseUser };
        } catch {
          const refreshResponse = await apiService.refreshToken(refreshToken);
          await setItem(STORAGE_KEYS.ACCESS_TOKEN, refreshResponse.access_token);
          apiService.setAccessToken(refreshResponse.access_token);
          return {
            access_token: refreshResponse.access_token,
            refresh_token: refreshToken,
            user,
            firebaseUser,
          };
        }
      }
      return null;
    } catch {
      return rejectWithValue("Failed to load stored authentication");
    }
  }
);

export const logoutUser = createAsyncThunk<void, void>(
  "auth/logoutUser",
  async () => {
    try {
      await Promise.all([
        deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
        deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
        deleteItem(STORAGE_KEYS.USER_DATA),
        deleteItem(STORAGE_KEYS.FIREBASE_USER),
      ]);

      apiService.setAccessToken(null);
      await signOut(auth); // Firebase sign-out (works on web and native)
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
);

export const initializeFirebaseAuthListener = createAsyncThunk<void, void>(
  "auth/initializeFirebaseAuthListener",
  async () => {
    const firebaseAuth = getAuth();
    onAuthStateChanged(firebaseAuth, async (firebaseUser) => {
      if (firebaseUser) {
        console.log("Firebase user signed in:", firebaseUser.uid);
        await setItem(
          STORAGE_KEYS.FIREBASE_USER,
          JSON.stringify({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          } as FirebaseUser)
        );
      } else {
        console.log("Firebase user signed out");
        await SecureStore.deleteItemAsync(STORAGE_KEYS.FIREBASE_USER);
      }
    });
  }
);

// ---- Slice ---- //
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthError: (state) => {},
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(state.user));
      }
    },
    setFirebaseUser: (state, action: PayloadAction<FirebaseUser | null>) => {
      state.firebaseUser = action.payload;
    },
    completeOnboarding: (state) => {
      state.hasCompletedOnboarding = true;
    },
  },
  extraReducers: (builder) => {
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
        state.hasCompletedOnboarding = true;

      })
      .addCase(loginUser.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.hasCompletedOnboarding = false;
      })
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
      })
      .addCase(loginWithGoogle.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.refreshToken = action.payload.refresh_token;
        state.firebaseUser = action.payload.firebaseUser ?? null;
        state.hasCompletedOnboarding = !action.payload.isNewUser; // Only existing users have completed onboarding
      })
      .addCase(loginWithGoogle.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.firebaseUser = null;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload;
        state.hasCompletedOnboarding = true;

      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.firebaseUser = null;
      })
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
          state.firebaseUser = action.payload.firebaseUser ?? null;
          state.hasCompletedOnboarding = true;
        }
      })
      .addCase(loadStoredAuth.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.firebaseUser = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.firebaseUser = null;
      });
  },
});

export const { clearAuthError, updateUser, setFirebaseUser, completeOnboarding } = authSlice.actions;
export default authSlice.reducer;
