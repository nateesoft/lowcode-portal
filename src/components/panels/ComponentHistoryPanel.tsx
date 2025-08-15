import React, { useState, useEffect } from 'react';
import { X, History, RotateCcw, Eye, Trash2, Clock, User, GitBranch, FileText } from 'lucide-react';
import { ComponentHistoryData, componentAPI } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';

interface ComponentHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  componentId: number;
  componentName: string;
  onRestore?: (version: string) => void;
  userId?: number;
}

const ComponentHistoryPanel: React.FC<ComponentHistoryPanelProps> = ({
  isOpen,
  onClose,
  componentId,
  componentName,
  onRestore,
  userId = 1
}) => {
  const { showConfirm, showSuccess, showError } = useAlert();
  const [history, setHistory] = useState<ComponentHistoryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<ComponentHistoryData | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen && componentId) {
      loadHistory();
    }
  }, [isOpen, componentId]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const historyData = await componentAPI.getHistory(componentId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load component history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async (version: string) => {
    const confirmed = await showConfirm(
      'Restore Version',
      `Are you sure you want to restore to version ${version}? This will create a new version with the restored content.`,
      { confirmText: 'Restore', confirmType: 'primary' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await componentAPI.restoreFromHistory(componentId, version, userId);
      
      // Reload history to show the new restored version
      await loadHistory();
      
      if (onRestore) {
        onRestore(version);
      }
      
      showSuccess('Component restored successfully!');
    } catch (error) {
      console.error('Failed to restore component:', error);
      showError('Failed to restore component');
    }
  };

  const handleDeleteHistory = async (historyId: number) => {
    const confirmed = await showConfirm(
      'Delete History Entry',
      'Are you sure you want to delete this history entry?',
      { confirmText: 'Delete', confirmType: 'danger' }
    );
    if (!confirmed) {
      return;
    }

    try {
      await componentAPI.deleteHistoryEntry(historyId);
      setHistory(prev => prev.filter(h => h.id !== historyId));
      showSuccess('History entry deleted successfully!');
    } catch (error) {
      console.error('Failed to delete history entry:', error);
      showError('Failed to delete history entry');
    }
  };

  const handlePreview = async (historyItem: ComponentHistoryData) => {
    setSelectedVersion(historyItem);
    setShowPreview(true);
  };

  const getChangeTypeColor = (changeType: string) => {
    switch (changeType) {
      case 'manual': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'auto': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'import': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'restore': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getChangeTypeIcon = (changeType: string) => {
    switch (changeType) {
      case 'manual': return <FileText className="h-3 w-3" />;
      case 'auto': return <GitBranch className="h-3 w-3" />;
      case 'import': return <FileText className="h-3 w-3" />;
      case 'restore': return <RotateCcw className="h-3 w-3" />;
      default: return <FileText className="h-3 w-3" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* History Panel */}
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center">
              <History className="h-6 w-6 text-slate-600 dark:text-slate-400 mr-3" />
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  Component History
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {componentName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-slate-600 dark:text-slate-400">Loading history...</span>
              </div>
            ) : history.length === 0 ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No History Found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  This component doesn't have any version history yet.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-lg font-medium text-slate-900 dark:text-white">
                            v{item.version}
                          </span>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getChangeTypeColor(item.changeType)}`}>
                            {getChangeTypeIcon(item.changeType)}
                            <span className="ml-1">{item.changeType}</span>
                          </span>
                        </div>

                        <p className="text-slate-600 dark:text-slate-400 mb-3">
                          {item.changeDescription || 'No description provided'}
                        </p>

                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 space-x-4">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {item.user?.firstName} {item.user?.lastName}
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {new Date(item.createdAt).toLocaleString()}
                          </div>
                        </div>

                        {/* Metadata */}
                        {item.metadata && (
                          <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                              Version Details
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-slate-600 dark:text-slate-400">
                              {item.metadata.propsCount !== undefined && (
                                <div>Props: {item.metadata.propsCount}</div>
                              )}
                              {item.metadata.stylesCount !== undefined && (
                                <div>Styles: {item.metadata.stylesCount}</div>
                              )}
                              {item.metadata.templateLines !== undefined && (
                                <div>Template Lines: {item.metadata.templateLines}</div>
                              )}
                              {item.metadata.codeLines !== undefined && (
                                <div>Code Lines: {item.metadata.codeLines}</div>
                              )}
                              {item.metadata.rollbackFrom && (
                                <div className="col-span-2">
                                  Restored from: {item.metadata.rollbackFrom}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col space-y-2 ml-4">
                        <button
                          onClick={() => handlePreview(item)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </button>
                        <button
                          onClick={() => handleRestore(item.version)}
                          className="flex items-center px-3 py-1 text-sm text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900 rounded"
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Restore
                        </button>
                        <button
                          onClick={() => handleDeleteHistory(item.id)}
                          className="flex items-center px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && selectedVersion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Preview Version {selectedVersion.version}
              </h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Component Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Basic Info</h4>
                    <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 space-y-2 text-sm">
                      <div><strong>Name:</strong> {selectedVersion.name}</div>
                      <div><strong>Type:</strong> {selectedVersion.type}</div>
                      <div><strong>Category:</strong> {selectedVersion.category}</div>
                      <div><strong>Status:</strong> {selectedVersion.status}</div>
                      <div><strong>Public:</strong> {selectedVersion.isPublic ? 'Yes' : 'No'}</div>
                      {selectedVersion.tags && selectedVersion.tags.length > 0 && (
                        <div><strong>Tags:</strong> {selectedVersion.tags.join(', ')}</div>
                      )}
                    </div>
                  </div>

                  {selectedVersion.description && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3 text-sm">
                        {selectedVersion.description}
                      </div>
                    </div>
                  )}

                  {selectedVersion.props && Object.keys(selectedVersion.props).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Props</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(selectedVersion.props, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedVersion.styles && Object.keys(selectedVersion.styles).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Styles</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto">
                          {JSON.stringify(selectedVersion.styles, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* Code Content */}
                <div className="space-y-4">
                  {selectedVersion.template && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Template</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {selectedVersion.template}
                        </pre>
                      </div>
                    </div>
                  )}

                  {selectedVersion.code && (
                    <div>
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Code</h4>
                      <div className="bg-slate-50 dark:bg-slate-700 rounded-lg p-3">
                        <pre className="text-xs overflow-x-auto whitespace-pre-wrap">
                          {selectedVersion.code}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComponentHistoryPanel;