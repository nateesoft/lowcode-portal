import React, { useState } from 'react';
import { 
  Search, 
  Grid3X3, 
  List, 
  SortAsc, 
  SortDesc, 
  Filter,
  FolderPlus,
  Upload,
  MoreHorizontal,
  Trash2,
  Copy,
  Move,
  Download
} from 'lucide-react';
import { useMedia } from '@/contexts/MediaContext';

interface MediaToolbarProps {
  onCreateFolder: () => void;
  onUpload: () => void;
}

const MediaToolbar: React.FC<MediaToolbarProps> = ({ onCreateFolder, onUpload }) => {
  const {
    viewMode,
    setViewMode,
    sortBy,
    sortOrder,
    setSorting,
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    selectedFiles,
    clearSelection,
    deleteFiles,
    copyFiles,
    files
  } = useMedia();

  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);

  const handleSort = (newSortBy: typeof sortBy) => {
    const newOrder = sortBy === newSortBy && sortOrder === 'asc' ? 'desc' : 'asc';
    setSorting(newSortBy, newOrder);
    setShowSortMenu(false);
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length > 0) {
      await deleteFiles(selectedFiles);
      setShowBulkActions(false);
    }
  };

  const handleBulkCopy = async () => {
    if (selectedFiles.length > 0) {
      await copyFiles(selectedFiles);
      setShowBulkActions(false);
    }
  };

  const selectedFileObjects = files.filter(f => selectedFiles.includes(f.id));
  const totalSelectedSize = selectedFileObjects.reduce((sum, f) => sum + f.size, 0);
  const formatFileSize = (size: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      {/* Left side - Search and Filters */}
      <div className="flex flex-1 items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white w-64"
          />
        </div>

        {/* Filter */}
        <div className="relative">
          <button
            onClick={() => setShowFilterMenu(!showFilterMenu)}
            className={`flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition ${
              filterType !== 'all' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300' : ''
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm">
              {filterType === 'all' ? 'All Files' : 
               filterType === 'image' ? 'Images' :
               filterType === 'video' ? 'Videos' :
               filterType === 'audio' ? 'Audio' :
               filterType === 'document' ? 'Documents' : 'Other'}
            </span>
          </button>
          
          {showFilterMenu && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10">
              {[
                { value: 'all', label: 'All Files' },
                { value: 'image', label: 'Images' },
                { value: 'video', label: 'Videos' },
                { value: 'audio', label: 'Audio' },
                { value: 'document', label: 'Documents' },
                { value: 'other', label: 'Other' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => {
                    setFilterType(option.value);
                    setShowFilterMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    filterType === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selection Info */}
        {selectedFiles.length > 0 && (
          <div className="flex items-center space-x-4 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <span className="text-sm text-blue-600 dark:text-blue-400">
              {selectedFiles.length} selected ({formatFileSize(totalSelectedSize)})
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-blue-500 hover:text-blue-700"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Right side - View Controls and Actions */}
      <div className="flex items-center space-x-2">
        {/* Bulk Actions */}
        {selectedFiles.length > 0 && (
          <div className="relative">
            <button
              onClick={() => setShowBulkActions(!showBulkActions)}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              <span className="text-sm">Actions</span>
              <MoreHorizontal className="h-4 w-4" />
            </button>
            
            {showBulkActions && (
              <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10">
                <button
                  onClick={handleBulkCopy}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Move className="h-4 w-4" />
                  <span>Move</span>
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </button>
                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                <button
                  onClick={handleBulkDelete}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 flex items-center space-x-2"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sort */}
        <div className="relative">
          <button
            onClick={() => setShowSortMenu(!showSortMenu)}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
          >
            {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            <span className="text-sm">Sort</span>
          </button>
          
          {showSortMenu && (
            <div className="absolute top-full mt-2 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-10">
              {[
                { value: 'name', label: 'Name' },
                { value: 'date', label: 'Date' },
                { value: 'size', label: 'Size' },
                { value: 'type', label: 'Type' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => handleSort(option.value as typeof sortBy)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between ${
                    sortBy === option.value ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : ''
                  }`}
                >
                  <span>{option.label}</span>
                  {sortBy === option.value && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Mode */}
        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 ${
              viewMode === 'grid'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            } rounded-l-lg transition`}
          >
            <Grid3X3 className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 ${
              viewMode === 'list'
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700'
            } rounded-r-lg transition border-l border-gray-300 dark:border-gray-600`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>

        {/* Actions */}
        <button
          onClick={onCreateFolder}
          className="flex items-center space-x-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
        >
          <FolderPlus className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">New Folder</span>
        </button>

        <button
          onClick={onUpload}
          className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
        >
          <Upload className="h-4 w-4" />
          <span className="text-sm hidden sm:inline">Upload</span>
        </button>
      </div>
    </div>
  );
};

export default MediaToolbar;