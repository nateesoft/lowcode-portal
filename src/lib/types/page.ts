import { BaseEntity } from './common';
import { User } from './user';

export interface PageData extends BaseEntity {
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
  createdBy?: User;
}

export interface PageHistoryData extends BaseEntity {
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
  types: Array<{
    type: string;
    count: number;
  }>;
}