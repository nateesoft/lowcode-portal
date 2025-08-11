import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Code2, Save, Play, Layers, Menu, ArrowLeft, Plus,
  Smartphone, Globe, Database, Zap, Box
} from 'lucide-react';
import { Project } from '@/lib/types';

interface BuilderProps {
  selectedProject: Project | null;
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
}

const Builder: React.FC<BuilderProps> = ({
  selectedProject,
  mobileSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('design');

  const componentCategories = [
    {
      title: 'UI Components',
      icon: Box,
      components: ['Button', 'Input', 'Card', 'Modal', 'Table']
    },
    {
      title: 'Layout',
      icon: Layers,
      components: ['Container', 'Grid', 'Flex', 'Sidebar', 'Header']
    },
    {
      title: 'Data',
      icon: Database,
      components: ['Form', 'Chart', 'List', 'Filter', 'Search']
    },
    {
      title: 'Logic',
      icon: Zap,
      components: ['API Call', 'Condition', 'Loop', 'Function', 'Event']
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Component Palette Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 z-50 transform transition-transform duration-300 ease-in-out ${
        mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code2 className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-slate-900 dark:text-white">Builder</span>
            </div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            {selectedProject?.name || 'New Project'}
          </h3>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'design' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1 rounded text-sm ${
                activeTab === 'code' 
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              Code
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'design' && (
            <div className="space-y-6">
              {componentCategories.map((category) => (
                <div key={category.title}>
                  <div className="flex items-center space-x-2 mb-3">
                    <category.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white">
                      {category.title}
                    </h4>
                  </div>
                  <div className="space-y-2">
                    {category.components.map((component) => (
                      <button
                        key={component}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-slate-700 dark:text-slate-300 transition-colors"
                        draggable
                      >
                        {component}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg">
                <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
                  Generated Code
                </h4>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  // Your generated code will appear here
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 lg:ml-64">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <button 
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Code2 className="h-6 w-6 text-blue-600" />
            <span className="font-bold text-slate-900 dark:text-white">Builder</span>
          </div>
          <div className="w-8"></div>
        </div>

        {/* Toolbar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button className="hidden lg:flex items-center space-x-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <ArrowLeft className="h-4 w-4" />
                <span className="text-sm">Back to Dashboard</span>
              </button>
              <div className="h-6 border-l border-slate-200 dark:border-slate-700"></div>
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                <Globe className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
                <Play className="h-4 w-4 mr-2" />
                Preview
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0 bg-white dark:bg-slate-900">
            {/* Canvas Background Pattern */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            
            {/* Drop Zone */}
            <div className="absolute inset-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  Start Building
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-4">
                  Drag components from the left panel to start building your app
                </p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Add Component
                  </button>
                  <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                    Import Template
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Builder;