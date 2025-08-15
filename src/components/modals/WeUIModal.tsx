import React, { useState, useMemo } from 'react';
import { X, Code, Save, Eye, Settings, Plus, Trash2, Copy, FileText, Layout, Type, Hash, Calendar, CheckSquare, ToggleLeft, List, Image, FileUp, Rows, Columns, Square, Layers, ChevronDown, ChevronRight, Maximize2, Minimize2, Move } from 'lucide-react';
import { useModalDragAndResize } from '@/hooks/useModalDragAndResize';

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
  const [dragDropElements, setDragDropElements] = useState<any[]>([]);
  const [dragDropSchema, setDragDropSchema] = useState('{}');
  const [showPreview, setShowPreview] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    layout: false,
    schema: false,
    elements: false
  });
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

  const toggleSection = (sectionName: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionName]: !prev[sectionName]
    }));
  };
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

  const tabs = [
    { id: 'schema', name: 'JSON Schema', icon: Code },
    { id: 'ui', name: 'UI Schema', icon: Settings },
    { id: 'data', name: 'Form Data', icon: Copy },
    { id: 'designer', name: 'Visual Designer', icon: Layout }
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

  const handleSaveSchema = () => {
    // Generate schema from drag-drop elements if in designer mode
    if (activeTab === 'designer' && dragDropElements.length > 0) {
      const generatedSchema = generateSchemaFromElements();
      console.log('Saving WeUI Schema (Generated):', generatedSchema);
    } else {
      console.log('Saving WeUI Schema:', { jsonSchema, uiSchema, formData });
    }
    onClose();
  };

  const generateSchemaFromElements = () => {
    const properties: any = {};
    const uiSchemaElements: any[] = [];
    const required: string[] = [];

    // Generate JSON Schema
    dragDropElements.forEach((element, index) => {
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
    dragDropElements.forEach((element, index) => {
      if (element.isContainer) {
        // Create layout element
        const layoutType = element.direction === 'row' ? 'HorizontalLayout' : 'VerticalLayout';
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

    // Update only JSON Schema, UI Schema will be updated separately
    setJsonSchema(JSON.stringify(schema, null, 2));
    
    // Validate and update UI Schema
    try {
      const validatedUISchema = JSON.stringify(uiSchema, null, 2);
      JSON.parse(validatedUISchema); // Test if it's valid JSON
      setUISchema(validatedUISchema);
    } catch (error) {
      console.error('Generated UI Schema is invalid:', error);
      // Fall back to empty schema if validation fails
      setUISchema('{}');
    }

    // Switch to UI Schema tab after generation
    // setActiveTab('ui');

    return { schema, uiSchema };
  };

  // Parse JSON Schema to extract dynamic elements
  const dynamicElements = useMemo(() => {
    try {
      const schema = JSON.parse(jsonSchema);
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
  }, [jsonSchema]);

  const renderPreview = () => {
    const renderFormElement = (schema: any, uiElement: any, formDataObj: any) => {
      if (!uiElement || !schema) return null;

      // Handle layout elements
      if (uiElement.type === 'HorizontalLayout' || uiElement.type === 'VerticalLayout') {
        return (
          <div 
            key={`layout-${Math.random()}`}
            className={`${uiElement.type === 'HorizontalLayout' ? 'flex space-x-4' : 'space-y-4'}`}
          >
            {uiElement.elements?.map((element: any, index: number) => 
              renderFormElement(schema, element, formDataObj)
            )}
          </div>
        );
      }

      // Handle control elements
      if (uiElement.type === 'Control') {
        const scope = uiElement.scope;
        const fieldName = scope?.replace('#/properties/', '');
        const property = schema.properties?.[fieldName];
        
        if (!property) return null;

        const label = uiElement.label || property.title || fieldName;
        const placeholder = uiElement.options?.placeholder || `Enter ${label.toLowerCase()}`;
        const help = uiElement.options?.help;
        const isRequired = schema.required?.includes(fieldName);
        const value = formDataObj[fieldName] || property.default || '';

        const inputClassName = "w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white";

        return (
          <div key={fieldName} className="space-y-1">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
              {label} {isRequired && '*'}
            </label>
            
            {property.type === 'string' && property.format === 'email' ? (
              <input
                type="email"
                placeholder={placeholder}
                defaultValue={value}
                className={inputClassName}
              />
            ) : property.type === 'string' && property.format === 'date' ? (
              <input
                type="date"
                defaultValue={value}
                className={inputClassName}
              />
            ) : property.type === 'string' ? (
              <input
                type="text"
                placeholder={placeholder}
                defaultValue={value}
                className={inputClassName}
              />
            ) : property.type === 'number' || property.type === 'integer' ? (
              <input
                type="number"
                placeholder={placeholder}
                defaultValue={value}
                min={property.minimum}
                max={property.maximum}
                className={inputClassName}
              />
            ) : property.type === 'boolean' ? (
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  defaultChecked={value}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">{label}</span>
              </div>
            ) : (
              <input
                type="text"
                placeholder={placeholder}
                defaultValue={value}
                className={inputClassName}
              />
            )}
            
            {help && (
              <p className="text-xs text-slate-500 dark:text-slate-400">{help}</p>
            )}
          </div>
        );
      }

      return null;
    };

    try {
      const schema = JSON.parse(jsonSchema);
      const uiSchemaObj = JSON.parse(uiSchema);
      const formDataObj = JSON.parse(formData);

      return (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Form Preview - {schema.title || 'Generated Form'}
          </h3>
          <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg border">
            {renderFormElement(schema, uiSchemaObj, formDataObj)}
          </div>
        </div>
      );
    } catch (error) {
      return (
        <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Form Preview</h3>
          <div className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-lg border">
            <div className="text-center py-8">
              <div className="text-slate-500 dark:text-slate-400">
                <Eye className="h-12 w-12 mx-auto mb-4" />
                <p className="text-lg font-medium mb-2">Preview Not Available</p>
                <p className="text-sm">Invalid JSON Schema or UI Schema format</p>
                <p className="text-xs mt-2">Please check your JSON syntax and try generating again</p>
              </div>
            </div>
          </div>
        </div>
      );
    }
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
      fieldName: elementData.type === 'layout' ? undefined : (elementData.fieldName || `${elementData.id}_${dragDropElements.length + 1}`),
      title: elementData.name,
      placeholder: elementData.type === 'layout' ? undefined : (elementData.schemaProperty?.description || `Enter ${elementData.name.toLowerCase()}`),
      required: elementData.schemaProperty?.required || false,
      iconName: elementData.icon || elementData.id, // Store icon name instead of icon component
      children: elementData.isContainer ? [] : undefined, // Add children array for containers
      isFromSchema: elementData.isFromSchema || false,
      schemaProperty: elementData.schemaProperty
    };
    
    setDragDropElements(prev => [...prev, newElement]);
  };

  const onDropToContainer = (event: React.DragEvent, containerId: string) => {
    event.preventDefault();
    event.stopPropagation();
    
    const elementData = JSON.parse(event.dataTransfer.getData('application/json'));
    
    // Don't allow containers inside containers for simplicity
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
    
    setDragDropElements(prev => 
      prev.map(el => 
        el.id === containerId 
          ? { ...el, children: [...(el.children || []), newElement] }
          : el
      )
    );
  };

  const removeElement = (elementId: string, parentId?: string) => {
    if (parentId) {
      // Remove from container
      setDragDropElements(prev => 
        prev.map(el => 
          el.id === parentId 
            ? { ...el, children: el.children?.filter(child => child.id !== elementId) || [] }
            : el
        )
      );
    } else {
      // Remove from root
      setDragDropElements(prev => prev.filter(el => el.id !== elementId));
    }
  };

  const updateElement = (elementId: string, updates: any, parentId?: string) => {
    if (parentId) {
      // Update element inside container
      setDragDropElements(prev => 
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
      // Update root element
      setDragDropElements(prev => 
        prev.map(el => el.id === elementId ? { ...el, ...updates } : el)
      );
    }
  };

  const renderDesigner = () => {
    return (
      <div className="flex-1 flex min-h-0">
        {/* Tools Panel */}
        <div className="w-64 border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col">
          <div className="p-4 flex-1 overflow-y-auto">
          {/* Layout Elements */}
          <div className="mb-6">
            <button
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
                      onDragStart={(e) => onDragStart(e, element)}
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
                        onDragStart={(e) => onDragStart(e, element)}
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
                      onDragStart={(e) => onDragStart(e, element)}
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
          
          {/* Generate JSON Button */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={generateSchemaFromElements}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Code className="h-4 w-4" />
              <span>Generate JSON</span>
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
              dragDropElements.length === 0 
                ? 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50' 
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
            }`}
          >
            {dragDropElements.length === 0 ? (
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
                {dragDropElements.map((element) => {
                  // Get icon component from iconName
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
                        {/* Container Controls */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => removeElement(element.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Container Header */}
                        <div className="flex items-center space-x-2 mb-3">
                          <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                            {element.title}
                          </span>
                          <span className="text-xs text-blue-500 dark:text-blue-400">
                            ({element.direction === 'row' ? 'Horizontal' : 'Vertical'})
                          </span>
                        </div>

                        {/* Container Properties */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Direction
                            </label>
                            <select
                              value={element.direction || 'column'}
                              onChange={(e) => updateElement(element.id, { direction: e.target.value })}
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
                              onChange={(e) => updateElement(element.id, { columns: parseInt(e.target.value) })}
                              className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                              Gap
                            </label>
                            <select
                              value={element.gap || 'medium'}
                              onChange={(e) => updateElement(element.id, { gap: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          </div>
                        </div>

                        {/* Container Drop Area */}
                        <div
                          onDragOver={onDragOver}
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
                                  {/* Child Controls */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={() => removeElement(child.id, element.id)}
                                      className="p-0.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded text-xs"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>

                                  {/* Child Element */}
                                  <div className="flex items-center space-x-2 mb-2">
                                    <ChildIconComponent className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                                      {child.title}
                                    </span>
                                  </div>

                                  {/* Child Properties */}
                                  <div className="space-y-2">
                                    <input
                                      type="text"
                                      value={child.fieldName || ''}
                                      onChange={(e) => updateElement(child.id, { fieldName: e.target.value }, element.id)}
                                      placeholder="Field name"
                                      className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                    />
                                    <input
                                      type="text"
                                      value={child.placeholder || ''}
                                      onChange={(e) => updateElement(child.id, { placeholder: e.target.value }, element.id)}
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
                      {/* Element Controls */}
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => removeElement(element.id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Element Info */}
                      <div className="flex items-center space-x-2 mb-3">
                        <IconComponent className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {element.title}
                        </span>
                      </div>

                      {/* Element Properties */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                            Field Name
                          </label>
                          <input
                            type="text"
                            value={element.fieldName || ''}
                            onChange={(e) => updateElement(element.id, { fieldName: e.target.value })}
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
                            onChange={(e) => updateElement(element.id, { title: e.target.value })}
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
                            onChange={(e) => updateElement(element.id, { placeholder: e.target.value })}
                            className="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                          />
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={element.required || false}
                              onChange={(e) => updateElement(element.id, { required: e.target.checked })}
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

  // Reset position when modal opens
  React.useEffect(() => {
    if (isOpen) {
      resetPosition();
    }
  }, [isOpen, resetPosition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div 
        ref={modalRef}
        className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col"
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

        {/* Content Area - Split Pane */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Panel - Main Content */}
          <div className="flex-1 flex flex-col border-r border-slate-200 dark:border-slate-700">
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              {activeTab === 'designer' ? renderDesigner() : renderEditor()}
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
                  {renderPreview()}
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

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-all">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Add Field</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-600 transition-all">
              <Copy className="h-4 w-4" />
              <span className="font-medium">Clone Schema</span>
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg border border-red-200 dark:border-red-800 transition-all">
              <Trash2 className="h-4 w-4" />
              <span className="font-medium">Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeUIModal;