import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';

interface MacWindowProps {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
  children?: React.ReactNode;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
  zIndex?: number;
}

const MacWindow: React.FC<MacWindowProps> = ({
  title,
  icon,
  isOpen,
  onClose,
  onMinimize,
  onMaximize,
  children,
  initialPosition = { x: 50, y: 50 },
  initialSize = { width: 800, height: 600 },
  zIndex = 1000
}) => {
  const [position, setPosition] = useState(initialPosition);
  const [size] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  
  const windowRef = useRef<HTMLDivElement>(null);
  const titleBarRef = useRef<HTMLDivElement>(null);

  // Animation when window opens
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === titleBarRef.current || titleBarRef.current?.contains(e.target as Node)) {
      setIsDragging(true);
      const rect = windowRef.current?.getBoundingClientRect();
      if (rect) {
        setDragOffset({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isDragging && !isMaximized) {
      // Calculate the container bounds (Mac screen area)
      // Based on page.tsx: container is 520px wide, 360px tall, scaled by 0.45
      const containerWidth = 520 / 0.45; // ~1155px
      const containerHeight = 360 / 0.45; // ~800px
      
      let newX = e.clientX - dragOffset.x;
      let newY = e.clientY - dragOffset.y;
      
      // Restrict movement within container bounds
      const minX = 0;
      const minY = 0;
      const maxX = containerWidth - size.width;
      const maxY = containerHeight - size.height;
      
      // Apply boundaries
      newX = Math.max(minX, Math.min(maxX, newX));
      newY = Math.max(minY, Math.min(maxY, newY));
      
      setPosition({
        x: newX,
        y: newY
      });
    }
  }, [isDragging, isMaximized, dragOffset.x, dragOffset.y, size.width, size.height]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, handleMouseMove, handleMouseUp]);

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
    onMaximize();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={windowRef}
      className={`fixed bg-white rounded-lg shadow-2xl border border-gray-300 overflow-hidden select-none ${
        isAnimating ? 'animate-window-open' : ''
      }`}
      style={{
        left: isMaximized ? 0 : position.x,
        top: isMaximized ? 0 : position.y,
        width: isMaximized ? '100vw' : size.width,
        height: isMaximized ? '100vh' : size.height,
        zIndex,
        transform: isAnimating ? 'scale(0.8)' : 'scale(1)',
        opacity: isAnimating ? 0 : 1,
        transition: isAnimating ? 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none'
      }}
    >
      {/* Title Bar */}
      <div
        ref={titleBarRef}
        className="h-8 bg-gradient-to-b from-gray-100 to-gray-200 border-b border-gray-300 flex items-center px-3 cursor-move"
        onMouseDown={handleMouseDown}
      >
        {/* Traffic Light Buttons */}
        <div className="flex space-x-2 mr-3">
          <button
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-150 flex items-center justify-center group"
          >
            <span className="text-red-800 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150">×</span>
          </button>
          <button
            onClick={onMinimize}
            className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors duration-150 flex items-center justify-center group"
          >
            <span className="text-yellow-800 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150">−</span>
          </button>
          <button
            onClick={handleMaximize}
            className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-150 flex items-center justify-center group"
          >
            <span className="text-green-800 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-150">+</span>
          </button>
        </div>
        
        {/* Window Title */}
        <div className="flex items-center space-x-2 flex-1 justify-center">
          <Image src={icon} alt={title} width={16} height={16} className="w-4 h-4" />
          <span className="text-sm font-medium text-gray-700 truncate">{title}</span>
        </div>
      </div>

      {/* Window Content */}
      <div className="flex-1 overflow-auto" style={{ height: 'calc(100% - 32px)' }}>
        {children || (
          <div className="p-6 h-full flex items-center justify-center">
            <div className="text-center">
              <Image src={icon} alt={title} width={64} height={64} className="w-16 h-16 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
              <p className="text-gray-600">Esta es una ventana de {title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
          }}
        >
          <div className="absolute bottom-1 right-1 w-2 h-2 border-r-2 border-b-2 border-gray-400"></div>
        </div>
      )}
    </div>
  );
};

export default MacWindow;