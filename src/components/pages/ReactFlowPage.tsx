import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Database, Cpu, Box, Zap, Globe,
  Menu, ChevronDown, ChevronRight, Plus, Square, Layers, X, GitBranch
} from 'lucide-react';
import WeUIModal from '@/components/modals/WeUIModal';
import ServiceFlowModal from '@/components/modals/ServiceFlowModal';
import CodeEditorModal from '@/components/modals/CodeEditorModal';
import NodePropertiesPanel from '@/components/panels/NodePropertiesPanel';
import FlowVersionPanel from '@/components/panels/FlowVersionPanel';
import { 
  CollaborativeUsersPanel, 
  CollaborativeCursors, 
  CollaborativeNodeIndicator 
} from '@/components/collaboration';
import { flowAPI, myProjectAPI, FlowData, FlowVersion } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';

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


  // Get execution state from window object (global state)
  const isExecuting = (window as any).__reactFlowExecutingNodeId === id;

  // Handle delete node
  const handleDeleteNode = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (id) {
      // Dispatch event to parent component to delete this node
      window.dispatchEvent(new CustomEvent('deleteNode', { 
        detail: { nodeId: id } 
      }));
    }
  }, [id]);

  const nodeStyle = {
    backgroundColor: isExecuting ? '#fef3c7' : (data.backgroundColor || '#ffffff'),
    borderColor: isExecuting ? '#f59e0b' : (selected ? '#3b82f6' : (data.borderColor || '#a1a1aa')),
    width: data.width || 'auto',
    height: data.height || 'auto',
    opacity: data.opacity || 1,
    boxShadow: isExecuting ? '0 0 20px rgba(245, 158, 11, 0.5)' : undefined,
    animation: isExecuting ? 'pulse 1s infinite' : undefined,
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
        className={`rounded-lg border-2 transition-colors relative z-0 ${
          selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-300'
        }`}
        style={{
          ...nodeStyle,
          minWidth: data.width || 400,
          minHeight: data.height || 300,
          backgroundColor: selected 
            ? (data.backgroundColor || 'rgba(248, 250, 252, 0.8)')
            : 'rgba(248, 250, 252, 0.1)', // โปร่งใสมากเมื่อไม่ได้เลือก
          borderStyle: 'dashed',
          borderWidth: '2px',
          pointerEvents: 'auto', // รับ mouse events ปกติ
        }}
      >
        {/* Group Header */}
        <div 
          className="absolute -top-6 left-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-t border border-b-0 border-slate-300"
          style={{ pointerEvents: 'auto' }} // Header สามารถคลิกได้
        >
          <div className="flex items-center space-x-1">
            {(() => {
              try {
                const IconComponent = data.icon;
                if (IconComponent && typeof IconComponent === 'function') {
                  return <IconComponent className="h-3 w-3 text-slate-500" />;
                }
                return null;
              } catch (error) {
                return <Box className="h-3 w-3 text-slate-500" />;
              }
            })()}
            <span className="text-xs font-medium text-slate-600">{data.label}</span>
          </div>
        </div>
        
        {/* Group Content Area - แสดงเฉพาะเมื่อ group ถูกเลือกหรือว่างเปล่า */}
        {selected && (
          <div 
            className="h-full w-full p-4 flex items-center justify-center"
            style={{ pointerEvents: 'none' }} // ไม่รับ mouse events เพื่อไม่บล็อกการคลิก node ข้างใน
          >
            <div 
              className="text-center text-slate-400" 
              style={{ pointerEvents: 'none' }}
            >
              <Layers className="h-8 w-8 mx-auto mb-2" />
              <div className="text-sm">Drop nodes here to group</div>
            </div>
          </div>
        )}

        {/* Resize Handles and Delete Button */}
        {selected && (
          <>
            {/* Delete Button */}
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
              style={{ pointerEvents: 'auto' }}
              onClick={handleDeleteNode}
              title="Delete Node"
            >
              <X className="h-3 w-3" />
            </button>
            
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
        
        {/* Collaborative Node Indicator for Group */}
        {id && <CollaborativeNodeIndicator nodeId={id} />}
      </div>
    );
  }
  
  // Regular Node
  return (
    <div 
      className={`px-4 py-2 shadow-lg rounded-lg border-2 transition-all duration-300 relative z-10 ${
        isExecuting ? 'animate-pulse border-amber-500 shadow-amber-200' : 
        selected ? 'border-blue-500 shadow-blue-200' : ''
      }`}
      style={nodeStyle}
    >
      {/* Delete Button - for regular nodes */}
      {selected && !isExecuting && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}

      {/* Execution indicator */}
      {isExecuting && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full animate-ping">
          <div className="absolute inset-0 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
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
        {(() => {
          try {
            const IconComponent = data.icon;
            if (IconComponent && typeof IconComponent === 'function') {
              return <IconComponent className={`h-4 w-4 mr-2 ${isExecuting ? 'text-amber-600' : 'text-blue-600'}`} />;
            }
            return null;
          } catch (error) {
            console.warn('Error rendering icon:', error);
            return <Box className={`h-4 w-4 mr-2 ${isExecuting ? 'text-amber-600' : 'text-blue-600'}`} />;
          }
        })()}
        <div className="ml-2">
          <div className={`text-lg font-bold ${isExecuting ? 'text-amber-900' : 'text-slate-900'}`}>
            {data.label}
            {isExecuting && <span className="ml-2 text-xs">⚡ กำลังทำงาน...</span>}
          </div>
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
      
      {/* Collaborative Node Indicator */}
      {id && <CollaborativeNodeIndicator nodeId={id} />}
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

// Create a wrapper component that passes the node id and execution state
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
      label: 'API Call2',
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
      label: 'UI Component2',
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

// Utility functions
const getNodeIcon = (type: string) => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    'API Call': Database,
    'Database': Database,
    'UI Component': Box,
    'Logic': Cpu,
    'Action': Zap,
    'Web': Globe,
    'Condition': Database,
    'Loop': Database,
    'Transform': Database,
    'Group': Square,
    'Frame': Square,
    'Section': Square
  };
  return icons[type] || Box;
};

const ReactFlowPage: React.FC<ReactFlowPageProps> = ({
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const { showAlert, showSuccess, showError } = useAlert();
  
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Project and Flow states
  const [currentProject, setCurrentProject] = useState<any>(null);
  const [currentFlow, setCurrentFlow] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());
  const [showNodeSelector, setShowNodeSelector] = useState<{show: boolean, edgeId: string, position: {x: number, y: number}} | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');
  
  // Modal states
  const [showWeUIModal, setShowWeUIModal] = useState(false);
  const [showServiceFlowModal, setShowServiceFlowModal] = useState(false);
  const [showCodeEditorModal, setShowCodeEditorModal] = useState(false);
  const [doubleClickedNode, setDoubleClickedNode] = useState<Node | null>(null);
  
  // Version control state
  const [showVersionPanel, setShowVersionPanel] = useState(false);

  // Load project and flow data when projectId is available
  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return;
      
      try {
        // Load project data
        const project = await myProjectAPI.getById(parseInt(projectId));
        setCurrentProject(project);
        
        // Try to load existing flow for this project
        try {
          const flows = await flowAPI.getAll();
          const projectFlow = flows.find(f => f.name === project.name || f.description?.includes(project.name));
          
          if (projectFlow) {
            setCurrentFlow(projectFlow);
            // Load flow configuration to nodes and edges
            if (projectFlow.configuration && projectFlow.configuration.nodes) {
              // Process nodes to restore icon components
              const processedNodes = projectFlow.configuration.nodes.map(node => ({
                ...node,
                data: {
                  ...node.data,
                  icon: node.data.icon ? getNodeIcon(node.data.label || '') : undefined
                }
              }));
              setNodes(processedNodes || []);
              setEdges(projectFlow.configuration.edges || []);
            }
          }
        } catch (flowError) {
          console.log('No existing flow found for project:', projectId);
        }
        
      } catch (error) {
        console.error('Error loading project:', error);
      }
    };

    loadProjectData();
  }, [projectId, setNodes, setEdges]);

  // Update global execution state for visual feedback
  React.useEffect(() => {
    (window as any).__reactFlowExecutingNodeId = executingNodeId;
    // Force re-render of all nodes
    if (reactFlowInstance) {
      reactFlowInstance.setNodes(nds => [...nds]);
    }
  }, [executingNodeId, reactFlowInstance]);

  // Update global nodes state for group node checking
  React.useEffect(() => {
    (window as any).__reactFlowNodes = nodes;
  }, [nodes]);

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

  // Save flow function
  const handleSave = async () => {
    if (!projectId || !currentProject || !reactFlowInstance) {
      showError('Cannot save: Project information is missing');
      return;
    }

    setIsSaving(true);
    try {
      const flowData: FlowData = {
        name: currentProject.name + ' Flow',
        description: `WorkFlow for ${currentProject.name}`,
        isActive: true,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: node.data
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
        viewport: reactFlowInstance.getViewport(),
        version: '1.0.0'
      };

      if (currentFlow) {
        // Update existing flow
        await flowAPI.update(currentFlow.id, flowData);
        console.log('Flow updated successfully');
      } else {
        // Create new flow
        const newFlow = await flowAPI.create(flowData);
        setCurrentFlow(newFlow);
        console.log('Flow created successfully');
      }

      showSuccess('Flow saved successfully!');
    } catch (error: any) {
      console.error('Error saving flow:', error);
      showError('Failed to save flow: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle loading a version
  const handleLoadVersion = useCallback((version: FlowVersion) => {
    if (version.nodes && version.edges) {
      // Update the flow with version data
      const versionNodes = version.nodes.map(node => ({
        ...node,
        position: node.position || { x: 0, y: 0 }
      }));
      const versionEdges = version.edges.map(edge => ({
        ...edge,
        animated: edge.animated || false
      }));
      
      setNodes(versionNodes);
      setEdges(versionEdges);
      
      // Close the version panel
      setShowVersionPanel(false);
      
      showSuccess(`Loaded version ${version.version} successfully`);
    }
  }, [setNodes, setEdges, showSuccess]);

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

    // Listen for node deletion
    const handleDeleteNode = (event: any) => {
      const { nodeId } = event.detail;
      
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      
      // Remove all edges connected to this node
      setEdges((eds) => eds.filter((edge) => 
        edge.source !== nodeId && edge.target !== nodeId
      ));

      // Clear selection if this node was selected
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
        setShowPropertiesPanel(false);
      }
    };
    
    window.addEventListener('edgeButtonClick', handleEdgeButtonClick);
    window.addEventListener('updateNodeSize', handleUpdateNodeSize);
    window.addEventListener('deleteNode', handleDeleteNode);
    
    return () => {
      window.removeEventListener('edgeButtonClick', handleEdgeButtonClick);
      window.removeEventListener('updateNodeSize', handleUpdateNodeSize);
      window.removeEventListener('deleteNode', handleDeleteNode);
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

  const onNodeDoubleClick = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setDoubleClickedNode(node);
      
      // Debug log to check node data
      console.log('Double clicked node(master):', node);
      console.log('Double clicked node:', node.data);
      
      // Open appropriate modal based on node type
      const nodeType = node.data.type;
      if (nodeType && nodeType.endsWith('_PAGE')) {
        console.log('Opening WeUI Modal for:', nodeType);
        setShowWeUIModal(true);
      } else if (nodeType === 'API_CALL') {
        console.log('Opening Service Flow Modal for:', nodeType);
        setShowServiceFlowModal(true);
      } else {
        console.log('Opening Code Editor Modal for:', nodeType);
        setShowCodeEditorModal(true);
      }
    },
    [],
  );

  const handleSaveCode = useCallback(
    (nodeId: string, code: string, language: string) => {
      // Update the node data with the saved code
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                code: code,
                language: language,
                lastModified: new Date().toISOString(),
              },
            };
          }
          return node;
        })
      );
      
      // Update the doubleClickedNode state as well
      setDoubleClickedNode(prev => 
        prev?.id === nodeId 
          ? {
              ...prev,
              data: {
                ...prev.data,
                code: code,
                language: language,
                lastModified: new Date().toISOString(),
              },
            }
          : prev
      );
      
      // Show success message
      showSuccess(`บันทึกโค้ดสำหรับ node ${nodeId} เรียบร้อยแล้ว`);
      
      console.log(`Code saved for node ${nodeId}:`, { code, language });
    },
    [setNodes, showSuccess],
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
        
        // Find the actual node type from nodeCategories
        const nodeType = nodeCategories
          .flatMap(category => category.items)
          .find(item => item.id === type)?.type || type;
        
        const newNode: Node = {
          id: `${Date.now()}`, // Use timestamp for unique ID
          type: 'custom',
          position,
          zIndex: isGroupType ? -100 : 1, // Group nodes ด้านล่าง, regular nodes ด้านบน
          data: {
            label: type,
            type: nodeType, // Add the actual node type
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
      title: 'Panel',
      items: [
        { id: 'Panel Box', type: 'PANEL_BOX' }
      ]
    },
    {
      title: 'Actors',
      items: [
        { id: 'User', type: 'ACTOR_USER'}, 
        { id: 'System', type: 'ACTOR_SYSTEM'}
      ]
    },
    {
      title: 'Application',
      items: [
        { id: 'Single Page', type: 'SINGLE_PAGE'}, 
        { id: 'Multiple Page', type: 'MULTIPLE_PAGE'}
      ]
    },
    {
      title: 'Services',
      items: [
        { id: 'API Call', type: 'API_CALL'}, 
        { id: 'External Link', type: 'EXTERNAL_LINK'}
      ]
    },
    {
      title: 'Logic',
      items: [
        { id: 'Condition', type: 'LOGIC_CONDITION'}, 
        { id: 'Loop', type: 'LOGIC_LOOP'}
      ]
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

  // Flow Execution Engine
  const executeFlow = async () => {
    if (isExecuting) return;
    
    setIsExecuting(true);
    const executionResults: any[] = [];
    const executionSteps: any[] = [];
    
    try {
      // Find starting nodes (nodes without incoming edges)
      const startingNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id) && !node.data.isGroup
      );

      if (startingNodes.length === 0) {
        showError('ไม่พบ starting node สำหรับเริ่มต้น flow');
        setIsExecuting(false);
        return;
      }

      // Build execution graph
      const executionGraph = buildExecutionGraph();
      
      // Execute nodes in order with visual feedback
      for (const startNode of startingNodes) {
        await executeNodeChain(startNode, executionGraph, executionResults, executionSteps);
      }

      // Generate preview HTML
      const previewHTML = generatePreviewHTML(executionResults, executionSteps);
      
      // Open in new tab with safer method
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(previewHTML);
        newWindow.document.close();
      }

    } catch (error) {
      console.error('Flow execution error:', error);
      showError('เกิดข้อผิดพลาดในการรัน flow: ' + error);
    } finally {
      setIsExecuting(false);
      setExecutingNodeId(null);
    }
  };

  const buildExecutionGraph = () => {
    const graph: { [nodeId: string]: string[] } = {};
    
    // Build adjacency list
    nodes.forEach(node => {
      if (!node.data.isGroup) {
        graph[node.id] = [];
      }
    });
    
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
    });
    
    return graph;
  };

  const executeNodeChain = async (node: Node, graph: { [nodeId: string]: string[] }, results: any[], steps: any[]) => {
    // Skip group nodes
    if (node.data.isGroup) return;
    
    // Set visual feedback for current executing node
    setExecutingNodeId(node.id);
    
    // Add delay for visual effect
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Execute current node
    const nodeResult = await executeNode(node);
    results.push(nodeResult);
    steps.push({
      nodeId: node.id,
      nodeName: node.data.label,
      result: nodeResult,
      timestamp: new Date().toISOString()
    });

    // Execute connected nodes
    const connectedNodes = graph[node.id] || [];
    for (const connectedNodeId of connectedNodes) {
      const connectedNode = nodes.find(n => n.id === connectedNodeId);
      if (connectedNode && !connectedNode.data.isGroup) {
        await executeNodeChain(connectedNode, graph, results, steps);
      }
    }
  };

  const executeNode = async (node: Node): Promise<any> => {
    // Simulate node execution based on type with more realistic scenarios
    const nodeType = node.data.label;
    const executionTime = Math.random() * 800 + 200; // Random execution time
    
    // Simulate potential failures for realism
    const shouldSucceed = Math.random() > 0.1; // 90% success rate
    
    switch (nodeType) {
      case 'API Call':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        return {
          type: 'api_call',
          status: shouldSucceed ? 'success' : 'error',
          data: shouldSucceed 
            ? { 
                url: node.data.url || 'https://api.example.com/data',
                method: node.data.method || 'GET',
                response: { id: Math.floor(Math.random() * 1000), name: 'Sample Data', timestamp: new Date().toISOString() },
                statusCode: 200
              }
            : { error: 'Network timeout', statusCode: 504 },
          executionTime
        };
        
      case 'Database':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        return {
          type: 'database',
          status: shouldSucceed ? 'success' : 'error',
          data: shouldSucceed 
            ? { 
                query: 'SELECT * FROM users WHERE active = true',
                rows: Math.floor(Math.random() * 50) + 1,
                executionTime: `${Math.round(executionTime)}ms`,
                affected: Math.floor(Math.random() * 10)
              }
            : { error: 'Connection refused', sqlState: '08001' },
          executionTime
        };
        
      case 'UI Component':
      case 'Button':
      case 'Form':
      case 'Chart':
      case 'Table':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        return {
          type: 'ui_component',
          status: 'rendered',
          data: { 
            component: nodeType,
            props: { 
              title: `Generated ${nodeType}`,
              componentType: node.data.componentType || nodeType,
              textContent: node.data.textContent || `Default ${nodeType} content`,
              style: {
                backgroundColor: node.data.backgroundColor,
                borderColor: node.data.borderColor
              }
            },
            renderTime: `${Math.round(executionTime)}ms`
          },
          executionTime
        };
        
      case 'Logic':
      case 'Condition':
      case 'Function':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        const conditionResult = Math.random() > 0.5;
        return {
          type: 'logic',
          status: 'executed',
          data: { 
            condition: conditionResult ? 'true' : 'false',
            result: conditionResult ? 'condition passed' : 'condition failed',
            variables: { x: Math.random() * 100, y: Math.random() * 100 },
            nextPath: conditionResult ? 'true_branch' : 'false_branch'
          },
          executionTime
        };
        
      case 'Transform':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        return {
          type: 'transform',
          status: 'completed',
          data: { 
            input: { raw: 'input data', format: 'json' },
            output: { transformed: 'processed data', format: 'xml', records: Math.floor(Math.random() * 100) },
            transformationType: 'json_to_xml',
            processingRules: ['validation', 'mapping', 'enrichment']
          },
          executionTime
        };

      case 'Loop':
        await new Promise(resolve => setTimeout(resolve, executionTime));
        const iterations = Math.floor(Math.random() * 10) + 1;
        return {
          type: 'loop',
          status: 'completed',
          data: {
            iterations: iterations,
            loopType: 'for_each',
            processedItems: Array.from({length: iterations}, (_, i) => `item_${i + 1}`),
            totalProcessingTime: `${Math.round(executionTime * iterations)}ms`
          },
          executionTime: executionTime * iterations
        };
        
      default:
        await new Promise(resolve => setTimeout(resolve, executionTime));
        return {
          type: 'generic',
          status: shouldSucceed ? 'executed' : 'error',
          data: shouldSucceed 
            ? { 
                message: `${nodeType} executed successfully`,
                nodeId: node.id,
                parameters: node.data,
                output: `Result from ${nodeType}`
              }
            : { error: `Failed to execute ${nodeType}`, code: 'EXEC_ERROR' },
          executionTime
        };
    }
  };

  const generatePreviewHTML = (results: any[], steps: any[]): string => {
    const totalExecutionTime = steps.reduce((total, step) => total + step.result.executionTime, 0);
    const successfulSteps = results.filter(r => r.status === 'success' || r.status === 'executed' || r.status === 'rendered' || r.status === 'completed').length;
    const errorSteps = results.filter(r => r.status === 'error').length;
    
    return `
    <!DOCTYPE html>
    <html lang="th">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Flow Execution Results - TON Low-Code Platform</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            .execution-step {
                animation: fadeInUp 0.5s ease-out forwards;
                opacity: 0;
                transform: translateY(20px);
            }
            .execution-step:nth-child(1) { animation-delay: 0.1s; }
            .execution-step:nth-child(2) { animation-delay: 0.2s; }
            .execution-step:nth-child(3) { animation-delay: 0.3s; }
            .execution-step:nth-child(4) { animation-delay: 0.4s; }
            .execution-step:nth-child(5) { animation-delay: 0.5s; }
            
            @keyframes fadeInUp {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .status-success { @apply bg-green-100 text-green-800 border-green-200; }
            .status-executed { @apply bg-blue-100 text-blue-800 border-blue-200; }
            .status-rendered { @apply bg-purple-100 text-purple-800 border-purple-200; }
            .status-completed { @apply bg-indigo-100 text-indigo-800 border-indigo-200; }
            .status-error { @apply bg-red-100 text-red-800 border-red-200; }
            
            .step-success { border-left: 4px solid #10B981; }
            .step-error { border-left: 4px solid #EF4444; }
            .step-warning { border-left: 4px solid #F59E0B; }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div class="container mx-auto px-4 py-8">
            <!-- Header -->
            <div class="bg-white rounded-lg shadow-lg p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <h1 class="text-3xl font-bold text-gray-900 mb-2">🚀 Flow Execution Results</h1>
                        <p class="text-gray-600">Flow completed with ${steps.length} steps</p>
                    </div>
                    <div class="text-right">
                        <div class="text-2xl font-bold ${errorSteps > 0 ? 'text-amber-600' : 'text-green-600'}">
                            ${errorSteps > 0 ? '⚠️' : '✅'}
                        </div>
                        <div class="text-sm text-gray-600">${errorSteps > 0 ? 'With Errors' : 'Success'}</div>
                    </div>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="bg-blue-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-blue-600">${steps.length}</div>
                        <div class="text-sm text-blue-800">Total Steps</div>
                    </div>
                    <div class="bg-green-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-green-600">${successfulSteps}</div>
                        <div class="text-sm text-green-800">Successful</div>
                    </div>
                    ${errorSteps > 0 ? `
                    <div class="bg-red-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-red-600">${errorSteps}</div>
                        <div class="text-sm text-red-800">Failed</div>
                    </div>
                    ` : ''}
                    <div class="bg-purple-50 p-4 rounded-lg">
                        <div class="text-2xl font-bold text-purple-600">${Math.round(totalExecutionTime)}ms</div>
                        <div class="text-sm text-purple-800">Total Time</div>
                    </div>
                </div>
            </div>

            <!-- Execution Steps -->
            <div class="space-y-4">
                ${steps.map((step, index) => {
                  const isError = step.result.status === 'error';
                  const stepClass = isError ? 'step-error' : 'step-success';
                  const iconColor = isError ? 'bg-red-500' : 'bg-blue-500';
                  const icon = isError ? '❌' : '✅';
                  
                  return `
                    <div class="execution-step bg-white rounded-lg shadow-lg p-6 ${stepClass}">
                        <div class="flex items-center justify-between mb-4">
                            <div class="flex items-center space-x-3">
                                <div class="w-8 h-8 ${iconColor} text-white rounded-full flex items-center justify-center font-bold">
                                    ${index + 1}
                                </div>
                                <div>
                                    <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                                        ${step.nodeName}
                                        <span class="ml-2">${icon}</span>
                                    </h3>
                                    <p class="text-sm text-gray-500">Node ID: ${step.nodeId} | Type: ${step.result.type}</p>
                                </div>
                            </div>
                            <div class="flex items-center space-x-2">
                                <span class="px-3 py-1 rounded-full text-xs font-medium border status-${step.result.status}">
                                    ${step.result.status.toUpperCase()}
                                </span>
                                <span class="text-xs text-gray-500">${Math.round(step.result.executionTime)}ms</span>
                            </div>
                        </div>
                        
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h4 class="font-medium text-gray-900 mb-2">
                                ${isError ? '❌ Error Details:' : '📊 Execution Result:'}
                            </h4>
                            <pre class="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">${JSON.stringify(step.result.data, null, 2)}</pre>
                        </div>
                        
                        <div class="mt-3 flex justify-between items-center text-xs text-gray-500">
                            <span>Executed at: ${new Date(step.timestamp).toLocaleString('th-TH')}</span>
                            <span>Duration: ${Math.round(step.result.executionTime)}ms</span>
                        </div>
                    </div>
                  `;
                }).join('')}
            </div>

            <!-- Flow Visualization -->
            <div class="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 class="text-xl font-bold text-gray-900 mb-4">🔄 Flow Execution Path</h2>
                <div class="flex flex-wrap items-center gap-2">
                    ${steps.map((step, index) => {
                      const isError = step.result.status === 'error';
                      const bgColor = isError ? 'bg-red-100 text-red-800 border-red-200' : 'bg-blue-100 text-blue-800 border-blue-200';
                      const icon = isError ? '❌' : '✅';
                      
                      return `
                        <div class="flex items-center">
                            <div class="px-3 py-2 ${bgColor} border rounded-lg text-sm font-medium flex items-center">
                                <span class="mr-1">${icon}</span>
                                ${step.nodeName}
                            </div>
                            ${index < steps.length - 1 ? '<div class="text-gray-400 mx-2">→</div>' : ''}
                        </div>
                      `;
                    }).join('')}
                </div>
                
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 class="font-medium text-gray-900 mb-2">📈 Execution Summary</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <strong>Average Execution Time:</strong> ${Math.round(totalExecutionTime / steps.length)}ms per step
                        </div>
                        <div>
                            <strong>Success Rate:</strong> ${Math.round((successfulSteps / steps.length) * 100)}%
                        </div>
                        <div>
                            <strong>Total Processing Time:</strong> ${Math.round(totalExecutionTime)}ms
                        </div>
                        <div>
                            <strong>Generated at:</strong> ${new Date().toLocaleString('th-TH')}
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="mt-8 text-center text-gray-500 text-sm">
                <p>Generated by TON Low-Code Platform Flow Execution Engine</p>
                <p class="mt-1">🚀 Powered by ReactFlow & Next.js</p>
            </div>
        </div>
    </body>
    </html>
    `;
  };

  // Template Definitions
  const websiteTemplates = {
    modern: {
      name: 'Modern',
      description: 'Clean and modern design with gradients',
      preview: '🎨',
      primaryColor: '#6366f1',
      backgroundColor: '#f8fafc',
      headerStyle: 'gradient',
      fontFamily: 'Inter, sans-serif'
    },
    classic: {
      name: 'Classic',
      description: 'Traditional corporate design',
      preview: '🏢',
      primaryColor: '#1f2937',
      backgroundColor: '#ffffff',
      headerStyle: 'solid',
      fontFamily: 'Georgia, serif'
    },
    creative: {
      name: 'Creative',
      description: 'Colorful and playful design',
      preview: '🌈',
      primaryColor: '#ec4899',
      backgroundColor: '#fef7ff',
      headerStyle: 'artistic',
      fontFamily: 'Poppins, sans-serif'
    },
    minimal: {
      name: 'Minimal',
      description: 'Simple and clean layout',
      preview: '⭕',
      primaryColor: '#64748b',
      backgroundColor: '#fafafa',
      headerStyle: 'minimal',
      fontFamily: 'system-ui, sans-serif'
    },
    dark: {
      name: 'Dark Mode',
      description: 'Dark theme with neon accents',
      preview: '🌙',
      primaryColor: '#00d9ff',
      backgroundColor: '#0f172a',
      headerStyle: 'dark',
      fontFamily: 'JetBrains Mono, monospace'
    }
  };

  // Open template selector
  const openTemplateSelector = () => {
    // Check if there are nodes first
    const nonGroupNodes = nodes.filter(node => !node.data.isGroup);
    if (nonGroupNodes.length === 0) {
      showError('กรุณาเพิ่มโหนดในแคนวาสก่อนสร้างเว็บไซต์');
      return;
    }
    
    setShowTemplateSelector(true);
  };

  // Website Generation Engine
  const generateWebsite = async (templateId: string) => {
    if (isGeneratingWebsite) return;
    
    setIsGeneratingWebsite(true);
    setShowTemplateSelector(false);
    
    try {
      // Validate template ID
      if (!templateId || !websiteTemplates[templateId as keyof typeof websiteTemplates]) {
        console.warn('Invalid template ID, using default:', templateId);
      }

      // Find starting node (node without incoming edges)
      const startingNodes = nodes.filter(node => 
        !edges.some(edge => edge.target === node.id) && !node.data.isGroup
      );

      if (startingNodes.length === 0) {
        showError('ไม่พบ starting node สำหรับสร้างเว็บไซต์');
        setIsGeneratingWebsite(false);
        return;
      }

      // Get selected template with fallback
      const template = websiteTemplates[templateId as keyof typeof websiteTemplates] || websiteTemplates.modern;

      if (!template) {
        throw new Error('ไม่สามารถโหลด template ได้');
      }

      // Build website structure
      const websiteStructure = buildWebsiteStructure();
      
      // Generate all pages with template
      const websitePages = generateWebsitePages(websiteStructure, template);
      
      // Create main index page
      const indexPageHTML = generateIndexPage(websitePages, startingNodes[0]);
      
      // Open website in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        // Store website data in the opener window for navigation
        (window as any).__websitePages = websitePages;
        (window as any).__websiteStructure = websiteStructure;
        
        newWindow.document.open();
        newWindow.document.write(indexPageHTML);
        newWindow.document.close();
        
        // Also store in the new window
        (newWindow as any).__websitePages = websitePages;
        (newWindow as any).__websiteStructure = websiteStructure;
      }

    } catch (error) {
      console.error('Website generation error:', error);
      showError('เกิดข้อผิดพลาดในการสร้างเว็บไซต์: ' + error);
    } finally {
      setIsGeneratingWebsite(false);
    }
  };

  const buildWebsiteStructure = () => {
    const structure: { [nodeId: string]: { node: Node; connections: string[] } } = {};
    
    // Build page structure
    nodes.forEach(node => {
      if (!node.data.isGroup) {
        structure[node.id] = {
          node,
          connections: edges
            .filter(edge => edge.source === node.id)
            .map(edge => edge.target)
        };
      }
    });
    
    return structure;
  };

  const generateWebsitePages = (structure: { [nodeId: string]: { node: Node; connections: string[] } }, template: any) => {
    const pages: { [nodeId: string]: string } = {};
    
    // Use default template if not provided
    const safeTemplate = template || websiteTemplates.modern;
    
    Object.entries(structure).forEach(([nodeId, { node, connections }]) => {
      try {
        pages[nodeId] = generateNodePage(node, connections, structure, safeTemplate);
      } catch (error) {
        console.error(`Error generating page for node ${nodeId}:`, error);
        // Generate a simple fallback page
        pages[nodeId] = generateFallbackPage(node, connections, structure);
      }
    });
    
    return pages;
  };

  const generateFallbackPage = (node: Node, connections: string[], structure: { [nodeId: string]: { node: Node; connections: string[] } }): string => {
    const navigationButtons = connections.map(connectedNodeId => {
      const connectedNode = structure[connectedNodeId]?.node;
      if (!connectedNode) return '';
      
      return `
        <button 
          onclick="navigateToPage('${connectedNodeId}')" 
          class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors mr-4 mb-4"
        >
          ไปยัง ${connectedNode.data.label}
        </button>
      `;
    }).join('');

    return `
      <!DOCTYPE html>
      <html lang="th">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${node.data.label} - Simple Page</title>
          <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="min-h-screen bg-gray-50">
          <div class="container mx-auto px-6 py-12">
              <div class="bg-white rounded-lg shadow-lg p-8">
                  <h1 class="text-3xl font-bold mb-6">${node.data.label}</h1>
                  <p class="text-lg mb-8">Welcome to ${node.data.label} page</p>
                  ${navigationButtons ? `
                      <div class="mt-8">
                          <h3 class="text-xl font-semibold mb-4">Navigation</h3>
                          <div class="flex flex-wrap">
                              ${navigationButtons}
                          </div>
                      </div>
                  ` : ''}
              </div>
          </div>
          <script>
              window.__currentNodeId = '${node.id}';
              function navigateToPage(targetNodeId) {
                  alert('กำลังนำทางไปยัง ' + targetNodeId);
              }
          </script>
      </body>
      </html>
    `;
  };

  const generateNodePage = (node: Node, connections: string[], structure: { [nodeId: string]: { node: Node; connections: string[] } }, template: any): string => {
    // Set default template if not provided
    const defaultTemplate = websiteTemplates.modern;
    const safeTemplate = template || defaultTemplate;
    
    // Debug logging
    if (!template) {
      console.warn('Template not provided for node:', node.id, 'using default template');
    }
    
    if (!safeTemplate || !safeTemplate.backgroundColor) {
      console.error('Safe template is invalid:', safeTemplate);
      throw new Error('Template configuration is invalid');
    }
    
    const nodeType = node.data.label;
    const backgroundColor = node.data.backgroundColor || safeTemplate.backgroundColor || '#ffffff';
    const textContent = node.data.textContent || `Welcome to ${node.data.label} Page`;
    const primaryColor = safeTemplate.primaryColor || '#6366f1';
    const isDark = safeTemplate.name === 'Dark Mode';
    
    // Generate navigation buttons for connected nodes
    const navigationButtons = connections.map(connectedNodeId => {
      const connectedNode = structure[connectedNodeId]?.node;
      if (!connectedNode) return '';
      
      return `
        <button 
          onclick="navigateToPage('${connectedNodeId}')" 
          class="px-6 py-3 rounded-lg transition-colors mr-4 mb-4 flex items-center ${
            isDark 
              ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400 border border-cyan-500/30'
              : `bg-blue-600 hover:bg-blue-700 text-white`
          }"
          style="background-color: ${primaryColor}; border-color: ${primaryColor};"
        >
          <span class="mr-2">🔗</span>
          ไปยัง ${connectedNode.data.label}
        </button>
      `;
    }).join('');

    // Generate page content based on node type
    let pageContent = '';
    
    switch (nodeType) {
      case 'UI Component':
      case 'Button':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6 text-primary">${node.data.label}</h2>
            <p class="text-lg mb-8">${textContent}</p>
            <div class="space-y-4">
              ${node.data.componentType === 'Button' ? `
                <button class="btn-primary text-white px-8 py-4 rounded-lg text-xl transition-all hover:scale-105">
                  ${node.data.textContent || 'Click Me'}
                </button>
              ` : ''}
            </div>
          </div>
        `;
        break;
        
      case 'Form':
        pageContent = `
          <div class="max-w-md mx-auto">
            <h2 class="text-3xl font-bold mb-6 text-center text-primary">${node.data.label}</h2>
            <form class="space-y-4">
              <div>
                <label class="block text-sm font-medium mb-2">ชื่อ</label>
                <input type="text" class="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all" style="border-color: ${primaryColor}; focus:ring-color: ${primaryColor};" placeholder="กรอกชื่อของคุณ">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">อีเมล</label>
                <input type="email" class="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all" style="border-color: ${primaryColor}; focus:ring-color: ${primaryColor};" placeholder="กรอกอีเมลของคุณ">
              </div>
              <div>
                <label class="block text-sm font-medium mb-2">ข้อความ</label>
                <textarea class="w-full px-4 py-2 border rounded-lg focus:ring-2 h-32 transition-all" style="border-color: ${primaryColor}; focus:ring-color: ${primaryColor};" placeholder="กรอกข้อความ"></textarea>
              </div>
              <button type="submit" class="w-full btn-primary text-white py-3 rounded-lg transition-all hover:scale-105">ส่งข้อมูล</button>
            </form>
          </div>
        `;
        break;
        
      case 'API Call':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">API Integration</h2>
            <div class="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 class="text-xl font-semibold mb-4">API Endpoint</h3>
              <p class="text-lg"><strong>URL:</strong> ${node.data.url || 'https://api.example.com'}</p>
              <p class="text-lg"><strong>Method:</strong> ${node.data.method || 'GET'}</p>
            </div>
            <button onclick="callAPI()" class="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg text-xl">
              เรียก API
            </button>
            <div id="api-result" class="mt-6 p-4 bg-green-100 rounded-lg hidden">
              <h4 class="font-semibold">ผลลัพธ์ API:</h4>
              <pre id="api-data" class="text-sm mt-2"></pre>
            </div>
          </div>
        `;
        break;
        
      case 'Database':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">Database Connection</h2>
            <div class="bg-gray-100 p-6 rounded-lg mb-6">
              <h3 class="text-xl font-semibold mb-4">ข้อมูลจากฐานข้อมูล</h3>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="bg-white p-4 rounded">
                  <h4 class="font-semibold">ผู้ใช้งาน</h4>
                  <p class="text-2xl font-bold text-blue-600">1,234</p>
                </div>
                <div class="bg-white p-4 rounded">
                  <h4 class="font-semibold">คำสั่งซื้อ</h4>
                  <p class="text-2xl font-bold text-green-600">567</p>
                </div>
                <div class="bg-white p-4 rounded">
                  <h4 class="font-semibold">รายได้</h4>
                  <p class="text-2xl font-bold text-purple-600">฿89,000</p>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'Chart':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">Analytics Dashboard</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold mb-4">📊 Sales Chart</h3>
                <div class="h-40 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg flex items-end justify-around p-4">
                  <div class="bg-white/20 w-8 h-16 rounded"></div>
                  <div class="bg-white/30 w-8 h-24 rounded"></div>
                  <div class="bg-white/40 w-8 h-20 rounded"></div>
                  <div class="bg-white/50 w-8 h-32 rounded"></div>
                  <div class="bg-white/60 w-8 h-28 rounded"></div>
                </div>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold mb-4">📈 Growth Metrics</h3>
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span>Revenue</span>
                    <span class="font-bold text-green-600">+15%</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Users</span>
                    <span class="font-bold text-blue-600">+8%</span>
                  </div>
                  <div class="flex justify-between">
                    <span>Orders</span>
                    <span class="font-bold text-purple-600">+12%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'Table':
        pageContent = `
          <div class="text-center mb-8">
            <h2 class="text-3xl font-bold mb-6">Data Table</h2>
            <div class="overflow-x-auto">
              <table class="min-w-full bg-white rounded-lg shadow-lg">
                <thead class="bg-gray-50">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-200">
                  <tr><td class="px-6 py-4">001</td><td class="px-6 py-4">สมชาย ใจดี</td><td class="px-6 py-4">somchai@example.com</td><td class="px-6 py-4"><span class="text-green-600">Active</span></td></tr>
                  <tr><td class="px-6 py-4">002</td><td class="px-6 py-4">สมหญิง รักดี</td><td class="px-6 py-4">somying@example.com</td><td class="px-6 py-4"><span class="text-green-600">Active</span></td></tr>
                  <tr><td class="px-6 py-4">003</td><td class="px-6 py-4">วิชัย สุขใส</td><td class="px-6 py-4">wichai@example.com</td><td class="px-6 py-4"><span class="text-yellow-600">Pending</span></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        `;
        break;
        
      case 'Page':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">📄 ${node.data.label}</h2>
            <p class="text-lg mb-8">${textContent}</p>
            <div class="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold mb-4">🎯 Features</h3>
                <ul class="text-left space-y-2">
                  <li>✅ Responsive Design</li>
                  <li>✅ Modern UI Components</li>
                  <li>✅ Fast Loading</li>
                  <li>✅ SEO Optimized</li>
                </ul>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <h3 class="text-xl font-semibold mb-4">📊 Stats</h3>
                <div class="text-left space-y-2">
                  <div>Page Views: <strong>2,543</strong></div>
                  <div>Unique Visitors: <strong>1,876</strong></div>
                  <div>Bounce Rate: <strong>32%</strong></div>
                  <div>Load Time: <strong>1.2s</strong></div>
                </div>
              </div>
            </div>
          </div>
        `;
        break;
        
      case 'Service':
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">🔧 ${node.data.label}</h2>
            <p class="text-lg mb-8">${textContent}</p>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="text-4xl mb-4">⚡</div>
                <h3 class="text-xl font-semibold mb-2">Fast Processing</h3>
                <p class="text-gray-600">High-performance service with lightning-fast response times</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="text-4xl mb-4">🔒</div>
                <h3 class="text-xl font-semibold mb-2">Secure</h3>
                <p class="text-gray-600">Enterprise-grade security and data protection</p>
              </div>
              <div class="bg-white p-6 rounded-lg shadow-lg">
                <div class="text-4xl mb-4">📈</div>
                <h3 class="text-xl font-semibold mb-2">Scalable</h3>
                <p class="text-gray-600">Auto-scaling to handle any workload</p>
              </div>
            </div>
          </div>
        `;
        break;
        
      default:
        pageContent = `
          <div class="text-center">
            <h2 class="text-3xl font-bold mb-6">${node.data.label}</h2>
            <p class="text-lg mb-8">${textContent}</p>
            <div class="bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-lg">
              <div class="text-6xl mb-4">🎨</div>
              <p class="text-gray-600 text-lg">หน้านี้ถูกสร้างจาก <strong>${nodeType}</strong> node</p>
              <p class="text-gray-500 mt-2">คุณสามารถปรับแต่งเนื้อหาได้ในโหนดคุณสมบัติ</p>
            </div>
          </div>
        `;
    }

    // Get template styles
    const getHeaderStyle = () => {
      switch (safeTemplate.headerStyle) {
        case 'gradient':
          return `background: linear-gradient(135deg, ${primaryColor}, #8b5cf6);`;
        case 'artistic':
          return `background: linear-gradient(45deg, #f093fb 0%, #f5576c 100%);`;
        case 'dark':
          return `background: linear-gradient(135deg, #0f172a, #1e293b); border-bottom: 1px solid #334155;`;
        case 'minimal':
          return `background: ${backgroundColor}; border-bottom: 1px solid #e5e7eb;`;
        default:
          return `background: #ffffff; border-bottom: 1px solid #e5e7eb;`;
      }
    };

    return `
      <!DOCTYPE html>
      <html lang="th">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${node.data.label} - ${safeTemplate.name || 'Generated'} Website</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
          <style>
              :root {
                  --primary-color: ${primaryColor};
                  --bg-color: ${backgroundColor};
                  --font-family: ${safeTemplate.fontFamily || 'system-ui, sans-serif'};
              }
              body { 
                  background-color: var(--bg-color); 
                  font-family: var(--font-family);
                  color: ${isDark ? '#f1f5f9' : '#1f2937'};
              }
              .page-container {
                  animation: fadeIn 0.5s ease-in;
              }
              @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              .header-custom {
                  ${getHeaderStyle()}
              }
              .card-custom {
                  background: ${isDark ? '#1e293b' : '#ffffff'};
                  border: 1px solid ${isDark ? '#334155' : '#e5e7eb'};
                  color: ${isDark ? '#f1f5f9' : '#1f2937'};
              }
              .text-primary {
                  color: var(--primary-color);
              }
              .btn-primary {
                  background-color: var(--primary-color);
                  border-color: var(--primary-color);
              }
              .btn-primary:hover {
                  opacity: 0.9;
              }
          </style>
      </head>
      <body class="min-h-screen">
          <div class="page-container">
              <!-- Header -->
              <header class="header-custom shadow-lg">
                  <div class="container mx-auto px-6 py-4">
                      <div class="flex items-center justify-between">
                          <div class="flex items-center space-x-4">
                              <h1 class="text-2xl font-bold ${isDark ? 'text-cyan-400' : safeTemplate.headerStyle === 'gradient' || safeTemplate.headerStyle === 'artistic' ? 'text-white' : 'text-gray-900'}">
                                  ${safeTemplate.preview || '🌐'} ${safeTemplate.name || 'Generated'} Website
                              </h1>
                              <span class="px-3 py-1 rounded-full text-sm ${
                                isDark ? 'bg-slate-700 text-cyan-400 border border-cyan-500/30' :
                                safeTemplate.headerStyle === 'gradient' || safeTemplate.headerStyle === 'artistic' ? 'bg-white/20 text-white' :
                                'bg-blue-100 text-blue-800'
                              }">
                                  Current: ${node.data.label}
                              </span>
                          </div>
                          <button onclick="showPageMap()" class="px-4 py-2 rounded-lg transition-colors ${
                            isDark ? 'bg-slate-700 hover:bg-slate-600 text-cyan-400' :
                            safeTemplate.headerStyle === 'gradient' || safeTemplate.headerStyle === 'artistic' ? 'bg-white/20 hover:bg-white/30 text-white' :
                            'bg-gray-600 hover:bg-gray-700 text-white'
                          }">
                              📍 Site Map
                          </button>
                      </div>
                  </div>
              </header>

              <!-- Main Content -->
              <main class="container mx-auto px-6 py-12">
                  <div class="card-custom rounded-lg shadow-lg p-8 mb-8">
                      ${pageContent}
                  </div>
                  
                  <!-- Navigation Section -->
                  ${navigationButtons ? `
                      <div class="card-custom rounded-lg shadow-lg p-6">
                          <h3 class="text-xl font-semibold mb-4 text-primary">🔗 การนำทาง</h3>
                          <div class="flex flex-wrap">
                              ${navigationButtons}
                          </div>
                      </div>
                  ` : ''}
              </main>

              <!-- Footer -->
              <footer class="${isDark ? 'bg-slate-900 border-t border-slate-700' : 'bg-gray-800'} text-white py-8 mt-16">
                  <div class="container mx-auto px-6 text-center">
                      <p>🚀 Generated by TON Low-Code Platform - ${safeTemplate.name || 'Default'} Template</p>
                      <p class="text-sm ${isDark ? 'text-slate-400' : 'text-gray-400'} mt-2">
                          Node ID: ${node.id} | Type: ${nodeType} | Template: ${safeTemplate.name || 'Default'}
                      </p>
                  </div>
              </footer>
          </div>

          <script>
              // Store website structure
              window.__currentNodeId = '${node.id}';
              
              // Copy website data to current window for navigation
              if (window.opener && window.opener.__websitePages) {
                  window.__websitePages = window.opener.__websitePages;
                  window.__websiteStructure = window.opener.__websiteStructure;
              }
              
              // Navigation function
              function navigateToPage(targetNodeId) {
                  if (window.__websitePages && window.__websitePages[targetNodeId]) {
                      // Add smooth transition effect
                      document.body.style.opacity = '0.5';
                      document.body.style.transition = 'opacity 0.3s ease';
                      
                      setTimeout(() => {
                          const targetPageHTML = window.__websitePages[targetNodeId];
                          document.open();
                          document.write(targetPageHTML);
                          document.close();
                      }, 150);
                  } else {
                      // Fallback: open in new tab
                      const newTab = window.open('', '_blank');
                      if (newTab && window.__websitePages && window.__websitePages[targetNodeId]) {
                          newTab.document.write(window.__websitePages[targetNodeId]);
                          newTab.document.close();
                      } else {
                          alert('กำลังนำทางไปยัง ' + targetNodeId);
                      }
                  }
              }
              
              // API call function
              function callAPI() {
                  const resultDiv = document.getElementById('api-result');
                  const dataDiv = document.getElementById('api-data');
                  if (resultDiv && dataDiv) {
                      resultDiv.classList.remove('hidden');
                      dataDiv.textContent = JSON.stringify({
                          status: 'success',
                          data: { message: 'API called successfully', timestamp: new Date().toISOString() }
                      }, null, 2);
                  }
              }
              
              // Show site map
              function showPageMap() {
                  if (window.parent && window.parent.__websiteStructure) {
                      const structure = window.parent.__websiteStructure;
                      const pages = Object.values(structure).map(s => s.node.data.label).join(', ');
                      alert('หน้าทั้งหมดในเว็บไซต์: ' + pages);
                  } else {
                      alert('Site Map: ${node.data.label} (หน้าปัจจุบัน)');
                  }
              }
          </script>
      </body>
      </html>
    `;
  };

  const generateIndexPage = (pages: { [nodeId: string]: string }, startingNode: Node): string => {
    return pages[startingNode.id] || '';
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
              <span className="font-bold text-slate-900 dark:text-white">Project WorkFlow</span>
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
                          key={item.id}
                          className="w-full text-left px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors cursor-move"
                          draggable
                          onDragStart={(event) => onDragStart(event, item.id)}
                        >
                          {item.id}
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
            <button 
              onClick={handleSave}
              disabled={isSaving || !currentProject}
              className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mx-auto" />
              {isSaving && <span className="text-xs block">Saving...</span>}
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
            <span className="font-bold text-slate-900 dark:text-white">
              {currentProject ? `${currentProject.name} - Flow Builder` : 'Flow Builder'}
            </span>
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
              <button 
                onClick={() => setShowVersionPanel(true)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center"
              >
                <GitBranch className="h-4 w-4 mr-2" />
                Versions
              </button>
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
              <button 
                onClick={executeFlow}
                disabled={isExecuting || isGeneratingWebsite}
                className={`px-4 py-2 text-white rounded-lg flex items-center transition-colors ${
                  isExecuting 
                    ? 'bg-amber-500 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {isExecuting ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    กำลังรัน Flow...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Run Flow
                  </>
                )}
              </button>
              <button 
                onClick={openTemplateSelector}
                disabled={isExecuting || isGeneratingWebsite}
                className={`px-4 py-2 text-white rounded-lg flex items-center transition-colors ${
                  isGeneratingWebsite 
                    ? 'bg-purple-500 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
              >
                {isGeneratingWebsite ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    สร้างเว็บไซต์...
                  </>
                ) : (
                  <>
                    <Globe className="h-4 w-4 mr-2" />
                    Run Website
                  </>
                )}
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
            onNodeDoubleClick={onNodeDoubleClick}
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

      {/* Properties Panel - Right Sidebar */}
      {showPropertiesPanel && (
        <>
          {/* Mobile backdrop */}
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={onClosePropertiesPanel}
          />
          
          {/* Properties Panel - Fixed overlay */}
          <div className="fixed right-0 top-0 h-full w-56 z-50 transform transition-transform duration-300 ease-in-out">
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
                  key={nodeType.id}
                  onClick={() => handleNodeSelection(nodeType.id)}
                  className="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {nodeType.id}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Template Selector Modal */}
      {showTemplateSelector && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowTemplateSelector(false)}
          />
          
          {/* Template Selector */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                      🎨 เลือก Template สำหรับเว็บไซต์
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                      เลือกเทมเพลตที่คุณต้องการสำหรับเว็บไซต์ของคุณ
                    </p>
                  </div>
                  <button
                    onClick={() => setShowTemplateSelector(false)}
                    className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    <div className="w-6 h-6">✕</div>
                  </button>
                </div>
              </div>

              {/* Template Grid */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Object.entries(websiteTemplates).map(([templateId, template]) => (
                    <div
                      key={templateId}
                      className={`relative p-6 rounded-lg border-2 cursor-pointer transition-all hover:scale-105 ${
                        selectedTemplate === templateId
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                      onClick={() => setSelectedTemplate(templateId)}
                    >
                      {/* Template Preview */}
                      <div 
                        className="w-full h-32 rounded-lg mb-4 flex items-center justify-center text-4xl"
                        style={{ 
                          backgroundColor: template.backgroundColor,
                          color: template.primaryColor,
                          fontFamily: template.fontFamily
                        }}
                      >
                        {template.preview}
                      </div>
                      
                      {/* Template Info */}
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                          {template.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          {template.description}
                        </p>
                        
                        {/* Template Features */}
                        <div className="text-xs space-y-1">
                          <div style={{ color: template.primaryColor }} className="font-medium">
                            Primary: {template.primaryColor}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            Font: {template.fontFamily.split(',')[0]}
                          </div>
                        </div>
                      </div>
                      
                      {/* Selected Indicator */}
                      {selectedTemplate === templateId && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Template ที่เลือก: <strong>{websiteTemplates[selectedTemplate as keyof typeof websiteTemplates]?.name}</strong>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowTemplateSelector(false)}
                      className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => generateWebsite(selectedTemplate)}
                      disabled={isGeneratingWebsite}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center"
                    >
                      {isGeneratingWebsite ? (
                        <>
                          <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                          สร้างเว็บไซต์...
                        </>
                      ) : (
                        <>
                          <Globe className="h-4 w-4 mr-2" />
                          สร้างเว็บไซต์
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Collaborative Features */}
      <CollaborativeUsersPanel />
      <CollaborativeCursors />
      
      {/* Modals */}
      <WeUIModal
        isOpen={showWeUIModal}
        onClose={() => setShowWeUIModal(false)}
        nodeData={doubleClickedNode?.data}
      />
      
      <ServiceFlowModal
        isOpen={showServiceFlowModal}
        onClose={() => setShowServiceFlowModal(false)}
        nodeData={doubleClickedNode?.data}
      />
      
      <CodeEditorModal
        isOpen={showCodeEditorModal}
        onClose={() => setShowCodeEditorModal(false)}
        nodeData={{...doubleClickedNode?.data, id: doubleClickedNode?.id}}
        onSaveCode={handleSaveCode}
      />
      
      {/* Flow Version Panel */}
      <FlowVersionPanel
        isOpen={showVersionPanel}
        onClose={() => setShowVersionPanel(false)}
        flowId={parseInt(projectId || '1')}
        currentNodes={nodes}
        currentEdges={edges}
        onLoadVersion={handleLoadVersion}
      />
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