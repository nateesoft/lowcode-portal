import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, Package, Activity, Terminal, Shield, BarChart3,
  Menu, LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminViewType } from '@/lib/types';
import ThemeToggle from '@/components/ui/ThemeToggle';
import SiteMap from '@/components/ui/SiteMap';
import OverviewPage from './admin/OverviewPage';
import UserManagementPage from './admin/UserManagementPage';
import TemplatesPage from './admin/TemplatesPage';
import AnalyticsPage from './admin/AnalyticsPage';
import LogsPage from './admin/LogsPage';

interface AdminPanelProps {
  adminView: AdminViewType;
  mobileSidebarOpen: boolean;
  setAdminView: (view: AdminViewType) => void;
  setMobileSidebarOpen: (open: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  adminView,
  mobileSidebarOpen,
  setAdminView,
  setMobileSidebarOpen,
}) => {
  const router = useRouter();
  const { logout } = useAuth();
  const [showSiteMap, setShowSiteMap] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/landing');
  };
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Admin Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-red-600" />
              <span className="text-xl font-bold text-slate-900 dark:text-white">Admin Panel</span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setAdminView('overview')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              adminView === 'overview' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setAdminView('users')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              adminView === 'users' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Users className="h-5 w-5" />
            <span>User Management</span>
          </button>
          <button 
            onClick={() => setAdminView('templates')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              adminView === 'templates' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Package className="h-5 w-5" />
            <span>Templates</span>
          </button>
          <button 
            onClick={() => setAdminView('analytics')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              adminView === 'analytics' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Activity className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          <button 
            onClick={() => setAdminView('logs')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg ${
              adminView === 'logs' ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Terminal className="h-5 w-5" />
            <span>Logs</span>
          </button>
          <button 
            onClick={() => setShowSiteMap(!showSiteMap)}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <Package className="h-5 w-5" />
            <span>Site Map</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Admin Content */}
      <div className="lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Shield className="h-6 w-6 text-red-600" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Admin</span>
          </div>
          <ThemeToggle />
        </div>
        
        <div className="p-4 sm:p-8">
          {adminView === 'overview' && <OverviewPage />}
          {adminView === 'users' && <UserManagementPage />}
          {adminView === 'templates' && <TemplatesPage />}
          {adminView === 'analytics' && <AnalyticsPage />}
          {adminView === 'logs' && <LogsPage />}
        </div>
      </div>

      {/* Site Map Modal */}
      {showSiteMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SiteMap 
              userRole="admin"
              isAuthenticated={true}
              onClose={() => setShowSiteMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;