/**
 * @fileoverview Modular Component Type Definitions - HT-032.1.4
 * @module types/admin/modular-components
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Type definitions for modular admin components including setting inputs,
 * groups, panels, validation, and layout system integration.
 */

import React from 'react';
import { z } from 'zod';
import { LucideIcon } from 'lucide-react';
import { 
  TemplateSettings, 
  TemplateSettingsValue, 
  SettingsGroup,
  ValidationResult 
} from './template-registry';

// Component System Types
export interface ModularComponentProps {
  id?: string;
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  children?: React.ReactNode;
}

// Setting Input Component Types
export interface SettingInputProps extends ModularComponentProps {
  setting: TemplateSettings;
  value: TemplateSettingsValue;
  onChange: (value: TemplateSettingsValue) => void;
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
}

export interface SettingInputWrapperProps extends SettingInputProps {
  children: React.ReactNode;
}

// Specialized Input Props
export interface StringInputProps extends SettingInputProps {
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  spellCheck?: boolean;
}

export interface NumberInputProps extends SettingInputProps {
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  format?: 'decimal' | 'integer' | 'currency' | 'percentage';
}

export interface BooleanInputProps extends SettingInputProps {
  variant?: 'switch' | 'checkbox' | 'toggle';
  size?: 'sm' | 'md' | 'lg';
}

export interface SelectInputProps extends SettingInputProps {
  options: Array<{
    label: string;
    value: any;
    description?: string;
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
  searchable?: boolean;
  clearable?: boolean;
  multiple?: boolean;
  placeholder?: string;
}

export interface ColorInputProps extends SettingInputProps {
  format?: 'hex' | 'rgb' | 'hsl' | 'hsv';
  presets?: string[];
  alpha?: boolean;
}

export interface FileInputProps extends SettingInputProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  preview?: boolean;
  uploadUrl?: string;
}

export interface DateInputProps extends SettingInputProps {
  format?: string;
  minDate?: Date;
  maxDate?: Date;
  showTime?: boolean;
  timezone?: string;
}

// Setting Group Component Types
export interface SettingGroupProps extends ModularComponentProps {
  group: SettingsGroup;
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  onGroupToggle?: (groupId: string, expanded: boolean) => void;
  expanded?: boolean;
  collapsible?: boolean;
}

export interface SettingGroupHeaderProps {
  group: SettingsGroup;
  isExpanded: boolean;
  onToggle: () => void;
  validation?: ValidationResult;
  completionPercentage: number;
  disabled?: boolean;
}

export interface SettingGroupContentProps {
  group: SettingsGroup;
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  disabled?: boolean;
}

// Setting Panel Component Types
export interface SettingPanelProps extends ModularComponentProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  groups: SettingsGroup[];
  settings: Record<string, any>;
  validation?: ValidationResult;
  onSettingChange: (settingId: string, value: any) => void;
  onSave?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onExport?: () => Promise<string>;
  onImport?: (data: string) => Promise<void>;
  onBack?: () => void;
  saving?: boolean;
  showPreview?: boolean;
  previewComponent?: React.ComponentType<any>;
}

export interface SettingPanelHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  validation?: ValidationResult;
  completionPercentage: number;
  onBack?: () => void;
  onSave?: () => Promise<void>;
  onReset?: () => Promise<void>;
  onExport?: () => Promise<string>;
  onImport?: (data: string) => Promise<void>;
  loading?: boolean;
  saving?: boolean;
  disabled?: boolean;
  showPreview?: boolean;
  onTogglePreview?: (show: boolean) => void;
  actions?: React.ReactNode;
}

export interface SettingPanelStatusProps {
  validation?: ValidationResult;
  completionPercentage: number;
  totalSettings: number;
  completedSettings: number;
  requiredSettings: number;
  completedRequired: number;
  className?: string;
}

// Validation Component Types
export interface ValidationMessage {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  field?: string;
  code?: string;
  suggestion?: string;
  helpUrl?: string;
  timestamp?: Date;
  dismissible?: boolean;
  persistent?: boolean;
}

