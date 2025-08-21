import React, { useRef } from 'react';
import { Trash2, Copy, Move } from 'lucide-react';

interface BuilderCanvasProps {
  content: any;
  layout: any;
  components: any;
  selectedElement: any;
  isPreviewMode: boolean;
  onElementSelect: (element: any) => void;
  onElementUpdate: (elementId: string, updates: any) => void;
  onElementDelete: (elementId: string) => void;
  onElementAdd: (elementType: string, position?: { x: number; y: number }) => void;
}

const BuilderCanvas: React.FC<BuilderCanvasProps> = ({
  content,
  layout,
  components,
  selectedElement,
  isPreviewMode,
  onElementSelect,
  onElementUpdate,
  onElementDelete,
  onElementAdd
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const elementType = e.dataTransfer.getData('text/plain');
    
    if (elementType && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      onElementAdd(elementType, position);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const renderElement = (element: any, index: number) => {
    const isSelected = selectedElement?.id === element.id;
    const styles = {
      ...element.styles,
      position: element.position ? 'absolute' : 'relative',
      left: element.position?.x || 0,
      top: element.position?.y || 0,
      outline: isSelected && !isPreviewMode ? '2px solid #3b82f6' : 'none',
      outlineOffset: isSelected && !isPreviewMode ? '2px' : '0'
    };

    const handleElementClick = (e: React.MouseEvent) => {
      if (!isPreviewMode) {
        e.stopPropagation();
        onElementSelect(element);
      }
    };

    const renderElementContent = () => {
      switch (element.type) {
        case 'text':
        case 'paragraph':
          return (
            <p style={styles} onClick={handleElementClick}>
              {element.props?.content || 'Sample text'}
            </p>
          );

        case 'heading':
          const HeadingTag = `h${element.props?.level || 1}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag style={styles} onClick={handleElementClick}>
              {element.props?.content || 'Heading'}
            </HeadingTag>
          );

        case 'button':
          return (
            <button style={styles} onClick={handleElementClick}>
              {element.props?.text || 'Button'}
            </button>
          );

        case 'image':
          return (
            <img
              src={element.props?.src || 'https://via.placeholder.com/300x200'}
              alt={element.props?.alt || 'Image'}
              style={styles}
              onClick={handleElementClick}
            />
          );

        case 'container':
        case 'section':
        case 'header':
        case 'main':
        case 'footer':
        case 'aside':
          const ContainerTag = element.tag || 'div';
          return (
            <div style={styles} onClick={handleElementClick}>
              {element.children?.map((child: any, childIndex: number) => 
                renderElement(child, childIndex)
              )}
              {!element.children?.length && (
                <div className="p-4 text-gray-400 text-center border-2 border-dashed border-gray-200">
                  Drop elements here
                </div>
              )}
            </div>
          );

        case 'input':
          return (
            <input
              type={element.props?.type || 'text'}
              placeholder={element.props?.placeholder || 'Enter text...'}
              style={styles}
              onClick={handleElementClick}
            />
          );

        case 'link':
          return (
            <a
              href={element.props?.href || '#'}
              style={styles}
              onClick={handleElementClick}
            >
              {element.props?.text || 'Link'}
            </a>
          );

        default:
          return (
            <div style={styles} onClick={handleElementClick}>
              {element.type} element
            </div>
          );
      }
    };

    return (
      <div key={element.id} className="relative">
        {renderElementContent()}
        
        {/* Element Controls (only in design mode) */}
        {isSelected && !isPreviewMode && (
          <div className="absolute -top-8 left-0 flex items-center gap-1 bg-blue-600 text-white px-2 py-1 rounded text-xs">
            <span className="font-medium">{element.type}</span>
            <button
              onClick={() => onElementDelete(element.id)}
              className="ml-2 hover:bg-blue-700 p-0.5 rounded"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                // Copy element logic
                const newElement = {
                  ...element,
                  id: `element-${Date.now()}`,
                  position: {
                    x: (element.position?.x || 0) + 20,
                    y: (element.position?.y || 0) + 20
                  }
                };
                // This would need to be handled by parent
              }}
              className="hover:bg-blue-700 p-0.5 rounded"
              title="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full overflow-auto bg-gray-50">
      <div
        ref={canvasRef}
        className="min-h-full p-8 bg-white mx-auto max-w-6xl shadow-sm"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !isPreviewMode && onElementSelect(null)}
        style={{ minHeight: '100vh' }}
      >
        {/* Canvas Content */}
        {content?.elements?.length > 0 ? (
          content.elements.map((element: any, index: number) => 
            renderElement(element, index)
          )
        ) : (
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center text-gray-500">
              <div className="text-lg font-medium mb-2">Start Building Your Page</div>
              <div className="text-sm">
                Drag elements from the palette to start designing
              </div>
            </div>
          </div>
        )}

        {/* Drop Zone Indicator */}
        <div className="mt-8 p-8 border-2 border-dashed border-gray-200 rounded-lg text-center text-gray-400">
          Drop new elements here
        </div>
      </div>
    </div>
  );
};

export default BuilderCanvas;