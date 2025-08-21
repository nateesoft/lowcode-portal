import React from 'react';
import { 
  ArrowLeft, Save, Play, Download, Upload, 
  Menu, GitBranch, Plus, X 
} from 'lucide-react';

interface FlowToolbarProps {
  projectName: string;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  onBack: () => void;
  onSave: () => void;
  onExecute: () => void;
  onExport: () => void;
  onImport: () => void;
  onShowPalette: () => void;
  onShowVersions: () => void;
  onShowCollaboration: () => void;
}

const FlowToolbar: React.FC<FlowToolbarProps> = ({
  projectName,
  isLoading,
  hasUnsavedChanges,
  onBack,
  onSave,
  onExecute,
  onExport,
  onImport,
  onShowPalette,
  onShowVersions,
  onShowCollaboration
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50 flex items-center justify-between px-4">
      {/* Left Section */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="w-px h-6 bg-gray-300"></div>
        
        <div>
          <h1 className="text-lg font-semibold text-gray-900">{projectName}</h1>
          {hasUnsavedChanges && (
            <p className="text-xs text-orange-600">• Unsaved changes</p>
          )}
        </div>
      </div>

      {/* Center Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowPalette}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Show Node Palette"
        >
          <Menu className="w-4 h-4" />
          <span className="hidden sm:inline">Palette</span>
        </button>

        <button
          onClick={onExecute}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          title="Execute Flow"
        >
          <Play className="w-4 h-4" />
          <span>Execute</span>
        </button>

        <button
          onClick={onSave}
          disabled={isLoading || !hasUnsavedChanges}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          title="Save Flow"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        <button
          onClick={onShowVersions}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Version History"
        >
          <GitBranch className="w-4 h-4" />
          <span className="hidden sm:inline">Versions</span>
        </button>

        <button
          onClick={onShowCollaboration}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Collaboration"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Collaborate</span>
        </button>

        <div className="w-px h-6 bg-gray-300"></div>

        <button
          onClick={onImport}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Import Flow"
        >
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          title="Export Flow"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
};

export default FlowToolbar;