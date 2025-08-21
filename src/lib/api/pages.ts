import apiClient from './client';
import { 
  PageData, 
  PageHistoryData, 
  CreatePageRequest, 
  PageStats 
} from '../types/page';

export const pageAPI = {
  getAll: async () => {
    const response = await apiClient.get('/pages');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/pages/${id}`);
    return response.data;
  },

  create: async (data: CreatePageRequest) => {
    const response = await apiClient.post('/pages', data);
    return response.data;
  },

  update: async (id: number, data: CreatePageRequest) => {
    const response = await apiClient.put(`/pages/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/pages/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{ data: PageStats }> => {
    const response = await apiClient.get('/pages/stats');
    return response.data;
  },

  getHistory: async (pageId: number): Promise<{ data: PageHistoryData[] }> => {
    const response = await apiClient.get(`/pages/${pageId}/history`);
    return response.data;
  },

  restoreVersion: async (pageId: number, historyId: number) => {
    const response = await apiClient.post(`/pages/${pageId}/restore/${historyId}`);
    return response.data;
  },

  publish: async (id: number) => {
    const response = await apiClient.post(`/pages/${id}/publish`);
    return response.data;
  },

  unpublish: async (id: number) => {
    const response = await apiClient.post(`/pages/${id}/unpublish`);
    return response.data;
  },

  duplicate: async (id: number, name?: string) => {
    const response = await apiClient.post(`/pages/${id}/duplicate`, { name });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/pages/slug/${slug}`);
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
    const response = await apiClient.get(`/pages/search?${params}`);
    return response.data;
  }
};