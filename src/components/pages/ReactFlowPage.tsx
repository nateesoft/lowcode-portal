import React, { useCallback, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
  EdgeTypes,
  Handle,
  Position,
  MarkerType,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft, Save, Play, Download, Upload, 
  Database, Cpu, Box, Zap,
  Menu, ChevronDown, ChevronRight, Plus, Square, Layers
} from 'lucide-react';
import NodePropertiesPanel from '@/components/panels/NodePropertiesPanel';

// Custom Node Components
interface NodeData {
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  backgroundColor?: string;
  borderColor?: string;
  isGroup?: boolean;
  width?: number;
  height?: number;
  opacity?: number;
  [key: string]: unknown;
}

const CustomNode = ({ data, selected, id }: { data: NodeData; selected?: boolean; id?: string }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  const nodeStyle = {
    backgroundColor: data.backgroundColor || '#ffffff',
    borderColor: selected ? '#3b82f6' : (data.borderColor || '#a1a1aa'),
    width: data.width || 'auto',
    height: data.height || 'auto',
    opacity: data.opacity || 1,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: data.width || 400, height: data.height || 300 });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !id) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    const newWidth = Math.max(200, startSize.width + deltaX);
    const newHeight = Math.max(150, startSize.height + deltaY);
    
    // Dispatch event to parent component
    window.dispatchEvent(new CustomEvent('updateNodeSize', { 
      detail: { 
        nodeId: id, 
        width: newWidth, 
        height: newHeight 
      } 
    }));
  }, [isResizing, startPos, startSize, id]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  // Group/Frame Node for organizing flows
  if (data.isGroup) {
    return (
      <div 
        className={`rounded-lg border-2 transition-colors relative ${
          selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-300'
        }`}
        style={{
          ...nodeStyle,
          minWidth: data.width || 400,
          minHeight: data.height || 300,
          backgroundColor: data.backgroundColor || 'rgba(248, 250, 252, 0.8)',
          borderStyle: 'dashed',
          borderWidth: '2px',
          zIndex: -1, // ให้ group node อยู่ล่างสุด
          pointerEvents: selected ? 'auto' : 'none', // ไม่รับ mouse events เมื่อไม่ได้เลือก
        }}
      >
        {/* Group Header */}
        <div 
          className="absolute -top-6 left-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-t border border-b-0 border-slate-300"
          style={{ pointerEvents: 'auto' }} // Header สามารถคลิกได้
        >
          <div className="flex items-center space-x-1">
            {data.icon && <data.icon className="h-3 w-3 text-slate-500" />}
            <span className="text-xs font-medium text-slate-600">{data.label}</span>
          </div>
        </div>
        
        {/* Group Content Area */}
        <div 
          className="h-full w-full p-4 flex items-center justify-center"
          style={{ pointerEvents: selected ? 'auto' : 'none' }}
        >
          <div className="text-center text-slate-400">
            <Layers className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm">Drop nodes here to group</div>
          </div>
        </div>

        {/* Resize Handles */}
        {selected && (
          <>
            {/* Bottom-right corner resize handle */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize z-10 nodrag"
              style={{ margin: '-1.5px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
            {/* Bottom edge resize handle */}
            <div
              className="absolute bottom-0 left-1/2 w-6 h-2 bg-blue-500 cursor-ns-resize z-10 transform -translate-x-1/2 nodrag"
              style={{ marginBottom: '-1px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
            {/* Right edge resize handle */}
            <div
              className="absolute right-0 top-1/2 w-2 h-6 bg-blue-500 cursor-ew-resize z-10 transform -translate-y-1/2 nodrag"
              style={{ marginRight: '-1px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
          </>
        )}
      </div>
    );
  }
  
  // Regular Node
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
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all"
        style={{ left: -8 }}
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
        className="w-4 h-4 !bg-green-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all"
        style={{ right: -8 }}
      />
    </div>
  );
};

// Custom Edge with + button
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: React.MouseEvent, edgeId: string) => {
    event.stopPropagation();
    // This will be handled by the parent component
    window.dispatchEvent(new CustomEvent('edgeButtonClick', { detail: { edgeId, x: labelX, y: labelY } }));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-6 h-6 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center text-xs border-2 border-white shadow-lg transition-colors"
            onClick={(event) => onEdgeClick(event, id)}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Create a wrapper component that passes the node id
const CustomNodeWrapper = (props: any) => {
  return <CustomNode {...props} id={props.id} />;
};

const nodeTypes: NodeTypes = {
  custom: CustomNodeWrapper,
};

const edgeTypes: EdgeTypes = {
  custom: CustomEdge,
};

// Initial nodes and edges
const initialNodes: Node[] = [
  {
    id: '1',
    type: 'custom',
    position: { x: 250, y: 25 },
    zIndex: 1,
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
    zIndex: 1,
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
    type: 'custom',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color: '#3b82f6',
    }
  },
];

interface ReactFlowPageProps {
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const ReactFlowPage: React.FC<ReactFlowPageProps> = ({
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const router = useRouter();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showNodeSelector, setShowNodeSelector] = useState<{show: boolean, edgeId: string, position: {x: number, y: number}} | null>(null);

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdge = {
        ...params,
        type: 'custom',
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        }
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges],
  );

  const onInit = (rfi: ReactFlowInstance) => {
    setReactFlowInstance(rfi);
    
    // Listen for edge button clicks
    const handleEdgeButtonClick = (event: any) => {
      const { edgeId, x, y } = event.detail;
      const screenPos = rfi.flowToScreenPosition({ x, y });
      setShowNodeSelector({
        show: true,
        edgeId,
        position: { x: screenPos.x, y: screenPos.y }
      });
    };

    // Listen for node size updates
    const handleUpdateNodeSize = (event: any) => {
      const { nodeId, width, height } = event.detail;
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, width, height } }
            : node
        )
      );
    };
    
    window.addEventListener('edgeButtonClick', handleEdgeButtonClick);
    window.addEventListener('updateNodeSize', handleUpdateNodeSize);
    
    return () => {
      window.removeEventListener('edgeButtonClick', handleEdgeButtonClick);
      window.removeEventListener('updateNodeSize', handleUpdateNodeSize);
    };
  };

  const onSelectionChange = useCallback(
    ({ nodes: selectedNodes, edges: selectedEdges }: { nodes: Node[]; edges: Edge[] }) => {
      if (selectedNodes.length === 1) {
        setSelectedNode(selectedNodes[0]);
        setSelectedEdge(null);
        setShowPropertiesPanel(true);
      } else if (selectedEdges.length === 1) {
        setSelectedEdge(selectedEdges[0]);
        setSelectedNode(null);
        setShowPropertiesPanel(true);
      } else {
        setSelectedNode(null);
        setSelectedEdge(null);
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

  const onUpdateEdge = useCallback(
    (edgeId: string, updates: Partial<Edge>) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? { ...edge, ...updates }
            : edge
        )
      );
      
      if (selectedEdge && selectedEdge.id === edgeId) {
        setSelectedEdge(prev => prev ? { ...prev, ...updates } : null);
      }
    },
    [setEdges, selectedEdge],
  );

  const onClosePropertiesPanel = useCallback(() => {
    setShowPropertiesPanel(false);
    setSelectedNode(null);
    setSelectedEdge(null);
    if (reactFlowInstance) {
      reactFlowInstance.setNodes((nds) => nds.map(node => ({ ...node, selected: false })));
      reactFlowInstance.setEdges((eds) => eds.map(edge => ({ ...edge, selected: false })));
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

        // Check if dropping on an edge
        const edgeAtPosition = findEdgeAtPosition(position.x, position.y);
        
        // Check if it's a group type
        const isGroupType = ['Group', 'Frame', 'Section'].includes(type);
        
        const newNode: Node = {
          id: `${Date.now()}`, // Use timestamp for unique ID
          type: 'custom',
          position,
          zIndex: isGroupType ? -100 : 1, // Group nodes ด้านล่าง, regular nodes ด้านบน
          data: {
            label: type,
            description: getNodeDescription(type),
            icon: getNodeIcon(type),
            isGroup: isGroupType,
            width: isGroupType ? 400 : undefined,
            height: isGroupType ? 300 : undefined,
            backgroundColor: isGroupType ? getGroupBackgroundColor(type) : undefined,
            opacity: isGroupType ? 0.8 : 1,
          },
        };

        if (edgeAtPosition) {
          // Insert node between connected nodes
          insertNodeOnEdge(newNode, edgeAtPosition);
        } else {
          // Add node normally
          setNodes((nds) => nds.concat(newNode));
        }
      }
    },
    [reactFlowInstance, nodes, setNodes, edges],
  );

  const getNodeDescription = (type: string) => {
    const descriptions: { [key: string]: string } = {
      'API Call': 'HTTP Request',
      'Database': 'Data Storage',
      'UI Component': 'Interface Element',
      'Logic': 'Business Logic',
      'Condition': 'If/Else Logic',
      'Loop': 'Iteration',
      'Transform': 'Data Transform',
      'Group': 'Flow Grouping',
      'Frame': 'Visual Frame',
      'Section': 'Flow Section'
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
      'Transform': Cpu,
      'Group': Layers,
      'Frame': Square,
      'Section': Square
    };
    return icons[type] || Box;
  };

  const getGroupBackgroundColor = (type: string) => {
    const colors: { [key: string]: string } = {
      'Group': 'rgba(59, 130, 246, 0.1)', // Blue
      'Frame': 'rgba(16, 185, 129, 0.1)', // Green  
      'Section': 'rgba(245, 158, 11, 0.1)' // Yellow
    };
    return colors[type] || 'rgba(248, 250, 252, 0.8)';
  };

  const nodeCategories = [
    {
      title: 'Organization',
      items: ['Group', 'Frame', 'Section']
    },
    {
      title: 'Application',
      items: ['User', 'Page', 'Service']
    },
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

  const toggleCategory = (categoryTitle: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryTitle)) {
        newSet.delete(categoryTitle);
      } else {
        newSet.add(categoryTitle);
      }
      return newSet;
    });
  };

  // Helper function to find edge at position
  const findEdgeAtPosition = (x: number, y: number) => {
    const tolerance = 20; // pixels
    
    for (const edge of edges) {
      const sourceNode = nodes.find(node => node.id === edge.source);
      const targetNode = nodes.find(node => node.id === edge.target);
      
      if (!sourceNode || !targetNode) continue;
      
      // Simple distance check for straight lines
      const sourceX = sourceNode.position.x + 100; // Approximate node center
      const sourceY = sourceNode.position.y + 25;
      const targetX = targetNode.position.x + 100;
      const targetY = targetNode.position.y + 25;
      
      // Check if point is near the line between source and target
      const distanceToLine = distancePointToLine(x, y, sourceX, sourceY, targetX, targetY);
      
      if (distanceToLine < tolerance) {
        return edge;
      }
    }
    
    return null;
  };

  // Helper function to calculate distance from point to line
  const distancePointToLine = (px: number, py: number, x1: number, y1: number, x2: number, y2: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;
    
    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) {
      param = dot / lenSq;
    }
    
    let xx, yy;
    
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    
    const dx = px - xx;
    const dy = py - yy;
    
    return Math.sqrt(dx * dx + dy * dy);
  };

  // Helper function to insert node on edge
  const insertNodeOnEdge = (newNode: Node, edge: Edge) => {
    // Add the new node
    setNodes((nds) => nds.concat(newNode));
    
    // Remove the original edge and create two new edges
    setEdges((eds) => {
      const filteredEdges = eds.filter(e => e.id !== edge.id);
      
      const newEdge1: Edge = {
        id: `${edge.source}-${newNode.id}`,
        source: edge.source,
        target: newNode.id,
        sourceHandle: edge.sourceHandle,
        targetHandle: 'input',
        type: edge.type || 'custom',
        animated: edge.animated,
        style: edge.style,
        markerEnd: edge.markerEnd
      };
      
      const newEdge2: Edge = {
        id: `${newNode.id}-${edge.target}`,
        source: newNode.id,
        target: edge.target,
        sourceHandle: 'output',
        targetHandle: edge.targetHandle,
        type: edge.type || 'custom',
        animated: edge.animated,
        style: edge.style,
        markerEnd: edge.markerEnd
      };
      
      return [...filteredEdges, newEdge1, newEdge2];
    });
  };

  // Handle node selection from edge button
  const handleNodeSelection = (nodeType: string) => {
    if (!showNodeSelector || !reactFlowInstance) return;
    
    const edge = edges.find(e => e.id === showNodeSelector.edgeId);
    if (!edge) return;
    
    // Calculate position at the middle of the edge
    const sourceNode = nodes.find(n => n.id === edge.source);
    const targetNode = nodes.find(n => n.id === edge.target);
    
    if (!sourceNode || !targetNode) return;
    
    const position = {
      x: (sourceNode.position.x + targetNode.position.x) / 2,
      y: (sourceNode.position.y + targetNode.position.y) / 2,
    };
    
    // Check if it's a group type
    const isGroupType = ['Group', 'Frame', 'Section'].includes(nodeType);
    
    const newNode: Node = {
      id: `${Date.now()}`,
      type: 'custom',
      position,
      zIndex: isGroupType ? -100 : 1, // Group nodes ด้านล่าง, regular nodes ด้านบน
      data: {
        label: nodeType,
        description: getNodeDescription(nodeType),
        icon: getNodeIcon(nodeType),
        isGroup: isGroupType,
        width: isGroupType ? 400 : undefined,
        height: isGroupType ? 300 : undefined,
        backgroundColor: isGroupType ? getGroupBackgroundColor(nodeType) : undefined,
        opacity: isGroupType ? 0.8 : 1,
      },
    };
    
    insertNodeOnEdge(newNode, edge);
    setShowNodeSelector(null);
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
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          <div className="space-y-2">
            {nodeCategories.map((category) => {
              const isCollapsed = collapsedCategories.has(category.title);
              return (
                <div key={category.title} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                  <button
                    onClick={() => toggleCategory(category.title)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors rounded-t-lg"
                  >
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                      {category.title}
                    </h4>
                    {isCollapsed ? (
                      <ChevronRight className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    )}
                  </button>
                  
                  {!isCollapsed && (
                    <div className="p-3 pt-0 space-y-2">
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
                  )}
                </div>
              );
            })}
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
            edgeTypes={edgeTypes}
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
              selectedEdge={selectedEdge}
              onClose={onClosePropertiesPanel}
              onUpdateNode={onUpdateNode}
              onUpdateEdge={onUpdateEdge}
            />
          </div>
        </>
      )}

      {/* Node Selector Modal */}
      {showNodeSelector && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-50"
            onClick={() => setShowNodeSelector(null)}
          />
          
          {/* Node Selector Popup */}
          <div 
            className="fixed z-50 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-3 min-w-48"
            style={{
              left: showNodeSelector.position.x - 96, // Center the popup
              top: showNodeSelector.position.y - 60, // Position above the button
            }}
          >
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">
              Select Node Type
            </div>
            <div className="space-y-1">
              {nodeCategories.flatMap(category => category.items).map((nodeType) => (
                <button
                  key={nodeType}
                  onClick={() => handleNodeSelection(nodeType)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {nodeType}
                </button>
              ))}
            </div>
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