import React, { useState, useRef, useEffect } from 'react';
import { Play, Save, Clock, Download, FileText, Loader2 } from 'lucide-react';
import { useDatabase } from '@/contexts/DatabaseContext';

interface QueryResult {
  success: boolean;
  data?: any[];
  columns?: string[];
  rowsAffected: number;
  executionTime: string;
  error?: string;
}

interface QueryEditorProps {
  connectionId: number;
  onSaveQuery?: (queryData: { name: string; query: string; description?: string }) => void;
  initialQuery?: string;
}

const QueryEditor: React.FC<QueryEditorProps> = ({ connectionId, onSaveQuery, initialQuery = '' }) => {
  const { executeQuery, isLoading } = useDatabase();
  const [query, setQuery] = useState(initialQuery);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [queryDescription, setQueryDescription] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Update query when initialQuery changes
  useEffect(() => {
    if (initialQuery !== query) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleExecuteQuery = async () => {
    if (!query.trim()) {
      setResult({
        success: false,
        error: 'Please enter a SQL query',
        rowsAffected: 0,
        executionTime: '0ms'
      });
      return;
    }

    setIsExecuting(true);
    try {
      const startTime = Date.now();
      const queryResult = await executeQuery(connectionId, query.trim());
      const executionTime = `${Date.now() - startTime}ms`;
      
      setResult({
        ...queryResult,
        executionTime
      });
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || 'Query execution failed',
        rowsAffected: 0,
        executionTime: '0ms'
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSaveQuery = () => {
    if (!query.trim()) return;
    
    if (onSaveQuery && queryName.trim()) {
      onSaveQuery({
        name: queryName.trim(),
        query: query.trim(),
        description: queryDescription.trim() || undefined
      });
      setShowSaveModal(false);
      setQueryName('');
      setQueryDescription('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Execute query with Ctrl/Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecuteQuery();
    }
    
    // Add tab functionality
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newQuery = query.substring(0, start) + '  ' + query.substring(end);
        setQuery(newQuery);
        
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
    }
  };

  const exportToCSV = () => {
    if (!result?.success || !result.data) return;

    const headers = result.columns || Object.keys(result.data[0] || {});
    const csvContent = [
      headers.join(','),
      ...result.data.map(row => 
        headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          if (typeof value === 'string' && (value.includes(',') || value.includes('\n') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `query_result_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Query Editor Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">SQL Query Editor</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          {result?.success && result.data && (
            <button
              onClick={exportToCSV}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Export CSV</span>
            </button>
          )}
          
          <button
            onClick={() => setShowSaveModal(true)}
            disabled={!query.trim()}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>Save</span>
          </button>
          
          <button
            onClick={handleExecuteQuery}
            disabled={isExecuting || !query.trim()}
            className="flex items-center space-x-1 px-4 py-1.5 text-sm bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isExecuting ? 'Executing...' : 'Execute'}</span>
            <span className="text-xs opacity-70">(Ctrl+Enter)</span>
          </button>
        </div>
      </div>

      {/* Query Editor */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-4">
          <textarea
            ref={textareaRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your SQL query here... (Press Ctrl+Enter to execute)"
            className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 rounded-lg font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white resize-none"
            style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
          />
        </div>

        {/* Query Results */}
        {result && (
          <div className="border-t border-slate-200 dark:border-slate-700">
            {/* Result Header */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {result.success ? 'Success' : 'Error'}
                  </span>
                </div>
                
                {result.success && (
                  <>
                    <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
                      <Clock className="h-4 w-4" />
                      <span>{result.executionTime}</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {result.data ? `${result.data.length} rows` : `${result.rowsAffected} rows affected`}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Result Content */}
            <div className="max-h-96 overflow-auto">
              {result.success ? (
                result.data && result.data.length > 0 ? (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                      <tr>
                        {(result.columns || Object.keys(result.data[0])).map((column) => (
                          <th
                            key={column}
                            className="px-4 py-2 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((row, index) => (
                        <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          {(result.columns || Object.keys(row)).map((column) => (
                            <td
                              key={column}
                              className="px-4 py-2 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700"
                            >
                              {row[column] === null ? (
                                <span className="text-slate-400 italic">NULL</span>
                              ) : (
                                String(row[column])
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-slate-600 dark:text-slate-400">
                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Query executed successfully but returned no data.</p>
                    <p className="text-sm mt-1">{result.rowsAffected} rows affected</p>
                  </div>
                )
              ) : (
                <div className="p-6 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                  <div className="font-mono text-sm whitespace-pre-wrap">{result.error}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Save Query Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Save Query</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Save this query for future use
              </p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Query Name *
                </label>
                <input
                  type="text"
                  value={queryName}
                  onChange={(e) => setQueryName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                  placeholder="Enter query name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={queryDescription}
                  onChange={(e) => setQueryDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white resize-none"
                  placeholder="Enter query description..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveQuery}
                disabled={!queryName.trim()}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Query
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryEditor;