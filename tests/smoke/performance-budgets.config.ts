/**
 * ⚡ PERFORMANCE BUDGETS CONFIGURATION - MIT HERO SYSTEM
 * 
 * This file centralizes all performance budget definitions for the MIT Hero System smoke tests.
 * It provides comprehensive performance thresholds for all critical operations and scripts.
 * 
 * Features:
 * - 📊 DETAILED PERFORMANCE METRICS for all systems
 * - 🎯 PRECISE BUDGET THRESHOLDS with descriptions
 * - 🔍 VALIDATION UTILITIES for budget checking
 * - 📈 PERFORMANCE SCORING and analysis
 * - 🚨 FAIL-FAST DETECTION of budget violations
 * 
 * Follows universal header rules completely
 * AUDIT → DECIDE → APPLY → VERIFY pattern
 * 
 * Status: ✅ OPERATIONAL - ENFORCING ALL BUDGETS
 * Version: 1.0.0
 * MIT Hero System Integration: FULLY INTEGRATED
 */

export interface PerformanceBudget {
  time: number;        // Execution time in milliseconds
  memory: number;      // Memory usage in bytes
  cpu: number;         // CPU usage percentage
  description: string; // Human-readable description
}

export interface PerformanceBudgetCategory {
  [key: string]: PerformanceBudget;
}

// Build System Performance Budgets
export const BUILD_SYSTEM_BUDGETS: PerformanceBudgetCategory = {
  build: {
    time: 30000,        // 30 seconds
    memory: 512 * 1024 * 1024,  // 512MB
    cpu: 80,            // 80% CPU usage
    description: 'Standard build process'
  },
  buildFast: {
    time: 15000,        // 15 seconds
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 70,            // 70% CPU usage
    description: 'Fast development build'
  },
  buildMemory: {
    time: 45000,        // 45 seconds
    memory: 1024 * 1024 * 1024, // 1GB
    cpu: 90,            // 90% CPU usage
    description: 'Memory-optimized build'
  },
  buildPerformance: {
    time: 60000,        // 1 minute
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'Build performance monitoring'
  },
  buildMonitor: {
    time: 90000,        // 1.5 minutes
    memory: 512 * 1024 * 1024,  // 512MB
    cpu: 80,            // 80% CPU usage
    description: 'Build monitoring and analysis'
  }
};

// Health Check Performance Budgets
export const HEALTH_CHECK_BUDGETS: PerformanceBudgetCategory = {
  doctor: {
    time: 120000,       // 2 minutes
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'System health check'
  },
  doctorLightweight: {
    time: 60000,        // 1 minute
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Lightweight health check'
  },
  guardian: {
    time: 30000,        // 30 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Guardian system check'
  },
  guardianHealth: {
    time: 30000,        // 30 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Guardian health check'
  }
};

// Core Development Performance Budgets
export const CORE_DEVELOPMENT_BUDGETS: PerformanceBudgetCategory = {
  lint: {
    time: 60000,        // 1 minute
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 40,            // 40% CPU usage
    description: 'Code linting'
  },
  lintFast: {
    time: 30000,        // 30 seconds
    memory: 64 * 1024 * 1024,   // 64MB
    cpu: 30,            // 30% CPU usage
    description: 'Fast linting check'
  },
  typecheck: {
    time: 90000,        // 1.5 minutes
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'TypeScript type checking'
  },
  test: {
    time: 120000,       // 2 minutes
    memory: 512 * 1024 * 1024,  // 512MB
    cpu: 70,            // 70% CPU usage
    description: 'Test suite execution'
  }
};

// Performance Monitoring Budgets
export const PERFORMANCE_MONITORING_BUDGETS: PerformanceBudgetCategory = {
  memoryDetect: {
    time: 45000,        // 45 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Memory leak detection'
  },
  profileMemory: {
    time: 90000,        // 1.5 minutes
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'Memory profiling'
  },
  profileCpu: {
    time: 90000,        // 1.5 minutes
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'CPU profiling'
  }
};

// Hero System Performance Budgets
export const HERO_SYSTEM_BUDGETS: PerformanceBudgetCategory = {
  heroUnified: {
    time: 60000,        // 1 minute
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'Hero unified system'
  },
  heroUnifiedStatus: {
    time: 30000,        // 30 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 40,            // 40% CPU usage
    description: 'Hero system status check'
  },
  heroUnifiedHealth: {
    time: 45000,        // 45 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Hero system health check'
  },
  heroUnifiedExecute: {
    time: 60000,        // 1 minute
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'Hero unified system execution'
  },
  heroUltimate: {
    time: 60000,        // 1 minute
    memory: 256 * 1024 * 1024,  // 256MB
    cpu: 60,            // 60% CPU usage
    description: 'Hero ultimate system'
  },
  heroUltimateStatus: {
    time: 30000,        // 30 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 40,            // 40% CPU usage
    description: 'Hero ultimate system status'
  },
  heroUltimateHealth: {
    time: 45000,        // 45 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Hero ultimate system health'
  }
};

