import React, { useState } from 'react';
import { 
  MoreVertical, 
  Download, 
  Edit3, 
  Copy, 
  Move, 
  Trash2, 
  Eye, 
  Star,
  Folder,
  Image,
  Video,
  Music,
  File,
  Archive
} from 'lucide-react';
import { useMedia, MediaFile, MediaFolder } from '@/contexts/MediaContext';

interface MediaGridViewProps {
  onPreview: (file: MediaFile) => void;
  onEditFile: (file: MediaFile) => void;
  onEditFolder: (folder: MediaFolder) => void;
}

const MediaGridView: React.FC<MediaGridViewProps> = ({ 
  onPreview, 
  onEditFile, 
  onEditFolder 
}) => {
  const {
    currentFolder,
    getFilesByFolder,
    getFoldersByParent,
    navigateToFolder,
    selectedFiles,
    selectFile,
    formatFileSize,
    deleteFiles,
    copyFiles,
    renameFile,
    deleteFolder
  } = useMedia();

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: MediaFile | MediaFolder;
    type: 'file' | 'folder';
  } | null>(null);

  const files = getFilesByFolder(currentFolder?.id);
  const folders = getFoldersByParent(currentFolder?.id);

  const handleContextMenu = (e: React.MouseEvent, item: MediaFile | MediaFolder, type: 'file' | 'folder') => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item,
      type
    });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (contextMenu) {
      setContextMenu(null);
    }
  };

  const handleFileClick = (file: MediaFile, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      selectFile(file.id);
    } else {
      onPreview(file);
    }
  };

  const getFileIcon = (file: MediaFile) => {
    switch (file.type) {
      case 'image':
        return file.thumbnailUrl ? (
          <img 
            src={file.thumbnailUrl} 
            alt={file.name}
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Image className="h-8 w-8 text-blue-600" />
          </div>
        );
      case 'video':
        return file.thumbnailUrl ? (
          <div className="relative">
            <img 
              src={file.thumbnailUrl} 
              alt={file.name}
              className="w-full h-32 object-cover rounded-lg"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
              <Video className="h-8 w-8 text-white" />
            </div>
          </div>
        ) : (
          <div className="w-full h-32 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Video className="h-8 w-8 text-purple-600" />
          </div>
        );
      case 'audio':
        return (
          <div className="w-full h-32 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
            <Music className="h-8 w-8 text-green-600" />
          </div>
        );
      case 'document':
        return (
          <div className="w-full h-32 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
            <File className="h-8 w-8 text-orange-600" />
          </div>
        );
      default:
        return (
          <div className="w-full h-32 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
            <Archive className="h-8 w-8 text-gray-600" />
          </div>
        );
    }
  };

  const handleContextMenuAction = async (action: string) => {
    if (!contextMenu) return;

    const { item, type } = contextMenu;
    
    switch (action) {
      case 'preview':
        if (type === 'file') {
          onPreview(item as MediaFile);
        }
        break;
      case 'edit':
        if (type === 'file') {
          onEditFile(item as MediaFile);
        } else {
          onEditFolder(item as MediaFolder);
        }
        break;
      case 'copy':
        if (type === 'file') {
          await copyFiles([item.id]);
        }
        break;
      case 'delete':
        if (type === 'file') {
          await deleteFiles([item.id]);
        } else {
          await deleteFolder(item.id);
        }
        break;
    }
    
    setContextMenu(null);
  };

  return (
    <div className="p-6" onClick={handleClick}>
      {/* Empty State */}
      {files.length === 0 && folders.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-24 w-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Folder className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No files or folders
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Upload some files or create a folder to get started
          </p>
        </div>
      )}

      {/* Grid Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="group relative"
          >
            <div
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
              onClick={() => navigateToFolder(folder.id)}
              onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
            >
              <div className="flex flex-col items-center space-y-3">
                <div className="w-full h-32 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Folder className="h-12 w-12 text-blue-600" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={folder.name}>
                    {folder.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {folder.fileCount} files
                  </p>
                </div>
              </div>
              
              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, folder, 'folder');
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
        ))}

        {/* Files */}
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative"
          >
            <div
              className={`bg-white dark:bg-gray-800 border-2 rounded-lg p-4 hover:shadow-md transition cursor-pointer ${
                selectedFiles.includes(file.id)
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
              onClick={(e) => handleFileClick(file, e)}
              onContextMenu={(e) => handleContextMenu(e, file, 'file')}
            >
              <div className="flex flex-col space-y-3">
                {getFileIcon(file)}
                <div className="w-full">
                  <p 
                    className="text-sm font-medium text-gray-900 dark:text-white truncate" 
                    title={file.name}
                  >
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  {file.metadata && (file.metadata.width || file.metadata.duration) && (
                    <p className="text-xs text-gray-400">
                      {file.metadata.width && file.metadata.height && 
                        `${file.metadata.width}×${file.metadata.height}`}
                      {file.metadata.duration && 
                        `${Math.floor(file.metadata.duration / 60)}:${String(Math.floor(file.metadata.duration % 60)).padStart(2, '0')}`}
                    </p>
                  )}
                </div>
              </div>

              {/* Selection indicator */}
              {selectedFiles.includes(file.id) && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              )}
              
              {/* Actions */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, file, 'file');
                }}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>

              {/* Tags */}
              {file.tags.length > 0 && (
                <div className="absolute bottom-2 left-2 right-2">
                  <div className="flex flex-wrap gap-1">
                    {file.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        +{file.tags.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50"
          style={{
            left: contextMenu.x,
            top: contextMenu.y
          }}
        >
          {contextMenu.type === 'file' ? (
            <>
              <button
                onClick={() => handleContextMenuAction('preview')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </button>
              <button
                onClick={() => handleContextMenuAction('edit')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Rename</span>
              </button>
              <button
                onClick={() => handleContextMenuAction('copy')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </button>
              <button
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Download className="h-4 w-4" />
                <span>Download</span>
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => handleContextMenuAction('delete')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleContextMenuAction('edit')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
              >
                <Edit3 className="h-4 w-4" />
                <span>Rename</span>
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => handleContextMenuAction('delete')}
                className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaGridView;