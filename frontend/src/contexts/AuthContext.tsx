import React, { createContext, ReactNode, useContext, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { loadStoredAuth } from '../store/slices/authSlice';
import { AuthState } from '../types';

interface AuthContextType extends AuthState {
  // Add any additional auth-related functions here if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch();
  const authState = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Load stored authentication on app start
    dispatch(loadStoredAuth());
  }, [dispatch]);

  const contextValue: AuthContextType = {
    ...authState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
