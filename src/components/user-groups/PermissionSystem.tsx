import React, { useState } from 'react';
import { Shield, Lock, Eye, Edit, Plus, Trash2, Settings, Users, Save, RotateCcw } from 'lucide-react';
import { UserGroupData } from '@/lib/api';

interface PermissionSystemProps {
  group: UserGroupData;
  onUpdatePermissions: (permissions: string[]) => Promise<void>;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ComponentType<any>;
  level: 'read' | 'write' | 'admin';
}

const PermissionSystem: React.FC<PermissionSystemProps> = ({
  group,
  onUpdatePermissions
}) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(
    group.permissions || []
  );
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('project');

  const permissionCategories = {
    project: {
      name: 'Project Management',
      icon: Settings,
      permissions: [
        {
          id: 'project.view',
          name: 'View Projects',
          description: 'Can view project details and browse projects',
          category: 'project',
          icon: Eye,
          level: 'read' as const
        },
        {
          id: 'project.edit',
          name: 'Edit Projects',
          description: 'Can modify project settings and configurations',
          category: 'project',
          icon: Edit,
          level: 'write' as const
        },
        {
          id: 'project.create',
          name: 'Create Projects',
          description: 'Can create new projects and initialize them',
          category: 'project',
          icon: Plus,
          level: 'write' as const
        },
        {
          id: 'project.delete',
          name: 'Delete Projects',
          description: 'Can permanently delete projects',
          category: 'project',
          icon: Trash2,
          level: 'admin' as const
        },
        {
          id: 'project.deploy',
          name: 'Deploy Projects',
          description: 'Can deploy projects to production',
          category: 'project',
          icon: Settings,
          level: 'admin' as const
        }
      ]
    },
    component: {
      name: 'Component Management',
      icon: Plus,
      permissions: [
        {
          id: 'component.view',
          name: 'View Components',
          description: 'Can view components and their properties',
          category: 'component',
          icon: Eye,
          level: 'read' as const
        },
        {
          id: 'component.edit',
          name: 'Edit Components',
          description: 'Can modify existing components',
          category: 'component',
          icon: Edit,
          level: 'write' as const
        },
        {
          id: 'component.create',
          name: 'Create Components',
          description: 'Can create new custom components',
          category: 'component',
          icon: Plus,
          level: 'write' as const
        },
        {
          id: 'component.delete',
          name: 'Delete Components',
          description: 'Can delete components permanently',
          category: 'component',
          icon: Trash2,
          level: 'admin' as const
        }
      ]
    },
    page: {
      name: 'Page Management',
      icon: Edit,
      permissions: [
        {
          id: 'page.view',
          name: 'View Pages',
          description: 'Can view pages and their content',
          category: 'page',
          icon: Eye,
          level: 'read' as const
        },
        {
          id: 'page.edit',
          name: 'Edit Pages',
          description: 'Can modify page content and layout',
          category: 'page',
          icon: Edit,
          level: 'write' as const
        },
        {
          id: 'page.create',
          name: 'Create Pages',
          description: 'Can create new pages',
          category: 'page',
          icon: Plus,
          level: 'write' as const
        },
        {
          id: 'page.publish',
          name: 'Publish Pages',
          description: 'Can publish pages to make them live',
          category: 'page',
          icon: Settings,
          level: 'admin' as const
        }
      ]
    },
    user: {
      name: 'User Management',
      icon: Users,
      permissions: [
        {
          id: 'user.view',
          name: 'View Users',
          description: 'Can view user profiles and information',
          category: 'user',
          icon: Eye,
          level: 'read' as const
        },
        {
          id: 'user.invite',
          name: 'Invite Users',
          description: 'Can send invitations to new users',
          category: 'user',
          icon: Plus,
          level: 'write' as const
        },
        {
          id: 'group.view',
          name: 'View Groups',
          description: 'Can view user groups and their members',
          category: 'user',
          icon: Users,
          level: 'read' as const
        },
        {
          id: 'group.manage',
          name: 'Manage Groups',
          description: 'Can create, edit, and delete user groups',
          category: 'user',
          icon: Settings,
          level: 'admin' as const
        }
      ]
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'read': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'write': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'admin': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions(prev =>
      prev.includes(permissionId)
        ? prev.filter(p => p !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleCategoryPermissions = (category: string, enable: boolean) => {
    const categoryPermissions = permissionCategories[category as keyof typeof permissionCategories].permissions.map(p => p.id);
    
    setSelectedPermissions(prev => {
      if (enable) {
        return [...new Set([...prev, ...categoryPermissions])];
      } else {
        return prev.filter(p => !categoryPermissions.includes(p));
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await onUpdatePermissions(selectedPermissions);
    } catch (error) {
      console.error('Error updating permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedPermissions(group.permissions || []);
  };

  const hasChanges = JSON.stringify(selectedPermissions.sort()) !== JSON.stringify((group.permissions || []).sort());

  const getCategoryPermissionCount = (category: string) => {
    const categoryPermissions = permissionCategories[category as keyof typeof permissionCategories].permissions.map(p => p.id);
    const selectedCount = categoryPermissions.filter(p => selectedPermissions.includes(p)).length;
    return { selected: selectedCount, total: categoryPermissions.length };
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Permission System
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Manage permissions for {group.name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <>
                <button
                  onClick={handleReset}
                  className="px-3 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="p-4 sm:p-6 bg-slate-50 dark:bg-slate-900/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900 dark:text-white">
              {selectedPermissions.length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Permissions
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {selectedPermissions.filter(p => 
                Object.values(permissionCategories)
                  .flatMap(cat => cat.permissions)
                  .find(perm => perm.id === p)?.level === 'read'
              ).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Read Access
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {selectedPermissions.filter(p => 
                Object.values(permissionCategories)
                  .flatMap(cat => cat.permissions)
                  .find(perm => perm.id === p)?.level === 'write'
              ).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Write Access
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {selectedPermissions.filter(p => 
                Object.values(permissionCategories)
                  .flatMap(cat => cat.permissions)
                  .find(perm => perm.id === p)?.level === 'admin'
              ).length}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Admin Access
            </div>
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700">
        <div className="flex overflow-x-auto">
          {Object.entries(permissionCategories).map(([key, category]) => {
            const counts = getCategoryPermissionCount(key);
            const IconComponent = category.icon;
            
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center space-x-2 px-4 py-3 border-b-2 whitespace-nowrap ${
                  activeTab === key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{category.name}</span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  counts.selected === counts.total
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : counts.selected > 0
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                }`}>
                  {counts.selected}/{counts.total}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Permission Details */}
      <div className="p-4 sm:p-6">
        {Object.entries(permissionCategories).map(([key, category]) => {
          if (activeTab !== key) return null;
          
          const counts = getCategoryPermissionCount(key);
          const allSelected = counts.selected === counts.total;
          const someSelected = counts.selected > 0;

          return (
            <div key={key}>
              {/* Category Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <category.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                  <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                    {category.name}
                  </h4>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => toggleCategoryPermissions(key, !allSelected)}
                    className={`px-3 py-1.5 text-sm rounded-lg border ${
                      allSelected
                        ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                        : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400'
                    }`}
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>
              </div>

              {/* Permissions List */}
              <div className="grid gap-3">
                {category.permissions.map((permission) => {
                  const isSelected = selectedPermissions.includes(permission.id);
                  const IconComponent = permission.icon;

                  return (
                    <div
                      key={permission.id}
                      className={`border rounded-lg p-4 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => togglePermission(permission.id)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex items-center space-x-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => togglePermission(permission.id)}
                            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                          }`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h5 className="font-medium text-slate-900 dark:text-white">
                                {permission.name}
                              </h5>
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                getLevelColor(permission.level)
                              }`}>
                                {permission.level}
                              </span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                              {permission.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionSystem;