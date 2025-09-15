/**
 * @fileoverview Email Template Customization System
 * @module lib/branding/email-customization
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandNameConfig } from './logo-manager';
import { EmailStylingConfig } from './email-styling';

export interface EmailTemplateConfig {
  id: string;
  name: string;
  description: string;
  category: 'transactional' | 'marketing' | 'notification';
  variables: string[];
  customHtml?: string;
  customSubject?: string;
  styling?: Partial<EmailStylingConfig>;
  enabled: boolean;
}

export interface EmailCustomizationPreset {
  id: string;
  name: string;
  description: string;
  templates: EmailTemplateConfig[];
  styling: EmailStylingConfig;
  brandNames: BrandNameConfig;
}

export interface IEmailCustomizationManager {
  templates: Map<string, EmailTemplateConfig>;
  presets: Map<string, EmailCustomizationPreset>;
  activePreset?: string;
}

/**
 * Default email template configurations
 */
export const DEFAULT_EMAIL_TEMPLATES: EmailTemplateConfig[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    description: 'Welcome new users to the platform',
    category: 'transactional',
    variables: ['clientName', 'coachName'],
    enabled: true
  },
  {
    id: 'invite',
    name: 'Session Invitation',
    description: 'Invite users to a session',
    category: 'transactional',
    variables: ['sessionTitle', 'sessionDate', 'sessionLocation', 'stripeLink'],
    enabled: true
  },
  {
    id: 'confirmation',
    name: 'Session Confirmation',
    description: 'Confirm session attendance',
    category: 'transactional',
    variables: ['sessionTitle', 'sessionDate', 'sessionLocation'],
    enabled: true
  },
  {
    id: 'plan-ready',
    name: 'Plan Ready Notification',
    description: 'Notify when a plan is ready',
    category: 'transactional',
    variables: ['weekStart', 'viewUrl'],
    enabled: true
  },
  {
    id: 'check-in-reminder',
    name: 'Check-in Reminder',
    description: 'Remind users to check in',
    category: 'notification',
    variables: ['checkInLink'],
    enabled: true
  },
  {
    id: 'weekly-recap',
    name: 'Weekly Recap',
    description: 'Weekly progress summary',
    category: 'notification',
    variables: ['summaryHtml'],
    enabled: true
  },
  {
    id: 'newsletter',
    name: 'Newsletter',
    description: 'Regular newsletter updates',
    category: 'marketing',
    variables: ['campaignName', 'ctaText', 'ctaUrl', 'unsubscribeUrl'],
    enabled: true
  },
  {
    id: 'promotional',
    name: 'Promotional Offer',
    description: 'Promotional and discount emails',
    category: 'marketing',
    variables: ['offerCode', 'discountPercent', 'expirationDate', 'ctaText', 'ctaUrl', 'socialLinks'],
    enabled: true
  },
  {
    id: 'product-announcement',
    name: 'Product Announcement',
    description: 'New product or feature announcements',
    category: 'marketing',
    variables: ['campaignName', 'ctaText', 'ctaUrl', 'unsubscribeUrl'],
    enabled: true
  },
  {
    id: 'event-invitation',
    name: 'Event Invitation',
    description: 'Invite users to events',
    category: 'marketing',
    variables: ['campaignName', 'date', 'time', 'location', 'ctaText', 'ctaUrl', 'expirationDate'],
    enabled: true
  }
];

/**
 * Default email customization presets
 */
export const DEFAULT_EMAIL_PRESETS: EmailCustomizationPreset[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Clean, professional email styling for business use',
    templates: DEFAULT_EMAIL_TEMPLATES,
    styling: {
      brandNames: {} as BrandNameConfig,
      primaryColor: '#2563eb',
      secondaryColor: '#64748b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      linkColor: '#2563eb',
      borderColor: '#e5e7eb',
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    },
    brandNames: {} as BrandNameConfig
  },
  {
    id: 'modern',
    name: 'Modern',
    description: 'Modern, vibrant styling with gradients and bold colors',
    templates: DEFAULT_EMAIL_TEMPLATES,
    styling: {
      brandNames: {} as BrandNameConfig,
      primaryColor: '#8b5cf6',
      secondaryColor: '#6b7280',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      linkColor: '#8b5cf6',
      borderColor: '#e5e7eb',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    },
    brandNames: {} as BrandNameConfig
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Minimal, clean styling with subtle colors',
    templates: DEFAULT_EMAIL_TEMPLATES,
    styling: {
      brandNames: {} as BrandNameConfig,
      primaryColor: '#374151',
      secondaryColor: '#6b7280',
      backgroundColor: '#ffffff',
      textColor: '#111827',
      linkColor: '#374151',
      borderColor: '#d1d5db',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    brandNames: {} as BrandNameConfig
  },
  {
    id: 'warm',
    name: 'Warm',
    description: 'Warm, friendly styling with earth tones',
    templates: DEFAULT_EMAIL_TEMPLATES,
    styling: {
      brandNames: {} as BrandNameConfig,
      primaryColor: '#d97706',
      secondaryColor: '#78716c',
      backgroundColor: '#fef7ed',
      textColor: '#1c1917',
      linkColor: '#d97706',
      borderColor: '#fed7aa',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    },
    brandNames: {} as BrandNameConfig
  }
];

/**
 * Email customization manager
 */
export class EmailCustomizationManager {
  private templates: Map<string, EmailTemplateConfig>;
  private presets: Map<string, EmailCustomizationPreset>;
  private activePreset?: string;
  
  constructor() {
    this.templates = new Map();
    this.presets = new Map();
    this.initializeDefaults();
  }
  
  /**
   * Initialize default templates and presets
   */
  private initializeDefaults(): void {
    // Initialize default templates
    DEFAULT_EMAIL_TEMPLATES.forEach(template => {
      this.templates.set(template.id, template);
    });
    
    // Initialize default presets
    DEFAULT_EMAIL_PRESETS.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
    
    // Set default active preset
    this.activePreset = 'professional';
  }
  
  /**
   * Get all templates
   */
  getAllTemplates(): EmailTemplateConfig[] {
    return Array.from(this.templates.values());
  }
  
  /**
   * Get template by ID
   */
  getTemplate(id: string): EmailTemplateConfig | undefined {
    return this.templates.get(id);
  }
  
  /**
   * Update template configuration
   */
  updateTemplate(id: string, updates: Partial<EmailTemplateConfig>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;
    
    this.templates.set(id, { ...template, ...updates });
    return true;
  }
  
  /**
   * Create custom template
   */
  createTemplate(config: EmailTemplateConfig): boolean {
    if (this.templates.has(config.id)) return false;
    
    this.templates.set(config.id, config);
    return true;
  }
  
  /**
   * Delete template
   */
  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }
  
  /**
   * Get all presets
   */
  getAllPresets(): EmailCustomizationPreset[] {
    return Array.from(this.presets.values());
  }
  
  /**
   * Get preset by ID
   */
  getPreset(id: string): EmailCustomizationPreset | undefined {
    return this.presets.get(id);
  }
  
  /**
   * Create custom preset
   */
  createPreset(preset: EmailCustomizationPreset): boolean {
    if (this.presets.has(preset.id)) return false;
    
    this.presets.set(preset.id, preset);
    return true;
  }
  
  /**
   * Update preset
   */
  updatePreset(id: string, updates: Partial<EmailCustomizationPreset>): boolean {
    const preset = this.presets.get(id);
    if (!preset) return false;
    
    this.presets.set(id, { ...preset, ...updates });
    return true;
  }
  
  /**
   * Delete preset
   */
  deletePreset(id: string): boolean {
    return this.presets.delete(id);
  }
  
  /**
   * Set active preset
   */
  setActivePreset(id: string): boolean {
    if (!this.presets.has(id)) return false;
    
    this.activePreset = id;
    return true;
  }
  
  /**
   * Get active preset
   */
  getActivePreset(): EmailCustomizationPreset | undefined {
    if (!this.activePreset) return undefined;
    return this.presets.get(this.activePreset);
  }
  
  /**
   * Get templates by category
   */
  getTemplatesByCategory(category: 'transactional' | 'marketing' | 'notification'): EmailTemplateConfig[] {
    return Array.from(this.templates.values()).filter(template => template.category === category);
  }
  
  /**
   * Get enabled templates
   */
  getEnabledTemplates(): EmailTemplateConfig[] {
    return Array.from(this.templates.values()).filter(template => template.enabled);
  }
  
  /**
   * Export customization configuration
   */
  exportConfiguration(): {
    templates: EmailTemplateConfig[];
    presets: EmailCustomizationPreset[];
    activePreset?: string;
  } {
    return {
      templates: this.getAllTemplates(),
      presets: this.getAllPresets(),
      activePreset: this.activePreset
    };
  }
  
  /**
   * Import customization configuration
   */
  importConfiguration(config: {
    templates?: EmailTemplateConfig[];
    presets?: EmailCustomizationPreset[];
    activePreset?: string;
  }): boolean {
    try {
      if (config.templates) {
        this.templates.clear();
        config.templates.forEach(template => {
          this.templates.set(template.id, template);
        });
      }
      
      if (config.presets) {
        this.presets.clear();
        config.presets.forEach(preset => {
          this.presets.set(preset.id, preset);
        });
      }
      
      if (config.activePreset) {
        this.activePreset = config.activePreset;
      }
      
      return true;
    } catch (error) {
      console.error('Failed to import email customization configuration:', error);
      return false;
    }
  }
}

/**
 * Global email customization manager instance
 */
export const emailCustomizationManager = new EmailCustomizationManager();
