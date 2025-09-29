/**
 * Developer Portal & SDK
 * 
 * Tools and infrastructure for module developers including
 * SDK, templates, documentation, and publishing pipeline.
 */

import { z } from 'zod';

// Schema definitions
export const ModuleTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  framework: z.string(),
  language: z.string(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  estimatedTime: z.string(),
  features: z.array(z.string()),
  dependencies: z.array(z.string()),
  files: z.array(z.object({
    path: z.string(),
    content: z.string(),
    type: z.enum(['code', 'config', 'documentation']),
  })),
});

export const PublishingPipelineSchema = z.object({
  id: z.string(),
  moduleId: z.string(),
  version: z.string(),
  status: z.enum(['building', 'testing', 'validating', 'publishing', 'completed', 'failed']),
  steps: z.array(z.object({
    name: z.string(),
    status: z.enum(['pending', 'running', 'completed', 'failed', 'skipped']),
    startedAt: z.date().optional(),
    completedAt: z.date().optional(),
    logs: z.array(z.string()).default([]),
    error: z.string().optional(),
  })),
  artifacts: z.array(z.object({
    type: z.string(),
    url: z.string(),
    size: z.number(),
    checksum: z.string(),
  })).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const DeveloperStatsSchema = z.object({
  developerId: z.string(),
  modulesPublished: z.number(),
  totalDownloads: z.number(),
  averageRating: z.number(),
  revenue: z.number(),
  followers: z.number(),
  joinedAt: z.date(),
  lastActiveAt: z.date(),
});

// Type exports
export type ModuleTemplate = z.infer<typeof ModuleTemplateSchema>;
export type PublishingPipeline = z.infer<typeof PublishingPipelineSchema>;
export type DeveloperStats = z.infer<typeof DeveloperStatsSchema>;

export interface SDKConfig {
  apiBaseUrl: string;
  apiKey: string;
  version: string;
  features: string[];
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  license: string;
  homepage: string;
  repository: string;
  keywords: string[];
  dependencies: Record<string, string>;
  peerDependencies: Record<string, string>;
  engines: {
    node: string;
    npm: string;
  };
  files: string[];
  main: string;
  types: string;
  scripts: Record<string, string>;
  marketplace: {
    category: string;
    pricing: {
      type: 'free' | 'one-time' | 'subscription' | 'usage-based';
      amount?: number;
      currency?: string;
      period?: 'month' | 'year';
    };
    compatibility: {
      minVersion: string;
      maxVersion?: string;
    };
    features: string[];
    screenshots: string[];
    documentation: string;
  };
}

/**
 * Developer Portal & SDK
 * 
 * Provides tools and infrastructure for module developers
 */
export class DeveloperPortal {
  private templates: Map<string, ModuleTemplate> = new Map();
  private pipelines: Map<string, PublishingPipeline> = new Map();
  private developerStats: Map<string, DeveloperStats> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Get available module templates
   */
  async getTemplates(category?: string): Promise<ModuleTemplate[]> {
    let templates = Array.from(this.templates.values());
    
    if (category) {
      templates = templates.filter(template => template.category === category);
    }

    return templates;
  }

  /**
   * Get a specific template
   */
  async getTemplate(templateId: string): Promise<ModuleTemplate | null> {
    return this.templates.get(templateId) || null;
  }

  /**
   * Generate module from template
   */
  async generateModuleFromTemplate(
    templateId: string,
    config: {
      moduleName: string;
      author: string;
      description: string;
      version: string;
      [key: string]: any;
    }
  ): Promise<{
    files: Array<{ path: string; content: string }>;
    manifest: ModuleManifest;
  }> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    // Generate files from template
    const files = template.files.map(file => ({
      path: file.path.replace('{{moduleName}}', config.moduleName),
      content: this.interpolateTemplate(file.content, config),
    }));

    // Generate manifest
    const manifest: ModuleManifest = {
      id: config.moduleName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
      name: config.moduleName,
      version: config.version,
      description: config.description,
      author: config.author,
      license: 'MIT',
      homepage: `https://github.com/${config.author}/${config.moduleName}`,
      repository: `https://github.com/${config.author}/${config.moduleName}`,
      keywords: template.features,
      dependencies: {},
      peerDependencies: {},
      engines: {
        node: '>=16.0.0',
        npm: '>=8.0.0',
      },
      files: files.map(f => f.path),
      main: 'dist/index.js',
      types: 'dist/index.d.ts',
      scripts: {
        build: 'tsc',
        test: 'jest',
        lint: 'eslint src/**/*.ts',
        'lint:fix': 'eslint src/**/*.ts --fix',
      },
      marketplace: {
        category: template.category,
        pricing: {
          type: 'free',
        },
        compatibility: {
          minVersion: '1.0.0',
        },
        features: template.features,
        screenshots: [],
        documentation: 'README.md',
      },
    };

    return { files, manifest };
  }

  /**
   * Start publishing pipeline
   */
  async startPublishingPipeline(
    moduleId: string,
    version: string,
    files: Array<{ path: string; content: string }>,
    manifest: ModuleManifest
  ): Promise<PublishingPipeline> {
    const pipelineId = this.generatePipelineId();
    
    const pipeline: PublishingPipeline = PublishingPipelineSchema.parse({
      id: pipelineId,
      moduleId,
      version,
      status: 'building',
      steps: [
        { name: 'Validate Manifest', status: 'pending', logs: [] },
        { name: 'Build Module', status: 'pending', logs: [] },
        { name: 'Run Tests', status: 'pending', logs: [] },
        { name: 'Security Scan', status: 'pending', logs: [] },
        { name: 'Quality Check', status: 'pending', logs: [] },
        { name: 'Package Module', status: 'pending', logs: [] },
        { name: 'Publish to Registry', status: 'pending', logs: [] },
      ],
      artifacts: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.pipelines.set(pipelineId, pipeline);

    // Start pipeline execution
    this.executePipeline(pipelineId);

    return pipeline;
  }

  /**
   * Get publishing pipeline status
   */
  async getPublishingPipeline(pipelineId: string): Promise<PublishingPipeline | null> {
    return this.pipelines.get(pipelineId) || null;
  }

  /**
   * Get developer statistics
   */
  async getDeveloperStats(developerId: string): Promise<DeveloperStats | null> {
    return this.developerStats.get(developerId) || null;
  }

  /**
   * Get SDK configuration
   */
  getSDKConfig(): SDKConfig {
    return {
      apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.marketplace.example.com',
      apiKey: process.env.MARKETPLACE_API_KEY || '',
      version: '1.0.0',
      features: [
        'module-discovery',
        'installation-management',
        'pricing-integration',
        'license-validation',
        'analytics-tracking',
      ],
    };
  }

  /**
   * Validate module manifest
   */
  async validateManifest(manifest: ModuleManifest): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields validation
    if (!manifest.id) errors.push('Module ID is required');
    if (!manifest.name) errors.push('Module name is required');
    if (!manifest.version) errors.push('Module version is required');
    if (!manifest.description) errors.push('Module description is required');
    if (!manifest.author) errors.push('Module author is required');

    // Version format validation
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      errors.push('Version must follow semantic versioning (e.g., 1.0.0)');
    }

    // ID format validation
    if (manifest.id && !/^[a-z0-9-]+$/.test(manifest.id)) {
      errors.push('Module ID must contain only lowercase letters, numbers, and hyphens');
    }

    // Marketplace configuration validation
    if (!manifest.marketplace.category) {
      warnings.push('Marketplace category is recommended');
    }

    if (!manifest.marketplace.features || manifest.marketplace.features.length === 0) {
      warnings.push('Marketplace features list is recommended');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Generate module documentation
   */
  async generateDocumentation(manifest: ModuleManifest): Promise<string> {
    const { name, description, version, author, keywords, marketplace } = manifest;

    return `# ${name}

${description}

## Installation

\`\`\`bash
npm install @marketplace/${name}
\`\`\`

## Usage

\`\`\`typescript
import { ${name} } from '@marketplace/${name}';

// Your usage example here
\`\`\`

## Features

${marketplace.features.map(feature => `- ${feature}`).join('\n')}

## API Reference

### ${name}

Your API documentation here.

## Contributing

Contributions are welcome! Please read our contributing guidelines.

## License

MIT License - see LICENSE file for details.

## Author

${author}

## Version

${version}

## Keywords

${keywords.join(', ')}
`;
  }

  // Private helper methods

  private generatePipelineId(): string {
    return `pipeline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private interpolateTemplate(template: string, config: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return config[key] || match;
    });
  }

  private async executePipeline(pipelineId: string): Promise<void> {
    const pipeline = this.pipelines.get(pipelineId);
    if (!pipeline) return;

    try {
      for (const step of pipeline.steps) {
        step.status = 'running';
        step.startedAt = new Date();
        pipeline.updatedAt = new Date();

        // Simulate step execution
        await this.executeStep(step, pipeline);

        step.status = 'completed';
        step.completedAt = new Date();
        pipeline.updatedAt = new Date();
      }

      pipeline.status = 'completed';
    } catch (error) {
      pipeline.status = 'failed';
      pipeline.updatedAt = new Date();
    }
  }

  private async executeStep(step: PublishingPipeline['steps'][0], pipeline: PublishingPipeline): Promise<void> {
    // Mock step execution - in real app, this would execute actual build/test/scan steps
    const delay = Math.random() * 2000 + 1000; // 1-3 seconds
    await new Promise(resolve => setTimeout(resolve, delay));

    // Add some mock logs
    step.logs.push(`Starting ${step.name}...`);
    step.logs.push(`Executing ${step.name} step`);
    step.logs.push(`Completed ${step.name} successfully`);
  }

  private initializeTemplates(): void {
    const templates: ModuleTemplate[] = [
      {
        id: 'react-component',
        name: 'React Component',
        description: 'A basic React component template',
        category: 'ui-components',
        framework: 'react',
        language: 'typescript',
        difficulty: 'beginner',
        estimatedTime: '30 minutes',
        features: ['TypeScript', 'ESLint', 'Jest', 'Storybook'],
        dependencies: ['react', 'typescript'],
        files: [
          {
            path: 'src/{{moduleName}}.tsx',
            content: `import React from 'react';

interface {{moduleName}}Props {
  children?: React.ReactNode;
  className?: string;
}

export function {{moduleName}}({ children, className }: {{moduleName}}Props) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

export default {{moduleName}};`,
            type: 'code',
          },
          {
            path: 'src/{{moduleName}}.test.tsx',
            content: `import React from 'react';
import { render, screen } from '@testing-library/react';
import { {{moduleName}} } from './{{moduleName}}';

describe('{{moduleName}}', () => {
  it('renders without crashing', () => {
    render(<{{moduleName}}>Test</{{moduleName}}>);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});`,
            type: 'code',
          },
          {
            path: 'package.json',
            content: `{
  "name": "@marketplace/{{moduleName}}",
  "version": "{{version}}",
  "description": "{{description}}",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  },
  "dependencies": {
    "react": "^18.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/react": "^18.0.0",
    "jest": "^29.0.0",
    "@testing-library/react": "^13.0.0"
  }
}`,
            type: 'config',
          },
        ],
      },
      {
        id: 'api-integration',
        name: 'API Integration',
        description: 'A template for API integrations',
        category: 'integrations',
        framework: 'node',
        language: 'typescript',
        difficulty: 'intermediate',
        estimatedTime: '1 hour',
        features: ['TypeScript', 'Axios', 'Error Handling', 'Rate Limiting'],
        dependencies: ['axios', 'typescript'],
        files: [
          {
            path: 'src/{{moduleName}}.ts',
            content: `import axios, { AxiosInstance, AxiosResponse } from 'axios';

export interface {{moduleName}}Config {
  apiKey: string;
  baseUrl?: string;
  timeout?: number;
}

export class {{moduleName}} {
  private client: AxiosInstance;

  constructor(config: {{moduleName}}Config) {
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.example.com',
      timeout: config.timeout || 5000,
      headers: {
        'Authorization': \`Bearer \${config.apiKey}\`,
        'Content-Type': 'application/json',
      },
    });
  }

  async getData(): Promise<any> {
    try {
      const response: AxiosResponse = await this.client.get('/data');
      return response.data;
    } catch (error) {
      throw new Error(\`API request failed: \${error}\`);
    }
  }
}`,
            type: 'code',
          },
        ],
      },
    ];

    templates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }
}

// Export singleton instance
export const developerPortal = new DeveloperPortal();
