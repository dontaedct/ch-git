/**
 * @fileoverview Dynamic Logo and Brand Name Management System
 * @module lib/branding/logo-manager
 * @author OSS Hero System
 * @version 1.0.0
 */

import { BrandConfig } from './types';

export interface LogoConfig {
  /** Logo image URL or path */
  src: string;
  /** Alt text for accessibility */
  alt: string;
  /** Logo width in pixels */
  width: number;
  /** Logo height in pixels */
  height: number;
  /** CSS classes for styling */
  className?: string;
  /** Whether to show logo as image or fallback to initials */
  showAsImage: boolean;
  /** Fallback initials if logo fails to load */
  initials: string;
  /** Fallback background color for initials */
  fallbackBgColor: string;
}

export interface BrandNameConfig {
  /** Full organization name */
  organizationName: string;
  /** Short app name */
  appName: string;
  /** Combined brand name */
  fullBrand: string;
  /** Short brand name for mobile */
  shortBrand: string;
  /** Navigation brand name */
  navBrand: string;
}

export interface DynamicBrandConfig {
  logo: LogoConfig;
  brandName: BrandNameConfig;
  /** Whether this is a custom brand or preset */
  isCustom: boolean;
  /** Brand preset name if applicable */
  presetName?: string;
}

/**
 * Default brand configuration
 */
export const DEFAULT_BRAND_CONFIG: DynamicBrandConfig = {
  logo: {
    src: '/another-level-logo.png',
    alt: 'Your Organization logo',
    width: 28,
    height: 28,
    className: 'rounded-sm border border-gray-200',
    showAsImage: true,
    initials: 'CH',
    fallbackBgColor: 'from-blue-600 to-indigo-600',
  },
  brandName: {
    organizationName: 'Your Organization',
    appName: 'Micro App',
    fullBrand: 'Your Organization — Micro App',
    shortBrand: 'Micro App',
    navBrand: 'Micro App',
  },
  isCustom: false,
  presetName: 'default',
};

/**
 * Brand preset configurations for common industries
 */
export const BRAND_PRESETS: Record<string, DynamicBrandConfig> = {
  default: DEFAULT_BRAND_CONFIG,
  
  tech: {
    logo: {
      src: '/logos/tech-logo.png',
      alt: 'Tech Company logo',
      width: 28,
      height: 28,
      className: 'rounded-sm border border-gray-200',
      showAsImage: true,
      initials: 'TC',
      fallbackBgColor: 'from-green-600 to-emerald-600',
    },
    brandName: {
      organizationName: 'Tech Company',
      appName: 'Tech App',
      fullBrand: 'Tech Company — Tech App',
      shortBrand: 'Tech App',
      navBrand: 'Tech App',
    },
    isCustom: false,
    presetName: 'tech',
  },
  
  corporate: {
    logo: {
      src: '/logos/corporate-logo.png',
      alt: 'Corporate logo',
      width: 28,
      height: 28,
      className: 'rounded-sm border border-gray-200',
      showAsImage: true,
      initials: 'CO',
      fallbackBgColor: 'from-purple-600 to-violet-600',
    },
    brandName: {
      organizationName: 'Corporate Inc',
      appName: 'Corporate App',
      fullBrand: 'Corporate Inc — Corporate App',
      shortBrand: 'Corporate App',
      navBrand: 'Corporate App',
    },
    isCustom: false,
    presetName: 'corporate',
  },
  
  startup: {
    logo: {
      src: '/logos/startup-logo.png',
      alt: 'Startup logo',
      width: 28,
      height: 28,
      className: 'rounded-sm border border-gray-200',
      showAsImage: true,
      initials: 'ST',
      fallbackBgColor: 'from-orange-600 to-red-600',
    },
    brandName: {
      organizationName: 'Startup Co',
      appName: 'Startup App',
      fullBrand: 'Startup Co — Startup App',
      shortBrand: 'Startup App',
      navBrand: 'Startup App',
    },
    isCustom: false,
    presetName: 'startup',
  },
};

/**
 * Logo Manager Class
 */
export class LogoManager {
  private currentConfig: DynamicBrandConfig;
  private listeners: Array<(config: DynamicBrandConfig) => void> = [];

  constructor(initialConfig?: DynamicBrandConfig) {
    this.currentConfig = initialConfig || DEFAULT_BRAND_CONFIG;
  }

  /**
   * Get current brand configuration
   */
  getCurrentConfig(): DynamicBrandConfig {
    return { ...this.currentConfig };
  }

