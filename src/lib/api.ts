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