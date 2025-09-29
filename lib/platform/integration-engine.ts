import { EventEmitter } from 'events';

/**
 * Platform Integration Engine
 * Manages cross-module communication and integration
 */

export interface ModuleDefinition {
  id: string;
  name: string;
  version: string;
  dependencies: string[];
  apis: ModuleAPI[];
  events: EventDefinition[];
  config: ModuleConfig;
}

export interface ModuleAPI {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  description: string;
  auth: boolean;
  rateLimit?: number;
}

export interface EventDefinition {
  name: string;
  description: string;
  payload: Record<string, any>;
}

export interface ModuleConfig {
  required: Record<string, any>;
  optional: Record<string, any>;
  defaults: Record<string, any>;
}

export interface IntegrationHealth {
  moduleId: string;
  status: 'healthy' | 'degraded' | 'error';
  compatibility: number;
  lastCheck: Date;
  issues: string[];
}

export class PlatformIntegrationEngine extends EventEmitter {
  private modules: Map<string, ModuleDefinition> = new Map();
  private moduleInstances: Map<string, any> = new Map();
  private integrationHealth: Map<string, IntegrationHealth> = new Map();
  private eventBus: EventEmitter = new EventEmitter();

  constructor() {
    super();
    this.initializeEventBus();
  }

  /**
   * Register a module with the platform
   */
  async registerModule(module: ModuleDefinition): Promise<void> {
    try {
      // Validate module definition
      this.validateModule(module);

      // Check dependencies
      await this.validateDependencies(module);

      // Register module
      this.modules.set(module.id, module);

      // Initialize integration health tracking
      this.integrationHealth.set(module.id, {
        moduleId: module.id,
        status: 'healthy',
        compatibility: 100,
        lastCheck: new Date(),
        issues: []
      });

      // Emit registration event
      this.eventBus.emit('module:registered', { module });

      console.log(`Module ${module.name} (${module.id}) registered successfully`);
    } catch (error) {
      console.error(`Failed to register module ${module.id}:`, error);
      throw error;
    }
  }

