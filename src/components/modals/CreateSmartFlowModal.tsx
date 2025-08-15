import React, { useState, useEffect } from 'react';
import { X, Building2, Globe, Computer, TabletSmartphone, ServerIcon,
  Diamond, User2, Component, Maximize2, Minimize2, Move
 } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';

interface CreateSmartFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (projectData: object) => void;
}

const CreateSmartFlowModal: React.FC<CreateSmartFlowModalProps> = ({
  isOpen,
  onClose,
  onCreateProject,
}) => {
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('web-app');
  const [butsinessType, setBusinessType] = useState('startup');
  const [description, setDescription] = useState('');
  const { 
    dragRef, 
    modalRef, 
    isDragging, 
    isResizing,
    isFullscreen, 
    modalStyle, 
    dragHandleStyle, 
    resizeHandles,
    handleMouseDown, 
    handleResizeMouseDown,
    toggleFullscreen, 
    resetPosition 
  } = useModalDragAndResize();

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
    setBusinessType('startup');
    setDescription('');
    onClose();
  };

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

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
      icon: TabletSmartphone
    },
    {
      id: 'desktop-app',
      name: 'Desktop Application',
      description: 'Build a desktop app interface',
      icon: Computer
    },
    {
      id: 'micro-service',
      name: 'Microservice',
      description: 'Create full APIs services',
      icon: ServerIcon
    }
  ];

  const businessTypes = [
    {
      id: 'startup',
      name: 'Startup',
      description: 'ธุรกิจที่เน้นการสร้างนวัตกรรมและเติบโตอย่างรวดเร็ว',
      icon: Diamond
    },
    {
      id: 'sme',
      name: 'SME',
      description: 'ธุรกิจขนาดกลางและขนาดย่อม ซึ่งมีหลากหลายรูปแบบ',
      icon: User2
    },
    {
      id: 'franchise',
      name: 'Franchise',
      description: 'การให้สิทธิในการทำธุรกิจภายใต้แบรนด์และรูปแบบธุรกิจที่กำหนด',
      icon: Component
    },
    {
      id: 'enterprise',
      name: 'State Enterprise',
      description: 'ธุรกิจที่ดำเนินการโดยรัฐบาลหรือหน่วยงานของรัฐ',
      icon: Building2
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col"
        style={modalStyle}
      >
        {/* Resize Handles */}
        {!isFullscreen && resizeHandles.map((handle) => (
          <div
            key={handle.direction}
            style={handle.style}
            onMouseDown={(e) => handleResizeMouseDown(e, handle.direction)}
            className="hover:bg-blue-500 hover:opacity-50 transition-colors"
          />
        ))}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Create New Smart Flow
          </h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleFullscreen}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <div className="flex items-center text-slate-400 px-2">
              <Move className="h-4 w-4" />
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto">
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Business Type
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {businessTypes.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setBusinessType(type.id)}
                      className={`p-4 border rounded-lg text-left transition-colors ${
                        butsinessType === type.id
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <IconComponent className={`h-5 w-5 ${
                          butsinessType === type.id
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-slate-500 dark:text-slate-400'
                        }`} />
                        <div>
                          <h3 className={`font-medium ${
                            butsinessType === type.id
                              ? 'text-green-900 dark:text-green-100'
                              : 'text-slate-900 dark:text-white'
                          }`}>
                            {type.name}
                          </h3>
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
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateSmartFlowModal;