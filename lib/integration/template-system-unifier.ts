/**
 * HT-036.2.4: Template System Unifier
 *
 * Provides unified template management across the template engine,
 * template registry, and marketplace systems, eliminating redundancies
 * and creating a seamless user experience.
 */

import { TemplateMarketplaceConnector, MarketplaceTemplate } from './template-marketplace-connector';
import { TemplateEngine } from '../template-engine/core/template-engine';
import { TemplateRegistry } from '../templates/template-registry';
import { ModuleRegistry } from '../marketplace/module-registry';

export interface UnifiedTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  source: 'marketplace' | 'registry' | 'engine';
  category: string;
  tags: string[];
  rating: number;
  downloads: number;
  installed: boolean;
  featured: boolean;
  pricing: {
    type: 'free' | 'paid';
    amount?: number;
  };
  compatibility: string[];
  author: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateSearchOptions {
  query?: string;
  category?: string;
  tags?: string[];
  source?: 'marketplace' | 'registry' | 'all';
  pricing?: 'free' | 'paid' | 'all';
  minRating?: number;
  installed?: boolean;
  featured?: boolean;
  sortBy?: 'name' | 'rating' | 'downloads' | 'created' | 'updated';
  sortOrder?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

export interface TemplateOperationResult {
  success: boolean;
  templateId?: string;
  errors?: string[];
  warnings?: string[];
}

export class TemplateSystemUnifier {
  private connector: TemplateMarketplaceConnector;
  private templateEngine: TemplateEngine;
  private templateRegistry: TemplateRegistry;
  private moduleRegistry: ModuleRegistry;

  constructor(
    templateEngine: TemplateEngine,
    templateRegistry: TemplateRegistry,
    moduleRegistry: ModuleRegistry
  ) {
    this.templateEngine = templateEngine;
    this.templateRegistry = templateRegistry;
    this.moduleRegistry = moduleRegistry;
    this.connector = new TemplateMarketplaceConnector(
      templateEngine,
      templateRegistry,
      moduleRegistry
    );
  }

  async searchTemplates(options: TemplateSearchOptions = {}): Promise<{
    templates: UnifiedTemplate[];
    total: number;
    facets: Record<string, any>;
  }> {
    const marketplaceTemplates = await this.connector.discoverTemplates(options.query);
    const installedTemplates = await this.connector.getInstalledTemplates();
    const installedIds = new Set(installedTemplates.map(t => t.templateId));

    let unifiedTemplates = marketplaceTemplates.map(template =>
      this.convertToUnifiedTemplate(template, installedIds.has(template.id))
    );

    if (options.category) {
      unifiedTemplates = unifiedTemplates.filter(t => t.category === options.category);
    }

    if (options.tags && options.tags.length > 0) {
      unifiedTemplates = unifiedTemplates.filter(t =>
        options.tags!.some(tag => t.tags.includes(tag))
      );
    }

    if (options.source && options.source !== 'all') {
      unifiedTemplates = unifiedTemplates.filter(t => t.source === options.source);
    }

    if (options.pricing && options.pricing !== 'all') {
      unifiedTemplates = unifiedTemplates.filter(t => t.pricing.type === options.pricing);
    }

    if (options.minRating !== undefined) {
      unifiedTemplates = unifiedTemplates.filter(t => t.rating >= options.minRating!);
    }

    if (options.installed !== undefined) {
      unifiedTemplates = unifiedTemplates.filter(t => t.installed === options.installed);
    }

    if (options.featured !== undefined) {
      unifiedTemplates = unifiedTemplates.filter(t => t.featured === options.featured);
    }

    unifiedTemplates.sort((a, b) => {
      const sortBy = options.sortBy || 'rating';
      const order = options.sortOrder === 'asc' ? 1 : -1;

      switch (sortBy) {
        case 'name':
          return order * a.name.localeCompare(b.name);
        case 'rating':
          return order * (a.rating - b.rating);
        case 'downloads':
          return order * (a.downloads - b.downloads);
        case 'created':
          return order * (a.createdAt.getTime() - b.createdAt.getTime());
        case 'updated':
          return order * (a.updatedAt.getTime() - b.updatedAt.getTime());
        default:
          return 0;
      }
    });

    const start = options.offset || 0;
    const end = start + (options.limit || 20);
    const paginatedTemplates = unifiedTemplates.slice(start, end);

    const facets = this.generateFacets(unifiedTemplates);

    return {
      templates: paginatedTemplates,
      total: unifiedTemplates.length,
      facets,
    };
  }

  async getTemplate(templateId: string): Promise<UnifiedTemplate | null> {
    let template: MarketplaceTemplate | null = null;

    template = await this.connector.getTemplateDetails(templateId, 'registry');
    if (!template) {
      template = await this.connector.getTemplateDetails(templateId, 'marketplace');
    }

    if (!template) return null;

    const installed = await this.connector.isTemplateInstalled(templateId);
    return this.convertToUnifiedTemplate(template, installed);
  }

  async installTemplate(
    templateId: string,
    configuration?: Record<string, any>,
    userId?: string
  ): Promise<TemplateOperationResult> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return { success: false, errors: ['Template not found'] };
    }

    if (template.installed) {
      return {
        success: false,
        errors: ['Template already installed'],
        warnings: ['Use updateTemplate to modify existing installation'],
      };
    }

    const result = await this.connector.installTemplate(
      templateId,
      template.source as 'marketplace' | 'registry',
      configuration,
      userId
    );

    return {
      success: result.success,
      templateId: result.success ? templateId : undefined,
      errors: result.errors,
    };
  }

  async uninstallTemplate(templateId: string): Promise<TemplateOperationResult> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      return { success: false, errors: ['Template not found'] };
    }

    if (!template.installed) {
      return { success: false, errors: ['Template not installed'] };
    }

    const result = await this.connector.uninstallTemplate(templateId);

    return {
      success: result.success,
      errors: result.errors,
    };
  }

  async syncTemplates(direction: 'to-marketplace' | 'from-marketplace' | 'both' = 'both'): Promise<{
    success: boolean;
    synced: number;
    failed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    if (direction === 'to-marketplace' || direction === 'both') {
      const result = await this.connector.syncAllTemplates();
      syncedCount += result.synced.length;
      failedCount += result.failed.length;
      errors.push(...result.errors);
    }

    if (direction === 'from-marketplace' || direction === 'both') {
      const marketplaceModules = await this.moduleRegistry.searchModules({ limit: 100 });

      for (const module of marketplaceModules) {
        const result = await this.connector.syncMarketplaceToTemplate(module.id);
        if (result.success) {
          syncedCount++;
        } else {
          failedCount++;
          errors.push(...(result.errors || []));
        }
      }
    }

    return {
      success: failedCount === 0,
      synced: syncedCount,
      failed: failedCount,
      errors,
    };
  }

  async getFeaturedTemplates(): Promise<UnifiedTemplate[]> {
    const featured = await this.connector.getFeaturedTemplates();
    const installedTemplates = await this.connector.getInstalledTemplates();
    const installedIds = new Set(installedTemplates.map(t => t.templateId));

    return featured.map(template =>
      this.convertToUnifiedTemplate(template, installedIds.has(template.id))
    );
  }

  async getTrendingTemplates(): Promise<UnifiedTemplate[]> {
    const trending = await this.connector.getTrendingTemplates();
    const installedTemplates = await this.connector.getInstalledTemplates();
    const installedIds = new Set(installedTemplates.map(t => t.templateId));

    return trending.map(template =>
      this.convertToUnifiedTemplate(template, installedIds.has(template.id))
    );
  }

  async getInstalledTemplates(): Promise<UnifiedTemplate[]> {
    const installed = await this.connector.getInstalledTemplates();
    const templates: UnifiedTemplate[] = [];

    for (const installation of installed) {
      const template = await this.getTemplate(installation.templateId);
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  }

  async getTemplateStatistics(): Promise<{
    total: number;
    installed: number;
    registry: number;
    marketplace: number;
    free: number;
    paid: number;
    featured: number;
    byCategory: Record<string, number>;
    bySource: Record<string, number>;
  }> {
    const stats = await this.connector.getTemplateStatistics();
    const allTemplates = await this.searchTemplates({ limit: 1000 });

    const byCategory: Record<string, number> = {};
    const bySource: Record<string, number> = {};
    let freeCount = 0;
    let paidCount = 0;
    let featuredCount = 0;

    allTemplates.templates.forEach(template => {
      byCategory[template.category] = (byCategory[template.category] || 0) + 1;
      bySource[template.source] = (bySource[template.source] || 0) + 1;

      if (template.pricing.type === 'free') freeCount++;
      else paidCount++;

      if (template.featured) featuredCount++;
    });

    return {
      total: stats.totalTemplates,
      installed: stats.installedTemplates,
      registry: stats.registryTemplates,
      marketplace: stats.marketplaceTemplates,
      free: freeCount,
      paid: paidCount,
      featured: featuredCount,
      byCategory,
      bySource,
    };
  }

  private convertToUnifiedTemplate(
    template: MarketplaceTemplate,
    installed: boolean
  ): UnifiedTemplate {
    if (template.source === 'registry') {
      const metadata = template.metadata as any;
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        source: 'registry',
        category: metadata.category || 'general',
        tags: metadata.tags || [],
        rating: metadata.rating || 0,
        downloads: metadata.downloads || 0,
        installed,
        featured: metadata.is_featured || false,
        pricing: {
          type: metadata.pricing_tier === 'free' ? 'free' : 'paid',
          amount: metadata.pricing_tier === 'premium' ? 99 : metadata.pricing_tier === 'enterprise' ? 299 : undefined,
        },
        compatibility: metadata.compatibility || [],
        author: metadata.author || 'Unknown',
        createdAt: new Date(metadata.created_at || Date.now()),
        updatedAt: new Date(metadata.updated_at || Date.now()),
      };
    } else {
      const metadata = template.metadata as any;
      return {
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        source: 'marketplace',
        category: metadata.category || 'general',
        tags: metadata.tags || [],
        rating: metadata.rating?.average || 0,
        downloads: metadata.installCount || 0,
        installed,
        featured: metadata.installCount > 100,
        pricing: {
          type: metadata.pricing?.type === 'free' ? 'free' : 'paid',
          amount: metadata.pricing?.amount,
        },
        compatibility: [metadata.compatibility?.minVersion || '1.0.0'],
        author: metadata.author || 'Unknown',
        createdAt: metadata.createdAt || new Date(),
        updatedAt: metadata.updatedAt || new Date(),
      };
    }
  }

  private generateFacets(templates: UnifiedTemplate[]): Record<string, any> {
    const categories: Record<string, number> = {};
    const sources: Record<string, number> = {};
    const pricingTypes: Record<string, number> = {};
    const tags: Record<string, number> = {};

    templates.forEach(template => {
      categories[template.category] = (categories[template.category] || 0) + 1;
      sources[template.source] = (sources[template.source] || 0) + 1;
      pricingTypes[template.pricing.type] = (pricingTypes[template.pricing.type] || 0) + 1;

      template.tags.forEach(tag => {
        tags[tag] = (tags[tag] || 0) + 1;
      });
    });

    return {
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      sources: Object.entries(sources).map(([name, count]) => ({ name, count })),
      pricingTypes: Object.entries(pricingTypes).map(([name, count]) => ({ name, count })),
      tags: Object.entries(tags)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([name, count]) => ({ name, count })),
      ratingRanges: [
        { label: '4+ Stars', min: 4, count: templates.filter(t => t.rating >= 4).length },
        { label: '3+ Stars', min: 3, count: templates.filter(t => t.rating >= 3).length },
        { label: '2+ Stars', min: 2, count: templates.filter(t => t.rating >= 2).length },
        { label: '1+ Stars', min: 1, count: templates.filter(t => t.rating >= 1).length },
      ],
    };
  }
}

export const createTemplateSystemUnifier = (
  templateEngine: TemplateEngine,
  templateRegistry: TemplateRegistry,
  moduleRegistry: ModuleRegistry
) => {
  return new TemplateSystemUnifier(templateEngine, templateRegistry, moduleRegistry);
};