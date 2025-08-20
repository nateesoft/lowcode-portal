import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

export interface DatabaseConnection {
  id: number;
  name: string;
  type: 'mysql' | 'postgresql';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastConnected?: string;
  lastTested?: string;
  lastError?: string;
  isActive: boolean;
  connectionConfig?: any;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
  connectionString: string;
  isConnected: boolean;
  needsReconnection: boolean;
}

export interface DatabaseTable {
  id: number;
  connectionId: number;
  name: string;
  schema?: string;
  columns: DatabaseColumn[];
  rowCount: number;
  size?: string;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  primaryKeyColumns: DatabaseColumn[];
  indexedColumns: DatabaseColumn[];
  nonNullableColumns: DatabaseColumn[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimary: boolean;
  isIndex: boolean;
  length?: number;
  comment?: string;
}

export interface DatabaseQuery {
  id: number;
  name: string;
  connectionId: number;
  query: string;
  description?: string;
  isFavorite: boolean;
  lastExecuted?: string;
  executionTime?: number;
  rowsAffected?: number;
  isActive: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

interface DatabaseContextType {
  connections: DatabaseConnection[];
  tables: DatabaseTable[];
  savedQueries: DatabaseQuery[];
  currentConnection: DatabaseConnection | null;
  isLoading: boolean;
  error: string | null;
  
  // Connection management
  loadConnections: () => Promise<void>;
  addConnection: (connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'connectionString' | 'isConnected' | 'needsReconnection' | 'status' | 'isActive'>) => Promise<void>;
  updateConnection: (id: number, updates: Partial<DatabaseConnection>) => Promise<void>;
  deleteConnection: (id: number) => Promise<void>;
  testConnection: (id: number) => Promise<boolean>;
  setCurrentConnection: (connection: DatabaseConnection | null) => void;
  
  // Table management
  refreshTables: (connectionId: number) => Promise<void>;
  getTables: (connectionId: number) => Promise<void>;
  getTableDetails: (tableId: number) => DatabaseTable | null;
  
  // Query management
  loadSavedQueries: (connectionId: number) => Promise<void>;
  saveQuery: (connectionId: number, query: Omit<DatabaseQuery, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'connectionId' | 'isActive'>) => Promise<void>;
  deleteQuery: (id: number) => Promise<void>;
  executeQuery: (connectionId: number, query: string, limit?: number) => Promise<any>;
}

const DatabaseContext = createContext<DatabaseContextType | undefined>(undefined);

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (context === undefined) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

interface DatabaseProviderProps {
  children: ReactNode;
}

export const DatabaseProvider: React.FC<DatabaseProviderProps> = ({ children }) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [savedQueries, setSavedQueries] = useState<DatabaseQuery[]>([]);
  const [currentConnection, setCurrentConnection] = useState<DatabaseConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load connections only when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadConnections();
    }
  }, [isAuthenticated, authLoading]);

  const loadConnections = async () => {
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping connection load');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.get('/database/connections');
      setConnections(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  };

  const addConnection = async (connectionData: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'connectionString' | 'isConnected' | 'needsReconnection' | 'status' | 'isActive'>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post('/database/connections', connectionData);
      const newConnection = response.data;
      
      setConnections(prev => [...prev, newConnection]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to add connection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateConnection = async (id: number, updates: Partial<DatabaseConnection>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Filter updates to only include fields that backend accepts
      const allowedFields = ['name', 'host', 'port', 'database', 'username', 'password', 'connectionConfig'];
      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedFields.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = (updates as any)[key];
          return obj;
        }, {});
      
      const response = await api.put(`/database/connections/${id}`, filteredUpdates);
      const updatedConnection = response.data;
      
      setConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? updatedConnection
            : conn
        )
      );
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to update connection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConnection = async (id: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      await api.delete(`/database/connections/${id}`);
      
      setConnections(prev => prev.filter(conn => conn.id !== id));
      setTables(prev => prev.filter(table => table.connectionId !== id));
      setSavedQueries(prev => prev.filter(query => query.connectionId !== id));
      
      if (currentConnection?.id === id) {
        setCurrentConnection(null);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete connection');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (id: number): Promise<boolean> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    console.log('Testing connection with ID:', id);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Update connection status to testing
      setConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { ...conn, status: 'testing' }
            : conn
        )
      );
      
      console.log('Sending test request to:', `/database/connections/${id}/test`);
      const response = await api.post(`/database/connections/${id}/test`);
      console.log('Test response:', response.data);
      
      const { success } = response.data;
      
      // Reload connections to get updated status
      console.log('Reloading connections...');
      await loadConnections();
      
      if (!success) {
        setError('Connection test failed');
        console.log('Connection test failed');
      } else {
        console.log('Connection test successful');
      }
      
      return success;
    } catch (err: any) {
      console.error('Connection test error:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Connection test failed';
      setError(errorMessage);
      console.log('Error message:', errorMessage);
      
      // Reload connections to get updated status
      await loadConnections();
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTables = async (connectionId: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post(`/database/connections/${connectionId}/tables/refresh`);
      const refreshedTables = response.data;
      
      // Remove existing tables for this connection and add new ones
      setTables(prev => [
        ...prev.filter(table => table.connectionId !== connectionId),
        ...refreshedTables
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to refresh tables');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTables = async (connectionId: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/database/connections/${connectionId}/tables`);
      const connectionTables = response.data;
      
      // Update tables for this connection
      setTables(prev => [
        ...prev.filter(table => table.connectionId !== connectionId),
        ...connectionTables
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load tables');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTableDetails = (tableId: number): DatabaseTable | null => {
    return tables.find(table => table.id === tableId) || null;
  };

  const loadSavedQueries = async (connectionId: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.get(`/database/connections/${connectionId}/queries`);
      const connectionQueries = response.data;
      
      // Update queries for this connection
      setSavedQueries(prev => [
        ...prev.filter(query => query.connectionId !== connectionId),
        ...connectionQueries
      ]);
      
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load saved queries');
    } finally {
      setIsLoading(false);
    }
  };

  const saveQuery = async (connectionId: number, queryData: Omit<DatabaseQuery, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'connectionId' | 'isActive'>) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post(`/database/connections/${connectionId}/queries`, queryData);
      const newQuery = response.data;
      
      setSavedQueries(prev => [...prev, newQuery]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save query');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteQuery = async (id: number) => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Find query to get connectionId (for endpoint)
      const query = savedQueries.find(q => q.id === id);
      if (!query) return;
      
      // Note: The API doesn't have a specific delete query endpoint, so we'll just remove from local state
      // In a real implementation, you might want to add a DELETE endpoint for queries
      setSavedQueries(prev => prev.filter(query => query.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete query');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const executeQuery = async (connectionId: number, query: string, limit?: number): Promise<any> => {
    if (!isAuthenticated) {
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.post(`/database/connections/${connectionId}/execute`, {
        query,
        limit
      });
      
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Query execution failed');
      return { 
        success: false, 
        error: err.response?.data?.message || err.message || 'Query execution failed',
        rowsAffected: 0,
        executionTime: '0ms'
      };
    } finally {
      setIsLoading(false);
    }
  };


  const value: DatabaseContextType = {
    connections,
    tables,
    savedQueries,
    currentConnection,
    isLoading,
    error,
    loadConnections,
    addConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    setCurrentConnection,
    refreshTables,
    getTables,
    getTableDetails,
    loadSavedQueries,
    saveQuery,
    deleteQuery,
    executeQuery
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};