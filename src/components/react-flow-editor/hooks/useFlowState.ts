import { useState, useCallback, useRef } from 'react';
import { Node, Edge, addEdge, Connection, ReactFlowInstance } from 'reactflow';
import { NodeTemplate } from '../panels/NodePalette';

export interface FlowState {
  nodes: Node[];
  edges: Edge[];
  reactFlowInstance: ReactFlowInstance | null;
  hasUnsavedChanges: boolean;
}

export const useFlowState = (initialNodes: Node[] = [], initialEdges: Edge[] = []) => {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onNodesChange = useCallback((changes: any) => {
    setNodes((nds) => {
      const newNodes = nds.map((node) => {
        const change = changes.find((c: any) => c.id === node.id);
        if (change) {
          if (change.type === 'position' && change.position) {
            return { ...node, position: change.position };
          }
          if (change.type === 'select') {
            return { ...node, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return node;
      }).filter(Boolean) as Node[];
      
      setHasUnsavedChanges(true);
      return newNodes;
    });
  }, []);

  const onEdgesChange = useCallback((changes: any) => {
    setEdges((eds) => {
      const newEdges = eds.map((edge) => {
        const change = changes.find((c: any) => c.id === edge.id);
        if (change) {
          if (change.type === 'select') {
            return { ...edge, selected: change.selected };
          }
          if (change.type === 'remove') {
            return null;
          }
        }
        return edge;
      }).filter(Boolean) as Edge[];
      
      setHasUnsavedChanges(true);
      return newEdges;
    });
  }, []);

  const onConnect = useCallback((params: Connection) => {
    const newEdge = {
      ...params,
      id: `edge-${Date.now()}`,
      type: 'custom',
      data: {
        onAddNode: handleAddNodeToEdge,
        onDelete: handleDeleteEdge,
      },
    };
    setEdges((eds) => addEdge(newEdge as Edge, eds));
    setHasUnsavedChanges(true);
  }, []);

  const addNode = useCallback((nodeTemplate: NodeTemplate, position: { x: number; y: number }) => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: nodeTemplate.type,
      position,
      data: {
        label: nodeTemplate.label,
        description: nodeTemplate.description,
        icon: nodeTemplate.icon,
        backgroundColor: nodeTemplate.backgroundColor,
        borderColor: nodeTemplate.borderColor,
        width: nodeTemplate.defaultSize?.width || 200,
        height: nodeTemplate.defaultSize?.height || 100,
      },
    };

    setNodes((nds) => [...nds, newNode]);
    setHasUnsavedChanges(true);
    return newNode;
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
    setHasUnsavedChanges(true);
  }, []);

  const updateNodeSize = useCallback((nodeId: string, width: number, height: number) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              width,
              height,
            },
          };
        }
        return node;
      })
    );
    setHasUnsavedChanges(true);
  }, []);

  const handleAddNodeToEdge = useCallback((edgeId: string, position: { x: number; y: number }) => {
    // Find the edge
    const edge = edges.find((e) => e.id === edgeId);
    if (!edge) return;

    // Create a new processor node
    const newNode: Node = {
      id: `node-${Date.now()}`,
      type: 'customNode',
      position,
      data: {
        label: 'Processor',
        description: 'Data processing node',
        backgroundColor: '#dbeafe',
        borderColor: '#3b82f6',
        width: 200,
        height: 100,
      },
    };

    // Remove the old edge
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));

    // Add the new node
    setNodes((nds) => [...nds, newNode]);

    // Add two new edges: source -> newNode -> target
    const edge1: Edge = {
      id: `edge-${Date.now()}-1`,
      source: edge.source,
      target: newNode.id,
      type: 'custom',
      data: {
        onAddNode: handleAddNodeToEdge,
        onDelete: handleDeleteEdge,
      },
    };

    const edge2: Edge = {
      id: `edge-${Date.now()}-2`,
      source: newNode.id,
      target: edge.target,
      type: 'custom',
      data: {
        onAddNode: handleAddNodeToEdge,
        onDelete: handleDeleteEdge,
      },
    };

    setEdges((eds) => [...eds, edge1, edge2]);
    setHasUnsavedChanges(true);
  }, [edges]);

  const handleDeleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setHasUnsavedChanges(true);
  }, []);

  const setReactFlowInstance = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const resetUnsavedChanges = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const loadFlow = useCallback((flowData: { nodes: Node[]; edges: Edge[] }) => {
    setNodes(flowData.nodes);
    setEdges(flowData.edges);
    setHasUnsavedChanges(false);
  }, []);

  return {
    nodes,
    edges,
    hasUnsavedChanges,
    reactFlowInstance: reactFlowInstance.current,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    deleteNode,
    updateNodeSize,
    setReactFlowInstance,
    resetUnsavedChanges,
    loadFlow,
  };
};