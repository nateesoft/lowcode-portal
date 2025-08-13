import React from 'react';
import { ChevronRight, Home, ArrowLeft } from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';

const MediaBreadcrumbs: React.FC = () => {
  const { 
    currentFolder, 
    getBreadcrumbs, 
    navigateToFolder, 
    goBack 
  } = useMedia();

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center space-x-2">
        {/* Back Button */}
        {currentFolder && (
          <button
            onClick={goBack}
            className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        )}

        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-1 text-sm">
          {/* Home */}
          <button
            onClick={() => navigateToFolder()}
            className={`flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
              !currentFolder ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>Media Library</span>
          </button>

          {/* Breadcrumb Trail */}
          {breadcrumbs.map((folder, index) => (
            <React.Fragment key={folder.id}>
              <ChevronRight className="h-4 w-4 text-gray-400" />
              <button
                onClick={() => navigateToFolder(folder.id)}
                className={`px-2 py-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
                  index === breadcrumbs.length - 1
                    ? 'text-blue-600 dark:text-blue-400 font-medium'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {folder.name}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Folder Info */}
      {currentFolder && (
        <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
          <span>{currentFolder.fileCount} files</span>
          <span>•</span>
          <span>
            {currentFolder.totalSize > 0 && (
              <>
                {(currentFolder.totalSize / (1024 * 1024)).toFixed(1)} MB
              </>
            )}
          </span>
          <span>•</span>
          <span>Updated {currentFolder.updatedAt.toLocaleDateString()}</span>
        </div>
      )}
    </div>
  );
};

export default MediaBreadcrumbs;