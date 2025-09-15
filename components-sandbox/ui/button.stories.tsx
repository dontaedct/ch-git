/**
 * @fileoverview HT-006 Button Component Stories - Visual Regression Testing
 * @module components-sandbox/ui/button.stories
 * @author HT-006 Phase 5 - Visual Regression Safety
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 5 - Visual Regression Safety
 * Purpose: Comprehensive visual testing for Button component variants
 * Safety: Sandbox-isolated, automated baseline capture
 * Status: Phase 5 implementation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Download, Heart, Star, ArrowRight } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'HT-006/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Token-driven Button component with comprehensive CVA variants, supporting multiple themes and brands.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'link', 'destructive'],
      description: 'Visual style variant',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    tone: {
      control: { type: 'select' },
      options: ['brand', 'neutral', 'success', 'warning', 'danger'],
      description: 'Color tone theme',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Full width button',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'Loading state',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Disabled state',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
  },
};

// Variant stories
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Primary Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary Button',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost Button',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link Button',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive Button',
  },
};

// Size stories
export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small Button',
  },
};

export const Medium: Story = {
  args: {
    size: 'md',
    children: 'Medium Button',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large Button',
  },
};

// Tone stories
export const BrandTone: Story = {
  args: {
    tone: 'brand',
    children: 'Brand Tone',
  },
};

export const SuccessTone: Story = {
  args: {
    tone: 'success',
    children: 'Success Tone',
  },
};

export const WarningTone: Story = {
  args: {
    tone: 'warning',
    children: 'Warning Tone',
  },
};

export const DangerTone: Story = {
  args: {
    tone: 'danger',
    children: 'Danger Tone',
  },
};

// State stories
export const Loading: Story = {
  args: {
    loading: true,
    children: 'Loading Button',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled Button',
  },
};

export const FullWidth: Story = {
  args: {
    fullWidth: true,
    children: 'Full Width Button',
  },
  parameters: {
    layout: 'padded',
  },
};

// Icon stories
export const WithIconLeft: Story = {
  args: {
    icon: <Download className="h-4 w-4" />,
    iconPosition: 'left',
    children: 'Download',
  },
};

export const WithIconRight: Story = {
  args: {
    icon: <ArrowRight className="h-4 w-4" />,
    iconPosition: 'right',
    children: 'Continue',
  },
};

export const IconOnly: Story = {
  args: {
    icon: <Heart className="h-4 w-4" />,
    children: '',
    'aria-label': 'Like',
  },
};

// Complex combinations
export const PrimaryLargeSuccess: Story = {
  args: {
    variant: 'primary',
    size: 'lg',
    tone: 'success',
    children: 'Save Changes',
  },
};

export const GhostSmallBrand: Story = {
  args: {
    variant: 'ghost',
    size: 'sm',
    tone: 'brand',
    children: 'Cancel',
  },
};

export const DestructiveMedium: Story = {
  args: {
    variant: 'destructive',
    size: 'md',
    children: 'Delete Account',
  },
};

// Interactive states
export const HoverState: Story = {
  args: {
    children: 'Hover Me',
  },
  parameters: {
    pseudo: {
      hover: true,
    },
  },
};

export const FocusState: Story = {
  args: {
    children: 'Focus Me',
  },
  parameters: {
    pseudo: {
      focus: true,
    },
  },
};

export const ActiveState: Story = {
  args: {
    children: 'Click Me',
  },
  parameters: {
    pseudo: {
      active: true,
    },
  },
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-4 max-w-2xl">
      <Button variant="primary" size="sm">Primary Small</Button>
      <Button variant="primary" size="md">Primary Medium</Button>
      <Button variant="primary" size="lg">Primary Large</Button>
      <Button variant="secondary" size="sm">Secondary Small</Button>
      <Button variant="secondary" size="md">Secondary Medium</Button>
      <Button variant="secondary" size="lg">Secondary Large</Button>
      <Button variant="ghost" size="sm">Ghost Small</Button>
      <Button variant="ghost" size="md">Ghost Medium</Button>
      <Button variant="ghost" size="lg">Ghost Large</Button>
      <Button variant="link" size="sm">Link Small</Button>
      <Button variant="link" size="md">Link Medium</Button>
      <Button variant="link" size="lg">Link Large</Button>
      <Button variant="destructive" size="sm">Destructive Small</Button>
      <Button variant="destructive" size="md">Destructive Medium</Button>
      <Button variant="destructive" size="lg">Destructive Large</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// All tones showcase
export const AllTones: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-3xl">
      <Button tone="brand">Brand Tone</Button>
      <Button tone="neutral">Neutral Tone</Button>
      <Button tone="success">Success Tone</Button>
      <Button tone="warning">Warning Tone</Button>
      <Button tone="danger">Danger Tone</Button>
      <Button variant="ghost" tone="brand">Ghost Brand</Button>
      <Button variant="ghost" tone="success">Ghost Success</Button>
      <Button variant="ghost" tone="warning">Ghost Warning</Button>
      <Button variant="ghost" tone="danger">Ghost Danger</Button>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
