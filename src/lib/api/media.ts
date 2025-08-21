import apiClient from './client';
import { 
  MediaFileData, 
  MediaFolderData, 
  UploadProgressData, 
  CreateMediaFolderRequest, 
  UpdateMediaFileRequest 
} from '../types/media';

export const mediaAPI = {
  // Files
  getFiles: async (folderId?: number) => {
    let url = '/media/files';
    if (folderId) {
      url += `?folderId=${folderId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getFileById: async (id: number) => {
    const response = await apiClient.get(`/media/files/${id}`);
    return response.data;
  },

  uploadFile: async (file: File, folderId?: number, onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const response = await apiClient.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  },

  uploadMultiple: async (files: File[], folderId?: number, onProgress?: (fileName: string, progress: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });
    if (folderId) {
      formData.append('folderId', folderId.toString());
    }

    const response = await apiClient.post('/media/upload-multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Note: For multiple files, we can't track individual file progress easily
          onProgress('batch', progress);
        }
      },
    });
    return response.data;
  },

  updateFile: async (id: number, data: UpdateMediaFileRequest) => {
    const response = await apiClient.put(`/media/files/${id}`, data);
    return response.data;
  },

  deleteFile: async (id: number) => {
    const response = await apiClient.delete(`/media/files/${id}`);
    return response.data;
  },

  moveFile: async (id: number, folderId?: number) => {
    const response = await apiClient.patch(`/media/files/${id}/move`, { folderId });
    return response.data;
  },

  // Folders
  getFolders: async (parentId?: number) => {
    let url = '/media/folders';
    if (parentId) {
      url += `?parentId=${parentId}`;
    }
    const response = await apiClient.get(url);
    return response.data;
  },

  getFolderById: async (id: number) => {
    const response = await apiClient.get(`/media/folders/${id}`);
    return response.data;
  },

  createFolder: async (data: CreateMediaFolderRequest) => {
    const response = await apiClient.post('/media/folders', data);
    return response.data;
  },

  updateFolder: async (id: number, data: Partial<CreateMediaFolderRequest>) => {
    const response = await apiClient.put(`/media/folders/${id}`, data);
    return response.data;
  },

  deleteFolder: async (id: number) => {
    const response = await apiClient.delete(`/media/folders/${id}`);
    return response.data;
  },

  moveFolder: async (id: number, parentId?: number) => {
    const response = await apiClient.patch(`/media/folders/${id}/move`, { parentId });
    return response.data;
  },

  // Search and utilities
  search: async (query: string, type?: string, folderId?: number) => {
    const params = new URLSearchParams();
    params.append('q', query);
    if (type) params.append('type', type);
    if (folderId) params.append('folderId', folderId.toString());
    
    const response = await apiClient.get(`/media/search?${params}`);
    return response.data;
  },

  getStats: async () => {
    const response = await apiClient.get('/media/stats');
    return response.data;
  },

  generateThumbnail: async (id: number) => {
    const response = await apiClient.post(`/media/files/${id}/thumbnail`);
    return response.data;
  }
};