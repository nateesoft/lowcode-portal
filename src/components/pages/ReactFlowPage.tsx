import React, { useCallback, useState, useRef } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  OnConnect,
  ReactFlowProvider,
  ReactFlowInstance,
  NodeTypes,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft, Save, Play, Download, Upload, 
  Database, Cpu, Box, Zap,
  Menu
} from 'lucide-react';
import { PageType } from '@/lib/types';
import NodePropertiesPanel from '@/components/panels/NodePropertiesPanel';

// Custom Node Components
interface NodeData {
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  backgroundColor?: string;
  borderColor?: string;
  [key: string]: unknown;
}

const CustomNode = ({ data, selected }: { data: NodeData; selected?: boolean }) => {
  const nodeStyle = {
    backgroundColor: data.backgroundColor || '#ffffff',
    borderColor: selected ? '#3b82f6' : (data.borderColor || '#a1a1aa'),
  };
  
  return (
    <div 
      className={`px-4 py-2 shadow-lg rounded-lg border-2 transition-colors relative ${
        selected ? 'border-blue-500 shadow-blue-200' : ''
      }`}
      style={nodeStyle}
    >
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-md"
        style={{ left: -6 }}
      />
      
      {/* Node Content */}
      <div className="flex items-center">
        {data.icon && <data.icon className="h-4 w-4 mr-2 text-blue-600" />}
        <div className="ml-2">
          <div className="text-lg font-bold text-slate-900">{data.label}</div>
          <div className="text-gray-500 text-sm">{data.description}</div>
        </div>
      </div>
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-md"
        style={{ right: -6 }}
      />
    </div>
  );
};

const nodeTypes: NodeTypes = {
  custom: CustomNode,
};

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 25 },
    data: {
      label: 'API Call',
      description: 'HTTP Request',
      icon: Database
    },
  },
  {
    id: '2',
    type: 'custom',
    position: { x: 100, y: 125 },
    data: {
      label: 'UI Component',
      description: 'Button/Form',
      icon: Box
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    sourceHandle: 'output',
    targetHandle: 'input',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 }
  },
];

interface ReactFlowPageProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: PageType) => void;
}

const ReactFlowPage: React.FC<ReactFlowPageProps> = ({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  setCurrentPage,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onInit = (rfi: ReactFlowInstance) => setReactFlowInstance(rfi);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0]);
        setShowPropertiesPanel(true);
      } else {
        setSelectedNode(null);
        setShowPropertiesPanel(false);
      }
    },
    [],
  );

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<Node['data']>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
      
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
      }
    },
    [setNodes, selectedNode],
  );

  const onClosePropertiesPanel = useCallback(() => {
    setShowPropertiesPanel(false);
    setSelectedNode(null);
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds) => nds.map(node => ({ ...node, selected: false })));
    }
  }, [reactFlowInstance]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const type = event.dataTransfer.getData('application/reactflow');

        if (typeof type === 'undefined' || !type) {
          return;
        }

        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
          id: `${nodes.length + 1}`,
          type: 'custom',
          position,
          data: {
            label: type,
            description: getNodeDescription(type),
            icon: getNodeIcon(type)
          },
        };

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes],
  );

  const getNodeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'API Call': 'HTTP Request',
      'Database': 'Data Storage',
      'UI Component': 'Interface Element',
      'Logic': 'Business Logic',
      'Condition': 'If/Else Logic',
      'Loop': 'Iteration',
      'Transform': 'Data Transform'
    };
    return descriptions[type] || 'Custom Node';
  };

  const getNodeIcon = (type: string) => {
    const icons: Record<string, React.ComponentType<{ className?: string }>> = {
      'API Call': Database,
      'Database': Database,
      'UI Component': Box,
      'Logic': Zap,
      'Condition': Zap,
      'Loop': Zap,
      'Transform': Cpu
    };
    return icons[type] || Box;
  };

  const nodeCategories = [
    {
      title: 'Data Sources',
      items: ['API Call', 'Database', 'File Input']
    },
    {
      title: 'UI Components',
      items: ['Button', 'Form', 'Chart', 'Table']
    },
    {
      title: 'Logic',
      items: ['Condition', 'Loop', 'Transform', 'Function']
    },
    {
      title: 'Outputs',
      items: ['Display', 'Export', 'Notification']
    }
  ];

  const onDragStart = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Component Palette Sidebar */}
      <div className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Box className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-slate-900 dark:text-white">Flow Builder</span>
            </div>
            <button 
              onClick={() => setCurrentPage('dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-6">
            {nodeCategories.map((category) => (
              <div key={category.title}>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
                  {category.title}
                </h4>
                <div className="space-y-2">
                  {category.items.map((item) => (
                    <div
                      key={item}
                      className="w-full text-left px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors cursor-move"
                      draggable
                      onDragStart={(event) => onDragStart(event, item)}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex-shrink-0">
          <div className="flex space-x-2">
            <button className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Save className="h-4 w-4 mx-auto" />
            </button>
            <button className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Play className="h-4 w-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Main ReactFlow Area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Box className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 dark:text-white">Flow Builder</span>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setCurrentPage('dashboard')}
                className="hidden lg:flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
              <div className="h-6 border-l border-slate-200 dark:border-slate-700"></div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Drag components from left panel to canvas
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Run Flow
              </button>
            </div>
          </div>
        </div>

        {/* ReactFlow Canvas */}
        <div className="flex-1 h-[calc(100vh-140px)]" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onSelectionChange={onSelectionChange}
            nodeTypes={nodeTypes}
            fitView
            className="bg-teal-50 dark:bg-slate-900"
          >
            <Controls />
            <MiniMap 
              nodeColor={() => '#6366f1'}
              className="!bg-slate-100 !border-slate-300"
            />
            <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel - Fixed Sidebar Overlay */}
      {showPropertiesPanel && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClosePropertiesPanel}
          />
          
          {/* Properties Panel */}
          <div className="fixed right-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out">
            <NodePropertiesPanel
              selectedNode={selectedNode}
              onClose={onClosePropertiesPanel}
              onUpdateNode={onUpdateNode}
            />
          </div>
        </>
      )}
    </div>
  );
};

// Wrapper component to provide ReactFlowProvider
const ReactFlowPageWrapper: React.FC<ReactFlowPageProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ReactFlowPage {...props} />
    </ReactFlowProvider>
  );
};

export default ReactFlowPageWrapper;