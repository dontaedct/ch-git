/**
 * @fileoverview HT-032.4.2: Template Integration Testing Suite
 * @module tests/admin/template-integration
 * @author OSS Hero System
 * @version 1.0.0
 * @description Comprehensive testing suite for template integration features,
 * covering template registration, dynamic settings, marketplace integration, and lifecycle management.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TemplateRegistration } from '@/components/admin/template-registration';
import { TemplateDiscovery } from '@/components/admin/template-discovery';
import { VersionManager } from '@/components/admin/version-manager';
import { DependencyTracker } from '@/components/admin/dependency-tracker';
import { EnterpriseManager } from '@/components/admin/enterprise-manager';
import { templateRegistry } from '@/lib/admin/template-registry';
import { templateLoader } from '@/lib/admin/template-loader';
import { versioningSystem } from '@/lib/templates/versioning-system';
import { dependencyManager } from '@/lib/templates/dependency-manager';
import { discoveryPlatform } from '@/lib/marketplace/discovery-platform';
import { searchEngine } from '@/lib/marketplace/search-engine';

// Mock template system dependencies
vi.mock('@/lib/admin/template-registry', () => ({
  templateRegistry: {
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    clear: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    getByCategory: vi.fn(() => []),
    search: vi.fn(() => []),
  },
}));

vi.mock('@/lib/admin/template-loader', () => ({
  templateLoader: {
    load: vi.fn(),
    unload: vi.fn(),
    reload: vi.fn(),
    getStatus: vi.fn(() => 'loaded'),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/templates/versioning-system', () => ({
  versioningSystem: {
    getVersion: vi.fn(() => '1.0.0'),
    updateVersion: vi.fn(),
    rollback: vi.fn(),
    getHistory: vi.fn(() => []),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/templates/dependency-manager', () => ({
  dependencyManager: {
    resolveDependencies: vi.fn(() => []),
    checkCompatibility: vi.fn(() => ({ compatible: true, issues: [] })),
    installDependency: vi.fn(),
    uninstallDependency: vi.fn(),
    getDependencyTree: vi.fn(() => ({})),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/marketplace/discovery-platform', () => ({
  discoveryPlatform: {
    discover: vi.fn(() => []),
    search: vi.fn(() => []),
    getRecommendations: vi.fn(() => []),
    getPopular: vi.fn(() => []),
    getCategories: vi.fn(() => []),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/marketplace/search-engine', () => ({
  searchEngine: {
    search: vi.fn(() => ({ results: [], total: 0 })),
    suggest: vi.fn(() => []),
    index: vi.fn(),
    reindex: vi.fn(),
    getFilters: vi.fn(() => []),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('HT-032.4.2: Template Integration Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Template Registration System', () => {
    const mockTemplate = {
      id: 'test-template-1',
      name: 'Test Template',
      version: '1.0.0',
      description: 'A test template',
      category: 'business',
      tags: ['test', 'demo'],
      author: 'Test Author',
      settings: [
        { id: 'title', type: 'text', label: 'Title', value: 'Default Title' },
        { id: 'color', type: 'color', label: 'Primary Color', value: '#007bff' },
      ],
      dependencies: [],
      files: {
        'page.tsx': 'export default function Page() { return <div>Test</div>; }',
        'styles.css': '.test { color: red; }',
      },
    };

    beforeEach(() => {
      (templateRegistry.getAll as any).mockReturnValue([mockTemplate]);
      (templateRegistry.get as any).mockReturnValue(mockTemplate);
    });

    it('should display registered templates', () => {
      render(<TemplateRegistration />);

      expect(screen.getByText('Test Template')).toBeInTheDocument();
      expect(screen.getByText('A test template')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('business')).toBeInTheDocument();
    });

    it('should allow registering new templates', async () => {
      const user = userEvent.setup();
      const mockRegister = vi.fn().mockResolvedValue(true);
      (templateRegistry.register as any).mockImplementation(mockRegister);

      render(<TemplateRegistration />);

      const addButton = screen.getByRole('button', { name: /add template/i });
      await user.click(addButton);

      // Fill in template details
      const nameInput = screen.getByLabelText('Template Name');
      await user.type(nameInput, 'New Template');

      const versionInput = screen.getByLabelText('Version');
      await user.type(versionInput, '1.0.0');

      const descriptionInput = screen.getByLabelText('Description');
      await user.type(descriptionInput, 'New template description');

      const categorySelect = screen.getByLabelText('Category');
      await user.selectOptions(categorySelect, 'business');

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Template',
          version: '1.0.0',
          description: 'New template description',
          category: 'business',
        })
      );
    });

    it('should validate template before registration', async () => {
      const user = userEvent.setup();
      const mockValidate = vi.fn(() => ({
        isValid: false,
        errors: ['Template name is required', 'Invalid version format'],
      }));
      (templateRegistry.validate as any).mockImplementation(mockValidate);

      render(<TemplateRegistration />);

      const addButton = screen.getByRole('button', { name: /add template/i });
      await user.click(addButton);

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      expect(mockValidate).toHaveBeenCalled();
      expect(screen.getByText('Template name is required')).toBeInTheDocument();
      expect(screen.getByText('Invalid version format')).toBeInTheDocument();
    });

    it('should allow unregistering templates', async () => {
      const user = userEvent.setup();
      const mockUnregister = vi.fn().mockResolvedValue(true);
      (templateRegistry.unregister as any).mockImplementation(mockUnregister);

      render(<TemplateRegistration />);

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      // Confirm removal
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockUnregister).toHaveBeenCalledWith('test-template-1');
    });

    it('should handle template file uploads', async () => {
      const user = userEvent.setup();
      const mockFile = new File(['template content'], 'template.zip', { type: 'application/zip' });

      render(<TemplateRegistration />);

      const addButton = screen.getByRole('button', { name: /add template/i });
      await user.click(addButton);

      const fileInput = screen.getByLabelText('Template Files');
      await user.upload(fileInput, mockFile);

      expect(fileInput.files).toHaveLength(1);
      expect(fileInput.files[0]).toBe(mockFile);
    });

    it('should display template settings configuration', () => {
      render(<TemplateRegistration />);

      const templateCard = screen.getByText('Test Template').closest('[data-testid="template-card"]');
      const settingsButton = within(templateCard).getByRole('button', { name: /settings/i });

      fireEvent.click(settingsButton);

      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Primary Color')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Default Title')).toBeInTheDocument();
    });
  });

  describe('Template Discovery and Marketplace', () => {
    const mockMarketplaceTemplates = [
      {
        id: 'marketplace-template-1',
        name: 'E-commerce Template',
        version: '2.1.0',
        description: 'Complete e-commerce solution',
        category: 'e-commerce',
        tags: ['shop', 'cart', 'payment'],
        author: 'Template Store',
        rating: 4.8,
        downloads: 1250,
        price: 49.99,
        featured: true,
      },
      {
        id: 'marketplace-template-2',
        name: 'Blog Template',
        version: '1.5.2',
        description: 'Modern blog template',
        category: 'content',
        tags: ['blog', 'cms', 'seo'],
        author: 'Content Creator',
        rating: 4.5,
        downloads: 890,
        price: 0,
        featured: false,
      },
    ];

    beforeEach(() => {
      (discoveryPlatform.discover as any).mockReturnValue(mockMarketplaceTemplates);
      (discoveryPlatform.search as any).mockReturnValue(mockMarketplaceTemplates);
      (discoveryPlatform.getPopular as any).mockReturnValue([mockMarketplaceTemplates[0]]);
      (discoveryPlatform.getCategories as any).mockReturnValue(['e-commerce', 'content', 'business']);
    });

    it('should display marketplace templates', () => {
      render(<TemplateDiscovery />);

      expect(screen.getByText('E-commerce Template')).toBeInTheDocument();
      expect(screen.getByText('Blog Template')).toBeInTheDocument();
      expect(screen.getByText('Complete e-commerce solution')).toBeInTheDocument();
      expect(screen.getByText('$49.99')).toBeInTheDocument();
      expect(screen.getByText('Free')).toBeInTheDocument();
    });

    it('should allow searching templates', async () => {
      const user = userEvent.setup();
      const mockSearch = vi.fn().mockReturnValue([mockMarketplaceTemplates[0]]);
      (searchEngine.search as any).mockImplementation(mockSearch);

      render(<TemplateDiscovery />);

      const searchInput = screen.getByPlaceholderText('Search templates...');
      await user.type(searchInput, 'e-commerce');

      expect(mockSearch).toHaveBeenCalledWith('e-commerce');
      expect(screen.getByText('E-commerce Template')).toBeInTheDocument();
      expect(screen.queryByText('Blog Template')).not.toBeInTheDocument();
    });

    it('should allow filtering by category', async () => {
      const user = userEvent.setup();

      render(<TemplateDiscovery />);

      const categoryFilter = screen.getByLabelText('Filter by category');
      await user.selectOptions(categoryFilter, 'e-commerce');

      expect(discoveryPlatform.search).toHaveBeenCalledWith(
        expect.objectContaining({
          category: 'e-commerce',
        })
      );
    });

    it('should display template ratings and reviews', () => {
      render(<TemplateDiscovery />);

      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('1,250 downloads')).toBeInTheDocument();
      expect(screen.getByText('890 downloads')).toBeInTheDocument();
    });

    it('should handle template installation', async () => {
      const user = userEvent.setup();
      const mockInstall = vi.fn().mockResolvedValue(true);
      (templateLoader.load as any).mockImplementation(mockInstall);

      render(<TemplateDiscovery />);

      const installButton = screen.getAllByRole('button', { name: /install/i })[0];
      await user.click(installButton);

      // Confirm installation
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockInstall).toHaveBeenCalledWith('marketplace-template-1');
    });

    it('should show featured templates prominently', () => {
      render(<TemplateDiscovery />);

      const featuredSection = screen.getByText('Featured Templates');
      expect(featuredSection).toBeInTheDocument();

      const featuredTemplate = screen.getByText('E-commerce Template').closest('[data-testid="template-card"]');
      expect(featuredTemplate).toHaveClass('featured');
    });
  });

  describe('Version Management System', () => {
    const mockVersionHistory = [
      { version: '1.2.0', date: '2025-09-20', changes: ['Added new features', 'Bug fixes'], author: 'Developer 1' },
      { version: '1.1.0', date: '2025-09-15', changes: ['Performance improvements'], author: 'Developer 2' },
      { version: '1.0.0', date: '2025-09-10', changes: ['Initial release'], author: 'Developer 1' },
    ];

    beforeEach(() => {
      (versioningSystem.getHistory as any).mockReturnValue(mockVersionHistory);
      (versioningSystem.getVersion as any).mockReturnValue('1.2.0');
    });

    it('should display version history', () => {
      render(<VersionManager templateId="test-template-1" />);

      expect(screen.getByText('v1.2.0')).toBeInTheDocument();
      expect(screen.getByText('v1.1.0')).toBeInTheDocument();
      expect(screen.getByText('v1.0.0')).toBeInTheDocument();
      expect(screen.getByText('Added new features')).toBeInTheDocument();
      expect(screen.getByText('Performance improvements')).toBeInTheDocument();
      expect(screen.getByText('Initial release')).toBeInTheDocument();
    });

    it('should allow rolling back to previous version', async () => {
      const user = userEvent.setup();
      const mockRollback = vi.fn().mockResolvedValue(true);
      (versioningSystem.rollback as any).mockImplementation(mockRollback);

      render(<VersionManager templateId="test-template-1" />);

      const rollbackButtons = screen.getAllByRole('button', { name: /rollback/i });
      await user.click(rollbackButtons[1]); // Rollback to v1.1.0

      // Confirm rollback
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockRollback).toHaveBeenCalledWith('test-template-1', '1.1.0');
    });

    it('should validate version updates', async () => {
      const user = userEvent.setup();
      const mockValidate = vi.fn(() => ({
        isValid: false,
        errors: ['Invalid version format'],
      }));
      (versioningSystem.validate as any).mockImplementation(mockValidate);

      render(<VersionManager templateId="test-template-1" />);

      const updateButton = screen.getByRole('button', { name: /update version/i });
      await user.click(updateButton);

      const versionInput = screen.getByLabelText('New Version');
      await user.type(versionInput, 'invalid-version');

      const confirmButton = screen.getByRole('button', { name: /update/i });
      await user.click(confirmButton);

      expect(mockValidate).toHaveBeenCalled();
      expect(screen.getByText('Invalid version format')).toBeInTheDocument();
    });

    it('should display version comparison', async () => {
      const user = userEvent.setup();

      render(<VersionManager templateId="test-template-1" />);

      const compareButton = screen.getByRole('button', { name: /compare versions/i });
      await user.click(compareButton);

      const version1Select = screen.getByLabelText('Version 1');
      const version2Select = screen.getByLabelText('Version 2');

      await user.selectOptions(version1Select, '1.2.0');
      await user.selectOptions(version2Select, '1.1.0');

      const showDiffButton = screen.getByRole('button', { name: /show differences/i });
      await user.click(showDiffButton);

      expect(screen.getByText('Version Comparison')).toBeInTheDocument();
    });
  });

  describe('Dependency Management', () => {
    const mockDependencies = [
      { id: 'react', version: '^18.0.0', type: 'peer', required: true },
      { id: 'next', version: '^13.0.0', type: 'peer', required: true },
      { id: 'tailwindcss', version: '^3.0.0', type: 'dev', required: false },
    ];

    const mockDependencyTree = {
      'test-template-1': {
        dependencies: mockDependencies,
        conflicts: [],
        missing: [],
      },
    };

    beforeEach(() => {
      (dependencyManager.resolveDependencies as any).mockReturnValue(mockDependencies);
      (dependencyManager.getDependencyTree as any).mockReturnValue(mockDependencyTree);
      (dependencyManager.checkCompatibility as any).mockReturnValue({ compatible: true, issues: [] });
    });

    it('should display template dependencies', () => {
      render(<DependencyTracker templateId="test-template-1" />);

      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('^18.0.0')).toBeInTheDocument();
      expect(screen.getByText('next')).toBeInTheDocument();
      expect(screen.getByText('^13.0.0')).toBeInTheDocument();
      expect(screen.getByText('tailwindcss')).toBeInTheDocument();
      expect(screen.getByText('^3.0.0')).toBeInTheDocument();
    });

    it('should show dependency types and requirements', () => {
      render(<DependencyTracker templateId="test-template-1" />);

      expect(screen.getAllByText('peer')).toHaveLength(2);
      expect(screen.getByText('dev')).toBeInTheDocument();
      expect(screen.getAllByText('Required')).toHaveLength(2);
      expect(screen.getByText('Optional')).toBeInTheDocument();
    });

    it('should check compatibility and show issues', async () => {
      const mockCompatibilityCheck = vi.fn(() => ({
        compatible: false,
        issues: [
          { dependency: 'react', issue: 'Version conflict', severity: 'error' },
          { dependency: 'tailwindcss', issue: 'Missing dependency', severity: 'warning' },
        ],
      }));
      (dependencyManager.checkCompatibility as any).mockImplementation(mockCompatibilityCheck);

      render(<DependencyTracker templateId="test-template-1" />);

      const checkButton = screen.getByRole('button', { name: /check compatibility/i });
      await fireEvent.click(checkButton);

      expect(mockCompatibilityCheck).toHaveBeenCalled();
      expect(screen.getByText('Version conflict')).toBeInTheDocument();
      expect(screen.getByText('Missing dependency')).toBeInTheDocument();
    });

    it('should allow installing missing dependencies', async () => {
      const user = userEvent.setup();
      const mockInstall = vi.fn().mockResolvedValue(true);
      (dependencyManager.installDependency as any).mockImplementation(mockInstall);

      // Mock missing dependency
      (dependencyManager.checkCompatibility as any).mockReturnValue({
        compatible: false,
        issues: [{ dependency: 'missing-package', issue: 'Missing dependency', severity: 'error' }],
      });

      render(<DependencyTracker templateId="test-template-1" />);

      const installButton = screen.getByRole('button', { name: /install missing/i });
      await user.click(installButton);

      expect(mockInstall).toHaveBeenCalledWith('missing-package');
    });

    it('should display dependency tree visualization', () => {
      render(<DependencyTracker templateId="test-template-1" showTree />);

      expect(screen.getByText('Dependency Tree')).toBeInTheDocument();
      expect(screen.getByRole('tree')).toBeInTheDocument();
    });
  });

  describe('Enterprise Template Management', () => {
    const mockEnterpriseTemplates = [
      {
        id: 'enterprise-template-1',
        name: 'Enterprise Dashboard',
        version: '2.0.0',
        license: 'enterprise',
        organization: 'Enterprise Corp',
        users: 150,
        deployments: 25,
        status: 'active',
      },
      {
        id: 'enterprise-template-2',
        name: 'Admin Panel',
        version: '1.8.0',
        license: 'enterprise',
        organization: 'Enterprise Corp',
        users: 75,
        deployments: 12,
        status: 'maintenance',
      },
    ];

    beforeEach(() => {
      (templateRegistry.getAll as any).mockReturnValue(mockEnterpriseTemplates);
    });

    it('should display enterprise templates with usage metrics', () => {
      render(<EnterpriseManager />);

      expect(screen.getByText('Enterprise Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      expect(screen.getByText('150 users')).toBeInTheDocument();
      expect(screen.getByText('25 deployments')).toBeInTheDocument();
      expect(screen.getByText('75 users')).toBeInTheDocument();
      expect(screen.getByText('12 deployments')).toBeInTheDocument();
    });

    it('should show template status and health', () => {
      render(<EnterpriseManager />);

      expect(screen.getByText('Active')).toBeInTheDocument();
      expect(screen.getByText('Maintenance')).toBeInTheDocument();
    });

    it('should allow bulk operations on templates', async () => {
      const user = userEvent.setup();
      const mockBulkUpdate = vi.fn().mockResolvedValue(true);

      render(<EnterpriseManager onBulkUpdate={mockBulkUpdate} />);

      // Select multiple templates
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      const bulkActionSelect = screen.getByLabelText('Bulk Actions');
      await user.selectOptions(bulkActionSelect, 'update');

      const executeButton = screen.getByRole('button', { name: /execute/i });
      await user.click(executeButton);

      expect(mockBulkUpdate).toHaveBeenCalledWith(['enterprise-template-1', 'enterprise-template-2'], 'update');
    });

    it('should provide enterprise analytics and reporting', () => {
      render(<EnterpriseManager showAnalytics />);

      expect(screen.getByText('Template Analytics')).toBeInTheDocument();
      expect(screen.getByText('Usage Metrics')).toBeInTheDocument();
      expect(screen.getByText('Performance Reports')).toBeInTheDocument();
    });
  });

  describe('Template Integration Performance', () => {
    it('should load templates within performance budget', async () => {
      const startTime = performance.now();

      render(<TemplateRegistration />);

      const endTime = performance.now();
      const loadTime = endTime - startTime;

      // Should load within 2 seconds as specified in HT-032 requirements
      expect(loadTime).toBeLessThan(2000);
    });

    it('should handle large numbers of templates efficiently', () => {
      const largeTemplateList = Array.from({ length: 1000 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        version: '1.0.0',
        category: 'test',
      }));

      (templateRegistry.getAll as any).mockReturnValue(largeTemplateList);

      const startTime = performance.now();
      render(<TemplateRegistration />);
      const endTime = performance.now();

      // Should handle large lists efficiently
      expect(endTime - startTime).toBeLessThan(1000);
    });

    it('should implement virtual scrolling for large template lists', () => {
      const largeTemplateList = Array.from({ length: 10000 }, (_, i) => ({
        id: `template-${i}`,
        name: `Template ${i}`,
        version: '1.0.0',
        category: 'test',
      }));

      (discoveryPlatform.discover as any).mockReturnValue(largeTemplateList);

      render(<TemplateDiscovery />);

      // Should only render visible items
      const templateCards = screen.getAllByTestId('template-card');
      expect(templateCards.length).toBeLessThan(100); // Virtual scrolling should limit rendered items
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle template registration failures gracefully', async () => {
      const user = userEvent.setup();
      const mockError = new Error('Registration failed');
      (templateRegistry.register as any).mockRejectedValue(mockError);

      render(<TemplateRegistration />);

      const addButton = screen.getByRole('button', { name: /add template/i });
      await user.click(addButton);

      const nameInput = screen.getByLabelText('Template Name');
      await user.type(nameInput, 'Test Template');

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      await waitFor(() => {
        expect(screen.getByText(/registration failed/i)).toBeInTheDocument();
      });
    });

    it('should handle network failures during template discovery', async () => {
      const mockError = new Error('Network error');
      (discoveryPlatform.discover as any).mockRejectedValue(mockError);

      render(<TemplateDiscovery />);

      await waitFor(() => {
        expect(screen.getByText(/failed to load templates/i)).toBeInTheDocument();
      });

      // Should provide retry option
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle dependency resolution failures', async () => {
      const mockError = new Error('Dependency resolution failed');
      (dependencyManager.resolveDependencies as any).mockRejectedValue(mockError);

      render(<DependencyTracker templateId="test-template-1" />);

      await waitFor(() => {
        expect(screen.getByText(/failed to resolve dependencies/i)).toBeInTheDocument();
      });
    });

    it('should provide rollback capability on template update failures', async () => {
      const user = userEvent.setup();
      const mockUpdateError = new Error('Update failed');
      (versioningSystem.updateVersion as any).mockRejectedValue(mockUpdateError);

      render(<VersionManager templateId="test-template-1" />);

      const updateButton = screen.getByRole('button', { name: /update version/i });
      await user.click(updateButton);

      await waitFor(() => {
        expect(screen.getByText(/update failed/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /rollback/i })).toBeInTheDocument();
      });
    });
  });
});
