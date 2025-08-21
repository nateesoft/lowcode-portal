import { BaseEntity } from './common';
import { User } from './user';

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

export interface FlowData extends BaseEntity {
  name: string;
  description?: string;
  isActive: boolean;
  nodes: FlowNode[];
  edges: FlowEdge[];
  viewport?: any;
  version?: string;
}

export interface FlowResponse {
  id: string;
  name: string;
  description?: string;
  status: string;
  configuration: FlowData;
  createdBy: User;
}

export interface FlowVersion extends BaseEntity {
  flowId: number;
  version: string;
  name: string;
  description?: string;
  changeDescription?: string;
  configuration: any;
  metadata?: any;
  tags?: string[];
  isActive: boolean;
  createdBy: User;
}

export interface CreateFlowVersionRequest {
  flowId: number;
  version: string;
  name?: string;
  description?: string;
  changeDescription?: string;
  configuration: any;
  metadata?: any;
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateFlowVersionRequest {
  version?: string;
  name?: string;
  description?: string;
  changeDescription?: string;
  configuration?: any;
  metadata?: any;
  tags?: string[];
  isActive?: boolean;
}

export interface NodeContentData extends BaseEntity {
  nodeId: string;
  name: string;
  description?: string;
  content: any;
  contentType: 'html' | 'markdown' | 'json' | 'javascript' | 'css' | 'text' | 'other';
  version: string;
  isActive: boolean;
  metadata?: any;
  tags?: string[];
  createdBy: User;
}

export interface NodeContentHistoryData extends BaseEntity {
  nodeContentId: number;
  version: string;
  content: any;
  changeDescription?: string;
  changeType: 'manual' | 'auto' | 'import' | 'restore';
  metadata?: any;
  createdBy: User;
}

export interface CreateNodeContentRequest {
  nodeId: string;
  name: string;
  description?: string;
  content: any;
  contentType: 'html' | 'markdown' | 'json' | 'javascript' | 'css' | 'text' | 'other';
  metadata?: any;
  tags?: string[];
  changeDescription?: string;
}