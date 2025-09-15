/**
 * @fileoverview HT-008.9.1: Advanced Bundle Optimization System
 * @module lib/performance/bundle-optimizer
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Performance Optimization System
 * Task: HT-008.9.1 - Implement advanced bundle optimization
 * Focus: Advanced bundle optimization achieving <100KB bundles and <1s load times
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (performance optimization)
 */

import { ComponentType, lazy, Suspense } from 'react';

/**
 * Bundle optimization configuration
 */
export interface BundleOptimizationConfig {
  // Bundle size targets
  maxInitialBundleSize: number; // bytes
  maxAsyncBundleSize: number; // bytes
  maxTotalBundleSize: number; // bytes
  
  // Optimization strategies
  enableCodeSplitting: boolean;
  enableTreeShaking: boolean;
  enableCompression: boolean;
  enableMinification: boolean;
  
  // Lazy loading configuration
  lazyLoadThreshold: number; // ms
  preloadCriticalChunks: boolean;
  
  // Compression settings
  compressionLevel: number; // 1-9
  enableBrotli: boolean;
  enableGzip: boolean;
}

/**
 * Default bundle optimization configuration
 */
export const DEFAULT_BUNDLE_CONFIG: BundleOptimizationConfig = {
  maxInitialBundleSize: 100 * 1024, // 100KB
  maxAsyncBundleSize: 50 * 1024, // 50KB
  maxTotalBundleSize: 200 * 1024, // 200KB
  
  enableCodeSplitting: true,
  enableTreeShaking: true,
  enableCompression: true,
  enableMinification: true,
  
  lazyLoadThreshold: 200, // 200ms
  preloadCriticalChunks: true,
  
  compressionLevel: 6,
  enableBrotli: true,
  enableGzip: true,
};

/**
 * Bundle analysis result
 */
export interface BundleAnalysis {
  totalSize: number;
  initialSize: number;
  asyncSize: number;
  chunks: BundleChunk[];
  recommendations: BundleRecommendation[];
  score: number; // 0-100
}

/**
 * Individual bundle chunk information
 */
export interface BundleChunk {
  name: string;
  size: number;
  type: 'initial' | 'async' | 'vendor' | 'common';
  modules: string[];
  dependencies: string[];
}

/**
 * Bundle optimization recommendation
 */
export interface BundleRecommendation {
  type: 'critical' | 'warning' | 'info';
  message: string;
  impact: 'high' | 'medium' | 'low';
  action: string;
}

/**
 * Advanced lazy loading wrapper with performance optimization
 */
