'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '@/components/pages/LoginPage';
import { UserRole } from '@/lib/types';

export default function Login() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleSetAuthenticated = (value: boolean) => {
    setIsAuthenticated(value);
    if (value) {
      router.push('/dashboard');
    }
  };

  const handleSetUserRole = (role: UserRole) => {
    // Handle user role logic here if needed
  };

  return (
    <LoginPage 
      setIsAuthenticated={handleSetAuthenticated}
      setUserRole={handleSetUserRole}
    />
  );
}