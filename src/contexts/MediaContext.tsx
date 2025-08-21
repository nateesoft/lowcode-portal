import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mediaAPI, MediaFileData, MediaFolderData, UploadProgressData, CreateMediaFolderRequest } from '@/lib/api';

// Use API types directly with proper date handling
export interface MediaFile {
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
  uploadedAt: Date;
  updatedAt: Date;
  uploadedBy: string;
}

export interface MediaFolder {
  id: string;
  name: string;
  parentId?: string;
  color?: string;
  icon?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  fileCount: number;
  totalSize: number;
}

export type UploadProgress = UploadProgressData;

export type ViewMode = 'grid' | 'list';
export type SortBy = 'name' | 'date' | 'size' | 'type';
export type SortOrder = 'asc' | 'desc';

interface MediaContextType {
  // Files and folders
  files: MediaFile[];
  folders: MediaFolder[];
  currentFolder: MediaFolder | null;
  
  // UI State
  viewMode: ViewMode;
  sortBy: SortBy;
  sortOrder: SortOrder;
  selectedFiles: string[];
  searchQuery: string;
  filterType: string;
  
  // Upload state
  uploadProgress: UploadProgress[];
  isUploading: boolean;
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // File operations
  uploadFiles: (files: FileList) => Promise<void>;
  deleteFiles: (fileIds: string[]) => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderId?: string) => Promise<void>;
  copyFiles: (fileIds: string[]) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  updateFileTags: (fileId: string, tags: string[]) => Promise<void>;
  
  // Folder operations
  createFolder: (name: string, parentId?: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFolder: (folderId: string, newName: string) => Promise<void>;
  moveFolder: (folderId: string, targetParentId?: string) => Promise<void>;
  
  // Navigation
  navigateToFolder: (folderId?: string) => void;
  goBack: () => void;
  
  // Selection
  selectFile: (fileId: string) => void;
  selectFiles: (fileIds: string[]) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // View controls
  setViewMode: (mode: ViewMode) => void;
  setSorting: (sortBy: SortBy, order: SortOrder) => void;
  setSearchQuery: (query: string) => void;
  setFilterType: (type: string) => void;
  
  // Demo data
  generateDemoData: () => void;
  
  // Utility
  getFilesByFolder: (folderId?: string) => MediaFile[];
  getFoldersByParent: (parentId?: string) => MediaFolder[];
  getFileTypeIcon: (file: MediaFile) => string;
  formatFileSize: (size: number) => string;
  getBreadcrumbs: () => MediaFolder[];
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export const useMedia = () => {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error('useMedia must be used within a MediaProvider');
  }
  return context;
};

interface MediaProviderProps {
  children: ReactNode;
}

