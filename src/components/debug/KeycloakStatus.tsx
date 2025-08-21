import React from 'react';
import { useKeycloakSafe } from '@/hooks/useKeycloakSafe';

const KeycloakStatus: React.FC = () => {
  const keycloakAuth = useKeycloakSafe();
  
  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-lg text-sm max-w-sm">
      <h3 className="font-semibold mb-2 text-gray-800 dark:text-gray-200">Keycloak Status</h3>
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span>Ready:</span>
          <span className={keycloakAuth.isKeycloakReady ? 'text-green-600' : 'text-red-600'}>
            {keycloakAuth.isKeycloakReady ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Loading:</span>
          <span className={keycloakAuth.isLoading ? 'text-yellow-600' : 'text-gray-600'}>
            {keycloakAuth.isLoading ? '🔄' : '✅'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Authenticated:</span>
          <span className={keycloakAuth.isAuthenticated ? 'text-green-600' : 'text-gray-600'}>
            {keycloakAuth.isAuthenticated ? '✅' : '❌'}
          </span>
        </div>
        <div className="flex justify-between">
          <span>User:</span>
          <span className="text-gray-600 truncate max-w-20">
            {keycloakAuth.user?.username || 'None'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default KeycloakStatus;