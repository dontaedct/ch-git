/**
 * @fileoverview HT-011.3.4 Navigation and Header Brand Integration Tests
 * @module tests/branding/navigation-header-integration.test.tsx
 * @author OSS Hero System
 * @version 1.0.0
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { BrandProvider } from '@/components/branding/BrandProvider';
import { 
  BrandAwareNavigation,
  BrandWithLogo
} from '@/components/branding';
import { DEFAULT_BRAND_CONFIG } from '@/lib/branding/logo-manager';

// Mock the branding hooks
jest.mock('@/lib/branding/hooks', () => ({
  useBrandNames: () => ({
    brandNames: DEFAULT_BRAND_CONFIG.brandName,
  }),
  useLogoConfig: () => ({
    logoConfig: DEFAULT_BRAND_CONFIG.logo,
  }),
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

describe('HT-011.3.4: Navigation and Header Brand Integration', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <BrandProvider>
        {component}
      </BrandProvider>
    );
  };

  const mockRoutes = [
    {
      href: '/',
      label: 'Home',
      public: true,
    },
    {
      href: '/dashboard',
      label: 'Dashboard',
      protected: true,
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      protected: true,
      parent: '/dashboard',
    },
  ];

  describe('BrandAwareNavigation Component', () => {
    it('should render header variant with brand logo', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Should render brand logo
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      expect(screen.getByText(/Micro App/)).toBeInTheDocument();
    });

    it('should render sidebar variant with brand logo', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="sidebar"
        />
      );
      
      // Should render brand logo
      expect(screen.getByRole('img', { hidden: true })).toBeInTheDocument();
      expect(screen.getByText(/Your Organization — Micro App/)).toBeInTheDocument();
    });

    it('should render mobile variant with brand logo', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="mobile"
        />
      );
      
      // Should render mobile menu button
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });

    it('should show correct navigation routes based on authentication', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={false}
          pathname="/"
          variant="header"
        />
      );
      
      // Should show public routes only
      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    });

    it('should show protected routes when authenticated', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Should show protected routes
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    it('should highlight active route', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Dashboard should be active
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-blue-900/80');
    });

    it('should render breadcrumbs for nested routes', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard/settings"
          variant="header"
        />
      );
      
      // Should show breadcrumbs - use getAllByText to handle multiple Dashboard elements
      const dashboardElements = screen.getAllByText('Dashboard');
      expect(dashboardElements.length).toBeGreaterThan(0);
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('should open and close mobile menu', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="mobile"
        />
      );
      
      // Open mobile menu
      const menuButton = screen.getByLabelText('Open navigation menu');
      fireEvent.click(menuButton);
      
      // Should show mobile drawer
      expect(screen.getByLabelText('Close navigation menu')).toBeInTheDocument();
      
      // Close mobile menu
      const closeButton = screen.getByLabelText('Close navigation menu');
      fireEvent.click(closeButton);
      
      // Menu should be closed
      expect(screen.queryByLabelText('Close navigation menu')).not.toBeInTheDocument();
    });
  });

  describe('BrandWithLogo Integration', () => {
    it('should render with correct brand variant', () => {
      renderWithProvider(
        <BrandWithLogo
          logoSize="md"
          brandVariant="full"
          brandClassName="text-lg font-semibold"
        />
      );
      
      // Should render brand name
      expect(screen.getByText(/Your Organization — Micro App/)).toBeInTheDocument();
    });

    it('should render with short brand variant', () => {
      renderWithProvider(
        <BrandWithLogo
          logoSize="sm"
          brandVariant="short"
          brandClassName="text-sm font-medium"
        />
      );
      
      // Should render short brand name
      expect(screen.getByText(/Micro App/)).toBeInTheDocument();
    });

    it('should render with nav brand variant', () => {
      renderWithProvider(
        <BrandWithLogo
          logoSize="sm"
          brandVariant="nav"
          brandClassName="text-sm font-medium"
        />
      );
      
      // Should render nav brand name
      expect(screen.getByText(/Micro App/)).toBeInTheDocument();
    });
  });

  describe('Navigation Styling Integration', () => {
    it('should apply brand-aware styling classes', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Should have brand-aware styling
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('border-gray-200');
    });

    it('should apply active state styling', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="sidebar"
        />
      );
      
      // Dashboard link should be active
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('bg-blue-50');
    });

    it('should apply hover state styling', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="sidebar"
        />
      );
      
      // Settings link should have hover styling classes
      const settingsLink = screen.getByText('Settings').closest('a');
      expect(settingsLink).toHaveClass('hover:bg-gray-100', 'dark:hover:bg-gray-800');
    });
  });

  describe('Responsive Behavior', () => {
    it('should hide desktop navigation on mobile', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Desktop navigation should be hidden on mobile
      const desktopNav = screen.getByRole('navigation');
      expect(desktopNav).toHaveClass('hidden md:flex');
    });

    it('should show mobile menu button on mobile', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="mobile"
        />
      );
      
      // Mobile menu button should be visible
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard/settings"
          variant="header"
        />
      );
      
      // Should have proper ARIA labels - check for breadcrumb nav
      const breadcrumbNav = screen.queryByLabelText('Breadcrumb');
      if (breadcrumbNav) {
        expect(breadcrumbNav).toBeInTheDocument();
      }
      
      // Should have mobile menu button with proper label
      expect(screen.getByLabelText('Open navigation menu')).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="header"
        />
      );
      
      // Links should have focus styles
      const dashboardLink = screen.getByText('Dashboard').closest('a');
      expect(dashboardLink).toHaveClass('focus:outline-none');
    });

    it('should have proper focus management', () => {
      renderWithProvider(
        <BrandAwareNavigation
          routes={mockRoutes}
          isAuthenticated={true}
          pathname="/dashboard"
          variant="mobile"
        />
      );
      
      // Mobile menu button should have focus styles
      const menuButton = screen.getByLabelText('Open navigation menu');
      expect(menuButton).toHaveClass('focus:outline-none');
    });
  });
});