export interface ValidationFeedbackProps extends ModularComponentProps {
  validation?: ValidationResult;
  messages?: ValidationMessage[];
  showSummary?: boolean;
  showDetails?: boolean;
  compact?: boolean;
  dismissible?: boolean;
  onDismiss?: (messageId: string) => void;
  onRetry?: () => void;
  maxMessages?: number;
}

export interface InlineValidationProps extends ModularComponentProps {
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  icon?: boolean;
  animated?: boolean;
}

export interface ValidationSummaryProps extends ModularComponentProps {
  validation: ValidationResult;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  collapsible?: boolean;
  autoExpand?: boolean;
}

// Layout System Types
export enum LayoutType {
  GRID = 'grid',
  FORM = 'form',
  TABS = 'tabs',
  ACCORDION = 'accordion',
  SIDEBAR = 'sidebar',
  SPLIT = 'split',
  STACK = 'stack',
  MASONRY = 'masonry'
}

export enum ResponsiveBreakpoint {
  XS = 'xs',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = '2xl'
}

export interface ResponsiveValue<T> {
  [ResponsiveBreakpoint.XS]?: T;
  [ResponsiveBreakpoint.SM]?: T;
  [ResponsiveBreakpoint.MD]?: T;
  [ResponsiveBreakpoint.LG]?: T;
  [ResponsiveBreakpoint.XL]?: T;
  [ResponsiveBreakpoint.XXL]?: T;
}

export interface LayoutConfig {
  type: LayoutType;
  columns?: number | ResponsiveValue<number>;
  rows?: number | ResponsiveValue<number>;
  gap?: number | ResponsiveValue<number>;
  padding?: number | ResponsiveValue<number>;
  margin?: number | ResponsiveValue<number>;
  alignment?: 'start' | 'center' | 'end' | 'stretch';
  distribution?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  adaptive?: boolean;
  minHeight?: number | string;
  maxHeight?: number | string;
  className?: string;
}

export interface LayoutSection {
  id: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
  order: number;
  span?: number | ResponsiveValue<number>;
  offset?: number | ResponsiveValue<number>;
  visible?: boolean | ResponsiveValue<boolean>;
  className?: string;
  content?: React.ReactNode;
  component?: React.ComponentType<any>;
  props?: Record<string, any>;
}

export interface LayoutTemplate {
  id: string;
  name: string;
  description?: string;
  type: LayoutType;
  config: LayoutConfig;
  sections: LayoutSection[];
  preview?: string;
  metadata?: {
    category?: string;
    tags?: string[];
    author?: string;
    version?: string;
    compatibility?: string[];
    createdAt?: Date;
    updatedAt?: Date;
  };
}

