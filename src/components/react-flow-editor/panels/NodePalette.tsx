import React from 'react';
import { 
  Database, Cpu, Box, Zap, Globe, 
  Square, Layers, ChevronDown, ChevronRight 
} from 'lucide-react';

export interface NodeTemplate {
  id: string;
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  backgroundColor?: string;
  borderColor?: string;
  defaultSize?: { width: number; height: number };
}

export const nodeTemplates: NodeTemplate[] = [
  // Input/Output
  {
    id: 'input',
    type: 'customNode',
    label: 'Input',
    description: 'Data input node',
    icon: Square,
    category: 'Input/Output',
    backgroundColor: '#f3f4f6',
    borderColor: '#6b7280',
    defaultSize: { width: 180, height: 80 }
  },
  {
    id: 'output',
    type: 'customNode',
    label: 'Output',
    description: 'Data output node',
    icon: Square,
    category: 'Input/Output',
    backgroundColor: '#f3f4f6',
    borderColor: '#6b7280',
    defaultSize: { width: 180, height: 80 }
  },

  // Processing
  {
    id: 'processor',
    type: 'customNode',
    label: 'Processor',
    description: 'Data processing node',
    icon: Cpu,
    category: 'Processing',
    backgroundColor: '#dbeafe',
    borderColor: '#3b82f6',
    defaultSize: { width: 200, height: 100 }
  },
  {
    id: 'transformer',
    type: 'customNode',
    label: 'Transformer',
    description: 'Data transformation node',
    icon: Zap,
    category: 'Processing',
    backgroundColor: '#fef3c7',
    borderColor: '#f59e0b',
    defaultSize: { width: 200, height: 100 }
  },

  // Storage
  {
    id: 'database',
    type: 'customNode',
    label: 'Database',
    description: 'Database connection',
    icon: Database,
    category: 'Storage',
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    defaultSize: { width: 200, height: 100 }
  },
  {
    id: 'storage',
    type: 'customNode',
    label: 'Storage',
    description: 'File storage node',
    icon: Box,
    category: 'Storage',
    backgroundColor: '#dcfce7',
    borderColor: '#16a34a',
    defaultSize: { width: 200, height: 100 }
  },

  // API
  {
    id: 'api',
    type: 'customNode',
    label: 'API Call',
    description: 'External API call',
    icon: Globe,
    category: 'API',
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    defaultSize: { width: 200, height: 100 }
  },
  {
    id: 'webhook',
    type: 'customNode',
    label: 'Webhook',
    description: 'Webhook endpoint',
    icon: Globe,
    category: 'API',
    backgroundColor: '#fce7f3',
    borderColor: '#ec4899',
    defaultSize: { width: 200, height: 100 }
  },

  // Logic
  {
    id: 'condition',
    type: 'customNode',
    label: 'Condition',
    description: 'Conditional logic',
    icon: Layers,
    category: 'Logic',
    backgroundColor: '#f3e8ff',
    borderColor: '#8b5cf6',
    defaultSize: { width: 200, height: 100 }
  },
  {
    id: 'loop',
    type: 'customNode',
    label: 'Loop',
    description: 'Loop iteration',
    icon: Layers,
    category: 'Logic',
    backgroundColor: '#f3e8ff',
    borderColor: '#8b5cf6',
    defaultSize: { width: 200, height: 100 }
  }
];

interface NodePaletteProps {
  isOpen: boolean;
  onToggle: () => void;
  onNodeDrag: (event: React.DragEvent, nodeTemplate: NodeTemplate) => void;
}

const NodePalette: React.FC<NodePaletteProps> = ({ isOpen, onToggle, onNodeDrag }) => {
  const [expandedCategories, setExpandedCategories] = React.useState<Set<string>>(new Set(['Input/Output']));

  const categories = Array.from(new Set(nodeTemplates.map(node => node.category)));

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const onDragStart = (event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    onNodeDrag(event, nodeTemplate);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 shadow-lg z-40 transition-transform duration-300 ${
      isOpen ? 'translate-x-0' : '-translate-x-full'
    } w-80`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Node Palette</h3>
          <button 
            onClick={onToggle}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-1">Drag nodes to the canvas</p>
      </div>

      {/* Node Categories */}
      <div className="overflow-y-auto h-[calc(100%-80px)]">
        {categories.map(category => {
          const categoryNodes = nodeTemplates.filter(node => node.category === category);
          const isExpanded = expandedCategories.has(category);

          return (
            <div key={category} className="border-b border-gray-100">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900">{category}</span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                )}
              </button>

              {/* Category Nodes */}
              {isExpanded && (
                <div className="pb-2">
                  {categoryNodes.map(nodeTemplate => {
                    const IconComponent = nodeTemplate.icon;
                    return (
                      <div
                        key={nodeTemplate.id}
                        className="mx-2 mb-2 p-3 border border-gray-200 rounded-lg cursor-move hover:shadow-md transition-shadow bg-white"
                        draggable
                        onDragStart={(e) => onDragStart(e, nodeTemplate)}
                        style={{
                          backgroundColor: nodeTemplate.backgroundColor,
                          borderColor: nodeTemplate.borderColor
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-5 h-5 text-gray-600" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-gray-900">
                              {nodeTemplate.label}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {nodeTemplate.description}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NodePalette;