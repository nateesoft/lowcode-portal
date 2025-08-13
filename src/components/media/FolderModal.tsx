import React, { useState, useEffect } from 'react';
import { X, Folder, Palette } from 'lucide-react';
import { MediaFolder, useMedia } from '@/contexts/MediaContext';

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: MediaFolder | null;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, folder }) => {
  const { createFolder, renameFolder, isLoading, currentFolder } = useMedia();
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('📁');

  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
  ];

  const icons = ['📁', '📂', '📊', '🖼️', '🎥', '🎵', '📄', '🗃️', '💼', '🎯', '⭐', '🔥'];

  useEffect(() => {
    if (isOpen) {
      if (folder) {
        setName(folder.name);
        setColor(folder.color || '#3B82F6');
        setIcon(folder.icon || '📁');
      } else {
        setName('');
        setColor('#3B82F6');
        setIcon('📁');
      }
    }
  }, [isOpen, folder]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) return;

    try {
      if (folder) {
        await renameFolder(folder.id, name.trim());
      } else {
        await createFolder(name.trim(), currentFolder?.id);
      }
      onClose();
    } catch (error) {
      console.error('Error creating/updating folder:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Folder className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {folder ? 'Edit Folder' : 'New Folder'}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {folder ? 'Update folder settings' : 'Create a new folder to organize your files'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Folder Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Folder Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter folder name"
              autoFocus
              required
            />
          </div>

          {/* Folder Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <div className="flex flex-wrap gap-2">
              {icons.map((iconOption) => (
                <button
                  key={iconOption}
                  type="button"
                  onClick={() => setIcon(iconOption)}
                  className={`p-2 text-xl rounded-lg border-2 transition ${
                    icon === iconOption
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                  }`}
                >
                  {iconOption}
                </button>
              ))}
            </div>
          </div>

          {/* Folder Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <div className="flex items-center space-x-2">
                <Palette className="h-4 w-4" />
                <span>Color</span>
              </div>
            </label>
            <div className="flex flex-wrap gap-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setColor(colorOption)}
                  className={`w-8 h-8 rounded-lg border-2 transition ${
                    color === colorOption
                      ? 'border-gray-800 dark:border-white scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  style={{ backgroundColor: colorOption }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Preview:</p>
            <div className="flex items-center space-x-3">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: color }}
              >
                <span className="text-lg">{icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {name || 'New Folder'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Empty folder
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : folder ? 'Update Folder' : 'Create Folder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FolderModal;