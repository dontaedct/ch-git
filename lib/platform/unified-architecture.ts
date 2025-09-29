/**
 * Unified Architecture System
 * Provides cohesive system architecture and component relationships
 */

export interface ArchitectureLayer {
  name: string;
  level: number;
  components: ComponentDefinition[];
  dependencies: string[];
  responsibilities: string[];
}

export interface ComponentDefinition {
  id: string;
  name: string;
  type: 'service' | 'api' | 'ui' | 'data' | 'integration' | 'security';
  location: string;
  interfaces: ComponentInterface[];
  metrics: ComponentMetrics;
}

export interface ComponentInterface {
  name: string;
  type: 'rest' | 'graphql' | 'event' | 'websocket' | 'grpc';
  endpoint?: string;
  events?: string[];
  authentication: boolean;
}

export interface ComponentMetrics {
  uptime: number;
  latency: number;
  throughput: number;
  errorRate: number;
  lastUpdated: Date;
}

export interface DataFlow {
  id: string;
  name: string;
  source: string;
  target: string;
  type: 'sync' | 'async' | 'stream';
  protocol: string;
  security: SecurityPolicy;
}

export interface SecurityPolicy {
  authentication: 'required' | 'optional' | 'none';
  authorization: string[];
  encryption: 'tls' | 'e2e' | 'none';
  rateLimit?: number;
}

export class UnifiedArchitecture {
  private layers: Map<string, ArchitectureLayer> = new Map();
  private components: Map<string, ComponentDefinition> = new Map();
  private dataFlows: Map<string, DataFlow> = new Map();
  private dependencyGraph: Map<string, string[]> = new Map();

  constructor() {
    this.initializeArchitecture();
  }

  /**
   * Get complete architecture overview
   */
  getArchitectureOverview(): {
    layers: ArchitectureLayer[];
    components: ComponentDefinition[];
    dataFlows: DataFlow[];
    healthScore: number;
  } {
    const healthScore = this.calculateArchitectureHealth();

    return {
      layers: Array.from(this.layers.values()).sort((a, b) => a.level - b.level),
      components: Array.from(this.components.values()),
      dataFlows: Array.from(this.dataFlows.values()),
      healthScore
    };
  }

  /**
   * Get component by ID
   */
  getComponent(componentId: string): ComponentDefinition | undefined {
    return this.components.get(componentId);
  }

  /**
   * Get components by layer
   */
  getComponentsByLayer(layerName: string): ComponentDefinition[] {
    const layer = this.layers.get(layerName);
    return layer ? layer.components : [];
  }

  /**
   * Get component dependencies
   */
  getComponentDependencies(componentId: string): string[] {
    return this.dependencyGraph.get(componentId) || [];
  }

  /**
   * Validate architecture integrity
   */
  validateArchitecture(): {
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // Check circular dependencies
    const circularDeps = this.detectCircularDependencies();
    if (circularDeps.length > 0) {
      issues.push(`Circular dependencies detected: ${circularDeps.join(', ')}`);
      recommendations.push('Refactor components to eliminate circular dependencies');
    }

    // Check layer violations
    const layerViolations = this.detectLayerViolations();
    if (layerViolations.length > 0) {
      issues.push(`Layer violations detected: ${layerViolations.join(', ')}`);
      recommendations.push('Ensure components only depend on lower-level layers');
    }

    // Check interface compatibility
    const interfaceIssues = this.validateInterfaces();
    issues.push(...interfaceIssues);

    // Check security policies
    const securityIssues = this.validateSecurityPolicies();
    issues.push(...securityIssues);

    // Generate recommendations based on analysis
    if (this.components.size > 50) {
      recommendations.push('Consider breaking down large components into smaller, focused services');
    }

    const lowPerformanceComponents = this.findLowPerformanceComponents();
    if (lowPerformanceComponents.length > 0) {
      recommendations.push(`Optimize performance for: ${lowPerformanceComponents.join(', ')}`);
    }

    return {
      isValid: issues.length === 0,
      issues,
      recommendations
    };
  }

  /**
   * Update component metrics
   */
  updateComponentMetrics(componentId: string, metrics: Partial<ComponentMetrics>): void {
    const component = this.components.get(componentId);
    if (component) {
      component.metrics = {
        ...component.metrics,
        ...metrics,
        lastUpdated: new Date()
      };
      this.components.set(componentId, component);
    }
  }

  /**
   * Add new data flow
   */
  addDataFlow(dataFlow: DataFlow): void {
    this.dataFlows.set(dataFlow.id, dataFlow);
  }

