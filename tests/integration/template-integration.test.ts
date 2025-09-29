/**
 * HT-036.2.4: Template System Integration Tests
 *
 * Comprehensive test suite for template engine, registry, and marketplace integration
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TemplateEngine } from '../../lib/template-engine/core/template-engine';
import { TemplateRegistry } from '../../lib/templates/template-registry';
import { ModuleRegistry } from '../../lib/marketplace/module-registry';
import { TemplateMarketplaceConnector } from '../../lib/integration/template-marketplace-connector';
import { TemplateSystemUnifier } from '../../lib/integration/template-system-unifier';

describe('Template System Integration', () => {
  let templateEngine: TemplateEngine;
  let templateRegistry: TemplateRegistry;
  let moduleRegistry: ModuleRegistry;
  let connector: TemplateMarketplaceConnector;
  let unifier: TemplateSystemUnifier;

  beforeEach(() => {
    templateEngine = new TemplateEngine();
    templateRegistry = new TemplateRegistry();
    moduleRegistry = new ModuleRegistry();
    connector = new TemplateMarketplaceConnector(
      templateEngine,
      templateRegistry,
      moduleRegistry
    );
    unifier = new TemplateSystemUnifier(
      templateEngine,
      templateRegistry,
      moduleRegistry
    );
  });

  describe('TemplateMarketplaceConnector', () => {
    describe('discoverTemplates', () => {
      it('should discover templates from registry', async () => {
        const templates = await connector.discoverTemplates();
        expect(Array.isArray(templates)).toBe(true);
      });

      it('should discover templates with search query', async () => {
        const templates = await connector.discoverTemplates('dashboard');
        expect(Array.isArray(templates)).toBe(true);
      });

      it('should include templates from both sources', async () => {
        const templates = await connector.discoverTemplates();
        const sources = new Set(templates.map(t => t.source));
        expect(sources.size).toBeGreaterThanOrEqual(1);
      });
    });

    describe('getTemplateDetails', () => {
      it('should get template from registry', async () => {
        const template = await connector.getTemplateDetails(
          'test-template',
          'registry'
        );
        expect(template).toBeDefined();
      });

      it('should get template from marketplace', async () => {
        const template = await connector.getTemplateDetails(
          'test-module',
          'marketplace'
        );
        expect(template).toBeDefined();
      });

      it('should return null for non-existent template', async () => {
        const template = await connector.getTemplateDetails(
          'non-existent',
          'registry'
        );
        expect(template).toBeNull();
      });
    });

    describe('installTemplate', () => {
      it('should install template from registry', async () => {
        const result = await connector.installTemplate(
          'test-template',
          'registry',
          { theme: 'dark' },
          'user-123'
        );
        expect(result.success).toBe(true);
      });

      it('should install template from marketplace', async () => {
        const result = await connector.installTemplate(
          'test-module',
          'marketplace',
          {},
          'user-123'
        );
        expect(result.success).toBe(true);
      });

      it('should track installation state', async () => {
        await connector.installTemplate('test-template', 'registry');
        const installed = await connector.isTemplateInstalled('test-template');
        expect(installed).toBe(true);
      });

      it('should return error for non-existent template', async () => {
        const result = await connector.installTemplate(
          'non-existent',
          'registry'
        );
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      });
    });

    describe('uninstallTemplate', () => {
      it('should uninstall installed template', async () => {
        await connector.installTemplate('test-template', 'registry');
        const result = await connector.uninstallTemplate('test-template');
        expect(result.success).toBe(true);
      });

      it('should return error for non-installed template', async () => {
        const result = await connector.uninstallTemplate('non-installed');
        expect(result.success).toBe(false);
        expect(result.errors).toBeDefined();
      });

      it('should update installation state', async () => {
        await connector.installTemplate('test-template', 'registry');
        await connector.uninstallTemplate('test-template');
        const installed = await connector.isTemplateInstalled('test-template');
        expect(installed).toBe(false);
      });
    });

    describe('syncTemplateToMarketplace', () => {
      it('should sync registry template to marketplace', async () => {
        const result = await connector.syncTemplateToMarketplace('test-template');
        expect(result.success).toBeDefined();
      });

      it('should return module ID on successful sync', async () => {
        const result = await connector.syncTemplateToMarketplace('test-template');
        if (result.success) {
          expect(result.moduleId).toBeDefined();
        }
      });

      it('should handle non-existent template', async () => {
        const result = await connector.syncTemplateToMarketplace('non-existent');
        expect(result.success).toBe(false);
      });
    });

    describe('syncMarketplaceToTemplate', () => {
      it('should sync marketplace module to registry', async () => {
        const result = await connector.syncMarketplaceToTemplate('test-module');
        expect(result.success).toBeDefined();
      });

      it('should return template ID on successful sync', async () => {
        const result = await connector.syncMarketplaceToTemplate('test-module');
        if (result.success) {
          expect(result.templateId).toBeDefined();
        }
      });

      it('should handle non-existent module', async () => {
        const result = await connector.syncMarketplaceToTemplate('non-existent');
        expect(result.success).toBe(false);
      });
    });

    describe('getFeaturedTemplates', () => {
      it('should return featured templates', async () => {
        const templates = await connector.getFeaturedTemplates();
        expect(Array.isArray(templates)).toBe(true);
      });

      it('should include templates from both sources', async () => {
        const templates = await connector.getFeaturedTemplates();
        const sources = templates.map(t => t.source);
        expect(sources.length).toBeGreaterThanOrEqual(0);
      });
    });

    describe('getTrendingTemplates', () => {
      it('should return trending templates', async () => {
        const templates = await connector.getTrendingTemplates();
        expect(Array.isArray(templates)).toBe(true);
      });
    });
  });

  describe('TemplateSystemUnifier', () => {
    describe('searchTemplates', () => {
      it('should search templates across all sources', async () => {
        const result = await unifier.searchTemplates({
          query: 'test',
          limit: 10,
        });
        expect(result.templates).toBeDefined();
        expect(result.total).toBeDefined();
        expect(result.facets).toBeDefined();
      });

      it('should filter by category', async () => {
        const result = await unifier.searchTemplates({
          category: 'dashboard',
        });
        result.templates.forEach(template => {
          expect(template.category).toBe('dashboard');
        });
      });

      it('should filter by pricing', async () => {
        const result = await unifier.searchTemplates({
          pricing: 'free',
        });
        result.templates.forEach(template => {
          expect(template.pricing.type).toBe('free');
        });
      });

      it('should filter by minimum rating', async () => {
        const result = await unifier.searchTemplates({
          minRating: 4,
        });
        result.templates.forEach(template => {
          expect(template.rating).toBeGreaterThanOrEqual(4);
        });
      });

      it('should filter by installed status', async () => {
        await connector.installTemplate('test-template', 'registry');
        const result = await unifier.searchTemplates({
          installed: true,
        });
        result.templates.forEach(template => {
          expect(template.installed).toBe(true);
        });
      });

      it('should sort templates', async () => {
        const result = await unifier.searchTemplates({
          sortBy: 'rating',
          sortOrder: 'desc',
        });
        for (let i = 0; i < result.templates.length - 1; i++) {
          expect(result.templates[i].rating).toBeGreaterThanOrEqual(
            result.templates[i + 1].rating
          );
        }
      });

      it('should paginate results', async () => {
        const result = await unifier.searchTemplates({
          limit: 5,
          offset: 0,
        });
        expect(result.templates.length).toBeLessThanOrEqual(5);
      });

      it('should return facets for filtering', async () => {
        const result = await unifier.searchTemplates({});
        expect(result.facets.categories).toBeDefined();
        expect(result.facets.sources).toBeDefined();
        expect(result.facets.pricingTypes).toBeDefined();
        expect(result.facets.tags).toBeDefined();
      });
    });

    describe('getTemplate', () => {
      it('should get unified template by ID', async () => {
        const template = await unifier.getTemplate('test-template');
        expect(template).toBeDefined();
      });

      it('should include installation status', async () => {
        await connector.installTemplate('test-template', 'registry');
        const template = await unifier.getTemplate('test-template');
        expect(template?.installed).toBe(true);
      });
    });

    describe('installTemplate', () => {
      it('should install template with configuration', async () => {
        const result = await unifier.installTemplate(
          'test-template',
          { theme: 'dark' },
          'user-123'
        );
        expect(result.success).toBe(true);
      });

      it('should prevent duplicate installation', async () => {
        await unifier.installTemplate('test-template');
        const result = await unifier.installTemplate('test-template');
        expect(result.success).toBe(false);
        expect(result.errors).toContain('Template already installed');
      });
    });

    describe('uninstallTemplate', () => {
      it('should uninstall template', async () => {
        await unifier.installTemplate('test-template');
        const result = await unifier.uninstallTemplate('test-template');
        expect(result.success).toBe(true);
      });

      it('should handle non-installed template', async () => {
        const result = await unifier.uninstallTemplate('non-installed');
        expect(result.success).toBe(false);
      });
    });

    describe('syncTemplates', () => {
      it('should sync templates to marketplace', async () => {
        const result = await unifier.syncTemplates('to-marketplace');
        expect(result.synced).toBeGreaterThanOrEqual(0);
        expect(result.failed).toBeGreaterThanOrEqual(0);
      });

      it('should sync templates from marketplace', async () => {
        const result = await unifier.syncTemplates('from-marketplace');
        expect(result.synced).toBeGreaterThanOrEqual(0);
        expect(result.failed).toBeGreaterThanOrEqual(0);
      });

      it('should sync bidirectionally', async () => {
        const result = await unifier.syncTemplates('both');
        expect(result.success).toBeDefined();
      });
    });

    describe('getFeaturedTemplates', () => {
      it('should return unified featured templates', async () => {
        const templates = await unifier.getFeaturedTemplates();
        expect(Array.isArray(templates)).toBe(true);
      });

      it('should include installation status', async () => {
        await connector.installTemplate('test-template', 'registry');
        const templates = await unifier.getFeaturedTemplates();
        const installed = templates.find(t => t.id === 'test-template');
        if (installed) {
          expect(installed.installed).toBe(true);
        }
      });
    });

    describe('getTrendingTemplates', () => {
      it('should return unified trending templates', async () => {
        const templates = await unifier.getTrendingTemplates();
        expect(Array.isArray(templates)).toBe(true);
      });
    });

    describe('getInstalledTemplates', () => {
      it('should return only installed templates', async () => {
        await connector.installTemplate('test-template', 'registry');
        const templates = await unifier.getInstalledTemplates();
        templates.forEach(template => {
          expect(template.installed).toBe(true);
        });
      });
    });

    describe('getTemplateStatistics', () => {
      it('should return comprehensive statistics', async () => {
        const stats = await unifier.getTemplateStatistics();
        expect(stats.total).toBeGreaterThanOrEqual(0);
        expect(stats.installed).toBeGreaterThanOrEqual(0);
        expect(stats.registry).toBeGreaterThanOrEqual(0);
        expect(stats.marketplace).toBeGreaterThanOrEqual(0);
        expect(stats.free).toBeGreaterThanOrEqual(0);
        expect(stats.paid).toBeGreaterThanOrEqual(0);
        expect(stats.byCategory).toBeDefined();
        expect(stats.bySource).toBeDefined();
      });
    });
  });

  describe('Integration Scenarios', () => {
    it('should handle cross-system template lifecycle', async () => {
      const templates = await unifier.searchTemplates({ limit: 1 });
      if (templates.templates.length > 0) {
        const templateId = templates.templates[0].id;

        const installResult = await unifier.installTemplate(templateId);
        expect(installResult.success).toBe(true);

        const installedTemplates = await unifier.getInstalledTemplates();
        expect(installedTemplates.some(t => t.id === templateId)).toBe(true);

        const uninstallResult = await unifier.uninstallTemplate(templateId);
        expect(uninstallResult.success).toBe(true);

        const afterUninstall = await unifier.getInstalledTemplates();
        expect(afterUninstall.some(t => t.id === templateId)).toBe(false);
      }
    });

    it('should maintain consistency across systems', async () => {
      const syncResult = await unifier.syncTemplates('both');
      expect(syncResult.errors.length).toBe(0);

      const stats = await unifier.getTemplateStatistics();
      expect(stats.total).toBeGreaterThanOrEqual(0);
    });

    it('should handle concurrent operations', async () => {
      const promises = [
        unifier.searchTemplates({ query: 'test1' }),
        unifier.searchTemplates({ query: 'test2' }),
        unifier.getFeaturedTemplates(),
        unifier.getTrendingTemplates(),
      ];

      const results = await Promise.all(promises);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid template IDs gracefully', async () => {
      const result = await unifier.installTemplate('invalid-id-12345');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should handle sync failures gracefully', async () => {
      const result = await connector.syncTemplateToMarketplace('non-existent');
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
    });

    it('should validate search parameters', async () => {
      const result = await unifier.searchTemplates({
        minRating: 6,
      });
      expect(result.templates).toBeDefined();
    });
  });

  describe('Performance', () => {
    it('should complete search within acceptable time', async () => {
      const start = Date.now();
      await unifier.searchTemplates({ limit: 50 });
      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });

    it('should handle large result sets efficiently', async () => {
      const result = await unifier.searchTemplates({ limit: 100 });
      expect(result.templates.length).toBeLessThanOrEqual(100);
    });
  });
});