/**
 * @fileoverview HT-007 Framer Motion Integration System
 * @module lib/motion/mono-theme-motion
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-007 Phase 1 - Motion System Foundation
 * Purpose: Sophisticated motion system for mono-theme implementation
 * Safety: Sandbox-isolated motion system with accessibility support
 * Status: Phase 1 implementation - Motion system foundation
 */

import React from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';

/* ========================================
   HT-007 Mono-Theme Motion Tokens
   Sophisticated motion tokens for mono-theme implementation
======================================== */

export const monoThemeMotionTokens = {
  // Duration tokens
  duration: {
    instant: 0.075,
    fast: 0.15,
    normal: 0.2,
    slow: 0.3,
    slower: 0.5,
    slowest: 0.8,
  },
  
  // Easing curves
  easing: {
    linear: [0, 0, 1, 1],
    easeIn: [0.4, 0, 1, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    spring: [0.2, 0.8, 0.2, 1],
    bounce: [0.68, -0.6, 0.32, 1.6],
    smooth: [0.4, 0, 0.2, 1],
    elastic: [0.175, 0.885, 0.32, 1.275],
  },
  
  // Delay tokens
  delay: {
    none: 0,
    short: 0.05,
    medium: 0.1,
    long: 0.2,
    longer: 0.3,
  },
  
  // Stagger tokens
  stagger: {
    none: 0,
    short: 0.05,
    medium: 0.1,
    long: 0.15,
    longer: 0.2,
  },
} as const;

/* ========================================
   HT-007 Mono-Theme Motion Variants
   Sophisticated motion variants for mono-theme implementation
======================================== */

// HT-007: Page transition variants
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
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
};

// HT-007: Card hover variants
export const cardHoverVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  },
  hover: {
    y: -4,
    scale: 1.02,
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    transition: {
      duration: monoThemeMotionTokens.duration.normal,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  tap: {
    y: -2,
    scale: 0.98,
    transition: {
      duration: monoThemeMotionTokens.duration.instant,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
};

// HT-007: Button interaction variants
export const buttonVariants: Variants = {
  initial: {
    y: 0,
    scale: 1,
  },
  hover: {
    y: -1,
    scale: 1.01,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  tap: {
    y: 0,
    scale: 0.99,
    transition: {
      duration: monoThemeMotionTokens.duration.instant,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
};

// HT-007: Input focus variants
export const inputFocusVariants: Variants = {
  initial: {
    scale: 1,
    boxShadow: '0 0 0 0 rgba(0, 0, 0, 0)',
  },
  focus: {
    scale: 1.01,
    boxShadow: '0 0 0 3px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: monoThemeMotionTokens.duration.normal,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
};

// HT-007: Modal variants
export const modalVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: monoThemeMotionTokens.duration.normal,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeIn,
    },
  },
};

// HT-007: Backdrop variants
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: monoThemeMotionTokens.duration.normal,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeIn,
    },
  },
};

// HT-007: List item variants
export const listItemVariants: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: monoThemeMotionTokens.duration.normal,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeIn,
    },
  },
};

// HT-007: Stagger container variants
export const staggerContainerVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      staggerChildren: monoThemeMotionTokens.stagger.medium,
      delayChildren: monoThemeMotionTokens.delay.short,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: monoThemeMotionTokens.stagger.short,
      staggerDirection: -1,
    },
  },
};

// HT-007: Icon variants
export const iconVariants: Variants = {
  initial: {
    scale: 1,
    rotate: 0,
  },
  hover: {
    scale: 1.1,
    rotate: 5,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  tap: {
    scale: 0.9,
    rotate: -5,
    transition: {
      duration: monoThemeMotionTokens.duration.instant,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
};

// HT-007: Loading spinner variants
export const spinnerVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      ease: monoThemeMotionTokens.easing.linear,
      repeat: Infinity,
    },
  },
};