  /**
   * Update brand configuration
   */
  updateConfig(newConfig: Partial<DynamicBrandConfig>): void {
    this.currentConfig = {
      ...this.currentConfig,
      ...newConfig,
      logo: {
        ...this.currentConfig.logo,
        ...newConfig.logo,
      },
      brandName: {
        ...this.currentConfig.brandName,
        ...newConfig.brandName,
      },
    };
    
    this.notifyListeners();
  }

  /**
   * Load brand preset
   */
  loadPreset(presetName: string): boolean {
    const preset = BRAND_PRESETS[presetName];
    if (!preset) {
      console.warn(`Brand preset '${presetName}' not found`);
      return false;
    }

    this.currentConfig = { ...preset };
    this.notifyListeners();
    return true;
  }

  /**
   * Create custom brand configuration
   */
  createCustomBrand(config: Partial<DynamicBrandConfig>): DynamicBrandConfig {
    const customConfig: DynamicBrandConfig = {
      logo: {
        ...DEFAULT_BRAND_CONFIG.logo,
        ...config.logo,
      },
      brandName: {
        ...DEFAULT_BRAND_CONFIG.brandName,
        ...config.brandName,
      },
      isCustom: true,
      ...config,
    };

    return customConfig;
  }

  /**
   * Upload and set custom logo
   */
  async uploadLogo(file: File): Promise<string> {
    // In a real implementation, this would upload to a storage service
    // For now, we'll create a data URL
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Set custom logo from URL
   */
  setCustomLogo(src: string, alt?: string): void {
    this.updateConfig({
      logo: {
        ...this.currentConfig.logo,
        src,
        alt: alt || `${this.currentConfig.brandName.organizationName} logo`,
        showAsImage: true,
      },
    });
  }

  /**
   * Set brand initials (fallback when no logo)
   */
  setBrandInitials(initials: string, bgColor?: string): void {
    this.updateConfig({
      logo: {
        ...this.currentConfig.logo,
        initials: initials.toUpperCase(),
        fallbackBgColor: bgColor || this.currentConfig.logo.fallbackBgColor,
        showAsImage: false,
      },
    });
  }

  /**
   * Update brand names
   */
  updateBrandNames(brandName: Partial<BrandNameConfig>): void {
    this.updateConfig({
      brandName: {
        ...this.currentConfig.brandName,
        ...brandName,
      },
    });
  }

  /**
   * Subscribe to brand configuration changes
   */
  subscribe(listener: (config: DynamicBrandConfig) => void): () => void {
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
   * Notify all listeners of configuration changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => {
      try {
        listener(this.getCurrentConfig());
      } catch (error) {
        console.error('Error in brand configuration listener:', error);
      }
    });
  }

  /**
   * Validate brand configuration
   */
  validateConfig(config: DynamicBrandConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate logo configuration
    if (!config.logo.src && !config.logo.initials) {
      errors.push('Logo must have either src or initials');
    }

    if (config.logo.initials && config.logo.initials.length > 3) {
      errors.push('Brand initials should be 3 characters or less');
    }

    // Validate brand names
    if (!config.brandName.organizationName.trim()) {
      errors.push('Organization name is required');
    }

    if (!config.brandName.appName.trim()) {
      errors.push('App name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Export brand configuration
   */
  exportConfig(): string {
    return JSON.stringify(this.currentConfig, null, 2);
  }

  /**
   * Import brand configuration
   */
  importConfig(configJson: string): boolean {
    try {
      const config = JSON.parse(configJson) as DynamicBrandConfig;
      const validation = this.validateConfig(config);
      
      if (!validation.isValid) {
        console.error('Invalid brand configuration:', validation.errors);
        return false;
      }

      this.currentConfig = config;
      this.notifyListeners();
      return true;
    } catch (error) {
      console.error('Error importing brand configuration:', error);
      return false;
    }
  }
}

/**
 * Global logo manager instance
 */
export const logoManager = new LogoManager();

/**
 * Utility functions for brand management
 */
export const BrandUtils = {
  /**
   * Generate initials from organization name
   */
  generateInitials(organizationName: string): string {
    return organizationName
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 3);
  },

  /**
   * Generate brand name variations
   */
  generateBrandNames(organizationName: string, appName: string): BrandNameConfig {
    return {
      organizationName,
      appName,
      fullBrand: `${organizationName} — ${appName}`,
      shortBrand: appName,
      navBrand: appName,
    };
  },

  /**
   * Get available brand presets
   */
  getAvailablePresets(): string[] {
    return Object.keys(BRAND_PRESETS);
  },

  /**
   * Check if preset exists
   */
  presetExists(presetName: string): boolean {
    return presetName in BRAND_PRESETS;
  },
};
