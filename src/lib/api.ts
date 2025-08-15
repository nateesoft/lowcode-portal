import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    type?: string;
    icon?: any;
    shape?: string;
    backgroundColor?: string;
    borderColor?: string;
    code?: string;
    content?: string;
  };
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: any;
}

export interface FlowData {
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: any;
  version?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  configuration: FlowData;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
}

export const authAPI = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
};

export const flowAPI = {
  create: async (data: FlowData): Promise<FlowResponse> => {
    const response = await api.post('/flows', {
      name: data.name,
      description: data.description,
      status: data.isActive ? 'active' : 'draft',
      configuration: data
    });
    return response.data;
  },

  getAll: async (): Promise<FlowResponse[]> => {
    const response = await api.get('/flows');
    return response.data;
  },

  getById: async (id: string): Promise<FlowResponse> => {
    const response = await api.get(`/flows/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<FlowData>): Promise<FlowResponse> => {
    const response = await api.patch(`/flows/${id}`, {
      name: data.name,
      description: data.description,
      status: data.isActive ? 'active' : 'draft',
      configuration: data
    });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/flows/${id}`);
  },

  execute: async (id: string): Promise<any> => {
    const response = await api.post(`/flows/${id}/execute`);
    return response.data;
  }
};

export interface NodeContentData {
  id?: number;
  nodeId: string;
  label: string;
  description?: string;
  content: string;
  language: string;
  version: string;
  nodeType: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface NodeContentHistoryData {
  id: number;
  content: string;
  language: string;
  version: string;
  changeDescription?: string;
  metadata?: any;
  createdAt: string;
  createdBy?: User;
}

export interface CreateNodeContentRequest {
  label: string;
  description?: string;
  content: string;
  language: string;
  nodeType: string;
  metadata?: any;
  changeDescription?: string;
}

export const nodeContentAPI = {
  // Get all node contents for a flow
  getFlowNodeContents: async (flowId: string): Promise<NodeContentData[]> => {
    const response = await api.get(`/flows/${flowId}/nodes`);
    return response.data;
  },

  // Get specific node content
  getNodeContent: async (flowId: string, nodeId: string): Promise<NodeContentData | null> => {
    try {
      const response = await api.get(`/flows/${flowId}/nodes/${nodeId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  // Create or update node content
  saveNodeContent: async (flowId: string, nodeId: string, data: CreateNodeContentRequest): Promise<NodeContentData> => {
    const response = await api.put(`/flows/${flowId}/nodes/${nodeId}`, data);
    return response.data;
  },

  // Delete node content
  deleteNodeContent: async (flowId: string, nodeId: string): Promise<void> => {
    await api.delete(`/flows/${flowId}/nodes/${nodeId}`);
  },

  // Get node content history
  getNodeHistory: async (flowId: string, nodeId: string): Promise<NodeContentHistoryData[]> => {
    const response = await api.get(`/flows/${flowId}/nodes/${nodeId}/history`);
    return response.data;
  },

  // Get specific version content
  getVersionContent: async (flowId: string, nodeId: string, version: string): Promise<NodeContentHistoryData> => {
    const response = await api.get(`/flows/${flowId}/nodes/${nodeId}/history/${version}`);
    return response.data;
  },

  // Delete history entry
  deleteHistoryEntry: async (historyId: string): Promise<void> => {
    await api.delete(`/flows/history/${historyId}`);
  }
};

export interface ComponentData {
  id?: number;
  name: string;
  description?: string;
  type: string;
  category: string;
  props?: any;
  styles?: any;
  template?: string;
  code?: string;
  status?: string;
  version?: string;
  isPublic?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: User;
}

export interface ComponentHistoryData {
  id: number;
  componentId: string;
  version: string;
  name: string;
  description?: string;
  type: string;
  category: string;
  props?: any;
  styles?: any;
  template?: string;
  code?: string;
  status?: string;
  isPublic?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  changeDescription?: string;
  changeType: 'manual' | 'auto' | 'import' | 'restore';
  metadata?: any;
  createdAt: string;
  user?: User;
}

export interface CreateComponentRequest {
  name: string;
  description?: string;
  type: string;
  category: string;
  props?: any;
  styles?: any;
  template?: string;
  code?: string;
  status?: string;
  isPublic?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  userId?: number;
  changeDescription?: string;
}

export interface ComponentStats {
  total: number;
  published: number;
  draft: number;
  publicComponents: number;
  categories: Array<{
    category: string;
    count: number;
  }>;
}

export const componentAPI = {
  // Get all components
  getAll: async (category?: string, isPublic?: boolean): Promise<ComponentData[]> => {
    let url = '/components';
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (isPublic !== undefined) params.append('public', isPublic.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get component by ID
  getById: async (id: number): Promise<ComponentData> => {
    const response = await api.get(`/components/${id}`);
    return response.data;
  },

  // Create component
  create: async (data: CreateComponentRequest): Promise<ComponentData> => {
    const response = await api.post('/components', data);
    return response.data;
  },

  // Update component
  update: async (id: number, data: Partial<CreateComponentRequest>): Promise<ComponentData> => {
    const response = await api.patch(`/components/${id}`, data);
    return response.data;
  },

  // Delete component
  delete: async (id: number): Promise<void> => {
    await api.delete(`/components/${id}`);
  },

  // Get component stats
  getStats: async (): Promise<ComponentStats> => {
    const response = await api.get('/components/stats');
    return response.data;
  },

  // Get component history
  getHistory: async (componentId: number): Promise<ComponentHistoryData[]> => {
    const response = await api.get(`/components/${componentId}/history`);
    return response.data;
  },

  // Get specific version
  getHistoryVersion: async (componentId: number, version: string): Promise<ComponentHistoryData> => {
    const response = await api.get(`/components/${componentId}/history/${version}`);
    return response.data;
  },

  // Restore from history
  restoreFromHistory: async (componentId: number, version: string, userId: number): Promise<ComponentData> => {
    const response = await api.post(`/components/${componentId}/restore/${version}`, { userId });
    return response.data;
  },

  // Delete history entry
  deleteHistoryEntry: async (historyId: number): Promise<void> => {
    await api.delete(`/components/history/${historyId}`);
  }
};