// HT-007: Progress bar variants
export const progressVariants: Variants = {
  initial: {
    scaleX: 0,
  },
  animate: {
    scaleX: 1,
    transition: {
      duration: monoThemeMotionTokens.duration.slower,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
};

// HT-007: Tooltip variants
export const tooltipVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: monoThemeMotionTokens.duration.fast,
      ease: monoThemeMotionTokens.easing.easeOut,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 10,
    transition: {
      duration: monoThemeMotionTokens.duration.instant,
      ease: monoThemeMotionTokens.easing.easeIn,
    },
  },
};

/* ========================================
   HT-007 Mono-Theme Motion Components
   Sophisticated motion components for mono-theme implementation
======================================== */

// HT-007: Mono-Theme Motion Page Component
export const MonoMotionPage = motion.div;

// HT-007: Mono-Theme Motion Card Component
export const MonoMotionCard = motion.div;

// HT-007: Mono-Theme Motion Button Component
export const MonoMotionButton = motion.button;

// HT-007: Mono-Theme Motion Input Component
export const MonoMotionInput = motion.input;

// HT-007: Mono-Theme Motion Surface Component
export const MonoMotionSurface = motion.div;

// HT-007: Mono-Theme Motion Badge Component
export const MonoMotionBadge = motion.span;

// HT-007: Mono-Theme Motion Icon Component
export const MonoMotionIcon = motion.div;

// HT-007: Mono-Theme Motion List Item Component
export const MonoMotionListItem = motion.li;

// HT-007: Mono-Theme Motion Modal Component
export const MonoMotionModal = motion.div;

// HT-007: Mono-Theme Motion Backdrop Component
export const MonoMotionBackdrop = motion.div;

// HT-007: Mono-Theme Motion Tooltip Component
export const MonoMotionTooltip = motion.div;

// HT-007: Mono-Theme Motion Progress Component
export const MonoMotionProgress = motion.div;

// HT-007: Mono-Theme Motion Spinner Component
export const MonoMotionSpinner = motion.div;

/* ========================================
   HT-007 Mono-Theme Motion Utilities
   Sophisticated motion utilities for mono-theme implementation
======================================== */

// HT-007: Create motion props with mono-theme tokens
export const createMonoMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  custom,
});

// HT-007: Create hover motion props
export const createHoverMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  initial: 'initial',
  whileHover: 'hover',
  whileTap: 'tap',
  custom,
});

// HT-007: Create focus motion props
export const createFocusMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  initial: 'initial',
  whileFocus: 'focus',
  custom,
});

// HT-007: Create stagger motion props
export const createStaggerMotionProps = (
  containerVariant: Variants,
  itemVariant: Variants,
  custom?: any
) => ({
  variants: containerVariant,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  custom,
  children: {
    variants: itemVariant,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
});

// HT-007: Create loading motion props
export const createLoadingMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  animate: 'animate',
  custom,
});

// HT-007: Create progress motion props
export const createProgressMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  initial: 'initial',
  animate: 'animate',
  custom,
});

// HT-007: Create tooltip motion props
export const createTooltipMotionProps = (
  variant: Variants,
  custom?: any
) => ({
  variants: variant,
  initial: 'initial',
  animate: 'animate',
  exit: 'exit',
  custom,
});

/* ========================================
   HT-007 Mono-Theme Motion Hooks
   Sophisticated motion hooks for mono-theme implementation
======================================== */

// HT-007: Use mono-theme motion preferences
export const useMonoMotionPreferences = () => {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
    
  return {
    prefersReducedMotion,
    shouldAnimate: !prefersReducedMotion,
    motionTokens: monoThemeMotionTokens,
  };
};

// HT-007: Use mono-theme motion variants
export const useMonoMotionVariants = () => {
  return {
    page: pageVariants,
    card: cardHoverVariants,
    button: buttonVariants,
    input: inputFocusVariants,
    modal: modalVariants,
    backdrop: backdropVariants,
    listItem: listItemVariants,
    staggerContainer: staggerContainerVariants,
    icon: iconVariants,
    spinner: spinnerVariants,
    progress: progressVariants,
    tooltip: tooltipVariants,
  };
};