  /**
   * Initialize a registered module
   */
  async initializeModule(moduleId: string, instance: any): Promise<void> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    try {
      // Store module instance
      this.moduleInstances.set(moduleId, instance);

      // Setup event listeners for this module
      this.setupModuleEventListeners(module, instance);

      // Emit initialization event
      this.eventBus.emit('module:initialized', { moduleId, instance });

      console.log(`Module ${module.name} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize module ${moduleId}:`, error);
      this.updateModuleHealth(moduleId, 'error', [`Initialization failed: ${error.message}`]);
      throw error;
    }
  }

  /**
   * Get cross-module communication bridge
   */
  createModuleBridge(sourceModuleId: string, targetModuleId: string): ModuleBridge {
    return new ModuleBridge(
      sourceModuleId,
      targetModuleId,
      this.eventBus,
      this.moduleInstances
    );
  }

  /**
   * Validate module compatibility
   */
  async validateCompatibility(moduleId: string): Promise<IntegrationHealth> {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }

    const health: IntegrationHealth = {
      moduleId,
      status: 'healthy',
      compatibility: 100,
      lastCheck: new Date(),
      issues: []
    };

    try {
      // Check dependency compatibility
      for (const depId of module.dependencies) {
        const depModule = this.modules.get(depId);
        if (!depModule) {
          health.issues.push(`Missing dependency: ${depId}`);
          health.compatibility -= 20;
        } else {
          // Check version compatibility
          const compatScore = this.calculateVersionCompatibility(module, depModule);
          if (compatScore < 80) {
            health.issues.push(`Low compatibility with ${depId}: ${compatScore}%`);
            health.compatibility = Math.min(health.compatibility, compatScore);
          }
        }
      }

      // Check API compatibility
      await this.validateAPICompatibility(module, health);

      // Determine overall status
      if (health.compatibility < 70) {
        health.status = 'error';
      } else if (health.compatibility < 90) {
        health.status = 'degraded';
      }

      // Update stored health
      this.integrationHealth.set(moduleId, health);

      return health;
    } catch (error) {
      health.status = 'error';
      health.issues.push(`Validation error: ${error.message}`);
      this.integrationHealth.set(moduleId, health);
      return health;
    }
  }

  /**
   * Get integration health for all modules
   */
  getIntegrationHealth(): IntegrationHealth[] {
    return Array.from(this.integrationHealth.values());
  }

  /**
   * Get registered modules
   */
  getRegisteredModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }

  /**
   * Broadcast event to all modules
   */
  broadcastEvent(eventName: string, payload: any): void {
    this.eventBus.emit(`global:${eventName}`, payload);
  }

  /**
   * Subscribe to platform events
   */
  onPlatformEvent(eventName: string, callback: (payload: any) => void): void {
    this.eventBus.on(eventName, callback);
  }

  private initializeEventBus(): void {
    // Setup global event handlers
    this.eventBus.on('module:error', (data) => {
      this.updateModuleHealth(data.moduleId, 'error', [data.error]);
    });

    this.eventBus.on('module:warning', (data) => {
      this.updateModuleHealth(data.moduleId, 'degraded', [data.warning]);
    });

    // Performance monitoring
    this.eventBus.on('module:performance', (data) => {
      this.trackModulePerformance(data.moduleId, data.metrics);
    });
  }

  private validateModule(module: ModuleDefinition): void {
    if (!module.id || !module.name || !module.version) {
      throw new Error('Module must have id, name, and version');
    }

    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} already registered`);
    }

    // Validate APIs
    for (const api of module.apis) {
      if (!api.endpoint || !api.method || !api.description) {
        throw new Error('Invalid API definition in module');
      }
    }

    // Validate events
    for (const event of module.events) {
      if (!event.name || !event.description) {
        throw new Error('Invalid event definition in module');
      }
    }
  }

  private async validateDependencies(module: ModuleDefinition): Promise<void> {
    for (const depId of module.dependencies) {
      if (!this.modules.has(depId)) {
        throw new Error(`Dependency ${depId} not found for module ${module.id}`);
      }
    }
  }

  private setupModuleEventListeners(module: ModuleDefinition, instance: any): void {
    // Listen for module-specific events
    for (const event of module.events) {
      this.eventBus.on(`${module.id}:${event.name}`, (payload) => {
        // Relay to other modules if needed
        this.relayModuleEvent(module.id, event.name, payload);
      });
    }

    // Setup health check listener
    this.eventBus.on(`${module.id}:healthcheck`, () => {
      this.validateCompatibility(module.id);
    });
  }

  private relayModuleEvent(sourceModuleId: string, eventName: string, payload: any): void {
    // Find modules that are interested in this event
    for (const [moduleId, module] of this.modules) {
      if (moduleId !== sourceModuleId && module.dependencies.includes(sourceModuleId)) {
        const instance = this.moduleInstances.get(moduleId);
        if (instance && typeof instance.onModuleEvent === 'function') {
          try {
            instance.onModuleEvent(sourceModuleId, eventName, payload);
          } catch (error) {
            console.error(`Error relaying event to module ${moduleId}:`, error);
          }
        }
      }
    }
  }

  private calculateVersionCompatibility(module: ModuleDefinition, dependency: ModuleDefinition): number {
    // Simple semantic version compatibility check
    const moduleVersion = this.parseVersion(module.version);
    const depVersion = this.parseVersion(dependency.version);

    if (moduleVersion.major !== depVersion.major) {
      return 50; // Major version mismatch
    }

    if (moduleVersion.minor < depVersion.minor) {
      return 80; // Minor version behind
    }

    return 100; // Compatible
  }

  private parseVersion(version: string): { major: number; minor: number; patch: number } {
    const parts = version.split('.').map(Number);
    return {
      major: parts[0] || 0,
      minor: parts[1] || 0,
      patch: parts[2] || 0
    };
  }

  private async validateAPICompatibility(module: ModuleDefinition, health: IntegrationHealth): Promise<void> {
    // Check if module APIs are accessible
    for (const api of module.apis) {
      try {
        // This would normally make actual API calls
        // For now, we'll simulate the check
        if (api.endpoint.includes('/deprecated/')) {
          health.issues.push(`Deprecated API in use: ${api.endpoint}`);
          health.compatibility -= 5;
        }
      } catch (error) {
        health.issues.push(`API validation failed: ${api.endpoint}`);
        health.compatibility -= 10;
      }
    }
  }

  private updateModuleHealth(moduleId: string, status: IntegrationHealth['status'], issues: string[]): void {
    const currentHealth = this.integrationHealth.get(moduleId);
    if (currentHealth) {
      currentHealth.status = status;
      currentHealth.lastCheck = new Date();
      currentHealth.issues.push(...issues);

      // Adjust compatibility based on issues
      if (status === 'error') {
        currentHealth.compatibility = Math.min(currentHealth.compatibility, 50);
      } else if (status === 'degraded') {
        currentHealth.compatibility = Math.min(currentHealth.compatibility, 80);
      }

      this.integrationHealth.set(moduleId, currentHealth);
    }
  }

  private trackModulePerformance(moduleId: string, metrics: any): void {
    // Store performance metrics for later analysis
    this.emit('performance:tracked', { moduleId, metrics, timestamp: new Date() });
  }
}

/**
 * Module Bridge for cross-module communication
 */
export class ModuleBridge {
  constructor(
    private sourceModuleId: string,
    private targetModuleId: string,
    private eventBus: EventEmitter,
    private moduleInstances: Map<string, any>
  ) {}

  /**
   * Send event to target module
   */
  sendEvent(eventName: string, payload: any): void {
    this.eventBus.emit(`${this.targetModuleId}:${eventName}`, {
      source: this.sourceModuleId,
      ...payload
    });
  }

  /**
   * Call target module API
   */
  async callAPI(apiEndpoint: string, data?: any): Promise<any> {
    const targetInstance = this.moduleInstances.get(this.targetModuleId);
    if (!targetInstance) {
      throw new Error(`Target module ${this.targetModuleId} not initialized`);
    }

    if (typeof targetInstance.handleAPICall === 'function') {
      return await targetInstance.handleAPICall(apiEndpoint, data, this.sourceModuleId);
    }

    throw new Error(`Target module ${this.targetModuleId} does not support API calls`);
  }

  /**
   * Listen for events from target module
   */
  onEvent(eventName: string, callback: (payload: any) => void): void {
    this.eventBus.on(`${this.targetModuleId}:${eventName}`, callback);
  }
}

// Export singleton instance
export const platformIntegration = new PlatformIntegrationEngine();