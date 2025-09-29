export interface TrainingMaterial {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'document' | 'interactive' | 'quiz' | 'simulation';
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  content: string;
  resources: string[];
  prerequisites: string[];
  learningObjectives: string[];
  tags: string[];
  version: string;
  lastUpdated: Date;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  materials: TrainingMaterial[];
  estimatedDuration: number;
  completionCriteria: string[];
  assessments: string[];
  order: number;
}

export interface TrainingProgram {
  id: string;
  clientId: string;
  templateId: string;
  title: string;
  description: string;
  modules: TrainingModule[];
  customizations: any;
  generatedAt: Date;
  lastUpdated: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description: string;
  targetAudience: string[];
  estimatedDuration: number;
  modules: string[];
  prerequisites: string[];
  outcomes: string[];
}

export class TrainingMaterialGenerator {
  private materialTemplates: Map<string, TrainingMaterial> = new Map();
  private moduleTemplates: Map<string, TrainingModule> = new Map();
  private learningPaths: Map<string, LearningPath> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  async generateTrainingProgram(
    clientId: string,
    templateId: string,
    customizations: any,
    userRoles: string[]
  ): Promise<TrainingProgram> {
    const programId = `training_${clientId}_${Date.now()}`;

    const modules = await this.generateModulesForRoles(userRoles, customizations);
    const customizedModules = await this.customizeModules(modules, customizations);

    const program: TrainingProgram = {
      id: programId,
      clientId,
      templateId,
      title: `Training Program for ${customizations.clientName || 'Client'}`,
      description: 'Comprehensive training program for your application',
      modules: customizedModules,
      customizations,
      generatedAt: new Date(),
      lastUpdated: new Date()
    };

    return program;
  }

  private async generateModulesForRoles(
    roles: string[],
    customizations: any
  ): Promise<TrainingModule[]> {
    const modules: TrainingModule[] = [];

    // Core modules for all users
    modules.push(await this.generateCoreModule(customizations));

    // Role-specific modules
    for (const role of roles) {
      const roleModule = await this.generateRoleSpecificModule(role, customizations);
      if (roleModule) {
        modules.push(roleModule);
      }
    }

    // Advanced modules based on features
    if (customizations.features?.includes('analytics')) {
      modules.push(await this.generateAnalyticsModule(customizations));
    }

    if (customizations.features?.includes('ecommerce')) {
      modules.push(await this.generateEcommerceModule(customizations));
    }

    return modules.sort((a, b) => a.order - b.order);
  }

  private async generateCoreModule(customizations: any): Promise<TrainingModule> {
    const materials = [
      await this.generateMaterial('welcome-overview', customizations),
      await this.generateMaterial('navigation-basics', customizations),
      await this.generateMaterial('account-management', customizations),
      await this.generateMaterial('basic-features', customizations),
      await this.generateMaterial('support-resources', customizations)
    ];

    return {
      id: 'core-training',
      title: 'Core Application Training',
      description: 'Essential training for all users of the application',
      materials,
      estimatedDuration: materials.reduce((total, m) => total + m.duration, 0),
      completionCriteria: ['all_materials_completed', 'basic_quiz_passed'],
      assessments: ['basic-knowledge-quiz'],
      order: 1
    };
  }

  private async generateRoleSpecificModule(
    role: string,
    customizations: any
  ): Promise<TrainingModule | null> {
    const roleConfigs = {
      admin: {
        title: 'Administrator Training',
        materials: ['admin-dashboard', 'user-management', 'system-configuration', 'security-settings'],
        order: 2
      },
      manager: {
        title: 'Manager Training',
        materials: ['reporting-analytics', 'team-management', 'performance-monitoring', 'approval-workflows'],
        order: 3
      },
      user: {
        title: 'End User Training',
        materials: ['daily-tasks', 'feature-usage', 'data-entry', 'basic-reporting'],
        order: 4
      },
      editor: {
        title: 'Content Editor Training',
        materials: ['content-management', 'publishing-workflow', 'media-handling', 'seo-basics'],
        order: 5
      }
    };

    const config = roleConfigs[role as keyof typeof roleConfigs];
    if (!config) return null;

    const materials = await Promise.all(
      config.materials.map(materialType =>
        this.generateMaterial(materialType, customizations)
      )
    );

    return {
      id: `${role}-training`,
      title: config.title,
      description: `Specialized training for ${role} users`,
      materials,
      estimatedDuration: materials.reduce((total, m) => total + m.duration, 0),
      completionCriteria: ['all_materials_completed', `${role}_quiz_passed`],
      assessments: [`${role}-knowledge-assessment`],
      order: config.order
    };
  }

