import React, { useState } from 'react';
import { 
  MoreVertical, 
  Download, 
  Edit3, 
  Copy, 
  Trash2, 
  Eye,
  Folder,
  Image,
  Video,
  Music,
  File,
  Archive,
  Calendar,
  HardDrive
} from 'lucide-react';
import { useMedia, MediaFile, MediaFolder } from '@/contexts/MediaContext';

interface MediaListViewProps {
  onPreview: (file: MediaFile) => void;
  onEditFile: (file: MediaFile) => void;
  onEditFolder: (folder: MediaFolder) => void;
}

const MediaListView: React.FC<MediaListViewProps> = ({ 
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
    const iconClass = "h-5 w-5";
    switch (file.type) {
      case 'image':
        return <Image className={`${iconClass} text-blue-600`} />;
      case 'video':
        return <Video className={`${iconClass} text-purple-600`} />;
      case 'audio':
        return <Music className={`${iconClass} text-green-600`} />;
      case 'document':
        return <File className={`${iconClass} text-orange-600`} />;
      default:
        return <Archive className={`${iconClass} text-gray-600`} />;
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
    <div className="bg-white dark:bg-gray-800" onClick={handleClick}>
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

      {/* List Header */}
      {(files.length > 0 || folders.length > 0) && (
        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Name</div>
          <div className="col-span-2">Type</div>
          <div className="col-span-2">Size</div>
          <div className="col-span-2">Modified</div>
        </div>
      )}

      {/* List Items */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Folders */}
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group"
            onClick={() => navigateToFolder(folder.id)}
            onContextMenu={(e) => handleContextMenu(e, folder, 'folder')}
          >
            <div className="col-span-6 flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Folder className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {folder.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {folder.fileCount} files
                </p>
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">Folder</span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">—</span>
            </div>
            <div className="col-span-2 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {folder.updatedAt.toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, folder, 'folder');
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
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
            className={`grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer group ${
              selectedFiles.includes(file.id)
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : ''
            }`}
            onClick={(e) => handleFileClick(file, e)}
            onContextMenu={(e) => handleContextMenu(e, file, 'file')}
          >
            <div className="col-span-6 flex items-center space-x-3">
              <div className="flex-shrink-0 relative">
                {file.thumbnailUrl ? (
                  <img 
                    src={file.thumbnailUrl} 
                    alt={file.name}
                    className="w-8 h-8 object-cover rounded border border-gray-200 dark:border-gray-600"
                  />
                ) : (
                  getFileIcon(file)
                )}
                {selectedFiles.includes(file.id) && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-white rounded-full" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                {file.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {file.tags.slice(0, 2).map((tag, index) => (
                      <span
                        key={index}
                        className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                    {file.tags.length > 2 && (
                      <span className="inline-block px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                        +{file.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {file.type}
              </span>
            </div>
            <div className="col-span-2 flex items-center">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {formatFileSize(file.size)}
              </span>
            </div>
            <div className="col-span-2 flex items-center justify-between">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {file.uploadedAt.toLocaleDateString()}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, file, 'file');
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition"
              >
                <MoreVertical className="h-4 w-4 text-gray-500" />
              </button>
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

export default MediaListView;