import { Node, Edge } from 'reactflow';
import { WebsiteStructure, WebsiteTemplate } from '../types';
import { websiteTemplates } from '../templates';

// Helper function to check if node is a Page type
export const isPageNode = (node: Node): boolean => {
  return node.data.label === 'Page' || 
         node.data.label === 'UI Component' || 
         node.data.label === 'Button' || 
         node.data.label === 'Form' ||
         node.data.label === 'Display' ||
         node.data.label === 'Chart' ||
         node.data.label === 'Table';
};

// Helper function to check if node is a Service type
export const isServiceNode = (node: Node): boolean => {
  return node.data.label === 'Service' || 
         node.data.label === 'API Call' || 
         node.data.label === 'Database' ||
         node.data.label === 'Logic' ||
         node.data.label === 'Transform' ||
         node.data.label === 'Function';
};

export const buildWebsiteStructure = (nodes: Node[], edges: Edge[]): WebsiteStructure => {
  const structure: WebsiteStructure = {};
  
  // Build page structure - include only Page nodes for website generation
  nodes.forEach(node => {
    if (!node.data.isGroup && isPageNode(node)) {
      // Find connections that lead to other Page nodes
      const pageConnections = edges
        .filter(edge => edge.source === node.id)
        .map(edge => edge.target)
        .filter(targetId => {
          const targetNode = nodes.find(n => n.id === targetId);
          return targetNode && isPageNode(targetNode);
        });
      
      structure[node.id] = {
        node,
        connections: pageConnections
      };
    }
  });
  
  return structure;
};

// Background processing for Service nodes
export const processServiceNodes = async (nodes: Node[], edges: Edge[]): Promise<{ [nodeId: string]: any }> => {
  const serviceResults: { [nodeId: string]: any } = {};
  
  // Find all Service nodes
  const serviceNodes = nodes.filter(node => !node.data.isGroup && isServiceNode(node));
  
  // Process each Service node in background
  for (const serviceNode of serviceNodes) {
    console.log(`🔄 Processing Service: ${serviceNode.data.label} (${serviceNode.id})`);
    
    try {
      // Simulate background processing with realistic timing
      const result = await simulateServiceExecution(serviceNode);
      serviceResults[serviceNode.id] = result;
      
      console.log(`✅ Service completed: ${serviceNode.data.label}`, result);
    } catch (error) {
      console.error(`❌ Service failed: ${serviceNode.data.label}`, error);
      serviceResults[serviceNode.id] = { error: error, status: 'failed' };
    }
  }
  
  return serviceResults;
};

// Simulate service execution
const simulateServiceExecution = async (serviceNode: Node): Promise<any> => {
  const serviceType = serviceNode.data.label;
  
  // Random delay between 500ms to 2000ms to simulate real processing
  const delay = Math.random() * 1500 + 500;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  switch (serviceType) {
    case 'Service':
      return {
        status: 'running',
        message: 'Background service is running',
        timestamp: new Date().toISOString(),
        data: { processId: Math.random().toString(36).substr(2, 9) }
      };
    
    case 'API Call':
      return {
        status: 'success',
        response: { 
          data: { message: 'API call successful', id: Math.floor(Math.random() * 1000) },
          statusCode: 200 
        },
        url: serviceNode.data.url || 'https://api.example.com',
        method: serviceNode.data.method || 'GET'
      };
    
    case 'Database':
      return {
        status: 'connected',
        query: serviceNode.data.query || 'SELECT * FROM users',
        rowsAffected: Math.floor(Math.random() * 100),
        executionTime: `${delay.toFixed(0)}ms`
      };
    
    case 'Logic':
    case 'Transform':
    case 'Function':
      return {
        status: 'executed',
        input: serviceNode.data.input || 'Sample input',
        output: `Processed: ${serviceNode.data.label} result`,
        executionTime: `${delay.toFixed(0)}ms`
      };
    
    default:
      return {
        status: 'completed',
        message: `${serviceType} executed successfully`,
        timestamp: new Date().toISOString()
      };
  }
};

export const generateWebsitePages = (structure: WebsiteStructure, template: WebsiteTemplate) => {
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

export const generateFallbackPage = (node: Node, connections: string[], structure: WebsiteStructure): string => {
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

export const generateNodePage = (node: Node, connections: string[], structure: WebsiteStructure, template: WebsiteTemplate): string => {
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
  let pageContent = generatePageContent(nodeType, node, textContent, primaryColor, isDark);

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

const generatePageContent = (nodeType: string, node: any, textContent: string, primaryColor: string, isDark: boolean): string => {
  switch (nodeType) {
    case 'UI Component':
    case 'Button':
      return `
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
      
    case 'Form':
      return `
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
      
    case 'API Call':
      return `
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

    default:
      return `
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
};

export const generateIndexPage = (pages: { [nodeId: string]: string }, startingNode: Node): string => {
  return pages[startingNode.id] || '';
};