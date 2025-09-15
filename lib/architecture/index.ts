/**
 * @fileoverview HT-008 Phase 6: Architecture Refactoring - Main Index
 * @module lib/architecture/index
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6 - Architecture Refactoring
 * Focus: Microservice-ready architecture with enterprise-grade patterns
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * Architecture System Index
 * 
 * This module provides a unified interface to all architecture components
 * implemented in HT-008 Phase 6. It includes:
 * - Layer management and separation of concerns
 * - Dependency injection and inversion of control
 * - State management patterns
 * - Logging and debugging systems
 * - Configuration management
 * - Feature flags and A/B testing
 * - Caching strategies
 * - API layer abstraction
 */

// ============================================================================
// CORE ARCHITECTURE EXPORTS
// ============================================================================

export * from './layers';
export * from './dependency-injection';
export * from './state-management';
export * from './logging-debugging';
export * from './configuration';
export * from './feature-flags';
export * from './caching';
export * from './api-layer';

// ============================================================================
// ARCHITECTURE MANAGER
// ============================================================================

import { architectureManager as layerManagerInstance, ArchitectureLayerManager } from './layers';
import { container, DIContainer } from './dependency-injection';
import { Logger, LoggingFactory } from './logging-debugging';
import { ConfigurationManager, ConfigurationFactory } from './configuration';
import { FeatureFlagManager } from './feature-flags';
import { CacheManager } from './caching';
import { ApiClient, ApiClientFactory } from './api-layer';

export class ArchitectureManager {
  private layerManager: ArchitectureLayerManager;
  private diContainer: DIContainer;
  private logger: Logger;
  private configManager: ConfigurationManager;
  private featureFlagManager: FeatureFlagManager;
  private cacheManager: CacheManager;
  private apiClient: ApiClient;
  private initialized = false;

