import { createContext, ReactNode, useContext, useState } from 'react';

// Define the shape of our user data
interface User {
  id: string;
  email: string;
  name?: string;
}

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name?: string) => Promise<boolean>;
  logout: () => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => false,
  signup: async () => false,
  logout: () => {},
});

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // In a real app, this would make an API call to your server
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty email/password will work
      if (email && password) {
        setUser({
          id: '1',
          email,
          name: email.split('@')[0],
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // In a real app, this would make an API call to your server
  const signup = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, any non-empty email/password will work
      if (email && password) {
        setUser({
          id: '1',
          email,
          name: name || email.split('@')[0],
        });
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
