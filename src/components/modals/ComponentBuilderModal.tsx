import React, { useState, useEffect } from 'react';
import { X, Save, Code, Eye, FileText, Move, Maximize2, Minimize2, Layout, Type, CheckSquare, List, Image, Tag } from 'lucide-react';
import { ComponentData, CreateComponentRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';

interface ComponentBuilderModalProps {
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

const htmlElements = [
  { id: 'div', name: 'Container (div)', icon: Layout, tag: 'div', type: 'layout' },
  { id: 'section', name: 'Section', icon: Layout, tag: 'section', type: 'layout' },
  { id: 'header', name: 'Header', icon: Layout, tag: 'header', type: 'layout' },
  { id: 'main', name: 'Main', icon: Layout, tag: 'main', type: 'layout' },
  { id: 'aside', name: 'Aside', icon: Layout, tag: 'aside', type: 'layout' },
  { id: 'footer', name: 'Footer', icon: Layout, tag: 'footer', type: 'layout' },
  { id: 'h1', name: 'Heading 1', icon: Type, tag: 'h1', type: 'text', content: 'Heading 1' },
  { id: 'h2', name: 'Heading 2', icon: Type, tag: 'h2', type: 'text', content: 'Heading 2' },
  { id: 'h3', name: 'Heading 3', icon: Type, tag: 'h3', type: 'text', content: 'Heading 3' },
  { id: 'p', name: 'Paragraph', icon: Type, tag: 'p', type: 'text', content: 'Your paragraph text here' },
  { id: 'span', name: 'Span', icon: Type, tag: 'span', type: 'text', content: 'Text' },
  { id: 'button', name: 'Button', icon: CheckSquare, tag: 'button', type: 'interactive', content: 'Click me' },
  { id: 'input', name: 'Input', icon: Type, tag: 'input', type: 'form', attributes: { type: 'text', placeholder: 'Enter text' } },
  { id: 'textarea', name: 'Textarea', icon: Type, tag: 'textarea', type: 'form', attributes: { placeholder: 'Enter text', rows: '3' } },
  { id: 'select', name: 'Select', icon: List, tag: 'select', type: 'form' },
  { id: 'img', name: 'Image', icon: Image, tag: 'img', type: 'media', attributes: { src: 'https://via.placeholder.com/150', alt: 'Image' } },
  { id: 'a', name: 'Link', icon: Type, tag: 'a', type: 'interactive', content: 'Link text', attributes: { href: '#' } }
];

const ComponentBuilderModal: React.FC<ComponentBuilderModalProps> = ({
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

  const [activeTab, setActiveTab] = useState<'basic' | 'builder' | 'design' | 'code' | 'jsonform' | 'settings'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [propsText, setPropsText] = useState('{}');
  const [stylesText, setStylesText] = useState('{}');
  const [jsonFormSchema, setJsonFormSchema] = useState('{}');
  const [jsonFormUiSchema, setJsonFormUiSchema] = useState('{}');
  const [isLoading, setIsLoading] = useState(false);
  const [builderElements, setBuilderElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);

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
    setBuilderElements([]);
    setSelectedElement(null);
  }, [editingComponent, userId, isOpen]);

  // Reset position when modal opens
  useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

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

      // Generate template from builder if elements exist
      let finalTemplate = formData.template;
      if (builderElements.length > 0) {
        finalTemplate = generateTemplateFromBuilder();
      }

      // Merge JSONForm schemas into props
      const mergedProps = {
        ...props,
        jsonSchema,
        uiSchema
      };

      const componentData = {
        ...formData,
        template: finalTemplate,
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

  const generateTemplateFromBuilder = () => {
    const generateHTML = (elements: any[], indent = 0) => {
      const indentStr = '  '.repeat(indent);
      return elements.map(element => {
        const { tag, content, attributes, children } = element;
        const attrs = attributes ? ' ' + Object.entries(attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ') : '';
        
        if (children && children.length > 0) {
          return `${indentStr}<${tag}${attrs}>\n${generateHTML(children, indent + 1)}\n${indentStr}</${tag}>`;
        } else if (content) {
          return `${indentStr}<${tag}${attrs}>${content}</${tag}>`;
        } else if (['input', 'img', 'br', 'hr'].includes(tag)) {
          return `${indentStr}<${tag}${attrs} />`;
        } else {
          return `${indentStr}<${tag}${attrs}></${tag}>`;
        }
      }).join('\n');
    };

    return generateHTML(builderElements);
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

  const onDragStart = (event: React.DragEvent, element: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const onDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    const newElement = {
      ...elementData,
      id: `${elementData.id}_${Date.now()}`,
      iconName: elementData.id, // Store icon name instead of icon component
      children: elementData.type === 'layout' ? [] : undefined
    };
    
    setBuilderElements(prev => [...prev, newElement]);
  };

  const removeBuilderElement = (elementId: string) => {
    setBuilderElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const updateBuilderElement = (elementId: string, updates: any) => {
    setBuilderElements(prev => 
      prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
    );
    if (selectedElement?.id === elementId) {
      setSelectedElement({ ...selectedElement, ...updates });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-7xl h-[95vh] flex flex-col"
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

        {/* Header */}
        <div 
          ref={dragRef}
          className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700"
          style={dragHandleStyle}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Code className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingComponent ? 'Edit Component' : 'Component Builder'}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Create and customize components with visual builder
              </p>
            </div>
          </div>
          
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
              className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          {/* Tab Navigation */}
          <div className="flex border-b border-slate-200 dark:border-slate-700">
            {[
              { key: 'basic', label: 'Basic Info', icon: FileText },
              { key: 'builder', label: 'Visual Builder', icon: Layout }
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

          <div className="flex-1 overflow-hidden flex">
            {/* Main Content */}
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

              {/* Visual Builder Tab */}
              {activeTab === 'builder' && (
                <div className="flex-1 flex min-h-0">
                  {/* Tools Panel */}
                  <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
                    <div className="p-4 flex-1 overflow-y-auto">
                      <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-3">HTML Elements</h3>
                      <div className="space-y-2">
                        {htmlElements.map((element) => {
                          const IconComponent = element.icon;
                          return (
                            <div
                              key={element.id}
                              draggable
                              onDragStart={(e) => onDragStart(e, element)}
                              className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-move hover:border-slate-400 dark:hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                            >
                              <IconComponent className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{element.name}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, template: generateTemplateFromBuilder() })}
                          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <Code className="h-4 w-4" />
                          <span>Generate HTML</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Drop Area */}
                  <div className="flex-1 p-4">
                    <div
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                      className={`h-full border-2 border-dashed rounded-lg p-4 transition-colors overflow-y-auto ${
                        builderElements.length === 0 
                          ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50' 
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      {builderElements.length === 0 ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="text-center">
                            <Layout className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                              Drag & Drop HTML Elements
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400">
                              Drag elements from the left panel to build your component
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Component Preview</h3>
                          {builderElements.map((element) => {
                            const getIconComponent = (iconName: string) => {
                              const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                                div: Layout,
                                section: Layout,
                                header: Layout,
                                main: Layout,
                                aside: Layout,
                                footer: Layout,
                                h1: Type,
                                h2: Type,
                                h3: Type,
                                p: Type,
                                span: Type,
                                button: CheckSquare,
                                input: Type,
                                textarea: Type,
                                select: List,
                                img: Image,
                                a: Type
                              };
                              return iconMap[iconName] || Layout;
                            };
                            
                            const IconComponent = getIconComponent(element.iconName || element.id);
                            return (
                              <div key={element.id} className="group relative p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => removeBuilderElement(element.id)}
                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>

                                <div className="flex items-center space-x-2 mb-3">
                                  <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {element.name}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                      Content
                                    </label>
                                    <input
                                      type="text"
                                      value={element.content || ''}
                                      onChange={(e) => updateBuilderElement(element.id, { content: e.target.value })}
                                      className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      placeholder="Element content"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                      CSS Classes
                                    </label>
                                    <input
                                      type="text"
                                      value={element.className || ''}
                                      onChange={(e) => updateBuilderElement(element.id, { className: e.target.value })}
                                      className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                      placeholder="CSS classes"
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {(activeTab === 'builder' || activeTab === 'design') && (
              <div className="w-96 border-l border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Live Preview</h3>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="bg-white dark:bg-slate-800 rounded-lg p-4 border">
                    {formData.template ? (
                      <div dangerouslySetInnerHTML={{ __html: formData.template }} />
                    ) : (
                      <div className="text-center py-8">
                        <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400">No template to preview</p>
                      </div>
                    )}
                  </div>
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

export default ComponentBuilderModal;