/**
 * @fileoverview Template Intelligence System Tests
 * @module tests/code-gen/template-intelligence.test
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * HT-031.2.3: Advanced Code Generation & Template Intelligence Tests
 * 
 * Comprehensive test suite for the template intelligence system covering:
 * - Template management and registration
 * - Intelligent suggestion generation
 * - Template analysis and quality scoring
 * - Performance optimization and caching
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  TemplateIntelligence, 
  CodeTemplate, 
  ProjectContext, 
  TemplateSuggestion,
  TemplateAnalysis 
} from '@lib/code-gen/template-intelligence';

describe('TemplateIntelligence', () => {
  let templateIntelligence: TemplateIntelligence;
  let mockProjectContext: ProjectContext;
  let mockTemplate: CodeTemplate;

  beforeEach(() => {
    templateIntelligence = new TemplateIntelligence();
    
    mockProjectContext = {
      name: 'TestComponent',
      description: 'A test React component',
      type: 'component',
      framework: 'react',
      styling: 'tailwind',
      features: ['TypeScript Support', 'Accessibility (a11y)'],
      customRequirements: 'Should be responsive and mobile-friendly'
    };

    mockTemplate = {
      id: 'test-template',
      name: 'Test Template',
      description: 'A test template for unit testing',
      category: 'component',
      framework: ['react'],
      styling: ['tailwind'],
      features: ['TypeScript Support'],
      complexity: 'simple',
      template: 'const {{componentName}} = () => <div>{{description}}</div>;',
      variables: [
        {
          name: 'componentName',
          type: 'string',
          description: 'Component name',
          required: true
        },
        {
          name: 'description',
          type: 'string',
          description: 'Component description',
          defaultValue: 'Test component',
          required: false
        }
      ],
      dependencies: ['react'],
      devDependencies: ['@types/react'],
      files: [],
      tags: ['react', 'component'],
      version: '1.0.0',
      author: 'Test Author',
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 4.5,
      confidence: 85
    };
  });

  describe('Template Management', () => {
    it('should initialize with built-in templates', () => {
      const templates = templateIntelligence.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);
      expect(templates.some(t => t.category === 'component')).toBe(true);
      expect(templates.some(t => t.category === 'page')).toBe(true);
      expect(templates.some(t => t.category === 'api')).toBe(true);
    });

    it('should register new templates', () => {
      const initialCount = templateIntelligence.getAllTemplates().length;
      templateIntelligence.registerTemplate(mockTemplate);
      
      const newCount = templateIntelligence.getAllTemplates().length;
      expect(newCount).toBe(initialCount + 1);
      
      const retrieved = templateIntelligence.getTemplate('test-template');
      expect(retrieved).toEqual(mockTemplate);
    });

    it('should get templates by category', () => {
      templateIntelligence.registerTemplate(mockTemplate);
      const componentTemplates = templateIntelligence.getTemplatesByCategory('component');
      
      expect(componentTemplates.length).toBeGreaterThan(0);
      expect(componentTemplates.every(t => t.category === 'component')).toBe(true);
      expect(componentTemplates.some(t => t.id === 'test-template')).toBe(true);
    });

    it('should get templates by framework', () => {
      templateIntelligence.registerTemplate(mockTemplate);
      const reactTemplates = templateIntelligence.getTemplatesByFramework('react');
      
      expect(reactTemplates.length).toBeGreaterThan(0);
      expect(reactTemplates.every(t => t.framework.includes('react'))).toBe(true);
      expect(reactTemplates.some(t => t.id === 'test-template')).toBe(true);
    });

    it('should update usage statistics', () => {
      templateIntelligence.registerTemplate(mockTemplate);
      const initialUsage = mockTemplate.usageCount;
      
      templateIntelligence.updateUsageStats('test-template');
      
      const updated = templateIntelligence.getTemplate('test-template');
      expect(updated?.usageCount).toBe(initialUsage + 1);
      expect(updated?.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Intelligent Suggestions', () => {
    beforeEach(() => {
      templateIntelligence.registerTemplate(mockTemplate);
    });

    it('should generate suggestions for project context', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      expect(suggestions).toBeInstanceOf(Array);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('template');
      expect(suggestions[0]).toHaveProperty('confidence');
      expect(suggestions[0]).toHaveProperty('reasoning');
    });

    it('should calculate confidence scores correctly', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      // Find our test template in suggestions
      const testSuggestion = suggestions.find(s => s.template.id === 'test-template');
      expect(testSuggestion).toBeDefined();
      expect(testSuggestion!.confidence).toBeGreaterThan(0);
      expect(testSuggestion!.confidence).toBeLessThanOrEqual(100);
    });

    it('should sort suggestions by confidence', async () => {
      // Add another template with different characteristics
      const lowConfidenceTemplate: CodeTemplate = {
        ...mockTemplate,
        id: 'low-confidence-template',
        framework: ['vue'], // Different framework
        styling: ['emotion'], // Different styling
        features: [] // No matching features
      };
      templateIntelligence.registerTemplate(lowConfidenceTemplate);

      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      // Should be sorted by confidence (descending)
      for (let i = 1; i < suggestions.length; i++) {
        expect(suggestions[i - 1].confidence).toBeGreaterThanOrEqual(suggestions[i].confidence);
      }
    });

    it('should provide meaningful reasoning', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      const testSuggestion = suggestions.find(s => s.template.id === 'test-template');
      
      expect(testSuggestion?.reasoning).toBeTruthy();
      expect(testSuggestion?.reasoning.length).toBeGreaterThan(10);
      expect(testSuggestion?.reasoning).toContain('component'); // Should mention the type match
    });

    it('should identify matches correctly', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      const testSuggestion = suggestions.find(s => s.template.id === 'test-template');
      
      expect(testSuggestion?.matches).toBeInstanceOf(Array);
      expect(testSuggestion?.matches.some(m => m.includes('component'))).toBe(true);
      expect(testSuggestion?.matches.some(m => m.includes('react'))).toBe(true);
    });

    it('should suggest improvements', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      const testSuggestion = suggestions.find(s => s.template.id === 'test-template');
      
      expect(testSuggestion?.improvements).toBeInstanceOf(Array);
      // Should suggest adding accessibility feature since template doesn't have it
      expect(testSuggestion?.improvements.some(i => i.includes('Accessibility'))).toBe(true);
    });

    it('should estimate effort and impact correctly', async () => {
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      suggestions.forEach(suggestion => {
        expect(['low', 'medium', 'high']).toContain(suggestion.estimatedEffort);
        expect(['low', 'medium', 'high']).toContain(suggestion.impact);
      });
    });

    it('should cache suggestions for performance', async () => {
      const start1 = Date.now();
      const suggestions1 = await templateIntelligence.getSuggestions(mockProjectContext);
      const time1 = Date.now() - start1;

      const start2 = Date.now();
      const suggestions2 = await templateIntelligence.getSuggestions(mockProjectContext);
      const time2 = Date.now() - start2;

      expect(suggestions1).toEqual(suggestions2);
      expect(time2).toBeLessThan(time1); // Second call should be faster due to caching
    });
  });

  describe('Template Analysis', () => {
    beforeEach(() => {
      templateIntelligence.registerTemplate(mockTemplate);
    });

    it('should analyze template quality', async () => {
      const analysis = await templateIntelligence.analyzeTemplate('test-template');
      
      expect(analysis).toHaveProperty('quality');
      expect(analysis).toHaveProperty('performance');
      expect(analysis).toHaveProperty('maintainability');
      expect(analysis).toHaveProperty('accessibility');
      expect(analysis).toHaveProperty('security');
      expect(analysis).toHaveProperty('testability');
      expect(analysis).toHaveProperty('documentation');
      expect(analysis).toHaveProperty('overall');
      
      // All scores should be between 0 and 100
      Object.values(analysis).forEach(score => {
        if (typeof score === 'number') {
          expect(score).toBeGreaterThanOrEqual(0);
          expect(score).toBeLessThanOrEqual(100);
        }
      });
    });

    it('should calculate overall score correctly', async () => {
      const analysis = await templateIntelligence.analyzeTemplate('test-template');
      
      const expectedOverall = Math.round(
        (analysis.quality + analysis.performance + analysis.maintainability + 
         analysis.accessibility + analysis.security + analysis.testability + 
         analysis.documentation) / 7
      );
      
      expect(analysis.overall).toBe(expectedOverall);
    });

    it('should provide issues and recommendations', async () => {
      const analysis = await templateIntelligence.analyzeTemplate('test-template');
      
      expect(analysis.issues).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });

    it('should cache analysis results', async () => {
      const analysis1 = await templateIntelligence.analyzeTemplate('test-template');
      const analysis2 = await templateIntelligence.analyzeTemplate('test-template');
      
      expect(analysis1).toEqual(analysis2);
    });

    it('should throw error for non-existent template', async () => {
      await expect(templateIntelligence.analyzeTemplate('non-existent'))
        .rejects
        .toThrow('Template non-existent not found');
    });
  });

  describe('Performance Optimization', () => {
    it('should provide performance metrics', () => {
      templateIntelligence.registerTemplate(mockTemplate);
      const metrics = templateIntelligence.getPerformanceMetrics();
      
      expect(metrics).toHaveProperty('templateCount');
      expect(metrics).toHaveProperty('cacheHitRate');
      expect(metrics).toHaveProperty('avgConfidence');
      expect(metrics).toHaveProperty('popularTemplates');
      
      expect(metrics.templateCount).toBeGreaterThan(0);
      expect(metrics.avgConfidence).toBeGreaterThan(0);
      expect(metrics.popularTemplates).toBeInstanceOf(Array);
    });

    it('should clear caches', async () => {
      // Generate some cached data
      await templateIntelligence.getSuggestions(mockProjectContext);
      await templateIntelligence.analyzeTemplate('react-functional-component');
      
      // Clear caches
      templateIntelligence.clearCache();
      
      // This should work without errors
      const suggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      expect(suggestions).toBeInstanceOf(Array);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty project context', async () => {
      const emptyContext: ProjectContext = {
        name: '',
        description: '',
        type: 'component',
        framework: 'react',
        styling: 'tailwind',
        features: [],
        customRequirements: ''
      };
      
      const suggestions = await templateIntelligence.getSuggestions(emptyContext);
      expect(suggestions).toBeInstanceOf(Array);
    });

    it('should handle invalid template variables', () => {
      const invalidTemplate: CodeTemplate = {
        ...mockTemplate,
        id: 'invalid-template',
        variables: [
          {
            name: 'invalidVar',
            type: 'string',
            description: 'Invalid variable',
            required: true,
            validation: '^[A-Z]' // Strict pattern
          }
        ]
      };
      
      templateIntelligence.registerTemplate(invalidTemplate);
      const retrieved = templateIntelligence.getTemplate('invalid-template');
      expect(retrieved).toBeDefined();
    });

    it('should handle templates with missing properties', () => {
      const incompleteTemplate = {
        ...mockTemplate,
        id: 'incomplete-template',
        dependencies: undefined,
        devDependencies: undefined,
        files: undefined
      } as CodeTemplate;
      
      expect(() => templateIntelligence.registerTemplate(incompleteTemplate)).not.toThrow();
    });

    it('should handle concurrent access safely', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => 
        templateIntelligence.getSuggestions({
          ...mockProjectContext,
          name: `Component${i}`
        })
      );
      
      const results = await Promise.all(promises);
      expect(results).toHaveLength(10);
      results.forEach(result => {
        expect(result).toBeInstanceOf(Array);
      });
    });
  });

  describe('Integration Tests', () => {
    it('should work with complex project contexts', async () => {
      const complexContext: ProjectContext = {
        name: 'ComplexDashboard',
        description: 'A complex dashboard with multiple features and integrations',
        type: 'page',
        framework: 'next',
        styling: 'tailwind',
        features: [
          'TypeScript Support',
          'Responsive Design',
          'Dark Mode',
          'Accessibility (a11y)',
          'Internationalization (i18n)',
          'State Management',
          'API Integration',
          'Form Validation',
          'Error Boundaries',
          'Testing Setup',
          'Performance Optimization'
        ],
        customRequirements: 'Must support real-time data updates, have excellent SEO, and be mobile-first'
      };
      
      const suggestions = await templateIntelligence.getSuggestions(complexContext);
      
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0].confidence).toBeGreaterThan(50);
      
      // Should find Next.js page templates
      const nextjsTemplates = suggestions.filter(s => 
        s.template.framework.includes('next') && s.template.category === 'page'
      );
      expect(nextjsTemplates.length).toBeGreaterThan(0);
    });

    it('should provide relevant suggestions for API projects', async () => {
      const apiContext: ProjectContext = {
        name: 'UserAPI',
        description: 'RESTful API for user management',
        type: 'api',
        framework: 'next',
        styling: 'none',
        features: ['TypeScript Support', 'Form Validation', 'Error Handling'],
        customRequirements: 'Must have proper authentication and rate limiting'
      };
      
      const suggestions = await templateIntelligence.getSuggestions(apiContext);
      
      expect(suggestions.length).toBeGreaterThan(0);
      
      // Should find API templates
      const apiTemplates = suggestions.filter(s => s.template.category === 'api');
      expect(apiTemplates.length).toBeGreaterThan(0);
      
      // Should have high confidence for matching API templates
      const highConfidenceApi = apiTemplates.find(s => s.confidence > 80);
      expect(highConfidenceApi).toBeDefined();
    });

    it('should handle template updates and cache invalidation', async () => {
      // Get initial suggestions
      const initialSuggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      // Update template
      const updatedTemplate = {
        ...mockTemplate,
        features: [...mockTemplate.features, 'Accessibility (a11y)'],
        rating: 4.8,
        confidence: 95
      };
      
      templateIntelligence.registerTemplate(updatedTemplate);
      
      // Get new suggestions (cache should be cleared)
      const newSuggestions = await templateIntelligence.getSuggestions(mockProjectContext);
      
      // Find the updated template in suggestions
      const updatedSuggestion = newSuggestions.find(s => s.template.id === 'test-template');
      expect(updatedSuggestion?.template.features).toContain('Accessibility (a11y)');
      expect(updatedSuggestion?.template.confidence).toBe(95);
    });
  });
});
