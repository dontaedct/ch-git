/**
 * @fileoverview Automated Test Generator Tests
 * HT-031.1.2: Automated Testing Framework Integration
 * Tests for the automated test generation system
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { createTestGenerator, AutomatedTestGenerator } from '@/lib/testing/auto-generator';

describe('Automated Test Generator', () => {
  let generator: AutomatedTestGenerator;

  beforeEach(() => {
    generator = createTestGenerator({
      framework: 'jest',
      language: 'typescript',
      patterns: {
        unit: true,
        integration: false,
        e2e: false,
        performance: false,
        accessibility: false
      }
    });
  });

  describe('Test Generation Configuration', () => {
    it('should create generator with default configuration', () => {
      const defaultGenerator = createTestGenerator();
      expect(defaultGenerator).toBeInstanceOf(AutomatedTestGenerator);
    });

    it('should create generator with custom configuration', () => {
      const customGenerator = createTestGenerator({
        framework: 'vitest',
        language: 'javascript',
        patterns: {
          unit: true,
          integration: true,
          e2e: true,
          performance: false,
          accessibility: false
        }
      });
      expect(customGenerator).toBeInstanceOf(AutomatedTestGenerator);
    });
  });

  describe('Code Analysis', () => {
    it('should analyze React component code', async () => {
      const componentCode = `
        import React from 'react';
        
        interface ButtonProps {
          onClick: () => void;
          children: React.ReactNode;
          disabled?: boolean;
        }
        
        export function Button({ onClick, children, disabled = false }: ButtonProps) {
          return (
            <button onClick={onClick} disabled={disabled}>
              {children}
            </button>
          );
        }
      `;

      // Mock file system for testing
      const mockReadFile = async (filePath: string) => {
        if (filePath.includes('Button')) {
          return componentCode;
        }
        throw new Error('File not found');
      };

      // Replace fs.readFile with mock
      const originalReadFile = require('fs').promises.readFile;
      require('fs').promises.readFile = mockReadFile;

      try {
        const analysis = await generator.analyzeCode('./Button.tsx');
        
        expect(analysis.component).toBe('Button');
        expect(analysis.functions).toContain('Button');
        expect(analysis.props).toContain('onClick');
        expect(analysis.props).toContain('disabled');
        expect(analysis.isComponent).toBe(true);
        expect(analysis.complexity).toBe('low');
      } finally {
        // Restore original function
        require('fs').promises.readFile = originalReadFile;
      }
    });

    it('should analyze utility function code', async () => {
      const utilityCode = `
        export function debounce<T extends (...args: any[]) => any>(
          func: T,
          wait: number
        ): T {
          let timeout: NodeJS.Timeout;
          return ((...args: any[]) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func(...args), wait);
          }) as T;
        }
      `;

      const mockReadFile = async (filePath: string) => {
        if (filePath.includes('debounce')) {
          return utilityCode;
        }
        throw new Error('File not found');
      };

      const originalReadFile = require('fs').promises.readFile;
      require('fs').promises.readFile = mockReadFile;

      try {
        const analysis = await generator.analyzeCode('./debounce.ts');
        
        expect(analysis.functions).toContain('debounce');
        expect(analysis.complexity).toBe('low');
      } finally {
        require('fs').promises.readFile = originalReadFile;
      }
    });
  });

  describe('Test Suite Generation', () => {
    it('should generate unit tests for a component', async () => {
      const mockAnalysis = {
        component: 'Button',
        functions: ['Button'],
        props: ['onClick', 'children', 'disabled'],
        hooks: [],
        dependencies: ['react'],
        complexity: 'low' as const,
        coverage: 85,
        recommendations: ['Test component rendering', 'Test user interactions']
      };

      // Mock the analyzeCode method
      const originalAnalyzeCode = generator.analyzeCode.bind(generator);
      generator.analyzeCode = async () => mockAnalysis;

      try {
        const tests = await generator.generateTestSuite('./Button.tsx');
        
        expect(tests).toBeDefined();
        expect(tests.length).toBeGreaterThan(0);
        
        const unitTests = tests.filter(test => test.type === 'unit');
        expect(unitTests.length).toBeGreaterThan(0);
        
        const unitTest = unitTests[0];
        expect(unitTest.name).toContain('Button');
        expect(unitTest.content).toContain('describe');
        expect(unitTest.content).toContain('Button');
        expect(unitTest.file).toContain('.test.ts');
      } finally {
        generator.analyzeCode = originalAnalyzeCode;
      }
    });

    it('should generate multiple test types when enabled', async () => {
      const multiTypeGenerator = createTestGenerator({
        patterns: {
          unit: true,
          integration: true,
          e2e: true,
          performance: false,
          accessibility: false
        }
      });

      const mockAnalysis = {
        component: 'Form',
        functions: ['Form', 'validateForm', 'submitForm'],
        props: ['onSubmit', 'fields'],
        hooks: ['useState', 'useEffect'],
        dependencies: ['react', 'react-hook-form'],
        complexity: 'medium' as const,
        coverage: 75,
        recommendations: ['Test form validation', 'Test form submission']
      };

      multiTypeGenerator.analyzeCode = async () => mockAnalysis;

      const tests = await multiTypeGenerator.generateTestSuite('./Form.tsx');
      
      expect(tests.length).toBeGreaterThan(0);
      
      const unitTests = tests.filter(test => test.type === 'unit');
      const integrationTests = tests.filter(test => test.type === 'integration');
      const e2eTests = tests.filter(test => test.type === 'e2e');
      
      expect(unitTests.length).toBeGreaterThan(0);
      expect(integrationTests.length).toBeGreaterThan(0);
      expect(e2eTests.length).toBeGreaterThan(0);
    });
  });

  describe('Coverage Report Generation', () => {
    it('should generate coverage report for tests', async () => {
      const mockTests = [
        {
          id: 'test-1',
          name: 'Button unit tests',
          type: 'unit' as const,
          file: 'Button.test.ts',
          content: 'test content',
          coverage: 90,
          complexity: 'low' as const,
          estimatedDuration: 500,
          dependencies: ['react']
        },
        {
          id: 'test-2',
          name: 'Button integration tests',
          type: 'integration' as const,
          file: 'Button.integration.test.ts',
          content: 'test content',
          coverage: 85,
          complexity: 'medium' as const,
          estimatedDuration: 2000,
          dependencies: ['react', 'testing-library']
        }
      ];

      const report = await generator.generateCoverageReport(mockTests);
      
      expect(report.totalTests).toBe(2);
      expect(report.averageCoverage).toBe(88); // (90 + 85) / 2 rounded
      expect(report.testTypes.unit).toBe(1);
      expect(report.testTypes.integration).toBe(1);
      expect(report.complexity.low).toBe(1);
      expect(report.complexity.medium).toBe(1);
      expect(report.estimatedDuration).toBe(2500);
    });
  });

  describe('Error Handling', () => {
    it('should handle file analysis errors gracefully', async () => {
      const mockReadFile = async () => {
        throw new Error('File not found');
      };

      const originalReadFile = require('fs').promises.readFile;
      require('fs').promises.readFile = mockReadFile;

      try {
        await expect(generator.analyzeCode('./nonexistent.ts')).rejects.toThrow('Failed to analyze ./nonexistent.ts');
      } finally {
        require('fs').promises.readFile = originalReadFile;
      }
    });

    it('should handle empty or invalid code gracefully', async () => {
      const emptyCode = '';
      
      const mockReadFile = async () => emptyCode;
      const originalReadFile = require('fs').promises.readFile;
      require('fs').promises.readFile = mockReadFile;

      try {
        const analysis = await generator.analyzeCode('./empty.ts');
        
        expect(analysis.component).toBe('');
        expect(analysis.functions).toEqual([]);
        expect(analysis.props).toEqual([]);
        expect(analysis.hooks).toEqual([]);
        expect(analysis.dependencies).toEqual([]);
        expect(analysis.complexity).toBe('low');
      } finally {
        require('fs').promises.readFile = originalReadFile;
      }
    });
  });

  describe('Framework Support', () => {
    it('should generate Jest test content', () => {
      const mockAnalysis = {
        component: 'TestComponent',
        functions: ['TestComponent'],
        props: [],
        hooks: [],
        dependencies: [],
        complexity: 'low' as const,
        coverage: 80,
        recommendations: []
      };

      const generator = createTestGenerator({ framework: 'jest' });
      const testContent = (generator as any).generateJestTestContent('TestComponent', mockAnalysis);
      
      expect(testContent).toContain('describe');
      expect(testContent).toContain('TestComponent');
      expect(testContent).toContain('it(');
      expect(testContent).toContain('expect');
    });

    it('should generate Vitest test content', () => {
      const mockAnalysis = {
        component: 'TestComponent',
        functions: ['TestComponent'],
        props: [],
        hooks: [],
        dependencies: [],
        complexity: 'low' as const,
        coverage: 80,
        recommendations: []
      };

      const generator = createTestGenerator({ framework: 'vitest' });
      const testContent = (generator as any).generateVitestTestContent('TestComponent', mockAnalysis);
      
      expect(testContent).toContain('import { describe, it, expect');
      expect(testContent).toContain('TestComponent');
      expect(testContent).toContain('describe');
      expect(testContent).toContain('it(');
    });
  });
});