  private async generateAnalyticsModule(customizations: any): Promise<TrainingModule> {
    const materials = [
      await this.generateMaterial('analytics-overview', customizations),
      await this.generateMaterial('dashboard-navigation', customizations),
      await this.generateMaterial('report-generation', customizations),
      await this.generateMaterial('data-interpretation', customizations),
      await this.generateMaterial('custom-metrics', customizations)
    ];

    return {
      id: 'analytics-training',
      title: 'Analytics & Reporting Training',
      description: 'Training on analytics features and reporting capabilities',
      materials,
      estimatedDuration: materials.reduce((total, m) => total + m.duration, 0),
      completionCriteria: ['all_materials_completed', 'analytics_practical_test_passed'],
      assessments: ['analytics-practical-assessment'],
      order: 10
    };
  }

  private async generateEcommerceModule(customizations: any): Promise<TrainingModule> {
    const materials = [
      await this.generateMaterial('product-management', customizations),
      await this.generateMaterial('order-processing', customizations),
      await this.generateMaterial('inventory-management', customizations),
      await this.generateMaterial('payment-processing', customizations),
      await this.generateMaterial('customer-service', customizations)
    ];

    return {
      id: 'ecommerce-training',
      title: 'E-commerce Management Training',
      description: 'Training on e-commerce features and store management',
      materials,
      estimatedDuration: materials.reduce((total, m) => total + m.duration, 0),
      completionCriteria: ['all_materials_completed', 'ecommerce_simulation_passed'],
      assessments: ['ecommerce-simulation-test'],
      order: 11
    };
  }

  private async generateMaterial(
    materialType: string,
    customizations: any
  ): Promise<TrainingMaterial> {
    const template = this.materialTemplates.get(materialType);
    if (!template) {
      throw new Error(`Material template not found: ${materialType}`);
    }

    return {
      ...template,
      id: `${materialType}_${Date.now()}`,
      title: this.customizeContent(template.title, customizations),
      description: this.customizeContent(template.description, customizations),
      content: this.customizeContent(template.content, customizations),
      resources: template.resources.map(resource =>
        this.customizeContent(resource, customizations)
      ),
      lastUpdated: new Date()
    };
  }

  private customizeContent(content: string, customizations: any): string {
    return content
      .replace(/\{clientName\}/g, customizations.clientName || 'Client')
      .replace(/\{appName\}/g, customizations.appName || 'Application')
      .replace(/\{industry\}/g, customizations.industry || 'Business')
      .replace(/\{primaryColor\}/g, customizations.branding?.primaryColor || '#007bff')
      .replace(/\{companyLogo\}/g, customizations.branding?.logo || '/default-logo.png');
  }

  private async customizeModules(
    modules: TrainingModule[],
    customizations: any
  ): Promise<TrainingModule[]> {
    return modules.map(module => ({
      ...module,
      title: this.customizeContent(module.title, customizations),
      description: this.customizeContent(module.description, customizations),
      materials: module.materials.map(material => ({
        ...material,
        title: this.customizeContent(material.title, customizations),
        description: this.customizeContent(material.description, customizations),
        content: this.customizeContent(material.content, customizations)
      }))
    }));
  }

  async generateQuickReferenceGuide(
    clientId: string,
    customizations: any
  ): Promise<TrainingMaterial> {
    return {
      id: `quick_ref_${clientId}_${Date.now()}`,
      title: `${customizations.appName || 'Application'} Quick Reference`,
      description: 'Quick reference guide for common tasks and features',
      type: 'document',
      category: 'reference',
      difficulty: 'beginner',
      duration: 5,
      content: this.generateQuickReferenceContent(customizations),
      resources: ['feature-shortcuts', 'keyboard-shortcuts', 'troubleshooting-tips'],
      prerequisites: [],
      learningObjectives: [
        'Quick access to common features',
        'Efficient task completion',
        'Self-service problem resolution'
      ],
      tags: ['reference', 'quick-help', 'shortcuts'],
      version: '1.0',
      lastUpdated: new Date()
    };
  }

