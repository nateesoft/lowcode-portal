import { Node, Edge } from 'reactflow';
import { ExecutionResult, ExecutionStep } from '../types';

export const executeNode = async (node: Node): Promise<ExecutionResult> => {
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

export const buildExecutionGraph = (nodes: Node[], edges: Edge[]) => {
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

export const executeNodeChain = async (
  node: Node, 
  graph: { [nodeId: string]: string[] }, 
  results: ExecutionResult[], 
  steps: ExecutionStep[],
  nodes: Node[],
  setExecutingNodeId: (id: string | null) => void
) => {
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
      await executeNodeChain(connectedNode, graph, results, steps, nodes, setExecutingNodeId);
    }
  }
};

export const generatePreviewHTML = (results: ExecutionResult[], steps: ExecutionStep[]): string => {
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