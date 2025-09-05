import type { Meta, StoryObj } from '@storybook/react';
import { Button, CTAButton, SecondaryCTAButton, OutlineCTAButton, GhostCTAButton, BookingCTAButton, DownloadCTAButton, EmailCTAButton } from './button';
import { Download, Mail, Calendar, ArrowRight } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button - HT-001.3.5',
  component: Button,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
        ],
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['cta', 'cta-secondary', 'cta-outline', 'cta-ghost', 'solid', 'ghost', 'subtle', 'destructive', 'outline', 'link', 'default', 'secondary'],
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'default', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg'],
    },
    intent: {
      control: { type: 'select' },
      options: ['default', 'booking', 'download', 'email', 'danger', 'success'],
    },
    ctaType: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost'],
    },
    loading: {
      control: { type: 'boolean' },
    },
    fullWidth: {
      control: { type: 'boolean' },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// HT-001.3.5 CTA Variants
export const CTAPrimary: Story = {
  args: {
    variant: 'cta',
    size: 'lg',
    children: 'Book Consultation',
  },
};

export const CTASecondary: Story = {
  args: {
    variant: 'cta-secondary',
    size: 'lg',
    children: 'Learn More',
  },
};

export const CTAOutline: Story = {
  args: {
    variant: 'cta-outline',
    size: 'lg',
    children: 'Get Started',
  },
};

export const CTAGhost: Story = {
  args: {
    variant: 'cta-ghost',
    size: 'lg',
    children: 'View Details',
  },
};

// Intent-specific CTAs
export const BookingCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'booking',
    size: 'xl',
    icon: <Calendar className="w-5 h-5" />,
    children: 'Book Now',
  },
};

export const DownloadCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'download',
    size: 'lg',
    icon: <Download className="w-4 h-4" />,
    children: 'Download PDF',
  },
};

export const EmailCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'email',
    size: 'lg',
    icon: <Mail className="w-4 h-4" />,
    children: 'Email Copy',
  },
};

// Loading States
export const CTALoading: Story = {
  args: {
    variant: 'cta',
    size: 'lg',
    loading: true,
    loadingText: 'Processing...',
    children: 'Submit',
  },
};

export const BookingCTALoading: Story = {
  args: {
    variant: 'cta',
    intent: 'booking',
    size: 'xl',
    loading: true,
    loadingText: 'Booking...',
    children: 'Book Now',
  },
};

// Full Width CTAs
export const FullWidthCTA: Story = {
  args: {
    variant: 'cta',
    size: 'xl',
    fullWidth: true,
    children: 'Get Started Today',
  },
};

// CTA with Right Icon
export const CTARightIcon: Story = {
  args: {
    variant: 'cta',
    size: 'lg',
    icon: <ArrowRight className="w-4 h-4" />,
    iconPosition: 'right',
    children: 'Continue',
  },
};

// Size Variants
export const CTASizes: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button variant="cta" size="xs">Extra Small</Button>
      <Button variant="cta" size="sm">Small</Button>
      <Button variant="cta" size="default">Default</Button>
      <Button variant="cta" size="lg">Large</Button>
      <Button variant="cta" size="xl">Extra Large</Button>
    </div>
  ),
};

// Specialized CTA Components
export const SpecializedCTAs: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <CTAButton size="lg">Primary CTA</CTAButton>
      <SecondaryCTAButton size="lg">Secondary CTA</SecondaryCTAButton>
      <OutlineCTAButton size="lg">Outline CTA</OutlineCTAButton>
      <GhostCTAButton size="lg">Ghost CTA</GhostCTAButton>
    </div>
  ),
};

export const IntentCTAs: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <BookingCTAButton size="lg" icon={<Calendar className="w-4 h-4" />}>
        Book Appointment
      </BookingCTAButton>
      <DownloadCTAButton size="lg" icon={<Download className="w-4 h-4" />}>
        Download Report
      </DownloadCTAButton>
      <EmailCTAButton size="lg" icon={<Mail className="w-4 h-4" />}>
        Send Email
      </EmailCTAButton>
    </div>
  ),
};

// CTA Cluster Example (like in consultation engine)
export const CTACluster: Story = {
  render: () => (
    <div className="max-w-md mx-auto space-y-4">
      {/* Primary CTA */}
      <Button 
        variant="cta" 
        size="xl" 
        fullWidth
        className="h-12 text-base font-semibold"
      >
        Book Your Consultation
      </Button>
      
      {/* Secondary CTAs */}
      <div className="flex gap-3 justify-center">
        <Button 
          variant="cta-outline" 
          size="lg"
          icon={<Download className="w-4 h-4" />}
        >
          Download PDF
        </Button>
        <Button 
          variant="cta-outline" 
          size="lg"
          icon={<Mail className="w-4 h-4" />}
        >
          Email Copy
        </Button>
      </div>
    </div>
  ),
};

// Legacy variants for backward compatibility
export const LegacyVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button variant="default" size="lg">Default</Button>
      <Button variant="secondary" size="lg">Secondary</Button>
      <Button variant="destructive" size="lg">Destructive</Button>
      <Button variant="outline" size="lg">Outline</Button>
      <Button variant="ghost" size="lg">Ghost</Button>
      <Button variant="link" size="lg">Link</Button>
    </div>
  ),
};

// Disabled States
export const DisabledCTAs: Story = {
  render: () => (
    <div className="flex flex-col gap-4 items-center">
      <Button variant="cta" size="lg" disabled>
        Disabled CTA
      </Button>
      <Button variant="cta-secondary" size="lg" disabled>
        Disabled Secondary
      </Button>
      <Button variant="cta-outline" size="lg" disabled>
        Disabled Outline
      </Button>
    </div>
  ),
};