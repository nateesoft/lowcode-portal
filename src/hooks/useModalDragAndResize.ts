import { useState, useRef, useEffect, useCallback } from 'react';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: string;
  height: string;
}

export const useModalDragAndResize = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [originalSize, setOriginalSize] = useState<Size>({ width: '', height: '' });
  const [originalPosition, setOriginalPosition] = useState<Position>({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const startPos = useRef<Position>({ x: 0, y: 0 });
  const startModalPos = useRef<Position>({ x: 0, y: 0 });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isFullscreen) return;
    
    setIsDragging(true);
    startPos.current = { x: e.clientX, y: e.clientY };
    startModalPos.current = { x: position.x, y: position.y };
    e.preventDefault();
  }, [isFullscreen, position]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isFullscreen) return;

    const deltaX = e.clientX - startPos.current.x;
    const deltaY = e.clientY - startPos.current.y;

    setPosition({
      x: startModalPos.current.x + deltaX,
      y: startModalPos.current.y + deltaY
    });
  }, [isDragging, isFullscreen]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!modalRef.current) return;

    if (!isFullscreen) {
      // Store current state before going fullscreen
      const rect = modalRef.current.getBoundingClientRect();
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
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = 'none';

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Reset position when modal opens
  const resetPosition = useCallback(() => {
    setPosition({ x: 0, y: 0 });
    setIsFullscreen(false);
  }, []);

  const modalStyle: React.CSSProperties = {
    transform: isFullscreen 
      ? 'translate(0, 0)' 
      : `translate(${position.x}px, ${position.y}px)`,
    width: isFullscreen ? '100vw' : originalSize.width || 'auto',
    height: isFullscreen ? '100vh' : originalSize.height || 'auto',
    maxWidth: isFullscreen ? '100vw' : '90vw',
    maxHeight: isFullscreen ? '100vh' : '90vh',
    cursor: isDragging ? 'grabbing' : 'default',
    transition: isDragging ? 'none' : 'all 0.3s ease',
    zIndex: 9999
  };

  const dragHandleStyle: React.CSSProperties = {
    cursor: isFullscreen ? 'default' : (isDragging ? 'grabbing' : 'grab'),
    userSelect: 'none'
  };

  return {
    dragRef,
    modalRef,
    isDragging,
    isFullscreen,
    position,
    modalStyle,
    dragHandleStyle,
    handleMouseDown,
    toggleFullscreen,
    resetPosition
  };
};