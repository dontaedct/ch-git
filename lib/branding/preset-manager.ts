/**
 * @fileoverview HT-011.1.5: Brand Preset System Implementation
 * @module lib/branding/preset-manager
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-011.1.5 - Implement Brand Preset System
 * Focus: Create industry-specific templates for rapid client onboarding
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (branding system enhancement)
 */

import { BrandPalette } from '../design-tokens/multi-brand-generator';
import { DynamicBrandConfig, LogoConfig, BrandNameConfig } from './logo-manager';

/**
 * Industry-specific brand preset configuration
 */
export interface BrandPreset {
  /** Unique preset identifier */
  id: string;
  /** Preset display name */
  name: string;
  /** Preset description */
  description: string;
  /** Industry category */
  industry: string;
  /** Brand color palette */
  palette: BrandPalette;
  /** Logo configuration */
  logo: LogoConfig;
  /** Brand name configuration */
  brandName: BrandNameConfig;
  /** Typography preferences */
  typography: {
    fontFamily: string;
    fontWeights: number[];
    displayName: string;
  };
  /** Additional brand elements */
  elements: {
    favicon?: string;
    ogImage?: string;
    socialColors?: {
      primary: string;
      secondary: string;
    };
  };
  /** Preset metadata */
  metadata: {
    isSystem: boolean;
    isPublic: boolean;
    usageCount: number;
    createdAt: Date;
    updatedAt: Date;
    tags: string[];
  };
}

/**
 * Brand preset customization options
 */
export interface PresetCustomization {
  /** Override organization name */
  organizationName?: string;
  /** Override app name */
  appName?: string;
  /** Override primary color */
  primaryColor?: string;
  /** Override secondary color */
  secondaryColor?: string;
  /** Override font family */
  fontFamily?: string;
  /** Custom logo URL */
  customLogo?: string;
  /** Additional customizations */
  customizations?: Record<string, any>;
}

/**
 * Brand preset manager class
 */
export class BrandPresetManager {
  private presets: Map<string, BrandPreset> = new Map();
  private customizations: Map<string, PresetCustomization> = new Map();

  constructor() {
    this.initializeSystemPresets();
  }