  constructor() {
    this.layerManager = layerManagerInstance;
    this.diContainer = container;
    this.logger = LoggingFactory.createLogger(
      LoggingFactory.createDefaultConfig(),
      LoggingFactory.createDefaultContext()
    );
    this.configManager = ConfigurationFactory.createManager(
      ConfigurationFactory.createDefaultSchema(),
      this.logger
    );
    this.featureFlagManager = new FeatureFlagManager(this.logger, this.configManager);
    this.cacheManager = new CacheManager(this.logger, this.configManager);
    this.apiClient = ApiClientFactory.createClient(ApiClientFactory.createDefaultConfig());
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  async initialize(): Promise<void> {
    if (this.initialized) {
      this.logger.warn('Architecture manager already initialized');
      return;
    }

    try {
      this.logger.info('Initializing architecture system...');

      // Register core services in DI container
      this.registerCoreServices();

      // Load configuration
      await this.loadConfiguration();

      // Initialize feature flags
      await this.initializeFeatureFlags();

      // Initialize caching
      await this.initializeCaching();

      // Initialize API client
      await this.initializeApiClient();

      // Validate architecture
      this.validateArchitecture();

      this.initialized = true;
      this.logger.info('Architecture system initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize architecture system', error as Error);
      throw error;
    }
  }

  private registerCoreServices(): void {
    this.diContainer.registerSingleton('Logger', () => this.logger);
    this.diContainer.registerSingleton('ConfigurationManager', () => this.configManager);
    this.diContainer.registerSingleton('FeatureFlagManager', () => this.featureFlagManager);
    this.diContainer.registerSingleton('CacheManager', () => this.cacheManager);
    this.diContainer.registerSingleton('ApiClient', () => this.apiClient);
    this.diContainer.registerSingleton('ArchitectureManager', () => this);

    this.logger.info('Core services registered in DI container');
  }

  private async loadConfiguration(): Promise<void> {
    // Load from environment variables
    this.configManager.loadFromEnvironment();

    // Load from configuration files if they exist
    try {
      await this.configManager.loadFromFile('./config/app.json');
    } catch (error) {
      this.logger.debug('No configuration file found, using defaults');
    }

    this.logger.info('Configuration loaded');
  }

  private async initializeFeatureFlags(): Promise<void> {
    // Feature flags are initialized in constructor
    this.logger.info('Feature flags initialized');
  }

  private async initializeCaching(): Promise<void> {
    // Caching is initialized in constructor
    this.logger.info('Caching system initialized');
  }

  private async initializeApiClient(): Promise<void> {
    // API client is initialized in constructor
    this.logger.info('API client initialized');
  }

  private validateArchitecture(): void {
    const validation = this.layerManager.validateArchitecture();
    
    if (!validation.isValid) {
      this.logger.error('Architecture validation failed', new Error(validation.issues.join(', ')));
      throw new Error(`Architecture validation failed: ${validation.issues.join(', ')}`);
    }

    if (validation.warnings.length > 0) {
      this.logger.warn('Architecture validation warnings', { warnings: validation.warnings });
    }

    this.logger.info('Architecture validation passed');
  }

  // ============================================================================
  // SERVICE ACCESS
  // ============================================================================

  getLayerManager(): ArchitectureLayerManager {
    return this.layerManager;
  }

  getDIContainer(): DIContainer {
    return this.diContainer;
  }

  getLogger(): Logger {
    return this.logger;
  }

  getConfigManager(): ConfigurationManager {
    return this.configManager;
  }

  getFeatureFlagManager(): FeatureFlagManager {
    return this.featureFlagManager;
  }

  getCacheManager(): CacheManager {
    return this.cacheManager;
  }

  getApiClient(): ApiClient {
    return this.apiClient;
  }

  // ============================================================================
  // HEALTH CHECKS
  // ============================================================================

  async getHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    components: Record<string, 'healthy' | 'degraded' | 'unhealthy'>;
    metrics: Record<string, any>;
  }> {
    const components: Record<string, 'healthy' | 'degraded' | 'unhealthy'> = {};
    const metrics: Record<string, any> = {};

    try {
      // Check layer manager
      const layerValidation = this.layerManager.validateArchitecture();
      components.layers = layerValidation.isValid ? 'healthy' : 'unhealthy';
      metrics.layerHealth = layerValidation.layerHealth;

      // Check DI container
      const diValidation = this.diContainer.validate();
      components.dependencyInjection = diValidation.isValid ? 'healthy' : 'unhealthy';
      metrics.diErrors = diValidation.errors.length;

      // Check configuration
      const configHealth = this.configManager.getConfigurationHealth();
      components.configuration = configHealth.invalidKeys === 0 ? 'healthy' : 'degraded';
      metrics.configHealth = configHealth;

      // Check caching
      const cacheStats = await this.cacheManager.getAnalytics();
      components.caching = 'healthy'; // Simplified check
      metrics.cacheStats = cacheStats;

      // Check feature flags
      const flagStats = this.featureFlagManager.getFlagAnalytics('new-ui');
      components.featureFlags = 'healthy'; // Simplified check
      metrics.featureFlagStats = flagStats;

      // Check API client
      const apiMetrics = this.apiClient.getMetrics();
      components.apiClient = 'healthy'; // Simplified check
      metrics.apiMetrics = apiMetrics;

      // Determine overall status
      const componentStatuses = Object.values(components);
      const overallStatus = componentStatuses.includes('unhealthy') ? 'unhealthy' :
                           componentStatuses.includes('degraded') ? 'degraded' : 'healthy';

      return {
        status: overallStatus,
        components,
        metrics
      };
    } catch (error) {
      this.logger.error('Health check failed', error as Error);
      return {
        status: 'unhealthy',
        components: { error: 'unhealthy' },
        metrics: { error: error instanceof Error ? error.message : String(error) }
      };
    }
  }

  // ============================================================================
  // SHUTDOWN
  // ============================================================================

  async shutdown(): Promise<void> {
    if (!this.initialized) {
      this.logger.warn('Architecture manager not initialized');
      return;
    }

    try {
      this.logger.info('Shutting down architecture system...');

      // Dispose DI container
      this.diContainer.dispose();

      // Clear caches
      await this.cacheManager.clear();

      this.initialized = false;
      this.logger.info('Architecture system shut down successfully');
    } catch (error) {
      this.logger.error('Error during architecture shutdown', error as Error);
      throw error;
    }
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const architectureManager = new ArchitectureManager();

// ============================================================================
// REACT HOOKS FOR ARCHITECTURE
// ============================================================================

import { useEffect, useState } from 'react';

export function useArchitecture(): {
  manager: ArchitectureManager;
  initialized: boolean;
  health: any;
} {
  const [initialized, setInitialized] = useState(false);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    const initArchitecture = async () => {
      try {
        await architectureManager.initialize();
        setInitialized(true);
        
        const healthStatus = await architectureManager.getHealthStatus();
        setHealth(healthStatus);
      } catch (error) {
        console.error('Failed to initialize architecture:', error);
      }
    };

    initArchitecture();

    return () => {
      architectureManager.shutdown();
    };
  }, []);

  return {
    manager: architectureManager,
    initialized,
    health
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createArchitectureManager(): ArchitectureManager {
  return new ArchitectureManager();
}

export function getArchitectureManager(): ArchitectureManager {
  return architectureManager;
}

export async function initializeArchitecture(): Promise<void> {
  await architectureManager.initialize();
}

export async function shutdownArchitecture(): Promise<void> {
  await architectureManager.shutdown();
}

export default architectureManager;
