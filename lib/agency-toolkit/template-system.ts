/**
 * @fileoverview Agency Toolkit Template System Foundation
 * @module lib/agency-toolkit/template-system
 * @author HT-021.4.2
 * @version 1.0.0
 *
 * HT-021.4.2: Simple Template System Foundation Interfaces
 *
 * Basic template system for rapid client micro-app delivery with
 * client-specific theming and customization support.
 */

export interface ClientTemplate {
  /** Unique template identifier */
  id: string;
  /** Template name for display */
  name: string;
  /** Template description */
  description: string;
  /** Template category */
  category: 'dashboard' | 'landing' | 'auth' | 'admin' | 'custom';
  /** Client configuration */
  client: {
    id: string;
    name: string;
    domain?: string;
  };
  /** Template layout configuration */
  layout: TemplateLayout;
  /** Theme configuration */
  theme: ClientThemeConfig;
  /** Component overrides */
  components: Record<string, ComponentOverride>;
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated timestamp */
  updatedAt: Date;
}

export interface TemplateLayout {
  /** Layout type */
  type: 'single-page' | 'multi-page' | 'dashboard' | 'wizard';
  /** Header configuration */
  header: {
    enabled: boolean;
    title?: string;
    logo?: string;
    navigation?: NavigationItem[];
  };
  /** Sidebar configuration */
  sidebar?: {
    enabled: boolean;
    position: 'left' | 'right';
    collapsible: boolean;
    items: NavigationItem[];
  };
  /** Footer configuration */
  footer: {
    enabled: boolean;
    content?: string;
    links?: NavigationItem[];
  };
  /** Main content area configuration */
  content: {
    padding: 'none' | 'sm' | 'md' | 'lg';
    maxWidth: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
    center: boolean;
  };
}

export interface NavigationItem {
  /** Display text */
  label: string;
  /** Navigation URL or route */
  href: string;
  /** Icon name or component */
  icon?: string;
  /** Whether item is active */
  active?: boolean;
  /** Sub-navigation items */
  children?: NavigationItem[];
}

export interface ClientThemeConfig {
  /** Brand colors */
  colors: {
    primary: string;
    secondary: string;
    accent?: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  /** Typography settings */
  typography: {
    fontFamily: string;
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
  };
  /** Spacing and layout */
  spacing: {
    unit: number; // Base spacing unit in pixels
    scale: number[]; // Spacing scale multipliers
  };
  /** Border radius settings */
  borderRadius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    full: string;
  };
  /** Shadow settings */
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export interface ComponentOverride {
  /** Component name */
  name: string;
  /** Override type */
  type: 'style' | 'props' | 'replace' | 'extend';
  /** Override configuration */
  config: Record<string, any>;
  /** Whether override is enabled */
  enabled: boolean;
}

export interface TemplateDeployment {
  /** Deployment identifier */
  id: string;
  /** Template being deployed */
  templateId: string;
  /** Client identifier */
  clientId: string;
  /** Deployment environment */
  environment: 'preview' | 'staging' | 'production';
  /** Deployment URL */
  url: string;
  /** Deployment status */
  status: 'pending' | 'building' | 'deployed' | 'failed';
  /** Deployment configuration */
  config: DeploymentConfig;
  /** Creation timestamp */
  createdAt: Date;
  /** Completion timestamp */
  completedAt?: Date;
}

export interface DeploymentConfig {
  /** Domain configuration */
  domain?: {
    custom: boolean;
    name: string;
    ssl: boolean;
  };
  /** Environment variables */
  env: Record<string, string>;
  /** Build settings */
  build: {
    command: string;
    outputDir: string;
    nodeVersion: string;
  };
  /** Performance settings */
  performance: {
    caching: boolean;
    compression: boolean;
    cdn: boolean;
  };
}

/**
 * Template System Manager
 */
export class TemplateSystemManager {
  private templates: Map<string, ClientTemplate> = new Map();
  private deployments: Map<string, TemplateDeployment> = new Map();

