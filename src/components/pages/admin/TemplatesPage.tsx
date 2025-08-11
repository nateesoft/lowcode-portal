import React from 'react';
import { Package, Plus, Eye, Edit, Trash2, Copy } from 'lucide-react';

const TemplatesPage: React.FC = () => {
  const templates = [
    { id: 1, name: 'E-commerce Template', category: 'Business', usage: 245, status: 'Active' },
    { id: 2, name: 'Blog Template', category: 'Content', usage: 189, status: 'Active' },
    { id: 3, name: 'Portfolio Template', category: 'Personal', usage: 156, status: 'Active' },
    { id: 4, name: 'Landing Page Template', category: 'Marketing', usage: 378, status: 'Active' },
    { id: 5, name: 'Dashboard Template', category: 'Admin', usage: 98, status: 'Draft' },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Templates Management</h1>
        <button className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition">
          <Plus className="h-4 w-4 inline mr-2" />
          Create Template
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-6">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="flex-1">
              <input 
                type="text" 
                placeholder="Search templates..." 
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="flex space-x-4">
              <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                <option>All Categories</option>
                <option>Business</option>
                <option>Content</option>
                <option>Personal</option>
                <option>Marketing</option>
                <option>Admin</option>
              </select>
              <select className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white">
                <option>All Status</option>
                <option>Active</option>
                <option>Draft</option>
                <option>Archived</option>
              </select>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-slate-600 dark:text-slate-400">
                  <th className="pb-4">Template</th>
                  <th className="pb-4">Category</th>
                  <th className="pb-4">Usage Count</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4">Last Updated</th>
                  <th className="pb-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id} className="border-t border-slate-100 dark:border-slate-700">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white">
                          <Package className="h-4 w-4" />
                        </div>
                        <span className="font-medium text-slate-900 dark:text-white">{template.name}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-sm">
                        {template.category}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">{template.usage}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-sm ${
                        template.status === 'Active' 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                      }`}>
                        {template.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-slate-600 dark:text-slate-400">2025-01-{10 - template.id}</td>
                    <td className="py-4">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Edit className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </button>
                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                          <Copy className="h-4 w-4 text-green-600 dark:text-green-400" />
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

      {/* Template Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-sm text-green-600 dark:text-green-400">+15%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{templates.length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Templates</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Eye className="h-8 w-8 text-green-600" />
            <span className="text-sm text-green-600 dark:text-green-400">+22%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">1,066</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Total Usage</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Package className="h-8 w-8 text-purple-600" />
            <span className="text-sm text-green-600 dark:text-green-400">+8%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{templates.filter(t => t.status === 'Active').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Active Templates</div>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <Edit className="h-8 w-8 text-orange-600" />
            <span className="text-sm text-yellow-600 dark:text-yellow-400">+3%</span>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{templates.filter(t => t.status === 'Draft').length}</div>
          <div className="text-sm text-slate-600 dark:text-slate-400">Draft Templates</div>
        </div>
      </div>
    </>
  );
};

export default TemplatesPage;