import React, { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  ReactFlowProvider,
  ReactFlowInstance,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import our custom components
import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import NodePalette, { NodeTemplate } from './panels/NodePalette';
import FlowToolbar from './panels/FlowToolbar';
import { useFlowState } from './hooks/useFlowState';
import { useFlowExecution } from './hooks/useFlowExecution';

// Import existing components that we'll keep using
import NodePropertiesPanel from '@/components/panels/NodePropertiesPanel';
import FlowVersionPanel from '@/components/panels/FlowVersionPanel';
import { 
  CollaborativeUsersPanel, 
  CollaborativeCursors, 
  CollaborativeNodeIndicator 
} from '@/components/collaboration';

// Import APIs
import { myProjectAPI } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';

interface ReactFlowEditorProps {
  projectId?: string;
}

const ReactFlowEditor: React.FC<ReactFlowEditorProps> = ({ projectId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showAlert } = useAlert();
  
  // Get project ID from props or URL params
  const currentProjectId = projectId || searchParams.get('projectId');
  
  // State management
  const [projectData, setProjectData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPalette, setShowPalette] = useState(true);
  const [showVersionPanel, setShowVersionPanel] = useState(false);
  const [showCollaboration, setShowCollaboration] = useState(false);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [selectedNode, setSelectedNode] = useState<any>(null);

  // Flow state and execution
  const flowState = useFlowState();
  const { executionState, executeFlow, validateFlow } = useFlowExecution();

  // Load project data
  useEffect(() => {
    const loadProjectData = async () => {
      if (!currentProjectId) return;
      
      setIsLoading(true);
      try {
        const response = await myProjectAPI.getById(Number(currentProjectId));
        const project = response.data;
        setProjectData(project);
        
        // Load flow data if it exists
        if (project.workflows && project.workflows.length > 0) {
          const projectFlow = project.workflows[0];
          if (projectFlow.configuration) {
            const processedNodes = projectFlow.configuration.nodes.map((node: any) => ({
              ...node,
              type: 'customNode',
            }));
            
            const processedEdges = projectFlow.configuration.edges.map((edge: any) => ({
              ...edge,
              type: 'custom',
            }));

            flowState.loadFlow({
              nodes: processedNodes,
              edges: processedEdges
            });
          }
        }
      } catch (error) {
        console.error('Failed to load project:', error);
        showAlert('Failed to load project', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadProjectData();
  }, [currentProjectId]);

  // Handle drag from palette
  const onNodeDrag = useCallback((event: React.DragEvent, nodeTemplate: NodeTemplate) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(nodeTemplate));
  }, []);

  // Handle drop on canvas
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    
    const nodeData = event.dataTransfer.getData('application/reactflow');
    if (!nodeData || !flowState.reactFlowInstance) return;
    
    const nodeTemplate: NodeTemplate = JSON.parse(nodeData);
    const position = flowState.reactFlowInstance.screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });
    
    flowState.addNode(nodeTemplate, position);
  }, [flowState]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle save
  const handleSave = async () => {
    if (!currentProjectId || !projectData) return;
    
    setIsLoading(true);
    try {
      const flowData = {
        id: projectData.id,
        name: projectData.name,
        description: projectData.description || '',
        isActive: true,
        nodes: flowState.nodes,
        edges: flowState.edges,
        viewport: flowState.reactFlowInstance?.getViewport(),
        version: '1.0.0',
      };

      // Update the project's workflow
      await myProjectAPI.update(Number(currentProjectId), {
        workflows: [{ configuration: flowData }] as any
      });

      flowState.resetUnsavedChanges();
      showAlert('Flow saved successfully', 'success');
    } catch (error) {
      console.error('Save failed:', error);
      showAlert('Failed to save flow', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle execution
  const handleExecute = async () => {
    const validation = validateFlow(flowState.nodes, flowState.edges);
    
    if (!validation.isValid) {
      showAlert(`Validation failed: ${validation.errors.join(', ')}`, 'error');
      return;
    }

    try {
      const result = await executeFlow(flowState.nodes, flowState.edges);
      showAlert(`Flow executed successfully. ${Object.keys(result.results).length} nodes completed.`, 'success');
    } catch (error) {
      console.error('Execution failed:', error);
      showAlert('Flow execution failed', 'error');
    }
  };

  // Handle node selection
  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNode(node);
    setShowPropertiesPanel(true);
  }, []);

  // Handle global events for node operations
  useEffect(() => {
    const handleDeleteNode = (event: CustomEvent) => {
      flowState.deleteNode(event.detail.nodeId);
    };

    const handleUpdateNodeSize = (event: CustomEvent) => {
      const { nodeId, width, height } = event.detail;
      flowState.updateNodeSize(nodeId, width, height);
    };

    window.addEventListener('deleteNode', handleDeleteNode as EventListener);
    window.addEventListener('updateNodeSize', handleUpdateNodeSize as EventListener);

    return () => {
      window.removeEventListener('deleteNode', handleDeleteNode as EventListener);
      window.removeEventListener('updateNodeSize', handleUpdateNodeSize as EventListener);
    };
  }, [flowState]);

  if (!currentProjectId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600 mb-4">Please select a project to edit its flow.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-gray-50">
      {/* Toolbar */}
      <FlowToolbar
        projectName={projectData?.name || 'Loading...'}
        isLoading={isLoading}
        hasUnsavedChanges={flowState.hasUnsavedChanges}
        onBack={() => router.push('/dashboard')}
        onSave={handleSave}
        onExecute={handleExecute}
        onExport={() => {/* TODO: Implement export */}}
        onImport={() => {/* TODO: Implement import */}}
        onShowPalette={() => setShowPalette(!showPalette)}
        onShowVersions={() => setShowVersionPanel(!showVersionPanel)}
        onShowCollaboration={() => setShowCollaboration(!showCollaboration)}
      />

      {/* Node Palette */}
      <NodePalette
        isOpen={showPalette}
        onToggle={() => setShowPalette(!showPalette)}
        onNodeDrag={onNodeDrag}
      />

      {/* Main Flow Canvas */}
      <div className="h-[calc(100vh-4rem)] mt-16">
        <ReactFlowProvider>
          <ReactFlow
            nodes={flowState.nodes}
            edges={flowState.edges}
            onNodesChange={flowState.onNodesChange}
            onEdgesChange={flowState.onEdgesChange}
            onConnect={flowState.onConnect}
            onInit={flowState.setReactFlowInstance}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeClick={onNodeClick}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 1 }}
            minZoom={0.1}
            maxZoom={2}
            attributionPosition="bottom-left"
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls />
            <MiniMap />
            
            {/* Collaborative features */}
            <CollaborativeCursors />
            <CollaborativeNodeIndicator />
          </ReactFlow>
        </ReactFlowProvider>
      </div>

      {/* Side Panels */}
      {showPropertiesPanel && selectedNode && (
        <NodePropertiesPanel
          node={selectedNode}
          isOpen={showPropertiesPanel}
          onClose={() => setShowPropertiesPanel(false)}
          onUpdate={(updates) => {
            // Update node properties
            const updatedNodes = flowState.nodes.map(node => 
              node.id === selectedNode.id 
                ? { ...node, data: { ...node.data, ...updates } }
                : node
            );
            // This would need to be implemented in useFlowState
          }}
        />
      )}

      {showVersionPanel && (
        <FlowVersionPanel
          projectId={Number(currentProjectId)}
          isOpen={showVersionPanel}
          onClose={() => setShowVersionPanel(false)}
          onLoadVersion={(version) => {
            // Load version - this would need to be implemented
            console.log('Load version:', version);
          }}
        />
      )}

      {showCollaboration && (
        <CollaborativeUsersPanel
          isOpen={showCollaboration}
          onClose={() => setShowCollaboration(false)}
        />
      )}

      {/* Execution Status */}
      {executionState.isExecuting && (
        <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium">
              Executing flow... {executionState.currentNodeId && `(${executionState.currentNodeId})`}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReactFlowEditor;