/**
 * @fileoverview Runtime Brand Switching Service
 * @module lib/config/runtime-brand-switching
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-011.2.2: Implement Runtime Brand Switching
 * 
 * This module provides runtime brand switching capabilities that allow changing
 * brand configurations without application restart, with smooth transitions
 * and loading states.
 */

import { 
  brandConfigService, 
  EnhancedAppConfig, 
  BrandConfigOverride 
} from './brand-config-service';
import { 
  TenantBrandingConfig, 
  BrandColors, 
  TypographyConfig 
} from '@/lib/branding/tenant-types';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface BrandSwitchRequest {
  /** Target brand configuration ID */
  brandId: string;
  /** Brand configuration to switch to */
  brandConfig?: Partial<TenantBrandingConfig>;
  /** Brand preset to load */
  presetName?: string;
  /** Custom overrides to apply during switch */
  overrides?: BrandConfigOverride[];
  /** Switch options */
  options?: BrandSwitchOptions;
}

export interface BrandSwitchOptions {
  /** Whether to show loading state during switch */
  showLoading?: boolean;
  /** Transition duration in milliseconds */
  transitionDuration?: number;
  /** Whether to validate before switching */
  validateBeforeSwitch?: boolean;
  /** Whether to persist the switch */
  persistSwitch?: boolean;
  /** Whether to notify other components */
  notifyComponents?: boolean;
  /** Custom transition easing */
  transitionEasing?: string;
}

export interface BrandSwitchResult {
  /** Whether the switch was successful */
  success: boolean;
  /** New configuration after switch */
  config?: EnhancedAppConfig;
  /** Error message if switch failed */
  error?: string;
  /** Switch duration in milliseconds */
  duration?: number;
  /** Validation result if validation was performed */
  validation?: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  };
}

export interface BrandSwitchState {
  /** Current active brand ID */
  activeBrandId: string;
  /** Whether a brand switch is in progress */
  isSwitching: boolean;
  /** Switch progress (0-100) */
  switchProgress: number;
  /** Last switch result */
  lastSwitchResult?: BrandSwitchResult;
  /** Available brand configurations */
  availableBrands: BrandConfiguration[];
  /** Switch history */
  switchHistory: BrandSwitchHistory[];
}

export interface BrandConfiguration {
  /** Unique brand identifier */
  id: string;
  /** Brand name */
  name: string;
  /** Brand description */
  description?: string;
  /** Brand configuration */
  config: TenantBrandingConfig;
  /** Whether this is a preset brand */
  isPreset: boolean;
  /** Brand preview image URL */
  previewImage?: string;
  /** Brand tags */
  tags: string[];
  /** Last modified timestamp */
  lastModified: Date;
}

export interface BrandSwitchHistory {
  /** Switch timestamp */
  timestamp: Date;
  /** From brand ID */
  fromBrandId: string;
  /** To brand ID */
  toBrandId: string;
  /** Switch duration */
  duration: number;
  /** Whether switch was successful */
  success: boolean;
  /** Switch options used */
  options?: BrandSwitchOptions;
}

export interface BrandSwitchEvent {
  /** Event type */
  type: 'switch_started' | 'switch_progress' | 'switch_completed' | 'switch_failed';
  /** Event timestamp */
  timestamp: Date;
  /** Brand switch request */
  request: BrandSwitchRequest;
  /** Event data */
  data?: any;
}

// =============================================================================
// RUNTIME BRAND SWITCHING SERVICE
// =============================================================================

/**
 * Runtime brand switching service with smooth transitions and loading states
 */
export class RuntimeBrandSwitchingService {
  private static instance: RuntimeBrandSwitchingService;
  private switchState: BrandSwitchState;
  private eventListeners: Map<string, ((event: BrandSwitchEvent) => void)[]>;
  private switchQueue: BrandSwitchRequest[];
  private isProcessingQueue: boolean;