// Component Registry Types
export interface ComponentDefinition {
  id: string;
  name: string;
  description?: string;
  category: ComponentCategory;
  version: string;
  component: React.ComponentType<any>;
  props?: ComponentPropsSchema;
  dependencies?: string[];
  tags?: string[];
  icon?: LucideIcon;
  thumbnail?: string;
  author?: string;
  license?: string;
  repository?: string;
  documentation?: string;
  examples?: ComponentExample[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ComponentCategory {
  SETTING_INPUT = 'setting-input',
  SETTING_GROUP = 'setting-group',
  SETTING_PANEL = 'setting-panel',
  LAYOUT = 'layout',
  VALIDATION = 'validation',
  UTILITY = 'utility',
  WIDGET = 'widget',
  FORM = 'form',
  DISPLAY = 'display',
  NAVIGATION = 'navigation',
  FEEDBACK = 'feedback'
}

export interface ComponentPropsSchema {
  schema: z.ZodSchema;
  defaultProps?: Record<string, any>;
  requiredProps?: string[];
  optionalProps?: string[];
  examples?: Array<{
    name: string;
    props: Record<string, any>;
    description?: string;
  }>;
}

export interface ComponentExample {
  id: string;
  name: string;
  description?: string;
  props: Record<string, any>;
  code?: string;
  preview?: string;
}

export interface ComponentInstance {
  id: string;
  componentId: string;
  props: Record<string, any>;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Theme and Styling Types
export interface ComponentTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      md: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    none: number;
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animation: {
    duration: {
      fast: number;
      normal: number;
      slow: number;
    };
    easing: {
      linear: string;
      ease: string;
      easeIn: string;
      easeOut: string;
      easeInOut: string;
    };
  };
}

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
  className?: string;
  styles?: React.CSSProperties;
}

export interface ComponentSize {
  name: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  props: Record<string, any>;
  className?: string;
}

// Event Types
export interface ComponentEvent {
  type: string;
  componentId: string;
  instanceId?: string;
  timestamp: Date;
  data?: any;
  source?: 'user' | 'system' | 'api';
}

export interface SettingChangeEvent extends ComponentEvent {
  type: 'setting-change';
  settingId: string;
  oldValue: any;
  newValue: any;
  validation?: ValidationResult;
}

export interface ValidationEvent extends ComponentEvent {
  type: 'validation';
  validation: ValidationResult;
  trigger: 'change' | 'blur' | 'submit' | 'manual';
}

export interface LayoutChangeEvent extends ComponentEvent {
  type: 'layout-change';
  layoutId: string;
  sections: LayoutSection[];
  breakpoint: ResponsiveBreakpoint;
}

// Hook Types
export interface UseSettingInputReturn<T = TemplateSettingsValue> {
  value: T;
  setValue: (value: T) => void;
  error?: string;
  warning?: string;
  success?: string;
  info?: string;
  isValid: boolean;
  isDirty: boolean;
  isLoading: boolean;
  validate: () => Promise<ValidationResult>;
  reset: () => void;
  clear: () => void;
}

export interface UseSettingGroupReturn {
  settings: Record<string, any>;
  updateSetting: (settingId: string, value: any) => void;
  updateSettings: (updates: Record<string, any>) => void;
  validation: ValidationResult;
  isValid: boolean;
  isDirty: boolean;
  isLoading: boolean;
  validate: () => Promise<ValidationResult>;
  reset: () => void;
  save: () => Promise<void>;
}

export interface UseLayoutReturn {
  template: LayoutTemplate | null;
  sections: LayoutSection[];
  config: LayoutConfig;
  breakpoint: ResponsiveBreakpoint;
  updateSection: (sectionId: string, updates: Partial<LayoutSection>) => void;
  reorderSections: (sectionIds: string[]) => void;
  addSection: (section: LayoutSection) => void;
  removeSection: (sectionId: string) => void;
  applyTemplate: (templateId: string) => void;
  generateClasses: () => string;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

export type ComponentProps<T extends React.ComponentType<any>> = 
  T extends React.ComponentType<infer P> ? P : never;

// Configuration Types
export interface ModularComponentsConfig {
  theme: ComponentTheme;
  defaultLayout: LayoutType;
  enableAnimations: boolean;
  validateOnChange: boolean;
  persistState: boolean;
  autoSave: boolean;
  autoSaveInterval: number;
  maxUndoHistory: number;
  enableAccessibility: boolean;
  enableTelemetry: boolean;
}

// Default Configurations
export const DEFAULT_COMPONENT_THEME: ComponentTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#6366F1',
    accent: '#8B5CF6',
    neutral: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#06B6D4'
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      md: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32
  },
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    full: 9999
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
  },
  animation: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500
    },
    easing: {
      linear: 'linear',
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    }
  }
};

export const DEFAULT_MODULAR_COMPONENTS_CONFIG: ModularComponentsConfig = {
  theme: DEFAULT_COMPONENT_THEME,
  defaultLayout: LayoutType.FORM,
  enableAnimations: true,
  validateOnChange: true,
  persistState: true,
  autoSave: true,
  autoSaveInterval: 5000,
  maxUndoHistory: 50,
  enableAccessibility: true,
  enableTelemetry: false
};
