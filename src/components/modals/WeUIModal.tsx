import React, { useState } from 'react';
import { X, Code, Save, Eye, Settings, Plus, Trash2, Copy, FileText } from 'lucide-react';

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
  const [showTemplates, setShowTemplates] = useState(false);
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

  const uiTemplates = [
    {
      id: 'basic',
      name: 'Basic Form',
      description: 'Simple form with basic styling',
      template: `{
  "firstName": {
    "ui:placeholder": "Enter your first name"
  },
  "lastName": {
    "ui:placeholder": "Enter your last name"
  },
  "email": {
    "ui:placeholder": "user@example.com",
    "ui:help": "We'll never share your email with anyone else."
  }
}`
    },
    {
      id: 'advanced',
      name: 'Advanced Form',
      description: 'Form with advanced widgets and validation',
      template: `{
  "firstName": {
    "ui:placeholder": "Enter your first name",
    "ui:autocomplete": "given-name",
    "ui:help": "Required field"
  },
  "lastName": {
    "ui:placeholder": "Enter your last name",
    "ui:autocomplete": "family-name"
  },
  "email": {
    "ui:placeholder": "user@example.com",
    "ui:widget": "email",
    "ui:help": "We'll never share your email with anyone else.",
    "ui:options": {
      "inputType": "email"
    }
  },
  "age": {
    "ui:widget": "range",
    "ui:help": "Select your age using the slider"
  }
}`
    },
    {
      id: 'card-layout',
      name: 'Card Layout',
      description: 'Form with card-style layout',
      template: `{
  "ui:layout": "card",
  "firstName": {
    "ui:placeholder": "First Name",
    "ui:widget": "text",
    "ui:options": {
      "label": false,
      "placeholder": "Enter first name"
    }
  },
  "lastName": {
    "ui:placeholder": "Last Name",
    "ui:widget": "text",
    "ui:options": {
      "label": false,
      "placeholder": "Enter last name"
    }
  },
  "email": {
    "ui:placeholder": "Email Address",
    "ui:widget": "email",
    "ui:options": {
      "label": false,
      "placeholder": "Enter email address"
    }
  },
  "age": {
    "ui:widget": "updown",
    "ui:title": "Age"
  }
}`
    },
    {
      id: 'minimal',
      name: 'Minimal Form',
      description: 'Clean minimal design',
      template: `{
  "ui:options": {
    "submitText": "Submit"
  },
  "firstName": {
    "ui:placeholder": "First Name"
  },
  "lastName": {
    "ui:placeholder": "Last Name"
  },
  "email": {
    "ui:placeholder": "Email"
  },
  "age": {
    "ui:widget": "hidden"
  }
}`
    }
  ];

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

  const applyTemplate = (template: string) => {
    setUISchema(template);
    setShowTemplates(false);
  };

  const renderTemplates = () => {
    return (
      <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">UI Schema Templates</h3>
          <button
            onClick={() => setShowTemplates(false)}
            className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uiTemplates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors" onClick={() => applyTemplate(template.template)}>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 dark:text-white">{template.name}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{template.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEditor = () => {
    let content = jsonSchema;
    let onChange = setJsonSchema;
    let placeholder = "Enter JSON Schema...";
    let isUITab = false;

    if (activeTab === 'ui') {
      content = uiSchema;
      onChange = setUISchema;
      placeholder = "Enter UI Schema...";
      isUITab = true;
    } else if (activeTab === 'data') {
      content = formData;
      onChange = setFormData;
      placeholder = "Enter Form Data...";
    }

    if (showTemplates && isUITab) {
      return renderTemplates();
    }

    return (
      <div className="flex-1 flex flex-col min-h-0">
        {isUITab && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Settings className="h-4 w-4 text-slate-500" />
              <span className="text-sm text-slate-600 dark:text-slate-400">UI Schema Editor</span>
            </div>
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span>Templates</span>
            </button>
          </div>
        )}
        <textarea
          value={content}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full resize-none font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-h-0"
        />
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
        <div className="flex-1 p-6 overflow-hidden flex flex-col">
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