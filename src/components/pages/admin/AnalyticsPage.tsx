import React from 'react';
import { BarChart3, TrendingUp, Users, Eye, Activity, Calendar } from 'lucide-react';

const AnalyticsPage: React.FC = () => {
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Users className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12.5%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">2,543</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Visitors</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Eye className="h-8 w-8 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +8.2%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">7,892</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Page Views</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Activity className="h-8 w-8 text-purple-600" />
            <span className="text-sm text-green-600 dark:text-green-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1" />
              +15.3%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">1,234</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Active Sessions</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="h-8 w-8 text-orange-600" />
            <span className="text-sm text-red-600 dark:text-red-400 flex items-center">
              <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
              -2.1%
            </span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">4.2%</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Bounce Rate</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Traffic Sources */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Traffic Sources</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Direct</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">45.2%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Search Engines</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">32.8%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '32.8%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Social Media</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">15.7%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '15.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Referrals</span>
                <span className="text-sm text-slate-600 dark:text-slate-400">6.3%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '6.3%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Pages */}
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Top Pages</h3>
          <div className="space-y-4">
            {[
              { page: '/dashboard', views: 2145, change: '+12%' },
              { page: '/builder', views: 1876, change: '+8%' },
              { page: '/templates', views: 1234, change: '+15%' },
              { page: '/profile', views: 987, change: '+5%' },
              { page: '/admin', views: 654, change: '+22%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div>
                  <div className="font-medium text-slate-900 dark:text-white">{item.page}</div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">{item.views} views</div>
                </div>
                <span className="text-sm text-green-600 dark:text-green-400">{item.change}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { time: '2 minutes ago', action: 'User registered', user: 'john@example.com', type: 'user' },
            { time: '5 minutes ago', action: 'New project created', user: 'alice@example.com', type: 'project' },
            { time: '10 minutes ago', action: 'Template exported', user: 'bob@example.com', type: 'export' },
            { time: '15 minutes ago', action: 'User logged in', user: 'charlie@example.com', type: 'user' },
            { time: '20 minutes ago', action: 'Project published', user: 'diana@example.com', type: 'project' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'user' ? 'bg-blue-100 dark:bg-blue-900/30' :
                activity.type === 'project' ? 'bg-green-100 dark:bg-green-900/30' :
                'bg-purple-100 dark:bg-purple-900/30'
              }`}>
                {activity.type === 'user' ? <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" /> :
                 activity.type === 'project' ? <Activity className="h-4 w-4 text-green-600 dark:text-green-400" /> :
                 <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />}
              </div>
              <div className="flex-1">
                <div className="font-medium text-slate-900 dark:text-white">{activity.action}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400">{activity.user}</div>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;