import React, { useState, useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Layers } from 'lucide-react';
import { NodeData } from '../types';

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

  const nodeStyle = {
    backgroundColor: isExecuting ? '#fef3c7' : (data.backgroundColor || '#ffffff'),
    borderColor: isExecuting ? '#f59e0b' : (selected ? '#3b82f6' : (data.borderColor || '#a1a1aa')),
    width: data.width || 'auto',
    height: data.height || 'auto',
    opacity: data.opacity || 1,
    boxShadow: isExecuting ? '0 0 20px rgba(245, 158, 11, 0.5)' : undefined,
    animation: isExecuting ? 'pulse 1s infinite' : undefined,
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartSize({ width: data.width as number || 400, height: data.height as number || 300 });
  };

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!isResizing || !id) return;
    
    const deltaX = e.clientX - startPos.x;
    const deltaY = e.clientY - startPos.y;
    
    const newWidth = Math.max(200, startSize.width + deltaX);
    const newHeight = Math.max(150, startSize.height + deltaY);
    
    // Dispatch event to parent component
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

  // Group/Frame Node for organizing flows
  if (data.isGroup) {
    return (
      <div 
        className={`rounded-lg border-2 transition-colors relative ${
          selected ? 'border-blue-500 shadow-blue-200' : 'border-slate-300'
        }`}
        style={{
          ...nodeStyle,
          minWidth: data.width || 400,
          minHeight: data.height || 300,
          backgroundColor: data.backgroundColor || 'rgba(248, 250, 252, 0.8)',
          borderStyle: 'dashed',
          borderWidth: '2px',
          zIndex: -1, // ให้ group node อยู่ล่างสุด
          pointerEvents: selected ? 'auto' : 'none', // ไม่รับ mouse events เมื่อไม่ได้เลือก
        }}
      >
        {/* Group Header */}
        <div 
          className="absolute -top-6 left-2 bg-white dark:bg-slate-800 px-2 py-1 rounded-t border border-b-0 border-slate-300"
          style={{ pointerEvents: 'auto' }} // Header สามารถคลิกได้
        >
          <div className="flex items-center space-x-1">
            {data.icon && <data.icon className="h-3 w-3 text-slate-500" />}
            <span className="text-xs font-medium text-slate-600">{data.label}</span>
          </div>
        </div>
        
        {/* Group Content Area */}
        <div 
          className="h-full w-full p-4 flex items-center justify-center"
          style={{ pointerEvents: selected ? 'auto' : 'none' }}
        >
          <div className="text-center text-slate-400">
            <Layers className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm">Drop nodes here to group</div>
          </div>
        </div>

        {/* Resize Handles */}
        {selected && (
          <>
            {/* Bottom-right corner resize handle */}
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize z-10 nodrag"
              style={{ margin: '-1.5px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
            {/* Bottom edge resize handle */}
            <div
              className="absolute bottom-0 left-1/2 w-6 h-2 bg-blue-500 cursor-ns-resize z-10 transform -translate-x-1/2 nodrag"
              style={{ marginBottom: '-1px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
            {/* Right edge resize handle */}
            <div
              className="absolute right-0 top-1/2 w-2 h-6 bg-blue-500 cursor-ew-resize z-10 transform -translate-y-1/2 nodrag"
              style={{ marginRight: '-1px', pointerEvents: 'auto' }}
              onMouseDown={handleResizeStart}
            />
          </>
        )}
      </div>
    );
  }
  
  // Regular Node
  return (
    <div 
      className={`px-4 py-2 shadow-lg rounded-lg border-2 transition-all duration-300 relative ${
        isExecuting ? 'animate-pulse border-amber-500 shadow-amber-200' : 
        selected ? 'border-blue-500 shadow-blue-200' : ''
      }`}
      style={nodeStyle}
    >
      {/* Execution indicator */}
      {isExecuting && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full animate-ping">
          <div className="absolute inset-0 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all"
        style={{ left: -8 }}
      />
      
      {/* Node Content */}
      <div className="flex items-center">
        {data.icon && <data.icon className={`h-4 w-4 mr-2 ${isExecuting ? 'text-amber-600' : 'text-blue-600'}`} />}
        <div className="ml-2">
          <div className={`text-lg font-bold ${isExecuting ? 'text-amber-900' : 'text-slate-900'}`}>
            {data.label}
            {isExecuting && <span className="ml-2 text-xs">⚡ กำลังทำงาน...</span>}
          </div>
          <div className="text-gray-500 text-sm">{data.description}</div>
        </div>
      </div>
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-green-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all"
        style={{ right: -8 }}
      />
    </div>
  );
};

// Create a wrapper component that passes the node id and execution state
export const CustomNodeWrapper = (props: any) => {
  return <CustomNode {...props} id={props.id} />;
};

export default CustomNode;