import React, { useState } from 'react';
import { Node } from 'reactflow';
import { X, Settings, Database, Globe, Smartphone, Cpu, Box, Zap, Code2, Square, Diamond, Circle, Hexagon, Triangle, Octagon, History, Clock } from 'lucide-react';
import { nodeContentAPI, NodeContentHistoryData } from '@/lib/api';

interface ServiceFlowPropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onOpenCodeEditor: (nodeData: any) => void;
  flowId?: string;
}

const ServiceFlowPropertiesPanel: React.FC<ServiceFlowPropertiesPanelProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onOpenCodeEditor,
  flowId,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<NodeContentHistoryData[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  if (!selectedNode) return null;

  const handleInputChange = (field: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [field]: value
    });
  };

  const loadHistory = async () => {
    if (!flowId || !selectedNode) return;
    
    setLoadingHistory(true);
    try {
      const historyData = await nodeContentAPI.getNodeHistory(flowId, selectedNode.id);
      setHistory(historyData);
      setShowHistory(true);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const loadVersionContent = async (version: string) => {
    if (!flowId || !selectedNode) return;
    
    try {
      const versionData = await nodeContentAPI.getVersionContent(flowId, selectedNode.id, version);
      // Update code editor with historical content
      onOpenCodeEditor({
        ...selectedNode.data,
        id: selectedNode.id,
        code: versionData.content,
        language: versionData.language,
        isHistorical: true,
        version: version
      });
    } catch (error) {
      console.error('Failed to load version content:', error);
    }
  };

  const getNodeIcon = (nodeData: Record<string, unknown>) => {
    if (nodeData.shape) {
      // Flowchart node
      const shapeIcons = {
        rectangle: Square,
        diamond: Diamond,
        circle: Circle,
        hexagon: Hexagon,
        triangle: Triangle,
        octagon: Octagon
      };
      return shapeIcons[nodeData.shape as keyof typeof shapeIcons] || Square;
    } else {
      // Service node
      const icon = nodeData.icon as React.ComponentType<{ className?: string }> | undefined;
      const iconName = (icon as any)?.name || 'Box';
      const icons: Record<string, React.ComponentType<{ className?: string }>> = {
        Database,
        Globe,
        Smartphone,
        Cpu,
        Box,
        Zap
      };
      return icons[iconName] || Box;
    }
  };

  const IconComponent = getNodeIcon(selectedNode.data);
  const isFlowchartNode = !!selectedNode.data.shape;
  const isServiceNode = !isFlowchartNode;

  return (
    <div className="w-full bg-white dark:bg-slate-800 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-100 to-slate-50 dark:bg-gradient-to-r dark:from-green-900/20 dark:to-slate-900">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-white dark:text-white">
            {isFlowchartNode ? 'Shape Properties' : 'Service Properties'}
          </h3>
        </div>
        <button 
          onClick={onClose}
          className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden relative">
        {/* Top fade indicator */}
        <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white dark:from-slate-800 to-transparent pointer-events-none z-10"></div>
        
        <div className="h-full overflow-y-auto scrollbar-thin p-4">
          <div className="space-y-6 pb-8 pt-2">
            {/* Node Header */}
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-slate-50 dark:bg-gradient-to-r dark:from-green-900/30 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <IconComponent className="h-6 w-6 text-green-600 dark:text-green-400" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {selectedNode.data.label}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  ID: {selectedNode.id} | Type: {isFlowchartNode ? 'Flowchart' : 'Service'}
                </div>
              </div>
            </div>

            {/* Basic Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Basic Properties</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  value={selectedNode.data.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                  placeholder="Enter description..."
                />
              </div>
            </div>

            {/* Position Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Position</h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    X
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.position.x)}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Y
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedNode.position.y)}
                    readOnly
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>

            {/* Service-specific Properties */}
            {isServiceNode && (
              <div className="space-y-4">
                <h4 className="font-medium text-white dark:text-white">Service Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Service Type
                  </label>
                  <select
                    value={selectedNode.data.type || 'REST API'}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="REST API">REST API</option>
                    <option value="GraphQL">GraphQL</option>
                    <option value="Microservice">Microservice</option>
                    <option value="Function">Function</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.endpoint || ''}
                    onChange={(e) => handleInputChange('endpoint', e.target.value)}
                    placeholder="https://api.example.com/v1/users"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Method
                  </label>
                  <select
                    value={selectedNode.data.method || 'GET'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                    <option value="PATCH">PATCH</option>
                  </select>
                </div>
              </div>
            )}

            {/* Flowchart-specific Properties */}
            {isFlowchartNode && (
              <div className="space-y-4">
                <h4 className="font-medium text-white dark:text-white">Flowchart Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Shape Type
                  </label>
                  <select
                    value={selectedNode.data.shape || 'rectangle'}
                    onChange={(e) => handleInputChange('shape', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="rectangle">Process (Rectangle)</option>
                    <option value="diamond">Decision (Diamond)</option>
                    <option value="circle">Start/End (Circle)</option>
                    <option value="hexagon">Preparation (Hexagon)</option>
                    <option value="triangle">Input/Output (Triangle)</option>
                    <option value="octagon">Stop (Octagon)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Condition (for Decision shapes)
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.condition || ''}
                    onChange={(e) => handleInputChange('condition', e.target.value)}
                    placeholder="e.g., user.age >= 18"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Styling Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Styling</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Background Color
                </label>
                <input
                  type="color"
                  value={selectedNode.data.backgroundColor || '#ffffff'}
                  onChange={(e) => handleInputChange('backgroundColor', e.target.value)}
                  className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Border Color
                </label>
                <input
                  type="color"
                  value={selectedNode.data.borderColor || '#6b7280'}
                  onChange={(e) => handleInputChange('borderColor', e.target.value)}
                  className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                />
              </div>
            </div>

            {/* Code Generation */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Code Generation</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Target Language
                </label>
                <select
                  value={selectedNode.data.targetLanguage || 'javascript'}
                  onChange={(e) => handleInputChange('targetLanguage', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="typescript">TypeScript</option>
                  <option value="python">Python</option>
                  <option value="java">Java</option>
                  <option value="csharp">C#</option>
                  <option value="go">Go</option>
                </select>
              </div>

              {/* Content Status */}
              {selectedNode.data.code && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-300">
                    <Code2 className="h-4 w-4" />
                    <span className="text-sm font-medium">Content Saved</span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                    {selectedNode.data.language ? `Language: ${selectedNode.data.language}` : ''}
                    {selectedNode.data.code && (
                      <div className="mt-1">
                        Length: {selectedNode.data.code.length} characters
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={() => {
                  try {
                    // Pass the node data with id to the code editor
                    onOpenCodeEditor({
                      ...selectedNode.data,
                      id: selectedNode.id
                    });
                  } catch (error) {
                    console.error('Error opening code editor:', error);
                  }
                }}
                className={`w-full flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors ${
                  selectedNode.data.code 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                <Code2 className="h-4 w-4" />
                <span>{selectedNode.data.code ? 'Edit Code' : 'Open Code Editor'}</span>
              </button>

              {/* Show code preview if exists */}
              {selectedNode.data.code && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Code Preview
                  </label>
                  <div className="bg-slate-900 text-green-400 p-3 rounded-lg text-xs font-mono max-h-32 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">
                      {selectedNode.data.code.slice(0, 200)}
                      {selectedNode.data.code.length > 200 && '...'}
                    </pre>
                  </div>
                </div>
              )}

              {/* Version History */}
              {selectedNode.data.code && flowId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                      Version History
                    </label>
                    <button
                      onClick={loadHistory}
                      disabled={loadingHistory}
                      className="flex items-center space-x-1 px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      <History className="h-3 w-3" />
                      <span>{loadingHistory ? 'Loading...' : 'View History'}</span>
                    </button>
                  </div>

                  {showHistory && (
                    <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg max-h-48 overflow-y-auto">
                      {history.length === 0 ? (
                        <p className="p-3 text-xs text-slate-500 dark:text-slate-400 text-center">
                          No version history available
                        </p>
                      ) : (
                        <div className="divide-y divide-slate-200 dark:divide-slate-700">
                          {history.map((entry) => (
                            <div key={entry.id} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-medium text-slate-900 dark:text-white">
                                  v{entry.version}
                                </span>
                                <span className="text-xs text-slate-500 dark:text-slate-400">
                                  {new Date(entry.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                                {entry.changeDescription || 'No description'}
                              </div>
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
                                  <Clock className="h-3 w-3" />
                                  <span>{new Date(entry.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <button
                                  onClick={() => loadVersionContent(entry.version)}
                                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  View Code
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Bottom fade indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

export default ServiceFlowPropertiesPanel;