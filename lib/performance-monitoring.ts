/**
 * @fileoverview HT-008.7.4: Performance Monitoring Configuration
 * @description Performance monitoring and alerting configuration
 * @version 2.0.0
 * @author OSS Hero System - HT-008 Phase 7
 */

// Performance monitoring configuration
export const PERFORMANCE_MONITORING_CONFIG = {
  // Performance budgets
  budgets: {
    // Page load performance
    pageLoad: {
      homepage: 3000,      // 3 seconds
      intake: 3000,        // 3 seconds
      dashboard: 4000,     // 4 seconds (more complex)
      status: 2000,        // 2 seconds (simple page)
    },
    
    // Navigation performance
    navigation: {
      default: 1000,       // 1 second
      complex: 2000,       // 2 seconds for complex pages
    },
    
    // Interaction performance
    interaction: {
      buttonClick: 100,    // 100ms
      formInput: 50,       // 50ms
      formSubmission: 5000, // 5 seconds
    },
    
    // Bundle size limits
    bundleSize: {
      total: 500000,       // 500KB total
      js: 400000,          // 400KB JavaScript
      css: 100000,         // 100KB CSS
      images: 200000,      // 200KB images
    },
    
    // Memory usage limits
    memory: {
      initial: 50,         // 50MB initial
      peak: 100,           // 100MB peak
      leak: 20,            // 20MB leak threshold
    },
  },
  
  // Core Web Vitals thresholds
  coreWebVitals: {
    LCP: 2500,             // Largest Contentful Paint (ms)
    FID: 100,              // First Input Delay (ms)
    CLS: 0.1,              // Cumulative Layout Shift
    FCP: 1800,             // First Contentful Paint (ms)
    TTFB: 600,             // Time to First Byte (ms)
  },
  
  // Lighthouse score thresholds
  lighthouse: {
    performance: 90,        // Performance score
    accessibility: 95,     // Accessibility score
    bestPractices: 90,     // Best practices score
    seo: 90,               // SEO score
  },
  
  // Alerting thresholds
  alerts: {
    // Performance degradation alerts
    performanceDegradation: 0.2,  // 20% degradation threshold
    
    // Error rate alerts
    errorRate: 0.05,              // 5% error rate threshold
    
    // Memory leak alerts
    memoryLeak: 0.1,              // 10% memory increase threshold
    
    // Bundle size increase alerts
    bundleSizeIncrease: 0.1,      // 10% bundle size increase threshold
  },
  
  // Monitoring intervals
  intervals: {
    realTime: 1000,        // 1 second for real-time monitoring
    performance: 30000,    // 30 seconds for performance checks
    bundleAnalysis: 300000, // 5 minutes for bundle analysis
    lighthouse: 600000,     // 10 minutes for Lighthouse audits
  },
  
  // URLs to monitor
  urls: [
    'http://localhost:3000/',
    'http://localhost:3000/intake',
    'http://localhost:3000/dashboard',
    'http://localhost:3000/status',
    'http://localhost:3000/sessions',
    'http://localhost:3000/clients',
  ],
  
  // Browser configurations for testing
  browsers: {
    desktop: [
      { name: 'Chrome', viewport: { width: 1920, height: 1080 } },
      { name: 'Firefox', viewport: { width: 1920, height: 1080 } },
      { name: 'Safari', viewport: { width: 1920, height: 1080 } },
    ],
    mobile: [
      { name: 'Chrome Mobile', viewport: { width: 375, height: 667 } },
      { name: 'Safari Mobile', viewport: { width: 375, height: 667 } },
      { name: 'Chrome Tablet', viewport: { width: 768, height: 1024 } },
    ],
  },
  
  // Network conditions for testing
  networkConditions: {
    fast3G: {
      downloadThroughput: 1.6 * 1024 * 1024 / 8,  // 1.6 Mbps
      uploadThroughput: 750 * 1024 / 8,            // 750 Kbps
      latency: 562.5,                              // 562.5ms
    },
    slow3G: {
      downloadThroughput: 500 * 1024 / 8,          // 500 Kbps
      uploadThroughput: 500 * 1024 / 8,             // 500 Kbps
      latency: 2000,                               // 2000ms
    },
    offline: {
      downloadThroughput: 0,
      uploadThroughput: 0,
      latency: 0,
    },
  },
};

// Performance monitoring utilities
export class PerformanceMonitor {
  private metrics: Map<string, any> = new Map();
  private alerts: string[] = [];
  
  // Start monitoring a metric
  startMetric(name: string, value: any): void {
    this.metrics.set(`${name}_start`, {
      value,
      timestamp: Date.now(),
    });
  }
  
