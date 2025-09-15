/**
 * @fileoverview HT-007 Motion System Integration Utilities
 * @module lib/motion/motion-integration
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 2 - Motion System & Animation Framework
 * Purpose: Integration utilities for applying motion system to sandbox pages
 * Safety: Sandbox-isolated motion integration with accessibility support
 * Status: Phase 2 implementation - Motion system integration
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  monoThemeMotionTokens,
  pageVariants,
  cardHoverVariants,
  buttonVariants,
  staggerContainerVariants,
  listItemVariants,
  iconVariants,
  createAdvancedMotionConfig,
  createAccessibleMotion,
  createSpringConfig,
  createMotionIntersection,
  EnhancedMotionPage,
  EnhancedMotionCard,
  EnhancedMotionButton,
  useMonoMotionPreferences,
} from './mono-theme-motion';

/* ========================================
   HT-007 Motion System Integration Utilities
   Utilities for seamless motion system integration
======================================== */

// HT-007: Motion system provider for sandbox pages
export const MotionSystemProvider: React.FC<{
  children: React.ReactNode;
  enableReducedMotion?: boolean;
  enableDebugMode?: boolean;
  enablePerformanceOptimization?: boolean;
}> = ({ 
  children, 
  enableReducedMotion = true, 
  enableDebugMode = false,
  enablePerformanceOptimization = true 
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  React.useEffect(() => {
    // Apply motion preferences to document
    if (prefersReducedMotion || enableReducedMotion) {
      document.documentElement.classList.add('no-motion');
    } else {
      document.documentElement.classList.remove('no-motion');
    }
    
    // Apply debug mode
    if (enableDebugMode) {
      document.documentElement.classList.add('motion-debug');
    } else {
      document.documentElement.classList.remove('motion-debug');
    }
    
    // Apply performance optimization
    if (enablePerformanceOptimization) {
      document.documentElement.classList.add('motion-optimized');
    } else {
      document.documentElement.classList.remove('motion-optimized');
    }
    
    return () => {
      document.documentElement.classList.remove('no-motion', 'motion-debug', 'motion-optimized');
    };
  }, [prefersReducedMotion, enableReducedMotion, enableDebugMode, enablePerformanceOptimization]);
  
  return <>{children}</>;
};

// HT-007: Motion-enabled page wrapper for sandbox pages
export const MotionPageWrapper: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableLayoutAnimation?: boolean;
  enableIntersectionObserver?: boolean;
  enableGestureHandling?: boolean;
  debugMode?: boolean;
}> = ({ 
  children, 
  className = '',
  enableLayoutAnimation = true,
  enableIntersectionObserver = true,
  enableGestureHandling = false,
  debugMode = false 
}) => {
  return (
    <EnhancedMotionPage
      enableLayoutAnimation={enableLayoutAnimation}
      enableIntersectionObserver={enableIntersectionObserver}
      enableGestureHandling={enableGestureHandling}
      debugMode={debugMode}
      className={`min-h-screen ${className}`}
    >
      {children}
    </EnhancedMotionPage>
  );
};

// HT-007: Motion-enabled section wrapper
export const MotionSection: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableHoverEffects?: boolean;
  enableTapEffects?: boolean;
  enableDragEffects?: boolean;
  springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
  intersectionThreshold?: number;
}> = ({ 
  children, 
  className = '',
  enableHoverEffects = true,
  enableTapEffects = true,
  enableDragEffects = false,
  springType = 'gentle',
  intersectionThreshold = 0.1
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const { ref, isVisible } = createMotionIntersection(intersectionThreshold);
  
  return (
    <motion.section
      ref={ref}
      variants={createAccessibleMotion(cardHoverVariants, prefersReducedMotion)}
      initial="initial"
      animate={isVisible ? "animate" : "initial"}
      whileHover={enableHoverEffects ? "hover" : undefined}
      whileTap={enableTapEffects ? "tap" : undefined}
      drag={enableDragEffects}
      dragConstraints={enableDragEffects ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined}
      transition={createSpringConfig(springType)}
      className={className}
    >
      {children}
    </motion.section>
  );
};

// HT-007: Motion-enabled card wrapper
export const MotionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableHoverEffects?: boolean;
  enableTapEffects?: boolean;
  enableDragEffects?: boolean;
  springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
}> = ({ 
  children, 
  className = '',
  enableHoverEffects = true,
  enableTapEffects = true,
  enableDragEffects = false,
  springType = 'gentle'
}) => {
  return (
    <EnhancedMotionCard
      enableHoverEffects={enableHoverEffects}
      enableTapEffects={enableTapEffects}
      enableDragEffects={enableDragEffects}
      springType={springType}
      className={className}
    >
      {children}
    </EnhancedMotionCard>
  );
};

