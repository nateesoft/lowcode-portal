import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MediaFile {
  id: string;
  name: string;
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
  fileCount: number;
  totalSize: number;
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'uploading' | 'processing' | 'complete' | 'error';
  error?: string;
}

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
  
  // File upload simulation
  const uploadFiles = async (fileList: FileList) => {
    setIsUploading(true);
    setError(null);
    
    const newFiles: MediaFile[] = [];
    const progressItems: UploadProgress[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const fileId = `file-${Date.now()}-${i}`;
      
      // Create progress tracking
      const progressItem: UploadProgress = {
        fileId,
        fileName: file.name,
        progress: 0,
        status: 'uploading'
      };
      progressItems.push(progressItem);
      
      // Simulate file processing
      const mediaFile: MediaFile = {
        id: fileId,
        name: file.name,
        type: getFileType(file.type),
        mimeType: file.type,
        size: file.size,
        url: URL.createObjectURL(file),
        thumbnailUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
        folderId: currentFolder?.id,
        tags: [],
        metadata: await extractMetadata(file),
        uploadedAt: new Date(),
        updatedAt: new Date(),
        uploadedBy: 'current-user'
      };
      
      newFiles.push(mediaFile);
    }
    
    setUploadProgress(progressItems);
    
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setUploadProgress(prev => 
        prev.map(item => ({
          ...item,
          progress,
          status: progress === 100 ? 'processing' : 'uploading'
        }))
      );
    }
    
    // Processing phase
    await new Promise(resolve => setTimeout(resolve, 500));
    setUploadProgress(prev => 
      prev.map(item => ({
        ...item,
        status: 'complete'
      }))
    );
    
    // Add files to state
    setFiles(prev => [...prev, ...newFiles]);
    
    // Update folder file count
    if (currentFolder) {
      setFolders(prev => 
        prev.map(folder => 
          folder.id === currentFolder.id
            ? { 
                ...folder, 
                fileCount: folder.fileCount + newFiles.length,
                totalSize: folder.totalSize + newFiles.reduce((sum, f) => sum + f.size, 0)
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
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
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
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFiles(prev => 
        prev.map(file => 
          fileIds.includes(file.id)
            ? { ...file, folderId: targetFolderId, updatedAt: new Date() }
            : file
        )
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
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setFiles(prev => 
        prev.map(file => 
          file.id === fileId
            ? { ...file, name: newName, updatedAt: new Date() }
            : file
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rename file');
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateFileTags = async (fileId: string, tags: string[]) => {
    setFiles(prev => 
      prev.map(file => 
        file.id === fileId
          ? { ...file, tags, updatedAt: new Date() }
          : file
      )
    );
  };
  
  const createFolder = async (name: string, parentId?: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const newFolder: MediaFolder = {
        id: `folder-${Date.now()}`,
        name,
        parentId,
        createdAt: new Date(),
        updatedAt: new Date(),
        fileCount: 0,
        totalSize: 0
      };
      
      setFolders(prev => [...prev, newFolder]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create folder');
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteFolder = async (folderId: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Delete folder and all files inside
      setFolders(prev => prev.filter(f => f.id !== folderId));
      setFiles(prev => prev.filter(f => f.folderId !== folderId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete folder');
    } finally {
      setIsLoading(false);
    }
  };
  
  const renameFolder = async (folderId: string, newName: string) => {
    setFolders(prev => 
      prev.map(folder => 
        folder.id === folderId
          ? { ...folder, name: newName, updatedAt: new Date() }
          : folder
      )
    );
  };
  
  const moveFolder = async (folderId: string, targetParentId?: string) => {
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
  
  const generateDemoData = () => {
    const demoFolders: MediaFolder[] = [
      {
        id: 'folder-1',
        name: 'Project Images',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        fileCount: 15,
        totalSize: 25600000
      },
      {
        id: 'folder-2',
        name: 'Marketing Videos',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        fileCount: 8,
        totalSize: 156800000
      },
      {
        id: 'folder-3',
        name: 'Documents',
        parentId: 'folder-1',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        fileCount: 12,
        totalSize: 5400000
      }
    ];
    
    const demoFiles: MediaFile[] = [
      {
        id: 'file-1',
        name: 'hero-banner.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 2400000,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
        folderId: 'folder-1',
        tags: ['hero', 'banner', 'homepage'],
        metadata: { width: 1920, height: 1080 },
        uploadedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
        uploadedBy: 'designer'
      },
      {
        id: 'file-2',
        name: 'product-demo.mp4',
        type: 'video',
        mimeType: 'video/mp4',
        size: 45600000,
        url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        folderId: 'folder-2',
        tags: ['product', 'demo', 'marketing'],
        metadata: { width: 1280, height: 720, duration: 120 },
        uploadedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        uploadedBy: 'marketing'
      },
      {
        id: 'file-3',
        name: 'logo-variants.zip',
        type: 'other',
        mimeType: 'application/zip',
        size: 1200000,
        url: '#',
        tags: ['logo', 'branding', 'assets'],
        uploadedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        uploadedBy: 'designer'
      },
      {
        id: 'file-4',
        name: 'team-photo.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 3200000,
        url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800',
        thumbnailUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200',
        tags: ['team', 'about', 'company'],
        metadata: { width: 2048, height: 1366 },
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        uploadedBy: 'admin'
      }
    ];
    
    setFolders(demoFolders);
    setFiles(demoFiles);
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