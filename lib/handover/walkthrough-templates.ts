import { WalkthroughTemplate, TemplateCategory, TemplateMetadata } from '@/types/handover/walkthrough-templates';

export interface TemplateRegistry {
  [key: string]: WalkthroughTemplate;
}

export class WalkthroughTemplateManager {
  private templates: TemplateRegistry = {};
  private categories: Map<string, TemplateCategory> = new Map();

  constructor() {
    this.initializeBuiltInTemplates();
    this.initializeCategories();
  }

  async getTemplate(templateId: string): Promise<WalkthroughTemplate | null> {
    if (this.templates[templateId]) {
      return this.templates[templateId];
    }

    return this.loadTemplateFromDatabase(templateId);
  }

  async getTemplatesByCategory(category: string): Promise<WalkthroughTemplate[]> {
    return Object.values(this.templates).filter(template =>
      template.metadata.category === category
    );
  }

  async getTemplatesByType(type: string): Promise<WalkthroughTemplate[]> {
    return Object.values(this.templates).filter(template =>
      template.metadata.type === type
    );
  }

  async getAllTemplates(): Promise<WalkthroughTemplate[]> {
    return Object.values(this.templates);
  }

  async createCustomTemplate(template: WalkthroughTemplate): Promise<string> {
    const templateId = this.generateTemplateId(template);
    template.id = templateId;
    template.metadata.createdAt = new Date();
    template.metadata.updatedAt = new Date();

    this.templates[templateId] = template;
    await this.saveTemplate(template);

    return templateId;
  }

  async updateTemplate(templateId: string, updates: Partial<WalkthroughTemplate>): Promise<void> {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const updatedTemplate = {
      ...template,
      ...updates,
      id: templateId,
      metadata: {
        ...template.metadata,
        ...updates.metadata,
        updatedAt: new Date()
      }
    };

    this.templates[templateId] = updatedTemplate;
    await this.saveTemplate(updatedTemplate);
  }

  async cloneTemplate(templateId: string, newName: string): Promise<string> {
    const template = this.templates[templateId];
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    const clonedTemplate: WalkthroughTemplate = {
      ...template,
      id: '',
      title: newName,
      metadata: {
        ...template.metadata,
        name: newName,
        isClone: true,
        clonedFrom: templateId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    return this.createCustomTemplate(clonedTemplate);
  }

  private initializeBuiltInTemplates(): void {
    // Basic App Introduction Template
    this.templates['basic-app-intro'] = {
      id: 'basic-app-intro',
      title: 'Basic App Introduction',
      description: 'A simple walkthrough introducing users to the basic features of their app',
      version: '1.0.0',
      metadata: {
        name: 'Basic App Introduction',
        description: 'Simple app introduction walkthrough',
        category: 'onboarding',
        type: 'basic',
        difficulty: 'beginner',
        estimatedDuration: 300,
        tags: ['onboarding', 'basic', 'introduction'],
        author: 'system',
        isBuiltIn: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      steps: [
        {
          id: 'welcome',
          title: 'Welcome to {{client.name}}',
          content: 'Welcome to your new {{app.name}} application! This walkthrough will guide you through the key features.',
          type: 'introduction',
          order: 0,
          estimatedDuration: 30,
          required: true,
          screenshotConfig: [{
            path: '/',
            selector: 'body',
            annotations: []
          }]
        },
        {
          id: 'navigation',
          title: 'Navigation Overview',
          content: 'Let\'s start by exploring the main navigation menu. You can find all the key sections here.',
          type: 'navigation',
          order: 1,
          estimatedDuration: 60,
          required: true,
          screenshotConfig: [{
            path: '/',
            selector: 'nav',
            annotations: [{ type: 'highlight', selector: 'nav', text: 'Main navigation menu' }]
          }],
          interactions: {
            click: {
              selector: 'nav a:first-child',
              target: 'first-menu-item'
            }
          }
        },
        {
          id: 'dashboard',
          title: 'Dashboard Overview',
          content: 'Your dashboard provides a quick overview of important information and activities.',
          type: 'feature',
          order: 2,
          estimatedDuration: 90,
          required: true,
          screenshotConfig: [{
            path: '/dashboard',
            selector: '.dashboard',
            annotations: [
              { type: 'highlight', selector: '.stats', text: 'Key statistics' },
              { type: 'highlight', selector: '.recent-activity', text: 'Recent activity' }
            ]
          }]
        },
        {
          id: 'settings',
          title: 'Account Settings',
          content: 'You can customize your account and app preferences in the settings section.',
          type: 'configuration',
          order: 3,
          estimatedDuration: 60,
          required: false,
          screenshotConfig: [{
            path: '/settings',
            selector: '.settings-page',
            annotations: [{ type: 'highlight', selector: '.profile-settings', text: 'Profile settings' }]
          }]
        },
        {
          id: 'help',
          title: 'Getting Help',
          content: 'If you need assistance, you can access help documentation and support options.',
          type: 'support',
          order: 4,
          estimatedDuration: 30,
          required: false,
          screenshotConfig: [{
            path: '/help',
            selector: '.help-center',
            annotations: [{ type: 'highlight', selector: '.contact-support', text: 'Contact support' }]
          }]
        },
        {
          id: 'completion',
          title: 'Walkthrough Complete',
          content: 'Congratulations! You\'ve completed the basic walkthrough. Start exploring your new {{app.name}} app!',
          type: 'completion',
          order: 5,
          estimatedDuration: 30,
          required: true
        }
      ],
      customization: {
        allowStepReordering: false,
        allowStepDeletion: false,
        allowStepModification: true,
        allowBrandingCustomization: true,
        allowContentCustomization: true
      }
    };

    // Advanced Feature Tutorial Template
    this.templates['advanced-feature-tutorial'] = {
      id: 'advanced-feature-tutorial',
      title: 'Advanced Feature Tutorial',
      description: 'Comprehensive walkthrough covering advanced features and workflows',
      version: '1.0.0',
      metadata: {
        name: 'Advanced Feature Tutorial',
        description: 'Advanced features and workflows tutorial',
        category: 'advanced',
        type: 'comprehensive',
        difficulty: 'intermediate',
        estimatedDuration: 900,
        tags: ['advanced', 'features', 'workflows'],
        author: 'system',
        isBuiltIn: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      steps: [
        {
          id: 'advanced-intro',
          title: 'Advanced Features Introduction',
          content: 'This tutorial will cover the advanced features of your {{app.name}} application.',
          type: 'introduction',
          order: 0,
          estimatedDuration: 60,
          required: true
        },
        {
          id: 'data-management',
          title: 'Data Management',
          content: 'Learn how to efficiently manage and organize your data.',
          type: 'feature',
          order: 1,
          estimatedDuration: 180,
          required: true,
          videoConfig: [{
            path: '/data',
            actions: ['create', 'edit', 'delete'],
            duration: 120
          }]
        },
        {
          id: 'automation',
          title: 'Automation Features',
          content: 'Discover how to automate repetitive tasks and workflows.',
          type: 'feature',
          order: 2,
          estimatedDuration: 240,
          required: true,
          interactions: {
            form: {
              selector: '.automation-form',
              data: { name: 'Sample Automation', trigger: 'schedule' }
            }
          }
        },
        {
          id: 'integrations',
          title: 'Third-party Integrations',
          content: 'Connect your app with external services and tools.',
          type: 'integration',
          order: 3,
          estimatedDuration: 180,
          required: false
        },
        {
          id: 'analytics',
          title: 'Analytics and Reporting',
          content: 'Generate insights and reports from your data.',
          type: 'analytics',
          order: 4,
          estimatedDuration: 150,
          required: false
        },
        {
          id: 'advanced-completion',
          title: 'Advanced Tutorial Complete',
          content: 'You\'ve mastered the advanced features! You\'re now ready to use {{app.name}} to its full potential.',
          type: 'completion',
          order: 5,
          estimatedDuration: 30,
          required: true
        }
      ],
      customization: {
        allowStepReordering: true,
        allowStepDeletion: true,
        allowStepModification: true,
        allowBrandingCustomization: true,
        allowContentCustomization: true
      }
    };

    // Admin Tutorial Template
    this.templates['admin-tutorial'] = {
      id: 'admin-tutorial',
      title: 'Admin Tutorial',
      description: 'Administrative features and management capabilities walkthrough',
      version: '1.0.0',
      metadata: {
        name: 'Admin Tutorial',
        description: 'Administrative features and management tutorial',
        category: 'admin',
        type: 'administrative',
        difficulty: 'advanced',
        estimatedDuration: 600,
        tags: ['admin', 'management', 'configuration'],
        author: 'system',
        isBuiltIn: true,
        isPublic: false,
        requiresRole: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      steps: [
        {
          id: 'admin-intro',
          title: 'Admin Dashboard Overview',
          content: 'Welcome to the admin dashboard. Here you can manage all aspects of your {{app.name}} application.',
          type: 'introduction',
          order: 0,
          estimatedDuration: 60,
          required: true
        },
        {
          id: 'user-management',
          title: 'User Management',
          content: 'Learn how to add, edit, and manage user accounts.',
          type: 'management',
          order: 1,
          estimatedDuration: 180,
          required: true,
          interactions: {
            navigate: {
              selector: '[href="/admin/users"]',
              target: '/admin/users'
            }
          }
        },
        {
          id: 'system-settings',
          title: 'System Configuration',
          content: 'Configure system-wide settings and preferences.',
          type: 'configuration',
          order: 2,
          estimatedDuration: 120,
          required: true
        },
        {
          id: 'security-settings',
          title: 'Security Configuration',
          content: 'Set up security policies and access controls.',
          type: 'security',
          order: 3,
          estimatedDuration: 150,
          required: true
        },
        {
          id: 'backup-restore',
          title: 'Backup and Restore',
          content: 'Learn how to backup and restore your application data.',
          type: 'maintenance',
          order: 4,
          estimatedDuration: 90,
          required: false
        }
      ],
      customization: {
        allowStepReordering: false,
        allowStepDeletion: false,
        allowStepModification: true,
        allowBrandingCustomization: false,
        allowContentCustomization: true
      }
    };

    // Quick Start Template
    this.templates['quick-start'] = {
      id: 'quick-start',
      title: 'Quick Start Guide',
      description: 'Get up and running quickly with the essential features',
      version: '1.0.0',
      metadata: {
        name: 'Quick Start Guide',
        description: 'Quick introduction to essential features',
        category: 'onboarding',
        type: 'quick-start',
        difficulty: 'beginner',
        estimatedDuration: 180,
        tags: ['quick-start', 'essential', 'basics'],
        author: 'system',
        isBuiltIn: true,
        isPublic: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      steps: [
        {
          id: 'quick-welcome',
          title: 'Quick Start',
          content: 'Let\'s get you started with {{app.name}} in just a few minutes!',
          type: 'introduction',
          order: 0,
          estimatedDuration: 30,
          required: true
        },
        {
          id: 'first-task',
          title: 'Complete Your First Task',
          content: 'Follow along as we complete a typical workflow in your app.',
          type: 'task',
          order: 1,
          estimatedDuration: 90,
          required: true,
          interactions: {
            click: {
              selector: '.create-button',
              target: 'create-form'
            }
          }
        },
        {
          id: 'explore-features',
          title: 'Explore Key Features',
          content: 'Take a quick tour of the most important features you\'ll use daily.',
          type: 'overview',
          order: 2,
          estimatedDuration: 60,
          required: true
        }
      ],
      customization: {
        allowStepReordering: false,
        allowStepDeletion: false,
        allowStepModification: true,
        allowBrandingCustomization: true,
        allowContentCustomization: true
      }
    };
  }

  private initializeCategories(): void {
    this.categories.set('onboarding', {
      id: 'onboarding',
      name: 'Onboarding',
      description: 'User onboarding and introduction templates',
      icon: 'user-plus',
      color: '#28a745'
    });

    this.categories.set('advanced', {
      id: 'advanced',
      name: 'Advanced Features',
      description: 'Advanced functionality and workflow templates',
      icon: 'settings',
      color: '#007bff'
    });

    this.categories.set('admin', {
      id: 'admin',
      name: 'Administration',
      description: 'Administrative and management templates',
      icon: 'shield',
      color: '#dc3545'
    });

    this.categories.set('integration', {
      id: 'integration',
      name: 'Integrations',
      description: 'Third-party integration setup templates',
      icon: 'link',
      color: '#6610f2'
    });

    this.categories.set('maintenance', {
      id: 'maintenance',
      name: 'Maintenance',
      description: 'System maintenance and troubleshooting templates',
      icon: 'tool',
      color: '#fd7e14'
    });
  }

  async getCategories(): Promise<TemplateCategory[]> {
    return Array.from(this.categories.values());
  }

  async getCategory(categoryId: string): Promise<TemplateCategory | null> {
    return this.categories.get(categoryId) || null;
  }

  async searchTemplates(query: string): Promise<WalkthroughTemplate[]> {
    const lowercaseQuery = query.toLowerCase();

    return Object.values(this.templates).filter(template =>
      template.title.toLowerCase().includes(lowercaseQuery) ||
      template.description.toLowerCase().includes(lowercaseQuery) ||
      template.metadata.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async getTemplatesByDifficulty(difficulty: string): Promise<WalkthroughTemplate[]> {
    return Object.values(this.templates).filter(template =>
      template.metadata.difficulty === difficulty
    );
  }

  async getRecommendedTemplates(clientType: string, appType: string): Promise<WalkthroughTemplate[]> {
    const allTemplates = Object.values(this.templates);

    // Simple recommendation logic - can be enhanced with ML later
    const recommendations = allTemplates.filter(template => {
      if (clientType === 'enterprise' && template.metadata.difficulty === 'advanced') return true;
      if (clientType === 'small-business' && template.metadata.difficulty === 'beginner') return true;
      if (appType === 'ecommerce' && template.metadata.tags.includes('ecommerce')) return true;
      return template.metadata.category === 'onboarding';
    });

    return recommendations.slice(0, 5);
  }

  private generateTemplateId(template: WalkthroughTemplate): string {
    const name = template.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    return `${name}-${timestamp}`;
  }

  private async saveTemplate(template: WalkthroughTemplate): Promise<void> {
    const response = await fetch('/api/handover/templates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(template),
    });

    if (!response.ok) {
      throw new Error(`Failed to save template: ${response.statusText}`);
    }
  }

  private async loadTemplateFromDatabase(templateId: string): Promise<WalkthroughTemplate | null> {
    try {
      const response = await fetch(`/api/handover/templates/${templateId}`);
      if (!response.ok) {
        return null;
      }
      const template = await response.json();
      this.templates[templateId] = template;
      return template;
    } catch (error) {
      console.error('Error loading template:', error);
      return null;
    }
  }
}

export const walkthroughTemplateManager = new WalkthroughTemplateManager();
export default walkthroughTemplateManager;