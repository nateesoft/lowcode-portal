'use client'

import React, { useState } from 'react';
import AdminPanel from '@/components/pages/AdminPanel';
import { AdminViewType } from '@/lib/types';

export default function AdminPage() {
  const [adminView, setAdminView] = useState<AdminViewType>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <AdminPanel 
      adminView={adminView}
      mobileSidebarOpen={mobileSidebarOpen}
      setAdminView={setAdminView}
      setMobileSidebarOpen={setMobileSidebarOpen}
    />
  );
}