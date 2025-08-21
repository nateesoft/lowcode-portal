import { BaseEntity } from './common';
import { User } from './user';

export interface DesignSettings {
  primaryFont: string;
  customFont?: string;
  colorTheme: string;
  multiLanguage: boolean;
  authProvider: string;
  alertTemplate: string;
  datePickerStyle: string;
}

export interface MyProjectData extends BaseEntity {
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

export interface WorkFlowData extends BaseEntity {
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
}

export interface WorkFlowNodeData extends BaseEntity {
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
  permissions?: any;
  workflowId: number;
  parentNodeId?: number;
  executionOrder: number;
}

export interface WorkFlowHistoryData extends BaseEntity {
  workflowId: number;
  version: string;
  changeType: 'created' | 'updated' | 'deleted' | 'published' | 'deployed';
  changeDescription: string;
  changeData?: any;
  changedBy: User;
  changedById: number;
}

export interface MyProjectStats {
  totalProjects: number;
  activeProjects: number;
  totalWorkflows: number;
  activeWorkflows: number;
  projectsByType: Record<string, number>;
  projectsByStatus: Record<string, number>;
  recentActivity: any[];
  collaborators: number;
}