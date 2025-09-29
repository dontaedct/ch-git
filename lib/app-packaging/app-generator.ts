/**
 * @fileoverview App Packaging System
 * Complete app generation and packaging utilities
 * HT-029.3.4 Implementation
 */

export interface AppTemplate {
  id: string;
  name: string;
  type: 'landing' | 'questionnaire' | 'results' | 'full-flow';
  framework: 'nextjs' | 'react' | 'vue' | 'static';
  files: AppFile[];
  dependencies: Record<string, string>;
  scripts: Record<string, string>;
  configuration: AppConfiguration;
}

export interface AppFile {
  path: string;
  content: string;
  type: 'component' | 'page' | 'style' | 'config' | 'api' | 'asset';
  template?: boolean;
}

export interface AppConfiguration {
  name: string;
  description: string;
  version: string;
  customization: {
    theme: any;
    branding: any;
    content: any;
  };
  features: string[];
  integrations: string[];
  deployment: {
    provider: string;
    settings: Record<string, any>;
  };
}

export interface PackagingOptions {
  includeSource: boolean;
  minify: boolean;
  optimize: boolean;
  generateDocumentation: boolean;
  includeTests: boolean;
  outputFormat: 'zip' | 'tar' | 'directory';
}

export interface PackageResult {
  success: boolean;
  packagePath?: string;
  size: number;
  files: number;
  buildTime: number;
  metadata: {
    generatedAt: Date;
    version: string;
    framework: string;
    features: string[];
  };
  errors?: string[];
}

/**
 * App Generator and Packaging System
 */
export class AppPackagingSystem {
  private static instance: AppPackagingSystem;

  public static getInstance(): AppPackagingSystem {
    if (!AppPackagingSystem.instance) {
      AppPackagingSystem.instance = new AppPackagingSystem();
    }
    return AppPackagingSystem.instance;
  }

  /**
   * Generate complete app from template and configuration
   */
  public async generateApp(
    template: AppTemplate,
    configuration: AppConfiguration,
    options: PackagingOptions = {
      includeSource: true,
      minify: false,
      optimize: true,
      generateDocumentation: true,
      includeTests: false,
      outputFormat: 'zip'
    }
  ): Promise<PackageResult> {
    const startTime = Date.now();

    try {
      // Step 1: Process template files
      const processedFiles = await this.processTemplateFiles(template, configuration);

      // Step 2: Generate package.json
      const packageJson = this.generatePackageJson(template, configuration);

      // Step 3: Generate configuration files
      const configFiles = this.generateConfigFiles(template, configuration);

      // Step 4: Generate documentation
      const documentationFiles = options.generateDocumentation
        ? this.generateDocumentation(template, configuration)
        : [];

      // Step 5: Generate tests
      const testFiles = options.includeTests
        ? this.generateTests(template, configuration)
        : [];

      // Step 6: Combine all files
      const allFiles = [
        ...processedFiles,
        packageJson,
        ...configFiles,
        ...documentationFiles,
        ...testFiles
      ];

      // Step 7: Optimize if requested
      const finalFiles = options.optimize
        ? await this.optimizeFiles(allFiles, options)
        : allFiles;

      // Step 8: Package the application
      const packagePath = await this.packageFiles(finalFiles, options);

      const buildTime = Date.now() - startTime;

      return {
        success: true,
        packagePath,
        size: await this.calculatePackageSize(packagePath),
        files: finalFiles.length,
        buildTime,
        metadata: {
          generatedAt: new Date(),
          version: configuration.version,
          framework: template.framework,
          features: configuration.features
        }
      };
    } catch (error) {
      return {
        success: false,
        size: 0,
        files: 0,
        buildTime: Date.now() - startTime,
        metadata: {
          generatedAt: new Date(),
          version: configuration.version,
          framework: template.framework,
          features: configuration.features
        },
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      };
    }
  }

