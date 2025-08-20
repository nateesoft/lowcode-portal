import React, { useState, useEffect } from 'react';
import { X, Database } from 'lucide-react';
import { DatabaseConnection } from '@/contexts/DatabaseContext';

interface DatabaseConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingConnection?: DatabaseConnection | null;
  isLoading?: boolean;
}

const DatabaseConnectionModal: React.FC<DatabaseConnectionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingConnection = null,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'mysql' as DatabaseConnection['type'],
    host: '',
    port: 3306,
    database: '',
    username: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingConnection) {
      setFormData({
        name: editingConnection.name,
        type: editingConnection.type,
        host: editingConnection.host,
        port: editingConnection.port,
        database: editingConnection.database,
        username: editingConnection.username,
        password: ''
      });
    } else {
      setFormData({
        name: '',
        type: 'mysql',
        host: '',
        port: 3306,
        database: '',
        username: '',
        password: ''
      });
    }
    setErrors({});
  }, [editingConnection, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Connection name is required';
    }
    if (!formData.host.trim()) {
      newErrors.host = 'Host is required';
    }
    if (!formData.database.trim()) {
      newErrors.database = 'Database name is required';
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    if (formData.port <= 0 || formData.port > 65535) {
      newErrors.port = 'Port must be between 1 and 65535';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Only send fields that backend expects
    const connectionData = {
      name: formData.name,
      type: formData.type,
      host: formData.host,
      port: formData.port,
      database: formData.database,
      username: formData.username,
      password: formData.password
    };
    
    onSave(connectionData);
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const getDefaultPort = (type: DatabaseConnection['type']) => {
    switch (type) {
      case 'mysql': return 3306;
      case 'postgresql': return 5432;
      default: return 3306;
    }
  };

  const handleTypeChange = (type: DatabaseConnection['type']) => {
    setFormData(prev => ({
      ...prev,
      type,
      port: getDefaultPort(type)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingConnection ? 'Edit Connection' : 'New Database Connection'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {editingConnection ? 'Update database connection settings' : 'Connect to your database'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Connection Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Connection Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-colors ${
                errors.name 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="My Database Connection"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
            )}
          </div>

          {/* Database Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Database Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleTypeChange(e.target.value as DatabaseConnection['type'])}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="mysql">MySQL</option>
              <option value="postgresql">PostgreSQL</option>
            </select>
          </div>

          {/* Host and Port */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Host *
              </label>
              <input
                type="text"
                value={formData.host}
                onChange={(e) => handleInputChange('host', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-colors ${
                  errors.host 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="localhost"
              />
              {errors.host && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.host}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={formData.port}
                onChange={(e) => handleInputChange('port', parseInt(e.target.value) || 0)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-colors ${
                  errors.port 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                min="1"
                max="65535"
              />
              {errors.port && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.port}</p>
              )}
            </div>
          </div>

          {/* Database Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Database Name *
            </label>
            <input
              type="text"
              value={formData.database}
              onChange={(e) => handleInputChange('database', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-colors ${
                errors.database 
                  ? 'border-red-300 dark:border-red-600' 
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="my_database"
            />
            {errors.database && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.database}</p>
            )}
          </div>

          {/* Username and Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white transition-colors ${
                  errors.username 
                    ? 'border-red-300 dark:border-red-600' 
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="username"
                autoComplete="username"
              />
              {errors.username && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.username}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Password {!editingConnection && '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder={editingConnection ? "Leave blank to keep current password" : "password"}
                autoComplete="new-password"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Saving...' : editingConnection ? 'Update Connection' : 'Create Connection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DatabaseConnectionModal;