  /**
   * Create a new client template
   */
  async createTemplate(config: Omit<ClientTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientTemplate> {
    const template: ClientTemplate = {
      ...config,
      id: this.generateTemplateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.templates.set(template.id, template);
    return template;
  }

  /**
   * Get template by ID
   */
  getTemplate(templateId: string): ClientTemplate | null {
    return this.templates.get(templateId) || null;
  }

  /**
   * Update template configuration
   */
  async updateTemplate(
    templateId: string,
    updates: Partial<ClientTemplate>
  ): Promise<ClientTemplate | null> {
    const template = this.templates.get(templateId);
    if (!template) return null;

    const updatedTemplate: ClientTemplate = {
      ...template,
      ...updates,
      id: template.id, // Preserve ID
      createdAt: template.createdAt, // Preserve creation date
      updatedAt: new Date(),
    };

    this.templates.set(templateId, updatedTemplate);
    return updatedTemplate;
  }

  /**
   * Get templates for a client
   */
  getClientTemplates(clientId: string): ClientTemplate[] {
    return Array.from(this.templates.values())
      .filter(template => template.client.id === clientId);
  }

  /**
   * Deploy template
   */
  async deployTemplate(
    templateId: string,
    environment: 'preview' | 'staging' | 'production',
    config: DeploymentConfig
  ): Promise<TemplateDeployment> {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const deployment: TemplateDeployment = {
      id: this.generateDeploymentId(),
      templateId,
      clientId: template.client.id,
      environment,
      url: this.generateDeploymentUrl(template, environment),
      status: 'pending',
      config,
      createdAt: new Date(),
    };

    this.deployments.set(deployment.id, deployment);

    // Start deployment process (simplified)
    this.processDeployment(deployment);

    return deployment;
  }

  /**
   * Get deployment by ID
   */
  getDeployment(deploymentId: string): TemplateDeployment | null {
    return this.deployments.get(deploymentId) || null;
  }

  /**
   * Generate CSS variables from theme config
   */
  generateThemeCSS(theme: ClientThemeConfig): string {
    const css: string[] = [':root {'];

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      css.push(`  --color-${key}: ${value};`);
    });

    // Typography
    css.push(`  --font-family: ${theme.typography.fontFamily};`);
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      css.push(`  --font-size-${key}: ${value};`);
    });
    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      css.push(`  --font-weight-${key}: ${value};`);
    });

    // Spacing
    css.push(`  --spacing-unit: ${theme.spacing.unit}px;`);
    theme.spacing.scale.forEach((value, index) => {
      css.push(`  --spacing-${index}: ${theme.spacing.unit * value}px;`);
    });

    // Border radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      css.push(`  --border-radius-${key}: ${value};`);
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      css.push(`  --shadow-${key}: ${value};`);
    });

    css.push('}');
    return css.join('\n');
  }

  /**
   * Generate template ID
   */
  private generateTemplateId(): string {
    return `tpl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate deployment ID
   */
  private generateDeploymentId(): string {
    return `dep_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate deployment URL
   */
  private generateDeploymentUrl(
    template: ClientTemplate,
    environment: string
  ): string {
    const subdomain = `${template.client.name.toLowerCase()}-${environment}`;
    return `https://${subdomain}.agency-toolkit.app`;
  }

  /**
   * Process deployment (simplified)
   */
  private async processDeployment(deployment: TemplateDeployment): Promise<void> {
    // Update status to building
    deployment.status = 'building';

    try {
      // Simulate deployment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mark as deployed
      deployment.status = 'deployed';
      deployment.completedAt = new Date();
    } catch (error) {
      deployment.status = 'failed';
      deployment.completedAt = new Date();
    }
  }
}

/**
 * Default template configurations
 */
export const DEFAULT_TEMPLATES = {
  DASHBOARD: {
    name: 'Client Dashboard',
    description: 'Basic client dashboard template',
    category: 'dashboard' as const,
    layout: {
      type: 'dashboard' as const,
      header: {
        enabled: true,
        title: 'Client Portal',
        navigation: [
          { label: 'Dashboard', href: '/' },
          { label: 'Reports', href: '/reports' },
          { label: 'Settings', href: '/settings' },
        ],
      },
      sidebar: {
        enabled: true,
        position: 'left' as const,
        collapsible: true,
        items: [
          { label: 'Overview', href: '/', icon: 'home' },
          { label: 'Analytics', href: '/analytics', icon: 'chart' },
          { label: 'Team', href: '/team', icon: 'users' },
        ],
      },
      footer: {
        enabled: true,
        content: 'Powered by Agency Toolkit',
      },
      content: {
        padding: 'md' as const,
        maxWidth: 'full' as const,
        center: false,
      },
    },
  },
  LANDING: {
    name: 'Landing Page',
    description: 'Simple landing page template',
    category: 'landing' as const,
    layout: {
      type: 'single-page' as const,
      header: {
        enabled: true,
        navigation: [
          { label: 'Home', href: '/' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ],
      },
      footer: {
        enabled: true,
        content: 'All rights reserved',
      },
      content: {
        padding: 'lg' as const,
        maxWidth: 'lg' as const,
        center: true,
      },
    },
  },
} as const;

/**
 * Default theme configuration
 */
export const DEFAULT_THEME: ClientThemeConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#7c3aed',
    background: '#ffffff',
    foreground: '#0f172a',
    muted: '#f8fafc',
    border: '#e2e8f0',
  },
  typography: {
    fontFamily: 'system-ui, -apple-system, sans-serif',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  spacing: {
    unit: 4,
    scale: [0, 1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64],
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
};

/**
 * Global template system instance
 */
export const templateSystem = new TemplateSystemManager();