  private constructor() {
    this.switchState = {
      activeBrandId: 'default',
      isSwitching: false,
      switchProgress: 0,
      availableBrands: [],
      switchHistory: []
    };
    this.eventListeners = new Map();
    this.switchQueue = [];
    this.isProcessingQueue = false;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RuntimeBrandSwitchingService {
    if (!RuntimeBrandSwitchingService.instance) {
      RuntimeBrandSwitchingService.instance = new RuntimeBrandSwitchingService();
    }
    return RuntimeBrandSwitchingService.instance;
  }

  /**
   * Switch to a different brand configuration
   */
  public async switchBrand(request: BrandSwitchRequest): Promise<BrandSwitchResult> {
    const startTime = performance.now();
    
    try {
      // Emit switch started event
      this.emitEvent({
        type: 'switch_started',
        timestamp: new Date(),
        request
      });

      // Update switch state
      this.updateSwitchState({
        isSwitching: true,
        switchProgress: 0
      });

      // Validate request
      const validation = await this.validateSwitchRequest(request);
      if (!validation.isValid) {
        throw new Error(`Invalid switch request: ${validation.errors.join(', ')}`);
      }

      // Update progress
      this.updateSwitchProgress(25);

      // Load target brand configuration
      const targetConfig = await this.loadBrandConfiguration(request);
      this.updateSwitchProgress(50);

      // Apply brand configuration
      const newConfig = await this.applyBrandConfiguration(targetConfig, request.overrides);
      this.updateSwitchProgress(75);

      // Update CSS variables and theme
      await this.updateCSSVariables(newConfig);
      this.updateSwitchProgress(90);

      // Persist switch if requested
      if (request.options?.persistSwitch) {
        await this.persistBrandSwitch(request.brandId);
      }

      // Update switch state
      this.updateSwitchState({
        activeBrandId: request.brandId,
        isSwitching: false,
        switchProgress: 100
      });

      const duration = performance.now() - startTime;
      const result: BrandSwitchResult = {
        success: true,
        config: newConfig,
        duration,
        validation: request.options?.validateBeforeSwitch ? validation : undefined
      };

      // Add to history
      this.addToHistory({
        timestamp: new Date(),
        fromBrandId: this.switchState.activeBrandId,
        toBrandId: request.brandId,
        duration,
        success: true,
        options: request.options
      });

      // Emit switch completed event
      this.emitEvent({
        type: 'switch_completed',
        timestamp: new Date(),
        request,
        data: result
      });

      return result;

    } catch (error) {
      const duration = performance.now() - startTime;
      const result: BrandSwitchResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };

      // Update switch state
      this.updateSwitchState({
        isSwitching: false,
        switchProgress: 0
      });

      // Add to history
      this.addToHistory({
        timestamp: new Date(),
        fromBrandId: this.switchState.activeBrandId,
        toBrandId: request.brandId,
        duration,
        success: false,
        options: request.options
      });

      // Emit switch failed event
      this.emitEvent({
        type: 'switch_failed',
        timestamp: new Date(),
        request,
        data: result
      });

      return result;
    }
  }

  /**
   * Queue a brand switch request
   */
  public async queueBrandSwitch(request: BrandSwitchRequest): Promise<void> {
    this.switchQueue.push(request);
    
    if (!this.isProcessingQueue) {
      await this.processSwitchQueue();
    }
  }

  /**
   * Get current switch state
   */
  public getSwitchState(): BrandSwitchState {
    return { ...this.switchState };
  }

  /**
   * Get available brand configurations
   */
  public async getAvailableBrands(): Promise<BrandConfiguration[]> {
    if (this.switchState.availableBrands.length === 0) {
      await this.loadAvailableBrands();
    }
    return [...this.switchState.availableBrands];
  }

  /**
   * Get brand switch history
   */
  public getSwitchHistory(): BrandSwitchHistory[] {
    return [...this.switchState.switchHistory];
  }

  /**
   * Add event listener for brand switch events
   */
  public addEventListener(eventType: string, listener: (event: BrandSwitchEvent) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }

  /**
   * Remove event listener
   */
  public removeEventListener(eventType: string, listener: (event: BrandSwitchEvent) => void): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Cancel current brand switch
   */
  public cancelBrandSwitch(): boolean {
    if (this.switchState.isSwitching) {
      this.updateSwitchState({
        isSwitching: false,
        switchProgress: 0
      });
      return true;
    }
    return false;
  }

  /**
   * Reset to default brand
   */
  public async resetToDefaultBrand(): Promise<BrandSwitchResult> {
    return await this.switchBrand({
      brandId: 'default',
      options: {
        showLoading: true,
        transitionDuration: 300,
        validateBeforeSwitch: true,
        persistSwitch: true
      }
    });
  }

  // =============================================================================
  // PRIVATE METHODS
  // =============================================================================

  private async validateSwitchRequest(request: BrandSwitchRequest): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    score: number;
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate brand ID
    if (!request.brandId || request.brandId.trim() === '') {
      errors.push('Brand ID is required');
    }

    // Validate brand configuration if provided
    if (request.brandConfig) {
      if (!request.brandConfig.organizationName || request.brandConfig.organizationName.trim() === '') {
        errors.push('Organization name is required');
      }
      if (!request.brandConfig.appName || request.brandConfig.appName.trim() === '') {
        errors.push('App name is required');
      }
    }

