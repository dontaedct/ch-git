/**
 * HT-036.2.4: Template-Marketplace Connector
 *
 * Connects the existing template engine with HT-035 marketplace system,
 * enabling seamless template discovery, installation, and management.
 */

import { TemplateEngine } from '../template-engine/core/template-engine';
import { TemplateRegistry, TemplateMetadata } from '../templates/template-registry';
import { ModuleRegistry, ModuleMetadata } from '../marketplace/module-registry';
import { Template } from '../template-engine/core/types';

export interface MarketplaceTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  moduleId?: string;
  templateEngineId?: string;
  source: 'marketplace' | 'registry' | 'engine';
  metadata: TemplateMetadata | ModuleMetadata;
}

export interface TemplateInstallation {
  templateId: string;
  source: 'marketplace' | 'registry';
  installedAt: Date;
  installedBy?: string;
  configuration?: Record<string, any>;
}

export interface TemplateSync {
  success: boolean;
  synced: string[];
  failed: string[];
  errors: string[];
}

export class TemplateMarketplaceConnector {
  private templateEngine: TemplateEngine;
  private templateRegistry: TemplateRegistry;
  private moduleRegistry: ModuleRegistry;
  private installations: Map<string, TemplateInstallation> = new Map();

  constructor(
    templateEngine: TemplateEngine,
    templateRegistry: TemplateRegistry,
    moduleRegistry: ModuleRegistry
  ) {
    this.templateEngine = templateEngine;
    this.templateRegistry = templateRegistry;
    this.moduleRegistry = moduleRegistry;
  }

  async discoverTemplates(query?: string): Promise<MarketplaceTemplate[]> {
    const templates: MarketplaceTemplate[] = [];

    const registryTemplates = await this.templateRegistry.searchTemplates({
      query,
      limit: 50,
    });

    registryTemplates.templates.forEach(template => {
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        templateEngineId: template.id,
        source: 'registry',
        metadata: template,
      });
    });

    const marketplaceModules = await this.moduleRegistry.searchModules({
      query,
      category: 'ui-components',
      limit: 50,
    });

    marketplaceModules.forEach(module => {
      templates.push({
        id: module.id,
        name: module.displayName,
        description: module.description,
        version: module.version,
        moduleId: module.id,
        source: 'marketplace',
        metadata: module,
      });
    });

    return templates;
  }

  async getTemplateDetails(templateId: string, source: 'marketplace' | 'registry'): Promise<MarketplaceTemplate | null> {
    if (source === 'registry') {
      const template = await this.templateRegistry.getTemplate(templateId);
      if (!template) return null;

      return {
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        templateEngineId: template.id,
        source: 'registry',
        metadata: template,
      };
    } else {
      const module = await this.moduleRegistry.getModuleDetails(templateId);
      if (!module) return null;

      return {
        id: module.id,
        name: module.displayName,
        description: module.description,
        version: module.version,
        moduleId: module.id,
        source: 'marketplace',
        metadata: module,
      };
    }
  }

  async installTemplate(
    templateId: string,
    source: 'marketplace' | 'registry',
    configuration?: Record<string, any>,
    userId?: string
  ): Promise<{ success: boolean; errors?: string[] }> {
    try {
      const template = await this.getTemplateDetails(templateId, source);
      if (!template) {
        return { success: false, errors: ['Template not found'] };
      }

      if (source === 'marketplace') {
        await this.moduleRegistry.incrementInstallCount(templateId);
      }

      this.installations.set(templateId, {
        templateId,
        source,
        installedAt: new Date(),
        installedBy: userId,
        configuration,
      });

      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Installation failed'],
      };
    }
  }

  async uninstallTemplate(templateId: string): Promise<{ success: boolean; errors?: string[] }> {
    try {
      if (!this.installations.has(templateId)) {
        return { success: false, errors: ['Template not installed'] };
      }

      this.installations.delete(templateId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Uninstallation failed'],
      };
    }
  }

  async syncTemplateToMarketplace(templateId: string): Promise<{ success: boolean; moduleId?: string; errors?: string[] }> {
    try {
      const template = await this.templateRegistry.getTemplate(templateId);
      if (!template) {
        return { success: false, errors: ['Template not found in registry'] };
      }

      const moduleMetadata = await this.moduleRegistry.registerModule({
        id: `template-${template.id}`,
        name: template.name,
        displayName: template.name,
        description: template.description,
        version: template.version,
        author: template.author,
        category: 'ui-components',
        tags: template.tags || [],
        pricing: {
          type: template.pricing_tier === 'free' ? 'free' : 'one-time',
          amount: template.pricing_tier === 'premium' ? 99 : template.pricing_tier === 'enterprise' ? 299 : undefined,
        },
        compatibility: {
          minVersion: '1.0.0',
          dependencies: template.dependencies || [],
        },
        status: 'approved',
      });

      return { success: true, moduleId: moduleMetadata.id };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
      };
    }
  }

  async syncMarketplaceToTemplate(moduleId: string): Promise<{ success: boolean; templateId?: string; errors?: string[] }> {
    try {
      const module = await this.moduleRegistry.getModuleDetails(moduleId);
      if (!module) {
        return { success: false, errors: ['Module not found in marketplace'] };
      }

      const templateMetadata: TemplateMetadata = {
        id: `module-${module.id}`,
        name: module.displayName,
        description: module.description,
        version: module.version,
        category: module.category,
        tags: module.tags,
        author: module.author,
        created_at: module.createdAt.toISOString(),
        updated_at: module.updatedAt.toISOString(),
        downloads: module.installCount,
        rating: module.rating.average,
        compatibility: [module.compatibility.minVersion],
        dependencies: module.compatibility.dependencies,
        customization_points: {},
        source_path: `/marketplace/modules/${module.id}`,
        is_active: module.status === 'approved',
        is_featured: false,
        pricing_tier: module.pricing.type === 'free' ? 'free' : 'premium',
        business_category: [module.category],
        industry_tags: module.tags,
        complexity_level: 'intermediate',
        estimated_setup_time: 30,
        support_level: 'community',
      };

      const result = await this.templateRegistry.registerTemplate({
        template: templateMetadata,
        files: [],
        configuration: {
          env_variables: [],
          feature_flags: [],
          integrations: [],
          deployment_settings: {
            platform: ['vercel', 'netlify'],
            requirements: {},
            scripts: {},
            environment_setup: [],
          },
          customization_schema: {},
        },
        validation_results: [],
      });

      return {
        success: result.success,
        templateId: result.template_id,
        errors: result.errors,
      };
    } catch (error) {
      return {
        success: false,
        errors: [error instanceof Error ? error.message : 'Sync failed'],
      };
    }
  }

  async syncAllTemplates(): Promise<TemplateSync> {
    const synced: string[] = [];
    const failed: string[] = [];
    const errors: string[] = [];

    const registryTemplates = await this.templateRegistry.searchTemplates({ limit: 100 });

    for (const template of registryTemplates.templates) {
      const result = await this.syncTemplateToMarketplace(template.id);
      if (result.success) {
        synced.push(template.id);
      } else {
        failed.push(template.id);
        errors.push(...(result.errors || []));
      }
    }

    return {
      success: failed.length === 0,
      synced,
      failed,
      errors,
    };
  }

  async getInstalledTemplates(): Promise<TemplateInstallation[]> {
    return Array.from(this.installations.values());
  }

  async isTemplateInstalled(templateId: string): Promise<boolean> {
    return this.installations.has(templateId);
  }

  async getFeaturedTemplates(): Promise<MarketplaceTemplate[]> {
    const templates: MarketplaceTemplate[] = [];

    const featuredRegistry = await this.templateRegistry.getFeaturedTemplates(5);
    featuredRegistry.forEach(template => {
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        templateEngineId: template.id,
        source: 'registry',
        metadata: template,
      });
    });

    const popularMarketplace = await this.moduleRegistry.getPopularModules(5);
    popularMarketplace.forEach(module => {
      templates.push({
        id: module.id,
        name: module.displayName,
        description: module.description,
        version: module.version,
        moduleId: module.id,
        source: 'marketplace',
        metadata: module,
      });
    });

    return templates;
  }

  async getTrendingTemplates(): Promise<MarketplaceTemplate[]> {
    const templates: MarketplaceTemplate[] = [];

    const trendingRegistry = await this.templateRegistry.getTrendingTemplates(5);
    trendingRegistry.forEach(template => {
      templates.push({
        id: template.id,
        name: template.name,
        description: template.description,
        version: template.version,
        templateEngineId: template.id,
        source: 'registry',
        metadata: template,
      });
    });

    const recentMarketplace = await this.moduleRegistry.getRecentlyUpdatedModules(5);
    recentMarketplace.forEach(module => {
      templates.push({
        id: module.id,
        name: module.displayName,
        description: module.description,
        version: module.version,
        moduleId: module.id,
        source: 'marketplace',
        metadata: module,
      });
    });

    return templates;
  }

  async getTemplateStatistics(): Promise<{
    totalTemplates: number;
    installedTemplates: number;
    registryTemplates: number;
    marketplaceTemplates: number;
  }> {
    const registryResults = await this.templateRegistry.searchTemplates({ limit: 1 });
    const marketplaceStats = await this.moduleRegistry.getModuleStatistics();

    return {
      totalTemplates: registryResults.total + marketplaceStats.approvedModules,
      installedTemplates: this.installations.size,
      registryTemplates: registryResults.total,
      marketplaceTemplates: marketplaceStats.approvedModules,
    };
  }
}

export const createTemplateMarketplaceConnector = (
  templateEngine: TemplateEngine,
  templateRegistry: TemplateRegistry,
  moduleRegistry: ModuleRegistry
) => {
  return new TemplateMarketplaceConnector(templateEngine, templateRegistry, moduleRegistry);
};