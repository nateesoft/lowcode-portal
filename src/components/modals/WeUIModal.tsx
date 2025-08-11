import React, { useState } from 'react';
import { X, Code, Save, Eye, Settings, Plus, Trash2, Copy } from 'lucide-react';

interface WeUIModalProps {
  isOpen: boolean;
  onClose: () => void;
  nodeData?: any;
}

const WeUIModal: React.FC<WeUIModalProps> = ({
  isOpen,
  onClose,
  nodeData,
}) => {
  const [activeTab, setActiveTab] = useState('schema');
  const [jsonSchema, setJsonSchema] = useState(`{
  "type": "object",
  "title": "User Registration Form",
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name",
      "default": ""
    },
    "lastName": {
      "type": "string",
      "title": "Last Name",
      "default": ""
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    },
    "age": {
      "type": "integer",
      "title": "Age",
      "minimum": 18,
      "maximum": 100
    }
  },
  "required": ["firstName", "lastName", "email"]
}`);

  const [uiSchema, setUISchema] = useState(`{
  "firstName": {
    "ui:placeholder": "Enter your first name"
  },
  "lastName": {
    "ui:placeholder": "Enter your last name"
  },
  "email": {
    "ui:placeholder": "user@example.com",
    "ui:help": "We'll never share your email with anyone else."
  },
  "age": {
    "ui:widget": "range"
  }
}`);

  const [formData, setFormData] = useState(`{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "age": 25
}`);

  if (!isOpen) return null;

  const tabs = [
    { id: 'schema', name: 'JSON Schema', icon: Code },
    { id: 'ui', name: 'UI Schema', icon: Settings },
    { id: 'data', name: 'Form Data', icon: Copy },
    { id: 'preview', name: 'Preview', icon: Eye }
  ];

  const handleSaveSchema = () => {
    // Here you would save the schema to your backend or state management
    console.log('Saving WeUI Schema:', { jsonSchema, uiSchema, formData });
    onClose();
  };

  const renderPreview = () => {
    return (
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Form Preview</h3>
        <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg border">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              placeholder="Enter your first name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              placeholder="Enter your last name"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email *
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              We'll never share your email with anyone else.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Age: 25
            </label>
            <input
              type="range"
              min="18"
              max="100"
              defaultValue="25"
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    let content = jsonSchema;
    let onChange = setJsonSchema;
    let placeholder = "Enter JSON Schema...";

    if (activeTab === 'ui') {
      content = uiSchema;
      onChange = setUISchema;
      placeholder = "Enter UI Schema...";
    } else if (activeTab === 'data') {
      content = formData;
      onChange = setFormData;
      placeholder = "Enter Form Data...";
    }

    return (
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-full resize-none font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                WeUI Form Builder
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create and manage JSON Forms with jsonform.io
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSaveSchema}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>Save Schema</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          {tabs.map((tab) => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-hidden">
          {activeTab === 'preview' ? renderPreview() : renderEditor()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-750">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Plus className="h-4 w-4" />
              <span>Add Field</span>
            </button>
            <button className="flex items-center space-x-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
              <Copy className="h-4 w-4" />
              <span>Clone Schema</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
              <Trash2 className="h-4 w-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeUIModal;