import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Code, Eye, FileText, Move, Maximize2, Minimize2, Layout, Type, CheckSquare, List, Image, Tag, Settings, Plus, Trash2, Copy, Hash, Calendar, ToggleLeft, FileUp, Rows, Columns, Square, Layers, ChevronDown, ChevronRight } from 'lucide-react';
import { ComponentData, CreateComponentRequest } from '@/lib/api';
import { useAlert } from '@/contexts/AlertContext';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';
import { useAuth } from '@/contexts/AuthContext';

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
  userId
}) => {
  const { showError } = useAlert();
  const { user } = useAuth();
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
    userId: user?.id || userId || 1,
    changeDescription: ''
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'jsonform' | 'design' | 'code' | 'settings'>('basic');
  const [tagInput, setTagInput] = useState('');
  const [propsText, setPropsText] = useState('{}');
  const [stylesText, setStylesText] = useState('{}');
  const [jsonFormSchema, setJsonFormSchema] = useState(`{
  "type": "object",
  "title": "Custom Form",
  "properties": {
    "name": {
      "type": "string",
      "title": "Name",
      "default": ""
    },
    "email": {
      "type": "string",
      "title": "Email",
      "format": "email"
    }
  },
  "required": ["name", "email"]
}`);
  const [jsonFormUiSchema, setJsonFormUiSchema] = useState(`{
  "name": {
    "ui:placeholder": "Enter your name"
  },
  "email": {
    "ui:placeholder": "user@example.com",
    "ui:help": "We'll never share your email with anyone else."
  }
}`);
  const [jsonFormData, setJsonFormData] = useState(`{
  "name": "John Doe",
  "email": "john.doe@example.com"
}`);
  const [isLoading, setIsLoading] = useState(false);
  const [dragDropElements, setDragDropElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [showJsonPreview, setShowJsonPreview] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [jsonFormBuilderTab, setJsonFormBuilderTab] = useState('schema');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    layout: false,
    schema: false,
    elements: false
  });
  const [jsonFormDragDropElements, setJsonFormDragDropElements] = useState<any[]>([]);

  const jsonFormBuilderTabs = [
    { id: 'schema', name: 'JSON Schema', icon: Code },
    { id: 'ui', name: 'UI Schema', icon: Settings },
    { id: 'data', name: 'Form Data', icon: Copy },
    { id: 'designer', name: 'Visual Designer', icon: Layout }
  ];

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
  }
}`
    }
  ];

  const layoutElements = [
    { id: 'vertical', name: 'Vertical Layout', icon: Rows, type: 'layout', isContainer: true, direction: 'column', columns: 1 },
    { id: 'horizontal', name: 'Horizontal Layout', icon: Columns, type: 'layout', isContainer: true, direction: 'row', columns: 2 },
    { id: 'container', name: 'Container', icon: Square, type: 'layout', isContainer: true, direction: 'column', columns: 1 }
  ];

  const uiElements = [
    { id: 'text', name: 'Text Input', icon: Type, type: 'string', widget: 'text' },
    { id: 'email', name: 'Email', icon: Type, type: 'string', widget: 'email' },
    { id: 'password', name: 'Password', icon: Type, type: 'string', widget: 'password' },
    { id: 'number', name: 'Number', icon: Hash, type: 'number', widget: 'number' },
    { id: 'textarea', name: 'Textarea', icon: Type, type: 'string', widget: 'textarea' },
    { id: 'date', name: 'Date', icon: Calendar, type: 'string', widget: 'date' },
    { id: 'checkbox', name: 'Checkbox', icon: CheckSquare, type: 'boolean', widget: 'checkbox' },
    { id: 'radio', name: 'Radio', icon: ToggleLeft, type: 'string', widget: 'radio' },
    { id: 'select', name: 'Select', icon: List, type: 'string', widget: 'select' },
    { id: 'file', name: 'File Upload', icon: FileUp, type: 'string', widget: 'file' },
    { id: 'image', name: 'Image', icon: Image, type: 'string', widget: 'image' }
  ];

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
    setSelectedElement(null);
    setDragDropElements([]);
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
      if (dragDropElements.length > 0) {
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

    return generateHTML(dragDropElements);
  };

  const applyTemplate = (template: string) => {
    setJsonFormUiSchema(template);
    setShowTemplates(false);
  };

  // Parse JSON Schema to extract dynamic elements
  const dynamicElements = useMemo(() => {
    try {
      const schema = JSON.parse(jsonFormSchema);
      const elements: any[] = [];
      
      if (schema.properties) {
        Object.entries(schema.properties).forEach(([key, property]: [string, any]) => {
          const getWidgetFromType = (type: string, format?: string) => {
            if (format === 'email') return 'email';
            if (format === 'date') return 'date';
            if (type === 'string') return 'text';
            if (type === 'number' || type === 'integer') return 'number';
            if (type === 'boolean') return 'checkbox';
            if (type === 'array') return 'select';
            return 'text';
          };

          const getIconFromType = (type: string, format?: string) => {
            if (format === 'email') return 'email';
            if (format === 'date') return 'date';
            if (type === 'string') return 'text';
            if (type === 'number' || type === 'integer') return 'number';
            if (type === 'boolean') return 'checkbox';
            if (type === 'array') return 'select';
            return 'text';
          };

          elements.push({
            id: `schema_${key}`,
            name: property.title || key,
            icon: getIconFromType(property.type, property.format),
            type: property.type,
            widget: getWidgetFromType(property.type, property.format),
            isFromSchema: true,
            fieldName: key,
            schemaProperty: property
          });
        });
      }
      
      return elements;
    } catch (error) {
      return [];
    }
  }, [jsonFormSchema]);

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };

  const generateSchemaFromElements = () => {
    const properties: any = {};
    const uiSchemaElements: any[] = [];
    const required: string[] = [];

    // Generate JSON Schema
    jsonFormDragDropElements.forEach((element, index) => {
      if (element.isContainer) {
        // Handle containers
        if (element.children && element.children.length > 0) {
          element.children.forEach((child: any) => {
            const fieldName = child.fieldName || `field_${index + 1}_${child.id}`;
            properties[fieldName] = {
              type: child.type,
              title: child.title || child.name,
              ...(child.enum && { enum: child.enum }),
              ...(child.default !== undefined && { default: child.default })
            };

            if (child.required) {
              required.push(fieldName);
            }
          });
        }
      } else {
        // Handle regular elements
        const fieldName = element.fieldName || `field_${index + 1}`;
        properties[fieldName] = {
          type: element.type,
          title: element.title || element.name,
          ...(element.enum && { enum: element.enum }),
          ...(element.default !== undefined && { default: element.default })
        };

        if (element.required) {
          required.push(fieldName);
        }
      }
    });

    // Generate jsonforms.io compatible UI Schema
    jsonFormDragDropElements.forEach((element, index) => {
      if (element.isContainer) {
        // Create layout element
        const layoutType = element.direction === 'row' || element.id === 'horizontal' ? 'HorizontalLayout' : 'VerticalLayout';
        const layoutElement: any = {
          type: layoutType,
          elements: []
        };

        if (element.children && element.children.length > 0) {
          element.children.forEach((child: any) => {
            const fieldName = child.fieldName || `field_${index + 1}_${child.id}`;
            layoutElement.elements.push({
              type: 'Control',
              scope: `#/properties/${fieldName}`,
              ...(child.title && { label: child.title }),
              ...(child.placeholder || child.help ? {
                options: {
                  ...(child.placeholder && { placeholder: child.placeholder }),
                  ...(child.help && { help: child.help })
                }
              } : {})
            });
          });
        }

        uiSchemaElements.push(layoutElement);
      } else {
        // Create control element
        const fieldName = element.fieldName || `field_${index + 1}`;
        uiSchemaElements.push({
          type: 'Control',
          scope: `#/properties/${fieldName}`,
          ...(element.title && { label: element.title }),
          ...(element.placeholder || element.help ? {
            options: {
              ...(element.placeholder && { placeholder: element.placeholder }),
              ...(element.help && { help: element.help })
            }
          } : {})
        });
      }
    });

    const schema = {
      type: 'object',
      title: 'Generated Form',
      properties,
      ...(required.length > 0 && { required })
    };

    // Create the final UI Schema structure for jsonforms.io
    const uiSchema = uiSchemaElements.length === 1 
      ? uiSchemaElements[0] 
      : {
          type: 'VerticalLayout',
          elements: uiSchemaElements
        };

    // Debug logging
    console.log('Generated UI Schema (JSONForms.io format):', uiSchema);
    console.log('Generated JSON Schema:', schema);
    
    // Update both JSON Schema and UI Schema
    setJsonFormSchema(JSON.stringify(schema, null, 2));
    
    // Validate and update UI Schema
    try {
      const validatedUISchema = JSON.stringify(uiSchema, null, 2);
      JSON.parse(validatedUISchema); // Test if it's valid JSON
      setJsonFormUiSchema(validatedUISchema);
    } catch (error) {
      console.error('Generated UI Schema is invalid:', error);
      // Fall back to empty schema if validation fails
      setJsonFormUiSchema('{}');
    }
    
    // Keep current tab after generation
    
    return { schema, uiSchema };
  };

  const onJsonFormDragStart = (event: React.DragEvent, element: any) => {
    event.dataTransfer.setData('application/json', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const onJsonFormDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const onJsonFormDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    const newElement = {
      ...elementData,
      id: `${elementData.id}_${Date.now()}`,
      fieldName: elementData.type === 'layout' ? undefined : (elementData.fieldName || `${elementData.id}_${jsonFormDragDropElements.length + 1}`),
      title: elementData.name,
      placeholder: elementData.type === 'layout' ? undefined : (elementData.schemaProperty?.description || `Enter ${elementData.name.toLowerCase()}`),
      required: elementData.schemaProperty?.required || false,
      iconName: elementData.icon || elementData.id,
      children: elementData.isContainer ? [] : undefined,
      isFromSchema: elementData.isFromSchema || false,
      schemaProperty: elementData.schemaProperty
    };
    
    setJsonFormDragDropElements(prev => [...prev, newElement]);
  };

  const onDropToContainer = (event: React.DragEvent, containerId: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    if (elementData.isContainer) return;
    
    const newElement = {
      ...elementData,
      id: `${elementData.id}_${Date.now()}`,
      fieldName: `${elementData.id}_${Date.now()}`,
      title: elementData.name,
      placeholder: `Enter ${elementData.name.toLowerCase()}`,
      required: false,
      iconName: elementData.id,
      parentId: containerId
    };
    
    setJsonFormDragDropElements(prev => 
      prev.map(el => 
        el.id === containerId 
          ? { ...el, children: [...(el.children || []), newElement] }
          : el
      )
    );
  };

  const removeJsonFormElement = (elementId: string, parentId?: string) => {
    if (parentId) {
      setJsonFormDragDropElements(prev => 
        prev.map(el => 
          el.id === parentId 
            ? { ...el, children: el.children?.filter(child => child.id !== elementId) || [] }
            : el
        )
      );
    } else {
      setJsonFormDragDropElements(prev => prev.filter(el => el.id !== elementId));
    }
  };

  const updateJsonFormElement = (elementId: string, updates: any, parentId?: string) => {
    if (parentId) {
      setJsonFormDragDropElements(prev => 
        prev.map(el => 
          el.id === parentId 
            ? { 
                ...el, 
                children: el.children?.map(child => 
                  child.id === elementId ? { ...child, ...updates } : child
                ) || []
              }
            : el
        )
      );
    } else {
      setJsonFormDragDropElements(prev => 
        prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
      );
    }
  };

  const renderFormPreview = () => {
    try {
      const schema = JSON.parse(jsonFormSchema);
      const uiSchemaObj = JSON.parse(jsonFormUiSchema);
      const formDataObj = JSON.parse(jsonFormData);

      if (!schema.properties) {
        return (
          <div className="text-center py-8">
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400">No schema properties found</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Please add properties to your JSON Schema</p>
          </div>
        );
      }

      return (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {schema.title || 'Form Preview'}
          </h3>
          <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg border">
            {renderUISchemaElement(uiSchemaObj, schema, formDataObj)}
          </div>
        </div>
      );
    } catch (error) {
      console.error('Form preview error:', error);
      return (
        <div className="text-center py-8">
          <Eye className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-500 dark:text-red-400">Error rendering form preview</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">{(error as Error).message}</p>
        </div>
      );
    }
  };

  const renderUISchemaElement = (uiElement: any, schema: any, formData: any): React.ReactNode => {
    if (!uiElement || !uiElement.type) {
      // Fallback: render all fields if no UI schema
      return Object.keys(schema.properties).map(key => {
        const property = schema.properties[key];
        const value = formData[key] || property.default || '';
        const isRequired = schema.required?.includes(key);
        const inputClassName = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white";
        
        return (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {property.title || key} {isRequired && <span className="text-red-500">*</span>}
            </label>
            {renderFieldByType(property, value, inputClassName, {})}
          </div>
        );
      });
    }

    switch (uiElement.type) {
      case 'HorizontalLayout':
        return (
          <div key={Math.random()} className="grid grid-cols-2 gap-4">
            {uiElement.elements?.map((element: any, index: number) => (
              <div key={index}>
                {renderUISchemaElement(element, schema, formData)}
              </div>
            ))}
          </div>
        );
      
      case 'VerticalLayout':
        return (
          <div key={Math.random()} className="space-y-4">
            {uiElement.elements?.map((element: any, index: number) => (
              <div key={index}>
                {renderUISchemaElement(element, schema, formData)}
              </div>
            ))}
          </div>
        );
      
      case 'Control':
        const fieldName = uiElement.scope?.replace('#/properties/', '');
        if (!fieldName || !schema.properties[fieldName]) {
          return null;
        }
        
        const property = schema.properties[fieldName];
        const value = formData[fieldName] || property.default || '';
        const isRequired = schema.required?.includes(fieldName);
        const label = uiElement.label || property.title || fieldName;
        const options = uiElement.options || {};
        const inputClassName = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white";
        
        return (
          <div key={fieldName} className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {label} {isRequired && <span className="text-red-500">*</span>}
            </label>
            {renderFieldByType(property, value, inputClassName, options)}
            {options.help && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{options.help}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  const renderFieldByType = (property: any, value: any, inputClassName: string, options: any) => {
    const placeholder = options.placeholder || `Enter ${property.title || 'value'}`;
    
    if (property.type === 'string' && property.format === 'email') {
      return (
        <input
          type="email"
          placeholder={placeholder}
          defaultValue={value}
          className={inputClassName}
          disabled
        />
      );
    } else if (property.type === 'string' && property.format === 'date') {
      return (
        <input
          type="date"
          defaultValue={value}
          className={inputClassName}
          disabled
        />
      );
    } else if (property.type === 'string') {
      return (
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={value}
          className={inputClassName}
          disabled
        />
      );
    } else if (property.type === 'number' || property.type === 'integer') {
      return (
        <input
          type="number"
          placeholder={placeholder}
          defaultValue={value}
          min={property.minimum}
          max={property.maximum}
          className={inputClassName}
          disabled
        />
      );
    } else if (property.type === 'boolean') {
      return (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            defaultChecked={value}
            className="rounded border-slate-300 dark:border-slate-600"
            disabled
          />
          <span className="text-sm text-slate-700 dark:text-slate-300">{property.title}</span>
        </div>
      );
    } else if (property.enum) {
      return (
        <select defaultValue={value} className={inputClassName} disabled>
          <option value="">Select {property.title || 'option'}</option>
          {property.enum.map((option: any) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    } else {
      return (
        <input
          type="text"
          placeholder={placeholder}
          defaultValue={value}
          className={inputClassName}
          disabled
        />
      );
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
    
    setDragDropElements(prev => [...prev, newElement]);
  };

  const removeBuilderElement = (elementId: string) => {
    setDragDropElements(prev => prev.filter(el => el.id !== elementId));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const updateBuilderElement = (elementId: string, updates: any) => {
    setDragDropElements(prev => 
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
              { key: 'jsonform', label: 'Custom JsonForm', icon: Layout }
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

              {/* JSONForm Builder Tab */}
              {activeTab === 'jsonform' && (
                <div className="flex-1 flex flex-col min-h-0">
                  {/* JSONForm Sub-tabs */}
                  <div className="flex border-b border-slate-200 dark:border-slate-700">
                    {jsonFormBuilderTabs.map((tab) => {
                      const IconComponent = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setJsonFormBuilderTab(tab.id)}
                          className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                            jsonFormBuilderTab === tab.id
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

                  {/* Content Area - Split Pane */}
                  <div className="flex-1 overflow-hidden flex">
                    {/* Left Panel - Main Content */}
                    <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
                      <div className="p-6 flex-1 overflow-hidden flex flex-col">
                        {jsonFormBuilderTab === 'designer' ? (
                          // Visual Designer
                          <div className="flex-1 flex min-h-0">
                            {/* Tools Panel */}
                            <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
                              <div className="p-4 flex-1 overflow-y-auto">
                                {/* Layout Elements */}
                                <div className="mb-6">
                                  <button
                                    type="button"
                                    onClick={() => toggleSection('layout')}
                                    className="w-full flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white mb-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                                  >
                                    <span>Layout</span>
                                    {collapsedSections.layout ? (
                                      <ChevronRight className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </button>
                                  {!collapsedSections.layout && (
                                    <div className="space-y-2 transition-all duration-200 ease-in-out">
                                      {layoutElements.map((element) => {
                                        const IconComponent = element.icon;
                                        return (
                                          <div
                                            key={element.id}
                                            draggable
                                            onDragStart={(e) => onJsonFormDragStart(e, element)}
                                            className="flex items-center space-x-2 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-600 rounded-lg cursor-move hover:border-blue-400 dark:hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors shadow-sm"
                                          >
                                            <IconComponent className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                                            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">{element.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>

                                {/* Dynamic Elements from Schema */}
                                {dynamicElements.length > 0 && (
                                  <div className="mb-6">
                                    <button
                                      type="button"
                                      onClick={() => toggleSection('schema')}
                                      className="w-full flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white mb-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <Layers className="h-4 w-4" />
                                        <span>From Schema</span>
                                      </div>
                                      {collapsedSections.schema ? (
                                        <ChevronRight className="h-4 w-4" />
                                      ) : (
                                        <ChevronDown className="h-4 w-4" />
                                      )}
                                    </button>
                                    {!collapsedSections.schema && (
                                      <div className="space-y-2 transition-all duration-200 ease-in-out">
                                        {dynamicElements.map((element) => {
                                          const getIconComponent = (iconName: string) => {
                                            const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                                              text: Type,
                                              email: Type,
                                              password: Type,
                                              number: Hash,
                                              textarea: Type,
                                              date: Calendar,
                                              checkbox: CheckSquare,
                                              radio: ToggleLeft,
                                              select: List,
                                              file: FileUp,
                                              image: Image
                                            };
                                            return iconMap[iconName] || Type;
                                          };
                                          
                                          const IconComponent = getIconComponent(element.icon);
                                          
                                          return (
                                            <div
                                              key={element.id}
                                              draggable
                                              onDragStart={(e) => onJsonFormDragStart(e, element)}
                                              className="flex items-center space-x-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-600 rounded-lg cursor-move hover:border-green-400 dark:hover:border-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 transition-colors shadow-sm"
                                            >
                                              <IconComponent className="h-4 w-4 text-green-700 dark:text-green-300" />
                                              <span className="text-sm font-medium text-green-800 dark:text-green-200">{element.name}</span>
                                              <div className="ml-auto">
                                                <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                                                  {element.type}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Form Elements */}
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => toggleSection('elements')}
                                    className="w-full flex items-center justify-between text-sm font-medium text-slate-900 dark:text-white mb-3 hover:bg-slate-50 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors"
                                  >
                                    <span>Form Elements</span>
                                    {collapsedSections.elements ? (
                                      <ChevronRight className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </button>
                                  {!collapsedSections.elements && (
                                    <div className="space-y-2 transition-all duration-200 ease-in-out">
                                      {uiElements.map((element) => {
                                        const IconComponent = element.icon;
                                        return (
                                          <div
                                            key={element.id}
                                            draggable
                                            onDragStart={(e) => onJsonFormDragStart(e, element)}
                                            className="flex items-center space-x-2 p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-move hover:border-slate-400 dark:hover:border-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-sm"
                                          >
                                            <IconComponent className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{element.name}</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Floating Generate JSON Button */}
                                <button
                                  type="button"
                                  onClick={generateSchemaFromElements}
                                  className="fixed bottom-6 left-6 z-50 flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-full shadow-lg hover:bg-green-700 hover:shadow-xl transition-all transform hover:scale-105"
                                  title="Generate JSON Schema"
                                >
                                  <Code className="h-5 w-5" />
                                  <span className="hidden sm:inline">Generate JSON</span>
                                </button>
                              </div>
                            </div>

                            {/* Drop Area */}
                            <div className="flex-1 p-4">
                              <div
                                onDragOver={onJsonFormDragOver}
                                onDrop={onJsonFormDrop}
                                className={`h-full border-2 border-dashed rounded-lg p-4 transition-colors overflow-y-auto ${
                                  jsonFormDragDropElements.length === 0 
                                    ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50' 
                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                                }`}
                              >
                                {jsonFormDragDropElements.length === 0 ? (
                                  <div className="h-full flex items-center justify-center">
                                    <div className="text-center">
                                      <Layout className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                        Drag & Drop Form Elements
                                      </h3>
                                      <p className="text-slate-500 dark:text-slate-400">
                                        Drag elements from the left panel to build your form
                                      </p>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 sticky top-0 bg-white dark:bg-slate-800 pb-2 border-b border-slate-200 dark:border-slate-700">Form Preview</h3>
                                    {jsonFormDragDropElements.map((element) => {
                                      const getIconComponent = (iconName: string) => {
                                        const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
                                          text: Type,
                                          email: Type,
                                          password: Type,
                                          number: Hash,
                                          textarea: Type,
                                          date: Calendar,
                                          checkbox: CheckSquare,
                                          radio: ToggleLeft,
                                          select: List,
                                          file: FileUp,
                                          image: Image,
                                          vertical: Rows,
                                          horizontal: Columns,
                                          container: Square
                                        };
                                        return iconMap[iconName] || Type;
                                      };
                                      
                                      const IconComponent = getIconComponent(element.iconName || element.id);
                                      
                                      // Render container layout
                                      if (element.isContainer) {
                                        return (
                                          <div key={element.id} className="group relative border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg bg-blue-50/50 dark:bg-blue-900/10 p-4">
                                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                              <button
                                                type="button"
                                                onClick={() => removeJsonFormElement(element.id)}
                                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                              >
                                                <X className="h-4 w-4" />
                                              </button>
                                            </div>

                                            <div className="flex items-center space-x-2 mb-3">
                                              <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                                {element.title}
                                              </span>
                                              <span className="text-xs text-blue-500 dark:text-blue-400">
                                                ({element.direction === 'row' ? 'Horizontal' : 'Vertical'})
                                              </span>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-3">
                                              <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                  Direction
                                                </label>
                                                <select
                                                  value={element.direction || 'column'}
                                                  onChange={(e) => updateJsonFormElement(element.id, { direction: e.target.value })}
                                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                >
                                                  <option value="column">Vertical</option>
                                                  <option value="row">Horizontal</option>
                                                </select>
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                  Columns/Rows
                                                </label>
                                                <input
                                                  type="number"
                                                  min="1"
                                                  max="12"
                                                  value={element.columns || 1}
                                                  onChange={(e) => updateJsonFormElement(element.id, { columns: parseInt(e.target.value) })}
                                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                />
                                              </div>
                                              <div>
                                                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                  Gap
                                                </label>
                                                <select
                                                  value={element.gap || 'medium'}
                                                  onChange={(e) => updateJsonFormElement(element.id, { gap: e.target.value })}
                                                  className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                >
                                                  <option value="small">Small</option>
                                                  <option value="medium">Medium</option>
                                                  <option value="large">Large</option>
                                                </select>
                                              </div>
                                            </div>

                                            <div
                                              onDragOver={onJsonFormDragOver}
                                              onDrop={(e) => onDropToContainer(e, element.id)}
                                              className={`min-h-[100px] border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-2 transition-colors ${
                                                element.children && element.children.length > 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50 dark:bg-slate-700'
                                              }`}
                                              style={{
                                                display: element.direction === 'row' ? 'flex' : 'block',
                                                flexDirection: element.direction === 'row' ? 'row' : 'column',
                                                gap: element.gap === 'small' ? '8px' : element.gap === 'large' ? '16px' : '12px'
                                              }}
                                            >
                                              {element.children && element.children.length > 0 ? (
                                                element.children.map((child: any) => {
                                                  const ChildIconComponent = getIconComponent(child.iconName || child.id);
                                                  return (
                                                    <div key={child.id} className="group relative p-3 border border-slate-200 dark:border-slate-700 rounded bg-white dark:bg-slate-800 flex-1">
                                                      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                          type="button"
                                                          onClick={() => removeJsonFormElement(child.id, element.id)}
                                                          className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs"
                                                        >
                                                          <X className="h-3 w-3" />
                                                        </button>
                                                      </div>

                                                      <div className="flex items-center space-x-2 mb-2">
                                                        <ChildIconComponent className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                                          {child.title}
                                                        </span>
                                                      </div>

                                                      <div className="space-y-2">
                                                        <input
                                                          type="text"
                                                          value={child.fieldName || ''}
                                                          onChange={(e) => updateJsonFormElement(child.id, { fieldName: e.target.value }, element.id)}
                                                          placeholder="Field name"
                                                          className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                        />
                                                        <input
                                                          type="text"
                                                          value={child.placeholder || ''}
                                                          onChange={(e) => updateJsonFormElement(child.id, { placeholder: e.target.value }, element.id)}
                                                          placeholder="Placeholder"
                                                          className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                                        />
                                                      </div>
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500">
                                                  <div className="text-center">
                                                    <Layout className="h-8 w-8 mx-auto mb-2" />
                                                    <p className="text-xs">Drop form elements here</p>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      }

                                      // Render regular form element
                                      return (
                                        <div key={element.id} className="group relative p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800">
                                          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                              type="button"
                                              onClick={() => removeJsonFormElement(element.id)}
                                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>

                                          <div className="flex items-center space-x-2 mb-3">
                                            <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                              {element.title}
                                            </span>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div>
                                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                Field Name
                                              </label>
                                              <input
                                                type="text"
                                                value={element.fieldName || ''}
                                                onChange={(e) => updateJsonFormElement(element.id, { fieldName: e.target.value })}
                                                className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                              />
                                            </div>
                                            <div>
                                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                Title
                                              </label>
                                              <input
                                                type="text"
                                                value={element.title}
                                                onChange={(e) => updateJsonFormElement(element.id, { title: e.target.value })}
                                                className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                              />
                                            </div>
                                          </div>

                                          <div className="grid grid-cols-2 gap-3">
                                            <div>
                                              <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                                                Placeholder
                                              </label>
                                              <input
                                                type="text"
                                                value={element.placeholder || ''}
                                                onChange={(e) => updateJsonFormElement(element.id, { placeholder: e.target.value })}
                                                className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                              />
                                            </div>
                                            <div className="flex items-center">
                                              <label className="flex items-center space-x-2">
                                                <input
                                                  type="checkbox"
                                                  checked={element.required || false}
                                                  onChange={(e) => updateJsonFormElement(element.id, { required: e.target.checked })}
                                                  className="rounded border-slate-300 dark:border-slate-600"
                                                />
                                                <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Required</span>
                                              </label>
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
                        ) : (
                          // Schema/UI/Data Editors
                          <div className="flex-1 flex flex-col min-h-0">
                            {jsonFormBuilderTab === 'ui' && (
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center space-x-2">
                                  <Settings className="h-4 w-4 text-slate-500" />
                                  <span className="text-sm text-slate-600 dark:text-slate-400">UI Schema Editor</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => setShowTemplates(true)}
                                  className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                  <FileText className="h-4 w-4" />
                                  <span>Templates</span>
                                </button>
                              </div>
                            )}
                            
                            {showTemplates && jsonFormBuilderTab === 'ui' ? (
                              <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
                                <div className="flex items-center justify-between">
                                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">UI Schema Templates</h3>
                                  <button
                                    type="button"
                                    onClick={() => setShowTemplates(false)}
                                    className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {uiTemplates.map((template) => (
                                    <div 
                                      key={template.id} 
                                      className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-blue-300 dark:hover:border-blue-500 cursor-pointer transition-colors" 
                                      onClick={() => applyTemplate(template.template)}
                                    >
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
                            ) : (
                              <textarea
                                value={
                                  jsonFormBuilderTab === 'schema' ? jsonFormSchema :
                                  jsonFormBuilderTab === 'ui' ? jsonFormUiSchema :
                                  jsonFormData
                                }
                                onChange={(e) => {
                                  if (jsonFormBuilderTab === 'schema') {
                                    setJsonFormSchema(e.target.value);
                                  } else if (jsonFormBuilderTab === 'ui') {
                                    setJsonFormUiSchema(e.target.value);
                                  } else {
                                    setJsonFormData(e.target.value);
                                  }
                                }}
                                placeholder={
                                  jsonFormBuilderTab === 'schema' ? 'Enter JSON Schema...' :
                                  jsonFormBuilderTab === 'ui' ? 'Enter UI Schema...' :
                                  'Enter Form Data...'
                                }
                                className="flex-1 w-full resize-none font-mono text-sm border border-slate-300 dark:border-slate-600 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-white min-h-0"
                              />
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Panel - Preview */}
                    <div className="w-96 bg-slate-50 dark:bg-slate-700 flex flex-col">
                      <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Eye className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Preview</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              showPreview 
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50' 
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50'
                            }`}
                          >
                            <Eye className="h-4 w-4" />
                            <span>{showPreview ? 'Hide' : 'Show'}</span>
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex-1 overflow-hidden">
                        {showPreview ? (
                          <div className="h-full overflow-y-auto p-4">
                            {renderFormPreview()}
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center p-4">
                            <div className="text-center">
                              <Eye className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                              <h4 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Preview Ready
                              </h4>
                              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                                Click "Show" to preview your form
                              </p>
                              <button
                                onClick={() => setShowPreview(true)}
                                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Show Preview</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {(activeTab === 'design') && (
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