/**
 * @fileoverview Agency Toolkit Foundation - Central Export Module
 * @module lib/agency-toolkit/index
 * @author HT-021.4.2
 * @version 1.0.0
 *
 * HT-021.4.2: Agency Toolkit Foundation & Client Security
 *
 * Central module for agency toolkit foundation interfaces, providing
 * template system, integration hooks, and client security boundaries
 * for rapid client micro-app delivery.
 */

// Template System Foundation
export {
  type ClientTemplate,
  type TemplateLayout,
  type NavigationItem,
  type ClientThemeConfig,
  type ComponentOverride,
  type TemplateDeployment,
  type DeploymentConfig,
  TemplateSystemManager,
  templateSystem,
  DEFAULT_TEMPLATES,
  DEFAULT_THEME,
} from './template-system';

// Integration Layer Hooks
export {
  type IntegrationHook,
  type IntegrationHookType,
  type HookConfiguration,
  type HookExecution,
  type HookExecutionResult,
  type ClientIntegration,
  IntegrationHookManager,
  integrationManager,
  useIntegrationHooks,
  DEFAULT_INTEGRATION_HOOKS,
} from './integration-hooks';

// Client Security Boundaries
export {
  type ClientSecurityConfig,
  type ClientSecurityBoundary,
  type ResourceIsolationRules,
  type SecurityPolicy,
  type PolicyRule,
  type ClientSession,
  type SecurityViolation,
  ClientSecurityManager,
  clientSecurityManager,
  DEFAULT_SECURITY_CONFIGS,
} from './client-security';

/**
 * Agency Toolkit Foundation Summary
 *
 * This module provides the foundational architecture for the agency toolkit,
 * enabling rapid delivery of customized client micro-apps with:
 *
 * 1. Template System:
 *    - Predefined templates for common use cases (dashboard, landing, auth)
 *    - Client-specific theming and branding
 *    - Component override system
 *    - Deployment management
 *
 * 2. Integration Hooks:
 *    - Extensible hook system for client integrations
 *    - Support for auth, data, payment, notification hooks
 *    - Execution tracking and error handling
 *    - React hooks for easy integration
 *
 * 3. Client Security:
 *    - Multi-tenant security boundaries
 *    - Resource isolation (database, storage, API, cache)
 *    - Configurable security policies by tier
 *    - Rate limiting and access control
 *    - Session management and audit logging
 *
 * Usage Example:
 *
 * ```typescript
 * import {
 *   templateSystem,
 *   integrationManager,
 *   clientSecurityManager,
 *   DEFAULT_TEMPLATES,
 *   DEFAULT_SECURITY_CONFIGS
 * } from '@/lib/agency-toolkit';
 *
 * // Create client template
 * const template = await templateSystem.createTemplate({
 *   name: 'Client Dashboard',
 *   category: 'dashboard',
 *   client: { id: 'client-123', name: 'Acme Corp' },
 *   layout: DEFAULT_TEMPLATES.DASHBOARD.layout,
 *   theme: customTheme,
 *   components: {}
 * });
 *
 * // Setup client security
 * const securityConfig = {
 *   ...DEFAULT_SECURITY_CONFIGS.STANDARD,
 *   clientId: 'client-123',
 *   clientName: 'Acme Corp',
 *   allowedDomains: ['acme.com']
 * };
 * await clientSecurityManager.createSecurityBoundary(securityConfig);
 *
 * // Register integration hooks
 * await integrationManager.registerHook({
 *   name: 'Payment Processing',
 *   type: 'payment',
 *   clientId: 'client-123',
 *   config: { endpoint: 'https://api.stripe.com' },
 *   enabled: true,
 *   priority: 1
 * });
 * ```
 */

/**
 * Agency Toolkit Configuration
 */
export interface AgencyToolkitConfig {
  /** Default template configurations */
  templates: {
    defaultTheme: ClientThemeConfig;
    availableTemplates: string[];
  };
  /** Security settings */
  security: {
    defaultTier: 'basic' | 'standard' | 'premium' | 'enterprise';
    enforceHttps: boolean;
    sessionCookieSecure: boolean;
  };
  /** Integration settings */
  integrations: {
    allowCustomHooks: boolean;
    defaultTimeout: number;
    maxRetries: number;
  };
  /** Deployment settings */
  deployment: {
    defaultEnvironment: 'preview' | 'staging' | 'production';
    cdnEnabled: boolean;
    compressionEnabled: boolean;
  };
}

/**
 * Default agency toolkit configuration
 */
export const DEFAULT_AGENCY_TOOLKIT_CONFIG: AgencyToolkitConfig = {
  templates: {
    defaultTheme: DEFAULT_THEME,
    availableTemplates: ['dashboard', 'landing', 'auth', 'admin'],
  },
  security: {
    defaultTier: 'standard',
    enforceHttps: true,
    sessionCookieSecure: true,
  },
  integrations: {
    allowCustomHooks: true,
    defaultTimeout: 30000, // 30 seconds
    maxRetries: 3,
  },
  deployment: {
    defaultEnvironment: 'preview',
    cdnEnabled: true,
    compressionEnabled: true,
  },
};

/**
 * Agency Toolkit Manager - Central coordination class
 */
export class AgencyToolkitManager {
  constructor(private config: AgencyToolkitConfig = DEFAULT_AGENCY_TOOLKIT_CONFIG) {}

  /**
   * Initialize a complete client setup
   */
  async initializeClient(
    clientId: string,
    clientName: string,
    options: {
      template?: keyof typeof DEFAULT_TEMPLATES;
      securityTier?: keyof typeof DEFAULT_SECURITY_CONFIGS;
      theme?: Partial<ClientThemeConfig>;
      hooks?: Array<Omit<IntegrationHook, 'id' | 'clientId' | 'createdAt'>>;
    } = {}
  ) {
    const {
      template = 'DASHBOARD',
      securityTier = 'STANDARD',
      theme = {},
      hooks = []
    } = options;

    // Create security boundary
    const securityConfig = {
      ...DEFAULT_SECURITY_CONFIGS[securityTier],
      clientId,
      clientName,
      allowedDomains: [], // To be configured per client
    };
    const securityBoundary = await clientSecurityManager.createSecurityBoundary(securityConfig);

    // Create template
    const templateConfig = DEFAULT_TEMPLATES[template];
    const clientTemplate = await templateSystem.createTemplate({
      ...templateConfig,
      client: { id: clientId, name: clientName },
      theme: { ...DEFAULT_THEME, ...theme },
      components: {},
    });

    // Register hooks
    const registeredHooks = await Promise.all(
      hooks.map(hook =>
        integrationManager.registerHook({
          ...hook,
          clientId,
        })
      )
    );

    return {
      securityBoundary,
      template: clientTemplate,
      hooks: registeredHooks,
    };
  }

  /**
   * Deploy client micro-app
   */
  async deployClient(
    templateId: string,
    environment: 'preview' | 'staging' | 'production' = 'preview'
  ) {
    const deployment = await templateSystem.deployTemplate(
      templateId,
      environment,
      {
        domain: { custom: false, name: '', ssl: true },
        env: {},
        build: {
          command: 'npm run build',
          outputDir: 'dist',
          nodeVersion: '18',
        },
        performance: {
          caching: this.config.deployment.cdnEnabled,
          compression: this.config.deployment.compressionEnabled,
          cdn: this.config.deployment.cdnEnabled,
        },
      }
    );

    return deployment;
  }

  /**
   * Get client overview
   */
  async getClientOverview(clientId: string) {
    const securityBoundary = clientSecurityManager.getSecurityBoundary(clientId);
    const templates = templateSystem.getClientTemplates(clientId);
    const hooks = integrationManager.getClientHooks(clientId);

    return {
      security: securityBoundary,
      templates,
      hooks,
      summary: {
        securityTier: securityBoundary?.config.tier || 'unknown',
        templateCount: templates.length,
        hookCount: hooks.length,
        lastUpdated: Math.max(
          ...templates.map(t => t.updatedAt.getTime()),
          securityBoundary?.updatedAt.getTime() || 0
        ),
      },
    };
  }
}

/**
 * Global agency toolkit manager instance
 */
export const agencyToolkit = new AgencyToolkitManager();

// Re-export types for convenience
import type { ClientThemeConfig } from './template-system';
import type { IntegrationHook } from './integration-hooks';
import { DEFAULT_THEME, DEFAULT_TEMPLATES } from './template-system';
import { DEFAULT_SECURITY_CONFIGS } from './client-security';