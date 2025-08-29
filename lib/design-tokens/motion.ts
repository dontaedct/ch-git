/**
 * Motion Utilities
 * 
 * Provides motion utility functions and CSS-in-JS helpers for implementing
 * consistent micro-interactions throughout the design system.
 * Respects prefers-reduced-motion accessibility preferences.
 * 
 * Universal Header: @lib/design-tokens/motion
 */

import { designTokens } from './tokens';

export type MotionPreference = 'no-preference' | 'reduce';

export interface MotionConfig {
  respectReducedMotion: boolean;
}

const defaultConfig: MotionConfig = {
  respectReducedMotion: true,
};

export function getMotionPreference(): MotionPreference {
  if (typeof window === 'undefined') return 'no-preference';
  
  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  return mediaQuery.matches ? 'reduce' : 'no-preference';
}

export function shouldReduceMotion(config: MotionConfig = defaultConfig): boolean {
  if (!config.respectReducedMotion) return false;
  return getMotionPreference() === 'reduce';
}

export function getTransition(
  transition: string,
  config: MotionConfig = defaultConfig
): string {
  if (shouldReduceMotion(config)) {
    return 'none';
  }
  return transition;
}

export function createMotionCSS(config: MotionConfig = defaultConfig) {
  if (shouldReduceMotion(config)) {
    return {
      transition: 'none !important',
      animationDuration: '0.01ms !important',
      animationIterationCount: '1 !important',
      scrollBehavior: 'auto !important',
    };
  }
  
  return {};
}

export const motionTokens = designTokens.motion;

export const transitions = {
  button: {
    hover: (config?: MotionConfig) => getTransition(motionTokens.transitions.button.hover, config),
    press: (config?: MotionConfig) => getTransition(motionTokens.transitions.button.press, config),
    focus: (config?: MotionConfig) => getTransition(motionTokens.transitions.button.focus, config),
  },
  chip: {
    select: (config?: MotionConfig) => getTransition(motionTokens.transitions.chip.select, config),
    deselect: (config?: MotionConfig) => getTransition(motionTokens.transitions.chip.deselect, config),
    hover: (config?: MotionConfig) => getTransition(motionTokens.transitions.chip.hover, config),
  },
  tab: {
    switch: (config?: MotionConfig) => getTransition(motionTokens.transitions.tab.switch, config),
    hover: (config?: MotionConfig) => getTransition(motionTokens.transitions.tab.hover, config),
  },
  step: {
    advance: (config?: MotionConfig) => getTransition(motionTokens.transitions.step.advance, config),
    retreat: (config?: MotionConfig) => getTransition(motionTokens.transitions.step.retreat, config),
    complete: (config?: MotionConfig) => getTransition(motionTokens.transitions.step.complete, config),
  },
  toast: {
    enter: (config?: MotionConfig) => getTransition(motionTokens.transitions.toast.enter, config),
    exit: (config?: MotionConfig) => getTransition(motionTokens.transitions.toast.exit, config),
  },
  modal: {
    enter: (config?: MotionConfig) => getTransition(motionTokens.transitions.modal.enter, config),
    exit: (config?: MotionConfig) => getTransition(motionTokens.transitions.modal.exit, config),
    backdrop: (config?: MotionConfig) => getTransition(motionTokens.transitions.modal.backdrop, config),
  },
};

export const keyframes = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },
  slideInFromTop: {
    from: { transform: 'translateY(-16px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInFromBottom: {
    from: { transform: 'translateY(16px)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInFromLeft: {
    from: { transform: 'translateX(-16px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInFromRight: {
    from: { transform: 'translateX(16px)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },
  pulse: {
    '0%, 100%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.05)' },
  },
  bounce: {
    '0%, 100%': { transform: 'translateY(0)' },
    '50%': { transform: 'translateY(-4px)' },
  },
  wiggle: {
    '0%, 100%': { transform: 'rotate(0deg)' },
    '25%': { transform: 'rotate(-3deg)' },
    '75%': { transform: 'rotate(3deg)' },
  },
};

export const animations = {
  fadeIn: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `fadeIn ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  fadeOut: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `fadeOut ${motionTokens.duration.fast} ${motionTokens.easing.spring}`,
  slideInFromTop: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `slideInFromTop ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  slideInFromBottom: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `slideInFromBottom ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  slideInFromLeft: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `slideInFromLeft ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  slideInFromRight: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `slideInFromRight ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  scaleIn: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `scaleIn ${motionTokens.duration.normal} ${motionTokens.easing.spring}`,
  scaleOut: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `scaleOut ${motionTokens.duration.fast} ${motionTokens.easing.spring}`,
  pulse: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `pulse ${motionTokens.duration.slower} ${motionTokens.easing['ease-in-out']} infinite`,
  bounce: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `bounce ${motionTokens.duration.slower} ${motionTokens.easing.bounce} infinite`,
  wiggle: (config?: MotionConfig) => 
    shouldReduceMotion(config) ? 'none' : `wiggle ${motionTokens.duration.slower} ${motionTokens.easing['ease-in-out']} infinite`,
};

export const motionPresets = {
  button: {
    idle: {
      transform: 'translateY(0px)',
      boxShadow: designTokens.elevation.sm,
    },
    hover: {
      transform: 'translateY(-1px)',
      boxShadow: designTokens.elevation.md,
      transition: transitions.button.hover(),
    },
    active: {
      transform: 'translateY(0px)',
      boxShadow: designTokens.elevation.sm,
      transition: transitions.button.press(),
    },
    focus: {
      boxShadow: `${designTokens.elevation.sm}, 0 0 0 2px ${designTokens.colors.light.ring}`,
      transition: transitions.button.focus(),
    },
  },
  chip: {
    idle: {
      transform: 'scale(1)',
      backgroundColor: 'transparent',
    },
    hover: {
      transform: 'scale(1.02)',
      backgroundColor: designTokens.colors.light.muted,
      transition: transitions.chip.hover(),
    },
    selected: {
      transform: 'scale(1)',
      backgroundColor: designTokens.colors.light.accent,
      transition: transitions.chip.select(),
    },
  },
  step: {
    pending: {
      backgroundColor: designTokens.colors.light.muted,
      color: designTokens.colors.light.mutedForeground,
      transform: 'scale(1)',
    },
    active: {
      backgroundColor: designTokens.colors.light.primary,
      color: designTokens.colors.light.primaryForeground,
      transform: 'scale(1.1)',
      transition: transitions.step.advance(),
    },
    completed: {
      backgroundColor: designTokens.colors.light.success,
      color: designTokens.colors.light.successForeground,
      transform: 'scale(1)',
      transition: transitions.step.complete(),
    },
  },
};

const motionSystem = {
  tokens: motionTokens,
  transitions,
  keyframes,
  animations,
  presets: motionPresets,
  utils: {
    getMotionPreference,
    shouldReduceMotion,
    getTransition,
    createMotionCSS,
  },
};

export default motionSystem;