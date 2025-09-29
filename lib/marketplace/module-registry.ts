/**
 * Module Marketplace Registry
 * 
 * Centralized module discovery, installation, and management system
 * for the HT-035.3.1 Module Marketplace Infrastructure implementation.
 */

import { z } from 'zod';

// Schema definitions for type safety
export const PricingModelSchema = z.object({
  type: z.enum(['free', 'one-time', 'subscription', 'usage-based']),
  amount: z.number().optional(),
  currency: z.string().default('USD'),
  period: z.enum(['month', 'year']).optional(),
  usageLimits: z.object({
    requests: z.number().optional(),
    storage: z.string().optional(),
    users: z.number().optional(),
  }).optional(),
});

export const CompatibilityInfoSchema = z.object({
  minVersion: z.string(),
  maxVersion: z.string().optional(),
  dependencies: z.array(z.string()).default([]),
  conflicts: z.array(z.string()).default([]),
});

export const ModuleRatingSchema = z.object({
  average: z.number().min(1).max(5),
  count: z.number().min(0),
  breakdown: z.object({
    '5': z.number().default(0),
    '4': z.number().default(0),
    '3': z.number().default(0),
    '2': z.number().default(0),
    '1': z.number().default(0),
  }).default({}),
});

export const ModuleMetadataSchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  description: z.string(),
  version: z.string(),
  author: z.string(),
  category: z.string(),
  tags: z.array(z.string()).default([]),
  pricing: PricingModelSchema,
  compatibility: CompatibilityInfoSchema,
  installCount: z.number().default(0),
  rating: ModuleRatingSchema,
  status: z.enum(['pending', 'approved', 'rejected', 'deprecated']).default('pending'),
  createdAt: z.date(),
  updatedAt: z.date(),
  downloadUrl: z.string().optional(),
  documentationUrl: z.string().optional(),
  supportUrl: z.string().optional(),
});

