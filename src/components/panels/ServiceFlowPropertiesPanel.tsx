import React, { useState } from 'react';
import { Node } from 'reactflow';
import { X, Settings, Database, Globe, Smartphone, Cpu, Box, Zap, Code2, Square, Diamond, Circle, Hexagon, Triangle, Octagon } from 'lucide-react';

interface ServiceFlowPropertiesPanelProps {
  selectedNode: Node | null;
  onClose: () => void;
  onUpdateNode: (nodeId: string, updates: Partial<Node['data']>) => void;
  onOpenCodeEditor: (nodeData: any) => void;
}

const ServiceFlowPropertiesPanel: React.FC<ServiceFlowPropertiesPanelProps> = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onOpenCodeEditor,
}) => {
  if (!selectedNode) return null;

  const handleInputChange = (field: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [field]: value
    });
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
    <div className="w-64 bg-white dark:bg-slate-800 border-l border-slate-200 dark:border-slate-700 flex flex-col h-full shadow-2xl">
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

              <button
                onClick={() => onOpenCodeEditor(selectedNode.data)}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <Code2 className="h-4 w-4" />
                <span>Open Code Editor</span>
              </button>
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