'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from './ProtectedRoute';

interface RouteGuardProps {
  children: React.ReactNode;
}

const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const pathname = usePathname();

  // For debugging - you can remove this in production
  console.log('Current route:', pathname);

  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default RouteGuard;