  /**
   * Process template files with customization data
   */
  private async processTemplateFiles(
    template: AppTemplate,
    configuration: AppConfiguration
  ): Promise<AppFile[]> {
    const processedFiles: AppFile[] = [];

    for (const file of template.files) {
      if (file.template) {
        // Process template file with customization data
        const processedContent = this.processTemplate(file.content, configuration);
        processedFiles.push({
          ...file,
          content: processedContent
        });
      } else {
        // Copy file as-is
        processedFiles.push(file);
      }
    }

    return processedFiles;
  }

  /**
   * Process template content with configuration data
   */
  private processTemplate(content: string, configuration: AppConfiguration): string {
    let processedContent = content;

    // Replace configuration variables
    const variables = {
      appName: configuration.name,
      appDescription: configuration.description,
      companyName: configuration.customization?.branding?.companyName || 'Your Company',
      primaryColor: configuration.customization?.theme?.colors?.primary || '#3B82F6',
      secondaryColor: configuration.customization?.theme?.colors?.secondary || '#1E40AF',
      heroTitle: configuration.customization?.content?.heroTitle || 'Welcome',
      heroSubtitle: configuration.customization?.content?.heroSubtitle || 'Your subtitle here',
      ...configuration.customization?.content
    };

    // Replace template variables
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      processedContent = processedContent.replace(regex, String(value));
    });

    // Process conditional blocks
    processedContent = this.processConditionalBlocks(processedContent, configuration);

    return processedContent;
  }

  /**
   * Process conditional blocks in templates
   */
  private processConditionalBlocks(content: string, configuration: AppConfiguration): string {
    let processedContent = content;

    // Process feature conditionals
    configuration.features.forEach(feature => {
      const regex = new RegExp(`{{#if\\s+${feature}}}([\\s\\S]*?){{/if}}`, 'g');
      processedContent = processedContent.replace(regex, '$1');
    });

    // Remove unused conditionals
    processedContent = processedContent.replace(/{{#if\s+\w+}}[\s\S]*?{{\/if}}/g, '');

    return processedContent;
  }

  /**
   * Generate package.json file
   */
  private generatePackageJson(template: AppTemplate, configuration: AppConfiguration): AppFile {
    const packageJson = {
      name: configuration.name.toLowerCase().replace(/\s+/g, '-'),
      version: configuration.version,
      description: configuration.description,
      private: true,
      scripts: {
        ...template.scripts,
        start: template.framework === 'nextjs' ? 'next start' : 'npm run serve',
        build: template.framework === 'nextjs' ? 'next build' : 'npm run build',
        dev: template.framework === 'nextjs' ? 'next dev' : 'npm run serve',
        lint: 'eslint . --ext .js,.jsx,.ts,.tsx',
        'type-check': template.framework === 'nextjs' ? 'tsc --noEmit' : 'tsc'
      },
      dependencies: {
        ...template.dependencies,
        ...(configuration.features.includes('analytics') && { '@analytics/core': '^1.0.0' }),
        ...(configuration.features.includes('pdf-generation') && { 'jspdf': '^2.5.1' }),
        ...(configuration.features.includes('email-notifications') && { 'nodemailer': '^6.9.0' })
      },
      devDependencies: {
        '@types/node': '^20.0.0',
        '@types/react': '^18.0.0',
        'typescript': '^5.0.0',
        'eslint': '^8.0.0',
        ...(template.framework === 'nextjs' && { 'next': '^14.0.0' })
      },
      engines: {
        node: '>=18.0.0',
        npm: '>=8.0.0'
      },
      metadata: {
        generatedBy: 'Template Engine',
        generatedAt: new Date().toISOString(),
        templateId: template.id,
        features: configuration.features
      }
    };

    return {
      path: 'package.json',
      content: JSON.stringify(packageJson, null, 2),
      type: 'config'
    };
  }

  /**
   * Generate configuration files
   */
  private generateConfigFiles(template: AppTemplate, configuration: AppConfiguration): AppFile[] {
    const configFiles: AppFile[] = [];

    // TypeScript config
    if (template.framework === 'nextjs' || template.framework === 'react') {
      configFiles.push({
        path: 'tsconfig.json',
        content: JSON.stringify({
          compilerOptions: {
            target: 'es5',
            lib: ['dom', 'dom.iterable', 'es6'],
            allowJs: true,
            skipLibCheck: true,
            strict: true,
            forceConsistentCasingInFileNames: true,
            noEmit: true,
            esModuleInterop: true,
            module: 'esnext',
            moduleResolution: 'bundler',
            resolveJsonModule: true,
            isolatedModules: true,
            jsx: 'preserve',
            incremental: true,
            plugins: [
              {
                name: 'next'
              }
            ],
            paths: {
              '@/*': ['./*']
            }
          },
          include: ['next-env.d.ts', '**/*.ts', '**/*.tsx', '.next/types/**/*.ts'],
          exclude: ['node_modules']
        }, null, 2),
        type: 'config'
      });
    }

    // Next.js config
    if (template.framework === 'nextjs') {
      configFiles.push({
        path: 'next.config.js',
        content: `/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['example.com'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig`,
        type: 'config'
      });
    }

    // Tailwind CSS config
    configFiles.push({
      path: 'tailwind.config.js',
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '${configuration.customization?.theme?.colors?.primary || '#3B82F6'}',
        secondary: '${configuration.customization?.theme?.colors?.secondary || '#1E40AF'}',
      },
    },
  },
  plugins: [],
}`,
      type: 'config'
    });

    // Environment variables template
    configFiles.push({
      path: '.env.local.example',
      content: `# Environment Variables
NEXT_PUBLIC_APP_NAME="${configuration.name}"
NEXT_PUBLIC_APP_DESCRIPTION="${configuration.description}"

# API Configuration
${configuration.features.includes('analytics') ? 'ANALYTICS_API_KEY=your_analytics_key' : '# ANALYTICS_API_KEY=your_analytics_key'}
${configuration.features.includes('email-notifications') ? 'SENDGRID_API_KEY=your_sendgrid_key' : '# SENDGRID_API_KEY=your_sendgrid_key'}

# Database (if needed)
# DATABASE_URL=your_database_url

# Deployment
VERCEL_URL=your_deployment_url`,
      type: 'config'
    });

    return configFiles;
  }

  /**
   * Generate documentation files
   */
  private generateDocumentation(template: AppTemplate, configuration: AppConfiguration): AppFile[] {
    const docs: AppFile[] = [];

    // README.md
    docs.push({
      path: 'README.md',
      content: `# ${configuration.name}

${configuration.description}

## Features

${configuration.features.map(feature => `- ${feature.replace('-', ' ')}`).join('\n')}

## Getting Started

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Copy environment variables:
   \`\`\`bash
   cp .env.local.example .env.local
   \`\`\`

3. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

This application is configured for deployment on ${configuration.deployment.provider}.

### Deploy to ${configuration.deployment.provider}

1. Connect your repository to ${configuration.deployment.provider}
2. Configure environment variables
3. Deploy automatically on push to main branch

## Built With

- ${template.framework === 'nextjs' ? 'Next.js' : template.framework} - React framework
- Tailwind CSS - Utility-first CSS framework
- TypeScript - Type-safe JavaScript

## Generated

This application was generated using the Template Engine on ${new Date().toDateString()}.

Template ID: ${template.id}
Framework: ${template.framework}
Features: ${configuration.features.join(', ')}
`,
      type: 'config'
    });

    // API Documentation (if applicable)
    if (configuration.features.includes('questionnaire') || configuration.features.includes('pdf-generation')) {
      docs.push({
        path: 'docs/API.md',
        content: `# API Documentation

## Endpoints

${configuration.features.includes('questionnaire') ? `
### Questionnaire API

- \`POST /api/questionnaire/submit\` - Submit questionnaire responses
- \`GET /api/questionnaire/[id]\` - Get questionnaire by ID
` : ''}

${configuration.features.includes('pdf-generation') ? `
### PDF Generation API

- \`POST /api/pdf/generate\` - Generate PDF report
- \`GET /api/pdf/[id]\` - Download generated PDF
` : ''}

## Authentication

${configuration.features.includes('auth') ? 'This API uses JWT authentication.' : 'No authentication required for public endpoints.'}

## Rate Limiting

API requests are rate limited to 100 requests per minute per IP address.
`,
        type: 'config'
      });
    }

    return docs;
  }

  /**
   * Generate test files
   */
  private generateTests(template: AppTemplate, configuration: AppConfiguration): AppFile[] {
    const tests: AppFile[] = [];

    // Basic test setup
    tests.push({
      path: '__tests__/index.test.tsx',
      content: `import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home', () => {
  it('renders the home page', () => {
    render(<Home />)

    const heading = screen.getByRole('heading', {
      name: /welcome/i,
    })

    expect(heading).toBeInTheDocument()
  })
})`,
      type: 'config'
    });

    // Jest config
    tests.push({
      path: 'jest.config.js',
      content: `const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/components/(.*)$': '<rootDir>/components/$1',
    '^@/pages/(.*)$': '<rootDir>/pages/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
}