// HT-007: Use mono-theme motion components
export const useMonoMotionComponents = () => {
  return {
    Page: MonoMotionPage,
    Card: MonoMotionCard,
    Button: MonoMotionButton,
    Input: MonoMotionInput,
    Surface: MonoMotionSurface,
    Badge: MonoMotionBadge,
    Icon: MonoMotionIcon,
    ListItem: MonoMotionListItem,
    Modal: MonoMotionModal,
    Backdrop: MonoMotionBackdrop,
    Tooltip: MonoMotionTooltip,
    Progress: MonoMotionProgress,
    Spinner: MonoMotionSpinner,
  };
};

/* ========================================
   HT-007 Mono-Theme Motion Presets
   Sophisticated motion presets for mono-theme implementation
======================================== */

// HT-007: Mono-theme motion presets
export const monoMotionPresets = {
  // Page transitions
  pageTransition: {
    variants: pageVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  
  // Card interactions
  cardInteraction: {
    variants: cardHoverVariants,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
  },
  
  // Button interactions
  buttonInteraction: {
    variants: buttonVariants,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
  },
  
  // Input focus
  inputFocus: {
    variants: inputFocusVariants,
    initial: 'initial',
    whileFocus: 'focus',
  },
  
  // Modal presentation
  modalPresentation: {
    variants: modalVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  
  // Backdrop presentation
  backdropPresentation: {
    variants: backdropVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  
  // List item presentation
  listItemPresentation: {
    variants: listItemVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  
  // Stagger container
  staggerContainer: {
    variants: staggerContainerVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
  
  // Icon interactions
  iconInteraction: {
    variants: iconVariants,
    initial: 'initial',
    whileHover: 'hover',
    whileTap: 'tap',
  },
  
  // Loading spinner
  loadingSpinner: {
    variants: spinnerVariants,
    animate: 'animate',
  },
  
  // Progress bar
  progressBar: {
    variants: progressVariants,
    initial: 'initial',
    animate: 'animate',
  },
  
  // Tooltip presentation
  tooltipPresentation: {
    variants: tooltipVariants,
    initial: 'initial',
    animate: 'animate',
    exit: 'exit',
  },
} as const;

/* ========================================
   HT-007 Advanced Motion Utilities
   Sophisticated motion utilities for mono-theme implementation
======================================== */

// HT-007: Advanced motion configuration utilities
export const createAdvancedMotionConfig = (options: {
  duration?: keyof typeof monoThemeMotionTokens.duration;
  easing?: keyof typeof monoThemeMotionTokens.easing;
  delay?: keyof typeof monoThemeMotionTokens.delay;
  stagger?: keyof typeof monoThemeMotionTokens.stagger;
  reducedMotion?: boolean;
}) => {
  const { duration = 'normal', easing = 'easeOut', delay = 'none', stagger = 'none', reducedMotion = false } = options;
  
  return {
    duration: monoThemeMotionTokens.duration[duration],
    ease: monoThemeMotionTokens.easing[easing],
    delay: monoThemeMotionTokens.delay[delay],
    staggerChildren: monoThemeMotionTokens.stagger[stagger],
    ...(reducedMotion && { duration: 0, delay: 0, staggerChildren: 0 }),
  };
};

// HT-007: Motion performance optimization utilities
export const optimizeMotionPerformance = (variants: Variants) => {
  return Object.keys(variants).reduce((optimized, key) => {
    const variant = variants[key];
    if (typeof variant === 'object' && variant !== null) {
      optimized[key] = {
        ...variant,
        transition: {
          ...variant.transition,
          // Optimize for performance
          type: 'tween',
          ease: 'easeOut',
        },
      };
    }
    return optimized;
  }, {} as Variants);
};

// HT-007: Motion accessibility utilities
export const createAccessibleMotion = (variants: Variants, prefersReducedMotion: boolean) => {
  if (prefersReducedMotion) {
    return Object.keys(variants).reduce((accessible, key) => {
      const variant = variants[key];
      if (typeof variant === 'object' && variant !== null) {
        accessible[key] = {
          ...variant,
          transition: {
            duration: 0,
            delay: 0,
          },
        };
      }
      return accessible;
    }, {} as Variants);
  }
  return variants;
};

// HT-007: Motion debugging utilities
export const createMotionDebugger = (enabled: boolean = false) => {
  if (!enabled) return () => {};
  
  return (componentName: string, variant: string, props: any) => {
    console.log(`[Motion Debug] ${componentName}:`, {
      variant,
      props: JSON.stringify(props, null, 2),
      timestamp: new Date().toISOString(),
    });
  };
};

// HT-007: Motion state management utilities
export const createMotionState = () => {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [animationQueue, setAnimationQueue] = React.useState<string[]>([]);
  
  const startAnimation = (animationId: string) => {
    setAnimationQueue(prev => [...prev, animationId]);
    setIsAnimating(true);
  };
  
  const endAnimation = (animationId: string) => {
    setAnimationQueue(prev => prev.filter(id => id !== animationId));
    if (animationQueue.length === 1) {
      setIsAnimating(false);
    }
  };
  
  return {
    isAnimating,
    animationQueue,
    startAnimation,
    endAnimation,
  };
};

// HT-007: Motion intersection observer utilities
export const createMotionIntersection = (threshold: number = 0.1) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold }
    );
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold]);
  
  return { ref, isVisible };
};

