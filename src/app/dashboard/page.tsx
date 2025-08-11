'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/pages/Dashboard';
import CreateProject2Modal from '@/components/modals/CreateProject2Modal';
import { SAMPLE_PROJECTS } from '@/lib/constants';
import { Project, UserRole, UserTier } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  
  // Project related state
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateProject2Modal, setShowCreateProject2Modal] = useState(false);
  
  // User state - in a real app, this would come from auth context
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userTier, setUserTier] = useState<UserTier>('Junior');
  const [darkMode, setDarkMode] = useState(false);
  
  // UI state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    setIsAuthenticated(false);
    router.push('/landing');
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      <Dashboard 
        projects={projects}
        userRole={userRole}
        userTier={userTier}
        darkMode={darkMode}
        mobileSidebarOpen={mobileSidebarOpen}
        showCreateModal={showCreateModal}
        selectedProject={selectedProject}
        setMobileSidebarOpen={setMobileSidebarOpen}
        setDarkMode={setDarkMode}
        setShowCreateModal={setShowCreateModal}
        setSelectedProject={setSelectedProject}
        setIsAuthenticated={handleLogout}
        onShowCreateProject2Modal={() => setShowCreateProject2Modal(true)}
      />
      
      <CreateProject2Modal 
        isOpen={showCreateProject2Modal}
        onClose={() => setShowCreateProject2Modal(false)}
        onCreateProject={(projectData) => {
          setProjects([...projects, projectData]);
          setSelectedProject(projectData);
          setShowCreateProject2Modal(false);
          router.push('/reactflow');
        }}
      />
    </div>
  );
}