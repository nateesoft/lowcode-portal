'use client';

import { useEffect, useState } from 'react';
import { useKeycloakAuth } from '@/contexts/KeycloakContext';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { KeycloakUserSyncRequest } from '@/lib/api';

export const useKeycloakSync = () => {
  const { user: keycloakUser, isAuthenticated: isKeycloakAuthenticated, token } = useKeycloakAuth();
  const { syncKeycloakUser, user: localUser, isAuthenticated: isLocalAuthenticated } = useAuth();
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeycloakSync = async () => {
      // Only sync if user is authenticated with Keycloak but not locally
      if (isKeycloakAuthenticated && keycloakUser && !isLocalAuthenticated && !isSyncing) {
        setIsSyncing(true);
        setSyncError(null);

        try {
          console.log('Keycloak user detected, syncing to local database:', keycloakUser);
          
          // Extract role from Keycloak user
          let role = 'user'; // Default role
          if (keycloakUser.role) {
            role = keycloakUser.role;
          }

          const syncData: KeycloakUserSyncRequest = {
            keycloakId: keycloakUser.id,
            email: keycloakUser.email,
            firstName: keycloakUser.firstName || 'Unknown',
            lastName: keycloakUser.lastName || 'User',
            role: role,
            emailVerified: keycloakUser.emailVerified
          };

          await syncKeycloakUser(syncData);
          
          // Redirect to dashboard after successful sync
          console.log('Keycloak sync successful, redirecting to dashboard');
          router.push('/dashboard');
          
        } catch (error) {
          console.error('Failed to sync Keycloak user:', error);
          setSyncError(error instanceof Error ? error.message : 'Sync failed');
        } finally {
          setIsSyncing(false);
        }
      }
    };

    // Only run if Keycloak is ready and we have user data
    if (keycloakUser && isKeycloakAuthenticated) {
      handleKeycloakSync();
    }
  }, [isKeycloakAuthenticated, keycloakUser, isLocalAuthenticated, syncKeycloakUser, router, isSyncing]);

  return {
    isSyncing,
    syncError,
    isKeycloakAuthenticated,
    isLocalAuthenticated,
    keycloakUser,
    localUser
  };
};