/**
 * HT-021 Foundation Architecture: Component Customization Types
 * 
 * Core interfaces for component customization and theming
 * Part of the foundation layer that supports HT-022 component system
 */

export interface StyleOverrides {
  colors?: Record<string, string>;
  spacing?: Record<string, string>;
  typography?: Record<string, any>;
  layout?: Record<string, any>;
  animations?: Record<string, any>;
}

export interface BehaviorOverrides {
  interactions?: Record<string, any>;
  validations?: Record<string, any>;
  events?: Record<string, any>;
  state?: Record<string, any>;
}

export interface ContentOverrides {
  text?: Record<string, string>;
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  messages?: Record<string, string>;
}

export interface ComponentCustomization {
  componentId: string;
  clientId: string;
  style?: StyleOverrides;
  behavior?: BehaviorOverrides;
  content?: ContentOverrides;
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    version: string;
    author: string;
  };
}

export interface CustomizationRule {
  id: string;
  name: string;
  condition: string;
  overrides: ComponentCustomization;
  priority: number;
  active: boolean;
}

export interface CustomizationContext {
  clientId: string;
  userId?: string;
  environment: 'development' | 'staging' | 'production';
  features: string[];
  permissions: string[];
}