// HT-007: Motion-enabled button wrapper
export const MotionButton: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableRippleEffect?: boolean;
  enableHoverGlow?: boolean;
  enablePressFeedback?: boolean;
  springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}> = ({ 
  children, 
  className = '',
  enableRippleEffect = true,
  enableHoverGlow = true,
  enablePressFeedback = true,
  springType = 'gentle',
  onClick,
  disabled = false,
  type = 'button'
}) => {
  return (
    <EnhancedMotionButton
      enableRippleEffect={enableRippleEffect}
      enableHoverGlow={enableHoverGlow}
      enablePressFeedback={enablePressFeedback}
      springType={springType}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={className}
    >
      {children}
    </EnhancedMotionButton>
  );
};

// HT-007: Motion-enabled list wrapper
export const MotionList: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableStaggerAnimation?: boolean;
  staggerDelay?: number;
}> = ({ 
  children, 
  className = '',
  enableStaggerAnimation = true,
  staggerDelay = 0.1
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  const containerVariants = React.useMemo(() => ({
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: enableStaggerAnimation ? staggerDelay : 0,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: enableStaggerAnimation ? staggerDelay : 0,
        staggerDirection: -1,
      },
    },
  }), [enableStaggerAnimation, staggerDelay]);
  
  const itemVariants = React.useMemo(() => ({
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: monoThemeMotionTokens.duration.normal,
        ease: monoThemeMotionTokens.easing.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: {
        duration: monoThemeMotionTokens.duration.fast,
        ease: monoThemeMotionTokens.easing.easeIn,
      },
    },
  }), []);
  
  return (
    <motion.div
      variants={createAccessibleMotion(containerVariants, prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={createAccessibleMotion(itemVariants, prefersReducedMotion)}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// HT-007: Motion-enabled grid wrapper
export const MotionGrid: React.FC<{
  children: React.ReactNode;
  className?: string;
  columns?: number;
  gap?: number;
  enableStaggerAnimation?: boolean;
  staggerDelay?: number;
}> = ({ 
  children, 
  className = '',
  columns = 3,
  gap = 4,
  enableStaggerAnimation = true,
  staggerDelay = 0.1
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  const gridVariants = React.useMemo(() => ({
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: enableStaggerAnimation ? staggerDelay : 0,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        staggerChildren: enableStaggerAnimation ? staggerDelay : 0,
        staggerDirection: -1,
      },
    },
  }), [enableStaggerAnimation, staggerDelay]);
  
  const itemVariants = React.useMemo(() => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: { 
      opacity: 1, 
      scale: 1,
      transition: {
        duration: monoThemeMotionTokens.duration.normal,
        ease: monoThemeMotionTokens.easing.easeOut,
      },
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      transition: {
        duration: monoThemeMotionTokens.duration.fast,
        ease: monoThemeMotionTokens.easing.easeIn,
      },
    },
  }), []);
  
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: `${gap * 0.25}rem`,
  };
  
  return (
    <motion.div
      variants={createAccessibleMotion(gridVariants, prefersReducedMotion)}
      initial="initial"
      animate="animate"
      exit="exit"
      style={gridStyle}
      className={className}
    >
      <AnimatePresence mode="popLayout">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={createAccessibleMotion(itemVariants, prefersReducedMotion)}
            layout
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};

