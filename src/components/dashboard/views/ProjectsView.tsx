import React from 'react';
import { useRouter } from 'next/navigation';
import { Layers, Plus, Edit, Eye, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MyProjectData } from '@/lib/api';

interface ProjectsViewProps {
  myProjects: MyProjectData[];
  setShowMyProjectModal: (show: boolean) => void;
  handleDeleteProject: (projectId: number) => void;
}

const ProjectsView: React.FC<ProjectsViewProps> = ({
  myProjects,
  setShowMyProjectModal,
  handleDeleteProject
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{t('myProjects')}</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            ภาพรวมการทำงานทั้งหมดภายใน Project
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button 
            onClick={() => setShowMyProjectModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            {t('createProject')}
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6">
        {myProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-slate-400 mb-4">
              <Layers className="h-12 w-12 mx-auto mb-4" />
              <p>No projects found. Create your first project to get started!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProjects.map(project => (
              <div key={project.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition cursor-pointer"
                   onClick={() => router.push(`/reactflow?projectId=${project.id}`)}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-slate-900 dark:text-white">{project.name}</div>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded text-sm mt-1 inline-block">
                      {project.projectType}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded text-sm ${
                    project.status === 'production' 
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                      : project.status === 'development'
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                
                {/* Project Description */}
                {project.description && (
                  <div className="mb-3">
                    <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                      {project.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {project.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                      {project.tags.length > 3 && (
                        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs">
                          +{project.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        router.push(`/reactflow?projectId=${project.id}`); 
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      title="Open WorkFlow"
                    >
                      <Edit className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        window.open(`/project/${project.slug}`, '_blank'); 
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      title="Preview Project"
                    >
                      <Eye className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        handleDeleteProject(project.id); 
                      }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      title="Delete Project"
                    >
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectsView;