import React, { useState } from 'react';
import { X, Folder, FileText, Database, Globe } from 'lucide-react';

interface CreateProject2ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: object) => void;
}

const CreateProject2Modal: React.FC<CreateProject2ModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('web-app');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!projectName.trim()) return;

    const newProject = {
      id: Date.now(),
      name: projectName,
      type: projectType,
      description: description,
      status: 'Active',
      lastModified: new Date().toLocaleDateString(),
      tasks: 0,
      completed: 0
    };

    onCreateProject(newProject);
    setProjectName('');
    setProjectType('web-app');
    setDescription('');
    onClose();
  };

  if (!isOpen) return null;

  const projectTypes = [
    {
      id: 'web-app',
      name: 'Web Application',
      description: 'Create a modern web application',
      icon: Globe
    },
    {
      id: 'mobile-app',
      name: 'Mobile Application',
      description: 'Build a mobile app interface',
      icon: FileText
    },
    {
      id: 'dashboard',
      name: 'Dashboard',
      description: 'Create an analytics dashboard',
      icon: Database
    },
    {
      id: 'workflow',
      name: 'Workflow',
      description: 'Design a business workflow',
      icon: Folder
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Project2
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                placeholder="Enter project name..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Project Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {projectTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setProjectType(type.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        projectType === type.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${
                          projectType === type.id
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`} />
                        <div>
                          <h3 className={`font-medium ${
                            projectType === type.id
                              ? 'text-blue-900 dark:text-blue-100'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {type.name}
                          </h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {type.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white resize-none"
                placeholder="Describe your project..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create Project2
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProject2Modal;