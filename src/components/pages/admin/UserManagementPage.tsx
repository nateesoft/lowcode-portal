import React from 'react';
import { Edit, Lock, Trash2 } from 'lucide-react';

const UserManagementPage: React.FC = () => {
  return (
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
  );
};

export default UserManagementPage;