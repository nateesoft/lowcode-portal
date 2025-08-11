import React, { useState } from 'react';
import { Terminal, AlertCircle, Info, CheckCircle, XCircle, Search, Filter, Download } from 'lucide-react';

const LogsPage: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const logs = [
    { 
      id: 1, 
      timestamp: '2025-01-11 14:30:25', 
      level: 'error', 
      message: 'Failed to connect to database', 
      source: 'DatabaseService',
      details: 'Connection timeout after 30 seconds'
    },
    { 
      id: 2, 
      timestamp: '2025-01-11 14:29:42', 
      level: 'warning', 
      message: 'High memory usage detected', 
      source: 'SystemMonitor',
      details: 'Memory usage at 85%'
    },
    { 
      id: 3, 
      timestamp: '2025-01-11 14:28:15', 
      level: 'info', 
      message: 'User authentication successful', 
      source: 'AuthService',
      details: 'User ID: 12345, IP: 192.168.1.100'
    },
    { 
      id: 4, 
      timestamp: '2025-01-11 14:27:33', 
      level: 'success', 
      message: 'Backup completed successfully', 
      source: 'BackupService',
      details: 'Database backup saved to /backups/db_20250111.sql'
    },
    { 
      id: 5, 
      timestamp: '2025-01-11 14:26:18', 
      level: 'error', 
      message: 'API rate limit exceeded', 
      source: 'APIGateway',
      details: 'Client IP: 203.0.113.45 exceeded 100 requests/hour'
    },
    { 
      id: 6, 
      timestamp: '2025-01-11 14:25:07', 
      level: 'info', 
      message: 'New user registration', 
      source: 'UserService',
      details: 'Email: newuser@example.com, Tier: Junior'
    },
    { 
      id: 7, 
      timestamp: '2025-01-11 14:24:21', 
      level: 'warning', 
      message: 'SSL certificate expires soon', 
      source: 'SecurityService',
      details: 'Certificate expires in 7 days'
    },
    { 
      id: 8, 
      timestamp: '2025-01-11 14:23:45', 
      level: 'info', 
      message: 'Scheduled maintenance completed', 
      source: 'MaintenanceService',
      details: 'All services are now online'
    },
  ];

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getLogBadgeStyle = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
      case 'warning':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400';
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400';
      default:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesLevel = selectedLevel === 'all' || log.level === selectedLevel;
    const matchesSearch = searchQuery === '' || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.source.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">System Logs</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </button>
        </div>
      </div>

      {/* Log Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400">High</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{logs.filter(l => l.level === 'error').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Errors</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">Medium</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{logs.filter(l => l.level === 'warning').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Warnings</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Info className="h-8 w-8 text-blue-500" />
            <span className="text-sm text-blue-600 dark:text-blue-400">Low</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{logs.filter(l => l.level === 'info').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Info</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400">Success</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{logs.filter(l => l.level === 'success').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Success</div>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
        {/* Filters */}
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search logs..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex space-x-4">
              <select 
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              >
                <option value="all">All Levels</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
                <option value="success">Success</option>
              </select>
              <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                <option>Last 24 hours</option>
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>Custom range</option>
              </select>
            </div>
          </div>
        </div>

        {/* Logs List */}
        <div className="p-4 sm:p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-slate-100 dark:border-slate-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getLogIcon(log.level)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getLogBadgeStyle(log.level)}`}>
                          {log.level.toUpperCase()}
                        </span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">{log.source}</span>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400">{log.timestamp}</span>
                    </div>
                    <div className="text-slate-900 dark:text-white font-medium mb-1">{log.message}</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">{log.details}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Terminal className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No logs found matching your criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LogsPage;