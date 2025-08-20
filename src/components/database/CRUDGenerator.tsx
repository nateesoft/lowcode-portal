import React, { useState, useEffect } from 'react';
import { Code, Eye, Download, Settings, CheckSquare, Square, Play, Loader2 } from 'lucide-react';
import { useDatabase, DatabaseTable, DatabaseColumn } from '@/contexts/DatabaseContext';
import ComponentCreator from './ComponentCreator';

interface CRUDPreview {
  tableName: string;
  columns: DatabaseColumn[];
  sampleData: any[];
  totalRows: number;
  generatedQueries: {
    create: string;
    read: string;
    update: string;
    delete: string;
  };
}

interface CRUDGeneratorProps {
  connectionId: number;
  tables: DatabaseTable[];
  onGenerateComponent?: (preview: CRUDPreview) => void;
}

const CRUDGenerator: React.FC<CRUDGeneratorProps> = ({ 
  connectionId, 
  tables,
  onGenerateComponent 
}) => {
  const { executeQuery, isLoading } = useDatabase();
  const [selectedTable, setSelectedTable] = useState<DatabaseTable | null>(null);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [componentName, setComponentName] = useState('');
  const [preview, setPreview] = useState<CRUDPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showComponentCreator, setShowComponentCreator] = useState(false);

  // Auto-select all columns when table changes
  useEffect(() => {
    if (selectedTable) {
      setSelectedColumns(selectedTable.columns.map(col => col.name));
      setComponentName(`${selectedTable.name.charAt(0).toUpperCase() + selectedTable.name.slice(1)}Manager`);
    } else {
      setSelectedColumns([]);
      setComponentName('');
    }
    setPreview(null);
    setError(null);
  }, [selectedTable]);

  const handleColumnToggle = (columnName: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnName)
        ? prev.filter(col => col !== columnName)
        : [...prev, columnName]
    );
  };

  const handleSelectAllColumns = () => {
    if (!selectedTable) return;
    
    if (selectedColumns.length === selectedTable.columns.length) {
      setSelectedColumns([]);
    } else {
      setSelectedColumns(selectedTable.columns.map(col => col.name));
    }
  };

  const generateCRUDPreview = async () => {
    if (!selectedTable || selectedColumns.length === 0) {
      setError('Please select a table and at least one column');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // Generate CRUD operations manually since we don't have the specific API endpoint
      const queries = generateCRUDQueries(selectedTable.name, selectedColumns, selectedTable.columns);
      
      // Get sample data
      const sampleResult = await executeQuery(connectionId, `SELECT * FROM ${selectedTable.name} LIMIT 5`);
      const sampleData = sampleResult.success ? sampleResult.data || [] : [];
      
      // Get total row count
      const countResult = await executeQuery(connectionId, `SELECT COUNT(*) as total FROM ${selectedTable.name}`);
      let totalRows = 0;
      if (countResult.success && countResult.data && countResult.data.length > 0) {
        totalRows = countResult.data[0].total || countResult.data[0].count || 0;
      }

      const crudPreview: CRUDPreview = {
        tableName: selectedTable.name,
        columns: selectedTable.columns.filter(col => selectedColumns.includes(col.name)),
        sampleData: sampleData,
        totalRows: totalRows,
        generatedQueries: queries
      };

      setPreview(crudPreview);
    } catch (err: any) {
      setError(err.message || 'Failed to generate CRUD preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCRUDQueries = (tableName: string, columns: string[], tableColumns: DatabaseColumn[]) => {
    const primaryKey = tableColumns.find(col => col.isPrimary)?.name || 'id';
    const columnsList = columns.join(', ');
    const valuesPlaceholder = columns.map(() => '?').join(', ');
    const updateSet = columns.filter(col => col !== primaryKey).map(col => `${col} = ?`).join(', ');
    
    return {
      create: `INSERT INTO ${tableName} (${columnsList}) VALUES (${valuesPlaceholder})`,
      read: `SELECT ${columnsList} FROM ${tableName}`,
      update: `UPDATE ${tableName} SET ${updateSet} WHERE ${primaryKey} = ?`,
      delete: `DELETE FROM ${tableName} WHERE ${primaryKey} = ?`,
    };
  };

  const downloadQuery = (queryType: string, query: string) => {
    const blob = new Blob([query], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${selectedTable?.name}_${queryType.toLowerCase()}.sql`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGenerateComponent = () => {
    if (preview && onGenerateComponent) {
      onGenerateComponent(preview);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
            <Code className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">CRUD Generator</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Generate Create, Read, Update, Delete operations for your tables
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 h-full">
          {/* Configuration Panel */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Configuration</h3>
              
              {/* Table Selection */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Select Table
                  </label>
                  <select
                    value={selectedTable?.id || ''}
                    onChange={(e) => {
                      const table = tables.find(t => t.id === Number(e.target.value));
                      setSelectedTable(table || null);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                  >
                    <option value="">Choose a table...</option>
                    {tables.map((table) => (
                      <option key={table.id} value={table.id}>
                        {table.name} ({table.columns.length} columns, {table.rowCount} rows)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Component Name */}
                {selectedTable && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Component Name
                    </label>
                    <input
                      type="text"
                      value={componentName}
                      onChange={(e) => setComponentName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter component name..."
                    />
                  </div>
                )}

                {/* Column Selection */}
                {selectedTable && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Select Columns ({selectedColumns.length}/{selectedTable.columns.length})
                      </label>
                      <button
                        onClick={handleSelectAllColumns}
                        className="flex items-center space-x-1 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300"
                      >
                        {selectedColumns.length === selectedTable.columns.length ? (
                          <>
                            <CheckSquare className="h-4 w-4" />
                            <span>Deselect All</span>
                          </>
                        ) : (
                          <>
                            <Square className="h-4 w-4" />
                            <span>Select All</span>
                          </>
                        )}
                      </button>
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-600 rounded-lg">
                      {selectedTable.columns.map((column) => (
                        <label
                          key={column.name}
                          className="flex items-center space-x-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedColumns.includes(column.name)}
                            onChange={() => handleColumnToggle(column.name)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {column.name}
                              </span>
                              {column.isPrimary && (
                                <span className="px-1.5 py-0.5 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded">
                                  PK
                                </span>
                              )}
                              {column.isIndex && (
                                <span className="px-1.5 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                                  IDX
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-600 dark:text-slate-400">
                              {column.type}{column.length ? `(${column.length})` : ''} • {column.nullable ? 'NULL' : 'NOT NULL'}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                {selectedTable && selectedColumns.length > 0 && (
                  <button
                    onClick={generateCRUDPreview}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4" />
                        <span>Generate Preview</span>
                      </>
                    )}
                  </button>
                )}

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {preview ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preview</h3>
                  <button
                    onClick={() => setShowComponentCreator(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    <Code className="h-4 w-4" />
                    <span>Create Component</span>
                  </button>
                </div>

                {/* Table Info */}
                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-2">
                    Table: {preview.tableName}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Columns:</span>
                      <span className="ml-2 font-medium">{preview.columns.length}</span>
                    </div>
                    <div>
                      <span className="text-slate-600 dark:text-slate-400">Total Rows:</span>
                      <span className="ml-2 font-medium">{preview.totalRows.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Sample Data */}
                {preview.sampleData.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Sample Data</h4>
                    <div className="overflow-auto max-h-64 border border-slate-200 dark:border-slate-600 rounded-lg">
                      <table className="w-full text-sm">
                        <thead className="bg-slate-100 dark:bg-slate-700 sticky top-0">
                          <tr>
                            {preview.columns.map((column) => (
                              <th
                                key={column.name}
                                className="px-3 py-2 text-left font-medium text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-600"
                              >
                                {column.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {preview.sampleData.slice(0, 5).map((row, index) => (
                            <tr key={index} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                              {preview.columns.map((column) => (
                                <td
                                  key={column.name}
                                  className="px-3 py-2 text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-700"
                                >
                                  {row[column.name] === null ? (
                                    <span className="text-slate-400 italic">NULL</span>
                                  ) : (
                                    String(row[column.name])
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Generated Queries */}
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-3">Generated SQL Queries</h4>
                  <div className="space-y-3">
                    {Object.entries(preview.generatedQueries).map(([type, query]) => (
                      <div key={type} className="border border-slate-200 dark:border-slate-600 rounded-lg">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-600">
                          <span className="font-medium text-slate-900 dark:text-white capitalize">
                            {type}
                          </span>
                          <button
                            onClick={() => downloadQuery(type, query)}
                            className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                          >
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </button>
                        </div>
                        <div className="p-3">
                          <code className="text-sm font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
                            {query}
                          </code>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-slate-600 dark:text-slate-400">
                <Settings className="h-12 w-12 mb-3 opacity-50" />
                <p className="text-lg font-medium mb-2">No Preview Generated</p>
                <p className="text-sm text-center">
                  Select a table and columns, then click "Generate Preview" to see the CRUD operations
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Component Creator Modal */}
      {showComponentCreator && preview && (
        <ComponentCreator
          preview={preview}
          onClose={() => setShowComponentCreator(false)}
          onComponentCreated={(component) => {
            console.log('Component created:', component);
            setShowComponentCreator(false);
            // Here you would typically save the component to your system
            // or integrate with the drag-and-drop builder
            onGenerateComponent?.(preview);
          }}
        />
      )}
    </div>
  );
};

export default CRUDGenerator;