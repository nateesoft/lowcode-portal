import React, { useState, useCallback } from 'react';
import { Handle, Position, useStore } from 'reactflow';
import { Layers, X } from 'lucide-react';
import { NodeData } from '../types';
import { getNodeShape } from '../utils/nodeHelpers';
import {
  UserShape,
  ProcessShape,
  DecisionShape,
  DataShape,
  TerminalShape,
  DocumentShape,
  ServiceShape,
  ApiShape,
  PageShape
} from './FlowchartShapes';

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
  const isExecuting = (window as unknown as { __reactFlowExecutingNodeId?: string }).__reactFlowExecutingNodeId === id;
  
  // Use useStore to check if this node is selected
  const isSelected = useStore((state) => {
    const node = state.nodeInternals.get(id || '');
    return node?.selected || false;
  });
  
  // Debug log
  React.useEffect(() => {
    console.log(`Node ${id} (${data.label}): isSelected=${isSelected}, isExecuting=${isExecuting}`);
  }, [isSelected, isExecuting, id, data.label]);

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
    backgroundColor: isExecuting ? '#fef3c7' : (data.backgroundColor || '#ffffff'),
    borderColor: isExecuting ? '#f59e0b' : (isSelected ? '#3b82f6' : (data.borderColor || '#a1a1aa')),
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
          isSelected ? 'border-blue-500 shadow-blue-200' : 'border-slate-300'
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

        {/* Resize Handles and Delete Button */}
        {isSelected && (
          <>
            {/* Delete Button */}
            <button
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
              style={{ pointerEvents: 'auto' }}
              onClick={handleDeleteNode}
              title="Delete Node"
            >
              <X className="h-3 w-3" />
            </button>
            
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
  
  // Get shape for this node
  const nodeShape = getNodeShape(data.label);
  
  // Render flowchart shape
  const renderFlowchartShape = () => {
    const shapeProps = {
      label: data.label,
      fill: isExecuting ? '#fef3c7' : (data.backgroundColor || '#ffffff'),
      stroke: isExecuting ? '#f59e0b' : (selected ? '#3b82f6' : '#6b7280'),
      strokeWidth: selected || isExecuting ? 3 : 2,
      className: `transition-all duration-300 ${isExecuting ? 'animate-pulse' : ''}`,
      width: 100,
      height: 80
    };

    switch (nodeShape) {
      case 'user':
        return <UserShape {...shapeProps} fill="#3b82f6" stroke="#1e40af" />;
      case 'process':
        return <ProcessShape {...shapeProps} fill="#10b981" stroke="#059669" />;
      case 'decision':
        return <DecisionShape {...shapeProps} fill="#f59e0b" stroke="#d97706" />;
      case 'data':
        return <DataShape {...shapeProps} fill="#8b5cf6" stroke="#7c3aed" />;
      case 'terminal':
        return <TerminalShape {...shapeProps} fill="#ef4444" stroke="#dc2626" />;
      case 'document':
        return <DocumentShape {...shapeProps} fill="#06b6d4" stroke="#0891b2" />;
      case 'service':
        return <ServiceShape {...shapeProps} fill="#64748b" stroke="#475569" />;
      case 'api':
        return <ApiShape {...shapeProps} fill="#ec4899" stroke="#db2777" />;
      case 'page':
        return <PageShape {...shapeProps} fill="#16a34a" stroke="#15803d" />;
      default:
        return (
          <div 
            className={`px-4 py-2 shadow-lg rounded-lg border-2 transition-all duration-300 bg-white ${
              isExecuting ? 'animate-pulse border-amber-500 shadow-amber-200' : 
              isSelected ? 'border-blue-500 shadow-blue-200' : 'border-gray-300'
            }`}
            style={{
              backgroundColor: isExecuting ? '#fef3c7' : (data.backgroundColor || '#ffffff'),
              borderColor: isExecuting ? '#f59e0b' : (isSelected ? '#3b82f6' : '#6b7280'),
              minWidth: '100px',
              minHeight: '60px'
            }}
          >
            <div className="flex items-center justify-center">
              {data.icon && <data.icon className={`h-4 w-4 mr-2 ${isExecuting ? 'text-amber-600' : 'text-blue-600'}`} />}
              <div className="text-center">
                <div className={`text-sm font-bold ${isExecuting ? 'text-amber-900' : 'text-slate-900'}`}>
                  {data.label}
                </div>
                <div className="text-gray-500 text-xs">{data.description}</div>
              </div>
            </div>
          </div>
        );
    }
  };

  // Regular Node with Flowchart Shape
  return (
    <div className="relative">
      {/* Delete Button - for regular nodes */}
      {isSelected && !isExecuting && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-20 nodrag transition-colors shadow-lg"
          style={{ pointerEvents: 'auto' }}
          onClick={handleDeleteNode}
          title="Delete Node"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      
      {/* Execution indicator */}
      {isExecuting && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-amber-500 rounded-full animate-ping z-10">
          <div className="absolute inset-0 w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
        </div>
      )}
      
      {/* Input Handle - Left side */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="w-4 h-4 !bg-blue-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all z-10"
        style={{ left: -8, top: '50%', transform: 'translateY(-50%)' }}
      />
      
      {/* Flowchart Shape */}
      <div className="flex flex-col items-center">
        {renderFlowchartShape()}
        
        {/* Execution status text */}
        {isExecuting && (
          <div className="mt-1 text-xs text-amber-600 font-medium animate-pulse">
            ⚡ กำลังทำงาน...
          </div>
        )}
      </div>
      
      {/* Output Handle - Right side */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        className="w-4 h-4 !bg-green-500 !border-2 !border-white shadow-lg hover:w-5 hover:h-5 transition-all z-10"
        style={{ right: -8, top: '50%', transform: 'translateY(-50%)' }}
      />
    </div>
  );
};

// Create a wrapper component that passes the node id and execution state
export const CustomNodeWrapper = (props: { id: string; data: NodeData; selected?: boolean }) => {
  return <CustomNode {...props} id={props.id} />;
};

export default CustomNode;