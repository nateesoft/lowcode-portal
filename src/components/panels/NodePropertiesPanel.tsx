import React from 'react';
import { Node } from 'reactflow';
import { X, Settings, Database, Globe, Smartphone, Cpu, Box, Zap } from 'lucide-react';

interface NodePropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
}

const NodePropertiesPanel: React.FC<NodePropertiesPanelProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
}) => {
  if (!selectedNode) return null;

  const handleInputChange = (field: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [field]: value
    });
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

  const IconComponent = getNodeIcon(selectedNode.data);

  return (
    <div className="w-80 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
        <div className="flex items-center space-x-2">
          <Settings className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="font-semibold text-slate-900 dark:text-white">Node Properties</h3>
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
            <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              <div>
                <div className="font-medium text-slate-900 dark:text-white">
                  {selectedNode.data.label}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  ID: {selectedNode.id}
                </div>
              </div>
            </div>

            {/* Basic Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Basic Properties</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Label
                </label>
                <input
                  type="text"
                  value={selectedNode.data.label || ''}
                  onChange={(e) => handleInputChange('label', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Position Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Position</h4>
              
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
                <h4 className="font-medium text-slate-900 dark:text-white">API Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    URL
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.url || ''}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    placeholder="https://api.example.com/endpoint"
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Method
                  </label>
                  <select
                    value={selectedNode.data.method || 'GET'}
                    onChange={(e) => handleInputChange('method', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                <h4 className="font-medium text-slate-900 dark:text-white">UI Configuration</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Component Type
                  </label>
                  <select
                    value={selectedNode.data.componentType || 'Button'}
                    onChange={(e) => handleInputChange('componentType', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            {/* Style Properties */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 dark:text-white">Styling</h4>
              
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
                  value={selectedNode.data.borderColor || '#e2e8f0'}
                  onChange={(e) => handleInputChange('borderColor', e.target.value)}
                  className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Border Width
                </label>
                <select
                  value={selectedNode.data.borderWidth || '2'}
                  onChange={(e) => handleInputChange('borderWidth', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
              <h4 className="font-medium text-slate-900 dark:text-white">Advanced</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Width
                </label>
                <input
                  type="text"
                  value={selectedNode.data.width || 'auto'}
                  onChange={(e) => handleInputChange('width', e.target.value)}
                  placeholder="auto, 200px, 50%"
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
              <h4 className="font-medium text-slate-900 dark:text-white">Animation</h4>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Transition Duration
                </label>
                <select
                  value={selectedNode.data.transitionDuration || 'duration-200'}
                  onChange={(e) => handleInputChange('transitionDuration', e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
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
          </div>
        </div>
        
        {/* Bottom fade indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-white dark:from-slate-800 to-transparent pointer-events-none z-10"></div>
      </div>
    </div>
  );
};

export default NodePropertiesPanel;