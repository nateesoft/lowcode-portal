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
import { X, Workflow, Save, Play, Download, Upload, Database, Cpu, Box, Zap, Circle, Square, Diamond, ArrowRight, Hexagon, Triangle, Octagon, Maximize2, Minimize2, Move } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';
import ServiceFlowPropertiesPanel from '@/components/panels/ServiceFlowPropertiesPanel';
import CodeEditorModal from '@/components/modals/CodeEditorModal';
import { flowAPI, FlowData } from '@/lib/api';

interface ServiceFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  editingFlow?: any;
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
          <div className="text-center leading-tight px-1 relative">
            <span>{data.label}</span>
            {data.code && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" title="Has custom code"></div>
            )}
          </div>
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
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium text-slate-900">{data.label}</div>
            {data.code && (
              <div className="w-2 h-2 bg-green-500 rounded-full" title="Has custom code"></div>
            )}
          </div>
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
  editingFlow,
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
  const [flowId, setFlowId] = useState<string | null>(null);
  const [version, setVersion] = useState('1.0.0');
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    handleMouseDown, 
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();

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
    const flowData: FlowData = {
      name: flowName,
      description: `Service flow v${version} with ${nodes.length} nodes`,
      isActive: isActiveFlow,
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.type || 'default',
        position: node.position,
        data: {
          ...node.data,
          // Preserve any existing content/code
          content: node.data.content || '',
          code: node.data.code || ''
        }
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        sourceHandle: edge.sourceHandle || undefined,
        targetHandle: edge.targetHandle || undefined,
        type: edge.type,
        animated: edge.animated,
        style: edge.style
      })),
      viewport: reactFlowInstance?.getViewport(),
      version: version
    };

    console.log('Saving Service Flow:', flowData);
    
    try {
      let result;
      if (flowId) {
        // Update existing flow
        result = await flowAPI.update(flowId, flowData);
        console.log('Flow updated successfully:', result);
        alert(`Flow "${result.name}" updated successfully!`);
      } else {
        // Create new flow
        result = await flowAPI.create(flowData);
        console.log('Flow created successfully:', result);
        alert(`Flow "${result.name}" created successfully!`);
        setFlowId(result.id); // Set the ID for future updates
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving flow:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Error saving flow: ' + errorMsg);
    }
  };

  const handleTestFlow = async () => {
    if (!isActiveFlow) {
      alert('Please activate the flow before testing');
      return;
    }

    // First save the current flow
    try {
      const flowData: FlowData = {
        name: flowName,
        description: `Service flow with ${nodes.length} nodes`,
        isActive: isActiveFlow,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: {
            ...node.data,
            content: node.data.content || '',
            code: node.data.code || ''
          }
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          sourceHandle: edge.sourceHandle || undefined,
          targetHandle: edge.targetHandle || undefined,
          type: edge.type,
          animated: edge.animated,
          style: edge.style
        })),
        viewport: reactFlowInstance?.getViewport()
      };

      console.log('Testing flow via API:', flowData);
      
      // Save flow first
      const savedFlow = await flowAPI.create(flowData);
      
      // Then execute it
      const result = await flowAPI.execute(savedFlow.id);
      
      console.log('Flow executed successfully:', result);
      alert(`Flow "${savedFlow.name}" executed successfully! Check console for details.`);
    } catch (error: any) {
      console.error('Error executing flow:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert('Error executing flow: ' + errorMsg);
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

  const onSaveNodeCode = useCallback((nodeId: string, code: string, language: string) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { 
              ...node, 
              data: { 
                ...node.data, 
                code: code,
                content: code,
                language: language 
              } 
            }
          : node
      )
    );
    
    // Also update selected service if it's the same node
    if (selectedService && selectedService.id === nodeId) {
      setSelectedService(prev => prev ? {
        ...prev,
        data: {
          ...prev.data,
          code: code,
          content: code,
          language: language
        }
      } : null);
    }
  }, [setNodes, selectedService]);

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

  // Load existing flow data when editing
  React.useEffect(() => {
    if (isOpen && editingFlow) {
      setFlowName(editingFlow.name || 'Untitled Flow');
      setIsActiveFlow(editingFlow.status === 'active');
      setFlowId(editingFlow.id);
      setVersion(editingFlow.configuration?.version || '1.0.0');
      
      // Load nodes and edges from the flow configuration
      if (editingFlow.configuration) {
        const config = editingFlow.configuration;
        
        if (config.nodes && config.nodes.length > 0) {
          const loadedNodes = config.nodes.map((node: any) => ({
            id: node.id,
            type: node.type || 'service',
            position: node.position || { x: 100, y: 100 },
            data: {
              ...node.data,
              // Ensure icon is properly set for service nodes
              icon: node.data.type === 'REST API' ? Database :
                    node.data.type === 'GraphQL' ? Zap :
                    node.data.type === 'Microservice' ? Box :
                    node.data.type === 'Function' ? Cpu :
                    Box // default
            }
          }));
          setNodes(loadedNodes);
        } else {
          setNodes(initialServiceNodes);
        }
        
        if (config.edges && config.edges.length > 0) {
          setEdges(config.edges);
        } else {
          setEdges(initialServiceEdges);
        }
        
        // Set viewport if available
        if (config.viewport && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.setViewport(config.viewport);
          }, 100);
        }
      }
    } else if (isOpen && !editingFlow) {
      // Reset to default when creating new flow
      setFlowName('Untitled Flow');
      setIsActiveFlow(false);
      setFlowId(null);
      setVersion('1.0.0');
      setNodes(initialServiceNodes);
      setEdges(initialServiceEdges);
    }
  }, [isOpen, editingFlow, setNodes, setEdges, reactFlowInstance]);

  // Reset position when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-7xl h-[90vh] flex flex-col"
        style={modalStyle}
      >
        {/* Header */}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Workflow className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="flex items-center space-x-3 mb-1">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={flowName}
                    onChange={(e) => setFlowName(e.target.value)}
                    className="text-xl font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-green-500 rounded px-1"
                    placeholder="Flow Name"
                  />
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-slate-500 dark:text-slate-400">v</span>
                    <input
                      type="text"
                      value={version}
                      onChange={(e) => setVersion(e.target.value)}
                      className="text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded px-2 py-1 w-20 text-center focus:ring-2 focus:ring-green-500"
                      placeholder="1.0.0"
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {editingFlow ? 'Edit your service architecture flow' : 'Design and manage your service architecture flow'}
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
              <span>{editingFlow ? 'Update Flow' : 'Save Flow'}</span>
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
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="flex items-center text-slate-400 px-2">
              <Move className="h-4 w-4" />
            </div>
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
          <div className="flex-1 relative" ref={reactFlowWrapper}>
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

          {/* Properties Panel - Right Sidebar */}
          {showPropertiesPanel && (
            <div className="w-64 border-l border-slate-200 dark:border-slate-700">
              <ServiceFlowPropertiesPanel
                selectedNode={selectedService}
                onClose={onClosePropertiesPanel}
                onUpdateNode={onUpdateNode}
                onOpenCodeEditor={onOpenCodeEditor}
              />
            </div>
          )}
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


      {/* Code Editor Modal */}
      <CodeEditorModal
        isOpen={showCodeEditor}
        onClose={onCloseCodeEditor}
        nodeData={selectedNodeForEditor}
        onSaveCode={onSaveNodeCode}
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