/**
 * Design Tokens Module
 * 
 * Provides a comprehensive design token system with React context,
 * CSS custom properties, and Tailwind CSS integration.
 * 
 * Universal Header: @lib/design-tokens/index
 */

export { designTokens } from './tokens';
export type { 
  DesignTokens, 
  ColorScale, 
  SemanticColors, 
  ComponentTokens 
} from './tokens';

export { 
  TokensProvider, 
  useTokens, 
  useSemanticColors, 
  useDesignTokens 
} from './provider';

export { 
  default as motion,
  motionTokens,
  transitions,
  keyframes,
  animations,
  motionPresets,
  getMotionPreference,
  shouldReduceMotion,
  getTransition,
  createMotionCSS
} from './motion';
export type { MotionPreference, MotionConfig } from './motion';