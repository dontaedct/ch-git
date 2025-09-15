/**
 * @fileoverview HT-008.2.6: Virtual Scrolling System for Large Lists
 * @module lib/performance/virtual-scrolling
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.6 - Implement virtual scrolling for large lists
 * Focus: High-performance virtual scrolling with smooth interactions
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical list rendering)
 */

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Logger } from '@/lib/observability/logger';
import { useMemoryLeakPrevention } from './memory-leak-detector';

/**
 * Virtual scrolling configuration
 */
interface VirtualScrollingConfig {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  threshold?: number;
  enableSmoothScrolling?: boolean;
  enableMomentum?: boolean;
  momentumDecay?: number;
  scrollDebounceMs?: number;
}

/**
 * Virtual scrolling state
 */
interface VirtualScrollingState {
  scrollTop: number;
  startIndex: number;
  endIndex: number;
  visibleItems: any[];
  totalHeight: number;
  offsetY: number;
  isScrolling: boolean;
}

/**
 * Virtual scrolling hook
 */
export function useVirtualScrolling<T>(
  items: T[],
  config: VirtualScrollingConfig
) {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 0.1,
    enableSmoothScrolling = true,
    enableMomentum = true,
    momentumDecay = 0.95,
    scrollDebounceMs = 16
  } = config;

  const { registerTimer, unregisterTimer } = useMemoryLeakPrevention();
  
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [momentum, setMomentum] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const momentumTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollTimeRef = useRef<number>(0);
  const lastScrollTopRef = useRef<number>(0);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length - 1
    );
    
    return {
      startIndex: Math.max(0, startIndex - overscan),
      endIndex: Math.min(items.length - 1, endIndex)
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange]);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.startIndex * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    const newScrollTop = target.scrollTop;
    const now = Date.now();
    
    // Calculate momentum
    if (enableMomentum && now - lastScrollTimeRef.current < 100) {
      const scrollDelta = newScrollTop - lastScrollTopRef.current;
      const timeDelta = now - lastScrollTimeRef.current;
      const velocity = scrollDelta / timeDelta;
      
      setMomentum(velocity * momentumDecay);
    }
    
    setScrollTop(newScrollTop);
    setIsScrolling(true);
    lastScrollTopRef.current = newScrollTop;
    lastScrollTimeRef.current = now;
    
    // Clear existing timeout
    if (scrollTimeoutRef.current) {
      unregisterTimer(scrollTimeoutRef.current);
      clearTimeout(scrollTimeoutRef.current);
    }
    
    // Set scroll end timeout
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolling(false);
      if (scrollTimeoutRef.current) {
        unregisterTimer(scrollTimeoutRef.current);
        scrollTimeoutRef.current = null;
      }
    }, scrollDebounceMs);
    
    if (scrollTimeoutRef.current) {
      registerTimer(scrollTimeoutRef.current);
    }
  }, [enableMomentum, momentumDecay, scrollDebounceMs, registerTimer, unregisterTimer]);

  // Handle momentum scrolling
  useEffect(() => {
    if (enableMomentum && momentum !== 0 && !isScrolling) {
      momentumTimeoutRef.current = setTimeout(() => {
        if (containerRef.current) {
          const newScrollTop = Math.max(0, Math.min(
            containerRef.current.scrollTop + momentum,
            totalHeight - containerHeight
          ));
          
          containerRef.current.scrollTop = newScrollTop;
          setMomentum(prev => prev * momentumDecay);
          
          if (Math.abs(momentum) < 0.1) {
            setMomentum(0);
          }
        }
      }, 16);
      
      if (momentumTimeoutRef.current) {
        registerTimer(momentumTimeoutRef.current);
      }
    }
    
    return () => {
      if (momentumTimeoutRef.current) {
        unregisterTimer(momentumTimeoutRef.current);
        clearTimeout(momentumTimeoutRef.current);
      }
    };
  }, [momentum, isScrolling, enableMomentum, momentumDecay, totalHeight, containerHeight, registerTimer, unregisterTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        unregisterTimer(scrollTimeoutRef.current);
        clearTimeout(scrollTimeoutRef.current);
      }
      if (momentumTimeoutRef.current) {
        unregisterTimer(momentumTimeoutRef.current);
        clearTimeout(momentumTimeoutRef.current);
      }
    };
  }, [unregisterTimer]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (containerRef.current) {
      const targetScrollTop = index * itemHeight;
      containerRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    scrollToItem(items.length - 1);
  }, [scrollToItem, items.length]);

  return {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
    isScrolling,
    momentum,
    scrollToItem,
    scrollToTop,
    scrollToBottom,
    state: {
      scrollTop,
      startIndex: visibleRange.startIndex,
      endIndex: visibleRange.endIndex,
      visibleItems,
      totalHeight,
      offsetY,
      isScrolling
    }
  };
}

/**
 * Virtual list component
 */
interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  enableSmoothScrolling?: boolean;
  enableMomentum?: boolean;
}

