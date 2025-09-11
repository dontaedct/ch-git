/**
 * @fileoverview HT-011.3.3 Dynamic Brand Element Integration Tests
 * @module tests/branding/dynamic-brand-integration.test.tsx
 * @author OSS Hero System
 * @version 1.0.0
 */

import { render, screen } from '@testing-library/react';
import { BrandProvider } from '@/components/branding/BrandProvider';
import { 
  DynamicBrandContent,
  DynamicEmailFrom,
  DynamicWelcomeMessage,
  DynamicTransactionalFooter,
  DynamicPageTitle,
  DynamicPageDescription,
  DynamicBrandText,
  BrandIntegrationDemo
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

describe('HT-011.3.3: Dynamic Brand Element Integration', () => {
  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <BrandProvider>
        {component}
      </BrandProvider>
    );
  };

  describe('DynamicBrandContent Component', () => {
    it('should render email from address with dynamic brand name', () => {
      renderWithProvider(<DynamicEmailFrom />);
      expect(screen.getByText(/Micro App <no-reply@example\.com>/)).toBeInTheDocument();
    });

    it('should render welcome message with dynamic brand name', () => {
      renderWithProvider(<DynamicWelcomeMessage />);
      expect(screen.getByText(/Welcome to Micro App/)).toBeInTheDocument();
    });

    it('should render transactional footer with dynamic brand name', () => {
      renderWithProvider(<DynamicTransactionalFooter />);
      expect(screen.getByText(/This is a transactional message from Micro App\./)).toBeInTheDocument();
    });

    it('should render page title with dynamic brand name', () => {
      renderWithProvider(<DynamicPageTitle />);
      expect(screen.getByText(/Micro App Template/)).toBeInTheDocument();
    });

    it('should render page description with dynamic brand name', () => {
      renderWithProvider(<DynamicPageDescription />);
      expect(screen.getByText(/A modern micro web application template for Your Organization/)).toBeInTheDocument();
    });
  });

  describe('DynamicBrandText Component', () => {
    it('should process brand variables in templates', () => {
      renderWithProvider(
        <DynamicBrandText template="Welcome to {brandName}, powered by {organizationName}" />
      );
      expect(screen.getByText(/Welcome to Micro App, powered by Your Organization/)).toBeInTheDocument();
    });

    it('should process custom variables in templates', () => {
      renderWithProvider(
        <DynamicBrandText 
          template="Hello {clientName}, welcome to {brandName}!"
          variables={{ clientName: 'John Doe' }}
        />
      );
      expect(screen.getByText(/Hello John Doe, welcome to Micro App!/)).toBeInTheDocument();
    });

    it('should handle missing variables gracefully', () => {
      renderWithProvider(
        <DynamicBrandText template="Welcome to {brandName} and {missingVar}" />
      );
      expect(screen.getByText(/Welcome to Micro App and /)).toBeInTheDocument();
    });
  });

  describe('BrandIntegrationDemo Component', () => {
    it('should render full demo with all components', () => {
      renderWithProvider(<BrandIntegrationDemo variant="full" />);
      
      // Check for section headers
      expect(screen.getByText('Logo & Brand Name Integration')).toBeInTheDocument();
      expect(screen.getByText('Dynamic Content Integration')).toBeInTheDocument();
      expect(screen.getByText('Template Processing')).toBeInTheDocument();
      expect(screen.getByText('Current Brand Configuration')).toBeInTheDocument();
    });

    it('should render compact demo', () => {
      renderWithProvider(<BrandIntegrationDemo variant="compact" />);
      
      // Should show logo and brand name
      expect(screen.getByText(/Your Organization — Micro App/)).toBeInTheDocument();
      expect(screen.getByText(/A modern micro web application template for Your Organization/)).toBeInTheDocument();
    });

    it('should render email-only demo', () => {
      renderWithProvider(<BrandIntegrationDemo variant="email-only" />);
      
      // Should show email integration
      expect(screen.getByText('Email Integration')).toBeInTheDocument();
      expect(screen.getByText(/Micro App <no-reply@example\.com>/)).toBeInTheDocument();
    });
  });

  describe('Brand Configuration Display', () => {
    it('should display current brand configuration', () => {
      renderWithProvider(<BrandIntegrationDemo variant="full" />);
      
      // Check brand names section
      expect(screen.getByText('Brand Names')).toBeInTheDocument();
      expect(screen.getByText('Organization:')).toBeInTheDocument();
      expect(screen.getByText('App Name:')).toBeInTheDocument();
      
      // Check logo configuration section
      expect(screen.getByText('Logo Configuration')).toBeInTheDocument();
      expect(screen.getByText('CH')).toBeInTheDocument();
    });
  });

  describe('Template Processing', () => {
    it('should show template processing example', () => {
      renderWithProvider(<BrandIntegrationDemo variant="full" />);
      
      // Check template processing section
      expect(screen.getByText('Template Processing')).toBeInTheDocument();
      expect(screen.getByText(/Welcome to Micro App, powered by Your Organization/)).toBeInTheDocument();
    });
  });

  describe('Integration with Existing Components', () => {
    it('should work with existing DynamicLogo component', () => {
      renderWithProvider(<BrandIntegrationDemo variant="compact" />);
      
      // Should render logo without errors
      const logoElement = screen.getByRole('img', { hidden: true });
      expect(logoElement).toBeInTheDocument();
    });

    it('should work with existing DynamicBrandName component', () => {
      renderWithProvider(<BrandIntegrationDemo variant="compact" />);
      
      // Should render brand name
      expect(screen.getByText(/Your Organization — Micro App/)).toBeInTheDocument();
    });
  });
});

describe('Email Template Integration', () => {
  it('should generate correct email from address', () => {
    const { generateEmailFrom } = require('@/lib/branding/email-templates');
    const emailFrom = generateEmailFrom(DEFAULT_BRAND_CONFIG.brandName);
    expect(emailFrom).toBe('Micro App <no-reply@example.com>');
  });

  it('should generate correct transactional footer', () => {
    const { generateTransactionalFooter } = require('@/lib/branding/email-templates');
    const footer = generateTransactionalFooter(DEFAULT_BRAND_CONFIG.brandName);
    expect(footer).toBe('This is a transactional message from Micro App.');
  });

  it('should generate correct welcome message', () => {
    const { generateWelcomeMessage } = require('@/lib/branding/email-templates');
    const welcome = generateWelcomeMessage(DEFAULT_BRAND_CONFIG.brandName);
    expect(welcome).toBe('Welcome to Micro App');
  });
});

describe('System Strings Integration', () => {
  it('should generate correct system strings', () => {
    const { generateDynamicSystemStrings } = require('@/lib/branding/system-strings');
    const strings = generateDynamicSystemStrings(DEFAULT_BRAND_CONFIG.brandName);
    
    expect(strings.emailFrom).toBe('Micro App <no-reply@example.com>');
    expect(strings.welcomeMessage).toBe('Welcome to Micro App');
    expect(strings.transactionalFooter).toBe('This is a transactional message from Micro App.');
    expect(strings.pageTitle).toBe('Micro App Template');
    expect(strings.pageDescription).toBe('A modern micro web application template for Your Organization');
  });

  it('should process templates correctly', () => {
    const { DynamicSystemStringsManager } = require('@/lib/branding/system-strings');
    const manager = new DynamicSystemStringsManager(DEFAULT_BRAND_CONFIG.brandName);
    
    const result = manager.processTemplate('Welcome to {brandName}!', { clientName: 'John' });
    expect(result).toBe('Welcome to Micro App!');
  });
});