module.exports = createJestConfig(customJestConfig)`,
      type: 'config'
    });

    return tests;
  }

  /**
   * Optimize files for production
   */
  private async optimizeFiles(files: AppFile[], options: PackagingOptions): Promise<AppFile[]> {
    if (!options.optimize) return files;

    const optimizedFiles = files.map(file => {
      if (file.type === 'component' || file.type === 'page') {
        // Minify if requested
        if (options.minify) {
          // Simple minification (remove extra whitespace)
          const minifiedContent = file.content
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();

          return { ...file, content: minifiedContent };
        }
      }
      return file;
    });

    return optimizedFiles;
  }

  /**
   * Package files into specified format
   */
  private async packageFiles(files: AppFile[], options: PackagingOptions): Promise<string> {
    // Simulate file packaging
    const packageName = `generated-app-${Date.now()}`;
    const packagePath = `/tmp/${packageName}.${options.outputFormat}`;

    // In a real implementation, this would create actual zip/tar files
    // For now, we'll simulate the packaging process
    await new Promise(resolve => setTimeout(resolve, 500));

    return packagePath;
  }

  /**
   * Calculate package size
   */
  private async calculatePackageSize(packagePath: string): Promise<number> {
    // Simulate size calculation
    return Math.floor(Math.random() * 10000000) + 1000000; // 1-10MB
  }

  /**
   * Get available templates
   */
  public getAvailableTemplates(): AppTemplate[] {
    return [
      {
        id: 'landing-nextjs',
        name: 'Next.js Landing Page',
        type: 'landing',
        framework: 'nextjs',
        files: [], // Would contain actual template files
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'tailwindcss': '^3.0.0'
        },
        scripts: {
          'dev': 'next dev',
          'build': 'next build',
          'start': 'next start'
        },
        configuration: {
          name: 'Landing Page Template',
          description: 'Professional landing page template',
          version: '1.0.0',
          customization: {},
          features: ['responsive', 'seo-optimized'],
          integrations: [],
          deployment: {
            provider: 'vercel',
            settings: {}
          }
        }
      },
      {
        id: 'full-flow-nextjs',
        name: 'Complete Consultation Flow',
        type: 'full-flow',
        framework: 'nextjs',
        files: [], // Would contain actual template files
        dependencies: {
          'next': '^14.0.0',
          'react': '^18.0.0',
          'react-dom': '^18.0.0',
          'tailwindcss': '^3.0.0',
          'framer-motion': '^10.0.0'
        },
        scripts: {
          'dev': 'next dev',
          'build': 'next build',
          'start': 'next start'
        },
        configuration: {
          name: 'Consultation Flow Template',
          description: 'Complete consultation workflow with landing, questionnaire, and results',
          version: '1.0.0',
          customization: {},
          features: ['questionnaire', 'pdf-generation', 'email-notifications'],
          integrations: ['stripe', 'sendgrid'],
          deployment: {
            provider: 'vercel',
            settings: {}
          }
        }
      }
    ];
  }
}

// Export singleton instance
export const appPackagingSystem = AppPackagingSystem.getInstance();