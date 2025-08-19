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
import { X, Workflow, Save, Play, Download, Upload, Database, Cpu, Box, Zap, Circle, Square, Diamond, ArrowRight, Hexagon, Triangle, Octagon, Maximize2, Minimize2, Move, History } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';
import ServiceFlowPropertiesPanel from '@/components/panels/ServiceFlowPropertiesPanel';
import FlowHistoryPanel from '@/components/panels/FlowHistoryPanel';
import CodeEditorModal from '@/components/modals/CodeEditorModal';
import { serviceAPI, ServiceData, nodeContentAPI, CreateNodeContentRequest } from '@/lib/api';
import { useAlertActions } from '@/hooks/useAlert';
import { useAuth } from '@/contexts/AuthContext';

interface ServiceFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  editingFlow?: any;
}

// Flowchart Shape Components
const FlowchartNode = ({ data, selected, id }: { data: any; selected?: boolean; id?: string }) => {
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

  // Shape specific styling similar to ServiceNode
  const getShapeStyle = (shape: string) => {
    const styles = {
      rectangle: {
        gradient: 'from-indigo-500 to-purple-600',
        icon: '📋',
        iconBg: 'bg-indigo-100 dark:bg-indigo-900/30',
        iconColor: 'text-indigo-700 dark:text-indigo-300',
        bgColor: 'bg-indigo-50 dark:bg-indigo-900/20'
      },
      circle: {
        gradient: 'from-green-500 to-emerald-600', 
        icon: '🔵',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        iconColor: 'text-green-700 dark:text-green-300',
        bgColor: 'bg-green-50 dark:bg-green-900/20'
      },
      diamond: {
        gradient: 'from-orange-500 to-red-600',
        icon: '💎',
        iconBg: 'bg-orange-100 dark:bg-orange-900/30',
        iconColor: 'text-orange-700 dark:text-orange-300',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20'
      },
      triangle: {
        gradient: 'from-purple-500 to-pink-600',
        icon: '📐',
        iconBg: 'bg-purple-100 dark:bg-purple-900/30',
        iconColor: 'text-purple-700 dark:text-purple-300',
        bgColor: 'bg-purple-50 dark:bg-purple-900/20'
      },
      hexagon: {
        gradient: 'from-blue-500 to-cyan-600',
        icon: '⬡',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        iconColor: 'text-blue-700 dark:text-blue-300',
        bgColor: 'bg-blue-50 dark:bg-blue-900/20'
      },
      octagon: {
        gradient: 'from-red-500 to-pink-600',
        icon: '🛑',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        iconColor: 'text-red-700 dark:text-red-300',
        bgColor: 'bg-red-50 dark:bg-red-900/20'
      }
    };
    return styles[shape as keyof typeof styles] || styles.rectangle;
  };

  const shapeStyle = getShapeStyle(data.shape);
  
  return (
    <div className="relative group">
      {/* Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        id="flowchart-input"
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-lg opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ left: -6 }}
      />

      {/* Delete Button */}
      {selected && (
        <button
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      {/* Main Node Container - Special handling for circle and diamond shapes */}
      {data.shape === 'circle' ? (
        /* Circle Shape - Compact circular design */
        <div 
          className={`
            relative w-20 h-20 ${shapeStyle.bgColor}
            rounded-full shadow-lg hover:shadow-xl transition-all duration-300
            border-2 overflow-hidden flex items-center justify-center
            ${selected ? 'border-blue-500 shadow-blue-300/50 scale-110' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}
          `}
        >
          {/* Gradient Border */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${shapeStyle.gradient} p-0.5`}>
            <div className={`w-full h-full rounded-full ${shapeStyle.bgColor} flex items-center justify-center`}>
              {/* Icon and Label in center */}
              <div className="text-center">
                <div className="text-lg mb-1">{shapeStyle.icon}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {data.label}
                </div>
              </div>
            </div>
          </div>
          
          {/* Status indicators for circle */}
          {(data.code || data.isActive) && (
            <div className="absolute -top-1 -right-1 flex items-center space-x-1">
              {data.code && (
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-md border border-white" title="Has custom code"></div>
              )}
              {data.isActive && (
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md animate-pulse border border-white" title="Active shape"></div>
              )}
            </div>
          )}
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-full"></div>
        </div>
      ) : data.shape === 'diamond' ? (
        /* Diamond Shape - Compact diamond design */
        <div 
          className={`
            relative w-20 h-20 ${shapeStyle.bgColor}
            transform rotate-45 shadow-lg hover:shadow-xl transition-all duration-300
            border-2 overflow-hidden flex items-center justify-center
            ${selected ? 'border-blue-500 shadow-blue-300/50 scale-110' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}
          `}
        >
          {/* Gradient Border */}
          <div className={`absolute inset-0 bg-gradient-to-br ${shapeStyle.gradient} p-0.5`}>
            <div className={`w-full h-full ${shapeStyle.bgColor} flex items-center justify-center`}>
              {/* Icon and Label in center - counter-rotate to keep text upright */}
              <div className="text-center transform -rotate-45">
                <div className="text-lg mb-1">{shapeStyle.icon}</div>
                <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {data.label}
                </div>
              </div>
            </div>
          </div>
          
          {/* Status indicators for diamond */}
          {(data.code || data.isActive) && (
            <div className="absolute -top-1 -right-1 flex items-center space-x-1 transform -rotate-45">
              {data.code && (
                <div className="w-3 h-3 bg-green-500 rounded-full shadow-md border border-white" title="Has custom code"></div>
              )}
              {data.isActive && (
                <div className="w-3 h-3 bg-blue-500 rounded-full shadow-md animate-pulse border border-white" title="Active shape"></div>
              )}
            </div>
          )}
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      ) : (
        /* Regular shapes - Modern Design like ServiceNode */
        <div 
          className={`
            relative min-w-[180px] ${shapeStyle.bgColor}
            rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
            border-2 overflow-hidden
            ${selected ? 'border-blue-500 shadow-blue-300/50 scale-105' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}
          `}
        >
          {/* Gradient Header */}
          <div className={`h-2 bg-gradient-to-r ${shapeStyle.gradient}`}></div>
          
          {/* Node Content */}
          <div className="p-4">
            {/* Top Row - Icon and Status */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${shapeStyle.iconBg} rounded-lg flex items-center justify-center text-lg shadow-sm`}>
                {shapeStyle.icon}
              </div>
              <div className="flex items-center space-x-1.5">
                {data.code && (
                  <div 
                    className="w-4 h-4 bg-green-500 rounded-full shadow-md border-2 border-white" 
                    title="Has custom code"
                  ></div>
                )}
                {data.isActive && (
                  <div 
                    className="w-4 h-4 bg-blue-500 rounded-full shadow-md animate-pulse border-2 border-white" 
                    title="Active shape"
                  ></div>
                )}
              </div>
            </div>
            
            {/* Shape Name */}
            <div className="mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate leading-tight">
                {data.label}
              </h3>
            </div>
            
            {/* Shape Type Badge */}
            <div className="flex items-center justify-between">
              <span className={`
                px-2.5 py-1 rounded-md text-xs font-bold
                ${shapeStyle.iconBg} ${shapeStyle.iconColor}
              `}>
                {data.shape.charAt(0).toUpperCase() + data.shape.slice(1)}
              </span>
              
              {/* Connection indicator */}
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
              </div>
            </div>
          </div>
          
          {/* Hover Effect Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
        </div>
      )}
      
      {/* Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        id="flowchart-output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-lg opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ right: -6 }}
      />
    </div>
  );
};

// Custom Service Node Component - Modern Design
const ServiceNode = ({ data, selected, id }: { data: any; selected?: boolean; id?: string }) => {
  // Service type specific styling
  const getServiceTypeStyle = (type: string) => {
    const styles = {
      'REST API': {
        gradient: 'from-blue-500 to-indigo-600',
        icon: '🌐',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700'
      },
      'GraphQL': {
        gradient: 'from-purple-500 to-pink-600',
        icon: '🔮',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-700'
      },
      'Database': {
        gradient: 'from-green-500 to-emerald-600',
        icon: '🗄️',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-700'
      },
      'Microservice': {
        gradient: 'from-orange-500 to-red-600',
        icon: '⚙️',
        iconBg: 'bg-orange-100',
        iconColor: 'text-orange-700'
      },
      'Function': {
        gradient: 'from-yellow-500 to-amber-600',
        icon: '⚡',
        iconBg: 'bg-yellow-100',
        iconColor: 'text-yellow-700'
      },
      default: {
        gradient: 'from-slate-500 to-gray-600',
        icon: '📦',
        iconBg: 'bg-slate-100',
        iconColor: 'text-slate-700'
      }
    };
    return styles[type as keyof typeof styles] || styles.default;
  };

  const serviceStyle = getServiceTypeStyle(data.type);

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
    <div className="relative group">
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="service-input"
        className="w-3 h-3 !bg-blue-500 !border-2 !border-white shadow-lg opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ left: -6 }}
      />
      
      {/* Delete Button */}
      {selected && (
        <button
          className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-all duration-200 shadow-lg hover:shadow-xl"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Main Node Container */}
      <div 
        className={`
          relative min-w-[200px] bg-orange-50 dark:bg-orange-900/20 
          rounded-xl shadow-lg hover:shadow-xl transition-all duration-300
          border-2 overflow-hidden
          ${selected ? 'border-blue-500 shadow-blue-300/50 scale-105' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'}
        `}
      >
        {/* Gradient Header */}
        <div className={`h-2 bg-gradient-to-r ${serviceStyle.gradient}`}></div>
        
        {/* Node Content */}
        <div className="p-5">
          {/* Top Row - Icon and Status */}
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 ${serviceStyle.iconBg} rounded-lg flex items-center justify-center text-xl`}>
              {serviceStyle.icon}
            </div>
            <div className="flex items-center space-x-1.5">
              {data.code && (
                <div 
                  className="w-4 h-4 bg-green-500 rounded-full shadow-md border-2 border-white" 
                  title="Has custom code"
                ></div>
              )}
              {data.isActive && (
                <div 
                  className="w-4 h-4 bg-blue-500 rounded-full shadow-md animate-pulse border-2 border-white" 
                  title="Active service"
                ></div>
              )}
            </div>
          </div>
          
          {/* Service Name */}
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate leading-tight">
              {data.label}
            </h3>
          </div>
          
          {/* Service Type Badge */}
          <div className="flex items-center justify-between">
            <span className={`
              px-3 py-1.5 rounded-md text-sm font-bold
              ${serviceStyle.iconBg} ${serviceStyle.iconColor}
            `}>
              {data.type}
            </span>
            
            {/* Connection indicator */}
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
              <div className="w-2 h-2 bg-slate-600 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Hover Effect Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
      </div>
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="service-output"
        className="w-3 h-3 !bg-green-500 !border-2 !border-white shadow-lg opacity-60 group-hover:opacity-100 transition-opacity"
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
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [serviceType, setServiceType] = useState('REST_API');

  // Service Type Options
  const serviceTypes = [
    { value: 'REST_API', label: 'REST API', description: 'HTTP REST API service' },
    { value: 'GRAPHQL', label: 'GraphQL', description: 'GraphQL API service' },
    { value: 'WEBSOCKET', label: 'WebSocket', description: 'Real-time WebSocket service' },
    { value: 'DATABASE', label: 'Database', description: 'Database operation service' },
    { value: 'MESSAGE_QUEUE', label: 'Message Queue', description: 'Message queue service' },
    { value: 'FILE_STORAGE', label: 'File Storage', description: 'File upload/download service' },
    { value: 'AUTHENTICATION', label: 'Authentication', description: 'User authentication service' },
    { value: 'NOTIFICATION', label: 'Notification', description: 'Push notification service' },
    { value: 'WORKFLOW', label: 'Workflow', description: 'Business workflow service' },
    { value: 'CUSTOM', label: 'Custom', description: 'Custom service implementation' }
  ];
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isResizing,
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    resizeHandles,
    handleMouseDown, 
    handleResizeMouseDown,
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();
  const { alert } = useAlertActions();
  const { user } = useAuth();

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onInit = (rfi: ReactFlowInstance) => {
    setReactFlowInstance(rfi);
  };

  // Handle node double click to open CodeEditorModal
  const onNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node) => {
    console.log('Double clicked node:', node);
    setSelectedNodeForEditor(node);
    setShowCodeEditor(true);
  }, []);

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

  const handleSaveFlow = async (changeDescription?: string) => {
    // Use JSON.parse(JSON.stringify()) to remove all circular references and non-serializable data
    let cleanNodes: any[], cleanEdges: any[], cleanViewport: any;
    
    try {
      // Manually clean nodes without using JSON stringify initially
      cleanNodes = nodes.map(node => {
        // Create completely new object with only primitive values
        const cleanNode = {
          id: String(node.id),
          type: String(node.type || 'default'),
          position: {
            x: Number(node.position?.x || 0),
            y: Number(node.position?.y || 0)
          },
          data: {} as any
        };
        
        // Only add data properties that are primitive values
        if (node.data) {
          if (typeof node.data.label === 'string' || typeof node.data.label === 'number') {
            cleanNode.data.label = String(node.data.label);
          }
          if (typeof node.data.type === 'string') {
            cleanNode.data.type = String(node.data.type);
          }
          if (typeof node.data.shape === 'string') {
            cleanNode.data.shape = String(node.data.shape);
          }
          if (typeof node.data.backgroundColor === 'string') {
            cleanNode.data.backgroundColor = String(node.data.backgroundColor);
          }
          if (typeof node.data.borderColor === 'string') {
            cleanNode.data.borderColor = String(node.data.borderColor);
          }
          if (typeof node.data.content === 'string') {
            cleanNode.data.content = String(node.data.content);
          }
          if (typeof node.data.code === 'string') {
            cleanNode.data.code = String(node.data.code);
          }
          if (typeof node.data.language === 'string') {
            cleanNode.data.language = String(node.data.language);
          }
          if (typeof node.data.description === 'string') {
            cleanNode.data.description = String(node.data.description);
          }
        }
        
        return cleanNode;
      });
      
      console.log('Successfully cleaned nodes');
    } catch (e) {
      console.error('Error cleaning nodes:', e);
      cleanNodes = [];
    }
    
    try {
      // Manually clean edges
      cleanEdges = edges.map(edge => ({
        id: String(edge.id),
        source: String(edge.source),
        target: String(edge.target),
        type: String(edge.type || 'default'),
        animated: Boolean(edge.animated)
      }));
      console.log('Successfully cleaned edges');
    } catch (e) {
      console.error('Error cleaning edges:', e);
      cleanEdges = [];
    }
    
    try {
      // Manually clean viewport
      if (reactFlowInstance) {
        const vp = reactFlowInstance.getViewport();
        cleanViewport = {
          x: Number(vp.x),
          y: Number(vp.y),
          zoom: Number(vp.zoom)
        };
      } else {
        cleanViewport = null;
      }
      console.log('Successfully cleaned viewport');
    } catch (e) {
      console.error('Error cleaning viewport:', e);
      cleanViewport = null;
    }

    // Create clean service data
    const serviceTypeData = serviceTypes.find(type => type.value === serviceType);
    const serviceData: ServiceData = {
      name: flowName,
      description: `${serviceTypeData?.label || 'Service'} flow v${version} with ${cleanNodes.length} nodes - ${serviceTypeData?.description || ''}`,
      isActive: isActiveFlow,
      nodes: cleanNodes,
      edges: cleanEdges,
      viewport: cleanViewport,
      version: version,
      createdBy: user?.id || 1, // Use authenticated user ID
      changeDescription: changeDescription || `Updated ${serviceTypeData?.label || 'service'} with ${cleanNodes.length} nodes`,
      serviceType: serviceType // Add service type to the data
    };

    console.log('Service data ready for saving:', serviceData);
    
    // Skip JSON test and proceed directly to save
    // The API call will handle any serialization
    
    try {
      let result;
      if (flowId) {
        // Update existing service
        result = await serviceAPI.update(parseInt(flowId), serviceData);
        console.log('Service updated successfully:', result);
        alert.apiSuccess('update', `Service "${result.name}" อัปเดตสำเร็จ`);
      } else {
        // Create new service
        result = await serviceAPI.create(serviceData);
        console.log('Service created successfully:', result);
        alert.apiSuccess('create', `Service "${result.name}" สร้างสำเร็จ`);
        setFlowId(result.id.toString()); // Set the ID for future updates
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving service:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert.apiError('save', errorMsg);
    }
  };

  const handleTestFlow = async () => {
    if (!isActiveFlow) {
      alert.warning('คำเตือน', 'กรุณาเปิดใช้งาน Flow ก่อนทดสอบ');
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
      alert.apiSuccess('execute', `Flow "${savedFlow.name}" ดำเนินการสำเร็จ`);
    } catch (error: any) {
      console.error('Error executing flow:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
      alert.apiError('execute', errorMsg);
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

  const onSaveNodeCode = useCallback(async (nodeId: string, code: string, language: string) => {
    // Update local state first
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

    // Save to backend if we have a flow ID
    if (flowId) {
      try {
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          const nodeContentData: CreateNodeContentRequest = {
            label: node.data.label || 'Untitled Node',
            description: node.data.description || '',
            content: code,
            language: language,
            nodeType: node.type || 'service',
            metadata: {
              type: node.data.type,
              shape: node.data.shape,
              backgroundColor: node.data.backgroundColor,
              borderColor: node.data.borderColor,
              position: node.position
            },
            changeDescription: 'Code updated via editor'
          };
          
          await nodeContentAPI.saveNodeContent(flowId, nodeId, nodeContentData);
          console.log('Node content saved to database');
        }
      } catch (error) {
        console.error('Failed to save node content:', error);
        // Don't show error to user as local state is already updated
      }
    }
  }, [setNodes, selectedService, flowId, nodes]);

  const handleRestoreVersion = useCallback(async (version: string, historyData: any) => {
    try {
      // Update the flow with history data
      if (historyData.configuration) {
        setFlowName(historyData.name);
        setIsActiveFlow(historyData.status === 'active');
        setVersion(historyData.version);
        
        if (historyData.configuration.nodes) {
          const restoredNodes = historyData.configuration.nodes.map((node: any) => ({
            id: node.id,
            type: node.type || 'service',
            position: node.position || { x: 100, y: 100 },
            data: {
              ...node.data,
              icon: node.data.type === 'REST API' ? Database :
                    node.data.type === 'GraphQL' ? Zap :
                    node.data.type === 'Microservice' ? Box :
                    node.data.type === 'Function' ? Cpu :
                    Box
            }
          }));
          setNodes(restoredNodes);
        }
        
        if (historyData.configuration.edges) {
          setEdges(historyData.configuration.edges);
        }
        
        // Set viewport if available
        if (historyData.configuration.viewport && reactFlowInstance) {
          setTimeout(() => {
            reactFlowInstance.setViewport(historyData.configuration.viewport);
          }, 100);
        }
      }
      
      alert.success('คืนค่าสำเร็จ', `คืนค่า Flow ไปเวอร์ชัน ${version} สำเร็จ`);
      setShowHistoryPanel(false);
    } catch (error: any) {
      console.error('Error restoring version:', error);
      alert.error('เกิดข้อผิดพลาด', 'ไม่สามารถคืนค่าเวอร์ชันได้');
    }
  }, [setNodes, setEdges, reactFlowInstance, alert]);

  const handleToggleHistoryPanel = useCallback(() => {
    if (!flowId) {
      alert.warning('คำเตือน', 'กรุณาบันทึก Flow ก่อนดูประวัติ');
      return;
    }
    setShowHistoryPanel(!showHistoryPanel);
  }, [flowId, showHistoryPanel, alert]);


  const flowchartShapes = [
    { shape: 'rectangle', name: 'Process', icon: Square, color: 'bg-slate-100 text-slate-800' },
    { shape: 'diamond', name: 'Decision', icon: Diamond, color: 'bg-orange-100 text-orange-800' },
    { shape: 'circle', name: 'Start/End', icon: Circle, color: 'bg-green-100 text-green-800' },
    { shape: 'hexagon', name: 'Preparation', icon: Hexagon, color: 'bg-blue-100 text-blue-800' },
    { shape: 'triangle', name: 'Input/Output', icon: Triangle, color: 'bg-purple-100 text-purple-800' },
    { shape: 'octagon', name: 'Stop', icon: Octagon, color: 'bg-red-100 text-red-800' },
  ];


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
          // Get appropriate icon based on service type
          const getServiceIcon = (type: string) => {
            switch (type) {
              case 'REST API': return Database;
              case 'GraphQL': return Zap;
              case 'Database': return Database;
              case 'Microservice': return Box;
              case 'Function': return Cpu;
              case 'Middleware': return Zap;
              default: return Box;
            }
          };

          newNode = {
            id: `service-${nodes.length + 1}`,
            type: 'service',
            position,
            data: {
              label: `New ${parsedData.type}`,
              type: parsedData.type,
              icon: getServiceIcon(parsedData.type)
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
    [reactFlowInstance, nodes, setNodes, flowchartShapes],
  );

  // Load existing service data when editing
  React.useEffect(() => {
    const loadServiceData = async () => {
      if (isOpen && editingFlow) {
        setFlowName(editingFlow.name || 'Untitled Service');
        setIsActiveFlow(editingFlow.isActive || false);
        setFlowId(editingFlow.id.toString());
        setVersion(editingFlow.version || '1.0.0');
        setServiceType(editingFlow.serviceType || 'REST_API');
        
        // Load nodes and edges from the service data
        if (editingFlow.nodes || editingFlow.edges) {
          
          if (editingFlow.nodes && editingFlow.nodes.length > 0) {
            const loadedNodes = editingFlow.nodes.map((node: any) => ({
              id: node.id,
              type: node.type || 'service',
              position: node.position || { x: 100, y: 100 },
              data: {
                label: node.data.label,
                type: node.data.type,
                shape: node.data.shape,
                backgroundColor: node.data.backgroundColor,
                borderColor: node.data.borderColor,
                content: node.data.content || '',
                code: node.data.code || '',
                language: node.data.language,
                description: node.data.description,
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
          
          if (editingFlow.edges && editingFlow.edges.length > 0) {
            setEdges(editingFlow.edges);
          } else {
            setEdges(initialServiceEdges);
          }
          
          // Set viewport if available
          if (editingFlow.viewport && reactFlowInstance) {
            setTimeout(() => {
              reactFlowInstance.setViewport(editingFlow.viewport);
            }, 100);
          }
        }
      } else if (isOpen && !editingFlow) {
        // Reset to default when creating new service
        setFlowName('Untitled Service');
        setIsActiveFlow(false);
        setFlowId(null);
        setVersion('1.0.0');
        setNodes(initialServiceNodes);
        setEdges(initialServiceEdges);
      }
    };

    loadServiceData();
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
        {/* Resize Handles */}
        {!isFullscreen && resizeHandles.map((handle) => (
          <div
            key={handle.direction}
            style={handle.style}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
            className="hover:bg-blue-500 hover:opacity-50 transition-colors"
          />
        ))}
        {/* Header */}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
          style={dragHandleStyle}
        >
          <div className="flex items-center space-x-4">
            <div 
              className="p-2 bg-green-100 dark:bg-green-900 rounded-lg cursor-move"
              onMouseDown={handleMouseDown}
            >
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
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Service Type:</label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    className="px-3 py-1 text-sm border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-green-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    {serviceTypes.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
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
              onClick={() => handleSaveFlow()}
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
              onClick={handleToggleHistoryPanel}
              disabled={!flowId}
              className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                flowId 
                  ? 'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20' 
                  : 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-50'
              }`}
              title={flowId ? 'ดูประวัติ Flow' : 'บันทึก Flow ก่อนเพื่อดูประวัติ'}
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div 
              className="flex items-center text-slate-400 px-2 cursor-move hover:text-slate-600 dark:hover:text-slate-300"
              onMouseDown={handleMouseDown}
              title="Drag to move modal"
            >
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
                <div className="space-y-2 mb-6">
                  {[
                    { type: 'REST API', icon: Database, color: 'text-blue-600' },
                    { type: 'GraphQL', icon: Zap, color: 'text-purple-600' },
                    { type: 'Database', icon: Database, color: 'text-green-600' },
                    { type: 'Microservice', icon: Box, color: 'text-orange-600' },
                    { type: 'Function', icon: Cpu, color: 'text-yellow-600' },
                    { type: 'Middleware', icon: Zap, color: 'text-indigo-600' },
                  ].map((service) => {
                    const IconComponent = service.icon;
                    return (
                      <div
                        key={service.type}
                        className="p-3 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-move transition-colors"
                        draggable
                        onDragStart={(event) => {
                          event.dataTransfer.setData('application/reactflow', JSON.stringify({
                            nodeType: 'service',
                            type: service.type
                          }));
                          event.dataTransfer.effectAllowed = 'move';
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <IconComponent className={`h-4 w-4 ${service.color}`} />
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
              onNodeDoubleClick={onNodeDoubleClick}
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
                flowId={flowId || undefined}
              />
            </div>
          )}

          {/* Flow History Panel - Right Sidebar */}
          {showHistoryPanel && flowId && (
            <FlowHistoryPanel
              flowId={flowId}
              currentVersion={version}
              onRestoreVersion={handleRestoreVersion}
              onClose={() => setShowHistoryPanel(false)}
            />
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