// HT-007: Motion-enabled text wrapper
export const MotionText: React.FC<{
  children: React.ReactNode;
  className?: string;
  animation?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scaleIn';
  delay?: number;
  duration?: number;
}> = ({ 
  children, 
  className = '',
  animation = 'fadeIn',
  delay = 0,
  duration = 0.5
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  const textVariants = React.useMemo(() => {
    const baseVariants = {
      initial: { opacity: 0 },
      animate: { 
        opacity: 1,
        transition: {
          duration: duration,
          delay: delay,
          ease: monoThemeMotionTokens.easing.easeOut,
        },
      },
    };
    
    switch (animation) {
      case 'slideUp':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: 20 },
          animate: { ...baseVariants.animate, y: 0 },
        };
      case 'slideDown':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, y: -20 },
          animate: { ...baseVariants.animate, y: 0 },
        };
      case 'slideLeft':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, x: 20 },
          animate: { ...baseVariants.animate, x: 0 },
        };
      case 'slideRight':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, x: -20 },
          animate: { ...baseVariants.animate, x: 0 },
        };
      case 'scaleIn':
        return {
          ...baseVariants,
          initial: { ...baseVariants.initial, scale: 0.9 },
          animate: { ...baseVariants.animate, scale: 1 },
        };
      default:
        return baseVariants;
    }
  }, [animation, delay, duration]);
  
  return (
    <motion.div
      variants={createAccessibleMotion(textVariants, prefersReducedMotion)}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
};

// HT-007: Motion-enabled icon wrapper
export const MotionIcon: React.FC<{
  children: React.ReactNode;
  className?: string;
  enableHoverEffects?: boolean;
  enableTapEffects?: boolean;
  springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
}> = ({ 
  children, 
  className = '',
  enableHoverEffects = true,
  enableTapEffects = true,
  springType = 'gentle'
}) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  return (
    <motion.div
      variants={createAccessibleMotion(iconVariants, prefersReducedMotion)}
      initial="initial"
      whileHover={enableHoverEffects ? "hover" : undefined}
      whileTap={enableTapEffects ? "tap" : undefined}
      transition={createSpringConfig(springType)}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// HT-007: Motion system configuration hook
export const useMotionSystemConfig = () => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  
  const config = React.useMemo(() => ({
    // Motion preferences
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    
    // Motion tokens
    tokens: monoThemeMotionTokens,
    
    // Motion variants
    variants: {
      page: pageVariants,
      card: cardHoverVariants,
      button: buttonVariants,
      stagger: staggerContainerVariants,
      listItem: listItemVariants,
    },
    
    // Motion utilities
    createConfig: createAdvancedMotionConfig,
    createSpring: createSpringConfig,
    createIntersection: createMotionIntersection,
    
    // Motion components
    components: {
      Page: MotionPageWrapper,
      Section: MotionSection,
      Card: MotionCard,
      Button: MotionButton,
      List: MotionList,
      Grid: MotionGrid,
      Text: MotionText,
      Icon: MotionIcon,
    },
  }), [prefersReducedMotion]);
  
  return config;
};

// HT-007: Motion system initialization utility
export const initializeMotionSystem = (options: {
  enableReducedMotion?: boolean;
  enableDebugMode?: boolean;
  enablePerformanceOptimization?: boolean;
  enableAccessibility?: boolean;
} = {}) => {
  const {
    enableReducedMotion = true,
    enableDebugMode = false,
    enablePerformanceOptimization = true,
    enableAccessibility = true,
  } = options;
  
  // Apply global motion system configuration
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Apply reduced motion preference
    if (enableReducedMotion) {
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) {
        root.classList.add('no-motion');
      }
    }
    
    // Apply debug mode
    if (enableDebugMode) {
      root.classList.add('motion-debug');
    }
    
    // Apply performance optimization
    if (enablePerformanceOptimization) {
      root.classList.add('motion-optimized');
    }
    
    // Apply accessibility enhancements
    if (enableAccessibility) {
      root.classList.add('motion-accessible');
    }
  }
  
  return {
    motionSystemReady: true,
    configuration: {
      enableReducedMotion,
      enableDebugMode,
      enablePerformanceOptimization,
      enableAccessibility,
    },
  };
};

export default {
  MotionSystemProvider,
  MotionPageWrapper,
  MotionSection,
  MotionCard,
  MotionButton,
  MotionList,
  MotionGrid,
  MotionText,
  MotionIcon,
  useMotionSystemConfig,
  initializeMotionSystem,
};
