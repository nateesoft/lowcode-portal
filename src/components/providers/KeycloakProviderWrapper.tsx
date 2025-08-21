'use client';

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamic import to prevent SSR issues
const KeycloakProvider = dynamic(
  () => import('@/contexts/KeycloakContext').then(mod => ({ default: mod.KeycloakProvider })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ),
  }
);

interface KeycloakProviderWrapperProps {
  children: ReactNode;
}

export default function KeycloakProviderWrapper({ children }: KeycloakProviderWrapperProps) {
  return <KeycloakProvider>{children}</KeycloakProvider>;
}