  private generateQuickReferenceContent(customizations: any): string {
    return `
# ${customizations.appName || 'Application'} Quick Reference

## Getting Started
- Access your dashboard: Navigate to /dashboard
- Update profile: User menu > Profile Settings
- Change password: Security > Change Password

## Common Tasks
- Create new record: Click "Add New" button
- Search records: Use search bar in top navigation
- Export data: Select records > Export button
- Generate reports: Analytics > Reports > Generate

## Navigation Shortcuts
- Home: Alt + H
- Dashboard: Alt + D
- Search: Ctrl + /
- Help: F1

## Support
- Help Center: Click "?" icon
- Live Chat: Bottom right chat widget
- Email Support: support@${customizations.domain || 'example.com'}
- Phone: ${customizations.supportPhone || '1-800-SUPPORT'}

## Troubleshooting
- Clear browser cache for loading issues
- Check internet connection for sync problems
- Refresh page if features not responding
- Contact support for persistent issues
    `;
  }

  private initializeTemplates(): void {
    // Initialize material templates
    this.materialTemplates.set('welcome-overview', {
      id: 'welcome-overview',
      title: 'Welcome to {appName}',
      description: 'Overview of your new application and its capabilities',
      type: 'video',
      category: 'introduction',
      difficulty: 'beginner',
      duration: 8,
      content: 'welcome-video-content',
      resources: ['user-guide', 'feature-overview'],
      prerequisites: [],
      learningObjectives: [
        'Understand application purpose',
        'Identify key features',
        'Navigate main interface'
      ],
      tags: ['welcome', 'overview', 'introduction'],
      version: '1.0',
      lastUpdated: new Date()
    });

    this.materialTemplates.set('navigation-basics', {
      id: 'navigation-basics',
      title: 'Navigation Basics',
      description: 'Learn how to navigate through {appName}',
      type: 'interactive',
      category: 'basics',
      difficulty: 'beginner',
      duration: 12,
      content: 'navigation-tutorial',
      resources: ['navigation-guide', 'menu-reference'],
      prerequisites: ['welcome-overview'],
      learningObjectives: [
        'Navigate main menu',
        'Use breadcrumbs',
        'Access user settings'
      ],
      tags: ['navigation', 'basics', 'interface'],
      version: '1.0',
      lastUpdated: new Date()
    });

    // Add more templates as needed
  }

  async generateTrainingVideos(
    materials: TrainingMaterial[],
    customizations: any
  ): Promise<string[]> {
    const videoUrls: string[] = [];

    for (const material of materials) {
      if (material.type === 'video') {
        const videoUrl = await this.generateTrainingVideo(material, customizations);
        videoUrls.push(videoUrl);
      }
    }

    return videoUrls;
  }

  private async generateTrainingVideo(
    material: TrainingMaterial,
    customizations: any
  ): Promise<string> {
    // In a real implementation, this would generate actual training videos
    // using screen recording tools, AI video generation, or template-based video creation

    const videoScript = this.generateVideoScript(material, customizations);
    const videoUrl = `https://training-videos.com/${material.id}.mp4`;

    console.log(`Generated training video: ${material.title} -> ${videoUrl}`);
    return videoUrl;
  }

  private generateVideoScript(material: TrainingMaterial, customizations: any): string {
    return `
Video Script: ${material.title}

Opening:
Welcome to this training video for ${customizations.appName}.
In this ${material.duration}-minute session, we'll cover ${material.description}.

Learning Objectives:
${material.learningObjectives.map(obj => `- ${obj}`).join('\n')}

Main Content:
${material.content}

Prerequisites:
${material.prerequisites.length > 0 ?
  `Before starting, make sure you've completed: ${material.prerequisites.join(', ')}` :
  'No prerequisites required'
}

Conclusion:
You've successfully completed ${material.title}.
Next, you can move on to: [Next Material]

Resources:
${material.resources.map(resource => `- ${resource}`).join('\n')}
    `;
  }
}

export default TrainingMaterialGenerator;