// HT-007: Motion gesture utilities
export const createMotionGestures = () => {
  const [gestureState, setGestureState] = React.useState({
    isDragging: false,
    isHovering: false,
    isTapping: false,
    dragDirection: null as 'x' | 'y' | null,
  });
  
  const gestureHandlers = {
    onDragStart: () => setGestureState(prev => ({ ...prev, isDragging: true })),
    onDragEnd: () => setGestureState(prev => ({ ...prev, isDragging: false, dragDirection: null })),
    onDrag: (event: any, info: any) => {
      const { offset } = info;
      const direction = Math.abs(offset.x) > Math.abs(offset.y) ? 'x' : 'y';
      setGestureState(prev => ({ ...prev, dragDirection: direction }));
    },
    onHoverStart: () => setGestureState(prev => ({ ...prev, isHovering: true })),
    onHoverEnd: () => setGestureState(prev => ({ ...prev, isHovering: false })),
    onTapStart: () => setGestureState(prev => ({ ...prev, isTapping: true })),
    onTapEnd: () => setGestureState(prev => ({ ...prev, isTapping: false })),
  };
  
  return { gestureState, gestureHandlers };
};

// HT-007: Motion layout utilities
export const createMotionLayout = () => {
  const [layoutId, setLayoutId] = React.useState<string | null>(null);
  const [layoutAnimation, setLayoutAnimation] = React.useState(false);
  
  const enableLayoutAnimation = (id: string) => {
    setLayoutId(id);
    setLayoutAnimation(true);
  };
  
  const disableLayoutAnimation = () => {
    setLayoutAnimation(false);
    setLayoutId(null);
  };
  
  return {
    layoutId,
    layoutAnimation,
    enableLayoutAnimation,
    disableLayoutAnimation,
  };
};

// HT-007: Motion spring utilities
export const createSpringConfig = (type: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses') => {
  const springConfigs = {
    gentle: { type: 'spring' as const, stiffness: 120, damping: 14 },
    wobbly: { type: 'spring' as const, stiffness: 180, damping: 12 },
    stiff: { type: 'spring' as const, stiffness: 210, damping: 20 },
    slow: { type: 'spring' as const, stiffness: 60, damping: 15 },
    molasses: { type: 'spring' as const, stiffness: 280, damping: 60 },
  };
  
  return springConfigs[type];
};

