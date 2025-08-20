import React from 'react';
import { 
  Circle, 
  Database, 
  Edit2, 
  Trash2, 
  Play, 
  RefreshCw, 
  Eye,
  Clock
} from 'lucide-react';
import { DatabaseConnection } from '@/contexts/DatabaseContext';

interface DatabaseConnectionCardProps {
  connection: DatabaseConnection;
  onEdit: (connection: DatabaseConnection) => void;
  onDelete: (id: number) => void;
  onTest: (connection: DatabaseConnection) => void;
  onConnect: (connection: DatabaseConnection) => void;
  onViewTables: (connection: DatabaseConnection) => void;
  isLoading?: boolean;
}

const DatabaseConnectionCard: React.FC<DatabaseConnectionCardProps> = ({
  connection,
  onEdit,
  onDelete,
  onTest,
  onConnect,
  onViewTables,
  isLoading = false
}) => {
  const getStatusColor = (status: DatabaseConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'text-green-500 fill-current';
      case 'disconnected':
        return 'text-gray-400 fill-current';
      case 'testing':
        return 'text-yellow-500 fill-current animate-pulse';
      case 'error':
        return 'text-red-500 fill-current';
      default:
        return 'text-gray-400 fill-current';
    }
  };

  const getStatusText = (status: DatabaseConnection['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'testing':
        return 'Testing...';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  const getTypeIcon = () => {
    return <Database className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            {getTypeIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {connection.name}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {connection.type.toUpperCase()} • {connection.host}:{connection.port}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Circle className={`h-3 w-3 ${getStatusColor(connection.status)}`} />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {getStatusText(connection.status)}
          </span>
        </div>
      </div>

      <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">
        <div>Database: <span className="font-medium">{connection.database}</span></div>
        <div>User: <span className="font-medium">{connection.username}</span></div>
        {connection.lastConnected && (
          <div className="flex items-center space-x-1 mt-1">
            <Clock className="h-3 w-3" />
            <span>Last connected: {new Date(connection.lastConnected).toLocaleString()}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => onTest(connection)}
            disabled={isLoading || connection.status === 'testing'}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title="Test Connection"
          >
            {connection.status === 'testing' ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </button>
          
          {connection.status === 'connected' && (
            <button
              onClick={() => onViewTables(connection)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="View Tables"
            >
              <Eye className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(connection)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit Connection"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(connection.id)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Connection"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DatabaseConnectionCard;