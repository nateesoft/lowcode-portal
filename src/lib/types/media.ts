import { BaseEntity } from './common';

export interface MediaFileData extends BaseEntity {
  name: string;
  originalName: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  folderId?: number;
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
  uploadedBy: string;
}

export interface MediaFolderData extends BaseEntity {
  name: string;
  description?: string;
  parentId?: number;
  path: string;
  isPublic: boolean;
  metadata?: any;
  tags?: string[];
  createdBy: string;
}

export interface UploadProgressData {
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
}

export interface CreateMediaFolderRequest {
  name: string;
  description?: string;
  parentId?: number;
  isPublic?: boolean;
  metadata?: any;
  tags?: string[];
}

export interface UpdateMediaFileRequest {
  name?: string;
  tags?: string[];
  folderId?: number;
}