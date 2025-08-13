import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface DatabaseConnection {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql' | 'mongodb' | 'sqlite' | 'redis' | 'firebase';
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastConnected?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatabaseTable {
  id: string;
  connectionId: string;
  name: string;
  schema?: string;
  columns: DatabaseColumn[];
  rowCount: number;
  size: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimary: boolean;
  isIndex: boolean;
  length?: number;
}

export interface DatabaseQuery {
  id: string;
  name: string;
  connectionId: string;
  query: string;
  description?: string;
  isFavorite: boolean;
  lastExecuted?: Date;
  executionTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface DatabaseContextType {
  connections: DatabaseConnection[];
  tables: DatabaseTable[];
  savedQueries: DatabaseQuery[];
  currentConnection: DatabaseConnection | null;
  isLoading: boolean;
  error: string | null;
  
  // Connection management
  addConnection: (connection: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateConnection: (id: string, updates: Partial<DatabaseConnection>) => Promise<void>;
  deleteConnection: (id: string) => Promise<void>;
  testConnection: (connection: DatabaseConnection) => Promise<boolean>;
  setCurrentConnection: (connection: DatabaseConnection | null) => void;
  
  // Table management
  refreshTables: (connectionId: string) => Promise<void>;
  getTableDetails: (tableId: string) => DatabaseTable | null;
  
  // Query management
  saveQuery: (query: Omit<DatabaseQuery, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateQuery: (id: string, updates: Partial<DatabaseQuery>) => void;
  deleteQuery: (id: string) => void;
  executeQuery: (connectionId: string, query: string) => Promise<any>;
  
  // Demo data
  generateDemoData: () => void;
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
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [tables, setTables] = useState<DatabaseTable[]>([]);
  const [savedQueries, setSavedQueries] = useState<DatabaseQuery[]>([]);
  const [currentConnection, setCurrentConnection] = useState<DatabaseConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addConnection = async (connectionData: Omit<DatabaseConnection, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const newConnection: DatabaseConnection = {
        ...connectionData,
        id: `conn-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'disconnected'
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setConnections(prev => [...prev, newConnection]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add connection');
    } finally {
      setIsLoading(false);
    }
  };

  const updateConnection = async (id: string, updates: Partial<DatabaseConnection>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConnections(prev => 
        prev.map(conn => 
          conn.id === id 
            ? { ...conn, ...updates, updatedAt: new Date() }
            : conn
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteConnection = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setConnections(prev => prev.filter(conn => conn.id !== id));
      setTables(prev => prev.filter(table => table.connectionId !== id));
      setSavedQueries(prev => prev.filter(query => query.connectionId !== id));
      
      if (currentConnection?.id === id) {
        setCurrentConnection(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete connection');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async (connection: DatabaseConnection): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Update connection status to testing
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connection.id 
            ? { ...conn, status: 'testing' }
            : conn
        )
      );
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success/failure for demo
      const isSuccess = Math.random() > 0.2; // 80% success rate
      
      const status = isSuccess ? 'connected' : 'error';
      
      // Update connection status
      setConnections(prev => 
        prev.map(conn => 
          conn.id === connection.id 
            ? { ...conn, status, lastConnected: isSuccess ? new Date() : conn.lastConnected }
            : conn
        )
      );
      
      if (!isSuccess) {
        setError('Connection failed: Unable to connect to database server');
      }
      
      return isSuccess;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshTables = async (connectionId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate demo tables for the connection
      const demoTables: DatabaseTable[] = [
        {
          id: `table-${connectionId}-1`,
          connectionId,
          name: 'users',
          columns: [
            { name: 'id', type: 'INT', nullable: false, isPrimary: true, isIndex: true },
            { name: 'email', type: 'VARCHAR', length: 255, nullable: false, isPrimary: false, isIndex: true },
            { name: 'name', type: 'VARCHAR', length: 100, nullable: false, isPrimary: false, isIndex: false },
            { name: 'created_at', type: 'TIMESTAMP', nullable: false, isPrimary: false, isIndex: false, defaultValue: 'CURRENT_TIMESTAMP' }
          ],
          rowCount: 1247,
          size: '2.3 MB',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `table-${connectionId}-2`,
          connectionId,
          name: 'projects',
          columns: [
            { name: 'id', type: 'INT', nullable: false, isPrimary: true, isIndex: true },
            { name: 'user_id', type: 'INT', nullable: false, isPrimary: false, isIndex: true },
            { name: 'title', type: 'VARCHAR', length: 255, nullable: false, isPrimary: false, isIndex: false },
            { name: 'description', type: 'TEXT', nullable: true, isPrimary: false, isIndex: false },
            { name: 'status', type: 'ENUM', nullable: false, isPrimary: false, isIndex: true, defaultValue: 'active' }
          ],
          rowCount: 89,
          size: '456 KB',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: `table-${connectionId}-3`,
          connectionId,
          name: 'logs',
          columns: [
            { name: 'id', type: 'BIGINT', nullable: false, isPrimary: true, isIndex: true },
            { name: 'level', type: 'VARCHAR', length: 50, nullable: false, isPrimary: false, isIndex: true },
            { name: 'message', type: 'TEXT', nullable: false, isPrimary: false, isIndex: false },
            { name: 'timestamp', type: 'TIMESTAMP', nullable: false, isPrimary: false, isIndex: true, defaultValue: 'CURRENT_TIMESTAMP' }
          ],
          rowCount: 25674,
          size: '12.8 MB',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      // Remove existing tables for this connection and add new ones
      setTables(prev => [
        ...prev.filter(table => table.connectionId !== connectionId),
        ...demoTables
      ]);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh tables');
    } finally {
      setIsLoading(false);
    }
  };

  const getTableDetails = (tableId: string): DatabaseTable | null => {
    return tables.find(table => table.id === tableId) || null;
  };

  const saveQuery = (queryData: Omit<DatabaseQuery, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuery: DatabaseQuery = {
      ...queryData,
      id: `query-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setSavedQueries(prev => [...prev, newQuery]);
  };

  const updateQuery = (id: string, updates: Partial<DatabaseQuery>) => {
    setSavedQueries(prev => 
      prev.map(query => 
        query.id === id 
          ? { ...query, ...updates, updatedAt: new Date() }
          : query
      )
    );
  };

  const deleteQuery = (id: string) => {
    setSavedQueries(prev => prev.filter(query => query.id !== id));
  };

  const executeQuery = async (connectionId: string, query: string): Promise<any> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate query execution
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock response based on query type
      if (query.toLowerCase().includes('select')) {
        return {
          success: true,
          data: [
            { id: 1, name: 'John Doe', email: 'john@example.com', created_at: '2024-01-15 10:30:00' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', created_at: '2024-01-16 14:22:00' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', created_at: '2024-01-17 09:15:00' }
          ],
          rowsAffected: 3,
          executionTime: ' 23ms'
        };
      } else {
        return {
          success: true,
          message: 'Query executed successfully',
          rowsAffected: Math.floor(Math.random() * 10) + 1,
          executionTime: `${Math.floor(Math.random() * 100) + 10}ms`
        };
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query execution failed');
      return { success: false, error: 'Query execution failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoData = () => {
    const demoConnections: DatabaseConnection[] = [
      {
        id: 'conn-demo-1',
        name: 'Production MySQL',
        type: 'mysql',
        host: 'mysql.prod.company.com',
        port: 3306,
        database: 'app_production',
        username: 'app_user',
        status: 'connected',
        lastConnected: new Date(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'conn-demo-2',
        name: 'Development PostgreSQL',
        type: 'postgresql',
        host: 'localhost',
        port: 5432,
        database: 'app_dev',
        username: 'dev_user',
        status: 'connected',
        lastConnected: new Date(Date.now() - 2 * 60 * 60 * 1000),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'conn-demo-3',
        name: 'Analytics MongoDB',
        type: 'mongodb',
        host: 'mongo-cluster.analytics.com',
        port: 27017,
        database: 'analytics',
        username: 'analytics_user',
        status: 'disconnected',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: 'conn-demo-4',
        name: 'Cache Redis',
        type: 'redis',
        host: 'redis.cache.internal',
        port: 6379,
        database: '0',
        username: 'cache_user',
        status: 'error',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    const demoQueries: DatabaseQuery[] = [
      {
        id: 'query-1',
        name: 'Active Users Count',
        connectionId: 'conn-demo-1',
        query: 'SELECT COUNT(*) as active_users FROM users WHERE status = "active" AND last_login > DATE_SUB(NOW(), INTERVAL 30 DAY)',
        description: 'Count users active in the last 30 days',
        isFavorite: true,
        lastExecuted: new Date(Date.now() - 2 * 60 * 60 * 1000),
        executionTime: 45,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      },
      {
        id: 'query-2',
        name: 'Recent Projects',
        connectionId: 'conn-demo-1',
        query: 'SELECT p.*, u.name as owner_name FROM projects p JOIN users u ON p.user_id = u.id WHERE p.created_at > DATE_SUB(NOW(), INTERVAL 7 DAY) ORDER BY p.created_at DESC',
        description: 'Get projects created in the last week',
        isFavorite: false,
        lastExecuted: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        executionTime: 123,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        updatedAt: new Date()
      }
    ];

    setConnections(demoConnections);
    setSavedQueries(demoQueries);
  };

  const value: DatabaseContextType = {
    connections,
    tables,
    savedQueries,
    currentConnection,
    isLoading,
    error,
    addConnection,
    updateConnection,
    deleteConnection,
    testConnection,
    setCurrentConnection,
    refreshTables,
    getTableDetails,
    saveQuery,
    updateQuery,
    deleteQuery,
    executeQuery,
    generateDemoData
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};