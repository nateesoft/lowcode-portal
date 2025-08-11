'use client'

import React, { useState } from 'react';
import LandingPage from '@/components/pages/LandingPage';
import LoginPage from '@/components/pages/LoginPage';
import Dashboard from '@/components/pages/Dashboard';
import AdminPanel from '@/components/pages/AdminPanel';
import Builder from '@/components/pages/Builder';
import ReactFlowPage from '@/components/pages/ReactFlowPage';
import CreateProject2Modal from '@/components/modals/CreateProject2Modal';
import { SAMPLE_PROJECTS } from '@/lib/constants';
import { 
  Project, 
  UserRole, 
  UserTier, 
  PageType, 
  AdminViewType 
} from '@/lib/types';

const HomePortal = () => {
  // Main application state
  const [currentPage, setCurrentPage] = useState<PageType>('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('user');
  const [userTier, setUserTier] = useState<UserTier>('Junior');
  const [darkMode, setDarkMode] = useState(false);
  
  // Project related state
  const [projects, setProjects] = useState<Project[]>(SAMPLE_PROJECTS);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateProject2Modal, setShowCreateProject2Modal] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [adminView, setAdminView] = useState<AdminViewType>('overview');

  // Role-based routing
  const renderPage = () => {
    if (!isAuthenticated && currentPage !== 'landing' && currentPage !== 'login') {
      return (
        <LoginPage 
          setIsAuthenticated={setIsAuthenticated}
          setCurrentPage={setCurrentPage}
          setUserRole={setUserRole}
        />
      );
    }

    switch(currentPage) {
      case 'landing':
        return (
          <LandingPage 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            setCurrentPage={setCurrentPage}
          />
        );
        
      case 'login':
        return (
          <LoginPage 
            setIsAuthenticated={setIsAuthenticated}
            setCurrentPage={setCurrentPage}
            setUserRole={setUserRole}
          />
        );
        
      case 'dashboard':
      case 'projects':
        return (
          <Dashboard 
            projects={projects}
            userRole={userRole}
            userTier={userTier}
            darkMode={darkMode}
            mobileSidebarOpen={mobileSidebarOpen}
            showCreateModal={showCreateModal}
            selectedProject={selectedProject}
            setMobileSidebarOpen={setMobileSidebarOpen}
            setCurrentPage={setCurrentPage}
            setDarkMode={setDarkMode}
            setShowCreateModal={setShowCreateModal}
            setSelectedProject={setSelectedProject}
            setIsAuthenticated={setIsAuthenticated}
            onShowCreateProject2Modal={() => setShowCreateProject2Modal(true)}
          />
        );
        
      case 'admin':
        return userRole === 'admin' ? (
          <AdminPanel 
            adminView={adminView}
            mobileSidebarOpen={mobileSidebarOpen}
            setAdminView={setAdminView}
            setMobileSidebarOpen={setMobileSidebarOpen}
            setCurrentPage={setCurrentPage}
          />
        ) : (
          <Dashboard 
            projects={projects}
            userRole={userRole}
            userTier={userTier}
            darkMode={darkMode}
            mobileSidebarOpen={mobileSidebarOpen}
            showCreateModal={showCreateModal}
            selectedProject={selectedProject}
            setMobileSidebarOpen={setMobileSidebarOpen}
            setCurrentPage={setCurrentPage}
            setDarkMode={setDarkMode}
            setShowCreateModal={setShowCreateModal}
            setSelectedProject={setSelectedProject}
            setIsAuthenticated={setIsAuthenticated}
            onShowCreateProject2Modal={() => setShowCreateProject2Modal(true)}
          />
        );

      case 'builder':
        return (
          <Builder 
            selectedProject={selectedProject}
            mobileSidebarOpen={mobileSidebarOpen}
            setMobileSidebarOpen={setMobileSidebarOpen}
            setCurrentPage={setCurrentPage}
          />
        );

      case 'reactflow':
        return (
          <>
            <CreateProject2Modal 
              isOpen={showCreateProject2Modal}
              onClose={() => setShowCreateProject2Modal(false)}
              onCreateProject={(projectData) => {
                setProjects([...projects, projectData]);
                setSelectedProject(projectData);
                setShowCreateProject2Modal(false);
                setCurrentPage('reactflow');
              }}
            />
            <ReactFlowPage 
              mobileSidebarOpen={mobileSidebarOpen}
              setMobileSidebarOpen={setMobileSidebarOpen}
              setCurrentPage={setCurrentPage}
            />
          </>
        );
        
      default:
        return (
          <LandingPage 
            mobileMenuOpen={mobileMenuOpen}
            setMobileMenuOpen={setMobileMenuOpen}
            setCurrentPage={setCurrentPage}
          />
        );
    }
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {renderPage()}
      
      {/* Global Create Project2 Modal for navigation to ReactFlow */}
      {currentPage !== 'reactflow' && (
        <CreateProject2Modal 
          isOpen={showCreateProject2Modal}
          onClose={() => setShowCreateProject2Modal(false)}
          onCreateProject={(projectData) => {
            setProjects([...projects, projectData]);
            setSelectedProject(projectData);
            setShowCreateProject2Modal(false);
            setCurrentPage('reactflow');
          }}
        />
      )}
    </div>
  );
};

export default HomePortal;