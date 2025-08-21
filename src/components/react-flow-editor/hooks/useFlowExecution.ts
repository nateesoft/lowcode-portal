import { useState, useCallback } from 'react';
import { Node, Edge } from 'reactflow';

export interface ExecutionState {
  isExecuting: boolean;
  currentNodeId: string | null;
  executionResults: Record<string, any>;
  errors: Record<string, string>;
}

export const useFlowExecution = () => {
  const [executionState, setExecutionState] = useState<ExecutionState>({
    isExecuting: false,
    currentNodeId: null,
    executionResults: {},
    errors: {},
  });

  const executeFlow = useCallback(async (nodes: Node[], edges: Edge[]) => {
    setExecutionState({
      isExecuting: true,
      currentNodeId: null,
      executionResults: {},
      errors: {},
    });

    try {
      // Simple execution simulation - in real implementation, this would:
      // 1. Validate the flow
      // 2. Determine execution order
      // 3. Execute nodes in order
      // 4. Handle data flow between nodes

      const executionOrder = getExecutionOrder(nodes, edges);
      const results: Record<string, any> = {};
      const errors: Record<string, string> = {};

      for (const nodeId of executionOrder) {
        setExecutionState(prev => ({ ...prev, currentNodeId: nodeId }));
        
        // Set global execution state for visual feedback
        (window as any).__reactFlowExecutingNodeId = nodeId;

        try {
          // Simulate node execution
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const node = nodes.find(n => n.id === nodeId);
          if (node) {
            results[nodeId] = {
              status: 'success',
              output: `Executed ${node.data.label}`,
              timestamp: new Date().toISOString(),
            };
          }
        } catch (error) {
          errors[nodeId] = error instanceof Error ? error.message : 'Unknown error';
        }

        // Clear global execution state
        (window as any).__reactFlowExecutingNodeId = null;
      }

      setExecutionState({
        isExecuting: false,
        currentNodeId: null,
        executionResults: results,
        errors,
      });

      return { results, errors };
    } catch (error) {
      setExecutionState(prev => ({
        ...prev,
        isExecuting: false,
        currentNodeId: null,
      }));
      throw error;
    }
  }, []);

  const validateFlow = useCallback((nodes: Node[], edges: Edge[]) => {
    const errors: string[] = [];
    
    // Check for isolated nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
    
    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
      errors.push(`Isolated nodes detected: ${isolatedNodes.map(n => n.data.label).join(', ')}`);
    }

    // Check for cycles
    if (hasCycles(nodes, edges)) {
      errors.push('Circular dependencies detected in the flow');
    }

    // Check for missing required connections
    // This would depend on your specific node types and requirements

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const stopExecution = useCallback(() => {
    setExecutionState(prev => ({
      ...prev,
      isExecuting: false,
      currentNodeId: null,
    }));
    (window as any).__reactFlowExecutingNodeId = null;
  }, []);

  return {
    executionState,
    executeFlow,
    validateFlow,
    stopExecution,
  };
};

// Helper function to determine execution order
function getExecutionOrder(nodes: Node[], edges: Edge[]): string[] {
  const inDegree: Record<string, number> = {};
  const adjList: Record<string, string[]> = {};
  
  // Initialize
  nodes.forEach(node => {
    inDegree[node.id] = 0;
    adjList[node.id] = [];
  });
  
  // Build adjacency list and calculate in-degrees
  edges.forEach(edge => {
    adjList[edge.source].push(edge.target);
    inDegree[edge.target] += 1;
  });
  
  // Topological sort
  const queue: string[] = [];
  const result: string[] = [];
  
  // Find nodes with no incoming edges
  Object.keys(inDegree).forEach(nodeId => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    result.push(current);
    
    adjList[current].forEach(neighbor => {
      inDegree[neighbor] -= 1;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }
  
  return result;
}

// Helper function to detect cycles
function hasCycles(nodes: Node[], edges: Edge[]): boolean {
  const adjList: Record<string, string[]> = {};
  const visited: Set<string> = new Set();
  const recStack: Set<string> = new Set();
  
  // Initialize adjacency list
  nodes.forEach(node => {
    adjList[node.id] = [];
  });
  
  edges.forEach(edge => {
    adjList[edge.source].push(edge.target);
  });
  
  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recStack.add(nodeId);
    
    for (const neighbor of adjList[nodeId]) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recStack.has(neighbor)) {
        return true; // Cycle detected
      }
    }
    
    recStack.delete(nodeId);
    return false;
  }
  
  for (const node of nodes) {
    if (!visited.has(node.id)) {
      if (dfs(node.id)) return true;
    }
  }
  
  return false;
}