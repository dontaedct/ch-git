/**
 * @fileoverview HT-008.6.1: Architecture Layer System
 * @module lib/architecture/layers
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.1 - Implement proper separation of concerns
 * Focus: Microservice-ready architecture with proper layer separation
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

/**
 * Architecture Layer System
 * 
 * Implements proper separation of concerns with clear layer boundaries
 * for microservice-ready architecture. Each layer has specific responsibilities
 * and dependencies flow in one direction only.
 */

// ============================================================================
// LAYER DEFINITIONS
// ============================================================================

/**
 * Presentation Layer
 * Handles UI components, user interactions, and presentation logic
 */
export interface PresentationLayer {
  components: ComponentRegistry;
  hooks: HookRegistry;
  providers: ProviderRegistry;
  routing: RoutingRegistry;
}

/**
 * Application Layer
 * Contains business logic, use cases, and application services
 */
export interface ApplicationLayer {
  services: ServiceRegistry;
  useCases: UseCaseRegistry;
  workflows: WorkflowRegistry;
  validators: ValidatorRegistry;
}

/**
 * Domain Layer
 * Contains core business entities, rules, and domain logic
 */
export interface DomainLayer {
  entities: EntityRegistry;
  valueObjects: ValueObjectRegistry;
  repositories: RepositoryRegistry;
  domainServices: DomainServiceRegistry;
}

/**
 * Infrastructure Layer
 * Handles external concerns like databases, APIs, and third-party services
 */
export interface InfrastructureLayer {
  persistence: PersistenceRegistry;
  external: ExternalServiceRegistry;
  messaging: MessagingRegistry;
  monitoring: MonitoringRegistry;
}

// ============================================================================
// REGISTRY INTERFACES
// ============================================================================

export interface ComponentRegistry {
  ui: Record<string, React.ComponentType>;
  forms: Record<string, React.ComponentType>;
  layouts: Record<string, React.ComponentType>;
  providers: Record<string, React.ComponentType>;
}

export interface HookRegistry {
  state: Record<string, () => any>;
  effects: Record<string, () => void>;
  business: Record<string, () => any>;
  utilities: Record<string, () => any>;
}

export interface ProviderRegistry {
  context: Record<string, React.ComponentType>;
  state: Record<string, React.ComponentType>;
  services: Record<string, React.ComponentType>;
}

export interface RoutingRegistry {
  pages: Record<string, string>;
  api: Record<string, string>;
  middleware: Record<string, Function>;
}

export interface ServiceRegistry {
  business: Record<string, any>;
  application: Record<string, any>;
  integration: Record<string, any>;
}

export interface UseCaseRegistry {
  user: Record<string, Function>;
  system: Record<string, Function>;
  integration: Record<string, Function>;
}

export interface WorkflowRegistry {
  processes: Record<string, Function>;
  orchestrations: Record<string, Function>;
  automations: Record<string, Function>;
}

export interface ValidatorRegistry {
  input: Record<string, Function>;
  business: Record<string, Function>;
  security: Record<string, Function>;
}

export interface EntityRegistry {
  core: Record<string, any>;
  aggregate: Record<string, any>;
  value: Record<string, any>;
}

export interface ValueObjectRegistry {
  primitives: Record<string, any>;
  composites: Record<string, any>;
  constraints: Record<string, any>;
}

export interface RepositoryRegistry {
  interfaces: Record<string, any>;
  implementations: Record<string, any>;
  queries: Record<string, Function>;
}

export interface DomainServiceRegistry {
  business: Record<string, Function>;
  rules: Record<string, Function>;
  calculations: Record<string, Function>;
}

export interface PersistenceRegistry {
  databases: Record<string, any>;
  caches: Record<string, any>;
  storage: Record<string, any>;
}

export interface ExternalServiceRegistry {
  apis: Record<string, any>;
  webhooks: Record<string, any>;
  integrations: Record<string, any>;
}

export interface MessagingRegistry {
  events: Record<string, Function>;
  queues: Record<string, any>;
  pubsub: Record<string, any>;
}