  /**
   * Get critical path analysis
   */
  getCriticalPath(): {
    path: string[];
    bottlenecks: string[];
    recommendations: string[];
  } {
    // Analyze data flows to find critical paths
    const criticalComponents = this.findCriticalComponents();
    const bottlenecks = this.findBottlenecks();

    return {
      path: criticalComponents,
      bottlenecks,
      recommendations: this.generateCriticalPathRecommendations(criticalComponents, bottlenecks)
    };
  }

  private initializeArchitecture(): void {
    // Define architecture layers
    this.defineArchitectureLayers();

    // Register core components
    this.registerCoreComponents();

    // Define data flows
    this.defineDataFlows();

    // Build dependency graph
    this.buildDependencyGraph();
  }

  private defineArchitectureLayers(): void {
    const layers: ArchitectureLayer[] = [
      {
        name: 'presentation',
        level: 1,
        components: [],
        dependencies: ['business', 'integration'],
        responsibilities: ['User Interface', 'User Experience', 'Client-side Logic']
      },
      {
        name: 'business',
        level: 2,
        components: [],
        dependencies: ['data', 'integration'],
        responsibilities: ['Business Logic', 'Workflow Management', 'Validation']
      },
      {
        name: 'integration',
        level: 3,
        components: [],
        dependencies: ['data', 'security'],
        responsibilities: ['API Gateway', 'Service Integration', 'Event Handling']
      },
      {
        name: 'data',
        level: 4,
        components: [],
        dependencies: ['security'],
        responsibilities: ['Data Storage', 'Data Access', 'Caching']
      },
      {
        name: 'security',
        level: 5,
        components: [],
        dependencies: [],
        responsibilities: ['Authentication', 'Authorization', 'Encryption']
      }
    ];

    layers.forEach(layer => this.layers.set(layer.name, layer));
  }

