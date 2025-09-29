/**
 * @fileoverview Core Settings Management System - HT-032.1.1
 * @module lib/admin/core-settings
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Core settings management system that provides unified configuration
 * management for the modular admin interface. Handles validation,
 * persistence, and real-time updates of system settings.
 */

import { z } from 'zod';

// Core settings schema definitions
export const GeneralSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  adminEmail: z.string().email('Invalid admin email'),
  supportEmail: z.string().email('Invalid support email'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  maintenanceMode: z.boolean().default(false)
});

export const SecuritySettingsSchema = z.object({
  twoFactorRequired: z.boolean().default(false),
  sessionTimeout: z.number().min(5).max(480),
  passwordPolicy: z.object({
    minLength: z.number().min(6).max(32),
    requireSpecialChars: z.boolean(),
    requireNumbers: z.boolean(),
    requireUppercase: z.boolean()
  }),
  ipWhitelist: z.array(z.string().ip()),
  rateLimiting: z.boolean().default(true)
});

export const NotificationSettingsSchema = z.object({
  emailNotifications: z.boolean().default(true),
  smsNotifications: z.boolean().default(false),
  pushNotifications: z.boolean().default(true),
  webhookNotifications: z.boolean().default(false),
  notificationEmail: z.string().email('Invalid notification email')
});

export const BrandingSettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  fontFamily: z.string().min(1, 'Font family is required'),
  customCss: z.string().optional()
});

export const SystemSettingsSchema = z.object({
  debugMode: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  cacheEnabled: z.boolean().default(true),
  backupEnabled: z.boolean().default(true),
  backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  maxFileSize: z.number().min(1).max(100).default(10)
});

export const CoreSettingsSchema = z.object({
  general: GeneralSettingsSchema,
  security: SecuritySettingsSchema,
  notifications: NotificationSettingsSchema,
  branding: BrandingSettingsSchema,
  system: SystemSettingsSchema
});

// Type definitions
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type SecuritySettings = z.infer<typeof SecuritySettingsSchema>;
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;
export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type CoreSettings = z.infer<typeof CoreSettingsSchema>;

export interface SettingsValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface SettingsUpdateEvent {
  section: keyof CoreSettings;
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId?: string;
}

// Default settings
export const DEFAULT_CORE_SETTINGS: CoreSettings = {
  general: {
    siteName: 'Admin Platform',
    siteDescription: 'Modular admin interface for managing applications',
    adminEmail: 'admin@example.com',
    supportEmail: 'support@example.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false
  },
  security: {
    twoFactorRequired: false,
    sessionTimeout: 30,
    passwordPolicy: {
      minLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true
    },
    ipWhitelist: [],
    rateLimiting: true
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    webhookNotifications: false,
    notificationEmail: 'notifications@example.com'
  },
  branding: {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter, sans-serif',
    customCss: ''
  },
  system: {
    debugMode: false,
    logLevel: 'info',
    cacheEnabled: true,
    backupEnabled: true,
    backupFrequency: 'daily',
    maxFileSize: 10
  }
};

/**
 * Core Settings Management Class
 * Handles all core settings operations including validation, persistence, and events
 */
export class CoreSettingsManager {
  private settings: CoreSettings;
  private listeners: Array<(event: SettingsUpdateEvent) => void> = [];
  private validationCache: Map<string, SettingsValidationResult> = new Map();

  constructor(initialSettings?: Partial<CoreSettings>) {
    this.settings = this.mergeWithDefaults(initialSettings || {});
  }

  /**
   * Merge provided settings with defaults
   */
  private mergeWithDefaults(partialSettings: Partial<CoreSettings>): CoreSettings {
    return {
      general: { ...DEFAULT_CORE_SETTINGS.general, ...partialSettings.general },
      security: { ...DEFAULT_CORE_SETTINGS.security, ...partialSettings.security },
      notifications: { ...DEFAULT_CORE_SETTINGS.notifications, ...partialSettings.notifications },
      branding: { ...DEFAULT_CORE_SETTINGS.branding, ...partialSettings.branding },
      system: { ...DEFAULT_CORE_SETTINGS.system, ...partialSettings.system }
    };
  }

  /**
   * Get all settings
   */
  getSettings(): CoreSettings {
    return { ...this.settings };
  }

  /**
   * Get settings for a specific section
   */
  getSection<T extends keyof CoreSettings>(section: T): CoreSettings[T] {
    return { ...this.settings[section] };
  }

  /**
   * Get a specific setting value
   */
  getSetting<T extends keyof CoreSettings, K extends keyof CoreSettings[T]>(
    section: T,
    key: K
  ): CoreSettings[T][K] {
    return this.settings[section][key];
  }

