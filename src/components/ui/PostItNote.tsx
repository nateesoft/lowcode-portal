import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Clock, Edit } from 'lucide-react';
import { Note } from '@/lib/types';

interface PostItNoteProps {
  note: Note;
  onUpdate: (id: number, content: string) => void;
  onDelete: (id: number) => void;
  position: { x: number; y: number };
  onPositionChange: (id: number, position: { x: number; y: number }) => void;
}

const PostItNote: React.FC<PostItNoteProps> = ({
  note,
  onUpdate,
  onDelete,
  position,
  onPositionChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentPosition, setCurrentPosition] = useState(position);
  const noteRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    
    setIsDragging(true);
    
    // Get the offset from mouse click position to the current element position
    const rect = noteRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
    
    // Add mouse capture
    if (noteRef.current) {
      noteRef.current.style.pointerEvents = 'none';
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    // Find the notes container (parent element)
    const container = noteRef.current?.closest('.relative');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    
    // Calculate new position relative to the container
    const newX = e.clientX - containerRect.left - dragOffset.x;
    const newY = e.clientY - containerRect.top - dragOffset.y;
    
    // Smooth position update using requestAnimationFrame
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(() => {
      setCurrentPosition({ 
        x: Math.max(0, Math.min(newX, containerRect.width - 220)), // 220 is note width + margin
        y: Math.max(0, Math.min(newY, containerRect.height - 220)) // 220 is note height + margin
      });
    });
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    
    // Restore pointer events
    if (noteRef.current) {
      noteRef.current.style.pointerEvents = 'auto';
    }
    
    // Update final position
    onPositionChange(note.id, currentPosition);
    
    // Cancel any pending animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  }, [note.id, currentPosition, onPositionChange]);

  // Update currentPosition when position prop changes
  useEffect(() => {
    if (!isDragging) {
      setCurrentPosition(position);
    }
  }, [position, isDragging]);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleSave = () => {
    onUpdate(note.id, content);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setContent(note.content);
    setIsEditing(false);
  };

  const isExpired = note.expiresAt && new Date(note.expiresAt) < new Date();
  const timeLeft = note.expiresAt ? new Date(note.expiresAt).getTime() - new Date().getTime() : null;
  const hoursLeft = timeLeft ? Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60))) : null;

  return (
    <div
      ref={noteRef}
      className={`absolute select-none shadow-lg transform ${
        isDragging 
          ? 'z-50 scale-110 rotate-3 shadow-2xl filter brightness-110' 
          : 'z-10 rotate-1 hover:rotate-0 hover:scale-105 hover:shadow-xl transition-all duration-200 ease-out'
      } ${isExpired ? 'opacity-50 grayscale' : ''}`}
      style={{
        left: currentPosition.x,
        top: currentPosition.y,
        backgroundColor: note.color,
        width: '200px',
        minHeight: '200px',
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'all 0.2s ease-out',
        willChange: isDragging ? 'transform, left, top' : 'auto',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isDragging ? 'translateZ(0)' : 'none'
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="p-4 h-full flex flex-col relative border border-black border-opacity-10"
           style={{ 
             boxShadow: isDragging 
               ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 20px 25px -5px rgba(0, 0, 0, 0.1)' 
               : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
           }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-1">
            {note.expiresAt && (
              <div className="flex items-center text-xs text-gray-600">
                <Clock className="w-3 h-3 mr-1" />
                {hoursLeft !== null && hoursLeft > 0 ? `${hoursLeft}h` : 'Expired'}
              </div>
            )}
          </div>
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(true);
              }}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
            >
              <Edit className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
              className="p-1 hover:bg-red-500 hover:bg-opacity-20 rounded transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {isEditing ? (
            <div className="h-full flex flex-col">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none resize-none text-sm"
                style={{ fontFamily: 'Georgia, serif' }}
                autoFocus
                onMouseDown={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              className="text-sm whitespace-pre-wrap break-words"
              style={{ fontFamily: 'Georgia, serif', color: '#333' }}
            >
              {note.content}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-xs text-gray-500 mt-2">
          {new Date(note.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Post-it tape effect */}
      <div 
        className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-yellow-200 opacity-60"
        style={{ transform: 'translateX(-50%) rotate(-5deg)' }}
      />
    </div>
  );
};

export default PostItNote;