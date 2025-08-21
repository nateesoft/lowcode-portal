// Flow validation utilities
export const validateFlowStructure = (nodes: any[], edges: any[]) => {
  const errors: string[] = [];
  
  // Check for isolated nodes
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });
  
  const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
  if (isolatedNodes.length > 0) {
    errors.push(`Isolated nodes: ${isolatedNodes.map(n => n.data?.label || n.id).join(', ')}`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Flow export utilities
export const exportFlowToJSON = (nodes: any[], edges: any[], metadata?: any) => {
  return {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    metadata: metadata || {},
    nodes,
    edges
  };
};

// Flow import utilities
export const importFlowFromJSON = (jsonData: any) => {
  try {
    const { nodes, edges } = jsonData;
    return {
      success: true,
      nodes: nodes || [],
      edges: edges || []
    };
  } catch (error) {
    return {
      success: false,
      error: 'Invalid flow data format'
    };
  }
};

// Node positioning utilities
export const autoLayoutNodes = (nodes: any[], edges: any[]) => {
  // Simple force-directed layout
  // In a real implementation, you might use a library like dagre or elk
  const layoutNodes = nodes.map((node, index) => ({
    ...node,
    position: {
      x: (index % 3) * 250,
      y: Math.floor(index / 3) * 150
    }
  }));
  
  return layoutNodes;
};