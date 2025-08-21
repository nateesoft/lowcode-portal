import Keycloak from 'keycloak-js';

// Keycloak configuration
export const keycloakConfig = {
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || 'http://localhost:9090',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || 'lowcode-platform',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || 'lowcode-portal',
};

// Global storage for Keycloak instance - use a key that's unlikely to conflict
declare global {
  interface Window {
    __LOWCODE_KEYCLOAK_INSTANCE__?: Keycloak;
    __LOWCODE_KEYCLOAK_INITIALIZED__?: boolean;
  }
}

let keycloakInstance: Keycloak | null = null;

export const createKeycloakInstance = (): Keycloak => {
  return new Keycloak(keycloakConfig);
};

export const getKeycloakInstance = (): Keycloak | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!keycloakInstance && window.__LOWCODE_KEYCLOAK_INSTANCE__) {
    keycloakInstance = window.__LOWCODE_KEYCLOAK_INSTANCE__;
  }

  return keycloakInstance;
};

export const initializeKeycloak = async (): Promise<Keycloak | null> => {
  if (typeof window === 'undefined') {
    return null;
  }

  // Check if already initialized
  if (window.__LOWCODE_KEYCLOAK_INITIALIZED__ && window.__LOWCODE_KEYCLOAK_INSTANCE__) {
    keycloakInstance = window.__LOWCODE_KEYCLOAK_INSTANCE__;
    return keycloakInstance;
  }

  try {
    // First test if Keycloak server is reachable
    const serverTest = await fetch(`${keycloakConfig.url}/realms/${keycloakConfig.realm}`)
      .catch(() => null);
    
    if (!serverTest || !serverTest.ok) {
      console.warn('Keycloak server not reachable, using fallback mode');
      return null;
    }

    // Create new instance
    const kc = createKeycloakInstance();
    
    console.log('Initializing Keycloak with config:', keycloakConfig);
    
    // Initialize with simpler options to prevent infinite redirects
    const initPromise = kc.init({
      onLoad: undefined, // Don't auto-redirect
      checkLoginIframe: false, // Disable iframe check to prevent issues
      enableLogging: true,
      responseMode: 'fragment',
    });

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Keycloak initialization timeout')), 15000)
    );

    const result = await Promise.race([initPromise, timeoutPromise]);
    console.log('Keycloak init result:', result);

    // Store in window
    window.__LOWCODE_KEYCLOAK_INSTANCE__ = kc;
    window.__LOWCODE_KEYCLOAK_INITIALIZED__ = true;
    keycloakInstance = kc;

    console.log('Keycloak initialized successfully');
    return kc;
  } catch (error) {
    console.error('Failed to initialize Keycloak:', error);
    console.error('Keycloak config being used:', keycloakConfig);
    
    // Mark as initialized even if failed to prevent retries
    window.__LOWCODE_KEYCLOAK_INITIALIZED__ = true;
    return null;
  }
};

export const resetKeycloakInstance = () => {
  if (typeof window !== 'undefined') {
    window.__LOWCODE_KEYCLOAK_INSTANCE__ = undefined;
    window.__LOWCODE_KEYCLOAK_INITIALIZED__ = undefined;
  }
  keycloakInstance = null;
};