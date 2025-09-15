/**
 * @fileoverview HT-022.2.1: Agency Button Component Stories
 * @module components/ui/atomic/atoms
 * @author Agency Component System
 * @version 1.0.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '../../button';
import { Download, Mail, Calendar } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'Agency/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Agency Button component with CTA focus and atomic design compliance. Supports client theming and rapid customization.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['cta', 'cta-secondary', 'cta-outline', 'cta-ghost', 'solid', 'ghost', 'subtle', 'destructive', 'outline', 'link']
    },
    size: {
      control: { type: 'select' },
      options: ['xs', 'sm', 'default', 'md', 'lg', 'xl', 'icon', 'icon-sm', 'icon-lg']
    },
    intent: {
      control: { type: 'select' },
      options: ['default', 'booking', 'download', 'email', 'danger', 'success']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Primary CTA Stories
export const CTAPrimary: Story = {
  args: {
    variant: 'cta',
    children: 'Book Consultation',
    size: 'lg'
  }
};

export const CTASecondary: Story = {
  args: {
    variant: 'cta-secondary',
    children: 'Learn More',
    size: 'lg'
  }
};

export const CTAOutline: Story = {
  args: {
    variant: 'cta-outline',
    children: 'View Details',
    size: 'lg'
  }
};

export const CTAGhost: Story = {
  args: {
    variant: 'cta-ghost',
    children: 'Skip for now',
    size: 'lg'
  }
};

// Intent-based Stories
export const BookingCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'booking',
    children: 'Schedule Meeting',
    icon: <Calendar className="h-4 w-4" />,
    size: 'lg'
  }
};

export const DownloadCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'download',
    children: 'Download PDF',
    icon: <Download className="h-4 w-4" />,
    size: 'lg'
  }
};

export const EmailCTA: Story = {
  args: {
    variant: 'cta',
    intent: 'email',
    children: 'Send Email',
    icon: <Mail className="h-4 w-4" />,
    size: 'lg'
  }
};

// Loading States
export const LoadingCTA: Story = {
  args: {
    variant: 'cta',
    children: 'Processing...',
    loading: true,
    size: 'lg'
  }
};

export const LoadingWithText: Story = {
  args: {
    variant: 'cta',
    children: 'Book Consultation',
    loading: true,
    loadingText: 'Booking...',
    size: 'lg'
  }
};

// Size Variations
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4 flex-wrap">
      <Button variant="cta" size="xs">Extra Small</Button>
      <Button variant="cta" size="sm">Small</Button>
      <Button variant="cta" size="default">Default</Button>
      <Button variant="cta" size="lg">Large</Button>
      <Button variant="cta" size="xl">Extra Large</Button>
    </div>
  )
};

// Full Width
export const FullWidth: Story = {
  args: {
    variant: 'cta',
    children: 'Full Width Button',
    fullWidth: true,
    size: 'lg'
  },
  parameters: {
    layout: 'padded'
  }
};