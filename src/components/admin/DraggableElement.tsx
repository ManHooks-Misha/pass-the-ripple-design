import React, { useState, useRef, useCallback } from 'react';

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface DraggableElementProps {
    id: string;
    initialPosition: Position;
    initialSize?: Size;
    minSize?: Size;
    maxSize?: Size;
    onPositionChange: (id: string, position: Position) => void;
    onSizeChange?: (id: string, size: Size) => void;
    onSelect?: (id: string) => void;
    onDoubleClick?: (id: string) => void;
    onTransform?: (id: string, updates: { x: number; y: number; width: number; height: number }) => void;
    isSelected?: boolean;
    children: React.ReactNode;
    className?: string;
    resizable?: boolean;
    locked?: boolean;
    elementType?: string;
}

export default function DraggableElement({
    id,
    initialPosition,
    initialSize = { width: 100, height: 50 },
    minSize = { width: 50, height: 30 },
    maxSize = { width: 2000, height: 2000 },
    onPositionChange,
    onSizeChange,
    onSelect,
    onDoubleClick,
    onTransform,
    isSelected = false,
    children,
    className = '',
    resizable = true,
    locked = false,
    elementType = 'text'
}: DraggableElementProps) {
    const elementRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
    const [resizeStart, setResizeStart] = useState<{
        x: number;
        y: number;
        width: number;
        height: number;
        posX: number;
        posY: number;
        handle: string;
    } | null>(null);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (locked) return;
        // Don't start drag if clicking on contentEditable
        if ((e.target as HTMLElement).isContentEditable) return;

        // e.preventDefault(); // Removed to allow double-click
        e.stopPropagation();

        onSelect?.(id);

        const rect = elementRef.current?.getBoundingClientRect();
        if (rect) {
            setDragOffset({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            });
        }
        setIsDragging(true);
    }, [id, locked, onSelect]);

    const handleResizeStart = useCallback((e: React.MouseEvent, handle: string) => {
        if (locked || !resizable) return;
        e.preventDefault();
        e.stopPropagation();

        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: initialSize.width,
            height: initialSize.height,
            posX: initialPosition.x,
            posY: initialPosition.y,
            handle
        });
        setIsResizing(true);
    }, [locked, resizable, initialSize, initialPosition]);

    React.useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging && elementRef.current) {
                const parent = elementRef.current.parentElement;
                if (parent) {
                    const parentRect = parent.getBoundingClientRect();
                    const newX = e.clientX - parentRect.left - dragOffset.x;
                    const newY = e.clientY - parentRect.top - dragOffset.y;

                    // Constrain to parent bounds
                    const boundedX = Math.max(0, Math.min(newX, parentRect.width - initialSize.width));
                    const boundedY = Math.max(0, Math.min(newY, parentRect.height - initialSize.height));

                    onPositionChange(id, { x: boundedX, y: boundedY });
                }
            }

            if (isResizing && resizeStart) {
                const deltaX = e.clientX - resizeStart.x;
                const deltaY = e.clientY - resizeStart.y;

                let newWidth = resizeStart.width;
                let newHeight = resizeStart.height;
                let newX = resizeStart.posX;
                let newY = resizeStart.posY;

                // Horizontal Resize
                if (resizeStart.handle.includes('e')) {
                    newWidth = Math.max(minSize.width, resizeStart.width + deltaX);
                } else if (resizeStart.handle.includes('w')) {
                    newWidth = Math.max(minSize.width, resizeStart.width - deltaX);
                    newX = resizeStart.posX + (resizeStart.width - newWidth);
                }

                // Vertical Resize
                if (resizeStart.handle.includes('s')) {
                    newHeight = Math.max(minSize.height, resizeStart.height + deltaY);
                } else if (resizeStart.handle.includes('n')) {
                    newHeight = Math.max(minSize.height, resizeStart.height - deltaY);
                    newY = resizeStart.posY + (resizeStart.height - newHeight);
                }

                if (onTransform) {
                    onTransform(id, { x: newX, y: newY, width: newWidth, height: newHeight });
                } else {
                    if (onSizeChange) onSizeChange(id, { width: newWidth, height: newHeight });
                    if (onPositionChange && (newX !== resizeStart.posX || newY !== resizeStart.posY))
                        onPositionChange(id, { x: newX, y: newY });
                }
            }
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            setIsResizing(false);
            setResizeStart(null);
        };

        if (isDragging || isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, isResizing, dragOffset, resizeStart, id, onPositionChange, onSizeChange, initialSize, minSize, maxSize]);

    return (
        <div
            ref={elementRef}
            className={`absolute ${locked ? 'cursor-default' : 'cursor-move'} select-none ${isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : ''} ${className}`}
            style={{
                left: `${initialPosition.x}px`,
                top: `${initialPosition.y}px`,
                width: `${initialSize.width}px`,
                height: `${initialSize.height}px`,
                zIndex: isSelected ? 10 : 1,
                userSelect: 'none' // Prevent text selection during drag
            }}
            onMouseDown={handleMouseDown}
            onClick={(e) => { e.stopPropagation(); onSelect?.(id); }}
            onDoubleClick={(e) => {
                onDoubleClick?.(id);
            }}
        >
            {children}

            {/* Resize handles */}
            {isSelected && resizable && !locked && (
                <>
                    {/* Corner handles */}
                    <div
                        className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-blue-500 cursor-se-resize rounded-full shadow-sm z-50 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'se')}
                    />
                    <div
                        className="absolute -left-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-blue-500 cursor-sw-resize rounded-full shadow-sm z-50 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'sw')}
                    />
                    <div
                        className="absolute -right-1.5 -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 cursor-ne-resize rounded-full shadow-sm z-50 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'ne')}
                    />
                    <div
                        className="absolute -left-1.5 -top-1.5 w-4 h-4 bg-white border-2 border-blue-500 cursor-nw-resize rounded-full shadow-sm z-50 hover:scale-125 transition-transform"
                        onMouseDown={(e) => handleResizeStart(e, 'nw')}
                    />
                </>
            )}
        </div>
    );
}
