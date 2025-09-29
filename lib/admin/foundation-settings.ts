/**
 * @fileoverview Foundation Settings Management System - HT-032.1.3
 * @module lib/admin/foundation-settings
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * Foundation settings system with universal configuration management including
 * branding, general app settings, user management, and system settings that
 * are always present in the modular admin interface.
 */

import { z } from 'zod';

// Foundation settings schema definitions
export const BrandingSettingsSchema = z.object({
  logoUrl: z.string().url().optional().or(z.literal('')),
  faviconUrl: z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid hex color'),
  fontFamily: z.string().min(1, 'Font family is required'),
  customCss: z.string().optional()
});

export const GeneralSettingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  adminEmail: z.string().email('Invalid admin email'),
  supportEmail: z.string().email('Invalid support email'),
  timezone: z.string().min(1, 'Timezone is required'),
  language: z.string().min(1, 'Language is required'),
  maintenanceMode: z.boolean().default(false),
  allowRegistration: z.boolean().default(false),
  requireEmailVerification: z.boolean().default(true),
  defaultUserRole: z.string().default('user'),
  maxUsersPerOrganization: z.number().min(1).default(100)
});

export const UserManagementSettingsSchema = z.object({
  enableUserInvitations: z.boolean().default(true),
  requireInvitationApproval: z.boolean().default(false),
  defaultUserPermissions: z.array(z.string()).default([]),
  enableUserProfiles: z.boolean().default(true),
  allowUserDeletion: z.boolean().default(false),
  userSessionTimeout: z.number().min(5).max(480).default(60),
  maxLoginAttempts: z.number().min(1).max(10).default(5),
  lockoutDuration: z.number().min(1).max(1440).default(15),
  passwordResetExpiry: z.number().min(5).max(1440).default(60),
  enableTwoFactorAuth: z.boolean().default(false),
  requireTwoFactorAuth: z.boolean().default(false)
});

export const SystemSettingsSchema = z.object({
  debugMode: z.boolean().default(false),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  cacheEnabled: z.boolean().default(true),
  cacheTtl: z.number().min(60).max(86400).default(3600),
  backupEnabled: z.boolean().default(true),
  backupFrequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']).default('daily'),
  backupRetention: z.number().min(1).max(365).default(30),
  maxFileSize: z.number().min(1).max(100).default(10),
  allowedFileTypes: z.array(z.string()).default(['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx']),
  enableApiRateLimit: z.boolean().default(true),
  apiRateLimit: z.number().min(10).max(10000).default(100),
  enableAuditLog: z.boolean().default(true),
  auditLogRetention: z.number().min(1).max(2555).default(90),
  enableMetrics: z.boolean().default(true),
  metricsRetention: z.number().min(1).max(365).default(30)
});

export const FoundationSettingsSchema = z.object({
  branding: BrandingSettingsSchema,
  general: GeneralSettingsSchema,
  userManagement: UserManagementSettingsSchema,
  system: SystemSettingsSchema
});

// Type definitions
export type BrandingSettings = z.infer<typeof BrandingSettingsSchema>;
export type GeneralSettings = z.infer<typeof GeneralSettingsSchema>;
export type UserManagementSettings = z.infer<typeof UserManagementSettingsSchema>;
export type SystemSettings = z.infer<typeof SystemSettingsSchema>;
export type FoundationSettings = z.infer<typeof FoundationSettingsSchema>;

export interface SettingsValidationResult {
  isValid: boolean;
  errors: Record<string, string[]>;
  warnings: Record<string, string[]>;
}

export interface SettingsUpdateEvent {
  section: keyof FoundationSettings;
  key: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  userId?: string;
}

export interface SettingsBackup {
  id: string;
  timestamp: Date;
  settings: FoundationSettings;
  version: string;
  description?: string;
}

// Default foundation settings
export const DEFAULT_FOUNDATION_SETTINGS: FoundationSettings = {
  branding: {
    logoUrl: '',
    faviconUrl: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    fontFamily: 'Inter, sans-serif',
    customCss: ''
  },
  general: {
    siteName: 'Admin Platform',
    siteDescription: 'Modular admin interface for managing applications',
    adminEmail: 'admin@example.com',
    supportEmail: 'support@example.com',
    timezone: 'UTC',
    language: 'en',
    maintenanceMode: false,
    allowRegistration: false,
    requireEmailVerification: true,
    defaultUserRole: 'user',
    maxUsersPerOrganization: 100
  },
  userManagement: {
    enableUserInvitations: true,
    requireInvitationApproval: false,
    defaultUserPermissions: ['read'],
    enableUserProfiles: true,
    allowUserDeletion: false,
    userSessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    passwordResetExpiry: 60,
    enableTwoFactorAuth: false,
    requireTwoFactorAuth: false
  },
  system: {
    debugMode: false,
    logLevel: 'info',
    cacheEnabled: true,
    cacheTtl: 3600,
    backupEnabled: true,
    backupFrequency: 'daily',
    backupRetention: 30,
    maxFileSize: 10,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx'],
    enableApiRateLimit: true,
    apiRateLimit: 100,
    enableAuditLog: true,
    auditLogRetention: 90,
    enableMetrics: true,
    metricsRetention: 30
  }
};