export const SearchQuerySchema = z.object({
  query: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  pricing: z.enum(['free', 'paid']).optional(),
  minRating: z.number().min(1).max(5).optional(),
  sortBy: z.enum(['relevance', 'rating', 'installCount', 'createdAt', 'updatedAt']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  moduleCount: z.number().default(0),
});

// Type exports
export type PricingModel = z.infer<typeof PricingModelSchema>;
export type CompatibilityInfo = z.infer<typeof CompatibilityInfoSchema>;
export type ModuleRating = z.infer<typeof ModuleRatingSchema>;
export type ModuleMetadata = z.infer<typeof ModuleMetadataSchema>;
export type SearchQuery = z.infer<typeof SearchQuerySchema>;
export type Category = z.infer<typeof CategorySchema>;

export interface InstallationResult {
  success: boolean;
  moduleId: string;
  version: string;
  installationId: string;
  dependencies: string[];
  warnings: string[];
  errors: string[];
}

export interface UninstallResult {
  success: boolean;
  moduleId: string;
  cleanupPerformed: boolean;
  warnings: string[];
  errors: string[];
}

export interface UpdateResult {
  success: boolean;
  moduleId: string;
  fromVersion: string;
  toVersion: string;
  updateId: string;
  breakingChanges: string[];
  warnings: string[];
  errors: string[];
}

/**
 * Module Registry Service
 * 
 * Handles module discovery, search, and metadata management
 */
export class ModuleRegistry {
  private modules: Map<string, ModuleMetadata> = new Map();
  private categories: Map<string, Category> = new Map();

  constructor() {
    this.initializeDefaultCategories();
  }

  /**
   * Search modules based on query parameters
   */
  async searchModules(query: SearchQuery): Promise<ModuleMetadata[]> {
    const validatedQuery = SearchQuerySchema.parse(query);
    
    let results = Array.from(this.modules.values())
      .filter(module => module.status === 'approved');

    // Apply filters
    if (validatedQuery.query) {
      const searchTerm = validatedQuery.query.toLowerCase();
      results = results.filter(module => 
        module.name.toLowerCase().includes(searchTerm) ||
        module.displayName.toLowerCase().includes(searchTerm) ||
        module.description.toLowerCase().includes(searchTerm) ||
        module.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (validatedQuery.category) {
      results = results.filter(module => module.category === validatedQuery.category);
    }

    if (validatedQuery.tags && validatedQuery.tags.length > 0) {
      results = results.filter(module => 
        validatedQuery.tags!.some(tag => module.tags.includes(tag))
      );
    }

    if (validatedQuery.pricing) {
      if (validatedQuery.pricing === 'free') {
        results = results.filter(module => module.pricing.type === 'free');
      } else {
        results = results.filter(module => module.pricing.type !== 'free');
      }
    }

    if (validatedQuery.minRating) {
      results = results.filter(module => module.rating.average >= validatedQuery.minRating!);
    }

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0;
      
      switch (validatedQuery.sortBy) {
        case 'rating':
          comparison = a.rating.average - b.rating.average;
          break;
        case 'installCount':
          comparison = a.installCount - b.installCount;
          break;
        case 'createdAt':
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'updatedAt':
          comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
          break;
        case 'relevance':
        default:
          // Relevance is based on install count and rating
          comparison = (a.installCount * a.rating.average) - (b.installCount * b.rating.average);
          break;
      }

      return validatedQuery.sortOrder === 'asc' ? comparison : -comparison;
    });

    // Apply pagination
    const start = validatedQuery.offset;
    const end = start + validatedQuery.limit;
    
    return results.slice(start, end);
  }

  /**
   * Get module details by ID
   */
  async getModuleDetails(id: string): Promise<ModuleMetadata | null> {
    return this.modules.get(id) || null;
  }

  /**
   * Get all available categories
   */
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  /**
   * Get modules by category
   */
  async getModulesByCategory(categoryId: string): Promise<ModuleMetadata[]> {
    return Array.from(this.modules.values())
      .filter(module => module.category === categoryId && module.status === 'approved');
  }

  /**
   * Get popular modules (most installed)
   */
  async getPopularModules(limit: number = 10): Promise<ModuleMetadata[]> {
    return Array.from(this.modules.values())
      .filter(module => module.status === 'approved')
      .sort((a, b) => b.installCount - a.installCount)
      .slice(0, limit);
  }

  /**
   * Get recently updated modules
   */
  async getRecentlyUpdatedModules(limit: number = 10): Promise<ModuleMetadata[]> {
    return Array.from(this.modules.values())
      .filter(module => module.status === 'approved')
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, limit);
  }

  /**
   * Register a new module
   */
  async registerModule(metadata: Omit<ModuleMetadata, 'createdAt' | 'updatedAt' | 'installCount' | 'rating'>): Promise<ModuleMetadata> {
    const validatedMetadata = ModuleMetadataSchema.parse({
      ...metadata,
      createdAt: new Date(),
      updatedAt: new Date(),
      installCount: 0,
      rating: {
        average: 0,
        count: 0,
        breakdown: {}
      }
    });

    this.modules.set(validatedMetadata.id, validatedMetadata);
    
    // Update category count
    const category = this.categories.get(validatedMetadata.category);
    if (category) {
      category.moduleCount++;
    }

    return validatedMetadata;
  }

  /**
   * Update module metadata
   */
  async updateModule(id: string, updates: Partial<ModuleMetadata>): Promise<ModuleMetadata | null> {
    const existing = this.modules.get(id);
    if (!existing) return null;

    const updated = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };

    const validatedMetadata = ModuleMetadataSchema.parse(updated);
    this.modules.set(id, validatedMetadata);

    return validatedMetadata;
  }

  /**
   * Increment install count for a module
   */
  async incrementInstallCount(id: string): Promise<void> {
    const module = this.modules.get(id);
    if (module) {
      module.installCount++;
      module.updatedAt = new Date();
    }
  }

  /**
   * Update module rating
   */
  async updateModuleRating(id: string, rating: number): Promise<void> {
    const module = this.modules.get(id);
    if (!module) return;

    const newCount = module.rating.count + 1;
    const newAverage = ((module.rating.average * module.rating.count) + rating) / newCount;
    
    const ratingKey = Math.round(rating).toString() as keyof typeof module.rating.breakdown;
    module.rating.breakdown[ratingKey]++;

    module.rating = {
      average: Math.round(newAverage * 100) / 100, // Round to 2 decimal places
      count: newCount,
      breakdown: module.rating.breakdown
    };

    module.updatedAt = new Date();
  }

  /**
   * Initialize default categories
   */
  private initializeDefaultCategories(): void {
    const defaultCategories: Category[] = [
      {
        id: 'productivity',
        name: 'Productivity',
        description: 'Tools to improve workflow and efficiency',
        icon: '⚡',
        moduleCount: 0
      },
      {
        id: 'analytics',
        name: 'Analytics',
        description: 'Data analysis and reporting modules',
        icon: '📊',
        moduleCount: 0
      },
      {
        id: 'integrations',
        name: 'Integrations',
        description: 'Third-party service integrations',
        icon: '🔗',
        moduleCount: 0
      },
      {
        id: 'automation',
        name: 'Automation',
        description: 'Workflow automation and triggers',
        icon: '🤖',
        moduleCount: 0
      },
      {
        id: 'communication',
        name: 'Communication',
        description: 'Email, messaging, and notification tools',
        icon: '💬',
        moduleCount: 0
      },
      {
        id: 'security',
        name: 'Security',
        description: 'Security and compliance modules',
        icon: '🔒',
        moduleCount: 0
      },
      {
        id: 'ui-components',
        name: 'UI Components',
        description: 'Custom UI components and widgets',
        icon: '🎨',
        moduleCount: 0
      },
      {
        id: 'utilities',
        name: 'Utilities',
        description: 'Helper tools and utilities',
        icon: '🛠️',
        moduleCount: 0
      }
    ];

    defaultCategories.forEach(category => {
      this.categories.set(category.id, category);
    });
  }

  /**
   * Get module statistics
   */
  async getModuleStatistics(): Promise<{
    totalModules: number;
    approvedModules: number;
    pendingModules: number;
    totalInstalls: number;
    averageRating: number;
    categoryBreakdown: Record<string, number>;
  }> {
    const modules = Array.from(this.modules.values());
    const approvedModules = modules.filter(m => m.status === 'approved');
    const pendingModules = modules.filter(m => m.status === 'pending');
    
    const totalInstalls = modules.reduce((sum, m) => sum + m.installCount, 0);
    const averageRating = approvedModules.length > 0 
      ? approvedModules.reduce((sum, m) => sum + m.rating.average, 0) / approvedModules.length
      : 0;

    const categoryBreakdown: Record<string, number> = {};
    approvedModules.forEach(module => {
      categoryBreakdown[module.category] = (categoryBreakdown[module.category] || 0) + 1;
    });

    return {
      totalModules: modules.length,
      approvedModules: approvedModules.length,
      pendingModules: pendingModules.length,
      totalInstalls,
      averageRating: Math.round(averageRating * 100) / 100,
      categoryBreakdown
    };
  }
}

// Export singleton instance
export const moduleRegistry = new ModuleRegistry();
