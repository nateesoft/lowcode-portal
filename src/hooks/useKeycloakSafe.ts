import { useKeycloakAuth } from '@/contexts/KeycloakContext';

// Safe hook that doesn't throw when Keycloak context is not available
export const useKeycloakSafe = () => {
  try {
    return useKeycloakAuth();
  } catch (error) {
    // Return safe defaults when Keycloak context is not available
    return {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isKeycloakReady: false,
      login: () => console.warn('Keycloak not ready'),
      logout: () => console.warn('Keycloak not ready'),
      token: undefined,
      refreshToken: async () => false,
      hasRole: () => false,
      loginWithGoogle: () => console.warn('Keycloak not ready'),
    };
  }
};