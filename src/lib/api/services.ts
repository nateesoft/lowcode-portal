import apiClient from './client';
import { 
  ServiceData, 
  ServiceResponse, 
  CreateServiceRequest, 
  UpdateServiceRequest,
  SecretKeyData,
  CreateSecretKeyRequest,
  UpdateSecretKeyRequest,
  SecretKeyStats
} from '../types/service';

export const serviceAPI = {
  getAll: async (userId?: number): Promise<{ data: ServiceResponse[] }> => {
    let url = '/services';
    if (userId) {
      url += `?userId=${userId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getActive: async (): Promise<{ data: ServiceResponse[] }> => {
    const response = await apiClient.get('/services/active');
    return response.data;
  },

  getById: async (id: number): Promise<{ data: ServiceResponse }> => {
    const response = await apiClient.get(`/services/${id}`);
    return response.data;
  },

  create: async (data: CreateServiceRequest): Promise<{ data: ServiceResponse }> => {
    const response = await apiClient.post('/services', data);
    return response.data;
  },

  update: async (id: number, data: UpdateServiceRequest): Promise<{ data: ServiceResponse }> => {
    const response = await apiClient.patch(`/services/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/services/${id}`);
  },

  execute: async (id: number, input?: any) => {
    const response = await apiClient.post(`/services/${id}/execute`, { input });
    return response.data;
  },

  test: async (id: number, testData?: any) => {
    const response = await apiClient.post(`/services/${id}/test`, testData);
    return response.data;
  },

  deploy: async (id: number) => {
    const response = await apiClient.post(`/services/${id}/deploy`);
    return response.data;
  },

  undeploy: async (id: number) => {
    const response = await apiClient.post(`/services/${id}/undeploy`);
    return response.data;
  }
};

export const secretKeyAPI = {
  getAll: async () => {
    const response = await apiClient.get('/secret-keys');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/secret-keys/${id}`);
    return response.data;
  },

  create: async (data: CreateSecretKeyRequest) => {
    const response = await apiClient.post('/secret-keys', data);
    return response.data;
  },

  update: async (id: number, data: UpdateSecretKeyRequest) => {
    const response = await apiClient.put(`/secret-keys/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/secret-keys/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{ data: SecretKeyStats }> => {
    const response = await apiClient.get('/secret-keys/stats');
    return response.data;
  },

  testConnection: async (id: number) => {
    const response = await apiClient.post(`/secret-keys/${id}/test`);
    return response.data;
  },

  rotate: async (id: number) => {
    const response = await apiClient.post(`/secret-keys/${id}/rotate`);
    return response.data;
  },

  getUsageHistory: async (id: number) => {
    const response = await apiClient.get(`/secret-keys/${id}/usage`);
    return response.data;
  }
};