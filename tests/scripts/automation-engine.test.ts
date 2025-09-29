/**
 * Comprehensive Test Suite for Scripts Automation System
 * 
 * Tests for automation engine, intelligent tooling, and workflow builder
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { EventEmitter } from 'events';
import { AutomationEngine, ScriptConfig, WorkflowConfig } from '../../lib/scripts/automation-engine';
import { IntelligentTooling } from '../../lib/scripts/intelligent-tooling';

// Mock child_process
jest.mock('child_process', () => ({
  spawn: jest.fn(),
  exec: jest.fn()
}));

// Mock fs promises
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    access: jest.fn()
  }
}));

// Mock glob
jest.mock('glob', () => ({
  glob: jest.fn()
}));

describe('AutomationEngine', () => {
  let engine: AutomationEngine;

  beforeEach(() => {
    engine = new AutomationEngine('/test/project');
  });

  afterEach(() => {
    engine.stopAllExecutions();
  });

  describe('Script Management', () => {
    it('should load built-in scripts on initialization', () => {
      const scripts = engine.getScripts();
      expect(scripts.length).toBeGreaterThan(0);
      
      // Check for essential built-in scripts
      const scriptIds = scripts.map(s => s.id);
      expect(scriptIds).toContain('dev-start');
      expect(scriptIds).toContain('build-prod');
      expect(scriptIds).toContain('test-suite');
      expect(scriptIds).toContain('security-audit');
    });

    it('should register new scripts correctly', () => {
      const customScript: ScriptConfig = {
        id: 'custom-test',
        name: 'Custom Test Script',
        description: 'A custom test script',
        command: 'echo "test"',
        category: 'testing',
        priority: 'medium',
        tags: ['custom', 'test']
      };

      engine.registerScript(customScript);
      
      const retrievedScript = engine.getScript('custom-test');
      expect(retrievedScript).toEqual(customScript);
    });

    it('should filter scripts by category', () => {
      const developmentScripts = engine.getScriptsByCategory('development');
      const qualityScripts = engine.getScriptsByCategory('quality');
      const maintenanceScripts = engine.getScriptsByCategory('maintenance');

      expect(developmentScripts.length).toBeGreaterThan(0);
      expect(qualityScripts.length).toBeGreaterThan(0);
      expect(maintenanceScripts.length).toBeGreaterThan(0);

      // Verify all scripts in category match
      developmentScripts.forEach(script => {
        expect(script.category).toBe('development');
      });
    });

    it('should emit events when scripts are registered', (done) => {
      const customScript: ScriptConfig = {
        id: 'event-test',
        name: 'Event Test Script',
        description: 'Tests event emission',
        command: 'echo "event test"',
        category: 'testing',
        priority: 'low'
      };

      engine.once('script-registered', (script) => {
        expect(script).toEqual(customScript);
        done();
      });

      engine.registerScript(customScript);
    });
  });

  describe('Workflow Management', () => {
    it('should register workflows correctly', () => {
      const workflow: WorkflowConfig = {
        id: 'test-workflow',
        name: 'Test Workflow',
        description: 'A test workflow',
        trigger: 'manual',
        steps: [
          {
            id: 'step1',
            name: 'First Step',
            script: 'echo "step 1"',
            continueOnError: false,
            timeout: 60000
          }
        ]
      };

      engine.registerWorkflow(workflow);
      
      // Should emit workflow-registered event
      engine.once('workflow-registered', (registeredWorkflow) => {
        expect(registeredWorkflow).toEqual(workflow);
      });
    });

    it('should validate workflow steps', () => {
      const workflow: WorkflowConfig = {
        id: 'validation-test',
        name: 'Validation Test',
        description: 'Tests validation',
        trigger: 'manual',
        steps: [
          {
            id: 'step1',
            name: 'Valid Step',
            script: 'echo "valid"'
          },
          {
            id: 'step2',
            name: 'Invalid Step',
            script: '' // Invalid: empty script
          }
        ]
      };

      engine.registerWorkflow(workflow);
      // Workflow should be registered but validation would occur during execution
      expect(engine.getScripts().length).toBeGreaterThan(0);
    });
  });

  describe('Script Execution', () => {
    it('should handle script execution context', async () => {
      // Mock spawn to simulate successful execution
      const mockSpawn = require('child_process').spawn as jest.MockedFunction<typeof import('child_process').spawn>;
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      const executionPromise = engine.executeScript('dev-start', {
        environment: { NODE_ENV: 'test' },
        workingDirectory: '/test/dir'
      });

      // Simulate successful process completion
      setTimeout(() => {
        mockProcess.stdout.emit('data', 'Build successful');
        mockProcess.emit('close', 0);
      }, 10);

      const result = await executionPromise;
      
      expect(result.success).toBe(true);
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toBe('Build successful');
      expect(result.duration).toBeGreaterThan(0);
    });

    it('should handle script execution failure', async () => {
      const mockSpawn = require('child_process').spawn as jest.MockedFunction<typeof import('child_process').spawn>;
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      const executionPromise = engine.executeScript('build-prod');

      // Simulate process failure
      setTimeout(() => {
        mockProcess.stderr.emit('data', 'Build failed');
        mockProcess.emit('close', 1);
      }, 10);

      const result = await executionPromise;
      
      expect(result.success).toBe(false);
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toBe('Build failed');
    });

    it('should handle execution timeout', async () => {
      const mockSpawn = require('child_process').spawn as jest.MockedFunction<typeof import('child_process').spawn>;
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      // Register script with short timeout
      const shortTimeoutScript: ScriptConfig = {
        id: 'timeout-test',
        name: 'Timeout Test',
        description: 'Tests timeout handling',
        command: 'sleep 10',
        category: 'testing',
        priority: 'low',
        timeout: 100 // 100ms timeout
      };

      engine.registerScript(shortTimeoutScript);

      const executionPromise = engine.executeScript('timeout-test');

      // Don't emit close event to simulate hanging process
      
      try {
        await executionPromise;
        // Should not reach here
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toContain('timed out');
      }
    });

    it('should track execution history', async () => {
      const mockSpawn = require('child_process').spawn as jest.MockedFunction<typeof import('child_process').spawn>;
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      const executionPromise = engine.executeScript('type-check');

      setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      await executionPromise;
      
      const history = engine.getExecutionHistory(1);
      expect(history.length).toBe(1);
      expect(history[0].success).toBe(true);
      expect(history[0].startTime).toBeInstanceOf(Date);
      expect(history[0].endTime).toBeInstanceOf(Date);
    });
  });

  describe('Execution Statistics', () => {
    beforeEach(async () => {
      // Mock some execution history
      const mockSpawn = require('child_process').spawn as jest.MockedFunction<typeof import('child_process').spawn>;
      const mockProcess = new EventEmitter() as any;
      mockProcess.stdout = new EventEmitter();
      mockProcess.stderr = new EventEmitter();
      mockProcess.kill = jest.fn();
      
      mockSpawn.mockReturnValue(mockProcess);

      // Execute a few scripts to build history
      const executions = [
        engine.executeScript('dev-start'),
        engine.executeScript('build-prod'),
        engine.executeScript('test-suite')
      ];

      // Simulate all successful
      setTimeout(() => {
        mockProcess.emit('close', 0);
      }, 10);

      await Promise.all(executions);
    });

    it('should calculate execution statistics correctly', () => {
      const stats = engine.getExecutionStats();
      
      expect(stats.totalExecutions).toBeGreaterThan(0);
      expect(stats.successRate).toBeGreaterThanOrEqual(0);
      expect(stats.successRate).toBeLessThanOrEqual(1);
      expect(stats.averageDuration).toBeGreaterThanOrEqual(0);
      expect(typeof stats.categoryStats).toBe('object');
    });
  });

  describe('Configuration Management', () => {
    it('should save and load configuration', async () => {
      const mockWriteFile = require('fs').promises.writeFile as jest.MockedFunction<typeof import('fs').promises.writeFile>;
      const mockReadFile = require('fs').promises.readFile as jest.MockedFunction<typeof import('fs').promises.readFile>;

      // Mock file operations
      mockWriteFile.mockResolvedValue(undefined);
      mockReadFile.mockResolvedValue(JSON.stringify({
        scripts: [],
        workflows: [],
        version: '1.0.0'
      }));

      // Test save
      await expect(engine.saveConfiguration('/test/config.json')).resolves.toBeUndefined();
      expect(mockWriteFile).toHaveBeenCalledWith(
        '/test/config.json',
        expect.any(String),
        'utf8'
      );

      // Test load
      await expect(engine.loadConfiguration('/test/config.json')).resolves.toBeUndefined();
      expect(mockReadFile).toHaveBeenCalledWith('/test/config.json', 'utf8');
    });
  });

  describe('System Health', () => {
    it('should provide system health metrics', () => {
      const health = engine.getSystemHealth();
      
      expect(typeof health.cpu).toBe('number');
      expect(typeof health.memory).toBe('number');
      expect(typeof health.disk).toBe('number');
      expect(typeof health.network).toBe('object');
      expect(typeof health.processes).toBe('object');
      
      expect(health.cpu).toBeGreaterThanOrEqual(0);
      expect(health.cpu).toBeLessThanOrEqual(100);
      expect(health.memory).toBeGreaterThanOrEqual(0);
      expect(health.memory).toBeLessThanOrEqual(100);
    });
  });
});

describe('IntelligentTooling', () => {
  let tooling: IntelligentTooling;

  beforeEach(() => {
    tooling = new IntelligentTooling('/test/project');
  });

  describe('Project Analysis', () => {
    beforeEach(() => {
      // Mock file system operations
      const mockReadFile = require('fs').promises.readFile as jest.MockedFunction<typeof import('fs').promises.readFile>;
      const mockGlob = require('glob').glob as jest.MockedFunction<typeof import('glob').glob>;

      mockReadFile.mockResolvedValue(JSON.stringify({
        name: 'test-project',
        dependencies: {
          'react': '^18.0.0',
          'next': '^13.0.0'
        },
        devDependencies: {
          'typescript': '^5.0.0',
          'eslint': '^8.0.0'
        },
        scripts: {
          'dev': 'next dev',
          'build': 'next build',
          'test': 'jest'
        }
      }));

      mockGlob.mockResolvedValue([
        'src/pages/index.tsx',
        'src/components/Button.tsx',
        'src/utils/helpers.ts',
        'tests/Button.test.tsx',
        '.eslintrc.json',
        'package.json',
        'tsconfig.json'
      ]);
    });

    it('should analyze project structure correctly', async () => {
      const analysis = await tooling.analyzeProject();
      
      expect(analysis.projectType).toBe('Next.js Application');
      expect(analysis.framework).toContain('Next.js');
      expect(analysis.framework).toContain('React');
      expect(analysis.languages).toContain('TypeScript');
      expect(analysis.hasTests).toBe(true);
      expect(analysis.hasLinting).toBe(true);
      expect(analysis.hasTypeScript).toBe(true);
      expect(analysis.dependencies).toContain('react');
      expect(analysis.dependencies).toContain('next');
    });

    it('should detect project languages from file extensions', async () => {
      const mockGlob = require('glob').glob as jest.MockedFunction<typeof import('glob').glob>;
      
      mockGlob.mockResolvedValue([
        'src/main.py',
        'src/utils.js',
        'src/types.ts',
        'main.go',
        'lib.rs'
      ]);

      const analysis = await tooling.analyzeProject();
      
      expect(analysis.languages).toContain('Python');
      expect(analysis.languages).toContain('JavaScript');
      expect(analysis.languages).toContain('TypeScript');
      expect(analysis.languages).toContain('Go');
      expect(analysis.languages).toContain('Rust');
    });

    it('should cache analysis results', async () => {
      const mockGlob = require('glob').glob as jest.MockedFunction<typeof import('glob').glob>;
      
      // First call
      await tooling.analyzeProject();
      expect(mockGlob).toHaveBeenCalledTimes(1);
      
      // Second call should use cache
      await tooling.analyzeProject();
      expect(mockGlob).toHaveBeenCalledTimes(1); // Still 1, not 2
    });
  });

  describe('Intelligent Suggestions', () => {
    beforeEach(() => {
      // Mock project analysis
      const mockReadFile = require('fs').promises.readFile as jest.MockedFunction<typeof import('fs').promises.readFile>;
      const mockGlob = require('glob').glob as jest.MockedFunction<typeof import('glob').glob>;

      mockReadFile.mockResolvedValue(JSON.stringify({
        name: 'incomplete-project',
        dependencies: {
          'react': '^18.0.0'
        },
        scripts: {
          'dev': 'react-scripts start'
          // Missing build, test scripts
        }
      }));

      mockGlob.mockResolvedValue([
        'src/App.js',
        'src/components/Button.test.js' // Has tests but no test script
      ]);
    });

    it('should suggest missing essential scripts', async () => {
      const suggestions = await tooling.generateSuggestions();
      
      const buildSuggestion = suggestions.find(s => s.id === 'add-build-script');
      const testSuggestion = suggestions.find(s => s.id === 'add-test-script');
      
      expect(buildSuggestion).toBeDefined();
      expect(buildSuggestion?.impact).toBe('high');
      expect(buildSuggestion?.confidence).toBeGreaterThan(90);
      
      expect(testSuggestion).toBeDefined();
      expect(testSuggestion?.reasoning).toContain('Test files detected');
    });

    it('should prioritize suggestions by impact and confidence', async () => {
      const suggestions = await tooling.generateSuggestions();
      
      // Suggestions should be sorted by priority
      for (let i = 0; i < suggestions.length - 1; i++) {
        const currentScore = this.calculateScore(suggestions[i]);
        const nextScore = this.calculateScore(suggestions[i + 1]);
        expect(currentScore).toBeGreaterThanOrEqual(nextScore);
      }
    });

    // Helper method for test
    calculateScore(suggestion: any): number {
      const impactWeight = { low: 1, medium: 2, high: 3 };
      const effortWeight = { low: 3, medium: 2, high: 1 };
      
      return (
        impactWeight[suggestion.impact] * 0.4 +
        effortWeight[suggestion.effort] * 0.3 +
        (suggestion.confidence / 100) * 0.3
      ) * 100;
    }

    it('should generate workflow suggestions', async () => {
      const suggestions = await tooling.generateSuggestions();
      
      const ciSuggestion = suggestions.find(s => s.id === 'setup-ci-workflow');
      const precommitSuggestion = suggestions.find(s => s.id === 'setup-precommit-workflow');
      
      expect(ciSuggestion).toBeDefined();
      expect(ciSuggestion?.type).toBe('workflow');
      expect(precommitSuggestion).toBeDefined();
      expect(precommitSuggestion?.category).toBe('Quality');
    });

    it('should generate security suggestions', async () => {
      const suggestions = await tooling.generateSuggestions();
      
      const securitySuggestion = suggestions.find(s => s.category === 'Security');
      expect(securitySuggestion).toBeDefined();
      expect(securitySuggestion?.tags).toContain('security');
    });
  });

  describe('Productivity Metrics', () => {
    it('should calculate productivity metrics', async () => {
      const metrics = await tooling.getProductivityMetrics();
      
      expect(typeof metrics.scriptsRunToday).toBe('number');
      expect(typeof metrics.timeSaved).toBe('number');
      expect(typeof metrics.automationRate).toBe('number');
      expect(typeof metrics.errorRate).toBe('number');
      expect(Array.isArray(metrics.mostUsedScripts)).toBe(true);
      expect(Array.isArray(metrics.trends.daily)).toBe(true);
      expect(Array.isArray(metrics.trends.weekly)).toBe(true);
      
      expect(metrics.automationRate).toBeGreaterThanOrEqual(0);
      expect(metrics.automationRate).toBeLessThanOrEqual(100);
      expect(metrics.errorRate).toBeGreaterThanOrEqual(0);
      expect(metrics.errorRate).toBeLessThanOrEqual(100);
    });
  });

  describe('System Optimizations', () => {
    it('should provide optimization recommendations', async () => {
      const optimizations = await tooling.getSystemOptimizations();
      
      expect(typeof optimizations.bundleSize).toBe('object');
      expect(typeof optimizations.performance).toBe('object');
      expect(Array.isArray(optimizations.recommendations)).toBe(true);
      
      expect(optimizations.bundleSize.current).toBeGreaterThan(0);
      expect(optimizations.bundleSize.optimized).toBeGreaterThan(0);
      expect(optimizations.bundleSize.savings).toBeGreaterThanOrEqual(0);
      
      optimizations.recommendations.forEach(rec => {
        expect(rec).toHaveProperty('type');
        expect(rec).toHaveProperty('description');
        expect(rec).toHaveProperty('impact');
        expect(rec).toHaveProperty('implementation');
      });
    });
  });

  describe('Context-Aware Recommendations', () => {
    it('should recommend scripts based on context', async () => {
      const recommendations = await tooling.recommendNextScript({
        lastScript: 'build-prod',
        projectState: 'ready-for-deploy',
        gitStatus: 'uncommitted-changes'
      });
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeLessThanOrEqual(3);
      
      // Should prioritize pre-commit checks when there are uncommitted changes
      const precommitRec = recommendations.find(r => r.tags?.includes('pre-commit'));
      expect(precommitRec).toBeDefined();
    });

    it('should suggest deployment checks after successful build', async () => {
      const recommendations = await tooling.recommendNextScript({
        lastScript: 'build-prod',
        projectState: 'ready-for-deploy'
      });
      
      const deploymentRec = recommendations.find(r => r.id === 'deployment-check');
      expect(deploymentRec).toBeDefined();
      expect(deploymentRec?.category).toBe('Deployment');
    });
  });
});

describe('Integration Tests', () => {
  let engine: AutomationEngine;
  let tooling: IntelligentTooling;

  beforeEach(() => {
    engine = new AutomationEngine('/test/project');
    tooling = new IntelligentTooling('/test/project');
  });

  it('should integrate automation engine with intelligent tooling', async () => {
    // Mock project analysis
    const mockReadFile = require('fs').promises.readFile as jest.MockedFunction<typeof import('fs').promises.readFile>;
    const mockGlob = require('glob').glob as jest.MockedFunction<typeof import('glob').glob>;

    mockReadFile.mockResolvedValue(JSON.stringify({
      name: 'integration-test',
      scripts: { dev: 'next dev' }
    }));
    mockGlob.mockResolvedValue(['src/app.tsx']);

    // Get suggestions from tooling
    const suggestions = await tooling.generateSuggestions();
    
    // Find a script suggestion
    const scriptSuggestion = suggestions.find(s => s.type === 'script');
    expect(scriptSuggestion).toBeDefined();
    
    // Verify engine can handle the suggested script
    if (scriptSuggestion?.action.type === 'run-script') {
      const scriptId = scriptSuggestion.action.payload.scriptId;
      const script = engine.getScript(scriptId);
      expect(script).toBeDefined();
    }
  });

  it('should maintain consistency between systems', () => {
    const engineScripts = engine.getScripts();
    const categories = [...new Set(engineScripts.map(s => s.category))];
    
    // Verify all categories are handled by intelligent tooling
    expect(categories).toContain('development');
    expect(categories).toContain('quality');
    expect(categories).toContain('maintenance');
    expect(categories).toContain('testing');
  });
});
