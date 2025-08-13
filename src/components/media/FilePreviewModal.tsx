import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Edit3, 
  Trash2, 
  Share2, 
  Star,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Calendar,
  HardDrive,
  User,
  Tag
} from 'lucide-react';
import { useMedia, MediaFile } from '@/contexts/MediaContext';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: MediaFile | null;
  onEdit: (file: MediaFile) => void;
  onDelete: (file: MediaFile) => void;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ 
  isOpen, 
  onClose, 
  file,
  onEdit,
  onDelete
}) => {
  const { files, formatFileSize } = useMedia();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  if (!isOpen || !file) return null;

  // Find current file index in the files array
  const fileIndex = files.findIndex(f => f.id === file.id);
  const currentFile = files[fileIndex + currentIndex] || file;

  const navigateFile = (direction: 'prev' | 'next') => {
    if (direction === 'prev' && fileIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else if (direction === 'next' && fileIndex < files.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    // Reset view state when changing files
    setZoom(1);
    setRotation(0);
    setIsPlaying(false);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.25, Math.min(4, prev + delta)));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const renderPreview = () => {
    switch (currentFile.type) {
      case 'image':
        return (
          <div className="flex items-center justify-center h-full bg-black/90">
            <img
              src={currentFile.url}
              alt={currentFile.name}
              className="max-w-full max-h-full object-contain transition-transform duration-200"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
              }}
            />
          </div>
        );

      case 'video':
        return (
          <div className="flex items-center justify-center h-full bg-black">
            <video
              src={currentFile.url}
              controls
              className="max-w-full max-h-full"
              autoPlay={isPlaying}
              muted={isMuted}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-900 to-blue-900">
            <div className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto bg-white/10 rounded-full flex items-center justify-center">
                <Volume2 className="h-16 w-16 text-white" />
              </div>
              <div className="text-white">
                <h3 className="text-xl font-semibold mb-2">{currentFile.name}</h3>
                <audio
                  src={currentFile.url}
                  controls
                  className="w-full"
                  autoPlay={isPlaying}
                  muted={isMuted}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
            <div className="text-center space-y-4">
              <div className="w-24 h-24 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <HardDrive className="h-12 w-12 text-gray-400" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {currentFile.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Preview not available for this file type
                </p>
                <button className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                  <Download className="h-4 w-4" />
                  <span>Download to view</span>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="flex items-center space-x-4">
          <h2 className="text-white font-medium truncate max-w-md">
            {currentFile.name}
          </h2>
          <span className="text-gray-300 text-sm">
            {formatFileSize(currentFile.size)}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Image controls */}
          {currentFile.type === 'image' && (
            <>
              <button
                onClick={() => handleZoom(-0.25)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={zoom <= 0.25}
              >
                <ZoomOut className="h-5 w-5" />
              </button>
              <span className="text-white text-sm min-w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => handleZoom(0.25)}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                disabled={zoom >= 4}
              >
                <ZoomIn className="h-5 w-5" />
              </button>
              <button
                onClick={handleRotate}
                className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                <RotateCw className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Navigation */}
          <button
            onClick={() => navigateFile('prev')}
            disabled={fileIndex <= 0}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-gray-300 text-sm min-w-16 text-center">
            {fileIndex + 1 + currentIndex} / {files.length}
          </span>
          <button
            onClick={() => navigateFile('next')}
            disabled={fileIndex >= files.length - 1}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Actions */}
          <div className="h-6 w-px bg-gray-600 mx-2" />
          
          <button
            onClick={() => onEdit(currentFile)}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <Edit3 className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Download className="h-5 w-5" />
          </button>
          
          <button className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors">
            <Share2 className="h-5 w-5" />
          </button>
          
          <button
            onClick={() => onDelete(currentFile)}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="h-5 w-5" />
          </button>

          <div className="h-6 w-px bg-gray-600 mx-2" />
          
          <button
            onClick={onClose}
            className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Preview Area */}
        <div className="flex-1 relative">
          {renderPreview()}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* File Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                File Details
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Type</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {currentFile.type}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Size</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatFileSize(currentFile.size)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Uploaded</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentFile.uploadedAt.toLocaleDateString()}
                  </span>
                </div>
                
                {/* Metadata */}
                {currentFile.metadata && (
                  <>
                    {currentFile.metadata.width && currentFile.metadata.height && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Dimensions</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {currentFile.metadata.width} × {currentFile.metadata.height}
                        </span>
                      </div>
                    )}
                    {currentFile.metadata.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {Math.floor(currentFile.metadata.duration / 60)}:
                          {String(Math.floor(currentFile.metadata.duration % 60)).padStart(2, '0')}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tags */}
            {currentFile.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {currentFile.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm"
                    >
                      <Tag className="h-3 w-3" />
                      <span>{tag}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Description
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentFile.description || 'No description provided'}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => onEdit(currentFile)}
                className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit details</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              
              <button className="w-full flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors">
                <Share2 className="h-4 w-4" />
                <span>Share</span>
              </button>
              
              <button
                onClick={() => onDelete(currentFile)}
                className="w-full flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-800 dark:text-red-300 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;