export function createOptimizedLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
  config: Partial<BundleOptimizationConfig> = {}
): ComponentType<any> {
  const mergedConfig = { ...DEFAULT_BUNDLE_CONFIG, ...config };
  
  const LazyComponent = lazy(() => {
    // Add performance timing
    const startTime = performance.now();
    
    return importFn().then(module => {
      const endTime = performance.now();
      const loadTime = endTime - startTime;
      
      // Log performance metrics
      if (loadTime > mergedConfig.lazyLoadThreshold) {
        console.warn(`Slow lazy load detected: ${loadTime.toFixed(2)}ms`);
      }
      
      return module;
    });
  });

  return function OptimizedLazyComponent(props: any) {
    return (
      <Suspense fallback={fallback || <div className="loading-skeleton" />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

/**
 * Bundle size analyzer
 */
export class BundleAnalyzer {
  private config: BundleOptimizationConfig;

  constructor(config: BundleOptimizationConfig = DEFAULT_BUNDLE_CONFIG) {
    this.config = config;
  }

  /**
   * Analyze bundle composition
   */
  analyzeBundle(bundleData: any): BundleAnalysis {
    const chunks: BundleChunk[] = [];
    let totalSize = 0;
    let initialSize = 0;
    let asyncSize = 0;

    // Process bundle chunks
    if (bundleData.chunks) {
      bundleData.chunks.forEach((chunk: any) => {
        const chunkInfo: BundleChunk = {
          name: chunk.name || 'unknown',
          size: chunk.size || 0,
          type: this.determineChunkType(chunk),
          modules: chunk.modules || [],
          dependencies: chunk.dependencies || [],
        };

        chunks.push(chunkInfo);
        totalSize += chunkInfo.size;

        if (chunkInfo.type === 'initial') {
          initialSize += chunkInfo.size;
        } else if (chunkInfo.type === 'async') {
          asyncSize += chunkInfo.size;
        }
      });
    }

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalSize,
      initialSize,
      asyncSize,
      chunks,
    });

    // Calculate performance score
    const score = this.calculatePerformanceScore({
      totalSize,
      initialSize,
      asyncSize,
      chunks,
    });

    return {
      totalSize,
      initialSize,
      asyncSize,
      chunks,
      recommendations,
      score,
    };
  }

  /**
   * Determine chunk type based on chunk properties
   */
  private determineChunkType(chunk: any): BundleChunk['type'] {
    if (chunk.initial) return 'initial';
    if (chunk.async) return 'async';
    if (chunk.name?.includes('vendor')) return 'vendor';
    return 'common';
  }

  /**
   * Generate optimization recommendations
   */
  private generateRecommendations(analysis: {
    totalSize: number;
    initialSize: number;
    asyncSize: number;
    chunks: BundleChunk[];
  }): BundleRecommendation[] {
    const recommendations: BundleRecommendation[] = [];

    // Check bundle size limits
    if (analysis.initialSize > this.config.maxInitialBundleSize) {
      recommendations.push({
        type: 'critical',
        message: `Initial bundle size (${this.formatBytes(analysis.initialSize)}) exceeds limit (${this.formatBytes(this.config.maxInitialBundleSize)})`,
        impact: 'high',
        action: 'Implement code splitting and lazy loading for non-critical components',
      });
    }

    if (analysis.totalSize > this.config.maxTotalBundleSize) {
      recommendations.push({
        type: 'warning',
        message: `Total bundle size (${this.formatBytes(analysis.totalSize)}) exceeds limit (${this.formatBytes(this.config.maxTotalBundleSize)})`,
        impact: 'medium',
        action: 'Optimize dependencies and remove unused code',
      });
    }

    // Check for large chunks
    const largeChunks = analysis.chunks.filter(chunk => chunk.size > this.config.maxAsyncBundleSize);
    if (largeChunks.length > 0) {
      recommendations.push({
        type: 'warning',
        message: `Found ${largeChunks.length} chunks exceeding size limit`,
        impact: 'medium',
        action: 'Split large chunks into smaller, more manageable pieces',
      });
    }

    // Check for duplicate dependencies
    const duplicateModules = this.findDuplicateModules(analysis.chunks);
    if (duplicateModules.length > 0) {
      recommendations.push({
        type: 'info',
        message: `Found ${duplicateModules.length} duplicate modules across chunks`,
        impact: 'low',
        action: 'Consolidate duplicate dependencies into common chunks',
      });
    }

    return recommendations;
  }

  /**
   * Calculate performance score based on bundle metrics
   */
  private calculatePerformanceScore(analysis: {
    totalSize: number;
    initialSize: number;
    asyncSize: number;
    chunks: BundleChunk[];
  }): number {
    let score = 100;

    // Deduct points for exceeding size limits
    if (analysis.initialSize > this.config.maxInitialBundleSize) {
      score -= Math.min(50, (analysis.initialSize / this.config.maxInitialBundleSize - 1) * 100);
    }

    if (analysis.totalSize > this.config.maxTotalBundleSize) {
      score -= Math.min(30, (analysis.totalSize / this.config.maxTotalBundleSize - 1) * 100);
    }

    // Deduct points for too many chunks
    if (analysis.chunks.length > 20) {
      score -= Math.min(20, (analysis.chunks.length - 20) * 2);
    }

    return Math.max(0, Math.round(score));
  }

  /**
   * Find duplicate modules across chunks
   */
  private findDuplicateModules(chunks: BundleChunk[]): string[] {
    const moduleCount = new Map<string, number>();
    
    chunks.forEach(chunk => {
      chunk.modules.forEach(module => {
        moduleCount.set(module, (moduleCount.get(module) || 0) + 1);
      });
    });

    return Array.from(moduleCount.entries())
      .filter(([, count]) => count > 1)
      .map(([module]) => module);
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Bundle optimization strategies
 */
export class BundleOptimizer {
  private config: BundleOptimizationConfig;
  private analyzer: BundleAnalyzer;

  constructor(config: BundleOptimizationConfig = DEFAULT_BUNDLE_CONFIG) {
    this.config = config;
    this.analyzer = new BundleAnalyzer(config);
  }

  /**
   * Optimize bundle configuration for Next.js
   */
  getNextJSConfig() {
    return {
      experimental: {
        optimizeCss: this.config.enableCompression,
        optimizePackageImports: [
          'framer-motion',
          'lucide-react',
          '@radix-ui/react-icons',
          'recharts',
          'react-hook-form',
        ],
      },
      webpack: (config: any, { dev, isServer }: any) => {
        if (!dev && !isServer) {
          // Advanced code splitting
          config.optimization.splitChunks = {
            chunks: 'all',
            minSize: 20000,
            maxSize: this.config.maxAsyncBundleSize,
            cacheGroups: {
              // Vendor chunks
              vendor: {
                test: /[\\/]node_modules[\\/]/,
                name: 'vendors',
                chunks: 'all',
                priority: 10,
                maxSize: 100000,
              },
              // Framework-specific chunks
              framerMotion: {
                test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
                name: 'framer-motion',
                chunks: 'all',
                priority: 20,
                maxSize: 80000,
              },
              radixUI: {
                test: /[\\/]node_modules[\\/]@radix-ui[\\/]/,
                name: 'radix-ui',
                chunks: 'all',
                priority: 15,
                maxSize: 120000,
              },
              lucide: {
                test: /[\\/]node_modules[\\/]lucide-react[\\/]/,
                name: 'lucide-icons',
                chunks: 'all',
                priority: 12,
                maxSize: 40000,
              },
              // Common chunks
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                reuseExistingChunk: true,
                maxSize: 60000,
              },
            },
          };

          // Enable module concatenation
          config.optimization.concatenateModules = true;
          
          // Optimize side effects
          config.optimization.sideEffects = false;
          
          // Enable tree shaking
          config.optimization.usedExports = true;
        }

        return config;
      },
    };
  }

  /**
   * Get performance monitoring configuration
   */
  getPerformanceConfig() {
    return {
      // Bundle size monitoring
      bundleSizeMonitoring: {
        enabled: true,
        thresholds: {
          initial: this.config.maxInitialBundleSize,
          async: this.config.maxAsyncBundleSize,
          total: this.config.maxTotalBundleSize,
        },
      },
      // Compression monitoring
      compressionMonitoring: {
        enabled: this.config.enableCompression,
        brotli: this.config.enableBrotli,
        gzip: this.config.enableGzip,
        level: this.config.compressionLevel,
      },
    };
  }
}

/**
 * Performance budget validator
 */
export class PerformanceBudgetValidator {
  private config: BundleOptimizationConfig;

  constructor(config: BundleOptimizationConfig = DEFAULT_BUNDLE_CONFIG) {
    this.config = config;
  }

  /**
   * Validate bundle against performance budget
   */
  validateBundle(bundleAnalysis: BundleAnalysis): {
    isValid: boolean;
    violations: string[];
    score: number;
  } {
    const violations: string[] = [];
    let score = bundleAnalysis.score;

    // Check initial bundle size
    if (bundleAnalysis.initialSize > this.config.maxInitialBundleSize) {
      violations.push(`Initial bundle exceeds budget: ${this.formatBytes(bundleAnalysis.initialSize)} > ${this.formatBytes(this.config.maxInitialBundleSize)}`);
      score -= 20;
    }

    // Check total bundle size
    if (bundleAnalysis.totalSize > this.config.maxTotalBundleSize) {
      violations.push(`Total bundle exceeds budget: ${this.formatBytes(bundleAnalysis.totalSize)} > ${this.formatBytes(this.config.maxTotalBundleSize)}`);
      score -= 15;
    }

    // Check chunk count
    if (bundleAnalysis.chunks.length > 15) {
      violations.push(`Too many chunks: ${bundleAnalysis.chunks.length} > 15`);
      score -= 10;
    }

    return {
      isValid: violations.length === 0,
      violations,
      score: Math.max(0, score),
    };
  }

  /**
   * Format bytes to human readable format
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

/**
 * Export optimized components and utilities
 */
export const BundleOptimization = {
  createOptimizedLazyComponent,
  BundleAnalyzer,
  BundleOptimizer,
  PerformanceBudgetValidator,
  DEFAULT_BUNDLE_CONFIG,
};

export default BundleOptimization;