export const MediaProvider: React.FC<MediaProviderProps> = ({ children }) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [currentFolder, setCurrentFolder] = useState<MediaFolder | null>(null);
  
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadFiles();
    loadFolders();
  }, [currentFolder?.id]);

  const convertApiFileToLocal = (apiFile: MediaFileData): MediaFile => ({
    ...apiFile,
    uploadedAt: new Date(apiFile.uploadedAt),
    updatedAt: new Date(apiFile.updatedAt),
  });

  const convertApiFolderToLocal = (apiFolder: MediaFolderData): MediaFolder => ({
    ...apiFolder,
    createdAt: new Date(apiFolder.createdAt),
    updatedAt: new Date(apiFolder.updatedAt),
    fileCount: apiFolder.files?.length || 0,
    totalSize: apiFolder.files?.reduce((sum, file) => sum + file.size, 0) || 0,
  });

  const loadFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mediaAPI.getFiles(currentFolder?.id);
      const convertedFiles = response.data.map(convertApiFileToLocal);
      setFiles(convertedFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const response = await mediaAPI.getFolders(currentFolder?.id);
      const convertedFolders = response.data.map(convertApiFolderToLocal);
      setFolders(convertedFolders);
    } catch (err: any) {
      console.error('Failed to load folders:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: {
          url: err.config?.url,
          baseURL: err.config?.baseURL,
          method: err.config?.method
        }
      });
      setError(`ไม่สามารถโหลดโฟลเดอร์ได้: ${err.message || 'การเชื่อมต่อ API ล้มเหลว'}`);
      // Set empty folders to prevent further errors
      setFolders([]);
    }
  };
  
  // Real file upload using API
  const uploadFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setError(null);
    
    try {
      // Create progress tracking for each file
      const progressItems: UploadProgress[] = Array.from(fileList).map((file, i) => ({
        fileId: `file-${Date.now()}-${i}`,
        fileName: file.name,
        progress: 0,
        status: 'uploading' as const
      }));
      
      setUploadProgress(progressItems);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => 
          prev.map(item => ({
            ...item,
            progress: Math.min(item.progress + 10, 90)
          }))
        );
      }, 200);

      // Upload files via API
      const response = await mediaAPI.uploadFiles(fileList, currentFolder?.id);
      
      // Clear progress simulation
      clearInterval(progressInterval);
      
      // Show completion
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          progress: 100,
          status: 'complete' as const
        }))
      );

      // Convert API response to local format
      const uploadedFiles: MediaFile[] = response.data.map(convertApiFileToLocal);

      // Update files state
      setFiles(prev => [...prev, ...uploadedFiles]);

      // Update folder file count
      if (currentFolder) {
        setFolders(prev => 
          prev.map(folder => 
            folder.id === currentFolder.id
              ? { 
                  ...folder, 
                  fileCount: folder.fileCount + uploadedFiles.length,
                  totalSize: folder.totalSize + uploadedFiles.reduce((sum, f) => sum + f.size, 0)
                }
              : folder
          )
        );
      }

      // Clear progress after delay
      setTimeout(() => {
        setUploadProgress([]);
        setIsUploading(false);
      }, 2000);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          status: 'error' as const,
          error: 'Upload failed'
        }))
      );
      setIsUploading(false);
    }
  };
  
  const getFileType = (mimeType: string): MediaFile['type'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) return 'document';
    return 'other';
  };
  
  const extractMetadata = async (file: File): Promise<MediaFile['metadata']> => {
    return new Promise((resolve) => {
      if (file.type.startsWith('image/')) {
        const img = new Image();
        img.onload = () => {
          resolve({
            width: img.width,
            height: img.height
          });
        };
        img.onerror = () => resolve({});
        img.src = URL.createObjectURL(file);
      } else if (file.type.startsWith('video/')) {
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
          resolve({
            width: video.videoWidth,
            height: video.videoHeight,
            duration: video.duration
          });
        };
        video.onerror = () => resolve({});
        video.src = URL.createObjectURL(file);
      } else {
        resolve({});
      }
    });
  };
  
  const deleteFiles = async (fileIds: string[]) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Delete files via API
      if (fileIds.length === 1) {
        await mediaAPI.deleteFile(fileIds[0]);
      } else {
        await mediaAPI.deleteFiles(fileIds);
      }
      
      const deletedFiles = files.filter(f => fileIds.includes(f.id));
      const deletedSize = deletedFiles.reduce((sum, f) => sum + f.size, 0);
      
      setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));
      setSelectedFiles([]);
      
      // Update folder counts
      if (currentFolder) {
        setFolders(prev => 
          prev.map(folder => 
            folder.id === currentFolder.id
              ? { 
                  ...folder, 
                  fileCount: folder.fileCount - deletedFiles.length,
                  totalSize: folder.totalSize - deletedSize
                }
              : folder
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const moveFiles = async (fileIds: string[], targetFolderId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Move files via API
      const response = await mediaAPI.moveFiles(fileIds, targetFolderId);
      
      // Update local state with response data
      const movedFiles = response.data.map(convertApiFileToLocal);
      
      setFiles(prev => 
        prev.map(file => {
          const movedFile = movedFiles.find(moved => moved.id === file.id);
          return movedFile || file;
        })
      );
      
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const copyFiles = async (fileIds: string[]) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const filesToCopy = files.filter(f => fileIds.includes(f.id));
      const copiedFiles = filesToCopy.map(file => ({
        ...file,
        id: `${file.id}-copy-${Date.now()}`,
        name: `Copy of ${file.name}`,
        uploadedAt: new Date(),
        updatedAt: new Date()
      }));
      
      setFiles(prev => [...prev, ...copiedFiles]);
      setSelectedFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to copy files');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renameFile = async (fileId: string, newName: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await mediaAPI.renameFile(fileId, newName);
      const renamedFile = convertApiFileToLocal(response.data);
      
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId ? renamedFile : file
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename file');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFileTags = async (fileId: string, tags: string[]) => {
    try {
      setError(null);
      const response = await mediaAPI.updateFileTags(fileId, tags);
      const updatedFile = convertApiFileToLocal(response.data);
      
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId ? updatedFile : file
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update file tags');
    }
  };
  
  const createFolder = async (name: string, parentId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const createData: CreateMediaFolderRequest = { name, parentId };
      const response = await mediaAPI.createFolder(createData);
      const newFolder = convertApiFolderToLocal(response.data);
      
      setFolders(prev => [...prev, newFolder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteFolder = async (folderId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await mediaAPI.deleteFolder(folderId);
      
      // Delete folder and all files inside from local state
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setFiles(prev => prev.filter(f => f.folderId !== folderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renameFolder = async (folderId: string, newName: string) => {
    // Note: Add API call when backend supports folder rename
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId
          ? { ...folder, name: newName, updatedAt: new Date() }
          : folder
      )
    );
  };
  
  const moveFolder = async (folderId: string, targetParentId?: string) => {
    // Note: Add API call when backend supports folder move
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId
          ? { ...folder, parentId: targetParentId, updatedAt: new Date() }
          : folder
      )
    );
  };
  
  const navigateToFolder = (folderId?: string) => {
    const folder = folderId ? folders.find(f => f.id === folderId) : null;
    setCurrentFolder(folder);
    setSelectedFiles([]);
  };
  
  const goBack = () => {
    if (currentFolder?.parentId) {
      const parentFolder = folders.find(f => f.id === currentFolder.parentId);
      setCurrentFolder(parentFolder || null);
    } else {
      setCurrentFolder(null);
    }
    setSelectedFiles([]);
  };
  
  const selectFile = (fileId: string) => {
    setSelectedFiles(prev => 
      prev.includes(fileId)
        ? prev.filter(id => id !== fileId)
        : [...prev, fileId]
    );
  };
  
  const selectFiles = (fileIds: string[]) => {
    setSelectedFiles(fileIds);
  };
  
  const clearSelection = () => {
    setSelectedFiles([]);
  };
  
  const selectAll = () => {
    const visibleFiles = getFilesByFolder(currentFolder?.id);
    setSelectedFiles(visibleFiles.map(f => f.id));
  };
  
  const setSorting = (newSortBy: SortBy, newSortOrder: SortOrder) => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  };
  
  const getFilesByFolder = (folderId?: string) => {
    let filteredFiles = files.filter(f => f.folderId === folderId);
    
    // Apply search filter
    if (searchQuery) {
      filteredFiles = filteredFiles.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (filterType !== 'all') {
      filteredFiles = filteredFiles.filter(f => f.type === filterType);
    }
    
    // Apply sorting
    filteredFiles.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = a.uploadedAt.getTime() - b.uploadedAt.getTime();
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
    
    return filteredFiles;
  };
  
  const getFoldersByParent = (parentId?: string) => {
    return folders.filter(f => f.parentId === parentId);
  };
  
  const getFileTypeIcon = (file: MediaFile): string => {
    switch (file.type) {
      case 'image': return '🖼️';
      case 'video': return '🎥';
      case 'audio': return '🎵';
      case 'document': return '📄';
      default: return '📁';
    }
  };
  
  const formatFileSize = (size: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };
  
  const getBreadcrumbs = (): MediaFolder[] => {
    const breadcrumbs: MediaFolder[] = [];
    let current = currentFolder;
    
    while (current) {
      breadcrumbs.unshift(current);
      current = current.parentId ? folders.find(f => f.id === current!.parentId) : null;
    }
    
    return breadcrumbs;
  };
  
  const generateDemoData = async () => {
    // Refresh data instead of generating demo data
    await loadFiles();
    await loadFolders();
  };
  
  const value: MediaContextType = {
    files,
    folders,
    currentFolder,
    viewMode,
    sortBy,
    sortOrder,
    selectedFiles,
    searchQuery,
    filterType,
    uploadProgress,
    isUploading,
    isLoading,
    error,
    uploadFiles,
    deleteFiles,
    moveFiles,
    copyFiles,
    renameFile,
    updateFileTags,
    createFolder,
    deleteFolder,
    renameFolder,
    moveFolder,
    navigateToFolder,
    goBack,
    selectFile,
    selectFiles,
    clearSelection,
    selectAll,
    setViewMode,
    setSorting,
    setSearchQuery,
    setFilterType,
    generateDemoData,
    getFilesByFolder,
    getFoldersByParent,
    getFileTypeIcon,
    formatFileSize,
    getBreadcrumbs
  };
  
  return (
    <MediaContext.Provider value={value}>
      {children}
    </MediaContext.Provider>
  );
};