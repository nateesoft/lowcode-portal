import React, { useState, useEffect } from 'react';
import { Clock, GitBranch, Save, RotateCcw, Trash2, Plus, Edit, CheckCircle, AlertCircle, X, Tag } from 'lucide-react';
import { FlowVersion, flowVersionAPI, CreateFlowVersionRequest } from '@/lib/api';
import { useAlert } from '@/hooks/useAlert';

interface FlowVersionPanelProps {
  flowId: number;
  currentNodes: any[];
  currentEdges: any[];
  onLoadVersion: (version: FlowVersion) => void;
  onClose: () => void;
  isOpen: boolean;
}

const FlowVersionPanel: React.FC<FlowVersionPanelProps> = ({
  flowId,
  currentNodes,
  currentEdges,
  onLoadVersion,
  onClose,
  isOpen
}) => {
  const [versions, setVersions] = useState<FlowVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    changeLog: '',
    versionType: 'minor' as 'major' | 'minor' | 'patch'
  });
  const { showSuccess, showError } = useAlert();

  useEffect(() => {
    if (isOpen && flowId) {
      loadVersions();
    }
  }, [isOpen, flowId]);

  const loadVersions = async () => {
    setIsLoading(true);
    try {
      const data = await flowVersionAPI.getByFlowId(flowId);
      setVersions(data);
    } catch (error) {
      console.error('Error loading versions:', error);
      showError('Failed to load flow versions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVersion = async () => {
    if (!createForm.name.trim()) {
      showError('Version name is required');
      return;
    }

    setIsLoading(true);
    try {
      const newVersionData: CreateFlowVersionRequest = {
        flowId,
        name: createForm.name,
        description: createForm.description,
        nodes: currentNodes,
        edges: currentEdges,
        metadata: {
          nodeCount: currentNodes.length,
          edgeCount: currentEdges.length,
          createdFrom: 'workflow-editor'
        },
        createdBy: 1, // TODO: Get from auth context
        changeLog: createForm.changeLog,
        versionType: createForm.versionType
      };

      const newVersion = await flowVersionAPI.create(newVersionData);
      setVersions(prev => [newVersion, ...prev.map(v => ({ ...v, isActive: false }))]);
      
      setShowCreateModal(false);
      setCreateForm({
        name: '',
        description: '',
        changeLog: '',
        versionType: 'minor'
      });
      
      showSuccess(`Version ${newVersion.version} created successfully`);
    } catch (error) {
      console.error('Error creating version:', error);
      showError('Failed to create version');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreVersion = async (version: FlowVersion) => {
    if (version.isActive) {
      showError('This version is already active');
      return;
    }

    setIsLoading(true);
    try {
      const restoredVersion = await flowVersionAPI.restore(version.id!, `Restored to ${version.version}`);
      setVersions(prev => prev.map(v => ({ 
        ...v, 
        isActive: v.id === version.id 
      })));
      
      onLoadVersion(restoredVersion);
      showSuccess(`Version ${version.version} restored successfully`);
    } catch (error) {
      console.error('Error restoring version:', error);
      showError('Failed to restore version');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVersion = async (version: FlowVersion) => {
    if (version.isActive) {
      showError('Cannot delete active version');
      return;
    }

    if (!confirm(`Are you sure you want to delete version ${version.version}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      await flowVersionAPI.delete(version.id!);
      setVersions(prev => prev.filter(v => v.id !== version.id));
      showSuccess(`Version ${version.version} deleted successfully`);
    } catch (error) {
      console.error('Error deleting version:', error);
      showError('Failed to delete version');
    } finally {
      setIsLoading(false);
    }
  };

  const getVersionTypeColor = (versionType: string) => {
    const version = versionType.toLowerCase();
    if (version.includes('v1.') || version.includes('v2.') || version.includes('v3.')) {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
    }
    if (version.includes('.1.') || version.includes('.2.')) {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
    }
    return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:bg-gradient-to-r dark:from-purple-900/20 dark:to-blue-900/20">
          <div className="flex items-center space-x-3">
            <GitBranch className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Flow Version History
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Manage and restore previous versions of your workflow
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              <span>Save Version</span>
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {isLoading && versions.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin h-8 w-8 border-2 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    version.isActive
                      ? 'border-purple-300 bg-purple-50 dark:border-purple-600 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getVersionTypeColor(version.version)}`}>
                            <Tag className="h-3 w-3 mr-1" />
                            {version.version}
                          </span>
                          
                          {version.isActive && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Active
                            </span>
                          )}
                        </div>
                        
                        <h3 className="font-medium text-slate-900 dark:text-white">
                          {version.name}
                        </h3>
                      </div>
                      
                      {version.description && (
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          {version.description}
                        </p>
                      )}
                      
                      <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(version.createdAt!)}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span>{version.nodes.length} nodes</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <span>{version.edges.length} connections</span>
                        </div>
                      </div>
                      
                      {version.changeLog && (
                        <div className="mt-2 p-2 bg-slate-100 dark:bg-slate-700 rounded text-xs text-slate-600 dark:text-slate-400">
                          <strong>Change Log:</strong> {version.changeLog}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {!version.isActive && (
                        <>
                          <button
                            onClick={() => handleRestoreVersion(version)}
                            disabled={isLoading}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50"
                            title="Restore this version"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Restore</span>
                          </button>
                          
                          <button
                            onClick={() => handleDeleteVersion(version)}
                            disabled={isLoading}
                            className="flex items-center space-x-1 px-3 py-1 text-xs bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
                            title="Delete this version"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Delete</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              {versions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                  <GitBranch className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No versions found. Create your first version to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Version Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Save New Version
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Version Name *
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  placeholder="e.g., Feature complete, Bug fixes"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Version Type
                </label>
                <select
                  value={createForm.versionType}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, versionType: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="patch">Patch (Bug fixes)</option>
                  <option value="minor">Minor (New features)</option>
                  <option value="major">Major (Breaking changes)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={3}
                  placeholder="Describe what changed in this version..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Change Log
                </label>
                <textarea
                  value={createForm.changeLog}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, changeLog: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  rows={2}
                  placeholder="Detailed change log..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateVersion}
                disabled={isLoading || !createForm.name.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>Save Version</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlowVersionPanel;