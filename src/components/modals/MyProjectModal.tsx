import React, { useState } from 'react';
import { X, Folder, Globe, Smartphone, Database, MonitorSpeaker, ShoppingCart, FileText, User, Package, Type, Palette, Languages, Shield, Bell, Calendar, Settings } from 'lucide-react';
import { myProjectAPI, CreateMyProjectRequest, DesignSettings } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';
import { useAuth } from '@/contexts/AuthContext';

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


const FONT_OPTIONS = [
  { key: 'inter', label: 'Inter', preview: 'font-sans', family: 'Inter, sans-serif' },
  { key: 'roboto', label: 'Roboto', preview: 'font-sans', family: 'Roboto, sans-serif' },
  { key: 'open-sans', label: 'Open Sans', preview: 'font-sans', family: 'Open Sans, sans-serif' },
  { key: 'lato', label: 'Lato', preview: 'font-sans', family: 'Lato, sans-serif' },
  { key: 'poppins', label: 'Poppins', preview: 'font-sans', family: 'Poppins, sans-serif' },
  { key: 'montserrat', label: 'Montserrat', preview: 'font-sans', family: 'Montserrat, sans-serif' },
  { key: 'nunito', label: 'Nunito', preview: 'font-sans', family: 'Nunito, sans-serif' },
  { key: 'source-sans', label: 'Source Sans', preview: 'font-sans', family: 'Source Sans Pro, sans-serif' },
  { key: 'custom', label: 'Custom Font', preview: 'font-sans', family: 'custom' },
];

const COLOR_THEMES = [
  { key: 'blue', label: 'Blue', primary: '#3B82F6', secondary: '#1E40AF', preview: 'bg-blue-500' },
  { key: 'purple', label: 'Purple', primary: '#8B5CF6', secondary: '#7C3AED', preview: 'bg-purple-500' },
  { key: 'green', label: 'Green', primary: '#10B981', secondary: '#059669', preview: 'bg-green-500' },
  { key: 'red', label: 'Red', primary: '#EF4444', secondary: '#DC2626', preview: 'bg-red-500' },
  { key: 'orange', label: 'Orange', primary: '#F97316', secondary: '#EA580C', preview: 'bg-orange-500' },
  { key: 'pink', label: 'Pink', primary: '#EC4899', secondary: '#DB2777', preview: 'bg-pink-500' },
  { key: 'indigo', label: 'Indigo', primary: '#6366F1', secondary: '#4F46E5', preview: 'bg-indigo-500' },
  { key: 'teal', label: 'Teal', primary: '#14B8A6', secondary: '#0D9488', preview: 'bg-teal-500' },
];

const AUTH_PROVIDERS = [
  { key: 'manual', label: 'Manual Login', desc: 'Traditional email/password', icon: User },
  { key: 'oauth', label: 'OAuth Services', desc: 'Google, Facebook, GitHub', icon: Shield },
  { key: 'sso', label: 'Single Sign-On', desc: 'Enterprise SSO', icon: Shield },
  { key: 'keycloak', label: 'Keycloak', desc: 'Identity management', icon: Shield },
  { key: 'auth0', label: 'Auth0', desc: 'Authentication platform', icon: Shield },
];

const ALERT_TEMPLATES = [
  { 
    key: 'modal-center', 
    label: 'Modal Center', 
    desc: 'Center modal with header, content & close button',
    preview: 'bg-white border shadow-lg'
  },
  { 
    key: 'toast-top-right', 
    label: 'Toast Top Right', 
    desc: 'Small notification at top-right corner',
    preview: 'bg-slate-800 text-white border-0'
  },
  { 
    key: 'toast-top-left', 
    label: 'Toast Top Left', 
    desc: 'Small notification at top-left corner',
    preview: 'bg-slate-800 text-white border-0'
  },
  { 
    key: 'banner-top', 
    label: 'Banner Top', 
    desc: 'Full width banner at top of page',
    preview: 'bg-blue-50 border-blue-200 text-blue-800'
  },
  { 
    key: 'inline', 
    label: 'Inline Alert', 
    desc: 'Inline notification within content',
    preview: 'bg-yellow-50 border-yellow-200 text-yellow-800'
  },
  { 
    key: 'slide-in', 
    label: 'Slide-in Panel', 
    desc: 'Side panel sliding from right',
    preview: 'bg-white border-l shadow-xl'
  }
];

const DATE_PICKER_STYLES = [
  {
    key: 'modal',
    label: 'Modal Calendar',
    desc: 'Full calendar popup modal',
    preview: 'bg-white border shadow-lg'
  },
  {
    key: 'dropdown',
    label: 'Dropdown Calendar',
    desc: 'Dropdown calendar below input',
    preview: 'bg-white border shadow-md'
  },
  {
    key: 'inline',
    label: 'Inline Calendar',
    desc: 'Always visible calendar widget',
    preview: 'bg-slate-50 border'
  },
  {
    key: 'minimal',
    label: 'Minimal Input',
    desc: 'Simple text input with date format',
    preview: 'bg-white border border-slate-300'
  },
  {
    key: 'range',
    label: 'Date Range Picker',
    desc: 'Select start and end dates',
    preview: 'bg-blue-50 border border-blue-200'
  },
  {
    key: 'compact',
    label: 'Compact Picker',
    desc: 'Small size for tight spaces',
    preview: 'bg-gray-50 border border-gray-300'
  }
];

const MyProjectModal: React.FC<MyProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CreateMyProjectRequest>({
    name: '',
    slug: '',
    description: '',
    projectType: 'web',
    status: 'planning',
    priority: 'medium',
    isPublic: false,
    tags: [],
    createdById: user?.id || 1 // Use authenticated user ID
  });
  
  const [designSettings, setDesignSettings] = useState<DesignSettings>({
    primaryFont: 'inter',
    customFont: '',
    colorTheme: 'blue',
    multiLanguage: false,
    authProvider: 'manual',
    alertTemplate: 'modal-center',
    datePickerStyle: 'dropdown'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'design'>('basic');
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
      // Combine formData with designSettings
      const projectData: CreateMyProjectRequest = {
        ...formData,
        createdById: user?.id || 1, // Ensure we use current user ID
        designSettings: designSettings
      };
      
      console.log('Creating project with data:', projectData); // Debug logging
      const project = await myProjectAPI.create(projectData);
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
        createdById: user?.id || 1
      });
      setDesignSettings({
        primaryFont: 'inter',
        customFont: '',
        colorTheme: 'blue',
        multiLanguage: false,
        authProvider: 'manual',
        alertTemplate: 'modal-center',
        datePickerStyle: 'dropdown'
      });
    } catch (error: any) {
      console.error('Error creating project:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // Show more detailed error message
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create project';
      showAlert(errorMessage, 'error');
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

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <div className="px-6 pt-4">
            <div className="flex space-x-8">
              <button
                type="button"
                onClick={() => setActiveTab('basic')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'basic'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Folder className="h-4 w-4" />
                  Basic Information
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('design')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition ${
                  activeTab === 'design'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Design Settings
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-6">
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
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
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
            </div>
          )}

          {/* Design Settings Tab */}
          {activeTab === 'design' && (
            <div className="space-y-6">
              {/* Design Settings Section */}
              <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Design Settings
            </h3>

            {/* Font Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Type className="h-4 w-4" />
                Primary Font
              </label>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-3">
                {FONT_OPTIONS.filter(font => font.key !== 'custom').map((font) => (
                  <button
                    key={font.key}
                    type="button"
                    onClick={() => setDesignSettings(prev => ({ ...prev, primaryFont: font.key }))}
                    className={`p-3 border rounded-lg text-center transition ${
                      designSettings.primaryFont === font.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-sm font-medium text-slate-900 dark:text-white" style={{ fontFamily: font.family }}>
                      {font.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 mt-1" style={{ fontFamily: font.family }}>
                      Aa
                    </div>
                  </button>
                ))}
              </div>
              
              {/* Custom Font Option */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDesignSettings(prev => ({ ...prev, primaryFont: 'custom' }))}
                  className={`px-4 py-2 border rounded-lg transition ${
                    designSettings.primaryFont === 'custom'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                  }`}
                >
                  Custom Font
                </button>
                {designSettings.primaryFont === 'custom' && (
                  <input
                    type="text"
                    value={designSettings.customFont}
                    onChange={(e) => setDesignSettings(prev => ({ ...prev, customFont: e.target.value }))}
                    className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Enter font family name..."
                  />
                )}
              </div>
            </div>

            {/* Color Theme Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Color Theme
              </label>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.key}
                    type="button"
                    onClick={() => setDesignSettings(prev => ({ ...prev, colorTheme: theme.key }))}
                    className={`p-3 border rounded-lg text-center transition ${
                      designSettings.colorTheme === theme.key
                        ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded mx-auto mb-1 ${theme.preview}`}></div>
                    <div className="text-xs text-slate-700 dark:text-slate-300">{theme.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-language Support */}
            <div className="mb-6">
              <label className="flex items-center gap-3">
                <Languages className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <input
                  type="checkbox"
                  checked={designSettings.multiLanguage}
                  onChange={(e) => setDesignSettings(prev => ({ ...prev, multiLanguage: e.target.checked }))}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Multi-language Support
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  (Support for 2+ languages)
                </span>
              </label>
            </div>

            {/* Auth Provider Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Authentication Provider
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {AUTH_PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <button
                      key={provider.key}
                      type="button"
                      onClick={() => setDesignSettings(prev => ({ ...prev, authProvider: provider.key }))}
                      className={`p-3 border rounded-lg text-left transition ${
                        designSettings.authProvider === provider.key
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-2 text-blue-600" />
                      <div className="font-medium text-sm text-slate-900 dark:text-white">{provider.label}</div>
                      <div className="text-xs text-slate-600 dark:text-slate-400">{provider.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alert Template Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Alert Template
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ALERT_TEMPLATES.map((template) => (
                  <button
                    key={template.key}
                    type="button"
                    onClick={() => setDesignSettings(prev => ({ ...prev, alertTemplate: template.key }))}
                    className={`p-4 border rounded-lg text-left transition ${
                      designSettings.alertTemplate === template.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {/* Template Preview */}
                    <div className="mb-3 h-16 flex items-center justify-center relative overflow-hidden rounded border">
                      <div className={`w-full h-8 rounded text-xs flex items-center justify-center ${template.preview}`}>
                        {template.key === 'modal-center' && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                            <span className="text-xs">Alert</span>
                            <div className="w-2 h-2 border border-current rounded opacity-60"></div>
                          </div>
                        )}
                        {template.key.includes('toast') && (
                          <div className="text-xs px-2 py-1 rounded">Toast</div>
                        )}
                        {template.key === 'banner-top' && (
                          <div className="w-full text-center text-xs py-1">Banner Alert</div>
                        )}
                        {template.key === 'inline' && (
                          <div className="text-xs px-2 py-1">⚠ Inline Alert</div>
                        )}
                        {template.key === 'slide-in' && (
                          <div className="text-xs px-2 py-1 text-slate-600">Panel →</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="font-medium text-sm text-slate-900 dark:text-white mb-1">
                      {template.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {template.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date Picker Style Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Picker Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {DATE_PICKER_STYLES.map((style) => (
                  <button
                    key={style.key}
                    type="button"
                    onClick={() => setDesignSettings(prev => ({ ...prev, datePickerStyle: style.key }))}
                    className={`p-4 border rounded-lg text-left transition ${
                      designSettings.datePickerStyle === style.key
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-slate-200 dark:border-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {/* Date Picker Preview */}
                    <div className="mb-3 h-16 flex items-center justify-center relative overflow-hidden rounded border">
                      <div className={`w-full h-10 rounded text-xs flex items-center justify-center ${style.preview}`}>
                        {style.key === 'modal' && (
                          <div className="flex items-center gap-1">
                            <div className="w-6 h-6 border border-current rounded text-xs flex items-center justify-center">📅</div>
                            <span className="text-xs">Modal</span>
                          </div>
                        )}
                        {style.key === 'dropdown' && (
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-6 border border-current rounded text-xs flex items-center justify-center">📅</div>
                            <span className="text-xs">↓</span>
                          </div>
                        )}
                        {style.key === 'inline' && (
                          <div className="grid grid-cols-7 gap-1 text-xs">
                            {[...Array(7)].map((_, i) => (
                              <div key={i} className="w-2 h-2 bg-current rounded opacity-60"></div>
                            ))}
                          </div>
                        )}
                        {style.key === 'minimal' && (
                          <div className="w-20 h-6 border border-current rounded text-xs flex items-center justify-center">
                            DD/MM/YYYY
                          </div>
                        )}
                        {style.key === 'range' && (
                          <div className="flex items-center gap-1 text-xs">
                            <div className="w-6 h-4 border border-current rounded"></div>
                            <span>~</span>
                            <div className="w-6 h-4 border border-current rounded"></div>
                          </div>
                        )}
                        {style.key === 'compact' && (
                          <div className="w-12 h-6 border border-current rounded text-xs flex items-center justify-center">
                            📅
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="font-medium text-sm text-slate-900 dark:text-white mb-1">
                      {style.label}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      {style.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
              </div>
            </div>
          )}

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