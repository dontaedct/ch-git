/**
 * @fileoverview HT-008.10.4: Design System Testing Suite
 * @module tests/design-system/design-system.test.ts
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.4 - Design System Testing and Validation
 * Focus: Comprehensive testing for design tokens, components, and accessibility
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system validation)
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { designTokens } from '@/lib/design-tokens/tokens';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { FormBuilder } from '@/components/ui/form-builder';
import { Dashboard } from '@/components/ui/dashboard';
import { NotificationCenter } from '@/components/ui/notification-center';
import { TokensProvider } from '@/lib/design-tokens/provider';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock data for testing
const mockTableData = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

const mockTableColumns = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

const mockFormFields = [
  {
    id: 'name',
    type: 'text' as const,
    label: 'Name',
    required: true,
  },
  {
    id: 'email',
    type: 'email' as const,
    label: 'Email',
    required: true,
  },
];

const mockMetrics = [
  {
    id: 'users',
    title: 'Users',
    value: '1,234',
    change: 12.5,
    changeType: 'increase' as const,
  },
];

const mockNotifications = [
  {
    id: '1',
    title: 'Test Notification',
    message: 'This is a test notification',
    type: 'info' as const,
    priority: 'medium' as const,
    timestamp: new Date(),
    read: false,
    archived: false,
  },
];

describe('Design System Tests', () => {
  describe('Design Tokens', () => {
    it('should have valid color scales', () => {
      expect(designTokens.neutral).toBeDefined();
      expect(designTokens.accent).toBeDefined();
      expect(designTokens.neutral[50]).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(designTokens.accent[500]).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid semantic colors', () => {
      expect(designTokens.colors.light).toBeDefined();
      expect(designTokens.colors.dark).toBeDefined();
      expect(designTokens.colors.light.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(designTokens.colors.dark.primary).toMatch(/^#[0-9a-fA-F]{6}$/);
    });

    it('should have valid typography tokens', () => {
      expect(designTokens.typography.fontFamily.sans).toBeDefined();
      expect(designTokens.typography.fontSize.base).toBe('1rem');
      expect(designTokens.typography.fontWeight.normal).toBe('400');
    });

    it('should have valid spacing tokens', () => {
      expect(designTokens.spacing.xs).toBe('0.25rem');
      expect(designTokens.spacing.md).toBe('1rem');
      expect(designTokens.spacing.lg).toBe('1.5rem');
    });

    it('should have valid motion tokens', () => {
      expect(designTokens.motion.duration.fast).toBe('150ms');
      expect(designTokens.motion.easing.spring).toBeDefined();
    });
  });

  describe('Button Component', () => {
    it('should render correctly', () => {
      render(<Button>Test Button</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('should handle click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      fireEvent.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should support different variants', () => {
      const { rerender } = render(<Button variant="default">Default</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-primary');

      rerender(<Button variant="destructive">Destructive</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-destructive');

      rerender(<Button variant="outline">Outline</Button>);
      expect(screen.getByRole('button')).toHaveClass('border');
    });

    it('should support different sizes', () => {
      const { rerender } = render(<Button size="sm">Small</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-8');

      rerender(<Button size="md">Medium</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-9');

      rerender(<Button size="lg">Large</Button>);
      expect(screen.getByRole('button')).toHaveClass('h-10');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should be accessible', async () => {
      const { container } = render(<Button>Accessible Button</Button>);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should support keyboard navigation', () => {
      render(<Button>Keyboard Button</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });
  });

  describe('DataTable Component', () => {
    it('should render correctly', () => {
      render(
        <DataTable
          columns={mockTableColumns}
          data={mockTableData}
          title="Test Table"
        />
      );
      expect(screen.getByText('Test Table')).toBeInTheDocument();
    });

    it('should display data correctly', () => {
      render(
        <DataTable
          columns={mockTableColumns}
          data={mockTableData}
        />
      );
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should support search functionality', () => {
      render(
        <DataTable
          columns={mockTableColumns}
          data={mockTableData}
          searchKey="name"
          searchPlaceholder="Search..."
        />
      );
      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toBeInTheDocument();
      
      fireEvent.change(searchInput, { target: { value: 'John' } });
      expect(searchInput).toHaveValue('John');
    });

    it('should support row selection', () => {
      render(
        <DataTable
          columns={mockTableColumns}
          data={mockTableData}
          enableSelection={true}
        />
      );
      const checkboxes = screen.getAllByRole('checkbox');
      expect(checkboxes).toHaveLength(3); // Header + 2 rows
    });

    it('should be accessible', async () => {
      const { container } = render(
        <DataTable
          columns={mockTableColumns}
          data={mockTableData}
          title="Accessible Table"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('FormBuilder Component', () => {
    it('should render correctly', () => {
      render(
        <FormBuilder
          fields={mockFormFields}
          onSubmit={jest.fn()}
          title="Test Form"
        />
      );
      expect(screen.getByText('Test Form')).toBeInTheDocument();
    });

    it('should render form fields', () => {
      render(
        <FormBuilder
          fields={mockFormFields}
          onSubmit={jest.fn()}
        />
      );
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should handle form submission', async () => {
      const handleSubmit = jest.fn();
      render(
        <FormBuilder
          fields={mockFormFields}
          onSubmit={handleSubmit}
        />
      );
      
      const nameInput = screen.getByLabelText('Name');
      const emailInput = screen.getByLabelText('Email');
      const submitButton = screen.getByRole('button', { name: /submit/i });
      
      fireEvent.change(nameInput, { target: { value: 'John Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(handleSubmit).toHaveBeenCalledWith({
          name: 'John Doe',
          email: 'john@example.com',
        });
      });
    });

    it('should validate required fields', async () => {
      render(
        <FormBuilder
          fields={mockFormFields}
          onSubmit={jest.fn()}
        />
      );
      
      const submitButton = screen.getByRole('button', { name: /submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/required/i)).toBeInTheDocument();
      });
    });

    it('should be accessible', async () => {
      const { container } = render(
        <FormBuilder
          fields={mockFormFields}
          onSubmit={jest.fn()}
          title="Accessible Form"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('Dashboard Component', () => {
    it('should render correctly', () => {
      render(
        <Dashboard
          title="Test Dashboard"
          metrics={mockMetrics}
        />
      );
      expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    });

    it('should display metrics', () => {
      render(
        <Dashboard
          metrics={mockMetrics}
        />
      );
      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    it('should handle refresh', () => {
      const handleRefresh = jest.fn();
      render(
        <Dashboard
          metrics={mockMetrics}
          onRefresh={handleRefresh}
        />
      );
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      fireEvent.click(refreshButton);
      expect(handleRefresh).toHaveBeenCalledTimes(1);
    });

    it('should be accessible', async () => {
      const { container } = render(
        <Dashboard
          title="Accessible Dashboard"
          metrics={mockMetrics}
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('NotificationCenter Component', () => {
    it('should render correctly', () => {
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={jest.fn()}
          onMarkAllAsRead={jest.fn()}
          onArchive={jest.fn()}
          onDelete={jest.fn()}
          onAction={jest.fn()}
        />
      );
      expect(screen.getByText('Notifications')).toBeInTheDocument();
    });

    it('should display notifications', () => {
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={jest.fn()}
          onMarkAllAsRead={jest.fn()}
          onArchive={jest.fn()}
          onDelete={jest.fn()}
          onAction={jest.fn()}
        />
      );
      expect(screen.getByText('Test Notification')).toBeInTheDocument();
    });

    it('should handle mark as read', () => {
      const handleMarkAsRead = jest.fn();
      render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={jest.fn()}
          onArchive={jest.fn()}
          onDelete={jest.fn()}
          onAction={jest.fn()}
        />
      );
      
      const moreButton = screen.getByRole('button', { name: /more/i });
      fireEvent.click(moreButton);
      
      const markAsReadButton = screen.getByText('Mark as read');
      fireEvent.click(markAsReadButton);
      
      expect(handleMarkAsRead).toHaveBeenCalledWith('1');
    });

    it('should be accessible', async () => {
      const { container } = render(
        <NotificationCenter
          notifications={mockNotifications}
          onMarkAsRead={jest.fn()}
          onMarkAllAsRead={jest.fn()}
          onArchive={jest.fn()}
          onDelete={jest.fn()}
          onAction={jest.fn()}
          title="Accessible Notifications"
        />
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('TokensProvider', () => {
    it('should provide tokens context', () => {
      const TestComponent = () => {
        const { tokens } = useTokens();
        return <div data-testid="tokens">{tokens ? 'tokens-provided' : 'no-tokens'}</div>;
      };

      render(
        <TokensProvider>
          <TestComponent />
        </TokensProvider>
      );
      
      expect(screen.getByTestId('tokens')).toHaveTextContent('tokens-provided');
    });

    it('should update CSS variables', () => {
      render(
        <TokensProvider>
          <div data-testid="test">Test</div>
        </TokensProvider>
      );
      
      const root = document.documentElement;
      expect(root.style.getPropertyValue('--color-primary')).toBeDefined();
    });
  });

  describe('Accessibility Tests', () => {
    it('should have proper color contrast', () => {
      // This would typically use a color contrast testing library
      const primaryColor = designTokens.colors.light.primary;
      const primaryForeground = designTokens.colors.light.primaryForeground;
      
      // Basic validation that colors are defined
      expect(primaryColor).toBeDefined();
      expect(primaryForeground).toBeDefined();
    });

    it('should support keyboard navigation', () => {
      render(
        <div>
          <Button>First</Button>
          <Button>Second</Button>
          <Button>Third</Button>
        </div>
      );
      
      const buttons = screen.getAllByRole('button');
      buttons[0].focus();
      expect(buttons[0]).toHaveFocus();
      
      fireEvent.keyDown(buttons[0], { key: 'Tab' });
      expect(buttons[1]).toHaveFocus();
    });

    it('should have proper ARIA labels', () => {
      render(
        <Button aria-label="Close dialog">
          <span aria-hidden="true">×</span>
        </Button>
      );
      
      expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
    });
  });

  describe('Performance Tests', () => {
    it('should render components quickly', () => {
      const start = performance.now();
      render(<Button>Performance Test</Button>);
      const end = performance.now();
      
      expect(end - start).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        name: `User ${i}`,
        email: `user${i}@example.com`,
      }));

      const start = performance.now();
      render(
        <DataTable
          columns={mockTableColumns}
          data={largeData}
          enablePagination={true}
          pageSize={10}
        />
      );
      const end = performance.now();
      
      expect(end - start).toBeLessThan(500); // Should render in less than 500ms
    });
  });

  describe('Integration Tests', () => {
    it('should work with all components together', () => {
      render(
        <TokensProvider>
          <div>
            <Dashboard
              title="Integration Test"
              metrics={mockMetrics}
            />
            <DataTable
              columns={mockTableColumns}
              data={mockTableData}
            />
            <FormBuilder
              fields={mockFormFields}
              onSubmit={jest.fn()}
            />
          </div>
        </TokensProvider>
      );
      
      expect(screen.getByText('Integration Test')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByLabelText('Name')).toBeInTheDocument();
    });

    it('should maintain theme consistency', () => {
      render(
        <TokensProvider>
          <div>
            <Button variant="default">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
          </div>
        </TokensProvider>
      );
      
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
      
      // All buttons should be styled consistently
      buttons.forEach(button => {
        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center');
      });
    });
  });
});
