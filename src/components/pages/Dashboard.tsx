import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code2, Layers, Package, Settings, Users, LogOut, Bell, Moon, Sun, Home, 
  Plus, Edit, Eye, Trash2, TrendingUp, Activity, Shield, Award, 
  Menu, Check, Zap, Globe, Smartphone, Cpu, Component, ServerIcon,
  Globe2
} from 'lucide-react';
import { Project, UserRole, UserTier } from '@/lib/types';
import SiteMap from '@/components/ui/SiteMap';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import CurrencySwitcher from '@/components/ui/CurrencySwitcher';
import { useTranslation } from 'react-i18next';

interface DashboardProps {
  projects: Project[];
  userRole: UserRole;
  userTier: UserTier;
  darkMode: boolean;
  mobileSidebarOpen: boolean;
  showCreateModal: boolean;
  selectedProject: Project | null;
  setMobileSidebarOpen: (open: boolean) => void;
  setDarkMode: (dark: boolean) => void;
  setShowCreateModal: (show: boolean) => void;
  setSelectedProject: (project: Project | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  onShowCreateSmartFlowModal?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  projects,
  userRole,
  userTier,
  darkMode,
  mobileSidebarOpen,
  showCreateModal,
  selectedProject,
  setMobileSidebarOpen,
  setDarkMode,
  setShowCreateModal,
  setSelectedProject,
  setIsAuthenticated,
  onShowCreateSmartFlowModal,
}) => {
  const router = useRouter();
  const { t } = useTranslation();
  const [showSiteMap, setShowSiteMap] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const stats = {
    totalProjects: projects.length,
    published: projects.filter(p => p.status === 'Published').length,
    totalTasks: projects.reduce((acc, p) => acc + p.tasks, 0),
    completedTasks: projects.reduce((acc, p) => acc + p.completed, 0),
  };

  const renderContent = () => {
    switch (activeView) {
      case 'projects':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('myProjects')}</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => onShowCreateSmartFlowModal?.()}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t('createProject')}
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map(project => (
                  <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                          {project.type}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        project.status === 'Published' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Progress:</span>
                        <span className="text-sm text-slate-600 dark:text-slate-400">
                          {project.completed}/{project.tasks}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                          style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-500 dark:text-slate-400">{project.lastModified}</span>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => { setSelectedProject(project); router.push('/builder'); }}
                          className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                        >
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'pages':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('pages')}</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                {t('newPage')}
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {['Home Page', 'About Us', 'Contact', 'Blog', 'Services', 'Portfolio'].map((page, index) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded">
                          <Globe2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{page}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">/{page.toLowerCase().replace(' ', '-')}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm">
                        Published
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-500 dark:text-slate-400">
                      <span>Last modified: 2 days ago</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'services':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('services')}</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                {t('newService')}
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: 'User Authentication', type: 'API Service', status: 'Running', endpoints: 5 },
                  { name: 'Payment Gateway', type: 'External API', status: 'Running', endpoints: 8 },
                  { name: 'Email Service', type: 'Microservice', status: 'Stopped', endpoints: 3 },
                  { name: 'File Storage', type: 'Cloud Service', status: 'Running', endpoints: 12 }
                ].map((service, index) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded">
                          <ServerIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{service.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{service.type}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded text-sm ${
                        service.status === 'Running' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                      }`}>
                        {service.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">{service.endpoints} endpoints</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Settings className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'components':
        return (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('components')}</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                {t('newComponent')}
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { name: 'Header Navigation', category: 'Layout', usage: 15 },
                  { name: 'Product Card', category: 'Display', usage: 8 },
                  { name: 'Contact Form', category: 'Form', usage: 5 },
                  { name: 'Footer', category: 'Layout', usage: 12 },
                  { name: 'Modal Dialog', category: 'Overlay', usage: 6 },
                  { name: 'Button Group', category: 'Control', usage: 20 }
                ].map((component, index) => (
                  <div key={index} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded">
                          <Component className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">{component.name}</div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">{component.category}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-slate-600 dark:text-slate-400">Used in {component.usage} places</span>
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Account Settings</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="John Doe" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Email</label>
                  <input type="email" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="john@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Company</label>
                  <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" defaultValue="Acme Corp" />
                </div>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                  Save Changes
                </button>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Preferences</h2>
              </div>
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Dark Mode</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Switch between light and dark theme</div>
                  </div>
                  <button 
                    onClick={() => setDarkMode(!darkMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${darkMode ? 'bg-blue-600' : 'bg-slate-200'} transition-colors`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">Email Notifications</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">Receive email notifications for updates</div>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors">
                    <span className="inline-block h-4 w-4 transform rounded-full bg-white transition translate-x-6" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'users':
        return userRole === 'admin' ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">User Management</h2>
              <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center">
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                      <th className="pb-4">User</th>
                      <th className="pb-4">Role</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Last Active</th>
                      <th className="pb-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
                      { name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'Active', lastActive: '1 day ago' },
                      { name: 'Bob Wilson', email: 'bob@example.com', role: 'Viewer', status: 'Inactive', lastActive: '1 week ago' }
                    ].map((user, index) => (
                      <tr key={index} className="border-t border-slate-100 dark:border-slate-700">
                        <td className="py-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                              <div className="text-sm text-slate-600 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-sm ${
                            user.status === 'Active' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                          {user.lastActive}
                        </td>
                        <td className="py-4">
                          <div className="flex items-center space-x-2">
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null;

      case 'analytics':
        return userRole === 'admin' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    12%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <Activity className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    8%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">89.2%</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">System Uptime</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Globe className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    24%
                  </span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">45.6K</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">Page Views</div>
              </div>
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ServerIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <span className="text-sm text-red-600 dark:text-red-400">-5%</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">156</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">API Calls</div>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              </div>
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  {[
                    { action: 'New user registered', user: 'john@example.com', time: '2 hours ago', type: 'user' },
                    { action: 'Project deployed', user: 'jane@example.com', time: '4 hours ago', type: 'deployment' },
                    { action: 'System backup completed', user: 'System', time: '6 hours ago', type: 'system' },
                    { action: 'API key generated', user: 'bob@example.com', time: '1 day ago', type: 'security' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 border border-slate-200 dark:border-slate-700 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                        activity.type === 'deployment' ? 'bg-green-100 dark:bg-green-900/30' :
                        activity.type === 'system' ? 'bg-purple-100 dark:bg-purple-900/30' :
                        'bg-orange-100 dark:bg-orange-900/30'
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          activity.type === 'user' ? 'text-blue-600 dark:text-blue-400' :
                          activity.type === 'deployment' ? 'text-green-600 dark:text-green-400' :
                          activity.type === 'system' ? 'text-purple-600 dark:text-purple-400' :
                          'text-orange-600 dark:text-orange-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 dark:text-white">{activity.action}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">{activity.user}</div>
                      </div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">{activity.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null;

      default:
        return null;
    }
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

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Code2 className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          <button 
            onClick={() => setActiveView('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
              activeView === 'dashboard' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">{t('dashboard')}</span>
          </button>
          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
          <button 
            onClick={() => setActiveView('projects')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
              activeView === 'projects' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Layers className="h-5 w-5" />
            <span>{t('myProjects')}</span>
          </button>
          
          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
          
          <button 
            onClick={() => setActiveView('pages')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
              activeView === 'pages' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Globe2 className="h-5 w-5" />
            <span>{t('pages')}</span>
          </button>
          <button 
            onClick={() => setActiveView('services')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
              activeView === 'services' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <ServerIcon className="h-5 w-5" />
            <span>{t('services')}</span>
          </button>
          <button 
            onClick={() => setActiveView('components')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
              activeView === 'components' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Component className="h-5 w-5" />
            <span>{t('components')}</span>
          </button>
          <div className="border-t border-slate-200 dark:border-slate-700 my-2"></div>
          <button 
            onClick={() => setActiveView('settings')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
              activeView === 'settings' 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                : 'hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            <Settings className="h-5 w-5" />
            <span>{t('settings')}</span>
          </button>
          {userRole === 'admin' && (
            <>
              <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-700">
                <span className="px-4 text-xs font-semibold text-slate-400 uppercase">Admin</span>
              </div>
              <button 
                onClick={() => router.push('/admin')}
                className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
              >
                <Shield className="h-5 w-5" />
                <span>{t('adminPanel')}</span>
              </button>
              <button 
                onClick={() => setActiveView('users')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
                  activeView === 'users' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Users className="h-5 w-5" />
                <span>{t('users')}</span>
              </button>
              <button 
                onClick={() => setActiveView('analytics')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-slate-700 dark:text-slate-300 transition ${
                  activeView === 'analytics' 
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                    : 'hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <Activity className="h-5 w-5" />
                <span>{t('analytics')}</span>
              </button>
            </>
          )}
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
              onClick={() => { setIsAuthenticated(false); router.push('/landing'); }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
          <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg transition">
{t('upgradePlan')}
          </button>
        </div>
      </div>

      {/* Main Content */}
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
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">FlowCode</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Bell className="h-5 w-5" />
            </button>
            <CurrencySwitcher />
            <LanguageSwitcher />
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          </div>
        </div>
        
        <div className="p-4 sm:p-8">
          {/* Header - Desktop only */}
          <div className="hidden lg:flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">{t('whatsHappening')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
              <CurrencySwitcher />
              <LanguageSwitcher />
              <button 
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Header */}
          <div className="lg:hidden mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('welcomeBack')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">{t('whatsHappeningMobile')}</p>
          </div>

          {/* Render content based on active view */}
          {activeView === 'dashboard' && (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Layers className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      12%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalProjects}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('totalProjects')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      8%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.published}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('published')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      24%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalTasks}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('totalTasks')}</div>
                </div>

                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <span className="text-sm text-green-600 dark:text-green-400">
                      {Math.round((stats.completedTasks / stats.totalTasks) * 100)}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedTasks}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{t('completedTasks')}</div>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('recentProjects')}</h2>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button 
                      onClick={() => setShowCreateModal(true)}
                      className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      {t('newProjectDemo')}
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6">
                  {/* Mobile Cards View */}
                  <div className="lg:hidden space-y-4">
                    {projects.map(project => (
                      <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                              {project.type}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            project.status === 'Published' 
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                              : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                          }`}>
                            {project.status}
                          </span>
                        </div>
                        <div className="mb-3">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-sm text-slate-600 dark:text-slate-400">{t('progress')}:</span>
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {project.completed}/{project.tasks}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-500 dark:text-slate-400">{project.lastModified}</span>
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => { setSelectedProject(project); router.push('/builder'); }}
                              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                            >
                              <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                            </button>
                            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                              <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                          <th className="pb-4">{t('projectName')}</th>
                          <th className="pb-4">{t('type')}</th>
                          <th className="pb-4">{t('status')}</th>
                          <th className="pb-4">{t('progress')}</th>
                          <th className="pb-4">{t('lastModified')}</th>
                          <th className="pb-4">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="space-y-2">
                        {projects.map(project => (
                          <tr key={project.id} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="py-4">
                              <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm">
                                {project.type}
                              </span>
                            </td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-sm ${
                                project.status === 'Published' 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                              }`}>
                                {project.status}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                                    style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                                  />
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400">
                                  {project.completed}/{project.tasks}
                                </span>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">
                              {project.lastModified}
                            </td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button 
                                  onClick={() => { setSelectedProject(project); router.push('/builder'); }}
                                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                                >
                                  <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Render other menu content */}
          {renderContent()}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-4 sm:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Name</label>
                <input type="text" className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" placeholder="My Awesome App" />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Description</label>
                <textarea className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white" rows={3} placeholder="Describe your project..."></textarea>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project Type</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: 'Full-Stack', label: t('fullStack'), desc: t('fullStackDesc') },
                    { key: 'Single Web', label: t('singleWeb'), desc: t('singleWebDesc') },
                    { key: 'Microservice', label: t('microservice'), desc: t('microserviceDesc') },
                    { key: 'Script Logic', label: t('scriptLogic'), desc: t('scriptLogicDesc') }
                  ].map(type => (
                    <button key={type.key} className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left">
                      <div className="font-medium text-slate-900 dark:text-white">{type.label}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {type.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Target Platform</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Globe className="h-5 w-5 mr-2" />
                    Web
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Smartphone className="h-5 w-5 mr-2" />
                    Mobile
                  </button>
                  <button className="p-3 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition flex items-center justify-center">
                    <Cpu className="h-5 w-5 mr-2" />
                    IoT
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row justify-end gap-4 mt-8">
              <button 
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button 
                onClick={() => { setShowCreateModal(false); router.push('/builder'); }}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Site Map Modal */}
      {showSiteMap && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <SiteMap 
              userRole={userRole}
              isAuthenticated={true}
              onClose={() => setShowSiteMap(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;