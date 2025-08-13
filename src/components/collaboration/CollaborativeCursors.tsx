import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { useCollaboration } from '@/contexts/CollaborationContext';

const CollaborativeCursors: React.FC = () => {
  const { users, isCollaborativeMode } = useCollaboration();

  if (!isCollaborativeMode) return null;

  const usersWithCursors = users.filter(user => user.isOnline && user.cursor);

  return (
    <>
      {usersWithCursors.map(user => (
        <div
          key={user.id}
          className="absolute pointer-events-none z-50 transition-all duration-200 ease-out"
          style={{
            left: user.cursor!.x,
            top: user.cursor!.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          {/* Cursor Icon */}
          <div className="relative">
            <MousePointer2 
              className="h-5 w-5 drop-shadow-lg"
              style={{ color: user.color }}
              fill={user.color}
            />
            
            {/* User Label */}
            <div 
              className="absolute top-6 left-2 px-2 py-1 rounded-md text-xs font-medium text-white shadow-lg whitespace-nowrap"
              style={{ backgroundColor: user.color }}
            >
              {user.name}
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default CollaborativeCursors;