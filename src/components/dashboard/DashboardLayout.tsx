import React from 'react';
import { UserRole, UserTier, Project } from '@/lib/types';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import DashboardContent from './DashboardContent';

interface DashboardLayoutProps {
  darkMode: boolean;
  mobileSidebarOpen: boolean;
  activeView: string;
  userRole: UserRole;
  userTier: UserTier;
  projects: Project[];
  children: React.ReactNode;
  setDarkMode: (dark: boolean) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setActiveView: (view: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  darkMode,
  mobileSidebarOpen,
  activeView,
  userRole,
  userTier,
  projects,
  children,
  setDarkMode,
  setMobileSidebarOpen,
  setActiveView,
  setIsAuthenticated
}) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <DashboardSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        activeView={activeView}
        userRole={userRole}
        userTier={userTier}
        projects={projects}
        setActiveView={setActiveView}
        setIsAuthenticated={setIsAuthenticated}
      />

      {/* Main Content */}
      <DashboardContent>
        <DashboardHeader
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
        {children}
      </DashboardContent>
    </div>
  );
};

export default DashboardLayout;