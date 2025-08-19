import React, { useState } from 'react';
import { Plus, X, Search, UserMinus, UserPlus, Mail, User as UserIcon } from 'lucide-react';
import { User, UserGroupData } from '@/lib/api';

interface MemberManagementProps {
  group: UserGroupData;
  availableUsers: User[];
  onAddMembers: (userIds: number[]) => Promise<void>;
  onRemoveMembers: (userIds: number[]) => Promise<void>;
}

const MemberManagement: React.FC<MemberManagementProps> = ({
  group,
  availableUsers,
  onAddMembers,
  onRemoveMembers
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter users who are not already members
  const nonMembers = availableUsers.filter(user => 
    !group.members?.some(member => member.id === user.id)
  );

  // Filter users based on search term
  const filteredNonMembers = nonMembers.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMembers = (group.members || []).filter(member =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddMembers = async () => {
    if (selectedUsers.length === 0) return;
    
    setLoading(true);
    try {
      await onAddMembers(selectedUsers);
      setSelectedUsers([]);
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMembers = async () => {
    if (selectedMembers.length === 0) return;
    
    const confirmed = confirm(
      `Are you sure you want to remove ${selectedMembers.length} member(s) from this group?`
    );
    
    if (!confirmed) return;

    setLoading(true);
    try {
      await onRemoveMembers(selectedMembers);
      setSelectedMembers([]);
    } catch (error) {
      console.error('Error removing members:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleMemberSelection = (memberId: number) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      {/* Header */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Group Members
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Manage members in {group.name}
            </p>
          </div>
          <div className="flex gap-2">
            {selectedMembers.length > 0 && (
              <button
                onClick={handleRemoveMembers}
                disabled={loading}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center space-x-2"
              >
                <UserMinus className="h-4 w-4" />
                <span>Remove ({selectedMembers.length})</span>
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Add Members</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
      </div>

      {/* Members List */}
      <div className="p-4 sm:p-6">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-8">
            <UserIcon className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
              {searchTerm ? 'No matching members' : 'No members yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Add members to this group to get started'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add First Member
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                  selectedMembers.includes(member.id)
                    ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-600'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMemberSelection(member.id)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                      <Mail className="h-3 w-3" />
                      <span>{member.email}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    member.isActive
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                  }`}>
                    {member.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded-full text-xs">
                    {member.role}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Members Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Add Members to {group.name}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {filteredNonMembers.length === 0 ? (
                  <div className="text-center py-8">
                    <UserIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchTerm ? 'No matching users found' : 'All available users are already members'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredNonMembers.map(user => (
                      <label
                        key={user.id}
                        className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900 dark:text-white">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">
                            {user.email}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMembers}
                disabled={selectedUsers.length === 0 || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4" />
                )}
                <span>Add {selectedUsers.length > 0 ? `(${selectedUsers.length})` : ''} Members</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberManagement;