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
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft, Save, Play, Download, Upload, 
  Database, Cpu, Box, Zap, Globe,
  Menu
} from 'lucide-react';
import NodePropertiesPanel from '@/components/panels/NodePropertiesPanel';

// Import separated components
import { CustomNodeWrapper, CustomEdge, TemplateSelector, NodePalette } from './components';

// Import types and utilities
import { ReactFlowPageProps, NodeSelectorState } from './types';
import { 
  getNodeDescription, 
  getNodeIcon, 
  getGroupBackgroundColor, 
  nodeCategories,
  distancePointToLine 
} from './utils/nodeHelpers';
import { websiteTemplates } from './templates';
import { 
  buildWebsiteStructure, 
  generateWebsitePages, 
  generateIndexPage,
  processServiceNodes,
  isPageNode
} from './utils/websiteGenerator';
import { 
  buildExecutionGraph, 
  executeNodeChain, 
  generatePreviewHTML 
} from './utils/flowExecution';

// Node and Edge types
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
  const [showNodeSelector, setShowNodeSelector] = useState<NodeSelectorState | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executingNodeId, setExecutingNodeId] = useState<string | null>(null);
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('modern');

  // Update global execution state for visual feedback
  React.useEffect(() => {
    (window as any).__reactFlowExecutingNodeId = executingNodeId;
    // Force re-render of all nodes
    if (reactFlowInstance) {
      reactFlowInstance.setNodes(nds => [...nds]);
    }
  }, [executingNodeId, reactFlowInstance]);

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

  // Open template selector
  const openTemplateSelector = () => {
    // Check if there are Page nodes first
    const pageNodes = nodes.filter(node => !node.data.isGroup && isPageNode(node));
    if (pageNodes.length === 0) {
      alert('กรุณาเพิ่มโหนดประเภท Page (เช่น Page, UI Component, Button, Form) ในแคนวาสก่อนสร้างเว็บไซต์');
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

      // Get selected template with fallback
      const template = websiteTemplates[templateId as keyof typeof websiteTemplates] || websiteTemplates.modern;

      if (!template) {
        throw new Error('ไม่สามารถโหลด template ได้');
      }

      console.log('🔄 Starting website generation...');
      
      // Process Service nodes in background (non-blocking)
      console.log('🔄 Processing Service nodes in background...');
      processServiceNodes(nodes, edges).then(serviceResults => {
        console.log('✅ All Service nodes processed:', serviceResults);
        // Store service results for potential use in pages
        (window as any).__serviceResults = serviceResults;
      }).catch(error => {
        console.warn('⚠️ Some Service nodes failed:', error);
      });

      // Find starting Page node (Page node without incoming edges from other Page nodes)
      const pageNodes = nodes.filter(node => !node.data.isGroup && isPageNode(node));
      const startingPageNodes = pageNodes.filter(node => 
        !edges.some(edge => {
          const sourceNode = nodes.find(n => n.id === edge.source);
          return edge.target === node.id && sourceNode && isPageNode(sourceNode);
        })
      );

      if (startingPageNodes.length === 0) {
        // If no clear starting page, use the first page node
        if (pageNodes.length > 0) {
          startingPageNodes.push(pageNodes[0]);
        } else {
          alert('ไม่พบโหนดประเภท Page สำหรับสร้างเว็บไซต์');
          setIsGeneratingWebsite(false);
          return;
        }
      }

      console.log(`📄 Found ${pageNodes.length} Page nodes, starting from:`, startingPageNodes[0].data.label);

      // Build website structure (only Page nodes)
      const websiteStructure = buildWebsiteStructure(nodes, edges);
      
      // Generate all pages with template
      const websitePages = generateWebsitePages(websiteStructure, template);
      
      // Create main index page
      const indexPageHTML = generateIndexPage(websitePages, startingPageNodes[0]);
      
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
        
        console.log('🌐 Website generated successfully!');
      }

    } catch (error) {
      console.error('Website generation error:', error);
      alert('เกิดข้อผิดพลาดในการสร้างเว็บไซต์: ' + error);
    } finally {
      setIsGeneratingWebsite(false);
    }
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
        alert('ไม่พบ starting node สำหรับเริ่มต้น flow');
        setIsExecuting(false);
        return;
      }

      // Build execution graph
      const executionGraph = buildExecutionGraph(nodes, edges);
      
      // Execute nodes in order with visual feedback
      for (const startNode of startingNodes) {
        await executeNodeChain(startNode, executionGraph, executionResults, executionSteps, nodes, setExecutingNodeId);
      }

      // Generate preview HTML
      const previewHTML = generatePreviewHTML(executionResults, executionSteps);
      
      // Open in new tab
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.open();
        newWindow.document.write(previewHTML);
        newWindow.document.close();
      }

    } catch (error) {
      console.error('Flow execution error:', error);
      alert('เกิดข้อผิดพลาดในการรัน flow: ' + error);
    } finally {
      setIsExecuting(false);
      setExecutingNodeId(null);
    }
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
          <NodePalette
            nodeCategories={nodeCategories}
            collapsedCategories={collapsedCategories}
            onToggleCategory={toggleCategory}
            onDragStart={onDragStart}
          />
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

      {/* Template Selector Modal */}
      <TemplateSelector
        showTemplateSelector={showTemplateSelector}
        selectedTemplate={selectedTemplate}
        websiteTemplates={websiteTemplates}
        onClose={() => setShowTemplateSelector(false)}
        onTemplateSelect={setSelectedTemplate}
        onGenerateWebsite={generateWebsite}
        isGeneratingWebsite={isGeneratingWebsite}
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