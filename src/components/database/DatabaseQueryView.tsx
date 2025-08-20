import React, { useState } from 'react';
import { Database, Terminal, History, Maximize2, Minimize2 } from 'lucide-react';
import { useDatabase, DatabaseConnection } from '@/contexts/DatabaseContext';
import QueryEditor from './QueryEditor';
import QueryManager from './QueryManager';

interface DatabaseQueryViewProps {
  connection: DatabaseConnection;
}

const DatabaseQueryView: React.FC<DatabaseQueryViewProps> = ({ connection }) => {
  const { saveQuery } = useDatabase();
  const [showQueryManager, setShowQueryManager] = useState(true);
  const [editorQuery, setEditorQuery] = useState('');

  const handleSaveQuery = async (queryData: { name: string; query: string; description?: string }) => {
    try {
      await saveQuery(connection.id, {
        name: queryData.name,
        query: queryData.query,
        description: queryData.description,
        isFavorite: false,
        tags: []
      });
      // You could show a success toast notification here
    } catch (error) {
      console.error('Failed to save query:', error);
      // You could show an error toast notification here
    }
  };

  const handleQuerySelect = (query: string) => {
    setEditorQuery(query);
  };

  const handleQueryExecute = (query: string) => {
    setEditorQuery(query);
    // The QueryEditor will need a way to trigger execution
    // For now, we'll just load it in the editor
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <Terminal className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Query Console
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Connected to: {connection.name}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 text-sm text-slate-600 dark:text-slate-400">
            <div className={`w-2 h-2 rounded-full ${
              connection.status === 'connected' ? 'bg-green-500' : 
              connection.status === 'testing' ? 'bg-yellow-500' : 'bg-red-500'
            }`} />
            <span className="capitalize">{connection.status}</span>
          </div>

          <button
            onClick={() => setShowQueryManager(!showQueryManager)}
            className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg transition-colors"
          >
            <History className="h-4 w-4" />
            <span>{showQueryManager ? 'Hide' : 'Show'} Queries</span>
            {showQueryManager ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Query Editor */}
        <div className={`${showQueryManager ? 'flex-1' : 'w-full'} flex flex-col`}>
          <div className="h-full">
            <QueryEditor
              connectionId={connection.id}
              onSaveQuery={handleSaveQuery}
              initialQuery={editorQuery}
            />
          </div>
        </div>

        {/* Query Manager Sidebar */}
        {showQueryManager && (
          <div className="w-80 border-l border-slate-200 dark:border-slate-700">
            <QueryManager
              connectionId={connection.id}
              onQuerySelect={handleQuerySelect}
              onQueryExecute={handleQueryExecute}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DatabaseQueryView;