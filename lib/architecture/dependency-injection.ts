/**
 * @fileoverview HT-008.6.2: Dependency Injection and Inversion of Control
 * @module lib/architecture/dependency-injection
 * @author OSS Hero System
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.6.2 - Add dependency injection and inversion of control
 * Focus: Microservice-ready architecture with proper dependency management
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: MEDIUM (architecture refactoring)
 */

import 'reflect-metadata';

/**
 * Dependency Injection Container
 * 
 * Implements a comprehensive dependency injection system with:
 * - Service registration and resolution
 * - Lifecycle management (singleton, transient, scoped)
 * - Interface-based injection
 * - Circular dependency detection
 * - Type-safe resolution
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type ServiceIdentifier = string | symbol | Function;
export type ServiceFactory<T = any> = (container: DIContainer) => T;
export type ServiceResolver<T = any> = () => T;

export enum ServiceLifetime {
  SINGLETON = 'singleton',
  TRANSIENT = 'transient',
  SCOPED = 'scoped'
}

export interface ServiceRegistration<T = any> {
  identifier: ServiceIdentifier;
  factory: ServiceFactory<T>;
  lifetime: ServiceLifetime;
  dependencies: ServiceIdentifier[];
  instance?: T;
  scope?: string;
}

export interface ServiceScope {
  id: string;
  services: Map<ServiceIdentifier, any>;
  parent?: ServiceScope;
}

// ============================================================================
// DEPENDENCY INJECTION CONTAINER
// ============================================================================

export class DIContainer {
  private registrations = new Map<ServiceIdentifier, ServiceRegistration>();
  private singletonInstances = new Map<ServiceIdentifier, any>();
  private scopes = new Map<string, ServiceScope>();
  private currentScope?: ServiceScope;
  private resolutionStack = new Set<ServiceIdentifier>();

  // ============================================================================
  // SERVICE REGISTRATION
  // ============================================================================

  /**
   * Register a service with the container
   */
  register<T>(
    identifier: ServiceIdentifier,
    factory: ServiceFactory<T>,
    lifetime: ServiceLifetime = ServiceLifetime.TRANSIENT,
    dependencies: ServiceIdentifier[] = []
  ): DIContainer {
    this.registrations.set(identifier, {
      identifier,
      factory,
      lifetime,
      dependencies
    });
    return this;
  }

  /**
   * Register a singleton service
   */
  registerSingleton<T>(
    identifier: ServiceIdentifier,
    factory: ServiceFactory<T>,
    dependencies: ServiceIdentifier[] = []
  ): DIContainer {
    return this.register(identifier, factory, ServiceLifetime.SINGLETON, dependencies);
  }

  /**
   * Register a scoped service
   */
  registerScoped<T>(
    identifier: ServiceIdentifier,
    factory: ServiceFactory<T>,
    dependencies: ServiceIdentifier[] = []
  ): DIContainer {
    return this.register(identifier, factory, ServiceLifetime.SCOPED, dependencies);
  }

  /**
   * Register a transient service
   */
  registerTransient<T>(
    identifier: ServiceIdentifier,
    factory: ServiceFactory<T>,
    dependencies: ServiceIdentifier[] = []
  ): DIContainer {
    return this.register(identifier, factory, ServiceLifetime.TRANSIENT, dependencies);
  }

  /**
   * Register an instance as a singleton
   */
  registerInstance<T>(identifier: ServiceIdentifier, instance: T): DIContainer {
    this.singletonInstances.set(identifier, instance);
    this.registrations.set(identifier, {
      identifier,
      factory: () => instance,
      lifetime: ServiceLifetime.SINGLETON,
      dependencies: []
    });
    return this;
  }

  // ============================================================================
  // SERVICE RESOLUTION
  // ============================================================================

  /**
   * Resolve a service from the container
   */
  resolve<T>(identifier: ServiceIdentifier): T {
    // Check for circular dependency
    if (this.resolutionStack.has(identifier)) {
      const stack = Array.from(this.resolutionStack);
      throw new Error(`Circular dependency detected: ${stack.join(' -> ')} -> ${String(identifier)}`);
    }

    // Add to resolution stack
    this.resolutionStack.add(identifier);

    try {
      const registration = this.registrations.get(identifier);
      if (!registration) {
        throw new Error(`Service ${String(identifier)} not registered`);
      }

      // Check if already resolved in current scope
      if (this.currentScope && this.currentScope.services.has(identifier)) {
        return this.currentScope.services.get(identifier);
      }

      // Resolve dependencies
      const dependencies = registration.dependencies.map(dep => this.resolve(dep));

      // Create instance
      const instance = registration.factory(this);

      // Store based on lifetime
      switch (registration.lifetime) {
        case ServiceLifetime.SINGLETON:
          if (!this.singletonInstances.has(identifier)) {
            this.singletonInstances.set(identifier, instance);
          }
          return this.singletonInstances.get(identifier);

        case ServiceLifetime.SCOPED:
          if (this.currentScope) {
            this.currentScope.services.set(identifier, instance);
          }
          return instance;

        case ServiceLifetime.TRANSIENT:
        default:
          return instance;
      }
    } finally {
      // Remove from resolution stack
      this.resolutionStack.delete(identifier);
    }
  }

  /**
   * Try to resolve a service, returning null if not found
   */
  tryResolve<T>(identifier: ServiceIdentifier): T | null {
    try {
      return this.resolve<T>(identifier);
    } catch {
      return null;
    }
  }

  /**
   * Resolve all services of a given type
   */
  resolveAll<T>(identifier: ServiceIdentifier): T[] {
    const services: T[] = [];
    for (const [key, registration] of this.registrations) {
      if (key === identifier) {
        services.push(this.resolve<T>(key));
      }
    }
    return services;
  }

  // ============================================================================
  // SCOPE MANAGEMENT
  // ============================================================================

  /**
   * Create a new service scope
   */
  createScope(scopeId?: string): ServiceScope {
    const id = scopeId || `scope_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const scope: ServiceScope = {
      id,
      services: new Map(),
      parent: this.currentScope
    };
    this.scopes.set(id, scope);
    return scope;
  }

  /**
   * Enter a service scope
   */
  enterScope(scope: ServiceScope): void {
    this.currentScope = scope;
  }

  /**
   * Exit current scope
   */
  exitScope(): void {
    if (this.currentScope?.parent) {
      this.currentScope = this.currentScope.parent;
    } else {
      this.currentScope = undefined;
    }
  }

  /**
   * Dispose a scope and all its services
   */
  disposeScope(scopeId: string): void {
    const scope = this.scopes.get(scopeId);
    if (scope) {
      // Dispose all services in scope
      for (const service of scope.services.values()) {
        if (service && typeof service.dispose === 'function') {
          service.dispose();
        }
      }
      scope.services.clear();
      this.scopes.delete(scopeId);
    }
  }

  // ============================================================================
  // CONTAINER MANAGEMENT
  // ============================================================================

  /**
   * Check if a service is registered
   */
  isRegistered(identifier: ServiceIdentifier): boolean {
    return this.registrations.has(identifier) || this.singletonInstances.has(identifier);
  }

  /**
   * Get all registered service identifiers
   */
  getRegisteredServices(): ServiceIdentifier[] {
    return Array.from(this.registrations.keys());
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.registrations.clear();
    this.singletonInstances.clear();
    this.scopes.clear();
    this.currentScope = undefined;
    this.resolutionStack.clear();
  }

  /**
   * Dispose the container and all services
   */
  dispose(): void {
    // Dispose all singleton services
    for (const service of this.singletonInstances.values()) {
      if (service && typeof service.dispose === 'function') {
        service.dispose();
      }
    }

    // Dispose all scoped services
    for (const scope of this.scopes.values()) {
      for (const service of scope.services.values()) {
        if (service && typeof service.dispose === 'function') {
          service.dispose();
        }
      }
    }

    this.clear();
  }

  // ============================================================================
  // VALIDATION AND DIAGNOSTICS
  // ============================================================================

  /**
   * Validate all registrations
   */
  validate(): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    for (const [identifier, registration] of this.registrations) {
      // Check dependencies
      for (const dependency of registration.dependencies) {
        if (!this.isRegistered(dependency)) {
          errors.push(`Service ${String(identifier)} depends on unregistered service ${String(dependency)}`);
        }
      }

      // Check for potential circular dependencies
      if (this.hasCircularDependency(identifier)) {
        warnings.push(`Potential circular dependency detected for service ${String(identifier)}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private hasCircularDependency(identifier: ServiceIdentifier): boolean {
    const visited = new Set<ServiceIdentifier>();
    const recursionStack = new Set<ServiceIdentifier>();

    const dfs = (current: ServiceIdentifier): boolean => {
      if (recursionStack.has(current)) return true;
      if (visited.has(current)) return false;

      visited.add(current);
      recursionStack.add(current);

      const registration = this.registrations.get(current);
      if (registration) {
        for (const dependency of registration.dependencies) {
          if (dfs(dependency)) return true;
        }
      }

      recursionStack.delete(current);
      return false;
    };

    return dfs(identifier);
  }

  /**
   * Get dependency graph
   */
  getDependencyGraph(): DependencyGraph {
    const graph: DependencyGraph = {};

    for (const [identifier, registration] of this.registrations) {
      graph[String(identifier)] = registration.dependencies.map(String);
    }

    return graph;
  }
}

// ============================================================================
// DECORATORS
// ============================================================================

/**
 * Injectable decorator for marking classes as injectable
 */
export function Injectable(identifier?: ServiceIdentifier) {
  return function <T extends new (...args: any[]) => any>(target: T): T {
    const serviceId = identifier || target;
    // Store metadata for later registration
    (target as any).__di_identifier = serviceId;
    return target;
  };
}

/**
 * Inject decorator for constructor parameters
 */
export function Inject(identifier: ServiceIdentifier) {
  return function (target: any, propertyKey: string | symbol | undefined, parameterIndex: number) {
    const existingTokens = (Reflect as any).getMetadata('design:paramtypes', target) || [];
    existingTokens[parameterIndex] = identifier;
    (Reflect as any).defineMetadata('design:paramtypes', existingTokens, target);
  };
}

// ============================================================================
// SERVICE LOCATOR PATTERN
// ============================================================================

export class ServiceLocator {
  private static container: DIContainer;

  static setContainer(container: DIContainer): void {
    ServiceLocator.container = container;
  }

  static get<T>(identifier: ServiceIdentifier): T {
    if (!ServiceLocator.container) {
      throw new Error('ServiceLocator container not initialized');
    }
    return ServiceLocator.container.resolve<T>(identifier);
  }

  static tryGet<T>(identifier: ServiceIdentifier): T | null {
    if (!ServiceLocator.container) {
      return null;
    }
    return ServiceLocator.container.tryResolve<T>(identifier);
  }
}

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface DependencyGraph {
  [serviceId: string]: string[];
}

// ============================================================================
// SINGLETON CONTAINER
// ============================================================================

export const container = new DIContainer();

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a service factory from a class constructor
 */
export function createServiceFactory<T>(
  constructor: new (...args: any[]) => T,
  dependencies: ServiceIdentifier[] = []
): ServiceFactory<T> {
  return (container: DIContainer) => {
    const resolvedDependencies = dependencies.map(dep => container.resolve(dep));
    return new constructor(...resolvedDependencies);
  };
}

/**
 * Auto-register all injectable services
 */
export function autoRegisterServices(container: DIContainer, modules: any[]): void {
  for (const module of modules) {
    if (module && typeof module === 'object') {
      for (const [key, value] of Object.entries(module)) {
        if (value && typeof value === 'function' && (value as any).__di_identifier) {
          const identifier = (value as any).__di_identifier;
          container.registerSingleton(identifier, createServiceFactory(value as new (...args: any[]) => unknown));
        }
      }
    }
  }
}

export default container;