export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = '',
  onScroll,
  enableSmoothScrolling = true,
  enableMomentum = true
}: VirtualListProps<T>) {
  const virtualScrolling = useVirtualScrolling(items, {
    itemHeight,
    containerHeight,
    overscan,
    enableSmoothScrolling,
    enableMomentum
  });

  const {
    containerRef,
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange,
    isScrolling
  } = virtualScrolling;

  // Handle scroll with callback
  const handleScrollWithCallback = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    handleScroll(event);
    if (onScroll) {
      onScroll(virtualScrolling.state.scrollTop);
    }
  }, [handleScroll, onScroll, virtualScrolling.state.scrollTop]);

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        scrollBehavior: enableSmoothScrolling ? 'smooth' : 'auto'
      }}
      onScroll={handleScrollWithCallback}
    >
      <div
        style={{
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            return (
              <div
                key={keyExtractor(item, actualIndex)}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Scroll indicator */}
      {isScrolling && (
        <div
          className="scroll-indicator"
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            background: 'rgba(0, 0, 0, 0.5)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '12px',
            zIndex: 1000
          }}
        >
          {visibleRange.startIndex + 1}-{visibleRange.endIndex + 1} of {items.length}
        </div>
      )}
    </div>
  );
}

/**
 * Virtual grid component
 */
interface VirtualGridProps<T> {
  items: T[];
  itemWidth: number;
  itemHeight: number;
  containerWidth: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number, scrollLeft: number) => void;
}

export function VirtualGrid<T>({
  items,
  itemWidth,
  itemHeight,
  containerWidth,
  containerHeight,
  renderItem,
  keyExtractor,
  overscan = 5,
  className = '',
  onScroll
}: VirtualGridProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { registerTimer, unregisterTimer } = useMemoryLeakPrevention();

  // Calculate grid dimensions
  const columnsPerRow = Math.floor(containerWidth / itemWidth);
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const totalHeight = totalRows * itemHeight;
  const totalWidth = columnsPerRow * itemWidth;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / itemHeight);
    const endRow = Math.min(
      startRow + Math.ceil(containerHeight / itemHeight) + overscan,
      totalRows - 1
    );
    
    const startCol = Math.floor(scrollLeft / itemWidth);
    const endCol = Math.min(
      startCol + Math.ceil(containerWidth / itemWidth) + overscan,
      columnsPerRow - 1
    );
    
    return {
      startRow: Math.max(0, startRow - overscan),
      endRow: Math.min(totalRows - 1, endRow),
      startCol: Math.max(0, startCol - overscan),
      endCol: Math.min(columnsPerRow - 1, endCol)
    };
  }, [scrollTop, scrollLeft, itemHeight, itemWidth, containerHeight, containerWidth, overscan, totalRows, columnsPerRow]);

  // Get visible items
  const visibleItems = useMemo(() => {
    const visibleItemsArray: Array<{ item: T; index: number; row: number; col: number }> = [];
    
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = visibleRange.startCol; col <= visibleRange.endCol; col++) {
        const index = row * columnsPerRow + col;
        if (index < items.length) {
          visibleItemsArray.push({
            item: items[index],
            index,
            row,
            col
          });
        }
      }
    }
    
    return visibleItemsArray;
  }, [items, visibleRange, columnsPerRow]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const target = event.target as HTMLDivElement;
    setScrollTop(target.scrollTop);
    setScrollLeft(target.scrollLeft);
    
    if (onScroll) {
      onScroll(target.scrollTop, target.scrollLeft);
    }
  }, [onScroll]);

  const offsetY = visibleRange.startRow * itemHeight;
  const offsetX = visibleRange.startCol * itemWidth;

  return (
    <div
      ref={containerRef}
      className={`virtual-grid ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto'
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          width: totalWidth,
          height: totalHeight,
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translate(${offsetX}px, ${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
          {visibleItems.map(({ item, index, row, col }) => (
            <div
              key={keyExtractor(item, index)}
              style={{
                position: 'absolute',
                left: col * itemWidth,
                top: row * itemHeight,
                width: itemWidth,
                height: itemHeight
              }}
            >
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Virtual scrolling utilities
 */
export const VirtualScrollingUtils = {
  /**
   * Calculate optimal item height
   */
  calculateOptimalItemHeight: (containerHeight: number, itemCount: number): number => {
    const minItemHeight = 20;
    const maxItemHeight = 200;
    const optimalHeight = containerHeight / Math.min(itemCount, 10);
    
    return Math.max(minItemHeight, Math.min(maxItemHeight, optimalHeight));
  },

  /**
   * Calculate optimal overscan
   */
  calculateOptimalOverscan: (itemHeight: number, containerHeight: number): number => {
    const visibleItems = Math.ceil(containerHeight / itemHeight);
    return Math.max(2, Math.ceil(visibleItems * 0.1));
  },

  /**
   * Estimate scroll position for item
   */
  estimateScrollPosition: (itemIndex: number, itemHeight: number, containerHeight: number): number => {
    return Math.max(0, itemIndex * itemHeight - containerHeight / 2);
  },

  /**
   * Check if item is visible
   */
  isItemVisible: (
    itemIndex: number,
    scrollTop: number,
    itemHeight: number,
    containerHeight: number
  ): boolean => {
    const itemTop = itemIndex * itemHeight;
    const itemBottom = itemTop + itemHeight;
    const containerTop = scrollTop;
    const containerBottom = scrollTop + containerHeight;
    
    return itemBottom > containerTop && itemTop < containerBottom;
  }
};

export default VirtualList;
