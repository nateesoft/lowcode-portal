import axios from 'axios';
import { Note } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Temporarily disable to test CORS issues
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
        console.log('401 error detected, attempting token refresh...');
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          console.log('Refresh token found, calling refresh endpoint...');
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          }, {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          });
          
          console.log('Token refresh response:', response.data);
          const newAccessToken = response.data.access_token;
          localStorage.setItem('access_token', newAccessToken);
          
          // Update the user data if provided
          if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
          }
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log('Retrying original request with new token...');
          return api(originalRequest);
        } else {
          console.log('No refresh token found, redirecting to login');
          throw new Error('No refresh token available');
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, redirect to login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        
        // Only redirect if we're not already on the login page
        if (window.location.pathname !== '/login') {
          console.log('Redirecting to login page...');
          window.location.href = '/login';
        }
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

export interface KeycloakUserSyncRequest {
  keycloakId: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  emailVerified?: boolean;
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

  syncKeycloakUser: async (data: KeycloakUserSyncRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/keycloak-sync', data);
    const authResponse = response.data;
    
    // Store tokens in localStorage
    localStorage.setItem('access_token', authResponse.tokens.access_token);
    localStorage.setItem('refresh_token', authResponse.tokens.refresh_token);
    localStorage.setItem('user', JSON.stringify(authResponse.user));
    
    return authResponse;
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
  userId?: number;
  // JSONForm specific properties
  jsonSchema?: string;
  uiSchema?: string;
  formData?: string;
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
  // JSONForm specific properties
  jsonSchema?: string;
  uiSchema?: string;
  formData?: string;
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
  designSettings?: DesignSettings;
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

export interface DesignSettings {
  primaryFont: string;
  customFont?: string;
  colorTheme: string;
  multiLanguage: boolean;
  authProvider: string;
  alertTemplate: string;
  datePickerStyle: string;
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
  designSettings?: DesignSettings;
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

// User Type API interfaces
export interface UserType {
  id?: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserTypeRequest {
  name: string;
  description?: string;
  permissions: string[];
  isActive?: boolean;
}

export interface UpdateUserTypeRequest {
  id: number;
  name?: string;
  description?: string;
  permissions?: string[];
  isActive?: boolean;
}

export const userTypeAPI = {
  // Get all user types
  getAll: async (): Promise<UserType[]> => {
    const response = await fetch('/api/user-types');
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Create user type
  create: async (data: CreateUserTypeRequest): Promise<UserType> => {
    const response = await fetch('/api/user-types', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Update user type
  update: async (data: UpdateUserTypeRequest): Promise<UserType> => {
    const response = await fetch('/api/user-types', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Delete user type
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`/api/user-types?id=${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
  },
};

// Flow Version API interfaces
export interface FlowVersion {
  id?: number;
  flowId: number;
  version: string;
  versionNumber: number;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  metadata?: any;
  createdBy: number;
  createdAt?: string;
  isActive?: boolean;
  changeLog?: string;
}

export interface CreateFlowVersionRequest {
  flowId: number;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  metadata?: any;
  createdBy: number;
  changeLog?: string;
  versionType?: 'major' | 'minor' | 'patch';
}

export interface UpdateFlowVersionRequest {
  id: number;
  name?: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  metadata?: any;
  isActive?: boolean;
  changeLog?: string;
  action?: 'update' | 'restore';
}

export const flowVersionAPI = {
  // Get all versions for a flow
  getByFlowId: async (flowId: number): Promise<FlowVersion[]> => {
    const response = await fetch(`/api/flow-versions?flowId=${flowId}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Get active version for a flow
  getActiveVersion: async (flowId: number): Promise<FlowVersion | null> => {
    const response = await fetch(`/api/flow-versions?flowId=${flowId}&isActive=true`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data.length > 0 ? result.data[0] : null;
  },

  // Get specific version
  getById: async (versionId: number): Promise<FlowVersion> => {
    const response = await fetch(`/api/flow-versions?versionId=${versionId}`);
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data[0];
  },

  // Create new version
  create: async (data: CreateFlowVersionRequest): Promise<FlowVersion> => {
    const response = await fetch('/api/flow-versions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Update version
  update: async (data: UpdateFlowVersionRequest): Promise<FlowVersion> => {
    const response = await fetch('/api/flow-versions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Restore version (make it active)
  restore: async (versionId: number, changeLog?: string): Promise<FlowVersion> => {
    const response = await fetch('/api/flow-versions', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: versionId,
        action: 'restore',
        changeLog: changeLog || 'Version restored'
      }),
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
    return result.data;
  },

  // Delete version
  delete: async (versionId: number): Promise<void> => {
    const response = await fetch(`/api/flow-versions?id=${versionId}`, {
      method: 'DELETE',
    });
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error);
    }
  },
};

// User Groups API interfaces
export interface UserGroupData {
  id?: number;
  name: string;
  description?: string;
  status?: string;
  permissions?: string[];
  settings?: any;
  color?: string;
  icon?: string;
  isSystem?: boolean;
  createdById?: number;
  createdBy?: User;
  members?: User[];
  projectId?: number;
  project?: MyProjectData;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserGroupRequest {
  name: string;
  description?: string;
  status?: string;
  permissions?: string[];
  settings?: any;
  color?: string;
  icon?: string;
  memberIds?: number[];
  projectId?: number;
}

export interface UpdateUserGroupRequest {
  name?: string;
  description?: string;
  status?: string;
  permissions?: string[];
  settings?: any;
  color?: string;
  icon?: string;
  projectId?: number;
}

export interface UserGroupStats {
  totalGroups: number;
  totalMembers: number;
  byStatus: { [key: string]: number };
  averageMembersPerGroup: number;
  topGroups: Array<{
    id: number;
    name: string;
    memberCount: number;
    status: string;
  }>;
}

export interface AddMembersDto {
  userIds: number[];
}

export const userGroupAPI = {
  // Get all user groups
  getAll: async (includeAll?: boolean): Promise<UserGroupData[]> => {
    let url = '/user-groups';
    if (includeAll) {
      url += '?all=true';
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get user group by ID
  getById: async (id: number): Promise<UserGroupData> => {
    const response = await api.get(`/user-groups/${id}`);
    return response.data;
  },

  // Create user group
  create: async (data: CreateUserGroupRequest): Promise<UserGroupData> => {
    const response = await api.post('/user-groups', data);
    return response.data;
  },

  // Update user group
  update: async (id: number, data: UpdateUserGroupRequest): Promise<UserGroupData> => {
    const response = await api.patch(`/user-groups/${id}`, data);
    return response.data;
  },

  // Delete user group
  delete: async (id: number): Promise<void> => {
    await api.delete(`/user-groups/${id}`);
  },

  // Get groups stats
  getStats: async (): Promise<UserGroupStats> => {
    const response = await api.get('/user-groups/stats');
    return response.data;
  },

  // Get groups that user belongs to
  getMyGroups: async (): Promise<UserGroupData[]> => {
    const response = await api.get('/user-groups/my-groups');
    return response.data;
  },

  // Add members to group
  addMembers: async (id: number, userIds: number[]): Promise<UserGroupData> => {
    const response = await api.post(`/user-groups/${id}/members`, { userIds });
    return response.data;
  },

  // Remove members from group
  removeMembers: async (id: number, userIds: number[]): Promise<UserGroupData> => {
    const response = await api.delete(`/user-groups/${id}/members`, { data: { userIds } });
    return response.data;
  },
};

// Users API
export const usersAPI = {
  // Get all users
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  // Get user by ID
  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // Update user
  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  // Delete user
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

// Services API
export interface ServiceData {
  id?: number;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceResponse extends ServiceData {
  id: number;
  createdAt: string;
  updatedAt: string;
}

export const serviceAPI = {
  // Get all services
  getAll: async (userId?: number): Promise<ServiceResponse[]> => {
    let url = '/services';
    if (userId) {
      url += `?userId=${userId}`;
    }
    const response = await api.get(url);
    return response.data;
  },

  // Get active services
  getActive: async (): Promise<ServiceResponse[]> => {
    const response = await api.get('/services/active');
    return response.data;
  },

  // Get service by ID
  getById: async (id: number): Promise<ServiceResponse> => {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Create new service
  create: async (data: ServiceData): Promise<ServiceResponse> => {
    const response = await api.post('/services', data);
    return response.data;
  },

  // Update service
  update: async (id: number, data: Partial<ServiceData>): Promise<ServiceResponse> => {
    const response = await api.patch(`/services/${id}`, data);
    return response.data;
  },

  // Delete service
  delete: async (id: number): Promise<void> => {
    await api.delete(`/services/${id}`);
  },
};

// ===== SECRET KEY MANAGEMENT API =====

export interface SecretKeyData {
  id?: number;
  name: string;
  description?: string;
  value: string;
  type: 'api_key' | 'password' | 'certificate' | 'token';
  expiresAt?: string;
  tags: string[];
  isActive?: boolean;
  createdBy?: User;
  createdById?: number;
  createdAt?: string;
  updatedAt?: string;
  lastModified?: string;
}

export interface CreateSecretKeyRequest {
  name: string;
  description?: string;
  value: string;
  type: 'api_key' | 'password' | 'certificate' | 'token';
  expiresAt?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateSecretKeyRequest {
  name?: string;
  description?: string;
  value?: string;
  type?: 'api_key' | 'password' | 'certificate' | 'token';
  expiresAt?: string;
  tags?: string[];
  isActive?: boolean;
}

export interface SecretKeyStats {
  total: number;
  active: number;
  expired: number;
  expiringSoon: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  recentActivity: Array<{
    id: number;
    name: string;
    action: string;
    date: string;
  }>;
}

export const secretKeyAPI = {
  // Get all secret keys
  getAll: async (): Promise<SecretKeyData[]> => {
    const response = await api.get('/secret-keys');
    return response.data;
  },

  // Get secret key by ID
  getById: async (id: number): Promise<SecretKeyData> => {
    const response = await api.get(`/secret-keys/${id}`);
    return response.data;
  },

  // Create secret key
  create: async (data: CreateSecretKeyRequest): Promise<SecretKeyData> => {
    const response = await api.post('/secret-keys', data);
    return response.data;
  },

  // Update secret key
  update: async (id: number, data: UpdateSecretKeyRequest): Promise<SecretKeyData> => {
    const response = await api.patch(`/secret-keys/${id}`, data);
    return response.data;
  },

  // Delete secret key
  delete: async (id: number): Promise<void> => {
    await api.delete(`/secret-keys/${id}`);
  },

  // Get secret key stats
  getStats: async (): Promise<SecretKeyStats> => {
    const response = await api.get('/secret-keys/stats');
    return response.data;
  },

  // Get expired secrets
  getExpired: async (): Promise<SecretKeyData[]> => {
    const response = await api.get('/secret-keys/expired');
    return response.data;
  },

  // Get expiring soon secrets
  getExpiringSoon: async (days: number = 7): Promise<SecretKeyData[]> => {
    const response = await api.get(`/secret-keys/expiring-soon?days=${days}`);
    return response.data;
  },

  // Filter by type
  getByType: async (type: string): Promise<SecretKeyData[]> => {
    const response = await api.get(`/secret-keys/type/${type}`);
    return response.data;
  },

  // Search secrets
  search: async (query: string): Promise<SecretKeyData[]> => {
    const response = await api.get(`/secret-keys/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Generate random secret value
  generateRandom: async (length: number = 32, includeSpecialChars: boolean = true): Promise<{ value: string }> => {
    const response = await api.post('/secret-keys/generate', { 
      length, 
      includeSpecialChars 
    });
    return response.data;
  },

  // Validate secret key
  validate: async (id: number): Promise<{ isValid: boolean; errors?: string[] }> => {
    const response = await api.post(`/secret-keys/${id}/validate`);
    return response.data;
  },

  // Rotate secret key
  rotate: async (id: number, newValue?: string): Promise<SecretKeyData> => {
    const response = await api.post(`/secret-keys/${id}/rotate`, { newValue });
    return response.data;
  }
};

// Centralized API object
export const apiClient = {
  // User Groups
  getUserGroups: () => userGroupAPI.getAll(),
  createUserGroup: (data: CreateUserGroupRequest) => userGroupAPI.create(data),
  updateUserGroup: (id: number, data: UpdateUserGroupRequest) => userGroupAPI.update(id, data),
  deleteUserGroup: (id: number) => userGroupAPI.delete(id),
  addMembersToGroup: (id: number, data: AddMembersDto) => userGroupAPI.addMembers(id, data.userIds),
  removeMembersFromGroup: (id: number, data: AddMembersDto) => userGroupAPI.removeMembers(id, data.userIds),
  
  // Projects
  getMyProjects: () => myProjectAPI.getAll(),
  
  // Users  
  getUsers: () => usersAPI.getAll(),

  // Secret Keys
  getSecretKeys: () => secretKeyAPI.getAll(),
  createSecretKey: (data: CreateSecretKeyRequest) => secretKeyAPI.create(data),
  updateSecretKey: (id: number, data: UpdateSecretKeyRequest) => secretKeyAPI.update(id, data),
  deleteSecretKey: (id: number) => secretKeyAPI.delete(id),
  getSecretKeyStats: () => secretKeyAPI.getStats(),
};

// ===== MEDIA API =====

export interface MediaFileData {
  id: string;
  name: string;
  originalName: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folderId?: string;
  tags: string[];
  metadata?: {
    width?: number;
    height?: number;
    duration?: number;
    frameRate?: number;
    bitrate?: number;
    colorSpace?: string;
    orientation?: number;
  };
  uploadedAt: string;
  updatedAt: string;
  uploadedBy: string;
}

export interface MediaFolderData {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  fileCount?: number;
  totalSize?: number;
  files?: MediaFileData[];
  children?: MediaFolderData[];
}

export interface UploadProgressData {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

export interface CreateMediaFolderRequest {
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
}

export interface UpdateMediaFileRequest {
  name?: string;
  tags?: string[];
  folderId?: string;
}

export const mediaAPI = {
  // Upload files
  uploadFiles: async (files: FileList, folderId?: string): Promise<{ data: MediaFileData[]; message: string }> => {
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }
    
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get files
  getFiles: async (folderId?: string): Promise<{ data: MediaFileData[] }> => {
    let url = '/media/files';
    if (folderId) {
      url += `?folderId=${folderId}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get file by ID
  getFile: async (id: string): Promise<{ data: MediaFileData }> => {
    const response = await api.get(`/media/files/${id}`);
    return response.data;
  },

  // Update file
  updateFile: async (id: string, data: UpdateMediaFileRequest): Promise<{ data: MediaFileData }> => {
    const response = await api.put(`/media/files/${id}`, data);
    return response.data;
  },

  // Delete file
  deleteFile: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/media/files/${id}`);
    return response.data;
  },

  // Delete multiple files
  deleteFiles: async (fileIds: string[]): Promise<{ message: string }> => {
    const response = await api.delete('/media/files', { data: { fileIds } });
    return response.data;
  },

  // Move files
  moveFiles: async (fileIds: string[], folderId?: string): Promise<{ data: MediaFileData[] }> => {
    const response = await api.put('/media/files/move', { fileIds, folderId });
    return response.data;
  },

  // Update file tags
  updateFileTags: async (id: string, tags: string[]): Promise<{ data: MediaFileData }> => {
    const response = await api.put(`/media/files/${id}/tags`, { tags });
    return response.data;
  },

  // Rename file
  renameFile: async (id: string, name: string): Promise<{ data: MediaFileData }> => {
    const response = await api.put(`/media/files/${id}/rename`, { name });
    return response.data;
  },

  // Create folder
  createFolder: async (data: CreateMediaFolderRequest): Promise<{ data: MediaFolderData }> => {
    const response = await api.post('/media/folders', data);
    return response.data;
  },

  // Get folders
  getFolders: async (parentId?: string): Promise<{ data: MediaFolderData[] }> => {
    let url = '/media/folders';
    if (parentId) {
      url += `?parentId=${parentId}`;
    }
    
    const response = await api.get(url);
    return response.data;
  },

  // Get folder by ID
  getFolder: async (id: string): Promise<{ data: MediaFolderData }> => {
    const response = await api.get(`/media/folders/${id}`);
    return response.data;
  },

  // Delete folder
  deleteFolder: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/media/folders/${id}`);
    return response.data;
  },
};

// Export the centralized API client as the default export