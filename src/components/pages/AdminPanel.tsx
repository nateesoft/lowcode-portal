import React from 'react';
import {
  Users, Layers, Package, Activity, Terminal, Shield, BarChart3,
  Menu, Edit, Lock, Trash2, Eye
} from 'lucide-react';
import { ADMIN_MOCK_STATS } from '@/lib/constants';
import { AdminViewType, PageType } from '@/lib/types';

interface AdminPanelProps {
  adminView: AdminViewType;
  mobileSidebarOpen: boolean;
  setAdminView: (view: AdminViewType) => void;
  setMobileSidebarOpen: (open: boolean) => void;
  setCurrentPage: (page: PageType) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({
  adminView,
  mobileSidebarOpen,
  setAdminView,
  setMobileSidebarOpen,
  setCurrentPage,
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

      {/* Admin Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-red-600" />
            <span className="text-xl font-bold text-slate-900 dark:text-white">Admin Panel</span>
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
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Package className="h-5 w-5" />
            <span>Templates</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Activity className="h-5 w-5" />
            <span>Analytics</span>
          </button>
          <button className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300">
            <Terminal className="h-5 w-5" />
            <span>Logs</span>
          </button>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button 
            onClick={() => setCurrentPage('dashboard')}
            className="w-full px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition"
          >
            Back to Dashboard
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
          <div className="w-8"></div>
        </div>
        
        <div className="p-4 sm:p-8">
          {adminView === 'overview' && (
            <>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">Admin Overview</h1>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="h-8 w-8 text-blue-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">+12%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{ADMIN_MOCK_STATS.totalUsers}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Users</div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <Layers className="h-8 w-8 text-purple-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">+8%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{ADMIN_MOCK_STATS.totalProjects}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Projects</div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <Eye className="h-8 w-8 text-green-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">+24%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{ADMIN_MOCK_STATS.totalExports}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Total Exports</div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="h-8 w-8 text-orange-600" />
                    <span className="text-sm text-green-600 dark:text-green-400">+5%</span>
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{ADMIN_MOCK_STATS.activeUsers}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">Active Users</div>
                </div>
              </div>

              {/* User Distribution */}
              <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">User Distribution by Tier</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Junior (Free)</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{ADMIN_MOCK_STATS.juniorUsers} users</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-blue-600 h-3 rounded-full" style={{ width: '65%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Senior ($10/mo)</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{ADMIN_MOCK_STATS.seniorUsers} users</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-purple-600 h-3 rounded-full" style={{ width: '28%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Specialist ($100/mo)</span>
                      <span className="text-sm text-slate-600 dark:text-slate-400">{ADMIN_MOCK_STATS.specialistUsers} users</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full" style={{ width: '7%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {adminView === 'users' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
                  + Add User
                </button>
              </div>

              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                    <div className="flex-1">
                      <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                      />
                    </div>
                    <div className="flex space-x-4">
                      <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                        <option>All Tiers</option>
                        <option>Junior</option>
                        <option>Senior</option>
                        <option>Specialist</option>
                      </select>
                      <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Suspended</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                          <th className="pb-4">User</th>
                          <th className="pb-4">Email</th>
                          <th className="pb-4">Tier</th>
                          <th className="pb-4">Projects</th>
                          <th className="pb-4">Status</th>
                          <th className="pb-4">Joined</th>
                          <th className="pb-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[1, 2, 3, 4, 5].map(i => (
                          <tr key={i} className="border-t border-slate-100 dark:border-slate-700">
                            <td className="py-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                                  U{i}
                                </div>
                                <span className="font-medium text-slate-900 dark:text-white">User {i}</span>
                              </div>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">user{i}@example.com</td>
                            <td className="py-4">
                              <span className={`px-2 py-1 rounded text-sm ${
                                i === 1 ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' :
                                i === 2 ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                              }`}>
                                {i === 1 ? 'Specialist' : i === 2 ? 'Senior' : 'Junior'}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{Math.floor(Math.random() * 10)}</td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded text-sm">
                                Active
                              </span>
                            </td>
                            <td className="py-4 text-sm text-slate-600 dark:text-slate-400">2025-01-0{i}</td>
                            <td className="py-4">
                              <div className="flex items-center space-x-2">
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                                </button>
                                <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                                  <Lock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
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
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;