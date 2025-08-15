import axios from 'axios';
import { Note } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });
          
          const newAccessToken = response.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    access_token: string;
    refresh_token: string;
  };
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
    const authResponse = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authResponse.tokens.access_token);
    localStorage.setItem('refresh_token', authResponse.tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    return authResponse;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    const authResponse = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authResponse.tokens.access_token);
    localStorage.setItem('refresh_token', authResponse.tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    return authResponse;
  },

  refreshToken: async (): Promise<{ access_token: string }> => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refresh_token: refreshToken
    });
    
    const newAccessToken = response.data.access_token;
    localStorage.setItem('access_token', newAccessToken);
    
    return response.data;
  },

  verifyToken: async (): Promise<{ valid: boolean; user?: User }> => {
    try {
      const response = await api.post('/auth/verify');
      return response.data;
    } catch (error) {
      return { valid: false };
    }
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  getStoredUser: (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');
    return !!(token || refreshToken);
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

export interface PageData {
  id?: number;
  title: string;
  slug: string;
  description?: string;
  content?: any;
  layout?: any;
  components?: any;
  styles?: any;
  customCSS?: string;
  customJS?: string;
  status?: string;
  version?: string;
  isPublic?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  pageType?: string;
  routePath?: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: User;
}

export interface PageHistoryData {
  id: number;
  pageId: string;
  version: string;
  title: string;
  slug: string;
  description?: string;
  content?: any;
  layout?: any;
  components?: any;
  styles?: any;
  customCSS?: string;
  customJS?: string;
  status: string;
  isPublic: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  pageType: string;
  routePath?: string;
  changeDescription?: string;
  changeType: 'manual' | 'auto' | 'import' | 'restore';
  metadata?: {
    contentSize?: number;
    componentCount?: number;
    styleRulesCount?: number;
    customCSSLines?: number;
    customJSLines?: number;
    seoScore?: number;
    rollbackFrom?: string;
  };
  createdAt: string;
  user?: User;
}

export interface CreatePageRequest {
  title: string;
  slug: string;
  description?: string;
  content?: any;
  layout?: any;
  components?: any;
  styles?: any;
  customCSS?: string;
  customJS?: string;
  status?: string;
  isPublic?: boolean;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  pageType?: string;
  routePath?: string;
  metadata?: any;
  userId?: number;
  changeDescription?: string;
}

export interface PageStats {
  total: number;
  published: number;
  draft: number;
  publicPages: number;
  pageTypes: Array<{
    pageType: string;
    count: number;
  }>;
  statuses: Array<{
    status: string;
    count: number;
  }>;
}

export const pageAPI = {
  // Get all pages
  getAll: async (status?: string, pageType?: string, isPublic?: boolean): Promise<PageData[]> => {
    let url = '/pages';
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (pageType) params.append('pageType', pageType);
    if (isPublic !== undefined) params.append('public', isPublic.toString());
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await api.get(url);
    return response.data;
  },

  // Get page by ID
  getById: async (id: number): Promise<PageData> => {
    const response = await api.get(`/pages/${id}`);
    return response.data;
  },

  // Get page by slug
  getBySlug: async (slug: string): Promise<PageData> => {
    const response = await api.get(`/pages/slug/${slug}`);
    return response.data;
  },

  // Create page
  create: async (data: CreatePageRequest): Promise<PageData> => {
    const response = await api.post('/pages', data);
    return response.data;
  },

  // Update page
  update: async (id: number, data: Partial<CreatePageRequest>): Promise<PageData> => {
    const response = await api.patch(`/pages/${id}`, data);
    return response.data;
  },

  // Delete page
  delete: async (id: number): Promise<void> => {
    await api.delete(`/pages/${id}`);
  },

  // Get page stats
  getStats: async (): Promise<PageStats> => {
    const response = await api.get('/pages/stats');
    return response.data;
  },

  // Get page history
  getHistory: async (pageId: number): Promise<PageHistoryData[]> => {
    const response = await api.get(`/pages/${pageId}/history`);
    return response.data;
  },

  // Get specific version
  getHistoryVersion: async (pageId: number, version: string): Promise<PageHistoryData> => {
    const response = await api.get(`/pages/${pageId}/history/${version}`);
    return response.data;
  },

  // Restore from history
  restoreFromHistory: async (pageId: number, version: string, userId: number): Promise<PageData> => {
    const response = await api.post(`/pages/${pageId}/restore/${version}`, { userId });
    return response.data;
  },

  // Delete history entry
  deleteHistoryEntry: async (historyId: number): Promise<void> => {
    await api.delete(`/pages/history/${historyId}`);
  }
};

// ===== MY PROJECT API =====

export interface MyProjectData {
  id: number;
  name: string;
  slug: string;
  description?: string;
  projectType: 'web' | 'mobile' | 'api' | 'desktop' | 'dashboard' | 'ecommerce' | 'blog' | 'portfolio' | 'other';
  status: 'planning' | 'development' | 'testing' | 'production' | 'maintenance' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'critical';
  isPublic: boolean;
  version: string;
  metadata?: any;
  configuration?: any;
  assets?: any;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  socialImage?: string;
  createdBy: User;
  createdById: number;
  workflows?: WorkFlowData[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateMyProjectRequest {
  name: string;
  slug: string;
  description?: string;
  projectType?: 'web' | 'mobile' | 'api' | 'desktop' | 'dashboard' | 'ecommerce' | 'blog' | 'portfolio' | 'other';
  status?: 'planning' | 'development' | 'testing' | 'production' | 'maintenance' | 'archived';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  isPublic?: boolean;
  metadata?: any;
  configuration?: any;
  assets?: any;
  tags?: string[];
  thumbnailUrl?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string[];
  socialImage?: string;
  createdById?: number;
}

export interface WorkFlowData {
  id: number;
  name: string;
  description?: string;
  workflowType: 'user-journey' | 'business-process' | 'api-flow' | 'data-flow' | 'ui-flow' | 'automation' | 'other';
  status: 'draft' | 'active' | 'testing' | 'deployed' | 'archived';
  isActive: boolean;
  version: string;
  configuration?: any;
  canvasData?: any;
  metadata?: any;
  variables?: any;
  permissions?: any;
  tags?: string[];
  projectId: number;
  createdBy: User;
  createdById: number;
  nodes?: WorkFlowNodeData[];
  history?: WorkFlowHistoryData[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkFlowNodeData {
  id: number;
  nodeId: string;
  name: string;
  description?: string;
  nodeType: string;
  status: string;
  position?: any;
  styling?: any;
  nodeData?: any;
  linkType?: string;
  linkId?: number;
  externalUrl?: string;
  linkConfiguration?: any;
  customCode?: string;
  executionConfig?: any;
  validationRules?: any;
  metadata?: any;
  documentation?: string;
  tags?: string[];
  workflowId: number;
  linkedPageId?: number;
  linkedComponentId?: number;
  createdBy: User;
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkFlowHistoryData {
  id: number;
  workflowId: number;
  version: string;
  name: string;
  description?: string;
  workflowType: string;
  status: string;
  isActive: boolean;
  configuration?: any;
  canvasData?: any;
  variables?: any;
  permissions?: any;
  tags?: string[];
  changeDescription?: string;
  changeType: string;
  metadata?: any;
  diff?: any;
  user: User;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyProjectStats {
  total: number;
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ projectType: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
  totalWorkflows: number;
  totalNodes: number;
  publicProjects: number;
  recentActivity: Array<{
    projectId: number;
    projectName: string;
    action: string;
    date: string;
  }>;
}

export const myProjectAPI = {
  // Get all projects
  getAll: async (params?: {
    status?: string;
    projectType?: string;
    priority?: string;
    public?: boolean;
    search?: string;
  }): Promise<MyProjectData[]> => {
    const response = await api.get('/my-projects', { params });
    return response.data;
  },

  // Get project by ID
  getById: async (id: number): Promise<MyProjectData> => {
    const response = await api.get(`/my-projects/${id}`);
    return response.data;
  },

  // Get project by slug
  getBySlug: async (slug: string): Promise<MyProjectData> => {
    const response = await api.get(`/my-projects/slug/${slug}`);
    return response.data;
  },

  // Create project
  create: async (data: CreateMyProjectRequest): Promise<MyProjectData> => {
    const response = await api.post('/my-projects', data);
    return response.data;
  },

  // Update project
  update: async (id: number, data: Partial<CreateMyProjectRequest>): Promise<MyProjectData> => {
    const response = await api.patch(`/my-projects/${id}`, data);
    return response.data;
  },

  // Delete project
  delete: async (id: number): Promise<void> => {
    await api.delete(`/my-projects/${id}`);
  },

  // Get project stats
  getStats: async (): Promise<MyProjectStats> => {
    const response = await api.get('/my-projects/stats');
    return response.data;
  },

  // Duplicate project
  duplicate: async (projectId: number, data: { name: string; slug: string; userId: number }): Promise<MyProjectData> => {
    const response = await api.post(`/my-projects/${projectId}/duplicate`, data);
    return response.data;
  }
};

export interface CreateNoteRequest {
  content: string;
  color?: string;
  expiresAt?: string;
  positionX?: number;
  positionY?: number;
}

export interface UpdateNoteRequest {
  content?: string;
  color?: string;
  expiresAt?: string;
  positionX?: number;
  positionY?: number;
}

export const notesAPI = {
  // Get all notes for current user
  getAll: async (): Promise<Note[]> => {
    const response = await api.get('/notes');
    return response.data;
  },

  // Get note by ID
  getById: async (id: number): Promise<Note> => {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  // Create note
  create: async (data: CreateNoteRequest): Promise<Note> => {
    const response = await api.post('/notes', data);
    return response.data;
  },

  // Update note
  update: async (id: number, data: UpdateNoteRequest): Promise<Note> => {
    const response = await api.patch(`/notes/${id}`, data);
    return response.data;
  },

  // Delete note
  delete: async (id: number): Promise<void> => {
    await api.delete(`/notes/${id}`);
  }
};