/**
 * Foundation Settings Management Class
 * Handles all foundation settings operations including validation, persistence, and events
 */
export class FoundationSettingsManager {
  private settings: FoundationSettings;
  private listeners: Array<(event: SettingsUpdateEvent) => void> = [];
  private validationCache: Map<string, SettingsValidationResult> = new Map();
  private backups: SettingsBackup[] = [];
  private maxBackups = 10;

  constructor(initialSettings?: Partial<FoundationSettings>) {
    this.settings = this.mergeWithDefaults(initialSettings || {});
  }

  /**
   * Merge provided settings with defaults
   */
  private mergeWithDefaults(partialSettings: Partial<FoundationSettings>): FoundationSettings {
    return {
      branding: { ...DEFAULT_FOUNDATION_SETTINGS.branding, ...partialSettings.branding },
      general: { ...DEFAULT_FOUNDATION_SETTINGS.general, ...partialSettings.general },
      userManagement: { ...DEFAULT_FOUNDATION_SETTINGS.userManagement, ...partialSettings.userManagement },
      system: { ...DEFAULT_FOUNDATION_SETTINGS.system, ...partialSettings.system }
    };
  }

  /**
   * Get all settings
   */
  getSettings(): FoundationSettings {
    return { ...this.settings };
  }

  /**
   * Get settings for a specific section
   */
  getSection<T extends keyof FoundationSettings>(section: T): FoundationSettings[T] {
    return { ...this.settings[section] };
  }

  /**
   * Get a specific setting value
   */
  getSetting<T extends keyof FoundationSettings, K extends keyof FoundationSettings[T]>(
    section: T,
    key: K
  ): FoundationSettings[T][K] {
    return this.settings[section][key];
  }

  /**
   * Update a specific setting
   */
  async updateSetting<T extends keyof FoundationSettings, K extends keyof FoundationSettings[T]>(
    section: T,
    key: K,
    value: FoundationSettings[T][K],
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldValue = this.settings[section][key];
    
    // Create backup before making changes
    this.createBackup(`Setting update: ${section}.${String(key)}`);
    
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
      
      // Persist changes (in real app, save to database)
      await this.persistSettings();
    }

