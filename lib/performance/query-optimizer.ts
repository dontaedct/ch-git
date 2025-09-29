/**
 * Advanced Query Optimizer for Database Performance
 * HT-034.8.2 Implementation
 *
 * Provides intelligent query optimization, automatic indexing recommendations,
 * and real-time performance monitoring across all database operations.
 */

import { supabase } from '@/lib/supabase/client';

export interface QueryPlan {
  id: string;
  originalQuery: string;
  optimizedQuery: string;
  estimatedCost: number;
  actualCost?: number;
  improvements: string[];
  indexSuggestions: string[];
}

export interface QueryPattern {
  pattern: string;
  frequency: number;
  avgExecutionTime: number;
  lastSeen: Date;
  optimization?: QueryPlan;
}

export interface IndexRecommendation {
  table: string;
  columns: string[];
  type: 'btree' | 'hash' | 'gin' | 'gist';
  impact: 'high' | 'medium' | 'low';
  estimatedImprovement: number;
  affectedQueries: string[];
}

export class QueryOptimizer {
  private queryPatterns = new Map<string, QueryPattern>();
  private queryPlans = new Map<string, QueryPlan>();
  private indexRecommendations = new Map<string, IndexRecommendation>();
  private queryCache = new Map<string, { result: any; timestamp: number; hits: number }>();
  private readonly CACHE_TTL = 300000; // 5 minutes
  private readonly PATTERN_THRESHOLD = 3; // Queries executed 3+ times get optimized

  /**
   * Optimize a query before execution
   */
  async optimizeQuery(
    table: string,
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    query: any
  ): Promise<{ optimized: any; plan: QueryPlan }> {
    const queryKey = this.generateQueryKey(table, operation, query);
    const pattern = this.extractPattern(table, operation, query);

    // Track query pattern
    this.trackQueryPattern(pattern, queryKey);

    // Check if we have an existing optimization plan
    let plan = this.queryPlans.get(queryKey);

    if (!plan) {
      plan = await this.createOptimizationPlan(table, operation, query);
      this.queryPlans.set(queryKey, plan);
    }

    // Apply optimizations
    const optimized = this.applyOptimizations(query, plan);

    // Generate index recommendations if query is frequent
    const queryPattern = this.queryPatterns.get(pattern);
    if (queryPattern && queryPattern.frequency >= this.PATTERN_THRESHOLD) {
      await this.generateIndexRecommendations(table, operation, query);
    }

    return { optimized, plan };
  }

  /**
   * Create an optimization plan for a query
   */
  private async createOptimizationPlan(
    table: string,
    operation: string,
    query: any
  ): Promise<QueryPlan> {
    const originalQuery = JSON.stringify({ table, operation, ...query });
    const improvements: string[] = [];
    const indexSuggestions: string[] = [];
    let estimatedCost = 100; // Base cost

    // Analyze SELECT queries
    if (operation === 'SELECT') {
      // Check for missing LIMIT
      if (!query.limit) {
        improvements.push('Add LIMIT clause to prevent fetching excessive rows');
        estimatedCost += 50;
      }

      // Check for SELECT *
      if (query.select === '*' || !query.select) {
        improvements.push('Specify exact columns instead of SELECT *');
        estimatedCost += 30;
      }

      // Check for missing indexes on WHERE conditions
      if (query.eq || query.gte || query.lte) {
        const columns = [];
        if (query.eq) columns.push(query.eq.column);
        if (query.gte) columns.push(query.gte.column);
        if (query.lte) columns.push(query.lte.column);

        if (columns.length > 0) {
          indexSuggestions.push(`CREATE INDEX idx_${table}_${columns.join('_')} ON ${table}(${columns.join(', ')})`);
          estimatedCost += columns.length * 20;
        }
      }

      // Check for ORDER BY without index
      if (query.order && !query.order.indexed) {
        indexSuggestions.push(`CREATE INDEX idx_${table}_${query.order.column}_sort ON ${table}(${query.order.column})`);
        improvements.push('Add index for ORDER BY clause');
        estimatedCost += 40;
      }

      // Check for full text search without GIN index
      if (query.textSearch) {
        indexSuggestions.push(`CREATE INDEX idx_${table}_fts ON ${table} USING gin(to_tsvector('english', ${query.textSearch.column}))`);
        improvements.push('Add GIN index for full text search');
        estimatedCost += 60;
      }
    }

    // Analyze write operations
    if (operation === 'INSERT' || operation === 'UPDATE') {
      // Check for bulk operations
      if (Array.isArray(query.data) && query.data.length > 100) {
        improvements.push('Consider batching large write operations');
        estimatedCost += query.data.length * 0.5;
      }

      // Check for missing WHERE in UPDATE
      if (operation === 'UPDATE' && !query.where) {
        improvements.push('WARNING: UPDATE without WHERE clause affects all rows');
        estimatedCost += 100;
      }
    }

    const optimizedQuery = this.buildOptimizedQuery(table, operation, query, improvements);

    return {
      id: this.generatePlanId(),
      originalQuery,
      optimizedQuery: JSON.stringify(optimizedQuery),
      estimatedCost,
      improvements,
      indexSuggestions
    };
  }