// HT-007: Motion path utilities
export const createMotionPath = (path: string, options: {
  duration?: number;
  ease?: string;
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
}) => {
  const { duration = 2, ease = 'easeInOut', repeat = 0, repeatType = 'loop' } = options;
  
  return {
    path,
    transition: {
      duration,
      ease,
      repeat,
      repeatType,
    },
  };
};

// HT-007: Motion orchestration utilities
export const createMotionOrchestrator = () => {
  const [orchestration, setOrchestration] = React.useState({
    sequence: [] as string[],
    currentStep: 0,
    isPlaying: false,
    isPaused: false,
  });
  
  const playSequence = (sequence: string[]) => {
    setOrchestration({
      sequence,
      currentStep: 0,
      isPlaying: true,
      isPaused: false,
    });
  };
  
  const pauseSequence = () => {
    setOrchestration(prev => ({ ...prev, isPaused: true }));
  };
  
  const resumeSequence = () => {
    setOrchestration(prev => ({ ...prev, isPaused: false }));
  };
  
  const stopSequence = () => {
    setOrchestration({
      sequence: [],
      currentStep: 0,
      isPlaying: false,
      isPaused: false,
    });
  };
  
  const nextStep = () => {
    setOrchestration(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.sequence.length - 1),
    }));
  };
  
  const previousStep = () => {
    setOrchestration(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  };
  
  return {
    orchestration,
    playSequence,
    pauseSequence,
    resumeSequence,
    stopSequence,
    nextStep,
    previousStep,
  };
};

/* ========================================
   HT-007 Enhanced Motion Components
   Advanced motion components with sophisticated features
======================================== */

// HT-007: Enhanced Motion Page with advanced features
export const EnhancedMotionPage = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof motion.div> & {
    enableLayoutAnimation?: boolean;
    enableGestureHandling?: boolean;
    enableIntersectionObserver?: boolean;
    debugMode?: boolean;
  }
>(({ 
  enableLayoutAnimation = false, 
  enableGestureHandling = false, 
  enableIntersectionObserver = false,
  debugMode = false,
  ...props 
}, ref) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const motionDebugger = createMotionDebugger(debugMode);
  const { ref: intersectionRef, isVisible } = createMotionIntersection();
  const { gestureState, gestureHandlers } = createMotionGestures();
  
  const motionProps = React.useMemo(() => {
    const variants = createAccessibleMotion(pageVariants, prefersReducedMotion);
    const config = createAdvancedMotionConfig({
      duration: 'normal',
      easing: 'easeOut',
      reducedMotion: prefersReducedMotion,
    });
    
    return {
      variants,
      initial: 'initial',
      animate: isVisible ? 'animate' : 'initial',
      exit: 'exit',
      transition: config,
      layout: enableLayoutAnimation,
      ...(enableGestureHandling && gestureHandlers),
      ...(debugMode && { onAnimationStart: () => motionDebugger('EnhancedMotionPage', 'animate', props) }),
    };
  }, [prefersReducedMotion, isVisible, enableLayoutAnimation, enableGestureHandling, debugMode, props]);
  
  return (
    <motion.div
      ref={ref || intersectionRef}
      {...motionProps}
      {...props}
    />
  );
});

EnhancedMotionPage.displayName = 'EnhancedMotionPage';

// HT-007: Enhanced Motion Card with advanced interactions
export const EnhancedMotionCard = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof motion.div> & {
    enableHoverEffects?: boolean;
    enableTapEffects?: boolean;
    enableDragEffects?: boolean;
    springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
  }
>(({ 
  enableHoverEffects = true, 
  enableTapEffects = true, 
  enableDragEffects = false,
  springType = 'gentle',
  ...props 
}, ref) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const springConfig = createSpringConfig(springType);
  
  const motionProps = React.useMemo(() => {
    const variants = createAccessibleMotion(cardHoverVariants, prefersReducedMotion);
    
    return {
      variants,
      initial: 'initial',
      whileHover: enableHoverEffects ? 'hover' : undefined,
      whileTap: enableTapEffects ? 'tap' : undefined,
      drag: enableDragEffects,
      dragConstraints: enableDragEffects ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined,
      transition: springConfig,
    };
  }, [prefersReducedMotion, enableHoverEffects, enableTapEffects, enableDragEffects, springConfig]);
  
  return (
    <motion.div
      ref={ref}
      {...motionProps}
      {...props}
    />
  );
});

