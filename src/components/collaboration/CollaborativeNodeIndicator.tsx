import React from 'react';
import { Circle, Eye } from 'lucide-react';
import { useCollaboration } from '@/contexts/CollaborationContext';

interface CollaborativeNodeIndicatorProps {
  nodeId: string;
}

const CollaborativeNodeIndicator: React.FC<CollaborativeNodeIndicatorProps> = ({ nodeId }) => {
  const { users, isCollaborativeMode } = useCollaboration();

  if (!isCollaborativeMode) return null;

  const usersOnNode = users.filter(user => user.isOnline && user.currentNode === nodeId);

  if (usersOnNode.length === 0) return null;

  return (
    <div className="absolute -top-2 -right-2 z-10">
      <div className="flex items-center -space-x-1">
        {usersOnNode.slice(0, 3).map((user, index) => (
          <div
            key={user.id}
            className="relative group"
            style={{ zIndex: 10 - index }}
          >
            <div 
              className="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg"
              style={{ backgroundColor: user.color }}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
            
            {/* Pulse animation */}
            <div
              className="absolute inset-0 w-6 h-6 rounded-full animate-pulse"
              style={{ backgroundColor: user.color, opacity: 0.3 }}
            />
            
            {/* Tooltip */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {user.name} is editing
            </div>
          </div>
        ))}
        
        {usersOnNode.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-slate-600 border-2 border-white flex items-center justify-center text-white font-bold text-xs shadow-lg">
            +{usersOnNode.length - 3}
          </div>
        )}
      </div>
      
      {/* Edit indicator */}
      <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-1">
        <Eye className="h-3 w-3 text-blue-500 animate-pulse" />
      </div>
    </div>
  );
};

export default CollaborativeNodeIndicator;