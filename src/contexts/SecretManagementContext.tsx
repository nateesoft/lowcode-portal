import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { secretKeyAPI, SecretKeyData, CreateSecretKeyRequest, UpdateSecretKeyRequest } from '@/lib/api';

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
  isDemoMode: boolean;
  isVaultEnabled: boolean;
  vaultStatus: 'connected' | 'disconnected' | 'unknown';
  addSecret: (secret: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>) => Promise<void>;
  updateSecret: (id: string, secret: Partial<SecretKey>) => Promise<void>;
  deleteSecret: (id: string) => Promise<void>;
  getSecret: (id: string) => SecretKey | undefined;
  generateDemoSecrets: () => void;
  searchSecrets: (query: string) => SecretKey[];
  filterByType: (type: SecretKey['type']) => SecretKey[];
  getExpiredSecrets: () => SecretKey[];
  getExpiringSoonSecrets: () => SecretKey[];
  loadSecrets: () => Promise<void>;
  checkVaultStatus: () => Promise<void>;
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
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVaultEnabled, setIsVaultEnabled] = useState(false);
  const [vaultStatus, setVaultStatus] = useState<'connected' | 'disconnected' | 'unknown'>('unknown');

  // Convert API data to SecretKey format
  const convertApiToSecretKey = (apiData: SecretKeyData): SecretKey => ({
    id: apiData.id?.toString() || '',
    name: apiData.name || '',
    description: apiData.description || '',
    value: apiData.value || (apiData as any).maskedValue || '',
    type: apiData.type,
    createdAt: apiData.createdAt || new Date().toISOString(),
    lastModified: apiData.updatedAt || apiData.lastModified || new Date().toISOString(),
    expiresAt: apiData.expiresAt,
    tags: apiData.tags || []
  });

  // Convert SecretKey to API format
  const convertSecretKeyToApi = (secretData: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>): CreateSecretKeyRequest => ({
    name: secretData.name,
    description: secretData.description,
    value: secretData.value,
    type: secretData.type,
    expiresAt: secretData.expiresAt,
    tags: secretData.tags,
    isActive: true
  });

  // Load secrets from API with fallback to demo data
  const loadSecrets = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const apiSecrets = await secretKeyAPI.getAll();
      const convertedSecrets = apiSecrets.map(convertApiToSecretKey);
      setSecrets(convertedSecrets);
      setIsDemoMode(false);
    } catch (err: any) {
      console.warn('API not available, using demo data:', err);
      // Fallback to demo data when API is not available
      generateDemoSecrets();
      setIsDemoMode(true);
      setError(null); // Don't show error for fallback to demo data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Check Vault status
  const checkVaultStatus = useCallback(async () => {
    try {
      // This would be a call to check vault health/status
      // For now, we'll assume vault is enabled if the API responds with vault metadata
      const response = await secretKeyAPI.getAll();
      const hasVaultSecrets = response.some((secret: any) => secret.metadata?.storedInVault);
      setIsVaultEnabled(hasVaultSecrets);
      setVaultStatus(hasVaultSecrets ? 'connected' : 'disconnected');
    } catch (error) {
      setVaultStatus('unknown');
    }
  }, []);

  // Load secrets on mount
  useEffect(() => {
    loadSecrets();
    checkVaultStatus();
  }, [loadSecrets, checkVaultStatus]);

  const addSecret = useCallback(async (secretData: Omit<SecretKey, 'id' | 'createdAt' | 'lastModified'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiData = convertSecretKeyToApi(secretData);
      const createdSecret = await secretKeyAPI.create(apiData);
      const newSecret = convertApiToSecretKey(createdSecret);
      setSecrets(prev => [...prev, newSecret]);
    } catch (err: any) {
      console.warn('API not available, using local storage:', err);
      // Fallback to local storage when API is not available
      const newSecret: SecretKey = {
        ...secretData,
        id: `secret_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };
      setSecrets(prev => [...prev, newSecret]);
      setError(null); // Don't show error for fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateSecret = useCallback(async (id: string, updates: Partial<SecretKey>) => {
    setIsLoading(true);
    setError(null);
    try {
      const apiUpdates: UpdateSecretKeyRequest = {
        name: updates.name,
        description: updates.description,
        value: updates.value,
        type: updates.type,
        expiresAt: updates.expiresAt,
        tags: updates.tags
      };
      
      const updatedSecret = await secretKeyAPI.update(parseInt(id), apiUpdates);
      const convertedSecret = convertApiToSecretKey(updatedSecret);
      
      setSecrets(prev => prev.map(secret => 
        secret.id === id ? convertedSecret : secret
      ));
    } catch (err: any) {
      console.warn('API not available, updating locally:', err);
      // Fallback to local update when API is not available
      setSecrets(prev => prev.map(secret => 
        secret.id === id 
          ? { 
              ...secret, 
              ...updates, 
              lastModified: new Date().toISOString() 
            }
          : secret
      ));
      setError(null); // Don't show error for fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteSecret = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await secretKeyAPI.delete(parseInt(id));
      setSecrets(prev => prev.filter(secret => secret.id !== id));
    } catch (err: any) {
      console.warn('API not available, deleting locally:', err);
      // Fallback to local deletion when API is not available
      setSecrets(prev => prev.filter(secret => secret.id !== id));
      setError(null); // Don't show error for fallback
    } finally {
      setIsLoading(false);
    }
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
    isDemoMode,
    isVaultEnabled,
    vaultStatus,
    addSecret,
    updateSecret,
    deleteSecret,
    getSecret,
    generateDemoSecrets,
    searchSecrets,
    filterByType,
    getExpiredSecrets,
    getExpiringSoonSecrets,
    loadSecrets,
    checkVaultStatus
  };

  return (
    <SecretManagementContext.Provider value={value}>
      {children}
    </SecretManagementContext.Provider>
  );
};

export default SecretManagementProvider;