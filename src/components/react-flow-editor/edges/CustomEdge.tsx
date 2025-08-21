import React from 'react';
import { getBezierPath, EdgeLabelRenderer, BaseEdge, EdgeProps } from 'reactflow';
import { Plus, X } from 'lucide-react';

interface CustomEdgeProps extends EdgeProps {
  data?: {
    label?: string;
    onAddNode?: (edgeId: string, position: { x: number; y: number }) => void;
    onDelete?: (edgeId: string) => void;
  };
}

const CustomEdge: React.FC<CustomEdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (event: React.MouseEvent, edgeId: string) => {
    event.stopPropagation();
    // Handle edge click
  };

  const handleAddNode = (event: React.MouseEvent) => {
    event.stopPropagation();
    const position = { x: labelX, y: labelY };
    data?.onAddNode?.(id, position);
  };

  const handleDeleteEdge = (event: React.MouseEvent) => {
    event.stopPropagation();
    data?.onDelete?.(id);
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* Edge Label */}
          {data?.label && (
            <div className="bg-white px-2 py-1 rounded shadow-sm border text-xs text-gray-600 mb-1">
              {data.label}
            </div>
          )}
          
          {/* Edge Controls */}
          <div className="flex items-center gap-1 opacity-0 hover:opacity-100 transition-opacity">
            <button
              className="p-1 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-sm transition-colors"
              onClick={handleAddNode}
              title="Add Node"
            >
              <Plus className="w-3 h-3" />
            </button>
            <button
              className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-sm transition-colors"
              onClick={handleDeleteEdge}
              title="Delete Edge"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;