    return validation;
  }

  /**
   * Update an entire section
   */
  async updateSection<T extends keyof FoundationSettings>(
    section: T,
    updates: Partial<FoundationSettings[T]>,
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldSection = { ...this.settings[section] };
    
    // Create backup before making changes
    this.createBackup(`Section update: ${section}`);
    
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
      
      // Persist changes
      await this.persistSettings();
    }

    return validation;
  }

  /**
   * Update all settings
   */
  async updateSettings(
    updates: Partial<FoundationSettings>,
    userId?: string
  ): Promise<SettingsValidationResult> {
    const oldSettings = { ...this.settings };
    
    // Create backup before making changes
    this.createBackup('Full settings update');
    
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
            const oldValue = (oldSettings[section as keyof FoundationSettings] as any)?.[key];
            if (oldValue !== newValue) {
              const event: SettingsUpdateEvent = {
                section: section as keyof FoundationSettings,
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
      
      // Persist changes
      await this.persistSettings();
    }

    return validation;
  }

  /**
   * Validate settings
   */
  validateSettings(settings: FoundationSettings): SettingsValidationResult {
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
      const brandingResult = BrandingSettingsSchema.safeParse(settings.branding);
      if (!brandingResult.success) {
        result.isValid = false;
        result.errors.branding = brandingResult.error.errors.map(e => e.message);
      }

      const generalResult = GeneralSettingsSchema.safeParse(settings.general);
      if (!generalResult.success) {
        result.isValid = false;
        result.errors.general = generalResult.error.errors.map(e => e.message);
      }

      const userManagementResult = UserManagementSettingsSchema.safeParse(settings.userManagement);
      if (!userManagementResult.success) {
        result.isValid = false;
        result.errors.userManagement = userManagementResult.error.errors.map(e => e.message);
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
  private addValidationWarnings(settings: FoundationSettings, result: SettingsValidationResult): void {
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

    // Warn about disabled 2FA
    if (!settings.userManagement.requireTwoFactorAuth) {
      result.warnings.userManagement = result.warnings.userManagement || [];
      result.warnings.userManagement.push('Two-factor authentication is recommended for enhanced security');
    }

    // Warn about open registration
    if (settings.general.allowRegistration) {
      result.warnings.general = result.warnings.general || [];
      result.warnings.general.push('Open registration is enabled - consider restricting access');
    }

    // Warn about high max users
    if (settings.general.maxUsersPerOrganization > 1000) {
      result.warnings.general = result.warnings.general || [];
      result.warnings.general.push('High user limit may impact performance');
    }

    // Warn about disabled backups
    if (!settings.system.backupEnabled) {
      result.warnings.system = result.warnings.system || [];
      result.warnings.system.push('Backups are disabled - this increases data loss risk');
    }
  }

  /**
   * Create a backup of current settings
   */
  createBackup(description?: string): SettingsBackup {
    const backup: SettingsBackup = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      settings: { ...this.settings },
      version: '1.0.0',
      description
    };

    this.backups.unshift(backup);
    
    // Keep only the most recent backups
    if (this.backups.length > this.maxBackups) {
      this.backups = this.backups.slice(0, this.maxBackups);
    }

    return backup;
  }

  /**
   * Restore settings from backup
   */
  async restoreFromBackup(backupId: string, userId?: string): Promise<boolean> {
    const backup = this.backups.find(b => b.id === backupId);
    if (!backup) {
      return false;
    }

    const validation = this.validateSettings(backup.settings);
    if (validation.isValid) {
      const oldSettings = { ...this.settings };
      this.settings = { ...backup.settings };
      
      // Emit restore event
      const event: SettingsUpdateEvent = {
        section: 'general', // Use general as the section for restore events
        key: 'restore',
        oldValue: oldSettings,
        newValue: this.settings,
        timestamp: new Date(),
        userId
      };
      
      this.emitUpdateEvent(event);
      
      // Clear validation cache
      this.validationCache.clear();
      
      // Persist changes
      await this.persistSettings();
      
      return true;
    }

    return false;
  }

  /**
   * Get all backups
   */
  getBackups(): SettingsBackup[] {
    return [...this.backups];
  }

  /**
   * Delete a backup
   */
  deleteBackup(backupId: string): boolean {
    const index = this.backups.findIndex(b => b.id === backupId);
    if (index > -1) {
      this.backups.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Reset settings to defaults
   */
  async resetToDefaults(userId?: string): Promise<void> {
    const oldSettings = { ...this.settings };
    
    // Create backup before reset
    this.createBackup('Reset to defaults');
    
    this.settings = { ...DEFAULT_FOUNDATION_SETTINGS };
    
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
    
    // Persist changes
    await this.persistSettings();
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
   * Persist settings (in real app, save to database)
   */
  private async persistSettings(): Promise<void> {
    // In a real application, this would save to database
    // For now, we'll just store in localStorage for persistence
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('foundation-settings', JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('Failed to persist settings:', error);
    }
  }

  /**
   * Load settings (in real app, load from database)
   */
  async loadSettings(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('foundation-settings');
        if (stored) {
          const parsedSettings = JSON.parse(stored);
          const validation = this.validateSettings(parsedSettings);
          if (validation.isValid) {
            this.settings = parsedSettings;
          }
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
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
let globalFoundationSettingsManager: FoundationSettingsManager | null = null;

/**
 * Get the global foundation settings manager instance
 */
export function getFoundationSettingsManager(initialSettings?: Partial<FoundationSettings>): FoundationSettingsManager {
  if (!globalFoundationSettingsManager) {
    globalFoundationSettingsManager = new FoundationSettingsManager(initialSettings);
    // Auto-load settings on first access
    globalFoundationSettingsManager.loadSettings();
  }
  return globalFoundationSettingsManager;
}

/**
 * Initialize foundation settings manager with server-side settings
 */
export function initializeFoundationSettings(settings: Partial<FoundationSettings>): FoundationSettingsManager {
  globalFoundationSettingsManager = new FoundationSettingsManager(settings);
  return globalFoundationSettingsManager;
}

// Utility functions
export function isMaintenanceModeEnabled(settings: FoundationSettings): boolean {
  return settings.general.maintenanceMode;
}

export function isDebugModeEnabled(settings: FoundationSettings): boolean {
  return settings.system.debugMode;
}

export function getPrimaryBrandColor(settings: FoundationSettings): string {
  return settings.branding.primaryColor;
}

export function getSecondaryBrandColor(settings: FoundationSettings): string {
  return settings.branding.secondaryColor;
}

export function getFontFamily(settings: FoundationSettings): string {
  return settings.branding.fontFamily;
}

export function getUserSessionTimeout(settings: FoundationSettings): number {
  return settings.userManagement.userSessionTimeout;
}

export function getMaxLoginAttempts(settings: FoundationSettings): number {
  return settings.userManagement.maxLoginAttempts;
}

export function isUserRegistrationAllowed(settings: FoundationSettings): boolean {
  return settings.general.allowRegistration;
}

export function isTwoFactorAuthRequired(settings: FoundationSettings): boolean {
  return settings.userManagement.requireTwoFactorAuth;
}

export function getApiRateLimit(settings: FoundationSettings): number {
  return settings.system.apiRateLimit;
}

export function getMaxFileSize(settings: FoundationSettings): number {
  return settings.system.maxFileSize;
}

export function getAllowedFileTypes(settings: FoundationSettings): string[] {
  return settings.system.allowedFileTypes;
}

// Re-export core settings for backward compatibility
export { getCoreSettingsManager } from '@/lib/admin/core-settings';
