/**
 * @fileoverview Tests for HT-001.3.5 Button primitive
 * @module tests/components/Button.test
 */

import { render, screen, fireEvent } from '@testing-library/react';
import { Button, CTAButton, SecondaryCTAButton, OutlineCTAButton, GhostCTAButton, BookingCTAButton, DownloadCTAButton, EmailCTAButton } from '@/components/ui/button';
import { Download, Mail, Calendar } from 'lucide-react';

describe('HT-001.3.5 Button Primitive', () => {
  describe('CTA Variants', () => {
    it('renders primary CTA button', () => {
      render(<Button variant="cta">Book Consultation</Button>);
      const button = screen.getByRole('button', { name: /book consultation/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders secondary CTA button', () => {
      render(<Button variant="cta-secondary">Learn More</Button>);
      const button = screen.getByRole('button', { name: /learn more/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders outline CTA button', () => {
      render(<Button variant="cta-outline">Get Started</Button>);
      const button = screen.getByRole('button', { name: /get started/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('border', 'bg-background', 'text-primary');
    });

    it('renders ghost CTA button', () => {
      render(<Button variant="cta-ghost">View Details</Button>);
      const button = screen.getByRole('button', { name: /view details/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('text-primary');
    });
  });

  describe('Intent Variants', () => {
    it('renders booking intent button', () => {
      render(<Button variant="cta" intent="booking">Book Now</Button>);
      const button = screen.getByRole('button', { name: /book now/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });

    it('renders download intent button', () => {
      render(<Button variant="cta" intent="download">Download PDF</Button>);
      const button = screen.getByRole('button', { name: /download pdf/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('renders email intent button', () => {
      render(<Button variant="cta" intent="email">Send Email</Button>);
      const button = screen.getByRole('button', { name: /send email/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-purple-600', 'hover:bg-purple-700');
    });
  });

  describe('Size Variants', () => {
    it('renders extra small button', () => {
      render(<Button variant="cta" size="xs">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-7', 'text-xs');
    });

    it('renders small button', () => {
      render(<Button variant="cta" size="sm">Small</Button>);
      const button = screen.getByRole('button', { name: /small/i });
      expect(button).toHaveClass('h-8');
    });

    it('renders large button', () => {
      render(<Button variant="cta" size="lg">Large</Button>);
      const button = screen.getByRole('button', { name: /large/i });
      expect(button).toHaveClass('h-10');
    });

    it('renders extra large button', () => {
      render(<Button variant="cta" size="xl">Extra Large</Button>);
      const button = screen.getByRole('button', { name: /extra large/i });
      expect(button).toHaveClass('h-12', 'text-base', 'font-semibold');
    });
  });

  describe('Loading States', () => {
    it('shows loading spinner when loading', () => {
      render(<Button variant="cta" loading>Submit</Button>);
      const spinner = screen.getByRole('button').querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });

    it('shows loading text when provided', () => {
      render(<Button variant="cta" loading loadingText="Processing...">Submit</Button>);
      expect(screen.getByText('Processing...')).toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button variant="cta" loading>Submit</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Icon Support', () => {
    it('renders icon on the left by default', () => {
      render(
        <Button variant="cta" icon={<Download data-testid="download-icon" />}>
          Download
        </Button>
      );
      const icon = screen.getByTestId('download-icon');
      expect(icon).toBeInTheDocument();
    });

    it('renders icon on the right when specified', () => {
      render(
        <Button 
          variant="cta" 
          icon={<Download data-testid="download-icon" />}
          iconPosition="right"
        >
          Download
        </Button>
      );
      const icon = screen.getByTestId('download-icon');
      expect(icon).toBeInTheDocument();
    });

    it('hides icon when loading', () => {
      render(
        <Button 
          variant="cta" 
          icon={<Download data-testid="download-icon" />}
          loading
        >
          Download
        </Button>
      );
      const icon = screen.queryByTestId('download-icon');
      expect(icon).not.toBeInTheDocument();
    });
  });

  describe('Full Width Support', () => {
    it('applies full width class when specified', () => {
      render(<Button variant="cta" fullWidth>Full Width</Button>);
      const button = screen.getByRole('button', { name: /full width/i });
      expect(button).toHaveClass('w-full');
    });
  });

  describe('CTA Type Prop', () => {
    it('auto-determines variant from ctaType', () => {
      render(<Button ctaType="primary">Primary CTA</Button>);
      const button = screen.getByRole('button', { name: /primary cta/i });
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('auto-determines secondary variant from ctaType', () => {
      render(<Button ctaType="secondary">Secondary CTA</Button>);
      const button = screen.getByRole('button', { name: /secondary cta/i });
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });
  });

  describe('Specialized CTA Components', () => {
    it('renders CTAButton component', () => {
      render(<CTAButton>Primary CTA</CTAButton>);
      const button = screen.getByRole('button', { name: /primary cta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
    });

    it('renders SecondaryCTAButton component', () => {
      render(<SecondaryCTAButton>Secondary CTA</SecondaryCTAButton>);
      const button = screen.getByRole('button', { name: /secondary cta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
    });

    it('renders OutlineCTAButton component', () => {
      render(<OutlineCTAButton>Outline CTA</OutlineCTAButton>);
      const button = screen.getByRole('button', { name: /outline cta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('border', 'bg-background', 'text-primary');
    });

    it('renders GhostCTAButton component', () => {
      render(<GhostCTAButton>Ghost CTA</GhostCTAButton>);
      const button = screen.getByRole('button', { name: /ghost cta/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('text-primary');
    });
  });

  describe('Intent-Specific CTA Components', () => {
    it('renders BookingCTAButton component', () => {
      render(<BookingCTAButton>Book Now</BookingCTAButton>);
      const button = screen.getByRole('button', { name: /book now/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });

    it('renders DownloadCTAButton component', () => {
      render(<DownloadCTAButton>Download</DownloadCTAButton>);
      const button = screen.getByRole('button', { name: /download/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-blue-600', 'hover:bg-blue-700');
    });

    it('renders EmailCTAButton component', () => {
      render(<EmailCTAButton>Send Email</EmailCTAButton>);
      const button = screen.getByRole('button', { name: /send email/i });
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass('bg-purple-600', 'hover:bg-purple-700');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes', () => {
      render(<Button variant="cta">Accessible Button</Button>);
      const button = screen.getByRole('button', { name: /accessible button/i });
      expect(button).toHaveAttribute('data-slot', 'button');
    });

    it('handles disabled state properly', () => {
      render(<Button variant="cta" disabled>Disabled Button</Button>);
      const button = screen.getByRole('button', { name: /disabled button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });

    it('handles loading state accessibility', () => {
      render(<Button variant="cta" loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
      expect(button).toHaveAttribute('data-loading', 'true');
    });
  });

  describe('Event Handling', () => {
    it('calls onClick handler', () => {
      const handleClick = jest.fn();
      render(<Button variant="cta" onClick={handleClick}>Click Me</Button>);
      
      fireEvent.click(screen.getByRole('button', { name: /click me/i }));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', () => {
      const handleClick = jest.fn();
      render(<Button variant="cta" disabled onClick={handleClick}>Disabled</Button>);
      
      fireEvent.click(screen.getByRole('button', { name: /disabled/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', () => {
      const handleClick = jest.fn();
      render(<Button variant="cta" loading onClick={handleClick}>Loading</Button>);
      
      fireEvent.click(screen.getByRole('button', { name: /loading/i }));
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Data Attributes', () => {
    it('sets cta-type data attribute', () => {
      render(<Button ctaType="primary">CTA Button</Button>);
      const button = screen.getByRole('button', { name: /cta button/i });
      expect(button).toHaveAttribute('data-cta-type', 'primary');
    });

    it('sets loading data attribute', () => {
      render(<Button variant="cta" loading>Loading Button</Button>);
      const button = screen.getByRole('button', { name: /loading button/i });
      expect(button).toHaveAttribute('data-loading', 'true');
    });
  });
});
