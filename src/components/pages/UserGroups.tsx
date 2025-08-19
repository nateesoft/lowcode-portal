import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Users, 
  Settings, 
  BarChart3, 
  Shield, 
  Edit, 
  Trash2, 
  MoreVertical,
  Eye,
  UserPlus,
  Mail,
  AlertCircle
} from 'lucide-react';
import { UserGroupData, MyProjectData, User, CreateUserGroupRequest, apiClient } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import UserGroupModal from '@/components/modals/UserGroupModal';
import MemberManagement from '@/components/user-groups/MemberManagement';
import PermissionSystem from '@/components/user-groups/PermissionSystem';
import GroupStatistics from '@/components/user-groups/GroupStatistics';
import SearchAndFilter from '@/components/user-groups/SearchAndFilter';

const UserGroups: React.FC = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [userGroups, setUserGroups] = useState<UserGroupData[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<UserGroupData[]>([]);
  const [projects, setProjects] = useState<MyProjectData[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<UserGroupData | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<UserGroupData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'permissions' | 'statistics'>('overview');

  // Dropdown states
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      loadData();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
      setError('Please log in to access user groups');
    }
  }, [authLoading, isAuthenticated]);

  const loadData = async (retryCount = 0) => {
    try {
      setLoading(true);
      setError(null);

      const [groupsResponse, projectsResponse, usersResponse] = await Promise.all([
        apiClient.getUserGroups(),
        apiClient.getMyProjects(),
        apiClient.getUsers()
      ]);

      setUserGroups(groupsResponse || []);
      setFilteredGroups(groupsResponse || []);
      setProjects(projectsResponse || []);
      setAvailableUsers(usersResponse || []);
    } catch (err: any) {
      console.error('Error loading data:', err);
      
      if (err.response?.status === 401) {
        if (retryCount === 0) {
          console.log('401 error, attempting to refresh auth and retry...');
          try {
            // Trigger auth refresh and retry once
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
            await loadData(1); // Retry once
            return;
          } catch (retryError) {
            console.error('Retry failed:', retryError);
            setError('Authentication expired. Please refresh the page or log in again.');
          }
        } else {
          setError('Authentication expired. Please refresh the page or log in again.');
        }
      } else if (err.code === 'ERR_NETWORK') {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError(`Failed to load user groups data: ${err.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (data: CreateUserGroupRequest) => {
    try {
      await apiClient.createUserGroup(data);
      await loadData();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating group:', err);
      throw err;
    }
  };

  const handleUpdateGroup = async (data: CreateUserGroupRequest) => {
    if (!editingGroup) return;
    
    try {
      await apiClient.updateUserGroup(editingGroup.id!, data);
      await loadData();
      setIsModalOpen(false);
      setEditingGroup(null);
    } catch (err) {
      console.error('Error updating group:', err);
      throw err;
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
      return;
    }

    try {
      await apiClient.deleteUserGroup(groupId);
      await loadData();
      setOpenDropdown(null);
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (err) {
      console.error('Error deleting group:', err);
      alert('Failed to delete group');
    }
  };

  const handleAddMembers = async (groupId: number, userIds: number[]) => {
    try {
      await apiClient.addMembersToGroup(groupId, { userIds });
      await loadData();
      if (selectedGroup?.id === groupId) {
        const updatedGroup = userGroups.find(g => g.id === groupId);
        setSelectedGroup(updatedGroup || null);
      }
    } catch (err) {
      console.error('Error adding members:', err);
      throw err;
    }
  };

  const handleRemoveMembers = async (groupId: number, userIds: number[]) => {
    try {
      await apiClient.removeMembersFromGroup(groupId, { userIds });
      await loadData();
      if (selectedGroup?.id === groupId) {
        const updatedGroup = userGroups.find(g => g.id === groupId);
        setSelectedGroup(updatedGroup || null);
      }
    } catch (err) {
      console.error('Error removing members:', err);
      throw err;
    }
  };

  const handleUpdatePermissions = async (groupId: number, permissions: string[]) => {
    try {
      await apiClient.updateUserGroup(groupId, { permissions });
      await loadData();
      if (selectedGroup?.id === groupId) {
        const updatedGroup = userGroups.find(g => g.id === groupId);
        setSelectedGroup(updatedGroup || null);
      }
    } catch (err) {
      console.error('Error updating permissions:', err);
      throw err;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': 
        return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive': 
        return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      case 'pending': 
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: 
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const renderGroupCard = (group: UserGroupData) => (
    <div
      key={group.id}
      className={`relative bg-white dark:bg-slate-800 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md ${
        selectedGroup?.id === group.id
          ? 'border-blue-300 ring-2 ring-blue-100 shadow-sm dark:border-blue-600 dark:ring-blue-900/30'
          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
      }`}
      onClick={() => {
        setSelectedGroup(group);
        setOpenDropdown(null); // Close any open dropdown when selecting a group
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
              style={{ backgroundColor: group.color || '#3B82F6' }}
            >
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base leading-tight">
                {group.name}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-tight mt-1">
                {group.description || 'No description provided'}
              </p>
              {group.project && (
                <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 mt-2">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                  <span>{group.project.name}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Actions Menu */}
          <div className="relative flex-shrink-0 ml-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdown(openDropdown === group.id ? null : group.id!);
              }}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Group actions"
            >
              <MoreVertical className="h-4 w-4 text-slate-500 dark:text-slate-400" />
            </button>
            
            {openDropdown === group.id && (
              <>
                {/* Backdrop to close dropdown */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setOpenDropdown(null)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-20 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingGroup(group);
                      setIsModalOpen(true);
                      setOpenDropdown(null);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center space-x-3 transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Group</span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(null);
                      handleDeleteGroup(group.id!);
                    }}
                    className="w-full px-4 py-2.5 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-3 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Group</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Users className="h-4 w-4" />
              <span className="font-medium">{group.members?.length || 0}</span>
              <span className="text-xs">members</span>
            </div>
            <div className="flex items-center space-x-1.5 text-sm text-slate-600 dark:text-slate-400">
              <Shield className="h-4 w-4" />
              <span className="font-medium">{group.permissions?.length || 0}</span>
              <span className="text-xs">permissions</span>
            </div>
          </div>
          
          <span className={`px-2.5 py-1 text-xs rounded-full font-medium capitalize ${getStatusColor(group.status || 'active')}`}>
            {group.status || 'active'}
          </span>
        </div>

        {/* Selection Indicator */}
        {selectedGroup?.id === group.id && (
          <div className="absolute top-3 left-3 w-1 h-6 bg-blue-500 rounded-full"></div>
        )}
      </div>
    </div>
  );

  const renderDetailPanel = () => {
    if (!selectedGroup) {
      return (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              Select a Group
            </h3>
            <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto">
              Choose a group from the list to view details, manage members, and configure permissions
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Group Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 flex-1">
                <div 
                  className="w-16 h-16 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0"
                  style={{ backgroundColor: selectedGroup.color || '#3B82F6' }}
                >
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {selectedGroup.name}
                  </h2>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    {selectedGroup.description || 'No description provided'}
                  </p>
                  {selectedGroup.project && (
                    <div className="flex items-center space-x-2 mt-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {selectedGroup.project.name}
                      </span>
                    </div>
                  )}
                  
                  {/* Quick Stats */}
                  <div className="flex items-center space-x-6 mt-4">
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{selectedGroup.members?.length || 0}</span>
                      <span>members</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-slate-600 dark:text-slate-400">
                      <Shield className="h-4 w-4" />
                      <span className="font-medium">{selectedGroup.permissions?.length || 0}</span>
                      <span>permissions</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 flex-shrink-0">
                <span className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedGroup.status || 'active')}`}>
                  {selectedGroup.status || 'active'}
                </span>
                <button
                  onClick={() => {
                    setEditingGroup(selectedGroup);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="border-b border-slate-200 dark:border-slate-700">
            <div className="flex overflow-x-auto scrollbar-hide">
              {[
                { key: 'overview', label: 'Overview', icon: Eye },
                { key: 'members', label: 'Members', icon: Users },
                { key: 'permissions', label: 'Permissions', icon: Shield },
                { key: 'statistics', label: 'Statistics', icon: BarChart3 }
              ].map(tab => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`flex items-center space-x-2 px-6 py-4 border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                        : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {selectedGroup.members?.length || 0}
                        </div>
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Members</div>
                      </div>
                      <Users className="h-8 w-8 text-blue-500 opacity-50" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {selectedGroup.permissions?.length || 0}
                        </div>
                        <div className="text-sm font-medium text-green-600 dark:text-green-400">Permissions</div>
                      </div>
                      <Shield className="h-8 w-8 text-green-500 opacity-50" />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                          {selectedGroup.project ? 1 : 0}
                        </div>
                        <div className="text-sm font-medium text-purple-600 dark:text-purple-400">Projects</div>
                      </div>
                      <Settings className="h-8 w-8 text-purple-500 opacity-50" />
                    </div>
                  </div>
                </div>

                {/* Recent Members */}
                {selectedGroup.members && selectedGroup.members.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Members</h4>
                    <div className="space-y-3">
                      {selectedGroup.members.slice(0, 5).map(member => (
                        <div key={member.id} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                              {member.firstName} {member.lastName}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1">
                              <Mail className="h-3 w-3" />
                              <span>{member.email}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedGroup.members.length > 5 && (
                        <div className="text-center py-2">
                          <button 
                            onClick={() => setActiveTab('members')}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                          >
                            View all {selectedGroup.members.length} members →
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'members' && (
              <MemberManagement
                group={selectedGroup}
                availableUsers={availableUsers}
                onAddMembers={(userIds) => handleAddMembers(selectedGroup.id!, userIds)}
                onRemoveMembers={(userIds) => handleRemoveMembers(selectedGroup.id!, userIds)}
              />
            )}

            {activeTab === 'permissions' && (
              <PermissionSystem
                group={selectedGroup}
                onUpdatePermissions={(permissions) => handleUpdatePermissions(selectedGroup.id!, permissions)}
              />
            )}

            {activeTab === 'statistics' && (
              <GroupStatistics 
                groups={[selectedGroup]} 
                onRefresh={loadData}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <h3 className="mt-4 text-lg font-medium text-slate-900 dark:text-white">
            Loading User Groups
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-yellow-800 dark:text-yellow-400">
                  Authentication Required
                </h3>
                <p className="text-yellow-700 dark:text-yellow-500 mt-1">
                  Please log in to access user groups management.
                </p>
                <button
                  onClick={() => window.location.href = '/login'}
                  className="mt-4 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Go to Login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-red-200 dark:border-red-800 shadow-sm">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-red-800 dark:text-red-400 mb-2">
                Something went wrong
              </h3>
              <p className="text-red-700 dark:text-red-300 mb-6">
                {error}
              </p>
              <button
                onClick={() => loadData()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Groups</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Organize users and manage permissions across projects
              </p>
            </div>
            
            <div className="flex items-center space-x-3 flex-shrink-0">
              <button
                onClick={() => setActiveTab('statistics')}
                className={`px-4 py-2 rounded-lg border transition-colors flex items-center space-x-2 ${
                  activeTab === 'statistics'
                    ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                    : 'text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Statistics</span>
              </button>
              <button
                onClick={() => {
                  setEditingGroup(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                <span>Create Group</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics View */}
        {activeTab === 'statistics' && !selectedGroup && (
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <GroupStatistics groups={userGroups} onRefresh={loadData} />
          </div>
        )}

        {/* Main Content */}
        {activeTab !== 'statistics' && (
          <div className="flex flex-col lg:flex-row gap-6 min-h-0">
            {/* Groups List */}
            <div className="w-full lg:w-96 xl:w-[420px] flex-shrink-0 space-y-4 order-2 lg:order-1">
              {/* Search and Filter */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 relative z-20">
                <SearchAndFilter
                  groups={userGroups}
                  projects={projects}
                  onFilteredResults={setFilteredGroups}
                />
              </div>

              {/* Groups List Container */}
              <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h2 className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5" />
                      <span>Groups</span>
                    </div>
                    <span className="text-sm font-normal bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-full">
                      {filteredGroups.length}
                    </span>
                  </h2>
                </div>
                
                <div className="p-4">
                  <div className="space-y-3 max-h-[400px] lg:max-h-[calc(100vh-28rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
                    {filteredGroups.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                          No user groups found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                          Get started by creating your first user group
                        </p>
                        <button
                          onClick={() => {
                            setEditingGroup(null);
                            setIsModalOpen(true);
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm"
                        >
                          Create First Group
                        </button>
                      </div>
                    ) : (
                      filteredGroups.map(renderGroupCard)
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detail Panel */}
            <div className="flex-1 min-w-0 order-1 lg:order-2">
              <div className="relative z-10">
                {renderDetailPanel()}
              </div>
            </div>
          </div>
        )}

        {/* Modal */}
        <UserGroupModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingGroup(null);
          }}
          onSave={editingGroup ? handleUpdateGroup : handleCreateGroup}
          editingGroup={editingGroup}
          projects={projects}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  );
};

export default UserGroups;