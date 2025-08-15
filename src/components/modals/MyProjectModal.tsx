import React, { useState } from 'react';
import { X, Folder, Globe, Smartphone, Database, MonitorSpeaker, ShoppingCart, FileText, User, Package } from 'lucide-react';
import { myProjectAPI, CreateMyProjectRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';

interface MyProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: any) => void;
}

const PROJECT_TYPES = [
  { key: 'web', label: 'Web App', desc: 'Modern web application', icon: Globe },
  { key: 'mobile', label: 'Mobile App', desc: 'Mobile application', icon: Smartphone },
  { key: 'api', label: 'API Service', desc: 'Backend API service', icon: Database },
  { key: 'desktop', label: 'Desktop App', desc: 'Desktop application', icon: MonitorSpeaker },
  { key: 'dashboard', label: 'Dashboard', desc: 'Analytics dashboard', icon: Package },
  { key: 'ecommerce', label: 'E-Commerce', desc: 'Online store', icon: ShoppingCart },
  { key: 'blog', label: 'Blog', desc: 'Content management', icon: FileText },
  { key: 'portfolio', label: 'Portfolio', desc: 'Personal portfolio', icon: User },
];

const PROJECT_PRIORITIES = [
  { key: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
  { key: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { key: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { key: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' },
];

const MyProjectModal: React.FC<MyProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState<CreateMyProjectRequest>({
    name: '',
    slug: '',
    description: '',
    projectType: 'web',
    status: 'planning',
    priority: 'medium',
    isPublic: false,
    tags: [],
    createdById: 1 // Default user ID
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const { showAlert } = useAlert();

  // Generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(t => t !== tag) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showAlert('Please enter a project name', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const project = await myProjectAPI.create(formData);
      showAlert('Project created successfully!', 'success');
      onProjectCreated?.(project);
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        slug: '',
        description: '',
        projectType: 'web',
        status: 'planning',
        priority: 'medium',
        isPublic: false,
        tags: [],
        createdById: 1
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      showAlert(error.response?.data?.message || 'Failed to create project', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Project</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Start building your next amazing project
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="My Awesome Project"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Project Slug *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="my-awesome-project"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              rows={3}
              placeholder="Describe your project..."
            />
          </div>

          {/* Project Type */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Project Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PROJECT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, projectType: type.key as any }))}
                    className={`p-3 border rounded-lg text-left transition ${
                      formData.projectType === type.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="h-6 w-6 mb-2 text-blue-600" />
                    <div className="font-medium text-sm text-slate-900 dark:text-white">{type.label}</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{type.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Priority
              </label>
              <div className="flex space-x-2">
                {PROJECT_PRIORITIES.map((priority) => (
                  <button
                    key={priority.key}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, priority: priority.key as any }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                      formData.priority === priority.key
                        ? 'ring-2 ring-blue-500'
                        : ''
                    } ${priority.color}`}
                  >
                    {priority.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPublic: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">
                  Public Project
                </span>
              </label>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags?.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                placeholder="Add tag..."
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Add
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyProjectModal;