import apiClient from './client';
import { 
  MyProjectData, 
  CreateMyProjectRequest, 
  MyProjectStats, 
  WorkFlowData, 
  WorkFlowHistoryData 
} from '../types/project';

export const myProjectAPI = {
  getAll: async () => {
    const response = await apiClient.get('/my-projects');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/my-projects/${id}`);
    return response.data;
  },

  create: async (data: CreateMyProjectRequest) => {
    const response = await apiClient.post('/my-projects', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateMyProjectRequest>) => {
    const response = await apiClient.put(`/my-projects/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/my-projects/${id}`);
    return response.data;
  },

  getStats: async (): Promise<{ data: MyProjectStats }> => {
    const response = await apiClient.get('/my-projects/stats');
    return response.data;
  },

  duplicate: async (id: number, name?: string) => {
    const response = await apiClient.post(`/my-projects/${id}/duplicate`, { name });
    return response.data;
  },

  getBySlug: async (slug: string) => {
    const response = await apiClient.get(`/my-projects/slug/${slug}`);
    return response.data;
  }
};