import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { useRouter } from 'next/navigation';
import UnifiedNavigation from '@/components/agency-toolkit/UnifiedNavigation';
import BreadcrumbSystem from '@/components/agency-toolkit/BreadcrumbSystem';
import InterModuleNavigation from '@/components/agency-toolkit/InterModuleNavigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
  usePathname: vi.fn(() => '/agency-toolkit'),
  useSearchParams: vi.fn(() => new URLSearchParams())
}));

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      })
    }
  }))
}));

describe('Navigation Flow Tests', () => {
  const mockPush = vi.fn();
  const mockRouter = {
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue(mockRouter as any);
  });

  describe('Unified Navigation Component', () => {
    it('should render all navigation links', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        expect(screen.getByText(/dashboard/i)).toBeInTheDocument();
        expect(screen.getByText(/orchestration/i)).toBeInTheDocument();
        expect(screen.getByText(/modules/i)).toBeInTheDocument();
        expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
        expect(screen.getByText(/handover/i)).toBeInTheDocument();
      });
    });

    it('should highlight active navigation item', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue('/agency-toolkit/orchestration');

      render(<UnifiedNavigation />);

      await waitFor(() => {
        const activeLink = screen.getByRole('link', { name: /orchestration/i });
        expect(activeLink).toHaveClass(/active/i);
      });
    });

    it('should navigate to correct routes on click', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const orchestrationLink = screen.getByRole('link', { name: /orchestration/i });
        fireEvent.click(orchestrationLink);
        expect(mockPush).toHaveBeenCalledWith('/agency-toolkit/orchestration');
      });
    });
  });

  describe('Breadcrumb System', () => {
    it('should display breadcrumbs for current page', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue(
        '/agency-toolkit/orchestration/workflows'
      );

      render(<BreadcrumbSystem />);

      await waitFor(() => {
        expect(screen.getByText(/agency toolkit/i)).toBeInTheDocument();
        expect(screen.getByText(/orchestration/i)).toBeInTheDocument();
        expect(screen.getByText(/workflows/i)).toBeInTheDocument();
      });
    });

    it('should navigate to parent pages via breadcrumbs', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue(
        '/agency-toolkit/orchestration/workflows'
      );

      render(<BreadcrumbSystem />);

      await waitFor(() => {
        const orchestrationCrumb = screen.getByRole('link', { name: /orchestration/i });
        fireEvent.click(orchestrationCrumb);
        expect(mockPush).toHaveBeenCalledWith('/agency-toolkit/orchestration');
      });
    });

    it('should handle deep nested navigation paths', async () => {
      vi.mocked(require('next/navigation').usePathname).mockReturnValue(
        '/agency-toolkit/marketplace/templates/install/preview'
      );

      render(<BreadcrumbSystem />);

      await waitFor(() => {
        expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
        expect(screen.getByText(/templates/i)).toBeInTheDocument();
        expect(screen.getByText(/install/i)).toBeInTheDocument();
        expect(screen.getByText(/preview/i)).toBeInTheDocument();
      });
    });
  });

  describe('Inter-Module Navigation', () => {
    it('should provide quick links between related modules', async () => {
      render(<InterModuleNavigation currentModule="orchestration" />);

      await waitFor(() => {
        expect(screen.getByText(/modules/i)).toBeInTheDocument();
        expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
      });
    });

    it('should suggest relevant next steps based on current module', async () => {
      render(<InterModuleNavigation currentModule="marketplace" />);

      await waitFor(() => {
        expect(screen.getByText(/install to client/i)).toBeInTheDocument();
      });
    });

    it('should handle module transitions with context preservation', async () => {
      const context = { workflowId: 'workflow-123', clientId: 'client-456' };

      render(<InterModuleNavigation currentModule="orchestration" context={context} />);

      await waitFor(() => {
        const handoverLink = screen.getByRole('link', { name: /handover/i });
        fireEvent.click(handoverLink);
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('workflow-123')
        );
      });
    });
  });

  describe('Complete User Workflows', () => {
    it('should navigate from dashboard to orchestration to handover', async () => {
      const { rerender } = render(<UnifiedNavigation />);

      fireEvent.click(screen.getByRole('link', { name: /orchestration/i }));
      expect(mockPush).toHaveBeenCalledWith('/agency-toolkit/orchestration');

      vi.mocked(require('next/navigation').usePathname).mockReturnValue(
        '/agency-toolkit/orchestration'
      );
      rerender(<UnifiedNavigation />);

      await waitFor(() => {
        fireEvent.click(screen.getByRole('link', { name: /handover/i }));
        expect(mockPush).toHaveBeenCalledWith('/agency-toolkit/handover');
      });
    });

    it('should navigate marketplace to modules to client deployment', async () => {
      render(<InterModuleNavigation currentModule="marketplace" />);

      await waitFor(() => {
        const installLink = screen.getByText(/install to client/i);
        fireEvent.click(installLink);
        expect(mockPush).toHaveBeenCalled();
      });
    });

    it('should preserve state during cross-module navigation', async () => {
      const workflow = { id: 'wf-123', name: 'Client Onboarding', status: 'active' };

      render(
        <InterModuleNavigation
          currentModule="orchestration"
          context={{ workflow }}
        />
      );

      await waitFor(() => {
        const handoverLink = screen.getByText(/complete handover/i);
        fireEvent.click(handoverLink);
        expect(mockPush).toHaveBeenCalledWith(
          expect.stringContaining('wf-123')
        );
      });
    });
  });

  describe('Navigation State Management', () => {
    it('should persist navigation history', async () => {
      const navigationHistory = [
        '/agency-toolkit',
        '/agency-toolkit/orchestration',
        '/agency-toolkit/modules'
      ];

      render(<UnifiedNavigation history={navigationHistory} />);

      await waitFor(() => {
        const backButton = screen.getByLabelText(/go back/i);
        expect(backButton).toBeInTheDocument();
      });
    });

    it('should handle forward and backward navigation', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const backButton = screen.getByLabelText(/go back/i);
        fireEvent.click(backButton);
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });

    it('should prefetch linked pages on hover', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const orchestrationLink = screen.getByRole('link', { name: /orchestration/i });
        fireEvent.mouseEnter(orchestrationLink);
        expect(mockRouter.prefetch).toHaveBeenCalledWith('/agency-toolkit/orchestration');
      });
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
    });

    it('should render mobile-optimized navigation', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        expect(screen.getByLabelText(/menu/i)).toBeInTheDocument();
      });
    });

    it('should show drawer navigation on mobile', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const menuButton = screen.getByLabelText(/menu/i);
        fireEvent.click(menuButton);
        expect(screen.getByRole('navigation')).toHaveClass(/drawer/i);
      });
    });

    it('should close drawer after navigation', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const menuButton = screen.getByLabelText(/menu/i);
        fireEvent.click(menuButton);

        const orchestrationLink = screen.getByRole('link', { name: /orchestration/i });
        fireEvent.click(orchestrationLink);

        expect(screen.queryByRole('navigation', { name: /drawer/i })).not.toBeVisible();
      });
    });
  });

  describe('Accessibility Navigation', () => {
    it('should support keyboard navigation', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const firstLink = screen.getAllByRole('link')[0];
        firstLink.focus();
        expect(document.activeElement).toBe(firstLink);

        fireEvent.keyDown(firstLink, { key: 'Tab' });
        const secondLink = screen.getAllByRole('link')[1];
        expect(document.activeElement).toBe(secondLink);
      });
    });

    it('should announce navigation changes to screen readers', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const announcement = screen.getByRole('status', { name: /navigation/i });
        expect(announcement).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels for all navigation elements', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        expect(screen.getByLabelText(/main navigation/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/breadcrumb navigation/i)).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    it('should navigate without full page reload', async () => {
      const reloadSpy = vi.spyOn(window.location, 'reload');

      render(<UnifiedNavigation />);

      await waitFor(() => {
        const orchestrationLink = screen.getByRole('link', { name: /orchestration/i });
        fireEvent.click(orchestrationLink);
        expect(reloadSpy).not.toHaveBeenCalled();
      });
    });

    it('should use client-side routing for all internal links', async () => {
      render(<UnifiedNavigation />);

      await waitFor(() => {
        const links = screen.getAllByRole('link');
        links.forEach(link => {
          expect(link).not.toHaveAttribute('target', '_blank');
        });
      });
    });
  });
});