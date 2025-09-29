/**
 * @fileoverview HT-032.4.2: Modular Admin Interface Testing Suite
 * @module tests/admin/modular-interface
 * @author OSS Hero System
 * @version 1.0.0
 * @description Comprehensive testing suite for modular admin interface features,
 * covering core functionality, component registry, settings management, and user interactions.
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CoreSettingsPanel } from '@/components/admin/core-settings-panel';
import { SettingsRegistryManager } from '@/components/admin/settings-registry-manager';
import { ModularSettingPanel } from '@/components/admin/modular/setting-panel';
import { ModularSettingGroup } from '@/components/admin/modular/setting-group';
import { ModularSettingInput } from '@/components/admin/modular/setting-input';
import { ValidationFeedback } from '@/components/admin/modular/validation-feedback';
import { componentRegistry } from '@/lib/admin/component-registry';
import { settingsRegistry } from '@/lib/admin/settings-registry';
import { coreSettings } from '@/lib/admin/core-settings';
import { navigationSystem } from '@/lib/admin/navigation';
import { layoutSystem } from '@/lib/admin/layout-system';

// Mock dependencies
vi.mock('@/lib/admin/component-registry', () => ({
  componentRegistry: {
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    clear: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/admin/settings-registry', () => ({
  settingsRegistry: {
    register: vi.fn(),
    unregister: vi.fn(),
    get: vi.fn(),
    getAll: vi.fn(() => []),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    clear: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
    getByCategory: vi.fn(() => []),
  },
}));

vi.mock('@/lib/admin/core-settings', () => ({
  coreSettings: {
    load: vi.fn(),
    save: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    reset: vi.fn(),
    validate: vi.fn(() => ({ isValid: true, errors: [] })),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('@/lib/admin/navigation', () => ({
  navigationSystem: {
    getRoutes: vi.fn(() => []),
    navigate: vi.fn(),
    getCurrentRoute: vi.fn(() => '/admin'),
    subscribe: vi.fn(() => vi.fn()),
    addRoute: vi.fn(),
    removeRoute: vi.fn(),
  },
}));

vi.mock('@/lib/admin/layout-system', () => ({
  layoutSystem: {
    getLayout: vi.fn(() => ({ columns: 1, sidebar: true })),
    setLayout: vi.fn(),
    getTheme: vi.fn(() => 'light'),
    setTheme: vi.fn(),
    subscribe: vi.fn(() => vi.fn()),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/admin',
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('HT-032.4.2: Modular Admin Interface Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset all mocks to default state
    (componentRegistry.getAll as any).mockReturnValue([]);
    (settingsRegistry.getAll as any).mockReturnValue([]);
    (coreSettings.get as any).mockReturnValue({});
    (navigationSystem.getRoutes as any).mockReturnValue([
      { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
      { path: '/admin/settings', label: 'Settings', icon: 'settings' },
    ]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Core Admin Interface Foundation', () => {
    it('should render admin layout with navigation and sidebar', () => {
      render(
        <AdminLayout>
          <div data-testid="admin-content">Admin Content</div>
        </AdminLayout>
      );

      expect(screen.getByTestId('admin-content')).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    it('should handle navigation between admin sections', async () => {
      const user = userEvent.setup();
      const mockNavigate = vi.fn();
      (navigationSystem.navigate as any).mockImplementation(mockNavigate);

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      const settingsLink = screen.getByText('Settings');
      await user.click(settingsLink);

      expect(mockNavigate).toHaveBeenCalledWith('/admin/settings');
    });

    it('should display responsive layout based on screen size', () => {
      // Mock window.matchMedia for responsive testing
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation(query => ({
          matches: query.includes('768px'), // Mobile breakpoint
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        })),
      });

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      // Should adapt to mobile layout
      expect(layoutSystem.getLayout).toHaveBeenCalled();
    });

    it('should handle theme switching', async () => {
      const user = userEvent.setup();
      const mockSetTheme = vi.fn();
      (layoutSystem.setTheme as any).mockImplementation(mockSetTheme);

      render(
        <AdminLayout>
          <div>Admin Content</div>
        </AdminLayout>
      );

      // Simulate theme toggle
      const themeToggle = screen.getByRole('button', { name: /theme/i });
      await user.click(themeToggle);

      expect(mockSetTheme).toHaveBeenCalled();
    });
  });

  describe('Core Settings Management', () => {
    const mockSettings = {
      general: {
        appName: 'Test App',
        description: 'Test Description',
      },
      branding: {
        primaryColor: '#007bff',
        logo: '/test-logo.png',
      },
      system: {
        maintenanceMode: false,
        debugMode: false,
      },
    };

    beforeEach(() => {
      (coreSettings.get as any).mockReturnValue(mockSettings);
    });

    it('should render core settings panel with all sections', () => {
      render(<CoreSettingsPanel />);

      expect(screen.getByText('General Settings')).toBeInTheDocument();
      expect(screen.getByText('Branding Settings')).toBeInTheDocument();
      expect(screen.getByText('System Settings')).toBeInTheDocument();
    });

    it('should allow editing general settings', async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn();
      (coreSettings.save as any).mockImplementation(mockSave);

      render(<CoreSettingsPanel />);

      const appNameInput = screen.getByLabelText('Application Name');
      await user.clear(appNameInput);
      await user.type(appNameInput, 'Updated App Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(mockSave).toHaveBeenCalledWith(
        expect.objectContaining({
          general: expect.objectContaining({
            appName: 'Updated App Name',
          }),
        })
      );
    });

    it('should validate settings before saving', async () => {
      const user = userEvent.setup();
      const mockValidate = vi.fn(() => ({
        isValid: false,
        errors: ['App name is required'],
      }));
      (coreSettings.validate as any).mockImplementation(mockValidate);

      render(<CoreSettingsPanel />);

      const appNameInput = screen.getByLabelText('Application Name');
      await user.clear(appNameInput);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      expect(mockValidate).toHaveBeenCalled();
      expect(screen.getByText('App name is required')).toBeInTheDocument();
    });

    it('should reset settings to default values', async () => {
      const user = userEvent.setup();
      const mockReset = vi.fn();
      (coreSettings.reset as any).mockImplementation(mockReset);

      render(<CoreSettingsPanel />);

      const resetButton = screen.getByRole('button', { name: /reset/i });
      await user.click(resetButton);

      // Confirm reset in dialog
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockReset).toHaveBeenCalled();
    });
  });

  describe('Component Registry System', () => {
    const mockComponents = [
      {
        id: 'test-component-1',
        name: 'Test Component 1',
        type: 'setting',
        category: 'general',
        component: () => <div>Test Component 1</div>,
      },
      {
        id: 'test-component-2',
        name: 'Test Component 2',
        type: 'widget',
        category: 'dashboard',
        component: () => <div>Test Component 2</div>,
      },
    ];

    beforeEach(() => {
      (componentRegistry.getAll as any).mockReturnValue(mockComponents);
    });

    it('should display registered components', () => {
      render(<SettingsRegistryManager />);

      expect(screen.getByText('Test Component 1')).toBeInTheDocument();
      expect(screen.getByText('Test Component 2')).toBeInTheDocument();
    });

    it('should allow registering new components', async () => {
      const user = userEvent.setup();
      const mockRegister = vi.fn();
      (componentRegistry.register as any).mockImplementation(mockRegister);

      render(<SettingsRegistryManager />);

      const addButton = screen.getByRole('button', { name: /add component/i });
      await user.click(addButton);

      // Fill in component details
      const nameInput = screen.getByLabelText('Component Name');
      await user.type(nameInput, 'New Test Component');

      const typeSelect = screen.getByLabelText('Component Type');
      await user.selectOptions(typeSelect, 'setting');

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      expect(mockRegister).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'New Test Component',
          type: 'setting',
        })
      );
    });

    it('should allow unregistering components', async () => {
      const user = userEvent.setup();
      const mockUnregister = vi.fn();
      (componentRegistry.unregister as any).mockImplementation(mockUnregister);

      render(<SettingsRegistryManager />);

      const removeButtons = screen.getAllByRole('button', { name: /remove/i });
      await user.click(removeButtons[0]);

      // Confirm removal
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      await user.click(confirmButton);

      expect(mockUnregister).toHaveBeenCalledWith('test-component-1');
    });

    it('should validate component registration', async () => {
      const user = userEvent.setup();
      const mockValidate = vi.fn(() => ({
        isValid: false,
        errors: ['Component name is required'],
      }));
      (componentRegistry.validate as any).mockImplementation(mockValidate);

      render(<SettingsRegistryManager />);

      const addButton = screen.getByRole('button', { name: /add component/i });
      await user.click(addButton);

      const registerButton = screen.getByRole('button', { name: /register/i });
      await user.click(registerButton);

      expect(mockValidate).toHaveBeenCalled();
      expect(screen.getByText('Component name is required')).toBeInTheDocument();
    });
  });

  describe('Modular Settings Components', () => {
    describe('ModularSettingPanel', () => {
      const mockPanelConfig = {
        id: 'test-panel',
        title: 'Test Panel',
        description: 'Test panel description',
        groups: [
          {
            id: 'group-1',
            title: 'Group 1',
            settings: [
              { id: 'setting-1', type: 'text', label: 'Setting 1', value: 'value1' },
              { id: 'setting-2', type: 'boolean', label: 'Setting 2', value: true },
            ],
          },
        ],
      };

      it('should render modular setting panel with groups', () => {
        render(<ModularSettingPanel config={mockPanelConfig} />);

        expect(screen.getByText('Test Panel')).toBeInTheDocument();
        expect(screen.getByText('Test panel description')).toBeInTheDocument();
        expect(screen.getByText('Group 1')).toBeInTheDocument();
      });

      it('should handle setting value changes', async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();

        render(
          <ModularSettingPanel 
            config={mockPanelConfig} 
            onChange={mockOnChange}
          />
        );

        const textInput = screen.getByLabelText('Setting 1');
        await user.clear(textInput);
        await user.type(textInput, 'updated value');

        expect(mockOnChange).toHaveBeenCalledWith('setting-1', 'updated value');
      });

      it('should validate setting values', async () => {
        const user = userEvent.setup();
        const mockValidator = vi.fn(() => ({
          isValid: false,
          errors: ['Value is required'],
        }));

        const configWithValidation = {
          ...mockPanelConfig,
          groups: [
            {
              ...mockPanelConfig.groups[0],
              settings: [
                {
                  ...mockPanelConfig.groups[0].settings[0],
                  validator: mockValidator,
                },
              ],
            },
          ],
        };

        render(<ModularSettingPanel config={configWithValidation} />);

        const textInput = screen.getByLabelText('Setting 1');
        await user.clear(textInput);
        await user.tab(); // Trigger validation

        expect(mockValidator).toHaveBeenCalled();
        expect(screen.getByText('Value is required')).toBeInTheDocument();
      });
    });

    describe('ModularSettingGroup', () => {
      const mockGroupConfig = {
        id: 'test-group',
        title: 'Test Group',
        description: 'Test group description',
        settings: [
          { id: 'setting-1', type: 'text', label: 'Text Setting', value: '' },
          { id: 'setting-2', type: 'select', label: 'Select Setting', value: 'option1', options: ['option1', 'option2'] },
        ],
      };

      it('should render setting group with all settings', () => {
        render(<ModularSettingGroup config={mockGroupConfig} />);

        expect(screen.getByText('Test Group')).toBeInTheDocument();
        expect(screen.getByText('Test group description')).toBeInTheDocument();
        expect(screen.getByLabelText('Text Setting')).toBeInTheDocument();
        expect(screen.getByLabelText('Select Setting')).toBeInTheDocument();
      });

      it('should handle collapsible group behavior', async () => {
        const user = userEvent.setup();

        render(<ModularSettingGroup config={mockGroupConfig} collapsible />);

        const collapseButton = screen.getByRole('button', { name: /collapse/i });
        await user.click(collapseButton);

        // Settings should be hidden when collapsed
        expect(screen.queryByLabelText('Text Setting')).not.toBeVisible();
      });
    });

    describe('ModularSettingInput', () => {
      it('should render different input types correctly', () => {
        const textConfig = { id: 'text', type: 'text', label: 'Text Input', value: 'test' };
        const booleanConfig = { id: 'boolean', type: 'boolean', label: 'Boolean Input', value: true };
        const selectConfig = { id: 'select', type: 'select', label: 'Select Input', value: 'option1', options: ['option1', 'option2'] };

        const { rerender } = render(<ModularSettingInput config={textConfig} />);
        expect(screen.getByLabelText('Text Input')).toHaveAttribute('type', 'text');

        rerender(<ModularSettingInput config={booleanConfig} />);
        expect(screen.getByLabelText('Boolean Input')).toHaveAttribute('type', 'checkbox');

        rerender(<ModularSettingInput config={selectConfig} />);
        expect(screen.getByLabelText('Select Input')).toHaveDisplayValue('option1');
      });

      it('should handle input value changes', async () => {
        const user = userEvent.setup();
        const mockOnChange = vi.fn();
        const config = { id: 'test', type: 'text', label: 'Test Input', value: '' };

        render(<ModularSettingInput config={config} onChange={mockOnChange} />);

        const input = screen.getByLabelText('Test Input');
        await user.type(input, 'new value');

        expect(mockOnChange).toHaveBeenCalledWith('test', 'new value');
      });

      it('should display validation errors', () => {
        const config = {
          id: 'test',
          type: 'text',
          label: 'Test Input',
          value: '',
          error: 'This field is required',
        };

        render(<ModularSettingInput config={config} />);

        expect(screen.getByText('This field is required')).toBeInTheDocument();
        expect(screen.getByLabelText('Test Input')).toHaveAttribute('aria-invalid', 'true');
      });
    });

    describe('ValidationFeedback', () => {
      it('should display error messages', () => {
        const errors = ['Error 1', 'Error 2'];
        render(<ValidationFeedback errors={errors} type="error" />);

        expect(screen.getByText('Error 1')).toBeInTheDocument();
        expect(screen.getByText('Error 2')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      it('should display success messages', () => {
        const messages = ['Success message'];
        render(<ValidationFeedback messages={messages} type="success" />);

        expect(screen.getByText('Success message')).toBeInTheDocument();
        expect(screen.getByRole('status')).toBeInTheDocument();
      });

      it('should display warning messages', () => {
        const warnings = ['Warning message'];
        render(<ValidationFeedback warnings={warnings} type="warning" />);

        expect(screen.getByText('Warning message')).toBeInTheDocument();
      });
    });
  });

  describe('Settings Registry Management', () => {
    const mockSettings = [
      {
        id: 'setting-1',
        name: 'Test Setting 1',
        category: 'general',
        type: 'text',
        value: 'value1',
      },
      {
        id: 'setting-2',
        name: 'Test Setting 2',
        category: 'branding',
        type: 'color',
        value: '#007bff',
      },
    ];

    beforeEach(() => {
      (settingsRegistry.getAll as any).mockReturnValue(mockSettings);
      (settingsRegistry.getByCategory as any).mockImplementation((category) =>
        mockSettings.filter(s => s.category === category)
      );
    });

    it('should display settings by category', () => {
      render(<SettingsRegistryManager />);

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Branding')).toBeInTheDocument();
      expect(screen.getByText('Test Setting 1')).toBeInTheDocument();
      expect(screen.getByText('Test Setting 2')).toBeInTheDocument();
    });

    it('should allow filtering settings by category', async () => {
      const user = userEvent.setup();

      render(<SettingsRegistryManager />);

      const categoryFilter = screen.getByLabelText('Filter by category');
      await user.selectOptions(categoryFilter, 'general');

      expect(screen.getByText('Test Setting 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Setting 2')).not.toBeInTheDocument();
    });

    it('should allow searching settings', async () => {
      const user = userEvent.setup();

      render(<SettingsRegistryManager />);

      const searchInput = screen.getByPlaceholderText('Search settings...');
      await user.type(searchInput, 'Setting 1');

      expect(screen.getByText('Test Setting 1')).toBeInTheDocument();
      expect(screen.queryByText('Test Setting 2')).not.toBeInTheDocument();
    });
  });

  describe('Performance and Accessibility', () => {
    it('should render admin interface within performance budget', async () => {
      const startTime = performance.now();

      render(
        <AdminLayout>
          <CoreSettingsPanel />
        </AdminLayout>
      );

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 500ms performance budget
      expect(renderTime).toBeLessThan(500);
    });

    it('should meet accessibility requirements', () => {
      render(
        <AdminLayout>
          <CoreSettingsPanel />
        </AdminLayout>
      );

      // Check for proper heading hierarchy
      const headings = screen.getAllByRole('heading');
      expect(headings.length).toBeGreaterThan(0);

      // Check for proper form labeling
      const inputs = screen.getAllByRole('textbox');
      inputs.forEach(input => {
        expect(input).toHaveAccessibleName();
      });

      // Check for proper button labeling
      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        expect(button).toHaveAccessibleName();
      });
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AdminLayout>
          <CoreSettingsPanel />
        </AdminLayout>
      );

      // Should be able to navigate through interactive elements with Tab
      await user.tab();
      expect(document.activeElement).toBeInstanceOf(HTMLElement);

      // Should support Enter key activation
      const button = screen.getByRole('button', { name: /save/i });
      button.focus();
      await user.keyboard('{Enter}');

      // Button should be activated (tested through mock calls)
      expect(coreSettings.save).toHaveBeenCalled();
    });

    it('should handle error states gracefully', async () => {
      const mockError = new Error('Test error');
      (coreSettings.save as any).mockRejectedValue(mockError);

      const user = userEvent.setup();

      render(<CoreSettingsPanel />);

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText(/error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Integration with External Systems', () => {
    it('should integrate with theme system', () => {
      (layoutSystem.getTheme as any).mockReturnValue('dark');

      render(
        <AdminLayout>
          <CoreSettingsPanel />
        </AdminLayout>
      );

      expect(layoutSystem.getTheme).toHaveBeenCalled();
      // Theme should be applied to admin interface
      expect(document.body).toHaveClass('dark');
    });

    it('should persist settings changes', async () => {
      const user = userEvent.setup();
      const mockSave = vi.fn().mockResolvedValue(true);
      (coreSettings.save as any).mockImplementation(mockSave);

      render(<CoreSettingsPanel />);

      const appNameInput = screen.getByLabelText('Application Name');
      await user.clear(appNameInput);
      await user.type(appNameInput, 'New App Name');

      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalled();
        expect(screen.getByText(/saved successfully/i)).toBeInTheDocument();
      });
    });

    it('should handle real-time updates from other users', async () => {
      const mockSubscribe = vi.fn((callback) => {
        // Simulate real-time update
        setTimeout(() => {
          callback({
            type: 'setting_updated',
            settingId: 'appName',
            value: 'Updated by another user',
          });
        }, 100);
        return vi.fn(); // unsubscribe function
      });
      (coreSettings.subscribe as any).mockImplementation(mockSubscribe);

      render(<CoreSettingsPanel />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Updated by another user')).toBeInTheDocument();
      }, { timeout: 200 });
    });
  });
});
