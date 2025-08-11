'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReactFlowPage from '@/components/pages/ReactFlowPage';

export default function ReactFlow() {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <ReactFlowPage 
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
    />
  );
}