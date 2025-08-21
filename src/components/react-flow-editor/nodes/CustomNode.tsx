import React, { useCallback, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { X, MoreHorizontal } from 'lucide-react';

export interface NodeData {
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  backgroundColor?: string;
  borderColor?: string;
  isGroup?: boolean;
  width?: number;
  height?: number;
  opacity?: number;
  [key: string]: unknown;
}

interface CustomNodeProps {
  data: NodeData;
  selected?: boolean;
  id?: string;
}

const CustomNode: React.FC<CustomNodeProps> = ({ data, selected, id }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startSize, setStartSize] = useState({ width: 0, height: 0 });

  // Get execution state from window object (global state)
  const isExecuting = (window as any).__reactFlowExecutingNodeId === id;

  // Handle delete node
  const handleDeleteNode = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (id) {
      // Dispatch event to parent component to delete this node
      window.dispatchEvent(new CustomEvent('deleteNode', { 
        detail: { nodeId: id } 
      }));
    }
  }, [id]);

  const nodeStyle = {
    backgroundColor: data.backgroundColor || '#ffffff',
    borderColor: data.borderColor || '#d1d5db',
    borderWidth: selected ? '2px' : '1px',
    borderStyle: 'solid',
    opacity: data.opacity || 1,
    width: data.width || 200,
    height: data.height || 100,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ 
      width: data.width || 200, 
      height: data.height || 100 
    });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    const newWidth = Math.max(150, startSize.width + deltaX);
    const newHeight = Math.max(80, startSize.height + deltaY);
    
    // Update node data
    window.dispatchEvent(new CustomEvent('updateNodeSize', {
      detail: { 
        nodeId: id, 
        width: newWidth, 
        height: newHeight 
      }
    }));
  }, [isResizing, startPos, startSize, id]);

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
  }, []);

  // Add mouse event listeners for resize
  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [isResizing, handleResizeMove, handleResizeEnd]);

  const IconComponent = data.icon;

  return (
    <div 
      className={`relative bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        selected ? 'ring-2 ring-blue-500' : ''
      } ${isExecuting ? 'ring-2 ring-green-500 animate-pulse' : ''}`}
      style={nodeStyle}
    >
      {/* Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Node Content */}
      <div className="p-3 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {IconComponent && <IconComponent className="w-4 h-4 text-gray-600" />}
            <span className="font-medium text-sm text-gray-900 truncate">
              {data.label}
            </span>
          </div>
          
          {/* Node Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleDeleteNode}
              className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
              title="Delete Node"
            >
              <X className="w-3 h-3" />
            </button>
            <button
              className="p-1 hover:bg-gray-100 rounded text-gray-600 transition-colors"
              title="Node Options"
            >
              <MoreHorizontal className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Node Description */}
        {data.description && (
          <p className="text-xs text-gray-500 flex-1 overflow-hidden text-ellipsis">
            {data.description}
          </p>
        )}

        {/* Execution Status */}
        {isExecuting && (
          <div className="absolute top-1 right-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      <div 
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize opacity-0 hover:opacity-100 transition-opacity"
        onMouseDown={handleResizeStart}
      >
        <div className="w-full h-full bg-gray-400 rounded-tl-sm"></div>
      </div>
    </div>
  );
};

export default CustomNode;