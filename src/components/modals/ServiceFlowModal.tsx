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
import { X, Workflow, Save, Play, Download, Upload, Database, Cpu, Box, Zap, Circle, Square, Diamond, ArrowRight, Hexagon, Triangle, Octagon } from 'lucide-react';
import ServiceFlowPropertiesPanel from '@/components/panels/ServiceFlowPropertiesPanel';
import CodeEditorModal from '@/components/modals/CodeEditorModal';

interface ServiceFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
}

// Flowchart Shape Components
const FlowchartNode = ({ data, selected, id }: { data: any; selected?: boolean; id?: string }) => {
  const baseStyle = {
    backgroundColor: data.backgroundColor || '#ffffff',
    borderColor: selected ? '#3b82f6' : (data.borderColor || '#6b7280'),
  };

  // Handle delete node
  const handleDeleteNode = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (id) {
      // Dispatch event to parent component to delete this node
      window.dispatchEvent(new CustomEvent('deleteServiceNode', { 
        detail: { nodeId: id } 
      }));
    }
  }, [id]);

  const shapeClasses = {
    rectangle: 'rounded-md',
    circle: 'rounded-full aspect-square',
    diamond: 'transform rotate-45 rounded-sm',
    triangle: 'clip-triangle',
    hexagon: 'clip-hexagon',
    octagon: 'clip-octagon'
  };

  const shapeClass = shapeClasses[data.shape as keyof typeof shapeClasses] || 'rounded-md';
  
  return (
    <div className="relative">
      {/* Delete Button */}
      {selected && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="flowchart-input"
        className="w-2 h-2 !bg-blue-500 !border !border-white shadow-sm"
        style={{ left: -4 }}
      />
      
      <div 
        className={`w-20 h-12 border-2 transition-colors flex items-center justify-center text-xs font-medium text-slate-700 ${shapeClass} ${
          selected ? 'border-blue-500 shadow-blue-200 shadow-md' : ''
        }`}
        style={baseStyle}
      >
        {data.shape === 'diamond' ? (
          <span className="transform -rotate-45 text-center leading-tight">
            {data.label}
          </span>
        ) : (
          <span className="text-center leading-tight px-1">
            {data.label}
          </span>
        )}
      </div>
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="flowchart-output"
        className="w-2 h-2 !bg-green-500 !border !border-white shadow-sm"
        style={{ right: -4 }}
      />
    </div>
  );
};

// Custom Service Node Component
const ServiceNode = ({ data, selected, id }: { data: any; selected?: boolean; id?: string }) => {
  const nodeStyle = {
    backgroundColor: data.backgroundColor || '#ffffff',
    borderColor: selected ? '#3b82f6' : (data.borderColor || '#a1a1aa'),
  };

  // Handle delete node
  const handleDeleteNode = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (id) {
      // Dispatch event to parent component to delete this node
      window.dispatchEvent(new CustomEvent('deleteServiceNode', { 
        detail: { nodeId: id } 
      }));
    }
  }, [id]);
  
  return (
    <div 
      className={`px-3 py-2 shadow-md rounded-md border-2 transition-colors relative ${
        selected ? 'border-blue-500 shadow-blue-200' : ''
      }`}
      style={nodeStyle}
    >
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="service-input"
        className="w-3 h-3 !bg-purple-500 !border-2 !border-white shadow-md"
        style={{ left: -6 }}
      />
      
      {/* Delete Button */}
      {selected && (
        <button
          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Service Node Content */}
      <div className="flex items-center">
        {data.icon && <data.icon className="h-3 w-3 mr-2 text-purple-600" />}
        <div>
          <div className="text-sm font-medium text-slate-900">{data.label}</div>
          <div className="text-xs text-gray-500">{data.type}</div>
        </div>
      </div>
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="service-output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-md"
        style={{ right: -6 }}
      />
    </div>
  );
};

const serviceNodeTypes: NodeTypes = {
  service: ServiceNode,
  flowchart: FlowchartNode,
};

// Initial service nodes
const initialServiceNodes: Node[] = [
  {
    id: '1',
    type: 'service',
    position: { x: 100, y: 100 },
    data: {
      label: 'User Service',
      type: 'REST API',
      icon: Database
    },
  },
  {
    id: '2',
    type: 'service',
    position: { x: 300, y: 100 },
    data: {
      label: 'Auth Service',
      type: 'Middleware',
      icon: Zap
    },
  },
  {
    id: '3',
    type: 'service',
    position: { x: 200, y: 200 },
    data: {
      label: 'Data Processor',
      type: 'Function',
      icon: Cpu
    },
  },
];

const initialServiceEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2', 
    sourceHandle: 'service-output',
    targetHandle: 'service-input',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3', 
    sourceHandle: 'service-output',
    targetHandle: 'service-input',
    type: 'smoothstep',
    animated: true,
    style: { stroke: '#10b981', strokeWidth: 2 }
  },
];

