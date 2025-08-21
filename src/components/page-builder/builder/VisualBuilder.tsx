import React, { useState } from 'react';
import { Layout, Type, Image, Square, ChevronDown, ChevronRight } from 'lucide-react';
import ElementPalette from './ElementPalette';
import BuilderCanvas from './BuilderCanvas';
import StyleEditor from './StyleEditor';

interface VisualBuilderProps {
  content: any;
  layout: any;
  components: any;
  styles: any;
  onContentChange: (content: any) => void;
  onLayoutChange: (layout: any) => void;
  onComponentsChange: (components: any) => void;
  onStylesChange: (styles: any) => void;
}

const VisualBuilder: React.FC<VisualBuilderProps> = ({
  content,
  layout,
  components,
  styles,
  onContentChange,
  onLayoutChange,
  onComponentsChange,
  onStylesChange
}) => {
  const [selectedElement, setSelectedElement] = useState<any>(null);
  const [showElementPalette, setShowElementPalette] = useState(true);
  const [showStyleEditor, setShowStyleEditor] = useState(true);
  const [activeTab, setActiveTab] = useState<'design' | 'preview'>('design');

  const handleElementSelect = (element: any) => {
    setSelectedElement(element);
  };

  const handleElementAdd = (elementType: string, position?: { x: number; y: number }) => {
    const newElement = {
      id: `element-${Date.now()}`,
      type: elementType,
      position: position || { x: 0, y: 0 },
      props: getDefaultProps(elementType),
      styles: getDefaultStyles(elementType),
      children: []
    };

    const updatedContent = {
      ...content,
      elements: [...(content.elements || []), newElement]
    };

    onContentChange(updatedContent);
  };

  const handleElementUpdate = (elementId: string, updates: any) => {
    const updatedContent = {
      ...content,
      elements: content.elements?.map((el: any) => 
        el.id === elementId ? { ...el, ...updates } : el
      ) || []
    };

    onContentChange(updatedContent);
  };

  const handleElementDelete = (elementId: string) => {
    const updatedContent = {
      ...content,
      elements: content.elements?.filter((el: any) => el.id !== elementId) || []
    };

    onContentChange(updatedContent);
    setSelectedElement(null);
  };

  const handleStyleUpdate = (elementId: string, newStyles: any) => {
    handleElementUpdate(elementId, { styles: newStyles });
  };

  return (
    <div className="flex h-full">
      {/* Element Palette */}
      {showElementPalette && (
        <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Elements</h3>
              <button 
                onClick={() => setShowElementPalette(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <ElementPalette onElementAdd={handleElementAdd} />
        </div>
      )}

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-white">
          {!showElementPalette && (
            <button 
              onClick={() => setShowElementPalette(true)}
              className="p-2 text-gray-400 hover:text-gray-600 border-r border-gray-200"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
          
          <div className="flex">
            <button
              onClick={() => setActiveTab('design')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'design'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Design
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'preview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-hidden">
          <BuilderCanvas
            content={content}
            layout={layout}
            components={components}
            selectedElement={selectedElement}
            isPreviewMode={activeTab === 'preview'}
            onElementSelect={handleElementSelect}
            onElementUpdate={handleElementUpdate}
            onElementDelete={handleElementDelete}
            onElementAdd={handleElementAdd}
          />
        </div>
      </div>

      {/* Style Editor */}
      {showStyleEditor && selectedElement && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Element Styles</h3>
              <button 
                onClick={() => setShowStyleEditor(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
          </div>
          <StyleEditor
            element={selectedElement}
            onStyleUpdate={(newStyles) => handleStyleUpdate(selectedElement.id, newStyles)}
          />
        </div>
      )}
    </div>
  );
};

// Helper functions
function getDefaultProps(elementType: string): any {
  const defaults: Record<string, any> = {
    text: { content: 'Sample Text', tag: 'p' },
    heading: { content: 'Heading', level: 1 },
    button: { text: 'Click Me', href: '#' },
    image: { src: '', alt: 'Image', width: 300, height: 200 },
    container: { className: 'container' },
    form: { method: 'POST', action: '' },
    input: { type: 'text', placeholder: 'Enter text...' }
  };

  return defaults[elementType] || {};
}

function getDefaultStyles(elementType: string): any {
  const defaults: Record<string, any> = {
    text: { fontSize: '16px', color: '#000000' },
    heading: { fontSize: '32px', fontWeight: 'bold', color: '#000000' },
    button: { 
      backgroundColor: '#3b82f6', 
      color: '#ffffff', 
      padding: '8px 16px', 
      borderRadius: '6px',
      border: 'none'
    },
    image: { maxWidth: '100%', height: 'auto' },
    container: { 
      padding: '16px', 
      margin: '0 auto',
      maxWidth: '1200px'
    },
    form: { display: 'flex', flexDirection: 'column', gap: '16px' },
    input: { 
      padding: '8px 12px', 
      border: '1px solid #d1d5db',
      borderRadius: '6px'
    }
  };

  return defaults[elementType] || {};
}

export default VisualBuilder;