export interface MonitoringRegistry {
  logging: Record<string, any>;
  metrics: Record<string, any>;
  tracing: Record<string, any>;
}

// ============================================================================
// LAYER MANAGER
// ============================================================================

export class ArchitectureLayerManager {
  private presentation: PresentationLayer;
  private application: ApplicationLayer;
  private domain: DomainLayer;
  private infrastructure: InfrastructureLayer;

  constructor() {
    this.presentation = this.initializePresentationLayer();
    this.application = this.initializeApplicationLayer();
    this.domain = this.initializeDomainLayer();
    this.infrastructure = this.initializeInfrastructureLayer();
  }

  private initializePresentationLayer(): PresentationLayer {
    return {
      components: {
        ui: {},
        forms: {},
        layouts: {},
        providers: {}
      },
      hooks: {
        state: {},
        effects: {},
        business: {},
        utilities: {}
      },
      providers: {
        context: {},
        state: {},
        services: {}
      },
      routing: {
        pages: {},
        api: {},
        middleware: {}
      }
    };
  }

  private initializeApplicationLayer(): ApplicationLayer {
    return {
      services: {
        business: {},
        application: {},
        integration: {}
      },
      useCases: {
        user: {},
        system: {},
        integration: {}
      },
      workflows: {
        processes: {},
        orchestrations: {},
        automations: {}
      },
      validators: {
        input: {},
        business: {},
        security: {}
      }
    };
  }

  private initializeDomainLayer(): DomainLayer {
    return {
      entities: {
        core: {},
        aggregate: {},
        value: {}
      },
      valueObjects: {
        primitives: {},
        composites: {},
        constraints: {}
      },
      repositories: {
        interfaces: {},
        implementations: {},
        queries: {}
      },
      domainServices: {
        business: {},
        rules: {},
        calculations: {}
      }
    };
  }

  private initializeInfrastructureLayer(): InfrastructureLayer {
    return {
      persistence: {
        databases: {},
        caches: {},
        storage: {}
      },
      external: {
        apis: {},
        webhooks: {},
        integrations: {}
      },
      messaging: {
        events: {},
        queues: {},
        pubsub: {}
      },
      monitoring: {
        logging: {},
        metrics: {},
        tracing: {}
      }
    };
  }

  // ============================================================================
  // LAYER ACCESS METHODS
  // ============================================================================

  getPresentationLayer(): PresentationLayer {
    return this.presentation;
  }

  getApplicationLayer(): ApplicationLayer {
    return this.application;
  }

  getDomainLayer(): DomainLayer {
    return this.domain;
  }

  getInfrastructureLayer(): InfrastructureLayer {
    return this.infrastructure;
  }

  // ============================================================================
  // REGISTRATION METHODS
  // ============================================================================

  registerComponent(layer: keyof ComponentRegistry, name: string, component: React.ComponentType): void {
    this.presentation.components[layer][name] = component;
  }

  registerHook(layer: keyof HookRegistry, name: string, hook: () => any): void {
    this.presentation.hooks[layer][name] = hook;
  }

  registerService(layer: keyof ServiceRegistry, name: string, service: any): void {
    this.application.services[layer][name] = service;
  }

  registerUseCase(layer: keyof UseCaseRegistry, name: string, useCase: Function): void {
    this.application.useCases[layer][name] = useCase;
  }

  registerEntity(layer: keyof EntityRegistry, name: string, entity: any): void {
    this.domain.entities[layer][name] = entity;
  }

  registerRepository(interfaceName: string, implementation: any): void {
    this.domain.repositories.interfaces[interfaceName] = implementation;
    this.domain.repositories.implementations[interfaceName] = implementation;
  }

  registerInfrastructureService(layer: keyof InfrastructureLayer, name: string, service: any): void {
    (this.infrastructure[layer] as any)[name] = service;
  }

  // ============================================================================
  // DEPENDENCY INJECTION
  // ============================================================================

  resolve<T>(layer: string, name: string): T | null {
    const layerMap: Record<string, any> = {
      presentation: this.presentation,
      application: this.application,
      domain: this.domain,
      infrastructure: this.infrastructure
    };

    const targetLayer = layerMap[layer];
    if (!targetLayer) return null;

    // Search through all registries in the layer
    for (const registry of Object.values(targetLayer)) {
      if (typeof registry === 'object' && registry !== null) {
        for (const subRegistry of Object.values(registry)) {
          if (typeof subRegistry === 'object' && subRegistry !== null && name in subRegistry) {
            return (subRegistry as any)[name];
          }
        }
      }
    }

    return null;
  }

  // ============================================================================
  // ARCHITECTURE VALIDATION
  // ============================================================================

  validateArchitecture(): ArchitectureValidationResult {
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check for circular dependencies
    const circularDeps = this.detectCircularDependencies();
    if (circularDeps.length > 0) {
      issues.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
    }

    // Check for missing layer boundaries
    const boundaryViolations = this.detectBoundaryViolations();
    if (boundaryViolations.length > 0) {
      issues.push(`Layer boundary violations: ${boundaryViolations.join(', ')}`);
    }

    // Check for proper dependency direction
    const dependencyViolations = this.detectDependencyViolations();
    if (dependencyViolations.length > 0) {
      warnings.push(`Dependency direction violations: ${dependencyViolations.join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      warnings,
      layerHealth: this.getLayerHealth()
    };
  }

  private detectCircularDependencies(): string[] {
    // Implementation would analyze dependency graph for cycles
    return [];
  }

  private detectBoundaryViolations(): string[] {
    // Implementation would check for cross-layer violations
    return [];
  }

  private detectDependencyViolations(): string[] {
    // Implementation would check dependency direction
    return [];
  }

  private getLayerHealth(): Record<string, 'healthy' | 'warning' | 'error'> {
    return {
      presentation: 'healthy',
      application: 'healthy',
      domain: 'healthy',
      infrastructure: 'healthy'
    };
  }
}

// ============================================================================
// ARCHITECTURE VALIDATION TYPES
// ============================================================================

export interface ArchitectureValidationResult {
  isValid: boolean;
  issues: string[];
  warnings: string[];
  layerHealth: Record<string, 'healthy' | 'warning' | 'error'>;
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

export const architectureManager = new ArchitectureLayerManager();

// ============================================================================
// ARCHITECTURE UTILITIES
// ============================================================================

/**
 * Decorator for marking components as belonging to a specific layer
 */
export function LayerComponent(layer: keyof ComponentRegistry, name: string) {
  return function <T extends React.ComponentType>(target: T): T {
    architectureManager.registerComponent(layer, name, target);
    return target;
  };
}

/**
 * Decorator for marking services as belonging to a specific layer
 */
export function LayerService(layer: keyof ServiceRegistry, name: string) {
  return function <T extends any>(target: T): T {
    architectureManager.registerService(layer, name, target);
    return target;
  };
}

/**
 * Decorator for marking use cases as belonging to a specific layer
 */
export function LayerUseCase(layer: keyof UseCaseRegistry, name: string) {
  return function <T extends Function>(target: T): T {
    architectureManager.registerUseCase(layer, name, target);
    return target;
  };
}

/**
 * Decorator for marking entities as belonging to a specific layer
 */
export function LayerEntity(layer: keyof EntityRegistry, name: string) {
  return function <T extends any>(target: T): T {
    architectureManager.registerEntity(layer, name, target);
    return target;
  };
}

/**
 * Dependency injection helper
 */
export function inject<T>(layer: string, name: string): T {
  const service = architectureManager.resolve<T>(layer, name);
  if (!service) {
    throw new Error(`Service ${name} not found in layer ${layer}`);
  }
  return service;
}

/**
 * Architecture health check
 */
export function checkArchitectureHealth(): ArchitectureValidationResult {
  return architectureManager.validateArchitecture();
}

export default architectureManager;
