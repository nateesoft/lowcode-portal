import { BaseEntity } from './common';
import { User } from './user';

export interface ComponentData extends BaseEntity {
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
  createdBy?: User;
  userId?: number;
  // JSONForm specific properties
  jsonSchema?: string;
  uiSchema?: string;
  formData?: string;
}

export interface ComponentHistoryData extends BaseEntity {
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