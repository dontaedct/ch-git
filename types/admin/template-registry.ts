/**
 * @fileoverview Template Registry Type Definitions - HT-032.1.2
 * @module types/admin/template-registry
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Type definitions for the template registration system and dynamic settings registry.
 * Provides comprehensive type safety for template management and settings integration.
 */

import { z } from 'zod';
import { LucideIcon } from 'lucide-react';

// Template Registration Types
export const TemplateMetadataSchema = z.object({
  id: z.string().min(1, 'Template ID is required'),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().min(1, 'Template description is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be semantic (e.g., 1.0.0)'),
  author: z.string().min(1, 'Author is required'),
  authorEmail: z.string().email('Invalid author email'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  icon: z.string().optional(),
  thumbnail: z.string().optional(),
  documentationUrl: z.string().url().optional(),
  supportUrl: z.string().url().optional(),
  license: z.string().default('MIT'),
  minPlatformVersion: z.string().default('1.0.0'),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date()
});

export const TemplateSettingsSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  type: z.enum(['string', 'number', 'boolean', 'select', 'multiselect', 'object', 'array', 'file', 'color', 'date']),
  required: z.boolean().default(false),
  defaultValue: z.any().optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    pattern: z.string().optional(),
    custom: z.string().optional()
  }).optional(),
  options: z.array(z.object({
    label: z.string(),
    value: z.any()
  })).optional(),
  group: z.string().default('general'),
  order: z.number().default(0),
  helpText: z.string().optional(),
  placeholder: z.string().optional(),
  readOnly: z.boolean().default(false),
  conditional: z.object({
    field: z.string(),
    operator: z.enum(['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than']),
    value: z.any()
  }).optional()
});

export const TemplateRegistrationSchema = z.object({
  metadata: TemplateMetadataSchema,
  settings: z.array(TemplateSettingsSchema).default([]),
  navigation: z.array(z.object({
    id: z.string(),
    label: z.string(),
    description: z.string().optional(),
    href: z.string(),
    icon: z.string().optional(),
    order: z.number().default(0),
    permissions: z.array(z.string()).default([])
  })).default([]),
  components: z.object({
    settingsPanel: z.string().optional(),
    dashboard: z.string().optional(),
    widgets: z.array(z.string()).default([])
  }).default({}),
  hooks: z.object({
    beforeInstall: z.string().optional(),
    afterInstall: z.string().optional(),
    beforeUninstall: z.string().optional(),
    afterUninstall: z.string().optional(),
    beforeUpdate: z.string().optional(),
    afterUpdate: z.string().optional()
  }).default({}),
  assets: z.object({
    stylesheets: z.array(z.string()).default([]),
    scripts: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    fonts: z.array(z.string()).default([])
  }).default({})
});

// Type exports
export type TemplateMetadata = z.infer<typeof TemplateMetadataSchema>;
export type TemplateSettings = z.infer<typeof TemplateSettingsSchema>;
export type TemplateRegistration = z.infer<typeof TemplateRegistrationSchema>;

// Template Status Types
export enum TemplateStatus {
  INSTALLED = 'installed',
  INSTALLING = 'installing',
  UNINSTALLING = 'uninstalling',
  UPDATING = 'updating',
  ERROR = 'error',
  DISABLED = 'disabled'
}

export interface TemplateInstance {
  id: string;
  templateId: string;
  status: TemplateStatus;
  installedAt: Date;
  updatedAt: Date;
  settings: Record<string, any>;
  version: string;
  enabled: boolean;
  error?: string;
}

// Settings Registry Types
export interface SettingsGroup {
  id: string;
  name: string;
  description?: string;
  icon?: LucideIcon;
  order: number;
  settings: TemplateSettings[];
  collapsible: boolean;
  defaultExpanded: boolean;
}

export interface SettingsRegistry {
  templateId: string;
  groups: SettingsGroup[];
  validation: z.ZodSchema;
  hooks: {
    onSave?: (settings: Record<string, any>) => Promise<void>;
    onLoad?: () => Promise<Record<string, any>>;
    onValidate?: (settings: Record<string, any>) => Promise<boolean>;
  };
}

