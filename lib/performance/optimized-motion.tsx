/**
 * @fileoverview HT-008.2.2: Optimized Motion System with Memory Leak Prevention
 * @module lib/performance/optimized-motion
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.2.2 - Fix memory leaks in motion system and event listeners
 * Focus: Memory-efficient motion system with leak prevention
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance-critical motion management)
 */

import React, { useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, MotionProps } from 'framer-motion';
import { useMemoryLeakPrevention } from './memory-leak-detector';
import { useReducedMotion } from '@/hooks/use-motion-preference';

/**
 * Optimized motion variants with memory management
 */
export const optimizedVariants = {
  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Card animations
  cardHover: {
    initial: { scale: 1, y: 0 },
    hover: { scale: 1.02, y: -2 },
    transition: { duration: 0.15, ease: 'easeOut' }
  },
  
  // List item animations
  listItem: {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Modal animations
  modal: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2, ease: 'easeOut' }
  },
  
  // Button animations
  button: {
    initial: { scale: 1 },
    tap: { scale: 0.98 },
    hover: { scale: 1.02 },
    transition: { duration: 0.1, ease: 'easeOut' }
  }
};

/**
 * Optimized motion component with memory leak prevention
 */
interface OptimizedMotionProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: keyof typeof optimizedVariants;
  enableHover?: boolean;
  enableTap?: boolean;
  enableDrag?: boolean;
  onAnimationComplete?: () => void;
}

export function OptimizedMotion({
  children,
  variant = 'pageTransition',
  enableHover = false,
  enableTap = false,
  enableDrag = false,
  onAnimationComplete,
  ...props
}: OptimizedMotionProps) {
  const { registerTimer, unregisterTimer } = useMemoryLeakPrevention();
  const reducedMotion = useReducedMotion();
  const animationRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize variants to prevent recreation
  const memoizedVariants = useMemo(() => {
    if (reducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
      };
    }
    return optimizedVariants[variant];
  }, [variant, reducedMotion]);

  // Handle animation completion with cleanup
  const handleAnimationComplete = useCallback(() => {
    if (onAnimationComplete) {
      // Use safe timeout to prevent memory leaks
      timeoutRef.current = setTimeout(() => {
        onAnimationComplete();
        if (timeoutRef.current) {
          unregisterTimer(timeoutRef.current);
          timeoutRef.current = null;
        }
      }, 0);
      
      if (timeoutRef.current) {
        registerTimer(timeoutRef.current);
      }
    }
  }, [onAnimationComplete, registerTimer, unregisterTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        unregisterTimer(timeoutRef.current);
        clearTimeout(timeoutRef.current);
      }
    };
  }, [unregisterTimer]);

  // Enhanced motion props with memory management
  const enhancedProps = useMemo(() => ({
    variants: memoizedVariants,
    onAnimationComplete: handleAnimationComplete,
    // Disable expensive features when not needed
    drag: enableDrag && !reducedMotion,
    whileHover: enableHover && !reducedMotion ? (memoizedVariants as any).hover : undefined,
    whileTap: enableTap && !reducedMotion ? (memoizedVariants as any).tap : undefined,
    // Optimize for performance
    layout: false, // Disable layout animations by default
    transformTemplate: undefined, // Disable custom transform templates
    // Pass through valid motion props
    style: props.style,
    className: props.className,
    initial: props.initial,
    animate: props.animate,
    exit: props.exit,
    transition: props.transition,
  }), [memoizedVariants, props, handleAnimationComplete, enableDrag, enableHover, enableTap, reducedMotion]);

  return (
    <motion.div
      ref={animationRef}
      {...enhancedProps}
    >
      {children}
    </motion.div>
  );
}

/**
 * Optimized AnimatePresence with memory management
 */
interface OptimizedAnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  onExitComplete?: () => void;
}

