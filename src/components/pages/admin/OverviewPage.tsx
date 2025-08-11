import React from 'react';
import { Users, Layers, Eye, Activity } from 'lucide-react';
import { ADMIN_MOCK_STATS } from '@/lib/constants';

const OverviewPage: React.FC = () => {
  return (
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
  );
};

export default OverviewPage;