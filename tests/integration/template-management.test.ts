import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { TemplateAnalyzer } from '../../lib/templates/template-analyzer';
import { EnhancedTemplateManager } from '../../lib/templates/enhanced-template-manager';
import { VersioningSystem } from '../../lib/templates/versioning-system';
import { TemplateRegistry } from '../../lib/templates/template-registry';
import { DiscoveryEngine } from '../../lib/templates/discovery-engine';
import { ValidationSystem } from '../../lib/templates/validation-system';
import { QualityAssurance } from '../../lib/templates/quality-assurance';
import fs from 'fs/promises';
import path from 'path';

describe('Template Management Integration Tests', () => {
  let templateAnalyzer: TemplateAnalyzer;
  let enhancedTemplateManager: EnhancedTemplateManager;
  let versioningSystem: VersioningSystem;
  let templateRegistry: TemplateRegistry;
  let discoveryEngine: DiscoveryEngine;
  let validationSystem: ValidationSystem;
  let qualityAssurance: QualityAssurance;

  const testTemplatesDir = path.join(__dirname, '../fixtures/templates');
  const testTemplate = {
    id: 'test-template-001',
    name: 'Test Business Template',
    description: 'A test template for integration testing',
    category: 'business',
    version: '1.0.0',
    author: 'Test Suite',
    customizationPoints: [
      {
        id: 'brand-colors',
        type: 'color-scheme',
        required: true,
        default: { primary: '#007bff', secondary: '#6c757d' }
      },
      {
        id: 'business-info',
        type: 'text-content',
        required: true,
        fields: ['companyName', 'description', 'contactInfo']
      }
    ],
    files: ['index.tsx', 'styles.css', 'config.json'],
    dependencies: ['react', 'next'],
    metadata: {
      tags: ['business', 'corporate', 'professional'],
      targetAudience: 'SMB',
      complexity: 'medium',
      estimatedCustomizationTime: 30
    }
  };

  beforeEach(async () => {
    templateAnalyzer = new TemplateAnalyzer();
    enhancedTemplateManager = new EnhancedTemplateManager();
    versioningSystem = new VersioningSystem();
    templateRegistry = new TemplateRegistry();
    discoveryEngine = new DiscoveryEngine();
    validationSystem = new ValidationSystem();
    qualityAssurance = new QualityAssurance();

    // Create test templates directory
    await fs.mkdir(testTemplatesDir, { recursive: true });

    // Create test template files
    await fs.writeFile(
      path.join(testTemplatesDir, 'test-template.json'),
      JSON.stringify(testTemplate, null, 2)
    );
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testTemplatesDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('Template Analysis and Enhancement', () => {
    test('should analyze existing template system and enhance with new features', async () => {
      // Test template analysis
      const analysisResult = await templateAnalyzer.analyzeTemplate(testTemplate);

      expect(analysisResult).toMatchObject({
        templateId: testTemplate.id,
        complexity: 'medium',
        customizationComplexity: expect.any(Number),
        requiredFields: expect.arrayContaining(['companyName', 'description', 'contactInfo']),
        optionalFields: expect.any(Array),
        estimatedProcessingTime: expect.any(Number)
      });

      // Test enhanced template management
      const managedTemplate = await enhancedTemplateManager.createManagedTemplate(testTemplate);

      expect(managedTemplate).toMatchObject({
        ...testTemplate,
        managementMetadata: {
          createdAt: expect.any(Date),
          lastModified: expect.any(Date),
          status: 'active',
          validationStatus: 'pending'
        }
      });

      // Test template versioning
      const versionedTemplate = await versioningSystem.createVersion(managedTemplate);

      expect(versionedTemplate).toMatchObject({
        ...managedTemplate,
        versionInfo: {
          major: 1,
          minor: 0,
          patch: 0,
          prerelease: null,
          versionString: '1.0.0'
        }
      });
    });

    test('should handle template customization points and metadata', async () => {
      const customizationAnalysis = await templateAnalyzer.analyzeCustomizationPoints(testTemplate);

      expect(customizationAnalysis).toMatchObject({
        totalCustomizationPoints: 2,
        requiredCustomizations: 2,
        optionalCustomizations: 0,
        customizationComplexity: expect.any(Number),
        estimatedCustomizationTime: expect.any(Number)
      });

      // Test AI-ready configuration structure
      const aiReadyConfig = await enhancedTemplateManager.generateAIConfiguration(testTemplate);

      expect(aiReadyConfig).toMatchObject({
        templateId: testTemplate.id,
        aiCustomizationTargets: expect.any(Array),
        automationLevel: expect.any(Number),
        customizationInstructions: expect.any(Object)
      });
    });
  });

  describe('Template Registry and Discovery', () => {
    test('should register templates and enable discovery', async () => {
      // Register template
      const registrationResult = await templateRegistry.registerTemplate(testTemplate);

      expect(registrationResult).toMatchObject({
        success: true,
        templateId: testTemplate.id,
        registrationId: expect.any(String),
        registeredAt: expect.any(Date)
      });

      // Test template discovery
      const discoveryResults = await discoveryEngine.discoverTemplates({
        category: 'business',
        tags: ['corporate'],
        targetAudience: 'SMB'
      });

      expect(discoveryResults).toContainEqual(
        expect.objectContaining({
          id: testTemplate.id,
          name: testTemplate.name,
          relevanceScore: expect.any(Number)
        })
      );

      // Test template categorization
      const categories = await discoveryEngine.categorizeTemplate(testTemplate);

      expect(categories).toMatchObject({
        primary: 'business',
        secondary: expect.arrayContaining(['corporate', 'professional']),
        tags: expect.arrayContaining(['business', 'corporate', 'professional'])
      });
    });

    test('should enable template search and filtering', async () => {
      await templateRegistry.registerTemplate(testTemplate);

      // Test search functionality
      const searchResults = await discoveryEngine.searchTemplates('business corporate');

      expect(searchResults).toContainEqual(
        expect.objectContaining({
          id: testTemplate.id,
          searchScore: expect.any(Number),
          matchedFields: expect.any(Array)
        })
      );

      // Test filtering functionality
      const filteredResults = await discoveryEngine.filterTemplates({
        complexity: 'medium',
        estimatedTime: { max: 60 },
        dependencies: ['react']
      });

      expect(filteredResults).toContainEqual(
        expect.objectContaining({
          id: testTemplate.id,
          filterMatches: expect.any(Array)
        })
      );
    });
  });

  describe('Template Validation and Quality Assurance', () => {
    test('should validate template structure and quality', async () => {
      // Test template validation
      const validationResult = await validationSystem.validateTemplate(testTemplate);

      expect(validationResult).toMatchObject({
        isValid: true,
        validationScore: expect.any(Number),
        validationChecks: expect.objectContaining({
          structureValidation: true,
          metadataValidation: true,
          dependencyValidation: true,
          customizationValidation: true
        }),
        issues: expect.any(Array),
        recommendations: expect.any(Array)
      });

      // Test quality assurance
      const qualityResult = await qualityAssurance.assessTemplate(testTemplate);

      expect(qualityResult).toMatchObject({
        qualityScore: expect.any(Number),
        qualityMetrics: expect.objectContaining({
          codeQuality: expect.any(Number),
          documentationQuality: expect.any(Number),
          customizationQuality: expect.any(Number),
          performanceScore: expect.any(Number)
        }),
        recommendations: expect.any(Array),
        certification: expect.any(String)
      });
    });

    test('should handle compatibility checking and automated testing', async () => {
      // Test compatibility checking
      const compatibilityResult = await validationSystem.checkCompatibility(testTemplate, {
        targetFramework: 'next',
        nodeVersion: '18.0.0',
        dependencies: ['react@18.0.0']
      });

      expect(compatibilityResult).toMatchObject({
        isCompatible: expect.any(Boolean),
        compatibilityScore: expect.any(Number),
        compatibilityIssues: expect.any(Array),
        recommendations: expect.any(Array)
      });

      // Test automated testing
      const testResult = await qualityAssurance.runAutomatedTests(testTemplate);

      expect(testResult).toMatchObject({
        testsPassed: expect.any(Number),
        testsFailed: expect.any(Number),
        testCoverage: expect.any(Number),
        testResults: expect.any(Array),
        overallStatus: expect.any(String)
      });
    });
  });

  describe('Template Versioning and Updates', () => {
    test('should handle template versioning and update management', async () => {
      // Create initial version
      const initialVersion = await versioningSystem.createVersion(testTemplate);

      expect(initialVersion.versionInfo.versionString).toBe('1.0.0');

      // Create patch update
      const updatedTemplate = { ...testTemplate, description: 'Updated description' };
      const patchVersion = await versioningSystem.createPatchVersion(initialVersion, updatedTemplate);

      expect(patchVersion.versionInfo.versionString).toBe('1.0.1');

      // Create minor update
      const enhancedTemplate = {
        ...testTemplate,
        customizationPoints: [...testTemplate.customizationPoints, {
          id: 'layout-style',
          type: 'layout',
          required: false,
          default: 'modern'
        }]
      };
      const minorVersion = await versioningSystem.createMinorVersion(initialVersion, enhancedTemplate);

      expect(minorVersion.versionInfo.versionString).toBe('1.1.0');

      // Test version history
      const versionHistory = await versioningSystem.getVersionHistory(testTemplate.id);

      expect(versionHistory).toHaveLength(3);
      expect(versionHistory.map(v => v.versionInfo.versionString)).toEqual(['1.0.0', '1.0.1', '1.1.0']);
    });

    test('should handle version rollback and migration', async () => {
      const v1 = await versioningSystem.createVersion(testTemplate);
      const v2 = await versioningSystem.createMinorVersion(v1, { ...testTemplate, version: '1.1.0' });

      // Test rollback
      const rollbackResult = await versioningSystem.rollbackToVersion(testTemplate.id, '1.0.0');

      expect(rollbackResult).toMatchObject({
        success: true,
        previousVersion: '1.1.0',
        currentVersion: '1.0.0',
        rollbackDate: expect.any(Date)
      });

      // Test migration
      const migrationResult = await versioningSystem.migrateTemplate(testTemplate.id, '1.1.0');

      expect(migrationResult).toMatchObject({
        success: true,
        fromVersion: '1.0.0',
        toVersion: '1.1.0',
        migrationSteps: expect.any(Array),
        migrationDate: expect.any(Date)
      });
    });
  });

  describe('End-to-End Template Management Workflow', () => {
    test('should complete full template management lifecycle', async () => {
      // 1. Analyze template
      const analysis = await templateAnalyzer.analyzeTemplate(testTemplate);
      expect(analysis.templateId).toBe(testTemplate.id);

      // 2. Create managed template
      const managed = await enhancedTemplateManager.createManagedTemplate(testTemplate);
      expect(managed.managementMetadata.status).toBe('active');

      // 3. Register template
      const registration = await templateRegistry.registerTemplate(managed);
      expect(registration.success).toBe(true);

      // 4. Validate template
      const validation = await validationSystem.validateTemplate(managed);
      expect(validation.isValid).toBe(true);

      // 5. Run quality assurance
      const quality = await qualityAssurance.assessTemplate(managed);
      expect(quality.qualityScore).toBeGreaterThan(0);

      // 6. Create version
      const versioned = await versioningSystem.createVersion(managed);
      expect(versioned.versionInfo.versionString).toBe('1.0.0');

      // 7. Make template discoverable
      const discovery = await discoveryEngine.discoverTemplates({ category: 'business' });
      expect(discovery).toContainEqual(expect.objectContaining({ id: testTemplate.id }));

      // 8. Update template metadata
      const updated = await enhancedTemplateManager.updateTemplate(versioned.id, {
        metadata: { ...versioned.metadata, featured: true }
      });
      expect(updated.metadata.featured).toBe(true);
    });

    test('should handle error scenarios and recovery', async () => {
      // Test invalid template handling
      const invalidTemplate = { ...testTemplate, customizationPoints: null };

      const validation = await validationSystem.validateTemplate(invalidTemplate);
      expect(validation.isValid).toBe(false);
      expect(validation.issues).toContainEqual(
        expect.objectContaining({
          severity: 'error',
          field: 'customizationPoints'
        })
      );

      // Test template recovery
      const recoveryResult = await enhancedTemplateManager.recoverTemplate(invalidTemplate);
      expect(recoveryResult).toMatchObject({
        success: true,
        recoveredTemplate: expect.objectContaining({
          customizationPoints: expect.any(Array)
        }),
        recoveryActions: expect.any(Array)
      });
    });
  });
});