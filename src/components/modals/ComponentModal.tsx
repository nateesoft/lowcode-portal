import React, { useState, useEffect } from 'react';
import { X, Save, Code, Eye, Palette, Settings, FileText, Tag, Globe, Lock, FormInput } from 'lucide-react';
import { ComponentData, CreateComponentRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';

interface ComponentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (component: CreateComponentRequest) => Promise<void>;
  editingComponent?: ComponentData | null;
  userId?: number;
}

const componentTypes = [
  'button', 'input', 'card', 'modal', 'table', 'form', 'navigation', 
  'layout', 'display', 'feedback', 'data-entry', 'other'
];

const componentCategories = [
  'form', 'layout', 'navigation', 'display', 'feedback', 
  'data-entry', 'media', 'charts', 'other'
];

const ComponentModal: React.FC<ComponentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingComponent,
  userId = 1
}) => {
  const { showError } = useAlert();
  const [formData, setFormData] = useState<CreateComponentRequest>({
    name: '',
    description: '',
    type: 'button',
    category: 'form',
    props: {},
    styles: {},
    template: '',
    code: '',
    status: 'draft',
    isPublic: false,
    tags: [],
    userId,
    changeDescription: ''
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'design' | 'code' | 'jsonform' | 'settings'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [propsText, setPropsText] = useState('{}');
  const [stylesText, setStylesText] = useState('{}');
  const [jsonFormSchema, setJsonFormSchema] = useState('{}');
  const [jsonFormUiSchema, setJsonFormUiSchema] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingComponent) {
      setFormData({
        name: editingComponent.name,
        description: editingComponent.description || '',
        type: editingComponent.type,
        category: editingComponent.category,
        props: editingComponent.props || {},
        styles: editingComponent.styles || {},
        template: editingComponent.template || '',
        code: editingComponent.code || '',
        status: editingComponent.status || 'draft',
        isPublic: editingComponent.isPublic || false,
        tags: editingComponent.tags || [],
        userId,
        changeDescription: ''
      });
      setPropsText(JSON.stringify(editingComponent.props || {}, null, 2));
      setStylesText(JSON.stringify(editingComponent.styles || {}, null, 2));
      
      // Extract JSONForm schemas from props if they exist
      const props = editingComponent.props || {};
      setJsonFormSchema(JSON.stringify(props.jsonSchema || {}, null, 2));
      setJsonFormUiSchema(JSON.stringify(props.uiSchema || {}, null, 2));
    } else {
      // Reset for new component
      setFormData({
        name: '',
        description: '',
        type: 'button',
        category: 'form',
        props: {},
        styles: {},
        template: '',
        code: '',
        status: 'draft',
        isPublic: false,
        tags: [],
        userId,
        changeDescription: ''
      });
      setPropsText('{}');
      setStylesText('{}');
      setJsonFormSchema('{}');
      setJsonFormUiSchema('{}');
    }
    setTagInput('');
  }, [editingComponent, userId, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Parse JSON fields
      let props = {};
      let styles = {};
      let jsonSchema = {};
      let uiSchema = {};
      
      try {
        props = JSON.parse(propsText);
      } catch (e) {
        showError('Invalid JSON in props field');
        setIsLoading(false);
        return;
      }
      
      try {
        styles = JSON.parse(stylesText);
      } catch (e) {
        showError('Invalid JSON in styles field');
        setIsLoading(false);
        return;
      }
      
      try {
        jsonSchema = JSON.parse(jsonFormSchema);
      } catch (e) {
        showError('Invalid JSON in JSONForm schema field');
        setIsLoading(false);
        return;
      }
      
      try {
        uiSchema = JSON.parse(jsonFormUiSchema);
      } catch (e) {
        showError('Invalid JSON in JSONForm UI schema field');
        setIsLoading(false);
        return;
      }

      // Merge JSONForm schemas into props
      const mergedProps = {
        ...props,
        jsonSchema,
        uiSchema
      };

      const componentData = {
        ...formData,
        props: mergedProps,
        styles,
        changeDescription: formData.changeDescription || (editingComponent ? 'Component updated' : 'Component created')
      };

      await onSave(componentData);
      onClose();
    } catch (error) {
      console.error('Error saving component:', error);
      showError('Failed to save component');
    } finally {
      setIsLoading(false);
    }
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

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
            {editingComponent ? 'Edit Component' : 'Create New Component'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-[calc(90vh-200px)]">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { key: 'basic', label: 'Basic Info', icon: FileText },
              { key: 'design', label: 'Design', icon: Palette },
              { key: 'code', label: 'Code', icon: Code },
              { key: 'jsonform', label: 'JSONForm.io', icon: FormInput },
              { key: 'settings', label: 'Settings', icon: Settings }
            ].map(tab => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm transition ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Basic Info Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Component Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Enter component name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Type *
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      required
                    >
                      {componentTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      required
                    >
                      {componentCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    rows={3}
                    placeholder="Describe what this component does..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags?.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={addTag}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Design Tab */}
            {activeTab === 'design' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Template (HTML/JSX)
                  </label>
                  <textarea
                    value={formData.template}
                    onChange={(e) => setFormData({ ...formData, template: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    rows={8}
                    placeholder="<div className='component'>&#10;  <!-- Your component template -->&#10;</div>"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Props (JSON)
                    </label>
                    <textarea
                      value={propsText}
                      onChange={(e) => setPropsText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder='{\n  "variant": "primary",\n  "size": "medium"\n}'
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Styles (JSON)
                    </label>
                    <textarea
                      value={stylesText}
                      onChange={(e) => setStylesText(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={6}
                      placeholder='{\n  "backgroundColor": "#007bff",\n  "color": "white"\n}'
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === 'code' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Component Logic (JavaScript/TypeScript)
                  </label>
                  <textarea
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                    rows={12}
                    placeholder="function handleClick() {&#10;  console.log('Component action');&#10;}&#10;&#10;// Add your component logic here..."
                  />
                </div>
              </div>
            )}

            {/* JSONForm.io Tab */}
            {activeTab === 'jsonform' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      JSON Schema
                    </label>
                    <textarea
                      value={jsonFormSchema}
                      onChange={(e) => setJsonFormSchema(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={10}
                      placeholder={`{
  "type": "object",
  "properties": {
    "firstName": {
      "type": "string",
      "title": "First Name"
    },
    "lastName": {
      "type": "string",
      "title": "Last Name"
    },
    "email": {
      "type": "string",
      "format": "email",
      "title": "Email"
    }
  },
  "required": ["firstName", "lastName", "email"]
}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      UI Schema (Optional)
                    </label>
                    <textarea
                      value={jsonFormUiSchema}
                      onChange={(e) => setJsonFormUiSchema(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white font-mono text-sm"
                      rows={8}
                      placeholder={`{
  "firstName": {
    "ui:placeholder": "Enter your first name"
  },
  "lastName": {
    "ui:placeholder": "Enter your last name"
  },
  "email": {
    "ui:placeholder": "Enter your email address",
    "ui:help": "We'll never share your email"
  }
}`}
                    />
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">JSONForm.io Configuration</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mb-2">
                      This tab allows you to define form schemas using JSON Schema and UI Schema for dynamic form generation.
                    </p>
                    <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                      <li>• JSON Schema defines the data structure and validation rules</li>
                      <li>• UI Schema controls the appearance and behavior of form fields</li>
                      <li>• Both schemas will be stored in the component's props field</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="h-5 w-5 text-slate-500 mr-3" />
                    <div>
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white">Public Component</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Make this component available to all users</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Thumbnail URL
                  </label>
                  <input
                    type="url"
                    value={formData.thumbnailUrl || ''}
                    onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="https://example.com/component-thumbnail.png"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Change Description
                  </label>
                  <input
                    type="text"
                    value={formData.changeDescription}
                    onChange={(e) => setFormData({ ...formData, changeDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                    placeholder="Describe what changed in this version..."
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 p-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Component'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComponentModal;