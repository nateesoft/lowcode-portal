import { BaseEntity } from './common';
import { User } from './user';

export interface ServiceData extends BaseEntity {
  name: string;
  description?: string;
  nodes?: any;
  edges?: any;
  viewport?: any;
  version?: string;
  isActive?: boolean;
  serviceType?: string;
  changeDescription?: string;
  createdBy: number;
  creator?: User;
}

export interface ServiceResponse extends ServiceData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceRequest {
  name: string;
  description?: string;
  nodes?: any;
  edges?: any;
  viewport?: any;
  isActive?: boolean;
  serviceType?: string;
  changeDescription?: string;
}

export interface UpdateServiceRequest {
  name?: string;
  description?: string;
  nodes?: any;
  edges?: any;
  viewport?: any;
  isActive?: boolean;
  serviceType?: string;
  changeDescription?: string;
}

export interface SecretKeyData extends BaseEntity {
  name: string;
  description?: string;
  keyType: 'api_key' | 'database' | 'oauth' | 'webhook' | 'encryption' | 'other';
  environment: 'development' | 'staging' | 'production';
  value: string;
  expiresAt?: string;
  isActive: boolean;
  lastUsedAt?: string;
  metadata?: any;
  createdBy: User;
}

export interface CreateSecretKeyRequest {
  name: string;
  description?: string;
  keyType: 'api_key' | 'database' | 'oauth' | 'webhook' | 'encryption' | 'other';
  environment: 'development' | 'staging' | 'production';
  value: string;
  expiresAt?: string;
  isActive?: boolean;
  metadata?: any;
}

export interface UpdateSecretKeyRequest {
  name?: string;
  description?: string;
  keyType?: 'api_key' | 'database' | 'oauth' | 'webhook' | 'encryption' | 'other';
  environment?: 'development' | 'staging' | 'production';
  value?: string;
  expiresAt?: string;
  isActive?: boolean;
  metadata?: any;
}

export interface SecretKeyStats {
  total: number;
  active: number;
  expired: number;
  expiringThisMonth: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  byEnvironment: Array<{
    environment: string;
    count: number;
  }>;
}