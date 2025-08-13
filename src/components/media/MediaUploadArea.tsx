import React, { useState, useCallback } from 'react';
import { Upload, Image, Video, File, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';

interface MediaUploadAreaProps {
  className?: string;
}

const MediaUploadArea: React.FC<MediaUploadAreaProps> = ({ className = '' }) => {
  const { uploadFiles, uploadProgress, isUploading } = useMedia();
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev - 1);
    if (dragCounter <= 1) {
      setIsDragOver(false);
    }
  }, [dragCounter]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragCounter(0);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleFileInput = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  }, [uploadFiles]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension || '')) {
      return <Image className="h-4 w-4 text-blue-500" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'webm'].includes(extension || '')) {
      return <Video className="h-4 w-4 text-purple-500" />;
    }
    return <File className="h-4 w-4 text-gray-500" />;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          isDragOver
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.zip"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        
        <div className="space-y-4">
          <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${
            isDragOver 
              ? 'bg-blue-100 dark:bg-blue-900/30' 
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            <Upload className={`h-6 w-6 ${
              isDragOver ? 'text-blue-600' : 'text-gray-400'
            }`} />
          </div>
          
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {isDragOver ? 'Drop files here' : 'Upload your media files'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isDragOver 
                ? 'Release to upload files'
                : 'Drag and drop files here, or click to browse'
              }
            </p>
          </div>
          
          <div className="text-xs text-gray-400 dark:text-gray-500">
            <div>Supported formats: Images, Videos, Audio, Documents</div>
            <div>Maximum file size: 100MB per file</div>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
            Uploading Files ({uploadProgress.length})
          </h4>
          <div className="space-y-3">
            {uploadProgress.map((item) => (
              <div key={item.fileId} className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {getFileIcon(item.fileName)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {item.fileName}
                    </p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {item.status === 'uploading' && `${item.progress}%`}
                        {item.status === 'processing' && 'Processing...'}
                        {item.status === 'complete' && 'Complete'}
                        {item.status === 'error' && 'Error'}
                      </span>
                      {getStatusIcon(item.status)}
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.status === 'complete' ? 'bg-green-500' :
                        item.status === 'error' ? 'bg-red-500' :
                        'bg-blue-500'
                      }`}
                      style={{ 
                        width: item.status === 'complete' ? '100%' : 
                               item.status === 'error' ? '100%' : 
                               `${item.progress}%` 
                      }}
                    />
                  </div>
                  
                  {item.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                      {item.error}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaUploadArea;