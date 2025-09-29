/**
 * @fileoverview Component Contracts - TypeScript definitions for manifest components
 * @module types/componentContracts
 * @version 1.0.0
 *
 * Component contract definitions derived from existing form builders and homepage analysis.
 * These contracts define the props interface for each canonical component type.
 *
 * Design Principles:
 * - Type-safe prop definitions with runtime validation
 * - Backward compatibility through versioning
 * - Clear separation between required and optional props
 * - Support for conditional logic and theming overrides
 */

// =============================================================================
// CORE TYPES & UTILITIES
// =============================================================================

/**
 * Base component interface that all components must implement
 */
export interface BaseComponent {
  id: string;
  type: ComponentType;
  version: string;
  props: ComponentProps;
  conditional?: ConditionalLogic;
  analytics?: AnalyticsConfig;
}

/**
 * Supported component types in the manifest system
 */
export type ComponentType =
  | 'header'
  | 'hero'
  | 'feature_grid'
  | 'text'
  | 'cta'
  | 'form'
  | 'card'
  | 'image'
  | 'video'
  | 'spacer'
  | 'divider'
  | 'testimonial'
  | 'pricing'
  | 'contact'
  | 'footer';

/**
 * Union type for all possible component props
 */
export type ComponentProps =
  | HeaderProps
  | HeroProps
  | FeatureGridProps
  | TextProps
  | CTAProps
  | FormProps
  | CardProps
  | ImageProps
  | VideoProps
  | SpacerProps
  | DividerProps
  | TestimonialProps
  | PricingProps
  | ContactProps
  | FooterProps;

/**
 * Conditional logic for component visibility and behavior
 */
export interface ConditionalLogic {
  field: string;
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan';
  value: any;
  action?: 'show' | 'hide' | 'enable' | 'disable';
}

/**
 * Analytics configuration for tracking component interactions
 */
export interface AnalyticsConfig {
  trackClicks?: boolean;
  trackViews?: boolean;
  customEvents?: string[];
}

/**
 * Call-to-action definition used across multiple components
 */
export interface CTAAction {
  type: 'navigate' | 'open_form' | 'download' | 'external' | 'scroll_to';
  target: string;
}

/**
 * Button configuration with styling options
 */
export interface ButtonConfig {
  label: string;
  action: CTAAction;
  style?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

/**
 * Media asset reference with metadata
 */
export interface MediaAsset {
  type: 'image' | 'video' | 'none';
  assetId?: string;
  alt?: string;
  caption?: string;
  lazy?: boolean;
}

/**
 * Responsive sizing options
 */
export type ResponsiveSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Color theme options
 */
export type ColorTheme = 'light' | 'dark' | 'auto';

/**
 * Spacing options following design system
 */
export type SpacingSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// =============================================================================
// HEADER COMPONENT CONTRACT
// =============================================================================

export interface HeaderProps {
  logo?: {
    type: 'text' | 'image' | 'icon';
    content: string;
    size?: 'sm' | 'md' | 'lg';
    href?: string;
  };
  navigation?: NavigationItem[];
  showThemeToggle?: boolean;
  sticky?: boolean;
  background?: 'transparent' | 'glass' | 'solid';
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: SpacingSize;
}

export interface NavigationItem {
  label: string;
  href: string;
  active?: boolean;
  external?: boolean;
  children?: NavigationItem[];
}

// =============================================================================
// HERO COMPONENT CONTRACT
// =============================================================================

export interface HeroProps {
  title: string;
  subtitle?: string;
  description?: string;
  media?: MediaAsset;
  cta?: ButtonConfig;
  secondaryCTA?: ButtonConfig;
  background?: 'gradient' | 'mesh' | 'solid' | 'image';
  layout?: 'centered' | 'left' | 'right' | 'split';
  animation?: boolean;
  height?: 'auto' | 'screen' | 'large' | 'medium' | 'small';
  overlay?: {
    enabled: boolean;
    opacity?: number;
    color?: string;
  };
}

// =============================================================================
// FEATURE GRID COMPONENT CONTRACT
// =============================================================================

export interface FeatureGridProps {
  title?: string;
  description?: string;
  features: FeatureItem[];
  columns?: 1 | 2 | 3 | 4;
  layout?: 'cards' | 'icons' | 'text' | 'minimal';
  spacing?: 'tight' | 'normal' | 'relaxed';
  animation?: {
    enabled: boolean;
    stagger?: boolean;
    delay?: number;
  };
}

export interface FeatureItem {
  icon?: string; // Lucide icon name
  image?: MediaAsset;
  title: string;
  description: string;
  badge?: string;
  link?: {
    href: string;
    label: string;
  };
}

// =============================================================================
// TEXT COMPONENT CONTRACT
// =============================================================================

export interface TextProps {
  content: string;
  format?: 'markdown' | 'html' | 'text';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  size?: 'sm' | 'md' | 'lg';
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  typography?: {
    headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    color?: string;
  };
  spacing?: {
    top?: SpacingSize;
    bottom?: SpacingSize;
  };
}

// =============================================================================
// CTA COMPONENT CONTRACT
// =============================================================================

export interface CTAProps {
  title?: string;
  description?: string;
  buttons: ButtonConfig[];
  background?: 'gradient' | 'solid' | 'transparent';
  alignment?: 'left' | 'center' | 'right';
  spacing?: SpacingSize;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  border?: {
    enabled: boolean;
    style?: 'solid' | 'dashed' | 'dotted';
    width?: 'thin' | 'medium' | 'thick';
    radius?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  };
}

// =============================================================================
// FORM COMPONENT CONTRACT (Based on existing form builders)
// =============================================================================

export interface FormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submission: FormSubmission;
  validation?: boolean;
  layout?: 'vertical' | 'horizontal' | 'grid' | 'wizard';
  columns?: 1 | 2 | 3 | 4;
  submitButtonText?: string;
  resetButtonText?: string;
  showReset?: boolean;
  progressBar?: boolean;
  options?: {
    spamProtection?: boolean;
    requireConsent?: boolean;
    autoSave?: boolean;
    realTimeValidation?: boolean;
  };
  styling?: {
    fieldSpacing?: 'tight' | 'normal' | 'relaxed';
    labelPosition?: 'top' | 'left' | 'inline';
    roundedCorners?: boolean;
  };
}

/**
 * Form field definition based on existing form builder analysis
 */
export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  description?: string;
  required?: boolean;
  defaultValue?: any;
  options?: FieldOption[];
  validation?: FieldValidation;
  conditional?: ConditionalLogic;
  visibility?: boolean;
  styling?: {
    width?: 'full' | 'half' | 'third' | 'quarter';
    className?: string;
  };
  accessibility?: {
    ariaLabel?: string;
    tabIndex?: number;
  };
}

export type FormFieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'textarea'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'switch'
  | 'date'
  | 'time'
  | 'datetime'
  | 'file'
  | 'range'
  | 'color'
  | 'rating'
  | 'signature'
  | 'address';

export interface FieldOption {
  label: string;
  value: string;
  disabled?: boolean;
  selected?: boolean;
}

export interface FieldValidation {
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  custom?: string;
  customMessage?: string;
  accept?: string; // for file fields
  maxFileSize?: number; // in bytes
  maxFiles?: number;
}

export interface FormSubmission {
  type: 'webhook' | 'email' | 'database' | 'api';
  target: string;
  method?: 'POST' | 'PUT' | 'PATCH';
  headers?: Record<string, string>;
  transform?: {
    function?: string;
    mapping?: Record<string, string>;
  };
  successAction?: {
    type: 'message' | 'redirect' | 'download' | 'reset';
    message?: string;
    redirectUrl?: string;
    downloadUrl?: string;
  };
  errorAction?: {
    message?: string;
    retryButton?: boolean;
  };
}

// =============================================================================
// CARD COMPONENT CONTRACT
// =============================================================================

export interface CardProps {
  title?: string;
  description?: string;
  content?: string | BaseComponent[];
  image?: MediaAsset;
  link?: {
    href: string;
    label?: string;
    external?: boolean;
  };
  style?: 'glass' | 'solid' | 'outline' | 'elevated' | 'minimal';
  padding?: SpacingSize;
  rounded?: 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
  badge?: {
    text: string;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  };
}

// =============================================================================
// MEDIA COMPONENT CONTRACTS
// =============================================================================

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down';
  lazy?: boolean;
  placeholder?: 'blur' | 'empty';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  border?: boolean;
  shadow?: boolean;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9' | 'auto';
}

export interface VideoProps {
  src: string;
  poster?: string;
  caption?: string;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  width?: number;
  height?: number;
  aspectRatio?: '4:3' | '16:9' | '21:9' | 'auto';
  lazy?: boolean;
}

// =============================================================================
// LAYOUT COMPONENT CONTRACTS
// =============================================================================

export interface SpacerProps {
  height?: SpacingSize;
  responsive?: {
    mobile?: SpacingSize;
    tablet?: SpacingSize;
    desktop?: SpacingSize;
  };
}

export interface DividerProps {
  style?: 'solid' | 'dashed' | 'dotted';
  thickness?: 'thin' | 'medium' | 'thick';
  color?: string;
  spacing?: {
    top?: SpacingSize;
    bottom?: SpacingSize;
  };
  width?: 'full' | 'half' | 'quarter';
  alignment?: 'left' | 'center' | 'right';
}

// =============================================================================
// SOCIAL PROOF COMPONENT CONTRACTS
// =============================================================================

export interface TestimonialProps {
  quote: string;
  author: {
    name: string;
    title?: string;
    company?: string;
    avatar?: MediaAsset;
  };
  rating?: number;
  layout?: 'card' | 'minimal' | 'featured';
  style?: 'quotes' | 'clean' | 'bordered';
}

export interface PricingProps {
  title?: string;
  description?: string;
  plans: PricingPlan[];
  layout?: 'cards' | 'table' | 'minimal';
  billing?: 'monthly' | 'yearly' | 'toggle';
  featured?: string; // plan ID to highlight
}

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  price: {
    amount: number;
    currency: string;
    period: 'month' | 'year' | 'one-time';
  };
  features: string[];
  cta: ButtonConfig;
  popular?: boolean;
  badge?: string;
}

// =============================================================================
// FOOTER COMPONENT CONTRACT
// =============================================================================

export interface ContactProps {
  title?: string;
  description?: string;
  form?: FormProps;
  contactInfo?: ContactInfo[];
  layout?: 'form-only' | 'info-only' | 'split';
  background?: 'solid' | 'gradient' | 'transparent';
}

export interface ContactInfo {
  type: 'address' | 'phone' | 'email' | 'website' | 'social';
  label: string;
  value: string;
  icon?: string;
  link?: boolean;
}

export interface FooterProps {
  logo?: {
    type: 'text' | 'image' | 'icon';
    content: string;
    href?: string;
  };
  description?: string;
  links?: FooterSection[];
  social?: SocialLink[];
  copyright?: string;
  layout?: 'columns' | 'centered' | 'minimal';
  background?: 'solid' | 'gradient' | 'transparent';
}

export interface FooterSection {
  title: string;
  links: {
    label: string;
    href: string;
    external?: boolean;
  }[];
}

export interface SocialLink {
  platform: string;
  href: string;
  icon?: string;
}

// =============================================================================
// COMPONENT VERSION CONTRACTS
// =============================================================================

/**
 * Component version compatibility map
 * Defines which component versions are compatible with which manifest versions
 */
export const COMPONENT_VERSIONS = {
  header: '1.0.0',
  hero: '1.0.0',
  feature_grid: '1.0.0',
  text: '1.0.0',
  cta: '1.0.0',
  form: '1.0.0',
  card: '1.0.0',
  image: '1.0.0',
  video: '1.0.0',
  spacer: '1.0.0',
  divider: '1.0.0',
  testimonial: '1.0.0',
  pricing: '1.0.0',
  contact: '1.0.0',
  footer: '1.0.0',
} as const;

/**
 * Runtime type guards for component props validation
 */
export function isHeaderProps(props: ComponentProps): props is HeaderProps {
  return 'logo' in props || 'navigation' in props;
}

export function isHeroProps(props: ComponentProps): props is HeroProps {
  return 'title' in props && typeof props.title === 'string';
}

export function isFeatureGridProps(props: ComponentProps): props is FeatureGridProps {
  return 'features' in props && Array.isArray(props.features);
}

export function isFormProps(props: ComponentProps): props is FormProps {
  return 'fields' in props && 'submission' in props;
}

/**
 * Component props factory for creating typed component instances
 */
export function createComponent<T extends ComponentType>(
  type: T,
  props: Extract<ComponentProps, { [K in keyof ComponentProps]: ComponentProps[K] extends infer P ? P extends any ? T extends ComponentType ? ComponentProps : never : never : never }>,
  options?: {
    id?: string;
    version?: string;
    conditional?: ConditionalLogic;
    analytics?: AnalyticsConfig;
  }
): BaseComponent {
  return {
    id: options?.id || `c_${type}_${Date.now()}`,
    type,
    version: options?.version || COMPONENT_VERSIONS[type],
    props,
    ...(options?.conditional && { conditional: options.conditional }),
    ...(options?.analytics && { analytics: options.analytics }),
  };
}

/**
 * Manifest validation utilities
 */
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  component: string;
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  component: string;
  field: string;
  message: string;
  suggestion?: string;
}

/**
 * Component registry for dynamic component resolution
 */
export const COMPONENT_REGISTRY = {
  header: 'HeaderComponent',
  hero: 'HeroComponent',
  feature_grid: 'FeatureGridComponent',
  text: 'TextComponent',
  cta: 'CTAComponent',
  form: 'FormComponent',
  card: 'CardComponent',
  image: 'ImageComponent',
  video: 'VideoComponent',
  spacer: 'SpacerComponent',
  divider: 'DividerComponent',
  testimonial: 'TestimonialComponent',
  pricing: 'PricingComponent',
  contact: 'ContactComponent',
  footer: 'FooterComponent',
} as const;

export type ComponentRegistry = typeof COMPONENT_REGISTRY;

/**
 * Template Manifest - Complete template definition
 */
export interface TemplateManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  category: string;
  components: BaseComponent[];
  metadata: {
    author: string;
    createdAt: string;
    updatedAt: string;
    tags: string[];
    preview?: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
    canonicalUrl?: string;
    robots?: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
    borderRadius: string;
    spacing: string;
  };
  features: string[];
  integrations: string[];
}