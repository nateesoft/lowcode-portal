import React, { createContext, useContext, useState, useCallback } from 'react';

interface SecretKey {
  id: string;
  name: string;
  description: string;
  value: string;
  createdAt: string;
  lastModified: string;
  expiresAt?: string;
  tags: string[];
  type: 'api_key' | 'password' | 'certificate' | 'token';
}

interface SecretManagementContextType {
  secrets: SecretKey[];
  isLoading: boolean;
  error: string | null;
  addSecret: (secret: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>) => void;
  updateSecret: (id: string, secret: Partial<SecretKey>) => void;
  deleteSecret: (id: string) => void;
  getSecret: (id: string) => SecretKey | undefined;
  generateDemoSecrets: () => void;
  searchSecrets: (query: string) => SecretKey[];
  filterByType: (type: SecretKey['type']) => SecretKey[];
  getExpiredSecrets: () => SecretKey[];
  getExpiringSoonSecrets: () => SecretKey[];
}

const SecretManagementContext = createContext<SecretManagementContextType | undefined>(undefined);

export const useSecretManagement = () => {
  const context = useContext(SecretManagementContext);
  if (context === undefined) {
    throw new Error('useSecretManagement must be used within a SecretManagementProvider');
  }
  return context;
};

export const SecretManagementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [secrets, setSecrets] = useState<SecretKey[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSecret = useCallback((secretData: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>) => {
    const newSecret: SecretKey = {
      ...secretData,
      id: `secret_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };

    setSecrets(prev => [...prev, newSecret]);
  }, []);

  const updateSecret = useCallback((id: string, updates: Partial<SecretKey>) => {
    setSecrets(prev => prev.map(secret => 
      secret.id === id 
        ? { 
            ...secret, 
            ...updates, 
            lastModified: new Date().toISOString() 
          }
        : secret
    ));
  }, []);

  const deleteSecret = useCallback((id: string) => {
    setSecrets(prev => prev.filter(secret => secret.id !== id));
  }, []);

  const getSecret = useCallback((id: string) => {
    return secrets.find(secret => secret.id === id);
  }, [secrets]);

  const generateDemoSecrets = useCallback(() => {
    const demoSecrets: SecretKey[] = [
      {
        id: 'secret_1',
        name: 'Production API Key',
        description: 'Main API key for production environment',
        value: 'demo_prod_api_key_1234567890abcdef',
        type: 'api_key',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['production', 'api', 'critical']
      },
      {
        id: 'secret_2',
        name: 'Database Password',
        description: 'PostgreSQL database password',
        value: 'P@ssw0rd!2024$ecure',
        type: 'password',
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['database', 'postgresql']
      },
      {
        id: 'secret_3',
        name: 'JWT Secret',
        description: 'JSON Web Token signing secret',
        value: 'super-secret-jwt-key-that-should-be-long-and-random',
        type: 'token',
        createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['jwt', 'auth', 'token']
      },
      {
        id: 'secret_4',
        name: 'SSL Certificate',
        description: 'SSL certificate for domain.com',
        value: '-----BEGIN CERTIFICATE-----\nMIIDXTCCAkWgAwIBAgIJAKoK/heBjcOuMA0GCSqGSIb3DQEBBQUAMEUxCzAJBgNV\n-----END CERTIFICATE-----',
        type: 'certificate',
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['ssl', 'certificate', 'domain.com']
      },
      {
        id: 'secret_5',
        name: 'Stripe API Key',
        description: 'Stripe payment processing API key',
        value: 'demo_stripe_api_key_1234567890abcdef',
        type: 'api_key',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['stripe', 'payment', 'api']
      },
      {
        id: 'secret_6',
        name: 'Old API Key (Expired)',
        description: 'Legacy API key - needs rotation',
        value: 'demo_old_expired_api_key_abcdef',
        type: 'api_key',
        createdAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        lastModified: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString(),
        expiresAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        tags: ['legacy', 'expired', 'rotate']
      }
    ];

    setSecrets(demoSecrets);
  }, []);

  const searchSecrets = useCallback((query: string) => {
    const lowercaseQuery = query.toLowerCase();
    return secrets.filter(secret => 
      secret.name.toLowerCase().includes(lowercaseQuery) ||
      secret.description.toLowerCase().includes(lowercaseQuery) ||
      secret.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }, [secrets]);

  const filterByType = useCallback((type: SecretKey['type']) => {
    return secrets.filter(secret => secret.type === type);
  }, [secrets]);

  const getExpiredSecrets = useCallback(() => {
    const now = new Date();
    return secrets.filter(secret => 
      secret.expiresAt && new Date(secret.expiresAt) < now
    );
  }, [secrets]);

  const getExpiringSoonSecrets = useCallback(() => {
    const now = new Date();
    const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return secrets.filter(secret => 
      secret.expiresAt && 
      new Date(secret.expiresAt) > now && 
      new Date(secret.expiresAt) <= oneWeekFromNow
    );
  }, [secrets]);

  const value: SecretManagementContextType = {
    secrets,
    isLoading,
    error,
    addSecret,
    updateSecret,
    deleteSecret,
    getSecret,
    generateDemoSecrets,
    searchSecrets,
    filterByType,
    getExpiredSecrets,
    getExpiringSoonSecrets
  };

  return (
    <SecretManagementContext.Provider value={value}>
      {children}
    </SecretManagementContext.Provider>
  );
};

export default SecretManagementProvider;