// Template Loading Types
export interface TemplateLoader {
  loadTemplate(templateId: string): Promise<TemplateRegistration>;
  unloadTemplate(templateId: string): Promise<void>;
  getTemplatePath(templateId: string): string;
  validateTemplate(registration: TemplateRegistration): Promise<boolean>;
  installTemplate(registration: TemplateRegistration): Promise<void>;
  uninstallTemplate(templateId: string): Promise<void>;
}

// Template Manager Types
export interface TemplateManager {
  registerTemplate(registration: TemplateRegistration): Promise<void>;
  unregisterTemplate(templateId: string): Promise<void>;
  getTemplate(templateId: string): TemplateRegistration | undefined;
  getAllTemplates(): TemplateRegistration[];
  getInstalledTemplates(): TemplateInstance[];
  installTemplate(templateId: string): Promise<void>;
  uninstallTemplate(templateId: string): Promise<void>;
  updateTemplate(templateId: string, newVersion: string): Promise<void>;
  enableTemplate(templateId: string): Promise<void>;
  disableTemplate(templateId: string): Promise<void>;
  validateTemplate(templateId: string): Promise<boolean>;
}

// Event Types
export interface TemplateEvent {
  type: 'install' | 'uninstall' | 'update' | 'enable' | 'disable' | 'error';
  templateId: string;
  timestamp: Date;
  data?: any;
  error?: string;
}

export interface SettingsEvent {
  type: 'update' | 'validate' | 'save' | 'load';
  templateId: string;
  settingId: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  userId?: string;
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TemplateValidationResult extends ValidationResult {
  templateId: string;
  issues: Array<{
    type: 'error' | 'warning';
    field: string;
    message: string;
  }>;
}

// Configuration Types
export interface TemplateRegistryConfig {
  autoInstall: boolean;
  autoUpdate: boolean;
  validateOnInstall: boolean;
  backupOnUpdate: boolean;
  maxConcurrentInstalls: number;
  allowedCategories: string[];
  blockedTemplates: string[];
  trustedAuthors: string[];
}

export interface SettingsRegistryConfig {
  autoSave: boolean;
  validateOnChange: boolean;
  cacheSettings: boolean;
  maxCacheSize: number;
  backupInterval: number;
}

// API Types
export interface TemplateSearchParams {
  query?: string;
  category?: string;
  tags?: string[];
  author?: string;
  minVersion?: string;
  maxVersion?: string;
  installed?: boolean;
  enabled?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: 'name' | 'version' | 'installedAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface TemplateSearchResult {
  templates: TemplateRegistration[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Component Props Types
export interface TemplateRegistrationProps {
  template: TemplateRegistration;
  onRegister: (template: TemplateRegistration) => Promise<void>;
  onUnregister: (templateId: string) => Promise<void>;
  loading?: boolean;
  disabled?: boolean;
}

export interface SettingsRegistryManagerProps {
  templateId: string;
  settings: Record<string, any>;
  onUpdate: (settingId: string, value: any) => Promise<void>;
  onSave: () => Promise<void>;
  loading?: boolean;
  readOnly?: boolean;
  validation?: ValidationResult;
}

// Utility Types
export type TemplateSettingsValue = string | number | boolean | string[] | object | null;
export type SettingsUpdateCallback = (settingId: string, value: TemplateSettingsValue) => Promise<void>;
export type TemplateEventCallback = (event: TemplateEvent) => void;
export type SettingsEventCallback = (event: SettingsEvent) => void;

// Default Configurations
export const DEFAULT_TEMPLATE_REGISTRY_CONFIG: TemplateRegistryConfig = {
  autoInstall: false,
  autoUpdate: false,
  validateOnInstall: true,
  backupOnUpdate: true,
  maxConcurrentInstalls: 3,
  allowedCategories: ['business', 'ecommerce', 'portfolio', 'blog', 'landing', 'dashboard'],
  blockedTemplates: [],
  trustedAuthors: []
};

export const DEFAULT_SETTINGS_REGISTRY_CONFIG: SettingsRegistryConfig = {
  autoSave: true,
  validateOnChange: true,
  cacheSettings: true,
  maxCacheSize: 1000,
  backupInterval: 300000 // 5 minutes
};
