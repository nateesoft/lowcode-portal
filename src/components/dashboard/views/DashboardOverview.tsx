import React from 'react';
import { 
  Layers, Check, Zap, Activity, Plus, TrendingUp, Eye, Edit, Trash2 
} from 'lucide-react';
import { Project } from '@/lib/types';
import { useTranslation } from 'react-i18next';
import NotesBoard from '@/components/ui/NotesBoard';

interface Stats {
  totalProjects: number;
  published: number;
  totalTasks: number;
  completedTasks: number;
}

interface DashboardOverviewProps {
  projects: Project[];
  stats: Stats;
  setShowCreateModal: (show: boolean) => void;
  setSelectedProject: (project: Project | null) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  projects,
  stats,
  setShowCreateModal,
  setSelectedProject
}) => {
  const { t } = useTranslation();

  return (
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

      {/* Notes Board */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 mb-8">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Quick Notes</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Sticky notes from your team</p>
        </div>
        <div className="p-4 sm:p-6">
          <NotesBoard />
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
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  {project.description}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 dark:text-slate-400">
                    Updated {project.lastModified}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setSelectedProject(project)}
                      className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block">
            <table className="w-full">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="pb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Project</th>
                  <th className="pb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Type</th>
                  <th className="pb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="pb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Last Modified</th>
                  <th className="pb-3 text-sm font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(project => (
                  <tr key={project.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                    <td className="py-4">
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{project.description}</div>
                      </div>
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
                    <td className="py-4 text-sm text-slate-500 dark:text-slate-400">{project.lastModified}</td>
                    <td className="py-4">
                      <div className="flex gap-1">
                        <button 
                          onClick={() => setSelectedProject(project)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded">
                          <Trash2 className="h-4 w-4" />
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

export default DashboardOverview;