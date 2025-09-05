/**
 * @fileoverview Snapshot tests for homepage sections
 * @module tests/components/homepage-sections
 * @author OSS Hero System
 * @version 1.0.0
 */

import React from 'react';
import { render } from '@testing-library/react';
import Home from '@/app/page';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
}));

// Mock the useReducedMotion hook
jest.mock('@/hooks/use-motion-preference', () => ({
  useReducedMotion: () => true, // Always use reduced motion in tests
}));

describe('Homepage Sections Snapshot Tests', () => {
  beforeEach(() => {
    // Clear any previous renders
    jest.clearAllMocks();
  });

  describe('Hero Section', () => {
    it('should match snapshot for hero section', () => {
      const { container } = render(<Home />);
      
      // Find the hero section by aria-labelledby
      const heroSection = container.querySelector('[aria-labelledby="hero-heading"]');
      expect(heroSection).toBeInTheDocument();
      
      // Create snapshot of the hero section
      expect(heroSection).toMatchSnapshot('hero-section');
    });

    it('should contain all hero section elements', () => {
      const { container } = render(<Home />);
      
      const heroSection = container.querySelector('[aria-labelledby="hero-heading"]');
      
      // Check for key hero elements
      expect(heroSection).toHaveTextContent('✨ Now Available');
      expect(heroSection).toHaveTextContent('Build Better Products');
      expect(heroSection).toHaveTextContent('Faster Than Ever');
      expect(heroSection).toHaveTextContent('Transform your ideas into production-ready applications');
      expect(heroSection).toHaveTextContent('Get Started Free');
      expect(heroSection).toHaveTextContent('View Documentation');
    });
  });

  describe('Features Section', () => {
    it('should match snapshot for features section', () => {
      const { container } = render(<Home />);
      
      // Find the features section by aria-labelledby
      const featuresSection = container.querySelector('[aria-labelledby="features-heading"]');
      expect(featuresSection).toBeInTheDocument();
      
      // Create snapshot of the features section
      expect(featuresSection).toMatchSnapshot('features-section');
    });

    it('should contain all feature cards', () => {
      const { container } = render(<Home />);
      
      const featuresSection = container.querySelector('[aria-labelledby="features-heading"]');
      
      // Check for features heading
      expect(featuresSection).toHaveTextContent('Everything you need to build');
      expect(featuresSection).toHaveTextContent('Powerful tools and components designed to accelerate your development workflow');
      
      // Check for all 4 feature cards
      expect(featuresSection).toHaveTextContent('Development Tools');
      expect(featuresSection).toHaveTextContent('UI Components');
      expect(featuresSection).toHaveTextContent('Database & Auth');
      expect(featuresSection).toHaveTextContent('One-Click Deploy');
    });

    it('should have proper accessibility attributes', () => {
      const { container } = render(<Home />);
      
      const featuresSection = container.querySelector('[aria-labelledby="features-heading"]');
      const featureList = featuresSection?.querySelector('[role="list"]');
      const featureItems = featuresSection?.querySelectorAll('[role="listitem"]');
      
      expect(featureList).toBeInTheDocument();
      expect(featureItems).toHaveLength(4);
    });
  });

  describe('CTA Section', () => {
    it('should match snapshot for CTA section', () => {
      const { container } = render(<Home />);
      
      // Find the CTA section by aria-labelledby
      const ctaSection = container.querySelector('[aria-labelledby="cta-heading"]');
      expect(ctaSection).toBeInTheDocument();
      
      // Create snapshot of the CTA section
      expect(ctaSection).toMatchSnapshot('cta-section');
    });

    it('should contain all CTA section elements', () => {
      const { container } = render(<Home />);
      
      const ctaSection = container.querySelector('[aria-labelledby="cta-heading"]');
      
      // Check for CTA elements
      expect(ctaSection).toHaveTextContent('Ready to get started?');
      expect(ctaSection).toHaveTextContent('Join thousands of developers building the future with our platform.');
      expect(ctaSection).toHaveTextContent('Start Building Today');
    });

    it('should have proper accessibility attributes', () => {
      const { container } = render(<Home />);
      
      const ctaSection = container.querySelector('[aria-labelledby="cta-heading"]');
      const ctaButton = ctaSection?.querySelector('button');
      
      expect(ctaButton).toBeInTheDocument();
      expect(ctaButton).toHaveAttribute('aria-describedby', 'cta-heading');
      expect(ctaButton).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Complete Homepage', () => {
    it('should render without errors', () => {
      expect(() => render(<Home />)).not.toThrow();
    });

    it('should contain all three main sections', () => {
      const { container } = render(<Home />);
      
      const heroSection = container.querySelector('[aria-labelledby="hero-heading"]');
      const featuresSection = container.querySelector('[aria-labelledby="features-heading"]');
      const ctaSection = container.querySelector('[aria-labelledby="cta-heading"]');
      
      expect(heroSection).toBeInTheDocument();
      expect(featuresSection).toBeInTheDocument();
      expect(ctaSection).toBeInTheDocument();
    });

    it('should have proper skip links for accessibility', () => {
      const { container } = render(<Home />);
      
      const skipLinks = container.querySelectorAll('.skip-link');
      expect(skipLinks).toHaveLength(3);
      
      expect(skipLinks[0]).toHaveAttribute('href', '#hero-heading');
      expect(skipLinks[1]).toHaveAttribute('href', '#features-heading');
      expect(skipLinks[2]).toHaveAttribute('href', '#cta-heading');
    });
  });
});

