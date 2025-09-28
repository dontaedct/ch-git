/**
 * @file Template Metrics & Analytics System
 * @description Comprehensive template metrics collection, analysis, and reporting system
 * @author AI Assistant
 * @created 2025-09-20
 */

import { z } from 'zod';

// Type definitions
export interface TemplateMetric {
  id: string;
  templateId: string;
  templateName: string;
  category: string;
  timestamp: Date;
  metricType: 'download' | 'view' | 'rating' | 'installation' | 'error' | 'performance';
  value: number;
  metadata?: Record<string, any>;
  userId?: string;
  sessionId?: string;
}

export interface TemplateOverview {
  totalTemplates: number;
  activeTemplates: number;
  averageRating: number;
  topTemplates: Array<{
    id: string;
    name: string;
    category: string;
    downloads: number;
    views: number;
    rating: number;
    performance: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  categoryBreakdown: Array<{
    category: string;
    count: number;
    downloads: number;
    averageRating: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    downloads: number;
    views: number;
    ratings: number;
  }>;
}

export interface TemplateAnalytics {
  templateId: string;
  templateName: string;
  category: string;
  totalDownloads: number;
  totalViews: number;
  averageRating: number;
  ratingCount: number;
  installationSuccessRate: number;
  errorRate: number;
  performanceScore: number;
  popularityRank: number;
  trendingScore: number;
  userSegments: Array<{
    segment: string;
    percentage: number;
    engagementScore: number;
  }>;
  geographicData: Array<{
    country: string;
    downloads: number;
    percentage: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    downloads: number;
    views: number;
    ratings: number;
    performance: number;
  }>;
}

export interface MetricsFilter {
  timeRange: '24h' | '7d' | '30d' | '90d' | 'all';
  category?: string;
  templateId?: string;
  userId?: string;
  metricTypes?: string[];
}

// Validation schemas
const TemplateMetricSchema = z.object({
  id: z.string(),
  templateId: z.string(),
  templateName: z.string(),
  category: z.string(),
  timestamp: z.date(),
  metricType: z.enum(['download', 'view', 'rating', 'installation', 'error', 'performance']),
  value: z.number(),
  metadata: z.record(z.any()).optional(),
  userId: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * Template Metrics & Analytics System
 * Provides comprehensive template metrics collection, analysis, and reporting
 */
class TemplateMetricsService {
  private metrics: TemplateMetric[] = [];
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes

  /**
   * Record a template metric
   */
  async recordMetric(metric: Omit<TemplateMetric, 'id' | 'timestamp'>): Promise<void> {
    try {
      const fullMetric: TemplateMetric = {
        ...metric,
        id: this.generateId(),
        timestamp: new Date(),
      };

      // Validate metric
      TemplateMetricSchema.parse(fullMetric);

      // Store metric
      this.metrics.push(fullMetric);

      // Clear relevant caches
      this.clearCacheByTemplate(metric.templateId);

      // Trigger real-time updates if needed
      await this.triggerRealTimeUpdate(fullMetric);
    } catch (error) {
      console.error('Failed to record template metric:', error);
      throw new Error('Failed to record template metric');
    }
  }

  /**
   * Get template overview with comprehensive metrics
   */
  async getOverview(timeRange: string = '7d', category?: string): Promise<TemplateOverview> {
    const cacheKey = `overview_${timeRange}_${category || 'all'}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const filteredMetrics = this.filterMetrics({ timeRange, category });
      
      // Calculate total templates
      const uniqueTemplates = new Set(filteredMetrics.map(m => m.templateId));
      const totalTemplates = uniqueTemplates.size;

      // Calculate active templates (templates with activity in time range)
      const activeTemplates = new Set(
        filteredMetrics
          .filter(m => this.isWithinTimeRange(m.timestamp, timeRange))
          .map(m => m.templateId)
      ).size;

      // Calculate average rating
      const ratingMetrics = filteredMetrics.filter(m => m.metricType === 'rating');
      const averageRating = ratingMetrics.length > 0
        ? ratingMetrics.reduce((sum, m) => sum + m.value, 0) / ratingMetrics.length
        : 0;

      // Get top templates
      const topTemplates = await this.getTopTemplates(timeRange, category, 10);

      // Get category breakdown
      const categoryBreakdown = await this.getCategoryBreakdown(timeRange);

      // Get time series data
      const timeSeriesData = await this.getTimeSeriesData(timeRange, category);

      const overview: TemplateOverview = {
        totalTemplates,
        activeTemplates,
        averageRating,
        topTemplates,
        categoryBreakdown,
        timeSeriesData,
      };

      // Cache result
      this.setCache(cacheKey, overview);

      return overview;
    } catch (error) {
      console.error('Failed to get template overview:', error);
      throw new Error('Failed to get template overview');
    }
  }

  /**
   * Get detailed analytics for a specific template
   */
  async getTemplateAnalytics(templateId: string, timeRange: string = '30d'): Promise<TemplateAnalytics> {
    const cacheKey = `analytics_${templateId}_${timeRange}`;
    
    // Check cache
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      const templateMetrics = this.filterMetrics({ timeRange, templateId });
      
      if (templateMetrics.length === 0) {
        throw new Error('Template not found or no metrics available');
      }

      const templateName = templateMetrics[0].templateName;
      const category = templateMetrics[0].category;

      // Calculate basic metrics
      const downloads = templateMetrics.filter(m => m.metricType === 'download').length;
      const views = templateMetrics.filter(m => m.metricType === 'view').length;
      const ratings = templateMetrics.filter(m => m.metricType === 'rating');
      const installations = templateMetrics.filter(m => m.metricType === 'installation');
      const errors = templateMetrics.filter(m => m.metricType === 'error').length;
      const performanceMetrics = templateMetrics.filter(m => m.metricType === 'performance');

      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, m) => sum + m.value, 0) / ratings.length
        : 0;

      const installationSuccessRate = installations.length > 0
        ? (installations.filter(m => m.value === 1).length / installations.length) * 100
        : 0;

      const errorRate = (downloads > 0) ? (errors / downloads) * 100 : 0;

      const performanceScore = performanceMetrics.length > 0
        ? performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length
        : 0;

      // Calculate popularity and trending scores
      const popularityRank = await this.calculatePopularityRank(templateId, timeRange);
      const trendingScore = await this.calculateTrendingScore(templateId, timeRange);

      // Get user segments
      const userSegments = await this.getUserSegments(templateId, timeRange);

      // Get geographic data
      const geographicData = await this.getGeographicData(templateId, timeRange);

      // Get time series data
      const timeSeriesData = await this.getTemplateTimeSeriesData(templateId, timeRange);

      const analytics: TemplateAnalytics = {
        templateId,
        templateName,
        category,
        totalDownloads: downloads,
        totalViews: views,
        averageRating,
        ratingCount: ratings.length,
        installationSuccessRate,
        errorRate,
        performanceScore,
        popularityRank,
        trendingScore,
        userSegments,
        geographicData,
        timeSeriesData,
      };

      // Cache result
      this.setCache(cacheKey, analytics);

      return analytics;
    } catch (error) {
      console.error('Failed to get template analytics:', error);
      throw new Error('Failed to get template analytics');
    }
  }

  /**
   * Get top performing templates
   */
  private async getTopTemplates(timeRange: string, category?: string, limit: number = 10): Promise<any[]> {
    const filteredMetrics = this.filterMetrics({ timeRange, category });
    const templateGroups = new Map<string, TemplateMetric[]>();

    // Group metrics by template
    filteredMetrics.forEach(metric => {
      if (!templateGroups.has(metric.templateId)) {
        templateGroups.set(metric.templateId, []);
      }
      templateGroups.get(metric.templateId)!.push(metric);
    });

    // Calculate scores for each template
    const templateScores = Array.from(templateGroups.entries()).map(([templateId, metrics]) => {
      const downloads = metrics.filter(m => m.metricType === 'download').length;
      const views = metrics.filter(m => m.metricType === 'view').length;
      const ratings = metrics.filter(m => m.metricType === 'rating');
      const performance = metrics.filter(m => m.metricType === 'performance');

      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, m) => sum + m.value, 0) / ratings.length
        : 0;

      const averagePerformance = performance.length > 0
        ? performance.reduce((sum, m) => sum + m.value, 0) / performance.length
        : 0;

      // Calculate trend (comparing last 7 days to previous 7 days)
      const now = new Date();
      const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

      const recentDownloads = metrics.filter(m => 
        m.metricType === 'download' && m.timestamp >= last7Days
      ).length;

      const previousDownloads = metrics.filter(m => 
        m.metricType === 'download' && 
        m.timestamp >= previous7Days && 
        m.timestamp < last7Days
      ).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentDownloads > previousDownloads * 1.1) trend = 'up';
      else if (recentDownloads < previousDownloads * 0.9) trend = 'down';

      return {
        id: templateId,
        name: metrics[0].templateName,
        category: metrics[0].category,
        downloads,
        views,
        rating: averageRating,
        performance: averagePerformance,
        trend,
        score: downloads * 0.4 + views * 0.1 + averageRating * 20 + averagePerformance * 0.3,
      };
    });

    // Sort by score and return top templates
    return templateScores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get category breakdown
   */
  private async getCategoryBreakdown(timeRange: string): Promise<any[]> {
    const filteredMetrics = this.filterMetrics({ timeRange });
    const categoryGroups = new Map<string, TemplateMetric[]>();

    // Group by category
    filteredMetrics.forEach(metric => {
      if (!categoryGroups.has(metric.category)) {
        categoryGroups.set(metric.category, []);
      }
      categoryGroups.get(metric.category)!.push(metric);
    });

    return Array.from(categoryGroups.entries()).map(([category, metrics]) => {
      const uniqueTemplates = new Set(metrics.map(m => m.templateId)).size;
      const downloads = metrics.filter(m => m.metricType === 'download').length;
      const ratings = metrics.filter(m => m.metricType === 'rating');
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, m) => sum + m.value, 0) / ratings.length
        : 0;

      return {
        category,
        count: uniqueTemplates,
        downloads,
        averageRating,
      };
    });
  }

  /**
   * Get time series data
   */
  private async getTimeSeriesData(timeRange: string, category?: string): Promise<any[]> {
    const filteredMetrics = this.filterMetrics({ timeRange, category });
    const dateGroups = new Map<string, TemplateMetric[]>();

    // Group by date
    filteredMetrics.forEach(metric => {
      const dateKey = metric.timestamp.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(metric);
    });

    return Array.from(dateGroups.entries())
      .map(([date, metrics]) => ({
        date,
        downloads: metrics.filter(m => m.metricType === 'download').length,
        views: metrics.filter(m => m.metricType === 'view').length,
        ratings: metrics.filter(m => m.metricType === 'rating').length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Get template-specific time series data
   */
  private async getTemplateTimeSeriesData(templateId: string, timeRange: string): Promise<any[]> {
    const filteredMetrics = this.filterMetrics({ timeRange, templateId });
    const dateGroups = new Map<string, TemplateMetric[]>();

    filteredMetrics.forEach(metric => {
      const dateKey = metric.timestamp.toISOString().split('T')[0];
      if (!dateGroups.has(dateKey)) {
        dateGroups.set(dateKey, []);
      }
      dateGroups.get(dateKey)!.push(metric);
    });

    return Array.from(dateGroups.entries())
      .map(([date, metrics]) => {
        const performanceMetrics = metrics.filter(m => m.metricType === 'performance');
        const averagePerformance = performanceMetrics.length > 0
          ? performanceMetrics.reduce((sum, m) => sum + m.value, 0) / performanceMetrics.length
          : 0;

        return {
          date,
          downloads: metrics.filter(m => m.metricType === 'download').length,
          views: metrics.filter(m => m.metricType === 'view').length,
          ratings: metrics.filter(m => m.metricType === 'rating').length,
          performance: averagePerformance,
        };
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Calculate popularity rank
   */
  private async calculatePopularityRank(templateId: string, timeRange: string): Promise<number> {
    const allTemplates = new Set(this.metrics.map(m => m.templateId));
    const templateRankings = new Map<string, number>();

    // Calculate scores for all templates
    allTemplates.forEach(id => {
      const templateMetrics = this.filterMetrics({ timeRange, templateId: id });
      const downloads = templateMetrics.filter(m => m.metricType === 'download').length;
      const views = templateMetrics.filter(m => m.metricType === 'view').length;
      const ratings = templateMetrics.filter(m => m.metricType === 'rating');
      
      const averageRating = ratings.length > 0
        ? ratings.reduce((sum, m) => sum + m.value, 0) / ratings.length
        : 0;

      const score = downloads * 0.5 + views * 0.2 + averageRating * 20;
      templateRankings.set(id, score);
    });

    // Sort and find rank
    const sortedTemplates = Array.from(templateRankings.entries())
      .sort((a, b) => b[1] - a[1]);

    const rank = sortedTemplates.findIndex(([id]) => id === templateId) + 1;
    return rank;
  }

  /**
   * Calculate trending score
   */
  private async calculateTrendingScore(templateId: string, timeRange: string): Promise<number> {
    const now = new Date();
    const halfTime = this.getTimeRangeMs(timeRange) / 2;
    const midPoint = new Date(now.getTime() - halfTime);

    const templateMetrics = this.filterMetrics({ timeRange, templateId });
    
    const recentMetrics = templateMetrics.filter(m => m.timestamp >= midPoint);
    const earlierMetrics = templateMetrics.filter(m => m.timestamp < midPoint);

    const recentActivity = recentMetrics.filter(m => 
      m.metricType === 'download' || m.metricType === 'view'
    ).length;

    const earlierActivity = earlierMetrics.filter(m => 
      m.metricType === 'download' || m.metricType === 'view'
    ).length;

    if (earlierActivity === 0) return recentActivity > 0 ? 100 : 0;

    const growthRate = ((recentActivity - earlierActivity) / earlierActivity) * 100;
    return Math.max(0, Math.min(100, growthRate + 50)); // Normalize to 0-100
  }

  /**
   * Get user segments
   */
  private async getUserSegments(templateId: string, timeRange: string): Promise<any[]> {
    const templateMetrics = this.filterMetrics({ timeRange, templateId });
    const userIds = new Set(templateMetrics.map(m => m.userId).filter(Boolean));

    // Mock user segmentation - in real implementation, this would use actual user data
    const segments = [
      { segment: 'Enterprise', percentage: 35, engagementScore: 85 },
      { segment: 'SMB', percentage: 45, engagementScore: 75 },
      { segment: 'Individual', percentage: 20, engagementScore: 60 },
    ];

    return segments;
  }

  /**
   * Get geographic data
   */
  private async getGeographicData(templateId: string, timeRange: string): Promise<any[]> {
    // Mock geographic data - in real implementation, this would use actual location data
    const geoData = [
      { country: 'United States', downloads: 150, percentage: 45 },
      { country: 'United Kingdom', downloads: 80, percentage: 24 },
      { country: 'Canada', downloads: 45, percentage: 13 },
      { country: 'Australia', downloads: 35, percentage: 10 },
      { country: 'Germany', downloads: 25, percentage: 8 },
    ];

    return geoData;
  }

  /**
   * Filter metrics based on criteria
   */
  private filterMetrics(filter: MetricsFilter): TemplateMetric[] {
    let filtered = this.metrics;

    // Filter by time range
    if (filter.timeRange && filter.timeRange !== 'all') {
      const cutoff = new Date(Date.now() - this.getTimeRangeMs(filter.timeRange));
      filtered = filtered.filter(m => m.timestamp >= cutoff);
    }

    // Filter by category
    if (filter.category) {
      filtered = filtered.filter(m => m.category === filter.category);
    }

    // Filter by template ID
    if (filter.templateId) {
      filtered = filtered.filter(m => m.templateId === filter.templateId);
    }

    // Filter by user ID
    if (filter.userId) {
      filtered = filtered.filter(m => m.userId === filter.userId);
    }

    // Filter by metric types
    if (filter.metricTypes && filter.metricTypes.length > 0) {
      filtered = filtered.filter(m => filter.metricTypes!.includes(m.metricType));
    }

    return filtered;
  }

  /**
   * Get time range in milliseconds
   */
  private getTimeRangeMs(timeRange: string): number {
    switch (timeRange) {
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      case '90d': return 90 * 24 * 60 * 60 * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }

  /**
   * Check if timestamp is within time range
   */
  private isWithinTimeRange(timestamp: Date, timeRange: string): boolean {
    if (timeRange === 'all') return true;
    const cutoff = new Date(Date.now() - this.getTimeRangeMs(timeRange));
    return timestamp >= cutoff;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `metric_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Cache management
   */
  private getFromCache(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCacheByTemplate(templateId: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(templateId)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Trigger real-time updates
   */
  private async triggerRealTimeUpdate(metric: TemplateMetric): Promise<void> {
    // In a real implementation, this would trigger WebSocket updates, webhooks, etc.
    console.log('Real-time metric update:', metric);
  }

  /**
   * Initialize with sample data (for development)
   */
  async initializeSampleData(): Promise<void> {
    const sampleTemplates = [
      { id: 'template_1', name: 'Modern Dashboard', category: 'dashboard' },
      { id: 'template_2', name: 'Contact Form', category: 'form' },
      { id: 'template_3', name: 'Landing Page Pro', category: 'landing' },
      { id: 'template_4', name: 'E-commerce Store', category: 'ecommerce' },
      { id: 'template_5', name: 'Analytics Dashboard', category: 'dashboard' },
    ];

    const metricTypes: TemplateMetric['metricType'][] = ['download', 'view', 'rating', 'installation', 'performance'];
    
    // Generate sample metrics for the last 30 days
    for (let i = 0; i < 1000; i++) {
      const template = sampleTemplates[Math.floor(Math.random() * sampleTemplates.length)];
      const metricType = metricTypes[Math.floor(Math.random() * metricTypes.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      const timestamp = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      let value = 1;
      if (metricType === 'rating') value = Math.random() * 5;
      if (metricType === 'performance') value = 60 + Math.random() * 40; // 60-100%

      await this.recordMetric({
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        metricType,
        value,
        userId: `user_${Math.floor(Math.random() * 100)}`,
        sessionId: `session_${Math.floor(Math.random() * 500)}`,
      });
    }
  }
}

// Export singleton instance
export const templateMetrics = new TemplateMetricsService();

// Initialize sample data in development
if (process.env.NODE_ENV === 'development') {
  templateMetrics.initializeSampleData().catch(console.error);
}
