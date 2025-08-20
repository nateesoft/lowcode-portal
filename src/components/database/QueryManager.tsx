import React, { useState, useEffect } from 'react';
import { Search, Star, Trash2, Edit3, Copy, Calendar, Clock, Play } from 'lucide-react';
import { useDatabase, DatabaseQuery } from '@/contexts/DatabaseContext';

interface QueryManagerProps {
  connectionId: number;
  onQuerySelect: (query: string) => void;
  onQueryExecute?: (query: string) => void;
}

const QueryManager: React.FC<QueryManagerProps> = ({ 
  connectionId, 
  onQuerySelect,
  onQueryExecute 
}) => {
  const { savedQueries, loadSavedQueries, deleteQuery, isLoading } = useDatabase();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'lastExecuted' | 'createdAt'>('createdAt');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState<DatabaseQuery | null>(null);

  // Load saved queries when component mounts or connectionId changes
  useEffect(() => {
    if (connectionId) {
      loadSavedQueries(connectionId);
    }
  }, [connectionId, loadSavedQueries]);

  // Filter and sort queries
  const filteredQueries = savedQueries
    .filter(query => query.connectionId === connectionId)
    .filter(query => {
      if (showFavoritesOnly && !query.isFavorite) return false;
      if (searchTerm) {
        return (
          query.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          query.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastExecuted':
          if (!a.lastExecuted && !b.lastExecuted) return 0;
          if (!a.lastExecuted) return 1;
          if (!b.lastExecuted) return -1;
          return new Date(b.lastExecuted).getTime() - new Date(a.lastExecuted).getTime();
        case 'createdAt':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const handleDeleteQuery = async (queryId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this query?')) {
      try {
        await deleteQuery(queryId);
      } catch (error) {
        console.error('Failed to delete query:', error);
      }
    }
  };

  const handleCopyQuery = (query: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(query);
    // You could show a toast notification here
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatExecutionTime = (milliseconds?: number) => {
    if (!milliseconds) return 'N/A';
    if (milliseconds < 1000) return `${milliseconds}ms`;
    return `${(milliseconds / 1000).toFixed(2)}s`;
  };

  return (
    <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Saved Queries
          </h3>
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {filteredQueries.length} queries
          </span>
        </div>

        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search queries..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-sm border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1 dark:bg-slate-700 dark:text-white"
              >
                <option value="createdAt">Sort by Created</option>
                <option value="name">Sort by Name</option>
                <option value="lastExecuted">Sort by Last Executed</option>
              </select>

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`flex items-center space-x-1 px-3 py-1 text-sm rounded-lg transition-colors ${
                  showFavoritesOnly
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                <Star className={`h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
                <span>Favorites</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Query List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
            <p>Loading queries...</p>
          </div>
        ) : filteredQueries.length === 0 ? (
          <div className="p-8 text-center text-slate-600 dark:text-slate-400">
            <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No queries found</p>
            {searchTerm && (
              <p className="text-sm mt-1">Try adjusting your search criteria</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-200 dark:divide-slate-700">
            {filteredQueries.map((query) => (
              <div
                key={query.id}
                className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                onClick={() => setSelectedQuery(selectedQuery?.id === query.id ? null : query)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {query.name}
                      </h4>
                      {query.isFavorite && (
                        <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />
                      )}
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {query.description || query.query.substring(0, 100) + '...'}
                    </p>

                    <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(query.createdAt)}</span>
                      </div>

                      {query.lastExecuted && (
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>Last run: {formatDate(query.lastExecuted)}</span>
                        </div>
                      )}

                      {query.executionTime && (
                        <span>{formatExecutionTime(query.executionTime)}</span>
                      )}
                    </div>

                    {query.tags && query.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {query.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuerySelect(query.query);
                      }}
                      className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                      title="Load query"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {onQueryExecute && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQueryExecute(query.query);
                        }}
                        className="p-1.5 text-slate-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                        title="Execute query"
                      >
                        <Play className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      onClick={(e) => handleCopyQuery(query.query, e)}
                      className="p-1.5 text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded transition-colors"
                      title="Copy query"
                    >
                      <Copy className="h-4 w-4" />
                    </button>

                    <button
                      onClick={(e) => handleDeleteQuery(query.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                      title="Delete query"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Query Details */}
                {selectedQuery?.id === query.id && (
                  <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          SQL Query
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onQuerySelect(query.query)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Load in Editor
                          </button>
                          {onQueryExecute && (
                            <button
                              onClick={() => onQueryExecute(query.query)}
                              className="text-sm text-green-600 dark:text-green-400 hover:underline"
                            >
                              Execute
                            </button>
                          )}
                        </div>
                      </div>
                      <code className="text-sm text-slate-900 dark:text-white font-mono whitespace-pre-wrap block">
                        {query.query}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QueryManager;