import React, { useState, useEffect } from 'react';
import { X, Plus, Edit, Trash2, Users, Save, Maximize2, Minimize2, Move } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';
import { useAlert } from '@/hooks/useAlert';
import { userTypeAPI, UserType } from '@/lib/api';

interface UserTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
}

const UserTypeModal: React.FC<UserTypeModalProps> = ({
  isOpen,
  onClose,
  nodeData,
}) => {
  const [userTypes, setUserTypes] = useState<UserType[]>([
    {
      id: 1,
      name: 'Admin',
      description: 'System Administrator with full access',
      permissions: ['create', 'read', 'update', 'delete', 'manage_users'],
      isActive: true,
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manager with limited administrative access',
      permissions: ['create', 'read', 'update', 'manage_reports'],
      isActive: true,
    },
    {
      id: 3,
      name: 'Cashier',
      description: 'Point of Sale operator',
      permissions: ['read', 'create_sales', 'process_payments'],
      isActive: true,
    },
    {
      id: 4,
      name: 'User Normal',
      description: 'Standard user with basic access',
      permissions: ['read'],
      isActive: true,
    },
  ]);
  
  const [editingUserType, setEditingUserType] = useState<UserType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const { showSuccess, showError } = useAlert();
  
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isResizing,
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    resizeHandles,
    handleMouseDown, 
    handleResizeMouseDown,
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();

  useEffect(() => {
    if (isOpen) {
      resetPosition();
      // Load user types from API
      loadUserTypes();
    }
  }, [isOpen]);

  const loadUserTypes = async () => {
    setIsLoading(true);
    try {
      const response = await userTypeAPI.getAll();
      setUserTypes(response);
    } catch (error) {
      console.error('Error loading user types:', error);
      showError('Failed to load user types');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUserType = async (userType: UserType) => {
    setIsLoading(true);
    try {
      if (userType.id) {
        // Update existing
        const updatedUserType = await userTypeAPI.update(userType);
        setUserTypes(prev => prev.map(ut => ut.id === userType.id ? updatedUserType : ut));
        showSuccess('User type updated successfully');
      } else {
        // Create new
        const newUserType = await userTypeAPI.create(userType);
        setUserTypes(prev => [...prev, newUserType]);
        showSuccess('User type created successfully');
      }
      
      setEditingUserType(null);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving user type:', error);
      showError('Failed to save user type');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUserType = async (id: number) => {
    if (!confirm('Are you sure you want to delete this user type?')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await userTypeAPI.delete(id);
      setUserTypes(prev => prev.filter(ut => ut.id !== id));
      showSuccess('User type deleted successfully');
    } catch (error) {
      console.error('Error deleting user type:', error);
      showError('Failed to delete user type');
    } finally {
      setIsLoading(false);
    }
  };

  const permissionOptions = [
    'create', 'read', 'update', 'delete', 
    'manage_users', 'manage_reports', 'create_sales', 
    'process_payments', 'view_analytics'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        style={modalStyle}
        className={`bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 ${
          isFullscreen ? 'w-full h-full' : 'w-[800px] h-[600px]'
        } flex flex-col overflow-hidden ${isDragging ? 'cursor-move' : ''} ${isResizing ? 'cursor-nw-resize' : ''}`}
      >
        {/* Header */}
        <div
          ref={dragRef}
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
          className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-slate-50 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-slate-900 cursor-move"
        >
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                User Type Management
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage user roles and permissions
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* User Types List */}
          <div className="w-1/2 border-r border-slate-200 dark:border-slate-700 flex flex-col">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-white">User Types</h3>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {userTypes.map((userType) => (
                    <div
                      key={userType.id}
                      className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-white">
                            {userType.name}
                          </h4>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            {userType.description}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {userType.permissions.slice(0, 3).map((permission) => (
                              <span
                                key={permission}
                                className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded"
                              >
                                {permission}
                              </span>
                            ))}
                            {userType.permissions.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded">
                                +{userType.permissions.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingUserType(userType)}
                            className="p-2 text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => userType.id && handleDeleteUserType(userType.id)}
                            className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Edit/Add Form */}
          <div className="w-1/2 flex flex-col">
            {(editingUserType || showAddForm) ? (
              <UserTypeForm
                userType={editingUserType}
                permissionOptions={permissionOptions}
                onSave={handleSaveUserType}
                onCancel={() => {
                  setEditingUserType(null);
                  setShowAddForm(false);
                }}
                isLoading={isLoading}
              />
            ) : (
              <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-slate-400">
                <div className="text-center">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a user type to edit or add a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Resize handles */}
        {resizeHandles && resizeHandles.map((handle, index) => (
          <div key={index} {...handle} />
        ))}
      </div>
    </div>
  );
};

// User Type Form Component
interface UserTypeFormProps {
  userType?: UserType | null;
  permissionOptions: string[];
  onSave: (userType: UserType) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const UserTypeForm: React.FC<UserTypeFormProps> = ({
  userType,
  permissionOptions,
  onSave,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState<UserType>({
    name: '',
    description: '',
    permissions: [],
    isActive: true,
    ...userType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    onSave(formData);
  };

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
        <h3 className="font-medium text-slate-900 dark:text-white">
          {userType ? 'Edit User Type' : 'Add New User Type'}
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter user type name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Permissions
            </label>
            <div className="grid grid-cols-2 gap-2">
              {permissionOptions.map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={formData.permissions.includes(permission)}
                    onChange={() => togglePermission(permission)}
                    className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">
                    {permission.replace('_', ' ')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Active
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading || !formData.name.trim()}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-md transition-colors"
          >
            {isLoading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>}
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserTypeModal;