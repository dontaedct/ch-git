/**
 * Template System Performance Optimization
 * Optimizes template loading, processing, and rendering performance
 */

import { PerformanceMetrics } from '../monitoring/performance-metrics';

export interface TemplateCache {
  id: string;
  template: any;
  lastAccessed: Date;
  accessCount: number;
}

export interface OptimizationConfig {
  cacheSize: number;
  compressionEnabled: boolean;
  lazyLoadingEnabled: boolean;
  preloadCriticalTemplates: boolean;
}

export class TemplateOptimizer {
  private cache = new Map<string, TemplateCache>();
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;

  constructor(config: OptimizationConfig) {
    this.config = config;
    this.metrics = new PerformanceMetrics();
  }

  async optimizeTemplateLoading(templateId: string): Promise<any> {
    const startTime = performance.now();

    try {
      // Check cache first
      const cached = this.cache.get(templateId);
      if (cached) {
        cached.lastAccessed = new Date();
        cached.accessCount++;
        this.metrics.recordCacheHit('template', performance.now() - startTime);
        return cached.template;
      }

      // Load and optimize template
      const template = await this.loadAndOptimizeTemplate(templateId);

      // Cache the optimized template
      this.cacheTemplate(templateId, template);

      this.metrics.recordCacheMiss('template', performance.now() - startTime);
      return template;
    } catch (error) {
      this.metrics.recordError('template_optimization', error);
      throw error;
    }
  }

  private async loadAndOptimizeTemplate(templateId: string): Promise<any> {
    // Simulate template loading and optimization
    const template = await this.loadTemplate(templateId);

    if (this.config.compressionEnabled) {
      template.compressed = true;
      template.size = Math.floor(template.size * 0.7); // 30% compression
    }

    if (this.config.lazyLoadingEnabled) {
      template.lazyComponents = this.identifyLazyComponents(template);
    }

    return template;
  }

  private async loadTemplate(templateId: string): Promise<any> {
    // Mock template loading
    return {
      id: templateId,
      name: `Template ${templateId}`,
      components: ['header', 'body', 'footer'],
      size: 1024,
      lastModified: new Date()
    };
  }

  private identifyLazyComponents(template: any): string[] {
    return template.components.filter((component: string) =>
      !['header', 'navigation'].includes(component)
    );
  }

  private cacheTemplate(templateId: string, template: any): void {
    // Implement LRU cache eviction
    if (this.cache.size >= this.config.cacheSize) {
      this.evictLeastRecentlyUsed();
    }

    this.cache.set(templateId, {
      id: templateId,
      template,
      lastAccessed: new Date(),
      accessCount: 1
    });
  }

  private evictLeastRecentlyUsed(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, cached] of this.cache.entries()) {
      if (cached.lastAccessed.getTime() < oldestTime) {
        oldestTime = cached.lastAccessed.getTime();
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  async preloadCriticalTemplates(templateIds: string[]): Promise<void> {
    if (!this.config.preloadCriticalTemplates) return;

    const preloadPromises = templateIds.map(id =>
      this.optimizeTemplateLoading(id).catch(error =>
        console.warn(`Failed to preload template ${id}:`, error)
      )
    );

    await Promise.allSettled(preloadPromises);
  }

  getPerformanceMetrics() {
    return {
      cacheHitRate: this.metrics.getCacheHitRate('template'),
      averageLoadTime: this.metrics.getAverageResponseTime('template'),
      cacheSize: this.cache.size,
      totalRequests: this.metrics.getTotalRequests('template')
    };
  }

  clearCache(): void {
    this.cache.clear();
  }

  getCacheStats() {
    const entries = Array.from(this.cache.values());
    return {
      size: this.cache.size,
      totalAccessCount: entries.reduce((sum, entry) => sum + entry.accessCount, 0),
      averageAccessCount: entries.length > 0 ?
        entries.reduce((sum, entry) => sum + entry.accessCount, 0) / entries.length : 0,
      oldestEntry: entries.reduce((oldest, entry) =>
        !oldest || entry.lastAccessed < oldest.lastAccessed ? entry : oldest, null)
    };
  }
}

export default TemplateOptimizer;