    // Validate preset name if provided
    if (request.presetName && !this.isValidPresetName(request.presetName)) {
      errors.push(`Invalid preset name: ${request.presetName}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score: errors.length === 0 ? 100 : Math.max(0, 100 - errors.length * 20)
    };
  }

  private async loadBrandConfiguration(request: BrandSwitchRequest): Promise<TenantBrandingConfig> {
    // If custom config provided, use it
    if (request.brandConfig) {
      return {
        id: request.brandId,
        tenantId: 'runtime-switch',
        organizationName: request.brandConfig.organizationName || 'Custom Brand',
        appName: request.brandConfig.appName || 'Custom App',
        fullBrand: `${request.brandConfig.organizationName} — ${request.brandConfig.appName}`,
        shortBrand: request.brandConfig.appName || 'Custom App',
        navBrand: request.brandConfig.appName || 'Custom App',
        logoAlt: request.brandConfig.logoAlt || 'Custom logo',
        logoWidth: request.brandConfig.logoWidth || 32,
        logoHeight: request.brandConfig.logoHeight || 32,
        logoClassName: request.brandConfig.logoClassName || 'rounded-sm',
        logoShowAsImage: request.brandConfig.logoShowAsImage ?? true,
        logoInitials: request.brandConfig.logoInitials || 'CB',
        logoFallbackBgColor: request.brandConfig.logoFallbackBgColor || 'from-blue-500 to-blue-600',
        brandColors: request.brandConfig.brandColors || {
          primary: '#3b82f6',
          secondary: '#f59e0b',
          accent: '#10b981',
          background: '#ffffff',
          surface: '#f8fafc',
          text: '#1f2937',
          textSecondary: '#6b7280'
        },
        typographyConfig: request.brandConfig.typographyConfig || {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          fontSizes: {
            xs: '0.75rem',
            sm: '0.875rem',
            base: '1rem',
            lg: '1.125rem',
            xl: '1.25rem',
            '2xl': '1.5rem',
            '3xl': '1.875rem',
            '4xl': '2.25rem'
          }
        },
        presetName: request.presetName || 'custom',
        isCustom: true,
        validationStatus: 'valid',
        validationErrors: [],
        validationWarnings: [],
        brandTags: request.brandConfig.brandTags || ['custom'],
        brandVersion: '1.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Load from available brands
    const availableBrands = await this.getAvailableBrands();
    const brandConfig = availableBrands.find(brand => brand.id === request.brandId);
    
    if (!brandConfig) {
      throw new Error(`Brand configuration not found: ${request.brandId}`);
    }

    return brandConfig.config;
  }

  private async applyBrandConfiguration(
    brandConfig: TenantBrandingConfig, 
    overrides?: BrandConfigOverride[]
  ): Promise<EnhancedAppConfig> {
    // Get current enhanced configuration
    const currentConfig = await brandConfigService.getEnhancedConfig();
    
    // Create overrides for the new brand
    const brandOverrides: BrandConfigOverride[] = [
      {
        id: 'runtime-brand-primary',
        label: 'Runtime Brand Primary Color',
        description: 'Primary color from runtime brand switch',
        active: true,
        value: brandConfig.brandColors.primary,
        path: 'branding.tenant.brandColors.primary',
        priority: 300,
        source: 'runtime',
        userModifiable: false
      },
      {
        id: 'runtime-brand-secondary',
        label: 'Runtime Brand Secondary Color',
        description: 'Secondary color from runtime brand switch',
        active: true,
        value: brandConfig.brandColors.secondary,
        path: 'branding.tenant.brandColors.secondary',
        priority: 300,
        source: 'runtime',
        userModifiable: false
      },
      {
        id: 'runtime-brand-organization',
        label: 'Runtime Brand Organization Name',
        description: 'Organization name from runtime brand switch',
        active: true,
        value: brandConfig.organizationName,
        path: 'branding.tenant.organizationName',
        priority: 300,
        source: 'runtime',
        userModifiable: false
      },
      {
        id: 'runtime-brand-app',
        label: 'Runtime Brand App Name',
        description: 'App name from runtime brand switch',
        active: true,
        value: brandConfig.appName,
        path: 'branding.tenant.appName',
        priority: 300,
        source: 'runtime',
        userModifiable: false
      },
      {
        id: 'runtime-brand-font',
        label: 'Runtime Brand Font Family',
        description: 'Font family from runtime brand switch',
        active: true,
        value: brandConfig.typographyConfig.fontFamily,
        path: 'branding.tenant.typographyConfig.fontFamily',
        priority: 300,
        source: 'runtime',
        userModifiable: false
      }
    ];

    // Apply overrides
    for (const override of [...brandOverrides, ...(overrides || [])]) {
      await brandConfigService.applyBrandOverride(override);
    }

    // Clear cache and reload configuration
    brandConfigService.clearCache();
    const newConfig = await brandConfigService.getEnhancedConfig();

    return newConfig;
  }

  private async updateCSSVariables(config: EnhancedAppConfig): Promise<void> {
    const root = document.documentElement;
    const branding = config.branding.tenant;

    // Update CSS custom properties
    root.style.setProperty('--brand-primary', branding.brandColors.primary);
    root.style.setProperty('--brand-secondary', branding.brandColors.secondary);
    root.style.setProperty('--brand-accent', branding.brandColors.accent);
    root.style.setProperty('--brand-background', branding.brandColors.background);
    root.style.setProperty('--brand-surface', branding.brandColors.surface);
    root.style.setProperty('--brand-text', branding.brandColors.text);
    root.style.setProperty('--brand-text-secondary', branding.brandColors.textSecondary);
    root.style.setProperty('--brand-font-family', branding.typographyConfig.fontFamily);

    // Update font weights
    branding.typographyConfig.fontWeights.forEach((weight, index) => {
      root.style.setProperty(`--brand-font-weight-${index}`, weight.toString());
    });

    // Update font sizes
    Object.entries(branding.typographyConfig.fontSizes).forEach(([size, value]) => {
      root.style.setProperty(`--brand-font-size-${size}`, value);
    });

    // Trigger CSS transition if supported
    root.style.setProperty('--brand-transition-duration', '300ms');
    root.style.setProperty('--brand-transition-easing', 'cubic-bezier(0.4, 0, 0.2, 1)');
  }

  private async persistBrandSwitch(brandId: string): Promise<void> {
    // Store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('active-brand-id', brandId);
      localStorage.setItem('brand-switch-timestamp', new Date().toISOString());
    }
  }

  private async loadAvailableBrands(): Promise<void> {
    // Load default brands
    const defaultBrands: BrandConfiguration[] = [
      {
        id: 'default',
        name: 'Default Brand',
        description: 'Default brand configuration',
        config: {
          id: 'default',
          tenantId: 'default',
          organizationName: 'Your Organization',
          appName: 'Micro App',
          fullBrand: 'Your Organization — Micro App',
          shortBrand: 'Micro App',
          navBrand: 'Micro App',
          logoAlt: 'Default logo',
          logoWidth: 32,
          logoHeight: 32,
          logoClassName: 'rounded-sm',
          logoShowAsImage: true,
          logoInitials: 'YO',
          logoFallbackBgColor: 'from-blue-500 to-blue-600',
          brandColors: {
            primary: '#3b82f6',
            secondary: '#f59e0b',
            accent: '#10b981',
            background: '#ffffff',
            surface: '#f8fafc',
            text: '#1f2937',
            textSecondary: '#6b7280'
          },
          typographyConfig: {
            fontFamily: 'Inter',
            fontWeights: [400, 500, 600, 700],
            fontSizes: {
              xs: '0.75rem',
              sm: '0.875rem',
              base: '1rem',
              lg: '1.125rem',
              xl: '1.25rem',
              '2xl': '1.5rem',
              '3xl': '1.875rem',
              '4xl': '2.25rem'
            }
          },
          presetName: 'default',
          isCustom: false,
          validationStatus: 'valid',
          validationErrors: [],
          validationWarnings: [],
          brandTags: ['default'],
          brandVersion: '1.0.0',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        isPreset: true,
        tags: ['default'],
        lastModified: new Date()
      }
    ];

    this.switchState.availableBrands = defaultBrands;
  }

  private async processSwitchQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.switchQueue.length > 0) {
      const request = this.switchQueue.shift();
      if (request) {
        await this.switchBrand(request);
      }
    }

    this.isProcessingQueue = false;
  }

  private updateSwitchState(updates: Partial<BrandSwitchState>): void {
    this.switchState = { ...this.switchState, ...updates };
  }

  private updateSwitchProgress(progress: number): void {
    this.updateSwitchState({ switchProgress: progress });
    
    this.emitEvent({
      type: 'switch_progress',
      timestamp: new Date(),
      request: {} as BrandSwitchRequest,
      data: { progress }
    });
  }

  private addToHistory(historyEntry: BrandSwitchHistory): void {
    this.switchState.switchHistory.unshift(historyEntry);
    
    // Keep only last 50 entries
    if (this.switchState.switchHistory.length > 50) {
      this.switchState.switchHistory = this.switchState.switchHistory.slice(0, 50);
    }
  }

  private emitEvent(event: BrandSwitchEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in brand switch event listener:', error);
      }
    });
  }

  private isValidPresetName(presetName: string): boolean {
    const validPresets = ['default', 'corporate', 'startup', 'creative', 'minimal'];
    return validPresets.includes(presetName);
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export const runtimeBrandSwitchingService = RuntimeBrandSwitchingService.getInstance();

export default runtimeBrandSwitchingService;
