import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeKeycloak } from '@/lib/keycloak';
import type Keycloak from 'keycloak-js';
import { User } from '@/lib/api';

interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
}

interface KeycloakContextType {
  user: KeycloakUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isKeycloakReady: boolean;
  login: () => void;
  logout: () => void;
  token: string | undefined;
  refreshToken: () => Promise<boolean>;
  hasRole: (role: string) => boolean;
  loginWithGoogle: () => void;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(undefined);

export const useKeycloakAuth = () => {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error('useKeycloakAuth must be used within a KeycloakProvider');
  }
  return context;
};

const KeycloakContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [kc, setKc] = useState<Keycloak | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const keycloakInstance = await initializeKeycloak();
        if (keycloakInstance) {
          setKc(keycloakInstance);
          setInitialized(true);
          
          if (keycloakInstance.authenticated && keycloakInstance.tokenParsed) {
            const keycloakUser: KeycloakUser = {
              id: keycloakInstance.tokenParsed.sub || '',
              username: keycloakInstance.tokenParsed.preferred_username || '',
              email: keycloakInstance.tokenParsed.email || '',
              firstName: keycloakInstance.tokenParsed.given_name || '',
              lastName: keycloakInstance.tokenParsed.family_name || '',
              role: keycloakInstance.tokenParsed.role || 'user',
              emailVerified: keycloakInstance.tokenParsed.email_verified || false,
            };
            setUser(keycloakUser);
            
            // Store token in localStorage for API calls
            if (keycloakInstance.token) {
              localStorage.setItem('keycloak_token', keycloakInstance.token);
            }
          } else {
            setUser(null);
            localStorage.removeItem('keycloak_token');
          }
        }
      } catch (error) {
        console.error('Failed to initialize Keycloak:', error);
        setInitialized(true); // Still set to initialized to show fallback UI
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const login = () => {
    if (!kc) {
      console.warn('Keycloak not initialized, cannot login');
      return;
    }
    console.log('Initiating Keycloak login...');
    kc.login({
      redirectUri: `${window.location.origin}/dashboard`
    }).catch(error => {
      console.error('Keycloak login failed:', error);
    });
  };

  const loginWithGoogle = () => {
    if (!kc) {
      console.warn('Keycloak not initialized, cannot login with Google');
      return;
    }
    console.log('Initiating Keycloak Google login...');
    kc.login({
      idpHint: 'google',
      redirectUri: `${window.location.origin}/dashboard`
    }).catch(error => {
      console.error('Keycloak Google login failed:', error);
    });
  };

  const logout = () => {
    if (!kc) return;
    localStorage.removeItem('keycloak_token');
    setUser(null);
    kc.logout({
      redirectUri: `${window.location.origin}/login`
    });
  };

  const refreshToken = async (): Promise<boolean> => {
    if (!kc) return false;
    try {
      const refreshed = await kc.updateToken(30);
      if (refreshed && kc.token) {
        localStorage.setItem('keycloak_token', kc.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    if (!kc || !kc.tokenParsed) return false;
    
    // Check realm roles
    const realmRoles = kc.tokenParsed.realm_access?.roles || [];
    if (realmRoles.includes(role)) return true;
    
    // Check custom role attribute
    if (kc.tokenParsed.role === role) return true;
    
    return false;
  };

  const value: KeycloakContextType = {
    user,
    isAuthenticated: !!kc?.authenticated,
    isLoading,
    isKeycloakReady: initialized && !!kc,
    login,
    logout,
    token: kc?.token,
    refreshToken,
    hasRole,
    loginWithGoogle,
  };

  return (
    <KeycloakContext.Provider value={value}>
      {children}
    </KeycloakContext.Provider>
  );
};


// Main provider that uses our custom Keycloak integration
export const KeycloakProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only run on client-side
    if (typeof window !== 'undefined') {
      setIsReady(true);
    }
  }, []);

  // Show loading during SSR
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return <KeycloakContextProvider>{children}</KeycloakContextProvider>;
};