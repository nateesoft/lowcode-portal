import apiClient from './client';
import { 
  ComponentData, 
  ComponentHistoryData, 
  CreateComponentRequest, 
  ComponentStats 
} from '../types/component';

export const componentAPI = {
  getAll: async () => {
    const response = await apiClient.get('/components');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/components/${id}`);
    return response.data;
  },

  create: async (data: CreateComponentRequest) => {
    const response = await apiClient.post('/components', data);
    return response.data;
  },

  update: async (id: number, data: CreateComponentRequest) => {
    const response = await apiClient.put(`/components/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/components/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{ data: ComponentStats }> => {
    const response = await apiClient.get('/components/stats');
    return response.data;
  },

  getHistory: async (componentId: number): Promise<{ data: ComponentHistoryData[] }> => {
    const response = await apiClient.get(`/components/${componentId}/history`);
    return response.data;
  },

  restoreVersion: async (componentId: number, historyId: number) => {
    const response = await apiClient.post(`/components/${componentId}/restore/${historyId}`);
    return response.data;
  },

  publish: async (id: number) => {
    const response = await apiClient.post(`/components/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: number) => {
    const response = await apiClient.post(`/components/${id}/unpublish`);
    return response.data;
  },

  duplicate: async (id: number, name?: string) => {
    const response = await apiClient.post(`/components/${id}/duplicate`, { name });
    return response.data;
  },

  search: async (query: string, filters?: any) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (filters) {
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });
    }
    const response = await apiClient.get(`/components/search?${params}`);
    return response.data;
  }
};