/**
 * Component System Types
 * HT-021.3.2 - Core Component Infrastructure Setup
 * 
 * Comprehensive TypeScript type system for atomic design components
 * with accessibility, performance, and theming support
 */

import { ComponentProps, ReactNode, ElementType, HTMLAttributes } from 'react';

// ============================================================================
// FOUNDATIONAL TYPES
// ============================================================================

/**
 * Design token reference type for CSS custom properties
 */
export type TokenReference = `var(--${string})` | string;

/**
 * Component size scale following design system
 */
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Semantic color variants for components
 */
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'neutral';

/**
 * Visual emphasis levels
 */
export type Emphasis = 'low' | 'medium' | 'high';

/**
 * Layout spacing system
 */
export type Spacing = ComponentSize | 'none' | 'auto';

/**
 * Border radius variants
 */
export type BorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';

/**
 * Animation duration options
 */
export type AnimationDuration = 'instant' | 'fast' | 'normal' | 'slow' | 'slower';

// ============================================================================
// ACCESSIBILITY TYPES
// ============================================================================

/**
 * ARIA live region politeness levels
 */
export type AriaLive = 'off' | 'polite' | 'assertive';

/**
 * Keyboard navigation support
 */
export interface KeyboardNavigationProps {
  /** Enable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Custom key handlers */
  onKeyDown?: (event: React.KeyboardEvent) => void;
  /** Focus management */
  autoFocus?: boolean;
  /** Tab index override */
  tabIndex?: number;
}

/**
 * Screen reader support
 */
export interface ScreenReaderProps {
  /** Accessible name */
  'aria-label'?: string;
  /** Accessible description */
  'aria-describedby'?: string;
  /** Accessible labelled by */
  'aria-labelledby'?: string;
  /** Hidden from screen readers */
  'aria-hidden'?: boolean;
  /** Live region announcements */
  'aria-live'?: AriaLive;
}

/**
 * Complete accessibility props interface
 */
export interface AccessibilityProps extends ScreenReaderProps, KeyboardNavigationProps {
  /** Role override */
  role?: string;
  /** Expanded state for collapsible elements */
  'aria-expanded'?: boolean;
  /** Pressed state for toggleable elements */
  'aria-pressed'?: boolean;
  /** Disabled state */
  'aria-disabled'?: boolean;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

/**
 * Performance monitoring configuration
 */
export interface PerformanceConfig {
  /** Enable performance monitoring */
  monitor?: boolean;
  /** Performance budget in milliseconds */
  budget?: number;
  /** Track render time */
  trackRenderTime?: boolean;
  /** Track interaction latency */
  trackInteractionLatency?: boolean;
}

/**
 * Lazy loading configuration
 */
export interface LazyLoadingProps {
  /** Enable lazy loading */
  lazy?: boolean;
  /** Loading placeholder */
  loadingPlaceholder?: ReactNode;
  /** Intersection observer options */
  intersectionOptions?: IntersectionObserverInit;
}

// ============================================================================
// THEMING TYPES
// ============================================================================

/**
 * Theme variant (light/dark mode)
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Brand variant for multi-brand support
 */
export type BrandVariant = 'default' | 'salon' | string;

/**
 * Theme integration props
 */
export interface ThemeProps {
  /** Theme mode override */
  theme?: ThemeMode;
  /** Brand variant */
  brand?: BrandVariant;
  /** Custom CSS variables */
  customTokens?: Record<string, TokenReference>;
}

// ============================================================================
// BASE COMPONENT TYPES
// ============================================================================

/**
 * Base props shared by all design system components
 */
export interface BaseComponentProps extends AccessibilityProps, ThemeProps {
  /** Component identifier */
  id?: string;
  /** CSS class names */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Children elements */
  children?: ReactNode;
  /** Test identifier */
  'data-testid'?: string;
  /** Performance configuration */
  performance?: PerformanceConfig;
}

/**
 * Interactive component props (buttons, links, etc.)
 */
export interface InteractiveProps extends BaseComponentProps {
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Click handler */
  onClick?: (event: React.MouseEvent) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent) => void;
  /** Hover handlers */
  onMouseEnter?: (event: React.MouseEvent) => void;
  onMouseLeave?: (event: React.MouseEvent) => void;
}

/**
 * Input component props
 */
export interface InputProps extends InteractiveProps {
  /** Input value */
  value?: string | number;
  /** Default value */
  defaultValue?: string | number;
  /** Placeholder text */
  placeholder?: string;
  /** Required field */
  required?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Validation error */
  error?: string | boolean;
  /** Success state */
  success?: boolean;
  /** Change handler */
  onChange?: (value: string | number, event?: React.ChangeEvent) => void;
}

// ============================================================================
// POLYMORPHIC COMPONENT TYPES
// ============================================================================

/**
 * Props for polymorphic components that can render as different elements
 */
export type PolymorphicProps<T extends ElementType> = {
  as?: T;
} & ComponentProps<T>;

/**
 * Polymorphic component with forwarded ref
 */
export type PolymorphicComponentPropsWithRef<
  T extends ElementType,
  Props = {}
> = PolymorphicProps<T> & Props & { ref?: React.Ref<any> };

// ============================================================================
// COMPONENT VARIANT TYPES
// ============================================================================

/**
 * Button variants following atomic design
 */
export interface ButtonVariants {
  /** Visual style variant */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'cta' | 'cta-secondary';
  /** Size variant */
  size?: ComponentSize;
  /** Color scheme */
  colorScheme?: ColorVariant;
  /** Full width */
  fullWidth?: boolean;
  /** Icon position */
  iconPosition?: 'left' | 'right';
  /** Icon element */
  icon?: ReactNode;
}

/**
 * Card component variants
 */
export interface CardVariants {
  /** Visual elevation */
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  /** Padding size */
  padding?: Spacing;
  /** Border radius */
  borderRadius?: BorderRadius;
  /** Hover effects */
  hoverable?: boolean;
  /** Interactive card */
  interactive?: boolean;
}

/**
 * Typography variants
 */
export interface TypographyVariants {
  /** Typography scale */
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption' | 'overline';
  /** Font weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
  /** Text color */
  color?: ColorVariant | 'inherit';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Truncation */
  truncate?: boolean;
  /** Line clamping */
  lineClamp?: number;
}

// ============================================================================
// COMPOSITE COMPONENT TYPES
// ============================================================================

/**
 * Form component props
 */
export interface FormComponentProps extends BaseComponentProps {
  /** Form field name */
  name?: string;
  /** Validation schema */
  validation?: any; // Will be replaced with specific schema type
  /** Form state */
  formState?: 'idle' | 'validating' | 'submitting' | 'error' | 'success';
}

/**
 * Data display component props
 */
export interface DataDisplayProps<T = any> extends BaseComponentProps {
  /** Data source */
  data?: T[];
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: Error | string | null;
  /** Empty state renderer */
  emptyState?: ReactNode;
  /** Error state renderer */
  errorState?: (error: Error | string) => ReactNode;
}

/**
 * Navigation component props
 */
export interface NavigationProps extends BaseComponentProps {
  /** Current active item */
  activeItem?: string;
  /** Navigation orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Navigation items */
  items?: Array<{
    id: string;
    label: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
  }>;
}

// ============================================================================
// ANIMATION & MOTION TYPES
// ============================================================================

/**
 * Animation configuration
 */
export interface AnimationProps {
  /** Animation duration */
  duration?: AnimationDuration;
  /** Animation delay */
  delay?: number;
  /** Animation easing */
  easing?: 'linear' | 'easeIn' | 'easeOut' | 'easeInOut' | 'bounce';
  /** Disable animations */
  disableAnimation?: boolean;
}

/**
 * Transition props for enter/exit animations
 */
export interface TransitionProps extends AnimationProps {
  /** Element is visible */
  show?: boolean;
  /** Enter animation */
  enter?: string;
  /** Exit animation */
  exit?: string;
  /** Animation completed callback */
  onAnimationComplete?: () => void;
}

// ============================================================================
// LAYOUT TYPES
// ============================================================================

/**
 * Responsive breakpoint system
 */
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Responsive value type
 */
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

/**
 * Layout component props
 */
export interface LayoutProps extends BaseComponentProps {
  /** Responsive padding */
  padding?: ResponsiveValue<Spacing>;
  /** Responsive margin */
  margin?: ResponsiveValue<Spacing>;
  /** Maximum width */
  maxWidth?: ResponsiveValue<string | number>;
  /** Display type */
  display?: ResponsiveValue<'block' | 'inline' | 'flex' | 'grid' | 'none'>;
  /** Flex properties */
  flex?: ResponsiveValue<string | number>;
  /** Grid properties */
  grid?: ResponsiveValue<string>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Extract component props from React component
 */
export type ExtractProps<T> = T extends React.ComponentType<infer P> ? P : never;

/**
 * Make specified props optional
 */
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Make specified props required
 */
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

/**
 * Override specific props with new types
 */
export type Override<T, R> = Omit<T, keyof R> & R;

/**
 * Component factory type for creating variants
 */
export type ComponentFactory<T extends BaseComponentProps> = {
  (props: T): React.ReactElement;
  displayName?: string;
};

// ============================================================================
// RE-EXPORTS (types are already exported inline above)
// ============================================================================

// All types are already exported above as interfaces and type aliases