  /**
   * Apply optimizations to a query
   */
  private applyOptimizations(query: any, plan: QueryPlan): any {
    const optimized = { ...query };

    // Apply improvements from the plan
    if (plan.improvements.includes('Add LIMIT clause to prevent fetching excessive rows')) {
      optimized.limit = optimized.limit || 100;
    }

    if (plan.improvements.includes('Specify exact columns instead of SELECT *')) {
      // This would need to be configured based on actual table schema
      // For now, we'll leave it as a recommendation
    }

    // Add query hints for the database
    optimized._hints = {
      useIndex: plan.indexSuggestions.length > 0,
      parallel: query.limit && query.limit > 1000,
      cacheResult: true
    };

    return optimized;
  }

  /**
   * Build an optimized version of the query
   */
  private buildOptimizedQuery(
    table: string,
    operation: string,
    query: any,
    improvements: string[]
  ): any {
    const optimized: any = { table, operation };

    if (operation === 'SELECT') {
      optimized.select = query.select || '*';
      optimized.where = {};

      if (query.eq) optimized.where.eq = query.eq;
      if (query.gte) optimized.where.gte = query.gte;
      if (query.lte) optimized.where.lte = query.lte;

      // Add recommended optimizations
      if (!query.limit && improvements.includes('Add LIMIT clause to prevent fetching excessive rows')) {
        optimized.limit = 100;
      } else {
        optimized.limit = query.limit;
      }

      if (query.order) {
        optimized.order = query.order;
      }

      // Add execution hints
      optimized.hints = {
        parallel: query.limit > 1000,
        useCache: true,
        timeout: 5000
      };
    } else {
      optimized.data = query.data;
      if (query.where) optimized.where = query.where;
    }

    return optimized;
  }

  /**
   * Generate index recommendations based on query patterns
   */
  private async generateIndexRecommendations(
    table: string,
    operation: string,
    query: any
  ): Promise<void> {
    if (operation !== 'SELECT') return;

    const columns: string[] = [];

    // Collect columns used in WHERE conditions
    if (query.eq) columns.push(query.eq.column);
    if (query.gte) columns.push(query.gte.column);
    if (query.lte) columns.push(query.lte.column);
    if (query.in) columns.push(query.in.column);

    if (columns.length === 0) return;

    const indexKey = `${table}_${columns.sort().join('_')}`;

    if (!this.indexRecommendations.has(indexKey)) {
      const pattern = this.queryPatterns.get(this.extractPattern(table, operation, query));

      const recommendation: IndexRecommendation = {
        table,
        columns,
        type: this.determineIndexType(query),
        impact: this.assessIndexImpact(pattern),
        estimatedImprovement: this.estimateImprovement(pattern),
        affectedQueries: [this.generateQueryKey(table, operation, query)]
      };

      this.indexRecommendations.set(indexKey, recommendation);
    } else {
      // Update affected queries list
      const rec = this.indexRecommendations.get(indexKey)!;
      const queryKey = this.generateQueryKey(table, operation, query);
      if (!rec.affectedQueries.includes(queryKey)) {
        rec.affectedQueries.push(queryKey);
      }
    }
  }

  /**
   * Determine the best index type for a query
   */
  private determineIndexType(query: any): 'btree' | 'hash' | 'gin' | 'gist' {
    if (query.textSearch) return 'gin';
    if (query.spatial) return 'gist';
    if (query.eq && !query.gte && !query.lte && !query.order) return 'hash';
    return 'btree'; // Default for range queries and sorting
  }

  /**
   * Assess the impact of creating an index
   */
  private assessIndexImpact(pattern?: QueryPattern): 'high' | 'medium' | 'low' {
    if (!pattern) return 'low';

    if (pattern.frequency > 100 && pattern.avgExecutionTime > 1000) return 'high';
    if (pattern.frequency > 50 || pattern.avgExecutionTime > 500) return 'medium';
    return 'low';
  }

  /**
   * Estimate performance improvement from an index
   */
  private estimateImprovement(pattern?: QueryPattern): number {
    if (!pattern) return 10;

    // Estimate based on execution time and frequency
    const baseImprovement = Math.min(70, pattern.avgExecutionTime / 20);
    const frequencyBonus = Math.min(20, pattern.frequency / 10);

    return Math.round(baseImprovement + frequencyBonus);
  }

  /**
   * Track query patterns for optimization
   */
  private trackQueryPattern(pattern: string, queryKey: string): void {
    const existing = this.queryPatterns.get(pattern);

    if (existing) {
      existing.frequency++;
      existing.lastSeen = new Date();
    } else {
      this.queryPatterns.set(pattern, {
        pattern,
        frequency: 1,
        avgExecutionTime: 0,
        lastSeen: new Date()
      });
    }
  }

