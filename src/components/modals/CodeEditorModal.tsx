import React, { useState, useEffect } from 'react';
import { X, Play, Download, Copy, Save, Settings, Terminal, FileCode, Eye, EyeOff, Maximize2, Minimize2, Move } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';

interface CodeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
  onSaveCode?: (nodeId: string, code: string, language: string) => void;
}

const CodeEditorModal: React.FC<CodeEditorModalProps> = ({
  isOpen,
  onClose,
  nodeData,
  onSaveCode,
}) => {
  const [activeTab, setActiveTab] = useState('editor');
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState(nodeData?.targetLanguage || 'javascript');
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isResizing,
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    resizeHandles,
    handleMouseDown, 
    handleResizeMouseDown,
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();

  useEffect(() => {
    if (nodeData && isOpen) {
      setLanguage(nodeData.language || nodeData.targetLanguage || 'javascript');
      // Use existing code or generate new code
      if (nodeData.code) {
        setCode(nodeData.code);
        setOutput(`Code loaded from node: ${nodeData.label || nodeData.id}\nLanguage: ${nodeData.language || 'javascript'}\nLength: ${nodeData.code.length} characters\n`);
      } else {
        generateCodeFromNode();
        setOutput('Generated new code for this node. Click Save to store it.\n');
      }
      resetPosition();
    }
  }, [nodeData, isOpen, resetPosition]);

  const generateCodeFromNode = () => {
    if (!nodeData) return;

    let generatedCode = '';
    const isService = !!nodeData.type;
    const isFlowchart = !!nodeData.shape;

    if (isService) {
      generatedCode = generateServiceCode();
    } else if (isFlowchart) {
      generatedCode = generateFlowchartCode();
    }

    setCode(generatedCode);
  };

  const generateServiceCode = () => {
    const serviceName = nodeData.label || 'Service';
    const endpoint = nodeData.endpoint || 'https://api.example.com/data';
    const method = nodeData.method || 'GET';

    switch (language) {
      case 'javascript':
      case 'typescript':
        return `// ${serviceName} - ${nodeData.type}
async function ${serviceName.replace(/\s+/g, '').toLowerCase()}Service() {
  try {
    const response = await fetch('${endpoint}', {
      method: '${method}',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN_HERE'
      }${method === 'POST' || method === 'PUT' || method === 'PATCH' ? ',\n      body: JSON.stringify(data)' : ''}
    });
    
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    
    const result = await response.json();
    console.log('${serviceName} result:', result);
    return result;
  } catch (error) {
    console.error('${serviceName} error:', error);
    throw error;
  }
}

// Usage example
${serviceName.replace(/\s+/g, '').toLowerCase()}Service()
  .then(data => {
    // Handle success
    console.log('Data received:', data);
  })
  .catch(error => {
    // Handle error
    console.error('Service call failed:', error);
  });`;

      case 'python':
        return `# ${serviceName} - ${nodeData.type}
import requests
import json

def ${serviceName.replace(/\s+/g, '_').lower()}_service():
    """
    ${nodeData.description || `Call ${serviceName} service`}
    """
    try:
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer YOUR_TOKEN_HERE'
        }
        
        response = requests.${method.toLowerCase()}('${endpoint}', headers=headers${method === 'POST' || method === 'PUT' || method === 'PATCH' ? ', json=data' : ''})
        response.raise_for_status()
        
        result = response.json()
        print(f'${serviceName} result: {result}')
        return result
        
    except requests.exceptions.RequestException as error:
        print(f'${serviceName} error: {error}')
        raise error

# Usage example
if __name__ == "__main__":
    try:
        data = ${serviceName.replace(/\s+/g, '_').lower()}_service()
        print("Data received:", data)
    except Exception as error:
        print("Service call failed:", error)`;

      default:
        return `// ${serviceName} - ${nodeData.type}
// Generated code for ${language}
// Implementation depends on specific language and framework`;
    }
  };

  const generateFlowchartCode = () => {
    const shapeName = nodeData.label || 'Process';
    const condition = nodeData.condition || '';

    switch (language) {
      case 'javascript':
      case 'typescript':
        if (nodeData.shape === 'diamond') {
          return `// Decision: ${shapeName}
function ${shapeName.replace(/\s+/g, '').toLowerCase()}Decision(${condition ? 'input' : 'data'}) {
  // Decision logic for: ${shapeName}
  ${condition ? `const condition = ${condition.replace(/\./g, '.input.')};` : 'const condition = data.someProperty;'}
  
  if (condition) {
    console.log('Condition is true, proceeding with YES branch');
    return 'YES';
  } else {
    console.log('Condition is false, proceeding with NO branch');
    return 'NO';
  }
}

// Usage example
const input = { /* your data here */ };
const decision = ${shapeName.replace(/\s+/g, '').toLowerCase()}Decision(input);
console.log('Decision result:', decision);`;
        } else {
          return `// Process: ${shapeName}
function ${shapeName.replace(/\s+/g, '').toLowerCase()}Process(data) {
  // Process logic for: ${shapeName}
  console.log('Processing:', data);
  
  // Add your business logic here
  const processedData = {
    ...data,
    processed: true,
    processedAt: new Date().toISOString(),
    processedBy: '${shapeName}'
  };
  
  console.log('Process completed:', processedData);
  return processedData;
}

// Usage example
const inputData = { /* your data here */ };
const result = ${shapeName.replace(/\s+/g, '').toLowerCase()}Process(inputData);
console.log('Process result:', result);`;
        }

      case 'python':
        if (nodeData.shape === 'diamond') {
          return `# Decision: ${shapeName}
def ${shapeName.replace(/\s+/g, '_').lower()}_decision(${condition ? 'input_data' : 'data'}):
    """
    Decision logic for: ${shapeName}
    ${nodeData.description || ''}
    """
    # Decision logic for: ${shapeName}
    ${condition ? `condition = ${condition.replace(/\./g, '.input_data.')}` : 'condition = data.get("some_property")'}
    
    if condition:
        print("Condition is true, proceeding with YES branch")
        return "YES"
    else:
        print("Condition is false, proceeding with NO branch")
        return "NO"

# Usage example
if __name__ == "__main__":
    input_data = {}  # your data here
    decision = ${shapeName.replace(/\s+/g, '_').lower()}_decision(input_data)
    print("Decision result:", decision)`;
        } else {
          return `# Process: ${shapeName}
def ${shapeName.replace(/\s+/g, '_').lower()}_process(data):
    """
    Process logic for: ${shapeName}
    ${nodeData.description || ''}
    """
    print("Processing:", data)
    
    # Add your business logic here
    processed_data = {
        **data,
        "processed": True,
        "processed_at": datetime.now().isoformat(),
        "processed_by": "${shapeName}"
    }
    
    print("Process completed:", processed_data)
    return processed_data

# Usage example
if __name__ == "__main__":
    input_data = {}  # your data here
    result = ${shapeName.replace(/\s+/g, '_').lower()}_process(input_data)
    print("Process result:", result)`;
        }

      default:
        return `// ${shapeName} - ${nodeData.shape}
// Generated code for ${language}
// Implementation depends on specific language and framework`;
    }
  };

  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput('Running code...\n');
    
    // Simulate code execution
    setTimeout(() => {
      setOutput(prev => prev + `\n✓ Code executed successfully
📊 Output:
${JSON.stringify({
        nodeId: nodeData?.id || 'unknown',
        nodeName: nodeData?.label || 'Unknown',
        language: language,
        timestamp: new Date().toISOString()
      }, null, 2)}

🎉 Execution completed in 1.2s`);
      setIsRunning(false);
    }, 1200);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setOutput(prev => prev + '\n📋 Code copied to clipboard!');
    } catch (err) {
      setOutput(prev => prev + '\n❌ Failed to copy code');
    }
  };

  const handleSaveCode = () => {
    // Save code to node data if callback is provided
    if (onSaveCode && nodeData?.id) {
      onSaveCode(nodeData.id, code, language);
      setOutput(prev => prev + '\n💾 Code saved to node successfully!');
    }

    // Also save as file
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nodeData?.label?.replace(/\s+/g, '_') || 'code'}.${getFileExtension()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setOutput(prev => prev + '\n💾 Code file downloaded successfully!');
  };

  const getFileExtension = () => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      csharp: 'cs',
      go: 'go'
    };
    return extensions[language] || 'txt';
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'editor', name: 'Code Editor', icon: FileCode },
    { id: 'output', name: 'Output', icon: Terminal },
    { id: 'settings', name: 'Settings', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[10001] p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
        style={modalStyle}
      >
        {/* Resize Handles */}
        {!isFullscreen && resizeHandles.map((handle) => (
          <div
            key={handle.direction}
            style={handle.style}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
            className="hover:bg-blue-500 hover:opacity-50 transition-colors"
          />
        ))}
        {/* Header */}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-slate-50 dark:bg-gradient-to-r dark:from-green-900/20 dark:to-slate-900"
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileCode className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Code Editor
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {nodeData?.label || 'Node'} - {language.toUpperCase()} Code {nodeData?.code ? 'Editor' : 'Generation'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRunCode}
              disabled={isRunning}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isRunning ? 'Running...' : 'Run Code'}</span>
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="flex items-center text-slate-400 px-2">
              <Move className="h-4 w-4" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-green-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-green-900/20">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'editor' && (
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-100 to-blue-50 dark:bg-gradient-to-r dark:from-slate-800 dark:to-blue-900/30">
                <div className="flex items-center space-x-4">
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      // Update nodeData if needed
                    }}
                    className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                  </select>
                  <button
                    onClick={() => setShowLineNumbers(!showLineNumbers)}
                    className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    {showLineNumbers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    <span>Line Numbers</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopyCode}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <Copy className="h-4 w-4" />
                    <span>Copy</span>
                  </button>
                  <button
                    onClick={handleSaveCode}
                    className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full h-full resize-none font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-green-500 focus:border-transparent bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                  style={{ 
                    lineHeight: '1.5',
                    tabSize: 2
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'output' && (
            <div className="h-full p-4">
              <pre className="w-full h-full font-mono text-sm bg-slate-900 text-green-400 p-4 rounded-lg overflow-auto">
                {output || 'No output yet. Click "Run Code" to execute.'}
              </pre>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="h-full p-6 overflow-y-auto">
              <div className="max-w-2xl space-y-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Code Generation Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Default Language
                    </label>
                    <select className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                      <option>JavaScript</option>
                      <option>TypeScript</option>
                      <option>Python</option>
                      <option>Java</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Auto-generate code on node selection</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded border-slate-300" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Include error handling</span>
                    </label>
                  </div>
                  
                  <div>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded border-slate-300" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">Include usage examples</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CodeEditorModal;