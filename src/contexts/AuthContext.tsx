import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI, User, KeycloakUserSyncRequest } from '@/lib/api';
import { useKeycloakSafe } from '@/hooks/useKeycloakSafe';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string, role?: string) => Promise<void>;
  syncKeycloakUser: (keycloakUserData: KeycloakUserSyncRequest) => Promise<void>;
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
  const keycloakContext = useKeycloakSafe();
  const router = useRouter();
  
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
        
        // Verify token validity
        try {
          const verification = await authAPI.verifyToken();
          console.log('Token verification result:', verification);
          if (!verification.valid) {
            console.log('Token invalid, attempting refresh...');
            try {
              await authAPI.refreshToken();
              console.log('Token refreshed successfully');
              // Re-verify after refresh
              const newVerification = await authAPI.verifyToken();
              if (!newVerification.valid) {
                console.log('Token still invalid after refresh, logging out');
                handleLogout();
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
              handleLogout();
            }
          }
        } catch (error) {
          console.log('Token verification error:', error);
          // Try refresh on verification error
          try {
            await authAPI.refreshToken();
            console.log('Token refreshed after verification error');
          } catch (refreshError) {
            console.error('Token refresh failed after verification error:', refreshError);
            handleLogout();
          }
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

  const syncKeycloakUser = async (keycloakUserData: KeycloakUserSyncRequest) => {
    try {
      console.log('Syncing Keycloak user data:', keycloakUserData);
      const response = await authAPI.syncKeycloakUser(keycloakUserData);
      setUser(response.user);
      setIsAuthenticated(true);
      console.log('Keycloak user sync successful:', response.user);
    } catch (error) {
      console.error('Keycloak user sync failed:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    // Clear local tokens and user
    authAPI.logout();
    setUser(null);
    setIsAuthenticated(false);
    
    // Also logout from Keycloak if available
    if (keycloakContext?.logout) {
      keycloakContext.logout();
    } else {
      // If no Keycloak, redirect manually
      router.push('/login');
    }
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
    syncKeycloakUser,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};