EnhancedMotionCard.displayName = 'EnhancedMotionCard';

// HT-007: Enhanced Motion Button with sophisticated interactions
export const EnhancedMotionButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof motion.button> & {
    enableRippleEffect?: boolean;
    enableHoverGlow?: boolean;
    enablePressFeedback?: boolean;
    springType?: 'gentle' | 'wobbly' | 'stiff' | 'slow' | 'molasses';
  }
>(({ 
  enableRippleEffect = true, 
  enableHoverGlow = true, 
  enablePressFeedback = true,
  springType = 'gentle',
  ...props 
}, ref) => {
  const { prefersReducedMotion } = useMonoMotionPreferences();
  const springConfig = createSpringConfig(springType);
  
  const motionProps = React.useMemo(() => {
    const variants = createAccessibleMotion(buttonVariants, prefersReducedMotion);
    
    return {
      variants,
      initial: 'initial',
      whileHover: enableHoverGlow ? 'hover' : undefined,
      whileTap: enablePressFeedback ? 'tap' : undefined,
      transition: springConfig,
    };
  }, [prefersReducedMotion, enableHoverGlow, enablePressFeedback, springConfig]);
  
  return (
    <motion.button
      ref={ref}
      {...motionProps}
      {...props}
    />
  );
});

EnhancedMotionButton.displayName = 'EnhancedMotionButton';

/* ========================================
   HT-007 Mono-Theme Motion Exports
   Sophisticated motion exports for mono-theme implementation
======================================== */

export {
  motion,
  AnimatePresence,
  type Variants,
};

export default {
  tokens: monoThemeMotionTokens,
  variants: {
    page: pageVariants,
    card: cardHoverVariants,
    button: buttonVariants,
    input: inputFocusVariants,
    modal: modalVariants,
    backdrop: backdropVariants,
    listItem: listItemVariants,
    staggerContainer: staggerContainerVariants,
    icon: iconVariants,
    spinner: spinnerVariants,
    progress: progressVariants,
    tooltip: tooltipVariants,
  },
  components: {
    Page: MonoMotionPage,
    Card: MonoMotionCard,
    Button: MonoMotionButton,
    Input: MonoMotionInput,
    Surface: MonoMotionSurface,
    Badge: MonoMotionBadge,
    Icon: MonoMotionIcon,
    ListItem: MonoMotionListItem,
    Modal: MonoMotionModal,
    Backdrop: MonoMotionBackdrop,
    Tooltip: MonoMotionTooltip,
    Progress: MonoMotionProgress,
    Spinner: MonoMotionSpinner,
    // Enhanced components
    EnhancedPage: EnhancedMotionPage,
    EnhancedCard: EnhancedMotionCard,
    EnhancedButton: EnhancedMotionButton,
  },
  presets: monoMotionPresets,
  utilities: {
    createMonoMotionProps,
    createHoverMotionProps,
    createFocusMotionProps,
    createStaggerMotionProps,
    createLoadingMotionProps,
    createProgressMotionProps,
    createTooltipMotionProps,
    // Advanced utilities
    createAdvancedMotionConfig,
    optimizeMotionPerformance,
    createAccessibleMotion,
    createMotionDebugger,
    createMotionState,
    createMotionIntersection,
    createMotionGestures,
    createMotionLayout,
    createSpringConfig,
    createMotionPath,
    createMotionOrchestrator,
  },
  hooks: {
    useMonoMotionPreferences,
    useMonoMotionVariants,
    useMonoMotionComponents,
  },
};
