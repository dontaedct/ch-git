/**
 * Service Package Data Management System
 *
 * Comprehensive system for managing service packages including CRUD operations,
 * validation, categorization, and business logic for consultation services.
 */

import type { ServicePackage } from '@/lib/ai/consultation-generator';

export interface ServicePackageCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  sort_order: number;
}

export interface ServicePackageTemplate {
  id: string;
  name: string;
  description: string;
  default_content: Partial<ServicePackage>;
  category_id: string;
}

export interface ServicePackageValidation {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ServicePackageStats {
  total_packages: number;
  by_tier: Record<string, number>;
  by_category: Record<string, number>;
  by_industry: Record<string, number>;
  most_recommended: ServicePackage[];
  least_used: ServicePackage[];
}

/**
 * Service package management with comprehensive CRUD operations
 */
export class ServicePackageManager {
  private packages: Map<string, ServicePackage> = new Map();
  private categories: Map<string, ServicePackageCategory> = new Map();
  private templates: Map<string, ServicePackageTemplate> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  /**
   * Get all service packages
   */
  getAllPackages(): ServicePackage[] {
    return Array.from(this.packages.values());
  }

  /**
   * Get service package by ID
   */
  getPackageById(id: string): ServicePackage | null {
    return this.packages.get(id) || null;
  }

  /**
   * Get packages by category
   */
  getPackagesByCategory(categoryId: string): ServicePackage[] {
    return this.getAllPackages().filter(pkg => pkg.category === categoryId);
  }

  /**
   * Get packages by tier
   */
  getPackagesByTier(tier: 'foundation' | 'growth' | 'enterprise'): ServicePackage[] {
    return this.getAllPackages().filter(pkg => pkg.tier === tier);
  }

  /**
   * Get packages by industry tags
   */
  getPackagesByIndustry(industry: string): ServicePackage[] {
    return this.getAllPackages().filter(pkg =>
      pkg.industry_tags.some(tag =>
        tag.toLowerCase().includes(industry.toLowerCase())
      )
    );
  }

  /**
   * Create new service package
   */
  createPackage(packageData: Omit<ServicePackage, 'id'>): ServicePackage {
    const id = this.generatePackageId(packageData.title);
    const newPackage: ServicePackage = {
      id,
      ...packageData
    };

    const validation = this.validatePackage(newPackage);
    if (!validation.is_valid) {
      throw new Error(`Package validation failed: ${validation.errors.join(', ')}`);
    }

    this.packages.set(id, newPackage);
    return newPackage;
  }

  /**
   * Update existing service package
   */
  updatePackage(id: string, updates: Partial<ServicePackage>): ServicePackage {
    const existingPackage = this.packages.get(id);
    if (!existingPackage) {
      throw new Error(`Package with ID ${id} not found`);
    }

    const updatedPackage: ServicePackage = {
      ...existingPackage,
      ...updates,
      id // Ensure ID doesn't change
    };

    const validation = this.validatePackage(updatedPackage);
    if (!validation.is_valid) {
      throw new Error(`Package validation failed: ${validation.errors.join(', ')}`);
    }

    this.packages.set(id, updatedPackage);
    return updatedPackage;
  }

  /**
   * Delete service package
   */
  deletePackage(id: string): boolean {
    return this.packages.delete(id);
  }

  /**
   * Duplicate service package
   */
  duplicatePackage(id: string, newTitle: string): ServicePackage {
    const original = this.packages.get(id);
    if (!original) {
      throw new Error(`Package with ID ${id} not found`);
    }

    const duplicated: Omit<ServicePackage, 'id'> = {
      ...original,
      title: newTitle,
      description: `${original.description} (Copy)`
    };

    return this.createPackage(duplicated);
  }

  /**
   * Validate service package data
   */
  validatePackage(packageData: ServicePackage): ServicePackageValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!packageData.title?.trim()) {
      errors.push('Title is required');
    }

    if (!packageData.description?.trim()) {
      errors.push('Description is required');
    }

    if (!packageData.category?.trim()) {
      errors.push('Category is required');
    }

    if (!packageData.tier) {
      errors.push('Tier is required');
    }

    if (!packageData.includes || packageData.includes.length === 0) {
      errors.push('At least one included feature is required');
    }

    if (!packageData.industry_tags || packageData.industry_tags.length === 0) {
      warnings.push('Consider adding industry tags for better matching');
    }

    // Business logic validation
    if (packageData.tier === 'foundation' && packageData.includes.length > 5) {
      warnings.push('Foundation tier typically includes 3-5 features');
    }

    if (packageData.tier === 'enterprise' && packageData.includes.length < 5) {
      warnings.push('Enterprise tier typically includes 5+ features');
    }

    // Price band validation
    if (packageData.price_band) {
      const validPriceBands = ['$', '$$', '$$$', '$$$$', 'Contact', 'Custom'];
      if (!validPriceBands.some(band => packageData.price_band?.includes(band))) {
        warnings.push('Consider using standard price band indicators ($, $$, $$$, $$$$)');
      }
    }

    return {
      is_valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Get package statistics
   */
  getPackageStats(): ServicePackageStats {
    const packages = this.getAllPackages();

    const byTier = packages.reduce((acc, pkg) => {
      acc[pkg.tier] = (acc[pkg.tier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byCategory = packages.reduce((acc, pkg) => {
      acc[pkg.category] = (acc[pkg.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byIndustry = packages.reduce((acc, pkg) => {
      pkg.industry_tags.forEach(tag => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    return {
      total_packages: packages.length,
      by_tier: byTier,
      by_category: byCategory,
      by_industry: byIndustry,
      most_recommended: packages.slice(0, 5), // Placeholder
      least_used: packages.slice(-3) // Placeholder
    };
  }

  /**
   * Search packages by keyword
   */
  searchPackages(query: string): ServicePackage[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getAllPackages();

    return this.getAllPackages().filter(pkg =>
      pkg.title.toLowerCase().includes(searchTerm) ||
      pkg.description.toLowerCase().includes(searchTerm) ||
      pkg.category.toLowerCase().includes(searchTerm) ||
      pkg.industry_tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      pkg.includes.some(feature => feature.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Export packages for backup/transfer
   */
  exportPackages(): {
    packages: ServicePackage[];
    categories: ServicePackageCategory[];
    templates: ServicePackageTemplate[];
    exported_at: string;
  } {
    return {
      packages: this.getAllPackages(),
      categories: Array.from(this.categories.values()),
      templates: Array.from(this.templates.values()),
      exported_at: new Date().toISOString()
    };
  }

  /**
   * Import packages from backup/transfer
   */
  importPackages(data: {
    packages: ServicePackage[];
    categories?: ServicePackageCategory[];
    templates?: ServicePackageTemplate[];
  }): { imported: number; errors: string[] } {
    const errors: string[] = [];
    let imported = 0;

    // Import categories first
    if (data.categories) {
      data.categories.forEach(category => {
        this.categories.set(category.id, category);
      });
    }

    // Import templates
    if (data.templates) {
      data.templates.forEach(template => {
        this.templates.set(template.id, template);
      });
    }

    // Import packages
    data.packages.forEach(pkg => {
      try {
        const validation = this.validatePackage(pkg);
        if (validation.is_valid) {
          this.packages.set(pkg.id, pkg);
          imported++;
        } else {
          errors.push(`Package ${pkg.title}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errors.push(`Package ${pkg.title}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    });

    return { imported, errors };
  }

  /**
   * Get all categories
   */
  getAllCategories(): ServicePackageCategory[] {
    return Array.from(this.categories.values()).sort((a, b) => a.sort_order - b.sort_order);
  }

  /**
   * Get all templates
   */
  getAllTemplates(): ServicePackageTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * Create package from template
   */
  createFromTemplate(templateId: string, title: string): ServicePackage {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    const packageData: Omit<ServicePackage, 'id'> = {
      title,
      description: template.description,
      category: template.category_id,
      tier: 'foundation',
      includes: [],
      industry_tags: [],
      eligibility_criteria: {},
      content: {},
      ...template.default_content
    };

    return this.createPackage(packageData);
  }

  /**
   * Generate unique package ID
   */
  private generatePackageId(title: string): string {
    const base = title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 30);

    let counter = 1;
    let id = base;

    while (this.packages.has(id)) {
      id = `${base}-${counter}`;
      counter++;
    }

    return id;
  }

  /**
   * Initialize default categories and templates
   */
  private initializeDefaultData(): void {
    // Default categories
    const defaultCategories: ServicePackageCategory[] = [
      {
        id: 'strategy',
        name: 'Business Strategy',
        description: 'Strategic planning and business development services',
        icon: 'target',
        color: '#3B82F6',
        sort_order: 1
      },
      {
        id: 'technology',
        name: 'Technology Solutions',
        description: 'Digital transformation and technology consulting',
        icon: 'cpu',
        color: '#10B981',
        sort_order: 2
      },
      {
        id: 'marketing',
        name: 'Marketing & Growth',
        description: 'Marketing strategy and growth acceleration',
        icon: 'trending-up',
        color: '#F59E0B',
        sort_order: 3
      },
      {
        id: 'operations',
        name: 'Operations',
        description: 'Operational efficiency and process optimization',
        icon: 'settings',
        color: '#8B5CF6',
        sort_order: 4
      },
      {
        id: 'finance',
        name: 'Financial Services',
        description: 'Financial planning and investment strategies',
        icon: 'dollar-sign',
        color: '#EF4444',
        sort_order: 5
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });

    // Default templates
    const defaultTemplates: ServicePackageTemplate[] = [
      {
        id: 'basic-strategy',
        name: 'Basic Strategy Package',
        description: 'Essential strategic planning package',
        category_id: 'strategy',
        default_content: {
          tier: 'foundation',
          price_band: '$$',
          timeline: '4-6 weeks',
          includes: [
            'Business assessment',
            'Strategic roadmap',
            'Implementation plan'
          ],
          industry_tags: ['universal'],
          content: {
            what_you_get: 'Comprehensive strategic analysis and actionable roadmap',
            why_this_fits: 'Perfect for businesses ready to scale strategically',
            timeline: '4-6 weeks from kickoff to delivery',
            next_steps: 'Schedule strategy session to begin assessment'
          }
        }
      },
      {
        id: 'tech-transformation',
        name: 'Digital Transformation Package',
        description: 'Technology modernization and digital strategy',
        category_id: 'technology',
        default_content: {
          tier: 'growth',
          price_band: '$$$',
          timeline: '8-12 weeks',
          includes: [
            'Technology audit',
            'Digital strategy',
            'Implementation roadmap',
            'Change management support'
          ],
          industry_tags: ['technology', 'manufacturing', 'healthcare'],
          content: {
            what_you_get: 'Complete digital transformation strategy and execution plan',
            why_this_fits: 'Ideal for organizations modernizing their technology stack',
            timeline: '8-12 weeks with phased implementation',
            next_steps: 'Technology assessment and stakeholder interviews'
          }
        }
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });

    // Create some default packages
    this.createDefaultPackages();
  }

  /**
   * Create default service packages for demonstration
   */
  private createDefaultPackages(): void {
    const defaultPackages: Omit<ServicePackage, 'id'>[] = [
      {
        title: 'Business Strategy Foundation',
        description: 'Essential strategic planning and business development for growing companies',
        category: 'strategy',
        tier: 'foundation',
        price_band: '$$',
        timeline: '4-6 weeks',
        includes: [
          'Comprehensive business assessment',
          'Strategic roadmap development',
          'Market analysis and competitive positioning',
          'Implementation timeline and milestones'
        ],
        industry_tags: ['universal', 'small-business', 'startup'],
        eligibility_criteria: {
          'company-size': ['small', 'startup'],
          'primary-goals': ['growth', 'strategy']
        },
        content: {
          what_you_get: 'A comprehensive strategic foundation that aligns your business vision with actionable steps for sustainable growth.',
          why_this_fits: 'Perfect for businesses ready to move beyond day-to-day operations and establish long-term strategic direction.',
          timeline: 'Delivered over 4-6 weeks with weekly check-ins and milestone reviews.',
          next_steps: 'Schedule an initial strategy session to assess your current position and define success metrics.'
        }
      },
      {
        title: 'Digital Transformation Accelerator',
        description: 'Comprehensive technology modernization and digital strategy implementation',
        category: 'technology',
        tier: 'growth',
        price_band: '$$$',
        timeline: '8-12 weeks',
        includes: [
          'Technology infrastructure audit',
          'Digital strategy development',
          'System integration planning',
          'Change management support',
          'Training and adoption programs'
        ],
        industry_tags: ['technology', 'manufacturing', 'healthcare', 'finance'],
        eligibility_criteria: {
          'company-size': ['medium', 'large'],
          'primary-goals': ['digital-transformation', 'efficiency']
        },
        content: {
          what_you_get: 'Complete digital transformation strategy with hands-on implementation support and team training.',
          why_this_fits: 'Ideal for established businesses ready to modernize operations and leverage technology for competitive advantage.',
          timeline: '8-12 weeks with phased rollout to minimize business disruption.',
          next_steps: 'Technology assessment and stakeholder alignment session to define transformation scope.'
        }
      },
      {
        title: 'Enterprise Operations Optimization',
        description: 'Large-scale operational efficiency and process optimization for enterprise organizations',
        category: 'operations',
        tier: 'enterprise',
        price_band: '$$$$',
        timeline: '12-16 weeks',
        includes: [
          'Enterprise-wide process audit',
          'Operational efficiency analysis',
          'Custom automation solutions',
          'Performance monitoring systems',
          'Executive coaching and support',
          'Change management consultation'
        ],
        industry_tags: ['enterprise', 'manufacturing', 'finance', 'healthcare'],
        eligibility_criteria: {
          'company-size': ['large', 'enterprise'],
          'primary-goals': ['efficiency', 'scale']
        },
        content: {
          what_you_get: 'Enterprise-grade operational transformation with custom solutions and executive-level strategic support.',
          why_this_fits: 'Designed for large organizations requiring comprehensive operational overhaul and measurable efficiency gains.',
          timeline: '12-16 weeks with parallel workstreams to accelerate delivery while maintaining operations.',
          next_steps: 'Executive briefing and enterprise assessment to establish transformation framework.'
        }
      }
    ];

    defaultPackages.forEach(packageData => {
      try {
        this.createPackage(packageData);
      } catch (error) {
        console.warn('Failed to create default package:', error);
      }
    });
  }
}

/**
 * Default service package manager instance
 */
export const servicePackageManager = new ServicePackageManager();

/**
 * Convenience functions for common operations
 */
export const servicePackages = {
  getAll: () => servicePackageManager.getAllPackages(),
  getById: (id: string) => servicePackageManager.getPackageById(id),
  getByCategory: (categoryId: string) => servicePackageManager.getPackagesByCategory(categoryId),
  getByTier: (tier: 'foundation' | 'growth' | 'enterprise') => servicePackageManager.getPackagesByTier(tier),
  create: (data: Omit<ServicePackage, 'id'>) => servicePackageManager.createPackage(data),
  update: (id: string, updates: Partial<ServicePackage>) => servicePackageManager.updatePackage(id, updates),
  delete: (id: string) => servicePackageManager.deletePackage(id),
  search: (query: string) => servicePackageManager.searchPackages(query),
  getCategories: () => servicePackageManager.getAllCategories(),
  getTemplates: () => servicePackageManager.getAllTemplates(),
  getStats: () => servicePackageManager.getPackageStats()
};