  private registerCoreComponents(): void {
    const components: ComponentDefinition[] = [
      // Presentation Layer
      {
        id: 'agency-toolkit-ui',
        name: 'Agency Toolkit UI',
        type: 'ui',
        location: 'app/agency-toolkit',
        interfaces: [
          {
            name: 'Web Interface',
            type: 'rest',
            endpoint: '/agency-toolkit',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },
      {
        id: 'platform-dashboard',
        name: 'Platform Dashboard',
        type: 'ui',
        location: 'app/agency-toolkit/platform',
        interfaces: [
          {
            name: 'Dashboard API',
            type: 'rest',
            endpoint: '/api/platform',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },

      // Business Layer
      {
        id: 'ai-generator',
        name: 'AI App Generator',
        type: 'service',
        location: 'lib/ai/app-generator.ts',
        interfaces: [
          {
            name: 'Generation API',
            type: 'rest',
            endpoint: '/api/ai/generate',
            authentication: true
          },
          {
            name: 'Generation Events',
            type: 'event',
            events: ['generation:started', 'generation:completed', 'generation:failed'],
            authentication: false
          }
        ],
        metrics: this.createDefaultMetrics()
      },
      {
        id: 'form-builder',
        name: 'Advanced Form Builder',
        type: 'service',
        location: 'lib/forms',
        interfaces: [
          {
            name: 'Form Builder API',
            type: 'rest',
            endpoint: '/api/forms',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },

      // Integration Layer
      {
        id: 'platform-integration',
        name: 'Platform Integration Engine',
        type: 'integration',
        location: 'lib/platform/integration-engine.ts',
        interfaces: [
          {
            name: 'Module Registration',
            type: 'rest',
            endpoint: '/api/platform/modules',
            authentication: true
          },
          {
            name: 'Event Bus',
            type: 'event',
            events: ['module:registered', 'module:initialized', 'module:error'],
            authentication: false
          }
        ],
        metrics: this.createDefaultMetrics()
      },
      {
        id: 'webhook-system',
        name: 'Webhook System',
        type: 'integration',
        location: 'lib/webhooks',
        interfaces: [
          {
            name: 'Webhook API',
            type: 'rest',
            endpoint: '/api/webhooks',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },

      // Data Layer
      {
        id: 'supabase-client',
        name: 'Supabase Client',
        type: 'data',
        location: 'lib/supabase',
        interfaces: [
          {
            name: 'Database API',
            type: 'rest',
            endpoint: 'https://supabase.co/api',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },
      {
        id: 'cache-system',
        name: 'Cache System',
        type: 'data',
        location: 'lib/caching',
        interfaces: [
          {
            name: 'Cache API',
            type: 'rest',
            endpoint: '/api/cache',
            authentication: false
          }
        ],
        metrics: this.createDefaultMetrics()
      },

      // Security Layer
      {
        id: 'guardian-security',
        name: 'Guardian Security System',
        type: 'security',
        location: 'lib/security/guardian-integration.ts',
        interfaces: [
          {
            name: 'Security API',
            type: 'rest',
            endpoint: '/api/security',
            authentication: true
          }
        ],
        metrics: this.createDefaultMetrics()
      },
      {
        id: 'auth-system',
        name: 'Authentication System',
        type: 'security',
        location: 'lib/auth',
        interfaces: [
          {
            name: 'Auth API',
            type: 'rest',
            endpoint: '/api/auth',
            authentication: false
          }
        ],
        metrics: this.createDefaultMetrics()
      }
    ];

    // Assign components to layers and register
    components.forEach(component => {
      this.components.set(component.id, component);

      // Assign to appropriate layer
      const layerName = this.determineComponentLayer(component.type);
      const layer = this.layers.get(layerName);
      if (layer) {
        layer.components.push(component);
        this.layers.set(layerName, layer);
      }
    });
  }

  private defineDataFlows(): void {
    const flows: DataFlow[] = [
      {
        id: 'ui-to-ai-generation',
        name: 'UI to AI Generation',
        source: 'agency-toolkit-ui',
        target: 'ai-generator',
        type: 'async',
        protocol: 'HTTP/REST',
        security: {
          authentication: 'required',
          authorization: ['create:apps'],
          encryption: 'tls'
        }
      },
      {
        id: 'ai-to-database',
        name: 'AI Generation to Database',
        source: 'ai-generator',
        target: 'supabase-client',
        type: 'sync',
        protocol: 'HTTP/REST',
        security: {
          authentication: 'required',
          authorization: ['write:apps'],
          encryption: 'tls'
        }
      },
      {
        id: 'form-builder-cache',
        name: 'Form Builder to Cache',
        source: 'form-builder',
        target: 'cache-system',
        type: 'sync',
        protocol: 'HTTP/REST',
        security: {
          authentication: 'optional',
          authorization: [],
          encryption: 'tls'
        }
      },
      {
        id: 'security-all-components',
        name: 'Security Layer Protection',
        source: 'guardian-security',
        target: '*',
        type: 'sync',
        protocol: 'Middleware',
        security: {
          authentication: 'required',
          authorization: ['security:check'],
          encryption: 'e2e'
        }
      }
    ];

    flows.forEach(flow => this.dataFlows.set(flow.id, flow));
  }

  private buildDependencyGraph(): void {
    // Build dependency relationships
    this.dependencyGraph.set('agency-toolkit-ui', ['ai-generator', 'form-builder', 'platform-integration']);
    this.dependencyGraph.set('platform-dashboard', ['platform-integration', 'guardian-security']);
    this.dependencyGraph.set('ai-generator', ['supabase-client', 'cache-system', 'guardian-security']);
    this.dependencyGraph.set('form-builder', ['supabase-client', 'cache-system', 'guardian-security']);
    this.dependencyGraph.set('platform-integration', ['webhook-system', 'guardian-security']);
    this.dependencyGraph.set('webhook-system', ['supabase-client', 'guardian-security']);
    this.dependencyGraph.set('supabase-client', ['auth-system']);
    this.dependencyGraph.set('cache-system', ['auth-system']);
    this.dependencyGraph.set('guardian-security', ['auth-system']);
    this.dependencyGraph.set('auth-system', []);
  }

  private createDefaultMetrics(): ComponentMetrics {
    return {
      uptime: 99.5,
      latency: 150,
      throughput: 1000,
      errorRate: 0.1,
      lastUpdated: new Date()
    };
  }

  private determineComponentLayer(type: string): string {
    switch (type) {
      case 'ui': return 'presentation';
      case 'service': return 'business';
      case 'integration': return 'integration';
      case 'data': return 'data';
      case 'security': return 'security';
      default: return 'business';
    }
  }

  private calculateArchitectureHealth(): number {
    const components = Array.from(this.components.values());
    if (components.length === 0) return 100;

    const totalHealth = components.reduce((sum, component) => {
      const componentHealth = (
        component.metrics.uptime +
        (100 - component.metrics.errorRate) +
        Math.min(100, 200 - component.metrics.latency / 10)
      ) / 3;
      return sum + componentHealth;
    }, 0);

    return Math.round(totalHealth / components.length);
  }

  private detectCircularDependencies(): string[] {
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cycles: string[] = [];

    const dfs = (componentId: string, path: string[]): void => {
      if (recursionStack.has(componentId)) {
        cycles.push(path.join(' -> '));
        return;
      }

      if (visited.has(componentId)) return;

      visited.add(componentId);
      recursionStack.add(componentId);

      const dependencies = this.dependencyGraph.get(componentId) || [];
      for (const dep of dependencies) {
        dfs(dep, [...path, dep]);
      }

      recursionStack.delete(componentId);
    };

    for (const componentId of this.components.keys()) {
      if (!visited.has(componentId)) {
        dfs(componentId, [componentId]);
      }
    }

    return cycles;
  }

  private detectLayerViolations(): string[] {
    const violations: string[] = [];

    for (const [componentId, dependencies] of this.dependencyGraph) {
      const component = this.components.get(componentId);
      if (!component) continue;

      const componentLayer = this.findComponentLayer(componentId);
      if (!componentLayer) continue;

      for (const depId of dependencies) {
        const depComponent = this.components.get(depId);
        if (!depComponent) continue;

        const depLayer = this.findComponentLayer(depId);
        if (!depLayer) continue;

        // Check if dependency is in a higher layer (violation)
        if (depLayer.level < componentLayer.level) {
          violations.push(`${componentId} (${componentLayer.name}) depends on ${depId} (${depLayer.name})`);
        }
      }
    }

    return violations;
  }

  private findComponentLayer(componentId: string): ArchitectureLayer | undefined {
    for (const layer of this.layers.values()) {
      if (layer.components.some(c => c.id === componentId)) {
        return layer;
      }
    }
    return undefined;
  }

  private validateInterfaces(): string[] {
    const issues: string[] = [];

    for (const component of this.components.values()) {
      for (const iface of component.interfaces) {
        // Check for missing authentication on sensitive endpoints
        if (iface.endpoint?.includes('/admin') && !iface.authentication) {
          issues.push(`Admin endpoint ${iface.endpoint} lacks authentication in ${component.name}`);
        }

        // Check for deprecated interface types
        if (iface.type === 'rest' && iface.endpoint?.includes('/v1/')) {
          issues.push(`Deprecated API version in use: ${iface.endpoint} in ${component.name}`);
        }
      }
    }

    return issues;
  }

  private validateSecurityPolicies(): string[] {
    const issues: string[] = [];

    for (const flow of this.dataFlows.values()) {
      // Check for unencrypted sensitive data flows
      if (flow.source.includes('auth') || flow.target.includes('auth')) {
        if (flow.security.encryption === 'none') {
          issues.push(`Unencrypted authentication flow: ${flow.name}`);
        }
      }

      // Check for missing rate limiting on public endpoints
      if (flow.security.authentication === 'none' && !flow.security.rateLimit) {
        issues.push(`Public endpoint without rate limiting: ${flow.name}`);
      }
    }

    return issues;
  }

  private findLowPerformanceComponents(): string[] {
    return Array.from(this.components.values())
      .filter(component =>
        component.metrics.latency > 500 ||
        component.metrics.errorRate > 5 ||
        component.metrics.uptime < 95
      )
      .map(component => component.name);
  }

  private findCriticalComponents(): string[] {
    // Components that are dependencies for many others
    const dependencyCounts = new Map<string, number>();

    for (const dependencies of this.dependencyGraph.values()) {
      for (const dep of dependencies) {
        dependencyCounts.set(dep, (dependencyCounts.get(dep) || 0) + 1);
      }
    }

    return Array.from(dependencyCounts.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1])
      .map(([componentId]) => componentId);
  }

  private findBottlenecks(): string[] {
    return Array.from(this.components.values())
      .filter(component =>
        component.metrics.latency > 300 &&
        component.metrics.throughput < 500
      )
      .map(component => component.id);
  }

  private generateCriticalPathRecommendations(critical: string[], bottlenecks: string[]): string[] {
    const recommendations: string[] = [];

    if (critical.length > 0) {
      recommendations.push(`Monitor critical components closely: ${critical.join(', ')}`);
      recommendations.push('Implement redundancy for critical components');
    }

    if (bottlenecks.length > 0) {
      recommendations.push(`Optimize performance bottlenecks: ${bottlenecks.join(', ')}`);
      recommendations.push('Consider load balancing for bottleneck components');
    }

    if (critical.some(c => bottlenecks.includes(c))) {
      recommendations.push('URGENT: Critical components are also bottlenecks - immediate optimization required');
    }

    return recommendations;
  }
}

// Export singleton instance
export const unifiedArchitecture = new UnifiedArchitecture();