  /**
   * Update a specific setting
   */
  async updateSetting<T extends keyof CoreSettings, K extends keyof CoreSettings[T]>(
    section: T,
    key: K,
    value: CoreSettings[T][K],
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldValue = this.settings[section][key];
    
    // Create updated settings for validation
    const updatedSettings = {
      ...this.settings,
      [section]: {
        ...this.settings[section],
        [key]: value
      }
    };

    // Validate the updated settings
    const validation = this.validateSettings(updatedSettings);
    
    if (validation.isValid) {
      // Update the setting
      (this.settings[section] as any)[key] = value;
      
      // Emit update event
      const event: SettingsUpdateEvent = {
        section,
        key: key as string,
        oldValue,
        newValue: value,
        timestamp: new Date(),
        userId
      };
      
      this.emitUpdateEvent(event);
      
      // Clear validation cache
      this.validationCache.clear();
    }

    return validation;
  }

  /**
   * Update an entire section
   */
  async updateSection<T extends keyof CoreSettings>(
    section: T,
    updates: Partial<CoreSettings[T]>,
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldSection = { ...this.settings[section] };
    
    // Create updated settings for validation
    const updatedSettings = {
      ...this.settings,
      [section]: {
        ...this.settings[section],
        ...updates
      }
    };

    // Validate the updated settings
    const validation = this.validateSettings(updatedSettings);
    
    if (validation.isValid) {
      // Update the section
      this.settings[section] = { ...this.settings[section], ...updates };
      
      // Emit update events for each changed key
      Object.entries(updates).forEach(([key, newValue]) => {
        const oldValue = (oldSection as any)[key];
        if (oldValue !== newValue) {
          const event: SettingsUpdateEvent = {
            section,
            key,
            oldValue,
            newValue,
            timestamp: new Date(),
            userId
          };
          
          this.emitUpdateEvent(event);
        }
      });
      
      // Clear validation cache
      this.validationCache.clear();
    }

    return validation;
  }

  /**
   * Update all settings
   */
  async updateSettings(
    updates: Partial<CoreSettings>,
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldSettings = { ...this.settings };
    
    // Create updated settings for validation
    const updatedSettings = this.mergeWithDefaults({
      ...this.settings,
      ...updates
    });

    // Validate the updated settings
    const validation = this.validateSettings(updatedSettings);
    
    if (validation.isValid) {
      // Update the settings
      this.settings = updatedSettings;
      
      // Emit update events for all changes
      Object.entries(updates).forEach(([section, sectionUpdates]) => {
        if (sectionUpdates && typeof sectionUpdates === 'object') {
          Object.entries(sectionUpdates).forEach(([key, newValue]) => {
            const oldValue = (oldSettings[section as keyof CoreSettings] as any)?.[key];
            if (oldValue !== newValue) {
              const event: SettingsUpdateEvent = {
                section: section as keyof CoreSettings,
                key,
                oldValue,
                newValue,
                timestamp: new Date(),
                userId
              };
              
              this.emitUpdateEvent(event);
            }
          });
        }
      });
      
      // Clear validation cache
      this.validationCache.clear();
    }

    return validation;
  }

  /**
   * Validate settings
   */
  validateSettings(settings: CoreSettings): SettingsValidationResult {
    const cacheKey = JSON.stringify(settings);
    
    if (this.validationCache.has(cacheKey)) {
      return this.validationCache.get(cacheKey)!;
    }

    const result: SettingsValidationResult = {
      isValid: true,
      errors: {},
      warnings: {}
    };

    try {
      // Validate each section
      const generalResult = GeneralSettingsSchema.safeParse(settings.general);
      if (!generalResult.success) {
        result.isValid = false;
        result.errors.general = generalResult.error.errors.map(e => e.message);
      }

      const securityResult = SecuritySettingsSchema.safeParse(settings.security);
      if (!securityResult.success) {
        result.isValid = false;
        result.errors.security = securityResult.error.errors.map(e => e.message);
      }

      const notificationsResult = NotificationSettingsSchema.safeParse(settings.notifications);
      if (!notificationsResult.success) {
        result.isValid = false;
        result.errors.notifications = notificationsResult.error.errors.map(e => e.message);
      }

      const brandingResult = BrandingSettingsSchema.safeParse(settings.branding);
      if (!brandingResult.success) {
        result.isValid = false;
        result.errors.branding = brandingResult.error.errors.map(e => e.message);
      }

      const systemResult = SystemSettingsSchema.safeParse(settings.system);
      if (!systemResult.success) {
        result.isValid = false;
        result.errors.system = systemResult.error.errors.map(e => e.message);
      }

      // Add custom validation warnings
      this.addValidationWarnings(settings, result);

    } catch (error) {
      result.isValid = false;
      result.errors.general = ['Validation error occurred'];
    }

    // Cache the result
    this.validationCache.set(cacheKey, result);
    
    return result;
  }