// CI Pipeline Performance Budgets
export const CI_PIPELINE_BUDGETS: PerformanceBudgetCategory = {
  ci: {
    time: 300000,       // 5 minutes
    memory: 1024 * 1024 * 1024, // 1GB
    cpu: 80,            // 80% CPU usage
    description: 'Full CI pipeline'
  },
  ciFast: {
    time: 180000,       // 3 minutes
    memory: 512 * 1024 * 1024,  // 512MB
    cpu: 70,            // 70% CPU usage
    description: 'Fast CI pipeline'
  },
  ciMemory: {
    time: 240000,       // 4 minutes
    memory: 1536 * 1024 * 1024, // 1.5GB
    cpu: 85,            // 85% CPU usage
    description: 'Memory-optimized CI'
  }
};

// Threat Response Performance Budgets
export const THREAT_RESPONSE_BUDGETS: PerformanceBudgetCategory = {
  heroThreatScan: {
    time: 45000,        // 45 seconds
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Hero threat scanning system'
  },
  heroThreatStatus: {
    time: 30000,        // 30 seconds
    memory: 64 * 1024 * 1024,   // 64MB
    cpu: 30,            // 30% CPU usage
    description: 'Hero threat response status'
  }
};

// System Orchestration Performance Budgets
export const SYSTEM_ORCHESTRATION_BUDGETS: PerformanceBudgetCategory = {
  heroOverview: {
    time: 15000,        // 15 seconds
    memory: 32 * 1024 * 1024,   // 32MB
    cpu: 20,            // 20% CPU usage
    description: 'Hero system overview'
  },
  heroTestHealth: {
    time: 60000,        // 1 minute
    memory: 128 * 1024 * 1024,  // 128MB
    cpu: 50,            // 50% CPU usage
    description: 'Hero system health test'
  }
};

// Consolidated performance budgets for easy access
export const ALL_PERFORMANCE_BUDGETS: PerformanceBudgetCategory = {
  ...BUILD_SYSTEM_BUDGETS,
  ...HEALTH_CHECK_BUDGETS,
  ...CORE_DEVELOPMENT_BUDGETS,
  ...PERFORMANCE_MONITORING_BUDGETS,
  ...HERO_SYSTEM_BUDGETS,
  ...CI_PIPELINE_BUDGETS,
  ...THREAT_RESPONSE_BUDGETS,
  ...SYSTEM_ORCHESTRATION_BUDGETS
};

// Performance budget validation utilities
export class PerformanceBudgetValidator {
  /**
   * Validates if a script execution meets its performance budget
   */
  static validateBudget(
    scriptName: string,
    executionTime: number,
    memoryUsage: number,
    cpuUsage: number
  ): {
    withinBudget: boolean;
    budgetExceeded: string[];
    performanceScore: number;
  } {
    const budget = ALL_PERFORMANCE_BUDGETS[scriptName];
    
    if (!budget) {
      return {
        withinBudget: false,
        budgetExceeded: ['No performance budget defined for this script'],
        performanceScore: 0
      };
    }
    
    const budgetExceeded: string[] = [];
    
    // Check execution time
    if (executionTime > budget.time) {
      budgetExceeded.push(`Time: ${executionTime}ms > ${budget.time}ms`);
    }
    
    // Check memory usage
    if (memoryUsage > budget.memory) {
      budgetExceeded.push(`Memory: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB > ${(budget.memory / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Check CPU usage
    if (cpuUsage > budget.cpu) {
      budgetExceeded.push(`CPU: ${cpuUsage.toFixed(2)}% > ${budget.cpu}%`);
    }
    
    const withinBudget = budgetExceeded.length === 0;
    
    // Calculate performance score (0-100)
    const timeScore = Math.max(0, 100 - (executionTime / budget.time - 1) * 100);
    const memoryScore = Math.max(0, 100 - (memoryUsage / budget.memory - 1) * 100);
    const cpuScore = Math.max(0, 100 - (cpuUsage / budget.cpu - 1) * 100);
    
    const performanceScore = Math.round((timeScore + memoryScore + cpuScore) / 3);
    
    return {
      withinBudget,
      budgetExceeded,
      performanceScore
    };
  }
  
  /**
   * Gets the performance budget for a specific script
   */
  static getBudget(scriptName: string): PerformanceBudget | undefined {
    return ALL_PERFORMANCE_BUDGETS[scriptName];
  }
  
  /**
   * Lists all available performance budgets
   */
  static listAllBudgets(): string[] {
    return Object.keys(ALL_PERFORMANCE_BUDGETS);
  }
  
  /**
   * Gets budgets by category
   */
  static getBudgetsByCategory(category: string): PerformanceBudgetCategory {
    switch (category.toLowerCase()) {
      case 'build':
        return BUILD_SYSTEM_BUDGETS;
      case 'health':
        return HEALTH_CHECK_BUDGETS;
      case 'core':
        return CORE_DEVELOPMENT_BUDGETS;
      case 'performance':
        return PERFORMANCE_MONITORING_BUDGETS;
      case 'hero':
        return HERO_SYSTEM_BUDGETS;
      case 'ci':
        return CI_PIPELINE_BUDGETS;
      case 'threat':
        return THREAT_RESPONSE_BUDGETS;
      case 'orchestration':
        return SYSTEM_ORCHESTRATION_BUDGETS;
      default:
        return ALL_PERFORMANCE_BUDGETS;
    }
  }
}

export default ALL_PERFORMANCE_BUDGETS;
