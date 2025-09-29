/**
 * @fileoverview Automated Scaffolding Engine Tests
 * @module tests/code-gen/automated-scaffolding.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-031.2.3: Advanced Code Generation & Template Intelligence Tests
 * 
 * Comprehensive test suite for the automated scaffolding engine covering:
 * - Project generation and scaffolding
 * - Template processing and variable interpolation
 * - File generation and structure creation
 * - Code optimization and validation
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  AutomatedScaffolding, 
  ScaffoldingOptions,
  ScaffoldingResult,
  ProjectContext,
  GeneratedFile 
} from '@lib/code-gen/automated-scaffolding';
import { CodeTemplate } from '@lib/code-gen/template-intelligence';

describe('AutomatedScaffolding', () => {
  let scaffolding: AutomatedScaffolding;
  let mockProjectContext: ProjectContext;
  let mockTemplate: CodeTemplate;
  let mockScaffoldingOptions: ScaffoldingOptions;

  beforeEach(() => {
    scaffolding = new AutomatedScaffolding();
    
    mockProjectContext = {
      name: 'TestComponent',
      description: 'A test React component for unit testing',
      type: 'component',
      framework: 'react',
      styling: 'tailwind',
      features: ['TypeScript Support', 'Responsive Design', 'Accessibility (a11y)'],
      customRequirements: 'Should be mobile-friendly and accessible'
    };

    mockTemplate = {
      id: 'test-react-component',
      name: 'Test React Component',
      description: 'A test template for React components',
      category: 'component',
      framework: ['react'],
      styling: ['tailwind'],
      features: ['TypeScript Support'],
      complexity: 'simple',
      template: `import React from 'react';

{{#if typescript}}
interface {{componentName}}Props {
  className?: string;
  children?: React.ReactNode;
}
{{/if}}

{{#if typescript}}
export const {{componentName}}: React.FC<{{componentName}}Props> = ({ className, children }) => {
{{else}}
export const {{componentName}} = ({ className, children }) => {
{{/if}}
  return (
    <div className={\`{{baseClasses}} \${className || ''}\`}>
      <h1>{{title}}</h1>
      <p>{{description}}</p>
      {children}
    </div>
  );
};

export default {{componentName}};`,
      variables: [
        {
          name: 'componentName',
          type: 'string',
          description: 'Component name',
          required: true
        },
        {
          name: 'title',
          type: 'string',
          description: 'Component title',
          defaultValue: 'Default Title',
          required: false
        },
        {
          name: 'description',
          type: 'string',
          description: 'Component description',
          required: false
        },
        {
          name: 'typescript',
          type: 'boolean',
          description: 'Use TypeScript',
          defaultValue: true,
          required: false
        },
        {
          name: 'baseClasses',
          type: 'string',
          description: 'Base CSS classes',
          defaultValue: 'p-4 rounded-lg',
          required: false
        }
      ],
      dependencies: ['react'],
      devDependencies: ['@types/react'],
      files: [
        {
          path: '{{componentName}}.test.tsx',
          content: `import { render } from '@testing-library/react';
import {{componentName}} from './{{componentName}}';

describe('{{componentName}}', () => {
  it('renders correctly', () => {
    render(<{{componentName}} />);
  });
});`,
          type: 'test',
          language: 'tsx',
          size: 200
        }
      ],
      tags: ['react', 'component', 'test'],
      version: '1.0.0',
      author: 'Test Author',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 4.5,
      confidence: 90
    };

    mockScaffoldingOptions = {
      template: mockTemplate,
      variables: {
        componentName: 'TestComponent',
        title: 'Test Component',
        description: 'A test component',
        typescript: true,
        baseClasses: 'p-4 rounded-lg border'
      },
      optimization: 'basic',
      validation: true,
      formatting: true
    };
  });

  describe('Project Generation', () => {
    it('should generate project successfully', async () => {
      const result = await scaffolding.generateProject(mockProjectContext);
      
      expect(result.success).toBe(true);
      expect(result.code).toBeTruthy();
      expect(result.files.length).toBeGreaterThan(0);
      expect(result.dependencies.length).toBeGreaterThan(0);
      expect(result.template).toBeTruthy();
      expect(result.confidence).toBeGreaterThan(0);
      expect(result.errors.length).toBe(0);
    });

    it('should handle generation errors gracefully', async () => {
      const invalidContext = {
        ...mockProjectContext,
        name: '', // Invalid empty name
        description: ''
      };
      
      const result = await scaffolding.generateProject(invalidContext);
      
      // Should still return a result structure even on error
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('metrics');
    });

    it('should generate appropriate dependencies', async () => {
      const result = await scaffolding.generateProject(mockProjectContext);
      
      expect(result.dependencies).toContain('react');
      
      if (mockProjectContext.features.includes('TypeScript Support')) {
        expect(result.devDependencies).toContain('typescript');
        expect(result.devDependencies).toContain('@types/react');
      }
    });

    it('should generate appropriate scripts', async () => {
      const result = await scaffolding.generateProject(mockProjectContext);
      
      expect(result.scripts).toHaveProperty('dev');
      expect(result.scripts).toHaveProperty('build');
      
      if (mockProjectContext.features.includes('TypeScript Support')) {
        expect(result.scripts).toHaveProperty('typecheck');
      }
      
      if (mockProjectContext.features.includes('Testing Setup')) {
        expect(result.scripts).toHaveProperty('test');
      }
    });

    it('should calculate metrics correctly', async () => {
      const result = await scaffolding.generateProject(mockProjectContext);
      
      expect(result.metrics).toHaveProperty('generationTime');
      expect(result.metrics).toHaveProperty('filesGenerated');
      expect(result.metrics).toHaveProperty('linesOfCode');
      expect(result.metrics).toHaveProperty('codeComplexity');
      expect(result.metrics).toHaveProperty('qualityScore');
      expect(result.metrics).toHaveProperty('performanceScore');
      expect(result.metrics).toHaveProperty('maintainabilityScore');
      
      expect(result.metrics.generationTime).toBeGreaterThan(0);
      expect(result.metrics.filesGenerated).toBeGreaterThan(0);
      expect(result.metrics.linesOfCode).toBeGreaterThan(0);
    });
  });

  describe('Template Processing', () => {
    it('should scaffold from options successfully', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('TestComponent');
      expect(result.code).toContain('Test Component');
      expect(result.code).toContain('A test component');
      expect(result.files.length).toBeGreaterThan(0);
    });

    it('should process template variables correctly', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      // Should replace all template variables
      expect(result.code).toContain('TestComponent');
      expect(result.code).not.toContain('{{componentName}}');
      expect(result.code).toContain('Test Component');
      expect(result.code).not.toContain('{{title}}');
      expect(result.code).toContain('A test component');
      expect(result.code).not.toContain('{{description}}');
    });

    it('should process conditional blocks correctly', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      // Should include TypeScript interface since typescript is true
      expect(result.code).toContain('interface TestComponentProps');
      expect(result.code).toContain('React.FC<TestComponentProps>');
    });

    it('should handle missing variables with defaults', async () => {
      const optionsWithMissingVars = {
        ...mockScaffoldingOptions,
        variables: {
          componentName: 'TestComponent'
          // Missing other variables - should use defaults
        }
      };
      
      const result = await scaffolding.scaffold(optionsWithMissingVars);
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('TestComponent');
      expect(result.code).toContain('Default Title'); // Should use default
    });

    it('should validate required variables', async () => {
      const optionsWithMissingRequired = {
        ...mockScaffoldingOptions,
        variables: {
          // Missing required componentName
          title: 'Test Title'
        }
      };
      
      const result = await scaffolding.scaffold(optionsWithMissingRequired);
      
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(e => e.includes('componentName'))).toBe(true);
    });

    it('should validate variable types', async () => {
      const optionsWithWrongTypes = {
        ...mockScaffoldingOptions,
        variables: {
          componentName: 'TestComponent',
          typescript: 'not-a-boolean' // Wrong type
        }
      };
      
      const result = await scaffolding.scaffold(optionsWithWrongTypes);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('boolean'))).toBe(true);
    });
  });

  describe('File Generation', () => {
    it('should generate main component file', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      expect(result.files.length).toBeGreaterThan(0);
      
      const mainFile = result.files[0];
      expect(mainFile.path).toContain('TestComponent');
      expect(mainFile.type).toBe('component');
      expect(mainFile.language).toBe('tsx');
      expect(mainFile.content).toBeTruthy();
      expect(mainFile.size).toBeGreaterThan(0);
    });

    it('should generate additional files from template', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      // Should have main file + test file
      expect(result.files.length).toBeGreaterThanOrEqual(2);
      
      const testFile = result.files.find(f => f.type === 'test');
      expect(testFile).toBeDefined();
      expect(testFile?.path).toContain('test');
      expect(testFile?.content).toContain('TestComponent');
    });

    it('should generate correct file paths', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      const mainFile = result.files[0];
      expect(mainFile.path).toBe('components/TestComponent.tsx');
    });

    it('should handle different project types', async () => {
      const pageOptions = {
        ...mockScaffoldingOptions,
        template: {
          ...mockTemplate,
          category: 'page' as const
        },
        variables: {
          ...mockScaffoldingOptions.variables,
          pageName: 'TestPage'
        }
      };
      
      const result = await scaffolding.scaffold(pageOptions);
      
      expect(result.success).toBe(true);
      const mainFile = result.files[0];
      expect(mainFile.path).toContain('pages/');
    });
  });

  describe('Code Optimization', () => {
    it('should apply basic optimizations', async () => {
      const options = {
        ...mockScaffoldingOptions,
        optimization: 'basic' as const
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.success).toBe(true);
      // Code should be optimized (no empty lines, imports optimized)
      expect(result.code).not.toMatch(/\n\s*\n\s*\n/); // No triple line breaks
    });

    it('should apply aggressive optimizations', async () => {
      const options = {
        ...mockScaffoldingOptions,
        optimization: 'aggressive' as const
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.success).toBe(true);
      // Should apply all optimizations
      expect(result.code).toBeTruthy();
    });

    it('should skip optimization when disabled', async () => {
      const options = {
        ...mockScaffoldingOptions,
        optimization: 'none' as const
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.success).toBe(true);
      expect(result.code).toBeTruthy();
    });

    it('should apply code formatting', async () => {
      const options = {
        ...mockScaffoldingOptions,
        formatting: true
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.success).toBe(true);
      // Should not have trailing whitespace
      expect(result.code).not.toMatch(/\s+$/m);
    });
  });

  describe('Validation and Error Handling', () => {
    it('should skip validation when disabled', async () => {
      const options = {
        ...mockScaffoldingOptions,
        validation: false,
        variables: {} // Empty variables - would fail validation if enabled
      };
      
      const result = await scaffolding.scaffold(options);
      
      // Should succeed because validation is disabled
      expect(result.success).toBe(true);
    });

    it('should validate variable patterns', async () => {
      const templateWithValidation = {
        ...mockTemplate,
        variables: [
          {
            name: 'componentName',
            type: 'string' as const,
            description: 'Component name',
            required: true,
            validation: '^[A-Z][a-zA-Z0-9]*$' // Must start with capital letter
          }
        ]
      };
      
      const optionsWithInvalidPattern = {
        ...mockScaffoldingOptions,
        template: templateWithValidation,
        variables: {
          componentName: 'invalidName' // Doesn't start with capital
        }
      };
      
      const result = await scaffolding.scaffold(optionsWithInvalidPattern);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('pattern'))).toBe(true);
    });

    it('should validate variable options', async () => {
      const templateWithOptions = {
        ...mockTemplate,
        variables: [
          {
            name: 'size',
            type: 'string' as const,
            description: 'Component size',
            required: true,
            options: ['small', 'medium', 'large']
          }
        ]
      };
      
      const optionsWithInvalidOption = {
        ...mockScaffoldingOptions,
        template: templateWithOptions,
        variables: {
          size: 'extra-large' // Not in options
        }
      };
      
      const result = await scaffolding.scaffold(optionsWithInvalidOption);
      
      expect(result.success).toBe(false);
      expect(result.errors.some(e => e.includes('must be one of'))).toBe(true);
    });

    it('should handle template processing errors', async () => {
      const templateWithError = {
        ...mockTemplate,
        template: 'Invalid template with {{unclosed' // Malformed template
      };
      
      const optionsWithBadTemplate = {
        ...mockScaffoldingOptions,
        template: templateWithError
      };
      
      const result = await scaffolding.scaffold(optionsWithBadTemplate);
      
      // Should handle gracefully and still return a result
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('errors');
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate code complexity correctly', async () => {
      const complexTemplate = {
        ...mockTemplate,
        template: `
          const component = () => {
            if (condition) {
              while (items.length > 0) {
                try {
                  items.forEach(item => {
                    if (item.valid && item.active) {
                      process(item);
                    }
                  });
                } catch (error) {
                  handleError(error);
                }
              }
            }
            return <div />;
          };
        `
      };
      
      const options = {
        ...mockScaffoldingOptions,
        template: complexTemplate
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.metrics.codeComplexity).toBeGreaterThan(1);
    });

    it('should calculate quality scores', async () => {
      const result = await scaffolding.scaffold(mockScaffoldingOptions);
      
      expect(result.metrics.qualityScore).toBeGreaterThan(0);
      expect(result.metrics.qualityScore).toBeLessThanOrEqual(100);
      expect(result.metrics.performanceScore).toBeGreaterThan(0);
      expect(result.metrics.performanceScore).toBeLessThanOrEqual(100);
      expect(result.metrics.maintainabilityScore).toBeGreaterThan(0);
      expect(result.metrics.maintainabilityScore).toBeLessThanOrEqual(100);
    });

    it('should penalize quality for missing features', async () => {
      const templateWithoutTS = {
        ...mockTemplate,
        template: 'const Component = () => <div />;' // No TypeScript
      };
      
      const options = {
        ...mockScaffoldingOptions,
        template: templateWithoutTS
      };
      
      const result = await scaffolding.scaffold(options);
      
      // Quality score should be lower due to missing TypeScript
      expect(result.metrics.qualityScore).toBeLessThan(100);
    });
  });

  describe('Framework-Specific Features', () => {
    it('should handle React-specific features', async () => {
      const result = await scaffolding.generateProject(mockProjectContext);
      
      expect(result.dependencies).toContain('react');
      expect(result.code).toContain('React');
    });

    it('should handle Next.js-specific features', async () => {
      const nextjsContext = {
        ...mockProjectContext,
        framework: 'next' as const,
        type: 'page' as const
      };
      
      const result = await scaffolding.generateProject(nextjsContext);
      
      expect(result.dependencies).toContain('next');
      expect(result.scripts.dev).toBe('next dev');
      expect(result.scripts.build).toBe('next build');
    });

    it('should handle Vue-specific features', async () => {
      const vueContext = {
        ...mockProjectContext,
        framework: 'vue' as const
      };
      
      const result = await scaffolding.generateProject(vueContext);
      
      expect(result.dependencies).toContain('vue');
    });
  });

  describe('Integration Tests', () => {
    it('should work with complex project configurations', async () => {
      const complexContext: ProjectContext = {
        name: 'AdvancedDashboard',
        description: 'A complex dashboard with multiple features',
        type: 'page',
        framework: 'next',
        styling: 'tailwind',
        features: [
          'TypeScript Support',
          'Responsive Design',
          'Dark Mode',
          'Accessibility (a11y)',
          'State Management',
          'API Integration',
          'Testing Setup',
          'Performance Optimization'
        ],
        customRequirements: 'Must be SEO-optimized and support real-time updates'
      };
      
      const result = await scaffolding.generateProject(complexContext);
      
      expect(result.success).toBe(true);
      expect(result.dependencies.length).toBeGreaterThan(1);
      expect(result.devDependencies.length).toBeGreaterThan(1);
      expect(Object.keys(result.scripts).length).toBeGreaterThan(2);
      expect(result.metrics.qualityScore).toBeGreaterThan(70);
    });

    it('should handle dry run mode', async () => {
      const options = {
        ...mockScaffoldingOptions,
        dryRun: true
      };
      
      const result = await scaffolding.scaffold(options);
      
      expect(result.success).toBe(true);
      expect(result.code).toBeTruthy();
      expect(result.files.length).toBeGreaterThan(0);
      // In dry run, no actual files should be written to disk
    });

    it('should generate consistent results', async () => {
      const result1 = await scaffolding.generateProject(mockProjectContext);
      const result2 = await scaffolding.generateProject(mockProjectContext);
      
      // Results should be consistent (same template, dependencies, etc.)
      expect(result1.template).toBe(result2.template);
      expect(result1.dependencies).toEqual(result2.dependencies);
      expect(result1.devDependencies).toEqual(result2.devDependencies);
    });
  });
});