  /**
   * Update execution time for a pattern
   */
  updatePatternMetrics(pattern: string, executionTime: number): void {
    const queryPattern = this.queryPatterns.get(pattern);

    if (queryPattern) {
      // Calculate weighted average
      const weight = Math.min(queryPattern.frequency - 1, 100);
      queryPattern.avgExecutionTime =
        ((queryPattern.avgExecutionTime * weight) + executionTime) / (weight + 1);
    }
  }

  /**
   * Get all index recommendations
   */
  getIndexRecommendations(): IndexRecommendation[] {
    return Array.from(this.indexRecommendations.values())
      .sort((a, b) => {
        // Sort by impact and estimated improvement
        const impactWeight = { high: 3, medium: 2, low: 1 };
        const aScore = impactWeight[a.impact] * a.estimatedImprovement;
        const bScore = impactWeight[b.impact] * b.estimatedImprovement;
        return bScore - aScore;
      });
  }

  /**
   * Get query performance statistics
   */
  getQueryStatistics(): {
    totalPatterns: number;
    frequentQueries: QueryPattern[];
    slowQueries: QueryPattern[];
    optimizationOpportunities: number;
  } {
    const patterns = Array.from(this.queryPatterns.values());

    return {
      totalPatterns: patterns.length,
      frequentQueries: patterns
        .filter(p => p.frequency >= this.PATTERN_THRESHOLD)
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 10),
      slowQueries: patterns
        .filter(p => p.avgExecutionTime > 500)
        .sort((a, b) => b.avgExecutionTime - a.avgExecutionTime)
        .slice(0, 10),
      optimizationOpportunities: patterns
        .filter(p => p.frequency >= this.PATTERN_THRESHOLD && !p.optimization)
        .length
    };
  }

  /**
   * Cache query results
   */
  cacheQueryResult(key: string, result: any): void {
    const existing = this.queryCache.get(key);

    if (existing) {
      existing.result = result;
      existing.timestamp = Date.now();
      existing.hits++;
    } else {
      this.queryCache.set(key, {
        result,
        timestamp: Date.now(),
        hits: 0
      });
    }

    // Clean up old cache entries
    this.cleanupCache();
  }

  /**
   * Get cached query result
   */
  getCachedResult(key: string): any | null {
    const cached = this.queryCache.get(key);

    if (!cached) return null;

    // Check if cache is still valid
    if (Date.now() - cached.timestamp > this.CACHE_TTL) {
      this.queryCache.delete(key);
      return null;
    }

    cached.hits++;
    return cached.result;
  }

  /**
   * Clean up expired cache entries
   */
  private cleanupCache(): void {
    const now = Date.now();
    const entries = Array.from(this.queryCache.entries());

    // Remove expired entries
    for (const [key, value] of entries) {
      if (now - value.timestamp > this.CACHE_TTL) {
        this.queryCache.delete(key);
      }
    }

    // If cache is too large, remove least recently used
    if (this.queryCache.size > 1000) {
      const sorted = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100); // Remove oldest 100

      for (const [key] of sorted) {
        this.queryCache.delete(key);
      }
    }
  }

  /**
   * Generate a unique key for a query
   */
  private generateQueryKey(table: string, operation: string, query: any): string {
    return `${table}_${operation}_${JSON.stringify(query)}`;
  }

  /**
   * Extract a pattern from a query for tracking
   */
  private extractPattern(table: string, operation: string, query: any): string {
    const pattern: any = { table, operation };

    if (operation === 'SELECT') {
      pattern.hasWhere = !!(query.eq || query.gte || query.lte || query.in);
      pattern.hasOrder = !!query.order;
      pattern.hasLimit = !!query.limit;
      pattern.columns = query.select === '*' ? 'all' : 'specific';
    }

    return JSON.stringify(pattern);
  }

  /**
   * Generate a unique plan ID
   */
  private generatePlanId(): string {
    return `plan_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export performance report
   */
  exportPerformanceReport(): string {
    const stats = this.getQueryStatistics();
    const recommendations = this.getIndexRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      statistics: stats,
      topIndexRecommendations: recommendations.slice(0, 5),
      cacheStatistics: {
        size: this.queryCache.size,
        totalHits: Array.from(this.queryCache.values())
          .reduce((sum, item) => sum + item.hits, 0)
      },
      optimizationPlans: this.queryPlans.size
    };

    return JSON.stringify(report, null, 2);
  }
}

// Export singleton instance
export const queryOptimizer = new QueryOptimizer();

// Export helper functions
export function createOptimizedSupabaseQuery(
  table: string,
  operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
  params: any
): any {
  return queryOptimizer.optimizeQuery(table, operation, params);
}

export function getQueryCacheKey(table: string, params: any): string {
  return `${table}_${JSON.stringify(params)}`;
}