  /**
   * Add custom validation warnings
   */
  private addValidationWarnings(settings: CoreSettings, result: SettingsValidationResult): void {
    // Warn about maintenance mode
    if (settings.general.maintenanceMode) {
      result.warnings.general = result.warnings.general || [];
      result.warnings.general.push('Site is in maintenance mode - users cannot access the application');
    }

    // Warn about debug mode in production
    if (settings.system.debugMode) {
      result.warnings.system = result.warnings.system || [];
      result.warnings.system.push('Debug mode should not be enabled in production environments');
    }

    // Warn about weak password policy
    if (settings.security.passwordPolicy.minLength < 8) {
      result.warnings.security = result.warnings.security || [];
      result.warnings.security.push('Password minimum length should be at least 8 characters');
    }

    // Warn about disabled 2FA
    if (!settings.security.twoFactorRequired) {
      result.warnings.security = result.warnings.security || [];
      result.warnings.security.push('Two-factor authentication is recommended for enhanced security');
    }
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId?: string): Promise<void> {
    const oldSettings = { ...this.settings };
    this.settings = { ...DEFAULT_CORE_SETTINGS };
    
    // Emit reset event
    const event: SettingsUpdateEvent = {
      section: 'general', // Use general as the section for reset events
      key: 'reset',
      oldValue: oldSettings,
      newValue: this.settings,
      timestamp: new Date(),
      userId
    };
    
    this.emitUpdateEvent(event);
    
    // Clear validation cache
    this.validationCache.clear();
  }

  /**
   * Export settings as JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Import settings from JSON
   */
  async importSettings(json: string, userId?: string): Promise<SettingsValidationResult> {
    try {
      const importedSettings = JSON.parse(json);
      return await this.updateSettings(importedSettings, userId);
    } catch (error) {
      return {
        isValid: false,
        errors: { general: ['Invalid JSON format'] },
        warnings: {}
      };
    }
  }

  /**
   * Subscribe to settings updates
   */
  subscribe(listener: (event: SettingsUpdateEvent) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  /**
   * Emit update event to all listeners
   */
  private emitUpdateEvent(event: SettingsUpdateEvent): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in settings update listener:', error);
      }
    });
  }

  /**
   * Get validation result for current settings
   */
  getCurrentValidation(): SettingsValidationResult {
    return this.validateSettings(this.settings);
  }

  /**
   * Check if settings have any validation errors
   */
  hasValidationErrors(): boolean {
    return !this.getCurrentValidation().isValid;
  }

  /**
   * Get all validation errors
   */
  getValidationErrors(): Record<string, string[]> {
    return this.getCurrentValidation().errors;
  }

  /**
   * Get all validation warnings
   */
  getValidationWarnings(): Record<string, string[]> {
    return this.getCurrentValidation().warnings;
  }
}

// Global settings manager instance
let globalSettingsManager: CoreSettingsManager | null = null;

/**
 * Get the global settings manager instance
 */
export function getCoreSettingsManager(initialSettings?: Partial<CoreSettings>): CoreSettingsManager {
  if (!globalSettingsManager) {
    globalSettingsManager = new CoreSettingsManager(initialSettings);
  }
  return globalSettingsManager;
}

/**
 * Initialize settings manager with server-side settings
 */
export function initializeCoreSettings(settings: Partial<CoreSettings>): CoreSettingsManager {
  globalSettingsManager = new CoreSettingsManager(settings);
  return globalSettingsManager;
}

// Utility functions
export function isMaintenanceModeEnabled(settings: CoreSettings): boolean {
  return settings.general.maintenanceMode;
}

export function getSessionTimeout(settings: CoreSettings): number {
  return settings.security.sessionTimeout;
}

export function isDebugModeEnabled(settings: CoreSettings): boolean {
  return settings.system.debugMode;
}

export function getPrimaryBrandColor(settings: CoreSettings): string {
  return settings.branding.primaryColor;
}

export function getSecondaryBrandColor(settings: CoreSettings): string {
  return settings.branding.secondaryColor;
}

export function getFontFamily(settings: CoreSettings): string {
  return settings.branding.fontFamily;
}
