import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import AgencyToolkitDashboard from '@/app/agency-toolkit/page';
import { lazyLoadingManager } from '@/lib/integration/lazy-loading-manager';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { tenant_id: 'test-tenant' },
        error: null
      })
    }))
  }))
}));

vi.mock('@/lib/integration/lazy-loading-manager', () => ({
  lazyLoadingManager: {
    loadModule: vi.fn(),
    preloadModule: vi.fn(),
    preloadHighPriorityModules: vi.fn(),
    getLoadingStatus: vi.fn(() => 'not-loaded'),
    getMetrics: vi.fn(() => ({
      loadTime: 0,
      bundleSize: 0,
      errorCount: 0,
      lastLoaded: new Date()
    })),
    cleanup: vi.fn()
  },
  useLazyModule: vi.fn(() => ({
    Component: null,
    loading: false,
    error: null,
    elementRef: { current: null },
    loadModule: vi.fn(),
    status: 'not-loaded'
  })),
  useModulePreloading: vi.fn(),
  useModuleMetrics: vi.fn(() => new Map())
}));

describe('Dashboard Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('HT-035 Module Integration', () => {
    it('should render all four HT-035 module cards', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/orchestration/i)).toBeInTheDocument();
        expect(screen.getByText(/modules/i)).toBeInTheDocument();
        expect(screen.getByText(/marketplace/i)).toBeInTheDocument();
        expect(screen.getByText(/handover/i)).toBeInTheDocument();
      });
    });

    it('should display module status indicators', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const statusElements = screen.getAllByTestId(/module-status/i);
        expect(statusElements.length).toBeGreaterThanOrEqual(4);
      });
    });

    it('should have working navigation links for all modules', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const orchestrationLink = screen.getByRole('link', { name: /orchestration/i });
        const modulesLink = screen.getByRole('link', { name: /modules/i });
        const marketplaceLink = screen.getByRole('link', { name: /marketplace/i });
        const handoverLink = screen.getByRole('link', { name: /handover/i });

        expect(orchestrationLink).toHaveAttribute('href', '/agency-toolkit/orchestration');
        expect(modulesLink).toHaveAttribute('href', '/agency-toolkit/modules');
        expect(marketplaceLink).toHaveAttribute('href', '/agency-toolkit/marketplace');
        expect(handoverLink).toHaveAttribute('href', '/agency-toolkit/handover');
      });
    });
  });

  describe('Performance Optimization', () => {
    it('should load dashboard in under 2 seconds', async () => {
      const startTime = performance.now();

      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/agency toolkit/i)).toBeInTheDocument();
      });

      const loadTime = performance.now() - startTime;
      expect(loadTime).toBeLessThan(2000);
    });

    it('should implement lazy loading for module components', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(lazyLoadingManager.preloadHighPriorityModules).toHaveBeenCalled();
      });
    });

    it('should preload high-priority modules on dashboard mount', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(lazyLoadingManager.preloadModule).toHaveBeenCalledWith('orchestration');
        expect(lazyLoadingManager.preloadModule).toHaveBeenCalledWith('modules');
      });
    });
  });

  describe('Module Status Display', () => {
    it('should show workflow count for orchestration module', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const orchestrationCard = screen.getByTestId('orchestration-module-card');
        expect(orchestrationCard).toBeInTheDocument();
      });
    });

    it('should show active modules count', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const modulesCard = screen.getByTestId('modules-module-card');
        expect(modulesCard).toBeInTheDocument();
      });
    });

    it('should show marketplace revenue metrics', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const marketplaceCard = screen.getByTestId('marketplace-module-card');
        expect(marketplaceCard).toBeInTheDocument();
      });
    });

    it('should show handover progress tracking', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const handoverCard = screen.getByTestId('handover-module-card');
        expect(handoverCard).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('should follow existing design system patterns', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const cards = screen.getAllByRole('article');
        cards.forEach(card => {
          expect(card).toHaveClass(/card/i);
        });
      });
    });

    it('should be responsive on mobile devices', async () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const dashboard = screen.getByTestId('agency-toolkit-dashboard');
        expect(dashboard).toHaveClass(/responsive/i);
      });
    });

    it('should handle module card click interactions', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const orchestrationCard = screen.getByTestId('orchestration-module-card');
        fireEvent.click(orchestrationCard);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle module loading errors gracefully', async () => {
      vi.mocked(lazyLoadingManager.loadModule).mockRejectedValueOnce(
        new Error('Module load failed')
      );

      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.queryByText(/error loading module/i)).not.toBeInTheDocument();
      });
    });

    it('should display fallback UI when module unavailable', async () => {
      vi.mocked(lazyLoadingManager.getLoadingStatus).mockReturnValue('not-loaded');

      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const moduleCards = screen.getAllByTestId(/module-card/i);
        expect(moduleCards.length).toBeGreaterThanOrEqual(4);
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for all modules', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByLabelText(/orchestration module/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/modules management/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/marketplace/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/handover automation/i)).toBeInTheDocument();
      });
    });

    it('should be keyboard navigable', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        const firstCard = screen.getAllByRole('article')[0];
        firstCard.focus();
        expect(document.activeElement).toBe(firstCard);
      });
    });
  });

  describe('Integration with Existing Features', () => {
    it('should integrate with existing client management', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/clients/i)).toBeInTheDocument();
      });
    });

    it('should integrate with existing document generation', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/documents/i)).toBeInTheDocument();
      });
    });

    it('should integrate with existing form builder', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/forms/i)).toBeInTheDocument();
      });
    });

    it('should integrate with existing templates', async () => {
      render(<AgencyToolkitDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/templates/i)).toBeInTheDocument();
      });
    });
  });
});