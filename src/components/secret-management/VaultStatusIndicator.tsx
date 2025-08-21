import React from 'react';
import { Shield, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSecretManagement } from '@/contexts/SecretManagementContext';

const VaultStatusIndicator: React.FC = () => {
  const { isVaultEnabled, vaultStatus, checkVaultStatus } = useSecretManagement();

  const getStatusConfig = () => {
    switch (vaultStatus) {
      case 'connected':
        return {
          icon: CheckCircle,
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-100 dark:bg-green-900/30',
          status: 'Connected',
          description: 'Vault is connected and operational'
        };
      case 'disconnected':
        return {
          icon: XCircle,
          color: 'text-red-600 dark:text-red-400',
          bgColor: 'bg-red-100 dark:bg-red-900/30',
          status: 'Disconnected',
          description: 'Vault is not connected'
        };
      default:
        return {
          icon: AlertCircle,
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
          status: 'Unknown',
          description: 'Unable to determine Vault status'
        };
    }
  };

  const config = getStatusConfig();
  const StatusIcon = config.icon;

  const handleRefresh = async () => {
    await checkVaultStatus();
  };

  if (!isVaultEnabled && vaultStatus === 'disconnected') {
    return null; // Don't show indicator if vault is not being used
  }

  return (
    <div className={`inline-flex items-center px-3 py-2 rounded-lg ${config.bgColor}`}>
      <Shield className="h-4 w-4 text-slate-600 dark:text-slate-400 mr-2" />
      <StatusIcon className={`h-4 w-4 ${config.color} mr-2`} />
      <div className="flex flex-col">
        <span className="text-sm font-medium text-slate-900 dark:text-white">
          Vault: {config.status}
        </span>
        <span className="text-xs text-slate-600 dark:text-slate-400">
          {config.description}
        </span>
      </div>
      <button
        onClick={handleRefresh}
        className="ml-2 p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition"
        title="Refresh status"
      >
        <svg 
          className="h-3 w-3 text-slate-500 dark:text-slate-400" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
          />
        </svg>
      </button>
    </div>
  );
};

export default VaultStatusIndicator;