  // End monitoring a metric
  endMetric(name: string, value: any): any {
    const startData = this.metrics.get(`${name}_start`);
    if (!startData) {
      throw new Error(`No start data found for metric ${name}`);
    }
    
    const duration = Date.now() - startData.timestamp;
    const result = {
      name,
      startValue: startData.value,
      endValue: value,
      duration,
      timestamp: Date.now(),
    };
    
    this.metrics.set(name, result);
    return result;
  }
  
  // Get metric value
  getMetric(name: string): any {
    return this.metrics.get(name);
  }
  
  // Check if metric exceeds budget
  checkBudget(metricName: string, budget: number): boolean {
    const metric = this.getMetric(metricName);
    if (!metric) return false;
    
    const exceeds = metric.duration > budget;
    if (exceeds) {
      this.alerts.push(`Metric ${metricName} exceeds budget: ${metric.duration}ms > ${budget}ms`);
    }
    
    return exceeds;
  }
  
  // Get all alerts
  getAlerts(): string[] {
    return [...this.alerts];
  }
  
  // Clear alerts
  clearAlerts(): void {
    this.alerts = [];
  }
  
  // Generate performance report
  generateReport(): any {
    const report = {
      timestamp: new Date().toISOString(),
      metrics: Object.fromEntries(this.metrics),
      alerts: this.alerts,
      summary: {
        totalMetrics: this.metrics.size,
        totalAlerts: this.alerts.length,
        criticalAlerts: this.alerts.filter(alert => 
          alert.includes('exceeds budget') || alert.includes('critical')
        ).length,
      },
    };
    
    return report;
  }
}

// Performance budget validator
export class PerformanceBudgetValidator {
  static validatePageLoad(url: string, loadTime: number): { passed: boolean; message: string } {
    const budget = PERFORMANCE_MONITORING_CONFIG.budgets.pageLoad;
    const pageType = this.getPageType(url);
    const threshold = (budget as any)[pageType] || budget.homepage;
    
    if (loadTime > threshold) {
      return {
        passed: false,
        message: `Page load time ${loadTime}ms exceeds budget ${threshold}ms for ${pageType}`,
      };
    }
    
    return {
      passed: true,
      message: `Page load time ${loadTime}ms is within budget ${threshold}ms for ${pageType}`,
    };
  }
  
  static validateBundleSize(analysis: any): { passed: boolean; message: string } {
    const budget = PERFORMANCE_MONITORING_CONFIG.budgets.bundleSize;
    
    if (analysis.totalSize > budget.total) {
      return {
        passed: false,
        message: `Total bundle size ${analysis.totalSize} bytes exceeds budget ${budget.total} bytes`,
      };
    }
    
    if (analysis.jsSize > budget.js) {
      return {
        passed: false,
        message: `JavaScript bundle size ${analysis.jsSize} bytes exceeds budget ${budget.js} bytes`,
      };
    }
    
    if (analysis.cssSize > budget.css) {
      return {
        passed: false,
        message: `CSS bundle size ${analysis.cssSize} bytes exceeds budget ${budget.css} bytes`,
      };
    }
    
    return {
      passed: true,
      message: `Bundle sizes are within budget`,
    };
  }
  
  static validateCoreWebVitals(metrics: any): { passed: boolean; message: string } {
    const thresholds = PERFORMANCE_MONITORING_CONFIG.coreWebVitals;
    const failures: string[] = [];
    
    if (metrics.LCP && metrics.LCP > thresholds.LCP) {
      failures.push(`LCP ${metrics.LCP}ms exceeds threshold ${thresholds.LCP}ms`);
    }
    
    if (metrics.FID && metrics.FID > thresholds.FID) {
      failures.push(`FID ${metrics.FID}ms exceeds threshold ${thresholds.FID}ms`);
    }
    
    if (metrics.CLS && metrics.CLS > thresholds.CLS) {
      failures.push(`CLS ${metrics.CLS} exceeds threshold ${thresholds.CLS}`);
    }
    
    if (failures.length > 0) {
      return {
        passed: false,
        message: `Core Web Vitals failures: ${failures.join(', ')}`,
      };
    }
    
    return {
      passed: true,
      message: `All Core Web Vitals are within thresholds`,
    };
  }
  
  private static getPageType(url: string): string {
    if (url.includes('/dashboard')) return 'dashboard';
    if (url.includes('/intake')) return 'intake';
    if (url.includes('/status')) return 'status';
    return 'homepage';
  }
}

export default PERFORMANCE_MONITORING_CONFIG;
