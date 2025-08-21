import apiClient from './client';
import { 
  FlowData, 
  FlowResponse, 
  FlowVersion, 
  CreateFlowVersionRequest, 
  UpdateFlowVersionRequest,
  NodeContentData,
  NodeContentHistoryData,
  CreateNodeContentRequest
} from '../types/flow';

export const flowAPI = {
  getAll: async () => {
    const response = await apiClient.get('/flows');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/flows/${id}`);
    return response.data;
  },

  create: async (data: Partial<FlowData>) => {
    const response = await apiClient.post('/flows', data);
    return response.data;
  },

  update: async (id: string, data: Partial<FlowData>) => {
    const response = await apiClient.put(`/flows/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/flows/${id}`);
    return response.data;
  },

  execute: async (id: string, input?: any) => {
    const response = await apiClient.post(`/flows/${id}/execute`, { input });
    return response.data;
  },

  validate: async (id: string) => {
    const response = await apiClient.post(`/flows/${id}/validate`);
    return response.data;
  }
};

export const flowVersionAPI = {
  getAll: async (flowId: number) => {
    const response = await apiClient.get(`/flow-versions?flowId=${flowId}`);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/flow-versions/${id}`);
    return response.data;
  },

  create: async (data: CreateFlowVersionRequest) => {
    const response = await apiClient.post('/flow-versions', data);
    return response.data;
  },

  update: async (id: number, data: UpdateFlowVersionRequest) => {
    const response = await apiClient.put(`/flow-versions/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/flow-versions/${id}`);
    return response.data;
  },

  restore: async (flowId: number, versionId: number) => {
    const response = await apiClient.post(`/flows/${flowId}/restore/${versionId}`);
    return response.data;
  },

  compare: async (versionId1: number, versionId2: number) => {
    const response = await apiClient.get(`/flow-versions/compare?v1=${versionId1}&v2=${versionId2}`);
    return response.data;
  }
};

export const nodeContentAPI = {
  getAll: async (nodeId?: string) => {
    let url = '/node-contents';
    if (nodeId) {
      url += `?nodeId=${nodeId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/node-contents/${id}`);
    return response.data;
  },

  create: async (data: CreateNodeContentRequest) => {
    const response = await apiClient.post('/node-contents', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateNodeContentRequest>) => {
    const response = await apiClient.put(`/node-contents/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    const response = await apiClient.delete(`/node-contents/${id}`);
    return response.data;
  },

  getHistory: async (nodeContentId: number): Promise<{ data: NodeContentHistoryData[] }> => {
    const response = await apiClient.get(`/node-contents/${nodeContentId}/history`);
    return response.data;
  },

  restoreVersion: async (nodeContentId: number, historyId: number) => {
    const response = await apiClient.post(`/node-contents/${nodeContentId}/restore/${historyId}`);
    return response.data;
  }
};