export function OptimizedAnimatePresence({
  children,
  mode = 'wait',
  onExitComplete,
  ...props
}: OptimizedAnimatePresenceProps) {
  const { registerTimer, unregisterTimer } = useMemoryLeakPrevention();
  const reducedMotion = useReducedMotion();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle exit completion with cleanup
  const handleExitComplete = useCallback(() => {
    if (onExitComplete) {
      timeoutRef.current = setTimeout(() => {
        onExitComplete();
        if (timeoutRef.current) {
          unregisterTimer(timeoutRef.current);
          timeoutRef.current = null;
        }
      }, 0);
      
      if (timeoutRef.current) {
        registerTimer(timeoutRef.current);
      }
    }
  }, [onExitComplete, registerTimer, unregisterTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        unregisterTimer(timeoutRef.current);
        clearTimeout(timeoutRef.current);
      }
    };
  }, [unregisterTimer]);

  // Disable animations if reduced motion is preferred
  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence
      mode={mode}
      onExitComplete={handleExitComplete}
      {...props}
    >
      {children}
    </AnimatePresence>
  );
}

/**
 * Optimized scroll-triggered animations
 */
interface OptimizedScrollMotionProps {
  children: React.ReactNode;
  threshold?: number;
  triggerOnce?: boolean;
  onEnter?: () => void;
  onExit?: () => void;
}

export function OptimizedScrollMotion({
  children,
  threshold = 0.1,
  triggerOnce = true,
  onEnter,
  onExit,
  ...props
}: OptimizedScrollMotionProps) {
  const { registerObserver, unregisterObserver } = useMemoryLeakPrevention();
  const reducedMotion = useReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (reducedMotion || !elementRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!hasTriggeredRef.current) {
              onEnter?.();
              hasTriggeredRef.current = true;
            }
          } else if (!triggerOnce) {
            onExit?.();
          }
        });
      },
      { threshold }
    );

    observerRef.current.observe(elementRef.current);
    registerObserver(observerRef.current);

    return () => {
      if (observerRef.current) {
        unregisterObserver(observerRef.current);
        observerRef.current.disconnect();
      }
    };
  }, [threshold, triggerOnce, onEnter, onExit, reducedMotion, registerObserver, unregisterObserver]);

  if (reducedMotion) {
    return <div ref={elementRef}>{children}</div>;
  }

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: triggerOnce, amount: threshold }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Optimized stagger animations for lists
 */
interface OptimizedStaggerProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function OptimizedStagger({
  children,
  staggerDelay = 0.1,
  direction = 'up',
  ...props
}: OptimizedStaggerProps) {
  const reducedMotion = useReducedMotion();

  const staggerVariants = useMemo(() => {
    if (reducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: { duration: 0 }
      };
    }

    const directionMap = {
      up: { y: 20 },
      down: { y: -20 },
      left: { x: 20 },
      right: { x: -20 }
    };

    return {
      initial: { opacity: 0, ...directionMap[direction] },
      animate: { opacity: 1, x: 0, y: 0 },
      transition: { duration: 0.3, ease: 'easeOut' }
    };
  }, [direction, reducedMotion]);

  if (reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={{
        animate: {
          transition: {
            staggerChildren: staggerDelay
          }
        }
      }}
      {...props}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          variants={staggerVariants}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}

/**
 * Performance-optimized motion hook
 */
export function useOptimizedMotion() {
  const { getMemoryStats, forceGarbageCollection } = useMemoryLeakPrevention();
  const reducedMotion = useReducedMotion();

  const createOptimizedVariants = useCallback((baseVariants: any) => {
    if (reducedMotion) {
      return {
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 }
      };
    }
    return baseVariants;
  }, [reducedMotion]);

  const optimizeForPerformance = useCallback(() => {
    const stats = getMemoryStats();
    
    // Force garbage collection if memory usage is high
    if (stats.memoryDelta > 30 * 1024 * 1024) { // 30MB
      forceGarbageCollection();
    }
    
    return stats;
  }, [getMemoryStats, forceGarbageCollection]);

  return {
    createOptimizedVariants,
    optimizeForPerformance,
    reducedMotion,
    memoryStats: getMemoryStats()
  };
}

export default OptimizedMotion;
