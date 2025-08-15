import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, User } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  logout: () => void;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const isAdmin = user?.role === 'admin';

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if tokens exist
      if (!authAPI.isAuthenticated()) {
        console.log('No tokens found, user not authenticated');
        setIsAuthenticated(false);
        setUser(null);
        return;
      }

      // Try to get stored user first
      const storedUser = authAPI.getStoredUser();
      console.log('Stored user:', storedUser);
      
      if (storedUser) {
        console.log('Found stored user, setting as authenticated');
        setUser(storedUser);
        setIsAuthenticated(true);
        
        // Skip token verification for now to avoid redirect loops
        // We'll verify in the background but not logout on failure immediately
        try {
          const verification = await authAPI.verifyToken();
          console.log('Token verification result:', verification);
          if (!verification.valid) {
            console.log('Token invalid, but keeping user logged in for now');
            // Don't logout immediately, let the user try to use the app
            // The API interceptors will handle token refresh
          }
        } catch (error) {
          console.log('Token verification error (but keeping logged in):', error);
          // Don't logout immediately
        }
      } else {
        console.log('No stored user, trying token verification');
        // No stored user, try to verify token
        try {
          const verification = await authAPI.verifyToken();
          if (verification.valid && verification.user) {
            console.log('Token valid, setting user');
            setUser(verification.user);
            setIsAuthenticated(true);
          } else {
            console.log('Token verification failed');
            handleLogout();
          }
        } catch (error) {
          console.log('Token verification error:', error);
          handleLogout();
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string, firstName: string, lastName: string, role?: string) => {
    try {
      const response = await authAPI.register({ email, password, firstName, lastName, role });
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
  };

  const logout = () => {
    handleLogout();
  };

  const refreshAuth = async () => {
    await checkAuthStatus();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};