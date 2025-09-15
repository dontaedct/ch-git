/**
 * Hero Tasks - Drag and Drop Hook
 * Created: 2025-01-27T10:30:00.000Z
 * Version: 1.0.0
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';

export interface DragItem {
  id: string;
  index: number;
  element: HTMLElement;
}

export interface DropZone {
  id: string;
  index: number;
  element: HTMLElement;
}

export interface DragAndDropState {
  draggedItem: DragItem | null;
  dropZone: DropZone | null;
  isDragging: boolean;
  dragOffset: { x: number; y: number };
}

export interface DragAndDropCallbacks<T> {
  onDragStart: (item: T, index: number) => void;
  onDragEnd: (item: T, fromIndex: number, toIndex: number) => void;
  onDragOver?: (item: T, overIndex: number) => void;
  onDragLeave?: (item: T) => void;
}

export interface UseDragAndDropOptions<T> {
  items: T[];
  onReorder: (fromIndex: number, toIndex: number) => void;
  getItemId: (item: T) => string;
  disabled?: boolean;
  dragThreshold?: number;
  animationDuration?: number;
}

export function useDragAndDrop<T>({
  items,
  onReorder,
  getItemId,
  disabled = false,
  dragThreshold = 5,
  animationDuration = 0.2
}: UseDragAndDropOptions<T>) {
  const [state, setState] = useState<DragAndDropState>({
    draggedItem: null,
    dropZone: null,
    isDragging: false,
    dragOffset: { x: 0, y: 0 }
  });

  const dragConstraintsRef = useRef<HTMLElement | null>(null);
  const itemRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Register item element
  const registerItem = useCallback((id: string, element: HTMLElement | null) => {
    if (element) {
      itemRefs.current.set(id, element);
    } else {
      itemRefs.current.delete(id);
    }
  }, []);

  // Get item index by ID
  const getItemIndex = useCallback((id: string) => {
    return items.findIndex(item => getItemId(item) === id);
  }, [items, getItemId]);

  // Handle drag start
  const handleDragStart = useCallback((event: any, info: PanInfo, itemId: string) => {
    if (disabled) return;

    const index = getItemIndex(itemId);
    const element = itemRefs.current.get(itemId);
    
    if (element && index !== -1) {
      setState(prev => ({
        ...prev,
        draggedItem: { id: itemId, index, element },
        isDragging: true,
        dragOffset: { x: info.offset.x, y: info.offset.y }
      }));

      // Add dragging class to body for global styles
      document.body.classList.add('dragging-active');
    }
  }, [disabled, getItemIndex]);

  // Handle drag end
  const handleDragEnd = useCallback((event: any, info: PanInfo, itemId: string) => {
    if (disabled || !state.draggedItem) return;

    const fromIndex = state.draggedItem.index;
    const toIndex = state.dropZone?.index ?? fromIndex;

    // Remove dragging class from body
    document.body.classList.remove('dragging-active');

    // Reset state
    setState({
      draggedItem: null,
      dropZone: null,
      isDragging: false,
      dragOffset: { x: 0, y: 0 }
    });

    // Trigger reorder if position changed
    if (fromIndex !== toIndex && toIndex >= 0 && toIndex < items.length) {
      onReorder(fromIndex, toIndex);
    }
  }, [disabled, state.draggedItem, state.dropZone, onReorder, items.length]);

  // Handle drag over
  const handleDragOver = useCallback((event: any, info: PanInfo, itemId: string) => {
    if (disabled || !state.draggedItem || state.draggedItem.id === itemId) return;

    const overIndex = getItemIndex(itemId);
    const element = itemRefs.current.get(itemId);

    if (element && overIndex !== -1) {
      setState(prev => ({
        ...prev,
        dropZone: { id: itemId, index: overIndex, element }
      }));
    }
  }, [disabled, state.draggedItem, getItemIndex]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    if (disabled) return;

    setState(prev => ({
      ...prev,
      dropZone: null
    }));
  }, [disabled]);

  // Calculate drag constraints
  const getDragConstraints = useCallback(() => {
    if (!dragConstraintsRef.current) return {};

    const rect = dragConstraintsRef.current.getBoundingClientRect();
    return {
      left: -rect.left,
      right: window.innerWidth - rect.right,
      top: -rect.top,
      bottom: window.innerHeight - rect.bottom
    };
  }, []);

  // Get motion props for draggable item
  const getDragProps = useCallback((itemId: string) => {
    const isDragged = state.draggedItem?.id === itemId;
    const isDropTarget = state.dropZone?.id === itemId;

    return {
      drag: !disabled,
      dragConstraints: getDragConstraints(),
      dragElastic: 0.1,
      dragMomentum: false,
      onDragStart: (event: any, info: PanInfo) => handleDragStart(event, info, itemId),
      onDragEnd: (event: any, info: PanInfo) => handleDragEnd(event, info, itemId),
      onDrag: (event: any, info: PanInfo) => handleDragOver(event, info, itemId),
      animate: {
        scale: isDragged ? 1.05 : 1,
        rotate: isDragged ? 2 : 0,
        zIndex: isDragged ? 1000 : 1,
        boxShadow: isDragged 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        transition: {
          duration: animationDuration,
          ease: 'easeOut'
        }
      },
      whileDrag: {
        scale: 1.05,
        rotate: 2,
        zIndex: 1000,
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        transition: {
          duration: 0.1,
          ease: 'easeOut'
        }
      },
      style: {
        cursor: disabled ? 'default' : (isDragged ? 'grabbing' : 'grab')
      }
    };
  }, [disabled, state.draggedItem, state.dropZone, getDragConstraints, animationDuration, handleDragStart, handleDragEnd, handleDragOver]);

  // Get drop zone props
  const getDropZoneProps = useCallback((itemId: string) => {
    const isDropTarget = state.dropZone?.id === itemId;
    const isDragged = state.draggedItem?.id === itemId;

    return {
      animate: {
        scale: isDropTarget && !isDragged ? 1.02 : 1,
        backgroundColor: isDropTarget && !isDragged ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
        borderColor: isDropTarget && !isDragged ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
        transition: {
          duration: animationDuration,
          ease: 'easeOut'
        }
      }
    };
  }, [state.dropZone, state.draggedItem, animationDuration]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove('dragging-active');
    };
  }, []);

  return {
    state,
    registerItem,
    getDragProps,
    getDropZoneProps,
    dragConstraintsRef,
    isDragging: state.isDragging,
    draggedItem: state.draggedItem,
    dropZone: state.dropZone
  };
}

export default useDragAndDrop;
