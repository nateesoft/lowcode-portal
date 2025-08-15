import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: string;
  height: string;
}

interface DragState {
  isDragging: boolean;
  isResizing: boolean;
  resizeDirection: string;
}

export const useModalDragAndResize = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeDirection, setResizeDirection] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [size, setSize] = useState<Size>({ width: '', height: '' });
  const [originalSize, setOriginalSize] = useState<Size>({ width: '', height: '' });
  const [originalPosition, setOriginalPosition] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startModalPos = useRef<Position>({ x: 0, y: 0 });
  const startSize = useRef<Size>({ width: '', height: '' });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFullscreen) return;
    
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startModalPos.current = { x: position.x, y: position.y };
    e.preventDefault();
  }, [isFullscreen, position]);

  const handleResizeMouseDown = useCallback((e: React.MouseEvent, direction: string) => {
    if (isFullscreen) return;
    
    e.stopPropagation();
    setIsResizing(true);
    setResizeDirection(direction);
    startPos.current = { x: e.clientX, y: e.clientY };
    
    if (modalRef.current) {
      const rect = modalRef.current.getBoundingClientRect();
      startSize.current = {
        width: rect.width + 'px',
        height: rect.height + 'px'
      };
    }
    
    e.preventDefault();
  }, [isFullscreen]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isFullscreen) return;

    if (isDragging) {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;

      setPosition({
        x: startModalPos.current.x + deltaX,
        y: startModalPos.current.y + deltaY
      });
    } else if (isResizing) {
      const deltaX = e.clientX - startPos.current.x;
      const deltaY = e.clientY - startPos.current.y;
      
      const currentWidth = parseInt(startSize.current.width);
      const currentHeight = parseInt(startSize.current.height);
      
      let newWidth = currentWidth;
      let newHeight = currentHeight;
      let newX = position.x;
      let newY = position.y;

      switch (resizeDirection) {
        case 'se': // South-East
          newWidth = Math.max(300, currentWidth + deltaX);
          newHeight = Math.max(200, currentHeight + deltaY);
          break;
        case 'sw': // South-West
          newWidth = Math.max(300, currentWidth - deltaX);
          newHeight = Math.max(200, currentHeight + deltaY);
          newX = position.x + deltaX;
          break;
        case 'ne': // North-East
          newWidth = Math.max(300, currentWidth + deltaX);
          newHeight = Math.max(200, currentHeight - deltaY);
          newY = position.y + deltaY;
          break;
        case 'nw': // North-West
          newWidth = Math.max(300, currentWidth - deltaX);
          newHeight = Math.max(200, currentHeight - deltaY);
          newX = position.x + deltaX;
          newY = position.y + deltaY;
          break;
        case 'n': // North
          newHeight = Math.max(200, currentHeight - deltaY);
          newY = position.y + deltaY;
          break;
        case 's': // South
          newHeight = Math.max(200, currentHeight + deltaY);
          break;
        case 'e': // East
          newWidth = Math.max(300, currentWidth + deltaX);
          break;
        case 'w': // West
          newWidth = Math.max(300, currentWidth - deltaX);
          newX = position.x + deltaX;
          break;
      }

      setSize({
        width: newWidth + 'px',
        height: newHeight + 'px'
      });

      // Update position if needed (for corner/side resizes that move the modal)
      if (newX !== position.x || newY !== position.y) {
        setPosition({ x: newX, y: newY });
      }
    }
  }, [isDragging, isResizing, isFullscreen, resizeDirection, position]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeDirection('');
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!modalRef.current) return;

    if (!isFullscreen) {
      // Store current state before going fullscreen
      setOriginalSize({
        width: modalRef.current.style.width || 'auto',
        height: modalRef.current.style.height || 'auto'
      });
      setOriginalPosition({ x: position.x, y: position.y });
      setPosition({ x: 0, y: 0 });
    } else {
      // Restore original state
      setPosition(originalPosition);
    }
    
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen, position, originalPosition]);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  // Reset position when modal opens
  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setIsFullscreen(false);
  }, []);

  const modalStyle: React.CSSProperties = {
    transform: isFullscreen 
      ? 'translate(0, 0)' 
      : `translate(${position.x}px, ${position.y}px)`,
    width: isFullscreen ? '100vw' : (size.width || originalSize.width || 'auto'),
    height: isFullscreen ? '100vh' : (size.height || originalSize.height || 'auto'),
    maxWidth: isFullscreen ? '100vw' : '90vw',
    maxHeight: isFullscreen ? '100vh' : '90vh',
    cursor: isDragging ? 'grabbing' : (isResizing ? 'default' : 'default'),
    transition: (isDragging || isResizing) ? 'none' : 'all 0.3s ease',
    zIndex: isFullscreen ? 10000 : 9999,
    position: 'relative' as const
  };

  const dragHandleStyle: React.CSSProperties = {
    cursor: isFullscreen ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: 'none'
  };

  // Resize handle styles and components
  const resizeHandleStyle = {
    position: 'absolute' as const,
    backgroundColor: 'transparent',
    zIndex: 10001
  };

  const resizeHandles = [
    { direction: 'nw', style: { ...resizeHandleStyle, top: -5, left: -5, width: 10, height: 10, cursor: 'nw-resize' } },
    { direction: 'n', style: { ...resizeHandleStyle, top: -5, left: 10, right: 10, height: 10, cursor: 'n-resize' } },
    { direction: 'ne', style: { ...resizeHandleStyle, top: -5, right: -5, width: 10, height: 10, cursor: 'ne-resize' } },
    { direction: 'e', style: { ...resizeHandleStyle, top: 10, bottom: 10, right: -5, width: 10, cursor: 'e-resize' } },
    { direction: 'se', style: { ...resizeHandleStyle, bottom: -5, right: -5, width: 10, height: 10, cursor: 'se-resize' } },
    { direction: 's', style: { ...resizeHandleStyle, bottom: -5, left: 10, right: 10, height: 10, cursor: 's-resize' } },
    { direction: 'sw', style: { ...resizeHandleStyle, bottom: -5, left: -5, width: 10, height: 10, cursor: 'sw-resize' } },
    { direction: 'w', style: { ...resizeHandleStyle, top: 10, bottom: 10, left: -5, width: 10, cursor: 'w-resize' } }
  ];

  return {
    dragRef,
    modalRef,
    isDragging,
    isResizing,
    isFullscreen,
    position,
    size,
    modalStyle,
    dragHandleStyle,
    resizeHandles,
    handleMouseDown,
    handleResizeMouseDown,
    toggleFullscreen,
    resetPosition
  };
};