import { NextRequest, NextResponse } from 'next/server';

// Flow execution engine
async function executeFlow(flowData: any) {
  const { flowId, name, nodes, edges } = flowData;
  
  console.log(`Starting execution of flow: ${name} (ID: ${flowId})`);
  
  // Find starting nodes (nodes without incoming edges)
  const startingNodes = nodes.filter((node: any) => 
    !edges.some((edge: any) => edge.target === node.id)
  );

  if (startingNodes.length === 0) {
    throw new Error('No starting nodes found. Flow must have at least one node without incoming connections.');
  }

  const executionResults: any[] = [];
  const executionLog: string[] = [];

  // Execute each starting node chain
  for (const startNode of startingNodes) {
    await executeNodeChain(startNode, nodes, edges, executionResults, executionLog);
  }

  return {
    flowId,
    name,
    status: 'completed',
    executedAt: new Date().toISOString(),
    results: executionResults,
    log: executionLog,
    summary: {
      totalNodes: nodes.length,
      executedNodes: executionResults.length,
      startingNodes: startingNodes.length
    }
  };
}

// Execute a chain of nodes starting from a given node
async function executeNodeChain(
  currentNode: any, 
  allNodes: any[], 
  allEdges: any[], 
  results: any[], 
  log: string[]
) {
  // Execute current node
  const result = await executeNode(currentNode);
  results.push(result);
  log.push(`Executed node: ${currentNode.data.label} (${currentNode.id})`);

  // Find next nodes
  const outgoingEdges = allEdges.filter((edge: any) => edge.source === currentNode.id);
  
  for (const edge of outgoingEdges) {
    const nextNode = allNodes.find((node: any) => node.id === edge.target);
    if (nextNode) {
      // Execute next node in the chain
      await executeNodeChain(nextNode, allNodes, allEdges, results, log);
    }
  }
}

// Execute individual node based on its type
async function executeNode(node: any) {
  const { id, data, type } = node;
  
  console.log(`Executing node: ${data.label} (Type: ${type || data.type})`);

  // Simulate execution delay
  await new Promise(resolve => setTimeout(resolve, 100));

  let result: any = {
    nodeId: id,
    nodeName: data.label,
    nodeType: type || data.type,
    executedAt: new Date().toISOString(),
    status: 'success'
  };

  // Execute based on node type
  switch (type || data.type) {
    case 'service':
      result = await executeServiceNode(node);
      break;
    case 'flowchart':
      result = await executeFlowchartNode(node);
      break;
    default:
      result.message = `Executed generic node: ${data.label}`;
      result.output = { message: 'Node executed successfully' };
  }

  return result;
}

// Execute service nodes (API calls, database operations, etc.)
async function executeServiceNode(node: any) {
  const { id, data } = node;
  
  let result = {
    nodeId: id,
    nodeName: data.label,
    nodeType: 'service',
    serviceType: data.type,
    executedAt: new Date().toISOString(),
    status: 'success',
    output: {} as any
  };

  switch (data.type) {
    case 'API Service':
      result.message = 'API call executed';
      result.output = { 
        endpoint: '/api/example', 
        method: 'GET', 
        status: 200, 
        data: { message: 'API response' } 
      };
      break;
      
    case 'Database Service':
      result.message = 'Database query executed';
      result.output = { 
        query: 'SELECT * FROM users', 
        rowCount: 5, 
        data: [{ id: 1, name: 'John Doe' }] 
      };
      break;
      
    case 'Processing Service':
      result.message = 'Data processing completed';
      result.output = { 
        processedItems: 10, 
        duration: '150ms',
        result: 'Processing completed successfully' 
      };
      break;
      
    case 'Notification Service':
      result.message = 'Notification sent';
      result.output = { 
        type: 'email', 
        recipient: 'user@example.com', 
        subject: 'Service Flow Notification' 
      };
      break;
      
    default:
      result.message = `Service executed: ${data.type}`;
      result.output = { message: 'Service executed successfully' };
  }

  return result;
}

// Execute flowchart nodes (logic, conditions, etc.)
async function executeFlowchartNode(node: any) {
  const { id, data } = node;
  
  let result = {
    nodeId: id,
    nodeName: data.label,
    nodeType: 'flowchart',
    shapeType: data.shape,
    executedAt: new Date().toISOString(),
    status: 'success',
    output: {} as any
  };

  switch (data.shape) {
    case 'diamond': // Decision node
      result.message = 'Decision evaluated';
      result.output = { 
        condition: 'x > 5', 
        result: true, 
        branch: 'true' 
      };
      break;
      
    case 'rectangle': // Process node
      result.message = 'Process executed';
      result.output = { 
        operation: 'Data transformation', 
        input: 'raw data', 
        output: 'processed data' 
      };
      break;
      
    case 'circle': // Start/End node
      result.message = 'Flow control point reached';
      result.output = { 
        type: 'control', 
        action: 'checkpoint' 
      };
      break;
      
    default:
      result.message = `Flowchart node executed: ${data.shape}`;
      result.output = { message: 'Flowchart node processed' };
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const flowData = await request.json();
    
    if (!flowData.nodes || !Array.isArray(flowData.nodes)) {
      return NextResponse.json(
        { error: 'Invalid flow data: nodes array is required' }, 
        { status: 400 }
      );
    }

    if (!flowData.edges || !Array.isArray(flowData.edges)) {
      return NextResponse.json(
        { error: 'Invalid flow data: edges array is required' }, 
        { status: 400 }
      );
    }

    console.log('Executing flow:', flowData.name);
    
    const executionResult = await executeFlow(flowData);

    return NextResponse.json({
      success: true,
      execution: executionResult,
      message: 'Flow executed successfully'
    });

  } catch (error: any) {
    console.error('Flow execution error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Flow execution failed',
      details: error.stack
    }, { status: 500 });
  }
}