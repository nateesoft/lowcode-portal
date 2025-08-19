import React, { useState, useEffect } from 'react';
import { X, Users, Folder, Palette, Settings, Plus, Trash2 } from 'lucide-react';
import { UserGroupData, CreateUserGroupRequest, MyProjectData, User } from '@/lib/api';

interface UserGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateUserGroupRequest) => Promise<void>;
  editingGroup?: UserGroupData | null;
  projects: MyProjectData[];
  availableUsers: User[];
}

const UserGroupModal: React.FC<UserGroupModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGroup,
  projects,
  availableUsers
}) => {
  const [formData, setFormData] = useState<CreateUserGroupRequest>({
    name: '',
    description: '',
    status: 'active',
    permissions: [],
    settings: {},
    color: '#3B82F6',
    icon: 'Users',
    memberIds: []
  });

  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Available permissions
  const availablePermissions = [
    { id: 'project.view', name: 'View Projects', description: 'Can view project details' },
    { id: 'project.edit', name: 'Edit Projects', description: 'Can modify project settings' },
    { id: 'project.create', name: 'Create Projects', description: 'Can create new projects' },
    { id: 'project.delete', name: 'Delete Projects', description: 'Can delete projects' },
    { id: 'component.view', name: 'View Components', description: 'Can view components' },
    { id: 'component.edit', name: 'Edit Components', description: 'Can modify components' },
    { id: 'component.create', name: 'Create Components', description: 'Can create new components' },
    { id: 'page.view', name: 'View Pages', description: 'Can view pages' },
    { id: 'page.edit', name: 'Edit Pages', description: 'Can modify pages' },
    { id: 'group.manage', name: 'Manage Groups', description: 'Can manage user groups' },
  ];

  const colorOptions = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const iconOptions = [
    { value: 'Users', label: 'Users' },
    { value: 'Settings', label: 'Settings' },
    { value: 'Folder', label: 'Folder' },
    { value: 'Shield', label: 'Shield' },
  ];

  useEffect(() => {
    if (editingGroup) {
      setFormData({
        name: editingGroup.name,
        description: editingGroup.description || '',
        status: editingGroup.status || 'active',
        permissions: editingGroup.permissions || [],
        settings: editingGroup.settings || {},
        color: editingGroup.color || '#3B82F6',
        icon: editingGroup.icon || 'Users',
        memberIds: editingGroup.members?.map(m => m.id) || []
      });
      setSelectedProject(editingGroup.project?.id || null);
      setSelectedMembers(editingGroup.members?.map(m => m.id) || []);
      setSelectedPermissions(editingGroup.permissions || []);
    } else {
      setFormData({
        name: '',
        description: '',
        status: 'active',
        permissions: [],
        settings: {},
        color: '#3B82F6',
        icon: 'Users',
        memberIds: []
      });
      setSelectedProject(null);
      setSelectedMembers([]);
      setSelectedPermissions([]);
    }
  }, [editingGroup, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const submitData: CreateUserGroupRequest = {
        ...formData,
        projectId: selectedProject || undefined,
        memberIds: selectedMembers,
        permissions: selectedPermissions,
      };

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error('Error saving user group:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (userId: number) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const togglePermission = (permission: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.color }}
            >
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {editingGroup ? 'Edit User Group' : 'Create User Group'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Organize users and manage permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Basic Information</h3>
                
                {/* Group Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="e.g., Development Team"
                    required
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Describe the purpose of this group..."
                  />
                </div>

                {/* Project Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Associated Project
                  </label>
                  <select
                    value={selectedProject || ''}
                    onChange={(e) => setSelectedProject(e.target.value ? Number(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Select a project (optional)</option>
                    {projects.map(project => (
                      <option key={project.id} value={project.id}>
                        {project.name} ({project.projectType})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Color and Icon */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Color
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color }))}
                          className={`w-8 h-8 rounded-lg border-2 ${
                            formData.color === color ? 'border-slate-400' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Members and Permissions */}
            <div className="space-y-6">
              {/* Members Selection */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Members</h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                  {availableUsers.length === 0 ? (
                    <p className="text-slate-500 dark:text-slate-400 text-center py-4">
                      No users available
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {availableUsers.map(user => (
                        <label key={user.id} className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedMembers.includes(user.id)}
                            onChange={() => toggleMember(user.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400">
                              {user.email}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Permissions Selection */}
              <div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">Permissions</h3>
                <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 max-h-48 overflow-y-auto">
                  <div className="space-y-3">
                    {availablePermissions.map(permission => (
                      <label key={permission.id} className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedPermissions.includes(permission.id)}
                          onChange={() => togglePermission(permission.id)}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {permission.name}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {permission.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              <span>{editingGroup ? 'Update Group' : 'Create Group'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserGroupModal;