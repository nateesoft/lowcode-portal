import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Code2, Layers, Package, Users, LogOut, Bell, Moon, Sun, Home, 
  Plus, Edit, Eye, Trash2, TrendingUp, Activity, Shield, Award, 
  Menu, Check, Zap, Globe, Smartphone, Cpu, Terminal
} from 'lucide-react';
import { Project, UserRole, UserTier } from '@/lib/types';
import SiteMap from '@/components/ui/SiteMap';

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
  const [showSiteMap, setShowSiteMap] = useState(false);
  const stats = {
    totalProjects: projects.length,
    published: projects.filter(p => p.status === 'Published').length,
    totalTasks: projects.reduce((acc, p) => acc + p.tasks, 0),
    completedTasks: projects.reduce((acc, p) => acc + p.completed, 0),
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
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center space-x-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"
          >
            <Home className="h-5 w-5" />
            <span className="font-medium">Dashboard</span>
          </button>
          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300"
          >
            <Layers className="h-5 w-5" />
            <span>My Projects</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Package className="h-5 w-5" />
            <span>Templates</span>
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
                <span>Admin Panel</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                <Users className="h-5 w-5" />
                <span>Users</span>
              </button>
              <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
                <Activity className="h-5 w-5" />
                <span>Analytics</span>
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
            Upgrade Plan
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
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
              <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening with your projects</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <Bell className="h-5 w-5" />
              </button>
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
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome back!</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">Here's what's happening</p>
          </div>

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
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Projects</div>
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
              <div className="text-sm text-slate-600 dark:text-slate-400">Published</div>
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
              <div className="text-sm text-slate-600 dark:text-slate-400">Total Tasks</div>
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
              <div className="text-sm text-slate-600 dark:text-slate-400">Completed Tasks</div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Recent Projects</h2>
              <div className="flex flex-col sm:flex-row gap-2">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </button>
                <button 
                  onClick={() => onShowCreateSmartFlowModal?.()}
                  className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Project
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
              
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                      <th className="pb-4">Project Name</th>
                      <th className="pb-4">Type</th>
                      <th className="pb-4">Status</th>
                      <th className="pb-4">Progress</th>
                      <th className="pb-4">Last Modified</th>
                      <th className="pb-4">Actions</th>
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
                  {['Full-Stack', 'Single Web', 'Microservice', 'Script Logic'].map(type => (
                    <button key={type} className="p-4 border-2 border-slate-300 dark:border-slate-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 transition text-left">
                      <div className="font-medium text-slate-900 dark:text-white">{type}</div>
                      <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {type === 'Full-Stack' && 'Complete web application'}
                        {type === 'Single Web' && 'Single page application'}
                        {type === 'Microservice' && 'API service'}
                        {type === 'Script Logic' && 'Automation workflow'}
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