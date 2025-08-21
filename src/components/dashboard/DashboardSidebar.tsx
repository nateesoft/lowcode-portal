import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code2, Layers, Settings, Users, LogOut, Home, 
  Shield, Activity, ServerIcon, Component, Database, 
  Images, Calendar, FileText, Key, Cog, FolderOpen, 
  Wrench, Award, Globe2
} from 'lucide-react';
import { UserRole, UserTier, Project } from '@/lib/types';
import CollapsibleMenuGroup from '@/components/ui/CollapsibleMenuGroup';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useSecretManagement } from '@/contexts/SecretManagementContext';

interface DashboardSidebarProps {
  mobileSidebarOpen: boolean;
  activeView: string;
  userRole: UserRole;
  userTier: UserTier;
  projects: Project[];
  setActiveView: (view: string) => void;
  setIsAuthenticated: (auth: boolean) => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({
  mobileSidebarOpen,
  activeView,
  userRole,
  userTier,
  projects,
  setActiveView,
  setIsAuthenticated
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const { logout } = useAuth();
  const { secrets } = useSecretManagement();

  return (
    <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
      mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
    } lg:translate-x-0`}>
      <div className="p-2 border-b border-slate-200 dark:border-slate-700">
        <div className="w-full h-16 flex items-center justify-center">
          <img 
            src="/logo.png" 
            alt="Logo" 
            className="w-full h-full object-contain"
          />
        </div>
      </div>

      <nav className="p-4 space-y-3 overflow-y-auto max-h-[calc(100vh-300px)]">
        {/* Main Navigation */}
        <CollapsibleMenuGroup
          title="Main"
          icon={Home}
          defaultExpanded={true}
          items={[
            {
              key: 'dashboard',
              label: t('dashboard'),
              icon: Home,
              isActive: activeView === 'dashboard',
              onClick: () => setActiveView('dashboard')
            }
          ]}
        />
        
        {/* Development */}
        <CollapsibleMenuGroup
          title="Development"
          icon={Code2}
          defaultExpanded={true}
          items={[
            {
              key: 'projects',
              label: t('myProjects'),
              icon: Layers,
              isActive: activeView === 'projects',
              onClick: () => setActiveView('projects'),
              badge: projects.length > 0 ? projects.length : undefined
            },
            {
              key: 'pages',
              label: t('pages'),
              icon: Globe2,
              isActive: activeView === 'pages',
              onClick: () => setActiveView('pages')
            },
            {
              key: 'services',
              label: t('services'),
              icon: ServerIcon,
              isActive: activeView === 'services',
              onClick: () => setActiveView('services')
            },
            {
              key: 'components',
              label: t('components'),
              icon: Component,
              isActive: activeView === 'components',
              onClick: () => setActiveView('components')
            }
          ]}
        />
        
        <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
        
        {/* Data Management */}
        <CollapsibleMenuGroup
          title="Data Management"
          icon={FolderOpen}
          defaultExpanded={true}
          items={[
            {
              key: 'database',
              label: 'Database',
              icon: Database,
              isActive: activeView === 'database',
              onClick: () => setActiveView('database')
            },
            {
              key: 'media',
              label: 'Media',
              icon: Images,
              isActive: activeView === 'media',
              onClick: () => setActiveView('media')
            },
            {
              key: 'documentation',
              label: 'Documentation',
              icon: FileText,
              isActive: activeView === 'documentation',
              onClick: () => setActiveView('documentation')
            }
          ]}
        />
        
        {/* Project Tools */}
        <CollapsibleMenuGroup
          title="Project Tools"
          icon={Wrench}
          defaultExpanded={true}
          items={[
            {
              key: 'project-management',
              label: 'Task Management',
              icon: Calendar,
              isActive: activeView === 'project-management',
              onClick: () => setActiveView('project-management')
            },
            {
              key: 'secret-management',
              label: 'Secret Keys',
              icon: Key,
              isActive: activeView === 'secret-management',
              onClick: () => setActiveView('secret-management'),
              badge: secrets.length > 0 ? secrets.length : undefined
            }
          ]}
        />
        
        {/* Users */}
        <CollapsibleMenuGroup
          title="Users"
          icon={Users}
          defaultExpanded={false}
          items={[
            {
              key: 'user-groups',
              label: 'User Groups',
              icon: Users,
              isActive: activeView === 'user-groups',
              onClick: () => setActiveView('user-groups')
            }
          ]}
        />
        
        {/* Settings & Admin */}
        <CollapsibleMenuGroup
          title="Settings & Admin"
          icon={Cog}
          defaultExpanded={false}
          items={[
            {
              key: 'settings',
              label: t('settings'),
              icon: Settings,
              isActive: activeView === 'settings',
              onClick: () => setActiveView('settings')
            },
            ...(userRole === 'admin' ? [
              {
                key: 'admin-panel',
                label: t('adminPanel'),
                icon: Shield,
                isActive: false,
                onClick: () => router.push('/admin')
              },
              {
                key: 'users',
                label: t('users'),
                icon: Users,
                isActive: activeView === 'users',
                onClick: () => setActiveView('users')
              },
              {
                key: 'analytics',
                label: t('analytics'),
                icon: Activity,
                isActive: activeView === 'analytics',
                onClick: () => setActiveView('analytics')
              }
            ] : [])
          ]}
        />
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              U
            </div>
            <div>
              <div className="text-sm font-medium text-slate-900 dark:text-white">User Name</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                <Award className="h-3 w-3 mr-1" />
                {userTier} Plan
              </div>
            </div>
          </div>
          <button 
            onClick={() => { 
              logout(); 
              setIsAuthenticated(false); // Keep legacy support
              router.push('/landing'); 
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
        <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition">
          {t('upgradePlan')}
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;