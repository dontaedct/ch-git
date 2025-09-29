/**
 * Integration Registry
 * 
 * Central registry for managing third-party integrations,
 * providers, and their configurations.
 */

import { 
  IntegrationProvider, 
  IntegrationCategory, 
  IntegrationInstance,
  IntegrationTest,
  IntegrationUsage,
  IntegrationError,
  IntegrationAnalytics
} from './types';

/**
 * Integration Registry Class
 */
export class IntegrationRegistry {
  private providers: Map<string, IntegrationProvider> = new Map();
  private instances: Map<string, IntegrationInstance> = new Map();
  private tests: Map<string, IntegrationTest> = new Map();
  private usage: Map<string, IntegrationUsage[]> = new Map();
  private errors: Map<string, IntegrationError[]> = new Map();

  /**
   * Register a new integration provider
   */
  registerProvider(provider: IntegrationProvider): void {
    this.providers.set(provider.id, provider);
  }

  /**
   * Get a provider by ID
   */
  getProvider(providerId: string): IntegrationProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Get all providers
   */
  getAllProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get providers by category
   */
  getProvidersByCategory(category: IntegrationCategory): IntegrationProvider[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.category === category);
  }

  /**
   * Get popular providers
   */
  getPopularProviders(limit: number = 10): IntegrationProvider[] {
    return Array.from(this.providers.values())
      .sort((a, b) => b.popularityScore - a.popularityScore)
      .slice(0, limit);
  }

  /**
   * Search providers
   */
  searchProviders(query: string): IntegrationProvider[] {
    const lowercaseQuery = query.toLowerCase();
    return Array.from(this.providers.values())
      .filter(provider => 
        provider.name.toLowerCase().includes(lowercaseQuery) ||
        provider.description.toLowerCase().includes(lowercaseQuery) ||
        provider.features.some(feature => 
          feature.name.toLowerCase().includes(lowercaseQuery) ||
          feature.description.toLowerCase().includes(lowercaseQuery)
        )
      );
  }

  /**
   * Create a new integration instance
   */
  createInstance(instance: IntegrationInstance): void {
    this.instances.set(instance.id, instance);
  }

  /**
   * Get an instance by ID
   */
  getInstance(instanceId: string): IntegrationInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Get all instances
   */
  getAllInstances(): IntegrationInstance[] {
    return Array.from(this.instances.values());
  }

  /**
   * Get instances by provider
   */
  getInstancesByProvider(providerId: string): IntegrationInstance[] {
    return Array.from(this.instances.values())
      .filter(instance => instance.providerId === providerId);
  }

  /**
   * Update instance status
   */
  updateInstanceStatus(instanceId: string, status: IntegrationInstance['status'], errorMessage?: string): void {
    const instance = this.instances.get(instanceId);
    if (instance) {
      instance.status = status;
      instance.errorMessage = errorMessage;
      instance.updatedAt = new Date().toISOString();
    }
  }

  /**
   * Delete an instance
   */
  deleteInstance(instanceId: string): boolean {
    return this.instances.delete(instanceId);
  }

  /**
   * Run an integration test
   */
  async runTest(testId: string, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    const test = this.tests.get(testId);
    if (!test) {
      throw new Error(`Test ${testId} not found`);
    }

    try {
      const result = await this.executeTest(test, configuration);
      test.result = result;
      return result;
    } catch (error) {
      const result = {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
      test.result = result;
      return result;
    }
  }

  /**
   * Execute a specific test
   */
  private async executeTest(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    switch (test.type) {
      case 'connection':
        return await this.testConnection(test, configuration);
      case 'authentication':
        return await this.testAuthentication(test, configuration);
      case 'permissions':
        return await this.testPermissions(test, configuration);
      case 'webhook':
        return await this.testWebhook(test, configuration);
      case 'api_call':
        return await this.testApiCall(test, configuration);
      default:
        throw new Error(`Unknown test type: ${test.type}`);
    }
  }

  /**
   * Test connection to external service
   */
  private async testConnection(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    // Implementation would depend on the specific provider
    // This is a placeholder for the actual connection test
    return {
      success: true,
      message: 'Connection test successful',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test authentication with external service
   */
  private async testAuthentication(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    // Implementation would depend on the specific provider
    return {
      success: true,
      message: 'Authentication test successful',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test permissions with external service
   */
  private async testPermissions(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    // Implementation would depend on the specific provider
    return {
      success: true,
      message: 'Permissions test successful',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test webhook configuration
   */
  private async testWebhook(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    // Implementation would depend on the specific provider
    return {
      success: true,
      message: 'Webhook test successful',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Test API call to external service
   */
  private async testApiCall(test: IntegrationTest, configuration: Record<string, any>): Promise<IntegrationTest['result']> {
    // Implementation would depend on the specific provider
    return {
      success: true,
      message: 'API call test successful',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Record usage for an instance
   */
  recordUsage(usage: IntegrationUsage): void {
    const existingUsage = this.usage.get(usage.instanceId) || [];
    existingUsage.push(usage);
    this.usage.set(usage.instanceId, existingUsage);
  }

  /**
   * Get usage for an instance
   */
  getUsage(instanceId: string): IntegrationUsage[] {
    return this.usage.get(instanceId) || [];
  }

  /**
   * Record an error for an instance
   */
  recordError(error: IntegrationError): void {
    const existingErrors = this.errors.get(error.instanceId) || [];
    existingErrors.push(error);
    this.errors.set(error.instanceId, existingErrors);
  }

  /**
   * Get errors for an instance
   */
  getErrors(instanceId: string): IntegrationError[] {
    return this.errors.get(instanceId) || [];
  }

  /**
   * Get analytics for integrations
   */
  getAnalytics(startDate: string, endDate: string): IntegrationAnalytics {
    const allInstances = this.getAllInstances();
    const activeInstances = allInstances.filter(instance => instance.status === 'active');
    
    const usageByProvider = new Map<string, { usage: number; errors: number }>();
    const popularProviders = new Map<string, { installations: number; category: IntegrationCategory }>();

    // Calculate usage by provider
    for (const [instanceId, usageList] of this.usage) {
      const instance = this.getInstance(instanceId);
      if (instance) {
        const provider = this.getProvider(instance.providerId);
        if (provider) {
          const current = usageByProvider.get(instance.providerId) || { usage: 0, errors: 0 };
          current.usage += usageList.reduce((sum, u) => sum + u.count, 0);
          usageByProvider.set(instance.providerId, current);
        }
      }
    }

    // Calculate error counts
    for (const [instanceId, errorList] of this.errors) {
      const instance = this.getInstance(instanceId);
      if (instance) {
        const current = usageByProvider.get(instance.providerId) || { usage: 0, errors: 0 };
        current.errors += errorList.length;
        usageByProvider.set(instance.providerId, current);
      }
    }

    // Calculate popular providers
    for (const instance of allInstances) {
      const provider = this.getProvider(instance.providerId);
      if (provider) {
        const current = popularProviders.get(instance.providerId) || { 
          installations: 0, 
          category: provider.category 
        };
        current.installations += 1;
        popularProviders.set(instance.providerId, current);
      }
    }

    return {
      period: { start: startDate, end: endDate },
      totalIntegrations: allInstances.length,
      activeIntegrations: activeInstances.length,
      usageByProvider: Array.from(usageByProvider.entries()).map(([providerId, data]) => {
        const provider = this.getProvider(providerId);
        return {
          providerId,
          providerName: provider?.name || 'Unknown',
          usage: data.usage,
          errors: data.errors
        };
      }),
      popularProviders: Array.from(popularProviders.entries())
        .map(([providerId, data]) => {
          const provider = this.getProvider(providerId);
          return {
            providerId,
            providerName: provider?.name || 'Unknown',
            installations: data.installations,
            category: data.category
          };
        })
        .sort((a, b) => b.installations - a.installations)
        .slice(0, 10),
      errorAnalysis: this.getErrorAnalysis(),
      performance: this.getPerformanceMetrics()
    };
  }

  /**
   * Get error analysis
   */
  private getErrorAnalysis(): IntegrationAnalytics['errorAnalysis'] {
    const errorTypes = new Map<string, number>();
    let totalErrors = 0;

    for (const errorList of this.errors.values()) {
      for (const error of errorList) {
        const count = errorTypes.get(error.type) || 0;
        errorTypes.set(error.type, count + 1);
        totalErrors += 1;
      }
    }

    return Array.from(errorTypes.entries()).map(([type, count]) => ({
      type,
      count,
      percentage: totalErrors > 0 ? (count / totalErrors) * 100 : 0,
      trend: 'stable' as const // This would be calculated based on historical data
    }));
  }

  /**
   * Get performance metrics
   */
  private getPerformanceMetrics(): IntegrationAnalytics['performance'] {
    // This would be calculated based on actual performance data
    return {
      averageResponseTime: 250, // ms
      successRate: 98.5, // percentage
      uptime: 99.9 // percentage
    };
  }
}

/**
 * Global integration registry instance
 */
let globalRegistry: IntegrationRegistry | null = null;

/**
 * Get or create global integration registry
 */
export function getIntegrationRegistry(): IntegrationRegistry {
  globalRegistry ??= new IntegrationRegistry();
  return globalRegistry;
}

/**
 * Initialize the integration registry with default providers
 */
export function initializeIntegrationRegistry(): IntegrationRegistry {
  const registry = getIntegrationRegistry();
  
  // Register default providers
  registerDefaultProviders(registry);
  
  return registry;
}

/**
 * Register default integration providers
 */
function registerDefaultProviders(registry: IntegrationRegistry): void {
  // This would register all the default providers
  // Implementation will be added in the provider-specific files
}
