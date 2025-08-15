import React, { useState, useRef, useEffect } from 'react';
import { Users, Circle, Eye, MousePointer2, Move } from 'lucide-react';
import { useCollaboration } from '@/contexts/CollaborationContext';

const CollaborativeUsersPanel: React.FC = () => {
  const { 
    users, 
    currentUser, 
    isCollaborativeMode, 
    setCollaborativeMode, 
    generateDemoUsers 
  } = useCollaboration();

  // Dragging state - Initialize position from right side  
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 300, y: 16 }; // 300px from right, 16px from top
    }
    return { x: 1000, y: 16 }; // Fallback position
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  // Handle mouse move
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStart.x;
      const newY = e.clientY - dragStart.y;
      
      // Constrain to viewport
      const maxX = window.innerWidth - (panelRef.current?.offsetWidth || 280);
      const maxY = window.innerHeight - (panelRef.current?.offsetHeight || 200);
      
      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'grabbing';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
    };
  }, [isDragging, dragStart]);

  const panelStyle = {
    position: 'fixed' as const,
    left: `${position.x}px`,
    top: `${position.y}px`,
    zIndex: 9999,
    cursor: isDragging ? 'grabbing' : 'grab'
  };

  if (!isCollaborativeMode) {
    return (
      <div 
        ref={panelRef}
        style={panelStyle}
        className="bg-green-500 hover:bg-blue-600 text-white rounded-lg shadow-xl border-1 border-white-100 p-3 transition-all duration-200 select-none"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Move className="h-3 w-3 opacity-60" />
          <button
            onClick={() => generateDemoUsers()}
            className="flex items-center space-x-2 text-sm text-white font-medium"
          >
            <Users className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const onlineUsers = users.filter(user => user.isOnline);
  const offlineUsers = users.filter(user => !user.isOnline);

  return (
    <div 
      ref={panelRef}
      style={panelStyle}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-xl border-2 border-blue-200 dark:border-blue-700 p-4 min-w-[280px] select-none"
    >
      <div 
        className="flex items-center justify-between mb-3 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center space-x-2">
          <Move className="h-3 w-3 text-slate-400 opacity-60" />
          <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            Collaborators ({onlineUsers.length} online)
          </span>
        </div>
        <button
          onClick={() => setCollaborativeMode(false)}
          className="text-xs text-slate-500 hover:text-red-500 transition"
        >
          Exit
        </button>
      </div>

      {/* Current User */}
      {currentUser && (
        <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm"
            style={{ backgroundColor: currentUser.color }}
          >
            {currentUser.avatar ? (
              <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full" />
            ) : (
              currentUser.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex-1">
            <div className="font-medium text-sm text-slate-900 dark:text-white">
              {currentUser.name} (You)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              {currentUser.email}
            </div>
          </div>
          <Circle className="h-3 w-3 text-green-500 fill-current" />
        </div>
      )}

      {/* Online Users */}
      {onlineUsers.length > 0 && (
        <div className="space-y-2 mb-3">
          {onlineUsers.map(user => (
            <div key={user.id} className="flex items-center space-x-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm relative"
                style={{ backgroundColor: user.color }}
              >
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
                <Circle className="absolute -bottom-1 -right-1 h-3 w-3 text-green-500 fill-current bg-white rounded-full" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-sm text-slate-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  {user.currentNode ? (
                    <>
                      <Eye className="h-3 w-3" />
                      <span>Editing node</span>
                    </>
                  ) : user.cursor ? (
                    <>
                      <MousePointer2 className="h-3 w-3" />
                      <span>Active</span>
                    </>
                  ) : (
                    <span>Online</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-slate-500">
                {user.lastSeen.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Offline Users */}
      {offlineUsers.length > 0 && (
        <div className="border-t border-slate-200 dark:border-slate-600 pt-3">
          <div className="text-xs text-slate-500 mb-2 uppercase tracking-wide">
            Recently Active ({offlineUsers.length})
          </div>
          <div className="space-y-2">
            {offlineUsers.slice(0, 3).map(user => (
              <div key={user.id} className="flex items-center space-x-3 p-2 opacity-60">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs relative"
                  style={{ backgroundColor: user.color }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                  <Circle className="absolute -bottom-1 -right-1 h-2 w-2 text-slate-400 fill-current bg-white rounded-full" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-xs text-slate-700 dark:text-slate-300">
                    {user.name}
                  </div>
                  <div className="text-xs text-slate-500">
                    {getRelativeTime(user.lastSeen)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

export default CollaborativeUsersPanel;