const ServiceFlowModal: React.FC<ServiceFlowModalProps> = ({
  isOpen,
  onClose,
  nodeData,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialServiceNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialServiceEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedService, setSelectedService] = useState<Node | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedNodeForEditor, setSelectedNodeForEditor] = useState<any>(null);
  const [isActiveFlow, setIsActiveFlow] = useState(false);
  const [flowName, setFlowName] = useState('Untitled Flow');

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onInit = (rfi: ReactFlowInstance) => {
    setReactFlowInstance(rfi);
  };

  // Handle node deletion with useEffect
  React.useEffect(() => {
    const handleDeleteServiceNode = (event: any) => {
      const { nodeId } = event.detail;
      
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      
      // Remove all edges connected to this node
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));

      // Clear selection if this node was selected
      if (selectedService?.id === nodeId) {
        setSelectedService(null);
        setShowPropertiesPanel(false);
      }
    };
    
    window.addEventListener('deleteServiceNode', handleDeleteServiceNode);
    
    return () => {
      window.removeEventListener('deleteServiceNode', handleDeleteServiceNode);
    };
  }, [selectedService?.id, setNodes, setEdges]);

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes }: { nodes: Node[]; edges: Edge[] }) => {
      if (selectedNodes.length === 1) {
        setSelectedService(selectedNodes[0]);
        setShowPropertiesPanel(true);
      } else {
        setSelectedService(null);
        setShowPropertiesPanel(false);
      }
    },
    [],
  );

  const handleSaveFlow = async () => {
    const flowData = {
      id: Date.now().toString(),
      name: flowName,
      isActive: isActiveFlow,
      nodes,
      edges,
      viewport: reactFlowInstance?.getViewport(),
      createdAt: new Date().toISOString()
    };

    console.log('Saving Service Flow:', flowData);
    
    try {
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/flows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData)
      });

      if (response.ok) {
        console.log('Flow saved successfully');
        // You could show a success toast here
        onClose();
      } else {
        console.error('Failed to save flow');
        alert('Failed to save flow');
      }
    } catch (error) {
      console.error('Error saving flow:', error);
      alert('Error saving flow: ' + error);
    }
  };

  const handleTestFlow = async () => {
    if (!isActiveFlow) {
      alert('Please activate the flow before testing');
      return;
    }

    const flowData = {
      flowId: Date.now().toString(),
      name: flowName,
      nodes,
      edges
    };

    try {
      console.log('Testing flow via API:', flowData);
      
      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/flows/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(flowData)
      });

      const result = await response.json();
      
      if (response.ok) {
        console.log('Flow executed successfully:', result);
        alert('Flow executed successfully! Check console for details.');
      } else {
        console.error('Failed to execute flow:', result);
        alert('Failed to execute flow: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error executing flow:', error);
      alert('Error executing flow: ' + error);
    }
  };

  const onUpdateNode = useCallback(
    (nodeId: string, updates: Partial<Node['data']>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, ...updates } }
            : node
        )
      );
      
      if (selectedService && selectedService.id === nodeId) {
        setSelectedService(prev => prev ? { ...prev, data: { ...prev.data, ...updates } } : null);
      }
    },
    [setNodes, selectedService],
  );

  const onClosePropertiesPanel = useCallback(() => {
    setShowPropertiesPanel(false);
    setSelectedService(null);
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds) => nds.map(node => ({ ...node, selected: false })));
    }
  }, [reactFlowInstance]);

  const onOpenCodeEditor = useCallback((nodeData: any) => {
    setSelectedNodeForEditor(nodeData);
    setShowCodeEditor(true);
  }, []);

  const onCloseCodeEditor = useCallback(() => {
    setShowCodeEditor(false);
    setSelectedNodeForEditor(null);
  }, []);

  const serviceTypes = [
    { type: 'REST API', icon: Database, color: 'bg-blue-100 text-blue-800' },
    { type: 'GraphQL', icon: Zap, color: 'bg-purple-100 text-purple-800' },
    { type: 'Microservice', icon: Box, color: 'bg-green-100 text-green-800' },
    { type: 'Function', icon: Cpu, color: 'bg-yellow-100 text-yellow-800' },
  ];

  const flowchartShapes = [
    { shape: 'rectangle', name: 'Process', icon: Square, color: 'bg-slate-100 text-slate-800' },
    { shape: 'diamond', name: 'Decision', icon: Diamond, color: 'bg-orange-100 text-orange-800' },
    { shape: 'circle', name: 'Start/End', icon: Circle, color: 'bg-green-100 text-green-800' },
    { shape: 'hexagon', name: 'Preparation', icon: Hexagon, color: 'bg-blue-100 text-blue-800' },
    { shape: 'triangle', name: 'Input/Output', icon: Triangle, color: 'bg-purple-100 text-purple-800' },
    { shape: 'octagon', name: 'Stop', icon: Octagon, color: 'bg-red-100 text-red-800' },
  ];

  const onServiceDragStart = (event: React.DragEvent, serviceType: string, icon: any) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      nodeType: 'service',
      type: serviceType,
      icon: icon.name
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onShapeDragStart = (event: React.DragEvent, shape: string) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      nodeType: 'flowchart',
      shape: shape
    }));
    event.dataTransfer.effectAllowed = 'move';
  };

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      if (reactFlowWrapper.current && reactFlowInstance) {
        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const dragData = event.dataTransfer.getData('application/reactflow');

        if (!dragData) return;

        const parsedData = JSON.parse(dragData);
        const position = reactFlowInstance.project({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        let newNode: Node;

        if (parsedData.nodeType === 'service') {
          newNode = {
            id: `service-${nodes.length + 1}`,
            type: 'service',
            position,
            data: {
              label: `New ${parsedData.type}`,
              type: parsedData.type,
              icon: serviceTypes.find(s => s.type === parsedData.type)?.icon || Box
            },
          };
        } else if (parsedData.nodeType === 'flowchart') {
          const shapeName = flowchartShapes.find(s => s.shape === parsedData.shape)?.name || 'Shape';
          newNode = {
            id: `flowchart-${nodes.length + 1}`,
            type: 'flowchart',
            position,
            data: {
              label: shapeName,
              shape: parsedData.shape,
              backgroundColor: '#ffffff',
              borderColor: '#6b7280'
            },
          };
        } else {
          return;
        }

        setNodes((nds) => nds.concat(newNode));
      }
    },
    [reactFlowInstance, nodes, setNodes, serviceTypes, flowchartShapes],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Workflow className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => setFlowName(e.target.value)}
                  className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-green-500 rounded px-1"
                  placeholder="Flow Name"
                />
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Design and manage your service architecture flow
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-slate-500 dark:text-slate-400">Active Flow:</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActiveFlow}
                      onChange={(e) => setIsActiveFlow(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveFlow}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Flow</span>
            </button>
            <button 
              onClick={handleTestFlow}
              disabled={!isActiveFlow}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                isActiveFlow 
                  ? 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20' 
                  : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
              }`}
            >
              <Play className="h-4 w-4" />
              <span>Test Flow</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex min-h-0">
          {/* Tool Palette Sidebar */}
          <div className="w-64 bg-slate-50 dark:bg-slate-700 border-r border-slate-200 dark:border-slate-600 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-6 min-h-0">
              {/* Service Types Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Service Types
                </h3>
                <div className="space-y-2">
                  {serviceTypes.map((service) => {
                    const IconComponent = service.icon;
                    return (
                      <div
                        key={service.type}
                        className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-green-500 dark:hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 cursor-move transition-colors"
                        draggable
                        onDragStart={(event) => onServiceDragStart(event, service.type, service.icon)}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {service.type}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Flowchart Shapes Section */}
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">
                  Flowchart Shapes
                </h3>
                <div className="space-y-2">
                  {flowchartShapes.map((shape) => {
                    const IconComponent = shape.icon;
                    return (
                      <div
                        key={shape.shape}
                        className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-move transition-colors"
                        draggable
                        onDragStart={(event) => onShapeDragStart(event, shape.shape)}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                          <span className="text-sm text-slate-700 dark:text-slate-300">
                            {shape.name}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Service Info */}
              {selectedService && (
                <div className="mt-6 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Selected Service
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Name:</span>
                      <span className="ml-2 text-slate-900 dark:text-white">
                        {selectedService.data.label}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">Type:</span>
                      <span className="ml-2 text-slate-900 dark:text-white">
                        {selectedService.data.type}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400">ID:</span>
                      <span className="ml-2 text-slate-900 dark:text-white">
                        {selectedService.id}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ReactFlow Canvas */}
          <div className={`flex-1 relative ${showPropertiesPanel ? 'mr-64' : ''}`} ref={reactFlowWrapper}>
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
              nodeTypes={serviceNodeTypes}
              fitView
              deleteKeyCode={null}
              className="bg-slate-100 dark:bg-slate-900"
            >
              <Controls />
              <MiniMap 
                nodeColor={() => '#10b981'}
                className="!bg-slate-50 !border-slate-300"
              />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-blue-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-blue-900/30">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Upload className="h-4 w-4" />
              <span>Import</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Drag service types from the left panel to create your flow
          </div>
        </div>
      </div>

      {/* Properties Panel - Fixed Sidebar */}
      {showPropertiesPanel && (
        <div className="fixed right-0 top-0 h-full z-50">
          <ServiceFlowPropertiesPanel
            selectedNode={selectedService}
            onClose={onClosePropertiesPanel}
            onUpdateNode={onUpdateNode}
            onOpenCodeEditor={onOpenCodeEditor}
          />
        </div>
      )}

      {/* Code Editor Modal */}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={onCloseCodeEditor}
        nodeData={selectedNodeForEditor}
      />
    </div>
  );
};

const ServiceFlowModalWrapper: React.FC<ServiceFlowModalProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ServiceFlowModal {...props} />
    </ReactFlowProvider>
  );
};

export default ServiceFlowModalWrapper;