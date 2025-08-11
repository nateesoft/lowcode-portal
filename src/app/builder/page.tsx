'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Builder from '@/components/pages/Builder';
import { Project } from '@/lib/types';

export default function BuilderPage() {
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // In a real app, selectedProject would come from query params or global state
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <Builder 
      selectedProject={selectedProject}
      mobileSidebarOpen={mobileSidebarOpen}
      setMobileSidebarOpen={setMobileSidebarOpen}
    />
  );
}