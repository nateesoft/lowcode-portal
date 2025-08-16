import React, { useState } from 'react';
import { Node, Edge, MarkerType } from 'reactflow';
import { X, Settings, Database, Globe, Smartphone, Cpu, Box, Zap, Code, Workflow, ArrowRight } from 'lucide-react';
import WeUIModal from '@/components/modals/WeUIModal';
import ServiceFlowModal from '@/components/modals/ServiceFlowModal';
import CodeEditorModal from '@/components/modals/CodeEditorModal';
import UserTypeModal from '@/components/modals/UserTypeModal';

interface NodePropertiesPanelProps {
  selectedNode: Node | null;
  selectedEdge?: Edge | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onUpdateEdge?: (edgeId: string, updates: Partial<Edge>) => void;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onUpdateNode,
  onUpdateEdge,
}) => {
  const [showWeUIModal, setShowWeUIModal] = useState(false);
  const [showServiceFlowModal, setShowServiceFlowModal] = useState(false);
  const [showCodeEditorModal, setShowCodeEditorModal] = useState(false);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);

  console.log('selectedNode:', selectedNode)
  
  if (!selectedNode && !selectedEdge) return null;

  const handleInputChange = (field: string, value: string) => {
    if (selectedNode) {
      onUpdateNode(selectedNode.id, {
        ...selectedNode.data,
        [field]: value
      });
    }
  };

  const handleEdgeInputChange = (field: string, value: any) => {
    if (selectedEdge && onUpdateEdge) {
      onUpdateEdge(selectedEdge.id, {
        ...selectedEdge,
        [field]: value
      });
    }
  };

  const getNodeIcon = (nodeData: Record<string, unknown>) => {
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
  };

  const IconComponent = selectedNode ? getNodeIcon(selectedNode.data) : ArrowRight;

  const edgeTypes = [
    { value: 'default', label: 'Default' },
    { value: 'straight', label: 'Straight' },
    { value: 'step', label: 'Step' },
    { value: 'smoothstep', label: 'Smooth Step' },
    { value: 'bezier', label: 'Bezier' }
  ];

  return (
    <div className="w-full bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-slate-50 dark:bg-gradient-to-r dark:from-blue-900/20 dark:to-slate-900">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-white dark:text-white">
            {selectedNode ? 'Node Properties' : 'Edge Properties'}
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
            {/* Header */}
            <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-blue-50 to-slate-50 dark:bg-gradient-to-r dark:from-blue-900/30 dark:to-slate-700 rounded-lg border border-slate-200 dark:border-slate-600">
              <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {selectedNode ? selectedNode.data.label : 'Connection'}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  ID: {selectedNode ? selectedNode.id : selectedEdge?.id}
                </div>
                {selectedNode && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 font-mono">
                    Type: {selectedNode.data.type || 'N/A'}
                  </div>
                )}
              </div>
            </div>

            {/* Edge Properties */}
            {selectedEdge && (
              <>
                <div className="space-y-4">
                  <h4 className="font-medium text-white dark:text-white">Connection Type</h4>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Line Type
                    </label>
                    <select
                      value={selectedEdge.type || 'default'}
                      onChange={(e) => handleEdgeInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      {edgeTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Animation
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedEdge.animated || false}
                        onChange={(e) => handleEdgeInputChange('animated', e.target.checked)}
                        className="mr-2"
                      />
                      <span className="text-sm">Animated</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Arrow Type
                    </label>
                    <select
                      value={
                        typeof selectedEdge.markerEnd === 'object' && selectedEdge.markerEnd?.type 
                          ? selectedEdge.markerEnd.type 
                          : MarkerType.ArrowClosed
                      }
                      onChange={(e) => handleEdgeInputChange('markerEnd', {
                        type: e.target.value as MarkerType,
                        color: '#3b82f6'
                      })}
                      className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                    >
                      <option value={MarkerType.Arrow}>Arrow</option>
                      <option value={MarkerType.ArrowClosed}>Arrow Closed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Line Color
                    </label>
                    <input
                      type="color"
                      value={(selectedEdge.style as any)?.stroke || '#3b82f6'}
                      onChange={(e) => handleEdgeInputChange('style', {
                        ...(selectedEdge.style || {}),
                        stroke: e.target.value
                      })}
                      className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer bg-white dark:bg-slate-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Line Width
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={(selectedEdge.style as any)?.strokeWidth || 2}
                      onChange={(e) => handleEdgeInputChange('style', {
                        ...(selectedEdge.style || {}),
                        strokeWidth: parseInt(e.target.value)
                      })}
                      className="w-full"
                    />
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {(selectedEdge.style as any)?.strokeWidth || 2}px
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Node Properties */}
            {selectedNode && (
              <>
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
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={selectedNode.data.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
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

            {/* Node-specific Properties */}
            {selectedNode.data.label === 'API Call' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white dark:text-white">API Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Method
                  </label>
                  <select
                    value={selectedNode.data.method || 'GET'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                  >
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>
            )}

            {selectedNode.data.label === 'UI Component' && (
              <div className="space-y-4">
                <h4 className="font-medium text-white dark:text-white">UI Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Component Type
                  </label>
                  <select
                    value={selectedNode.data.componentType || 'Button'}
                    onChange={(e) => handleInputChange('componentType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                  >
                    <option value="Button">Button</option>
                    <option value="Input">Input</option>
                    <option value="Card">Card</option>
                    <option value="Table">Table</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Text Content
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.textContent || ''}
                    onChange={(e) => handleInputChange('textContent', e.target.value)}
                    placeholder="Enter text content..."
                    className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Style Properties */}
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
                  className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer bg-white dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Border Color
                </label>
                <input
                  type="color"
                  value={selectedNode.data.borderColor || '#e2e8f0'}
                  onChange={(e) => handleInputChange('borderColor', e.target.value)}
                  className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer bg-white dark:bg-slate-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Border Width
                </label>
                <select
                  value={selectedNode.data.borderWidth || '2'}
                  onChange={(e) => handleInputChange('borderWidth', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="1">1px</option>
                  <option value="2">2px</option>
                  <option value="3">3px</option>
                  <option value="4">4px</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Shadow
                </label>
                <select
                  value={selectedNode.data.shadow || 'shadow-lg'}
                  onChange={(e) => handleInputChange('shadow', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="shadow-none">None</option>
                  <option value="shadow-sm">Small</option>
                  <option value="shadow-md">Medium</option>
                  <option value="shadow-lg">Large</option>
                  <option value="shadow-xl">Extra Large</option>
                  <option value="shadow-2xl">2X Large</option>
                </select>
              </div>
            </div>

            {/* Advanced Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Advanced</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Width
                </label>
                <input
                  type="text"
                  value={selectedNode.data.width || 'auto'}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  placeholder="auto, 200px, 50%"
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={selectedNode.data.opacity || '100'}
                  onChange={(e) => handleInputChange('opacity', e.target.value)}
                  className="w-full"
                />
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {selectedNode.data.opacity || '100'}%
                </div>
              </div>
            </div>

            {/* Animation Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-white dark:text-white">Animation</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transition Duration
                </label>
                <select
                  value={selectedNode.data.transitionDuration || 'duration-200'}
                  onChange={(e) => handleInputChange('transitionDuration', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white/80 dark:bg-purple-800/50 text-slate-900 dark:text-white backdrop-blur-sm"
                >
                  <option value="duration-150">150ms</option>
                  <option value="duration-200">200ms</option>
                  <option value="duration-300">300ms</option>
                  <option value="duration-500">500ms</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Hover Effects
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNode.data.hoverScale === 'true'}
                      onChange={(e) => handleInputChange('hoverScale', e.target.checked.toString())}
                      className="mr-2"
                    />
                    <span className="text-sm">Scale on hover</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedNode.data.hoverShadow === 'true'}
                      onChange={(e) => handleInputChange('hoverShadow', e.target.checked.toString())}
                      className="mr-2"
                    />
                    <span className="text-sm">Shadow on hover</span>
                  </label>
                </div>
              </div>
            </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <h4 className="font-medium text-white dark:text-white">Actions</h4>
                  
                  <div className="space-y-3">
                    {/* Show different buttons based on node type */}
                    {selectedNode.data.type && selectedNode.data.type.endsWith('_PAGE') ? (
                      <button
                        onClick={() => setShowWeUIModal(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-blue-300/50"
                      >
                        <Code className="h-4 w-4" />
                        <span>Open WeUI</span>
                      </button>
                    ) : selectedNode.data.type === 'API_CALL' ? (
                      <button
                        onClick={() => setShowServiceFlowModal(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-green-300/50"
                      >
                        <Workflow className="h-4 w-4" />
                        <span>Open Service Flow</span>
                      </button>
                    ) : selectedNode.data.type === 'ACTOR_USER' ? (
                      <button
                        onClick={() => setShowUserTypeModal(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-amber-300/50"
                      >
                        <Settings className="h-4 w-4" />
                        <span>Open User Type</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowCodeEditorModal(true)}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-lg transition-all duration-300 shadow-lg hover:shadow-purple-300/50"
                      >
                        <Code className="h-4 w-4" />
                        <span>Open Code Editor</span>
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Bottom fade indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none z-10"></div>
      </div>
      
      {/* Modals */}
      <WeUIModal
        isOpen={showWeUIModal}
        onClose={() => setShowWeUIModal(false)}
        nodeData={selectedNode?.data}
      />
      
      <ServiceFlowModal
        isOpen={showServiceFlowModal}
        onClose={() => setShowServiceFlowModal(false)}
        nodeData={selectedNode?.data}
      />
      
      <CodeEditorModal
        isOpen={showCodeEditorModal}
        onClose={() => setShowCodeEditorModal(false)}
        nodeData={selectedNode?.data}
      />
      
      <UserTypeModal
        isOpen={showUserTypeModal}
        onClose={() => setShowUserTypeModal(false)}
        nodeData={selectedNode?.data}
      />
    </div>
  );
};

export default NodePropertiesPanel;