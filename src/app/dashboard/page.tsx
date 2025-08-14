'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Dashboard from '@/components/pages/Dashboard';
import CreateSmartFlowModal from '@/components/modals/CreateSmartFlowModal';
import { DocumentationProvider } from '@/contexts/DocumentationContext';
import { SecretManagementProvider } from '@/contexts/SecretManagementContext';
import { SAMPLE_PROJECTS } from '@/lib/constants';
import { Project, UserRole, UserTier } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  
  // Project related state
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateSmartFlowModal, setShowCreateSmartFlowModal] = useState(false);
  
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
    <DocumentationProvider>
      <SecretManagementProvider>
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
            onShowCreateSmartFlowModal={() => setShowCreateSmartFlowModal(true)}
          />
          
          <CreateSmartFlowModal 
            isOpen={showCreateSmartFlowModal}
            onClose={() => setShowCreateSmartFlowModal(false)}
            onCreateProject={(projectData) => {
              setProjects([...projects, projectData]);
              setSelectedProject(projectData);
              setShowCreateSmartFlowModal(false);
              router.push('/reactflow');
            }}
          />
        </div>
      </SecretManagementProvider>
    </DocumentationProvider>
  );
}