  /**
   * Initialize system presets for common industries
   */
  private initializeSystemPresets(): void {
    const systemPresets: BrandPreset[] = [
      {
        id: 'tech-startup',
        name: 'Tech Startup',
        description: 'Modern, innovative branding for technology startups',
        industry: 'Technology',
        palette: {
          name: 'Tech Startup',
          primary: '#10b981',
          secondary: '#059669',
          description: 'Modern tech green theme'
        },
        logo: {
          src: '/logos/tech-startup-logo.png',
          alt: 'Tech Startup logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'TS',
          fallbackBgColor: 'from-green-600 to-emerald-600'
        },
        brandName: {
          organizationName: 'Tech Startup',
          appName: 'Innovation Hub',
          fullBrand: 'Tech Startup — Innovation Hub',
          shortBrand: 'Innovation Hub',
          navBrand: 'Innovation Hub'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/tech-startup.ico',
          ogImage: '/og-images/tech-startup.png',
          socialColors: {
            primary: '#10b981',
            secondary: '#059669'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['tech', 'startup', 'modern', 'green']
        }
      },
      {
        id: 'corporate-finance',
        name: 'Corporate Finance',
        description: 'Professional, trustworthy branding for financial services',
        industry: 'Finance',
        palette: {
          name: 'Corporate Finance',
          primary: '#1e40af',
          secondary: '#1e3a8a',
          description: 'Professional finance navy theme'
        },
        logo: {
          src: '/logos/corporate-finance-logo.png',
          alt: 'Corporate Finance logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'CF',
          fallbackBgColor: 'from-blue-800 to-indigo-800'
        },
        brandName: {
          organizationName: 'Corporate Finance',
          appName: 'Financial Services',
          fullBrand: 'Corporate Finance — Financial Services',
          shortBrand: 'Financial Services',
          navBrand: 'Financial Services'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/corporate-finance.ico',
          ogImage: '/og-images/corporate-finance.png',
          socialColors: {
            primary: '#1e40af',
            secondary: '#1e3a8a'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['finance', 'corporate', 'professional', 'navy']
        }
      },
      {
        id: 'healthcare-wellness',
        name: 'Healthcare & Wellness',
        description: 'Caring, trustworthy branding for healthcare providers',
        industry: 'Healthcare',
        palette: {
          name: 'Healthcare & Wellness',
          primary: '#14b8a6',
          secondary: '#0d9488',
          description: 'Healthcare teal theme'
        },
        logo: {
          src: '/logos/healthcare-wellness-logo.png',
          alt: 'Healthcare & Wellness logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'HW',
          fallbackBgColor: 'from-teal-600 to-cyan-600'
        },
        brandName: {
          organizationName: 'Healthcare & Wellness',
          appName: 'Health Portal',
          fullBrand: 'Healthcare & Wellness — Health Portal',
          shortBrand: 'Health Portal',
          navBrand: 'Health Portal'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/healthcare-wellness.ico',
          ogImage: '/og-images/healthcare-wellness.png',
          socialColors: {
            primary: '#14b8a6',
            secondary: '#0d9488'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['healthcare', 'wellness', 'caring', 'teal']
        }
      },
      {
        id: 'creative-agency',
        name: 'Creative Agency',
        description: 'Bold, artistic branding for creative agencies',
        industry: 'Creative',
        palette: {
          name: 'Creative Agency',
          primary: '#ec4899',
          secondary: '#db2777',
          description: 'Creative pink theme'
        },
        logo: {
          src: '/logos/creative-agency-logo.png',
          alt: 'Creative Agency logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'CA',
          fallbackBgColor: 'from-pink-600 to-rose-600'
        },
        brandName: {
          organizationName: 'Creative Agency',
          appName: 'Design Studio',
          fullBrand: 'Creative Agency — Design Studio',
          shortBrand: 'Design Studio',
          navBrand: 'Design Studio'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/creative-agency.ico',
          ogImage: '/og-images/creative-agency.png',
          socialColors: {
            primary: '#ec4899',
            secondary: '#db2777'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['creative', 'agency', 'design', 'pink']
        }
      },
      {
        id: 'ecommerce-retail',
        name: 'E-commerce & Retail',
        description: 'Modern, conversion-focused branding for retail businesses',
        industry: 'Retail',
        palette: {
          name: 'E-commerce & Retail',
          primary: '#f59e0b',
          secondary: '#d97706',
          description: 'Energetic retail orange theme'
        },
        logo: {
          src: '/logos/ecommerce-retail-logo.png',
          alt: 'E-commerce & Retail logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'ER',
          fallbackBgColor: 'from-orange-600 to-amber-600'
        },
        brandName: {
          organizationName: 'E-commerce & Retail',
          appName: 'Online Store',
          fullBrand: 'E-commerce & Retail — Online Store',
          shortBrand: 'Online Store',
          navBrand: 'Online Store'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/ecommerce-retail.ico',
          ogImage: '/og-images/ecommerce-retail.png',
          socialColors: {
            primary: '#f59e0b',
            secondary: '#d97706'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['ecommerce', 'retail', 'shopping', 'orange']
        }
      },
      {
        id: 'education-learning',
        name: 'Education & Learning',
        description: 'Inspiring, educational branding for learning platforms',
        industry: 'Education',
        palette: {
          name: 'Education & Learning',
          primary: '#8b5cf6',
          secondary: '#7c3aed',
          description: 'Educational purple theme'
        },
        logo: {
          src: '/logos/education-learning-logo.png',
          alt: 'Education & Learning logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'EL',
          fallbackBgColor: 'from-purple-600 to-violet-600'
        },
        brandName: {
          organizationName: 'Education & Learning',
          appName: 'Learning Platform',
          fullBrand: 'Education & Learning — Learning Platform',
          shortBrand: 'Learning Platform',
          navBrand: 'Learning Platform'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/education-learning.ico',
          ogImage: '/og-images/education-learning.png',
          socialColors: {
            primary: '#8b5cf6',
            secondary: '#7c3aed'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['education', 'learning', 'inspiring', 'purple']
        }
      },
      {
        id: 'minimal-clean',
        name: 'Minimal & Clean',
        description: 'Clean, minimal branding for modern businesses',
        industry: 'General',
        palette: {
          name: 'Minimal & Clean',
          primary: '#6b7280',
          secondary: '#4b5563',
          description: 'Minimal gray theme'
        },
        logo: {
          src: '/logos/minimal-clean-logo.png',
          alt: 'Minimal & Clean logo',
          width: 28,
          height: 28,
          className: 'rounded-sm border border-gray-200',
          showAsImage: true,
          initials: 'MC',
          fallbackBgColor: 'from-gray-600 to-slate-600'
        },
        brandName: {
          organizationName: 'Minimal & Clean',
          appName: 'Modern App',
          fullBrand: 'Minimal & Clean — Modern App',
          shortBrand: 'Modern App',
          navBrand: 'Modern App'
        },
        typography: {
          fontFamily: 'Inter',
          fontWeights: [400, 500, 600, 700],
          displayName: 'Inter'
        },
        elements: {
          favicon: '/favicons/minimal-clean.ico',
          ogImage: '/og-images/minimal-clean.png',
          socialColors: {
            primary: '#6b7280',
            secondary: '#4b5563'
          }
        },
        metadata: {
          isSystem: true,
          isPublic: true,
          usageCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          tags: ['minimal', 'clean', 'modern', 'gray']
        }
      }
    ];

    // Add all system presets
    systemPresets.forEach(preset => {
      this.presets.set(preset.id, preset);
    });
  }

  /**
   * Get all available presets
   */
  getAvailablePresets(): BrandPreset[] {
    return Array.from(this.presets.values());
  }

  /**
   * Get presets by industry
   */
  getPresetsByIndustry(industry: string): BrandPreset[] {
    return this.getAvailablePresets().filter(preset => 
      preset.industry.toLowerCase() === industry.toLowerCase()
    );
  }

  /**
   * Get preset by ID
   */
  getPreset(presetId: string): BrandPreset | null {
    return this.presets.get(presetId) || null;
  }

  /**
   * Load preset with customizations
   */
  loadPreset(presetId: string, customizations?: PresetCustomization): DynamicBrandConfig | null {
    const preset = this.getPreset(presetId);
    if (!preset) {
      console.warn(`Preset '${presetId}' not found`);
      return null;
    }

    // Apply customizations
    const customizedPreset = this.applyCustomizations(preset, customizations);

    // Convert to DynamicBrandConfig
    const config: DynamicBrandConfig = {
      logo: {
        ...customizedPreset.logo,
        src: customizations?.customLogo || customizedPreset.logo.src,
        alt: `${customizedPreset.brandName.organizationName} logo`
      },
      brandName: {
        ...customizedPreset.brandName,
        organizationName: customizations?.organizationName || customizedPreset.brandName.organizationName,
        appName: customizations?.appName || customizedPreset.brandName.appName,
        fullBrand: `${customizations?.organizationName || customizedPreset.brandName.organizationName} — ${customizations?.appName || customizedPreset.brandName.appName}`,
        shortBrand: customizations?.appName || customizedPreset.brandName.appName,
        navBrand: customizations?.appName || customizedPreset.brandName.appName
      },
      isCustom: false,
      presetName: presetId
    };

    // Update usage count
    preset.metadata.usageCount++;
    preset.metadata.updatedAt = new Date();

    return config;
  }

  /**
   * Apply customizations to a preset
   */
  private applyCustomizations(preset: BrandPreset, customizations?: PresetCustomization): BrandPreset {
    if (!customizations) return preset;

    const customized = { ...preset };

    // Apply color customizations
    if (customizations.primaryColor) {
      customized.palette = {
        ...customized.palette,
        primary: customizations.primaryColor
      };
    }

    if (customizations.secondaryColor) {
      customized.palette = {
        ...customized.palette,
        secondary: customizations.secondaryColor
      };
    }

    // Apply typography customizations
    if (customizations.fontFamily) {
      customized.typography = {
        ...customized.typography,
        fontFamily: customizations.fontFamily,
        displayName: customizations.fontFamily
      };
    }

    // Apply additional customizations
    if (customizations.customizations) {
      Object.assign(customized, customizations.customizations);
    }

    return customized;
  }

  /**
   * Create custom preset
   */
  createCustomPreset(preset: Omit<BrandPreset, 'id' | 'metadata'>): BrandPreset {
    const id = `custom-${Date.now()}`;
    const customPreset: BrandPreset = {
      ...preset,
      id,
      metadata: {
        isSystem: false,
        isPublic: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: [...(preset.metadata?.tags || []), 'custom']
      }
    };

    this.presets.set(id, customPreset);
    return customPreset;
  }

  /**
   * Update preset
   */
  updatePreset(presetId: string, updates: Partial<BrandPreset>): boolean {
    const preset = this.getPreset(presetId);
    if (!preset) return false;

    const updatedPreset = {
      ...preset,
      ...updates,
      metadata: {
        ...preset.metadata,
        updatedAt: new Date()
      }
    };

    this.presets.set(presetId, updatedPreset);
    return true;
  }

  /**
   * Delete preset (only custom presets)
   */
  deletePreset(presetId: string): boolean {
    const preset = this.getPreset(presetId);
    if (!preset || preset.metadata.isSystem) return false;

    return this.presets.delete(presetId);
  }

  /**
   * Search presets by tags or name
   */
  searchPresets(query: string): BrandPreset[] {
    const lowercaseQuery = query.toLowerCase();
    return this.getAvailablePresets().filter(preset =>
      preset.name.toLowerCase().includes(lowercaseQuery) ||
      preset.description.toLowerCase().includes(lowercaseQuery) ||
      preset.industry.toLowerCase().includes(lowercaseQuery) ||
      preset.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  /**
   * Get preset recommendations based on industry
   */
  getRecommendations(industry: string, limit: number = 3): BrandPreset[] {
    const industryPresets = this.getPresetsByIndustry(industry);
    const otherPresets = this.getAvailablePresets().filter(preset => 
      preset.industry.toLowerCase() !== industry.toLowerCase()
    );

    // Return industry-specific presets first, then others
    return [...industryPresets, ...otherPresets].slice(0, limit);
  }

  /**
   * Export preset configuration
   */
  exportPreset(presetId: string): string | null {
    const preset = this.getPreset(presetId);
    if (!preset) return null;

    return JSON.stringify(preset, null, 2);
  }

  /**
   * Import preset configuration
   */
  importPreset(presetJson: string): BrandPreset | null {
    try {
      const preset = JSON.parse(presetJson) as BrandPreset;
      
      // Validate preset structure
      if (!preset.id || !preset.name || !preset.palette) {
        throw new Error('Invalid preset structure');
      }

      // Generate new ID for imported preset
      const importedPreset = {
        ...preset,
        id: `imported-${Date.now()}`,
        metadata: {
          ...preset.metadata,
          isSystem: false,
          isPublic: false,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };

      this.presets.set(importedPreset.id, importedPreset);
      return importedPreset;
    } catch (error) {
      console.error('Error importing preset:', error);
      return null;
    }
  }

  /**
   * Get preset statistics
   */
  getPresetStats(): {
    totalPresets: number;
    systemPresets: number;
    customPresets: number;
    industryCounts: Record<string, number>;
    mostUsedPresets: Array<{ id: string; name: string; usageCount: number }>;
  } {
    const presets = this.getAvailablePresets();
    const industryCounts: Record<string, number> = {};
    const mostUsedPresets = presets
      .sort((a, b) => b.metadata.usageCount - a.metadata.usageCount)
      .slice(0, 5)
      .map(preset => ({
        id: preset.id,
        name: preset.name,
        usageCount: preset.metadata.usageCount
      }));

    presets.forEach(preset => {
      industryCounts[preset.industry] = (industryCounts[preset.industry] || 0) + 1;
    });

    return {
      totalPresets: presets.length,
      systemPresets: presets.filter(p => p.metadata.isSystem).length,
      customPresets: presets.filter(p => !p.metadata.isSystem).length,
      industryCounts,
      mostUsedPresets
    };
  }
}

/**
 * Global brand preset manager instance
 */
export const brandPresetManager = new BrandPresetManager();

/**
 * Utility functions for brand preset management
 */
export const BrandPresetUtils = {
  /**
   * Generate preset preview data
   */
  generatePreview(preset: BrandPreset): {
    colors: string[];
    logo: string;
    name: string;
    industry: string;
  } {
    return {
      colors: [preset.palette.primary, preset.palette.secondary || preset.palette.primary],
      logo: preset.logo.src,
      name: preset.name,
      industry: preset.industry
    };
  },

  /**
   * Validate preset configuration
   */
  validatePreset(preset: BrandPreset): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!preset.id) errors.push('Preset ID is required');
    if (!preset.name) errors.push('Preset name is required');
    if (!preset.palette?.primary) errors.push('Primary color is required');
    if (!preset.brandName?.organizationName) errors.push('Organization name is required');
    if (!preset.brandName?.appName) errors.push('App name is required');

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  /**
   * Get industry categories
   */
  getIndustryCategories(): string[] {
    return [
      'Technology',
      'Finance',
      'Healthcare',
      'Creative',
      'Retail',
      'Education',
      'General'
    ];
  },

  /**
   * Generate preset from existing brand configuration
   */
  generatePresetFromConfig(config: DynamicBrandConfig, name: string, industry: string): BrandPreset {
    return {
      id: `generated-${Date.now()}`,
      name,
      description: `Generated preset from ${name}`,
      industry,
      palette: {
        name,
        primary: '#3b82f6', // Default primary color
        description: `Generated palette for ${name}`
      },
      logo: config.logo,
      brandName: config.brandName,
      typography: {
        fontFamily: 'Inter',
        fontWeights: [400, 500, 600, 700],
        displayName: 'Inter'
      },
      elements: {},
      metadata: {
        isSystem: false,
        isPublic: false,
        usageCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        tags: ['generated', industry.toLowerCase()]
      }
    };
  }
};
