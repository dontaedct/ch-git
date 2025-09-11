/**
 * @fileoverview HT-008.10.3: Button Component Storybook Story
 * @module components/ui/button.stories.tsx
 * @author OSS Hero System
 * @version 2.0.0
 * 
 * UNIVERSAL HEADER: Hero Tasks System Integration
 * Task: HT-008.10.3 - Comprehensive Design System Documentation
 * Focus: Interactive Button component documentation with all variants and states
 * Methodology: AUDIT → DECIDE → APPLY → VERIFY (strict adherence)
 * Risk Level: HIGH (design system documentation)
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';
import { Download, Plus, Settings, Trash2, User } from 'lucide-react';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants, sizes, and states. Built with accessibility in mind and follows our design system principles.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
      description: 'The visual style variant of the button',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'The size of the button',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'Whether the button is disabled',
    },
    children: {
      control: { type: 'text' },
      description: 'The content inside the button',
    },
    onClick: {
      action: 'clicked',
      description: 'Function called when the button is clicked',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
    size: 'md',
  },
};

// All variants
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All available button variants with their default styling.',
      },
    },
  },
};

// All sizes
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="md">Medium</Button>
      <Button size="lg">Large</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Button sizes from small to large.',
      },
    },
  },
};

// With icons
export const WithIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button>
        <Plus className="mr-2 h-4 w-4" />
        Add Item
      </Button>
      <Button variant="outline">
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      <Button variant="destructive">
        <Trash2 className="mr-2 h-4 w-4" />
        Delete
      </Button>
      <Button variant="ghost">
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons with icons for better visual communication.',
      },
    },
  },
};

// Icon only buttons
export const IconOnly: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button size="sm">
        <Plus className="h-4 w-4" />
      </Button>
      <Button size="md">
        <Settings className="h-4 w-4" />
      </Button>
      <Button size="lg">
        <User className="h-4 w-4" />
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Icon-only buttons for compact interfaces.',
      },
    },
  },
};

// Disabled state
export const Disabled: Story = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled Default</Button>
      <Button variant="destructive" disabled>Disabled Destructive</Button>
      <Button variant="outline" disabled>Disabled Outline</Button>
      <Button variant="secondary" disabled>Disabled Secondary</Button>
      <Button variant="ghost" disabled>Disabled Ghost</Button>
      <Button variant="link" disabled>Disabled Link</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'All button variants in their disabled state.',
      },
    },
  },
};

// Loading state
export const Loading: Story = {
  render: () => (
    <div className="flex gap-4">
      <Button disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Loading...
      </Button>
      <Button variant="outline" disabled>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        Processing
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Buttons in loading state with spinner animations.',
      },
    },
  },
};

// Full width
export const FullWidth: Story = {
  render: () => (
    <div className="w-full max-w-md">
      <Button className="w-full">Full Width Button</Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Full-width button for forms and important actions.',
      },
    },
  },
};

// Button group
export const ButtonGroup: Story = {
  render: () => (
    <div className="flex">
      <Button variant="outline" className="rounded-r-none">
        Previous
      </Button>
      <Button variant="outline" className="rounded-none border-l-0">
        Next
      </Button>
      <Button className="rounded-l-none">
        Submit
      </Button>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Grouped buttons for related actions.',
      },
    },
  },
};

// Accessibility example
export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Keyboard Navigation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Use Tab to navigate between buttons, Enter or Space to activate.
        </p>
        <div className="flex gap-2">
          <Button>First Button</Button>
          <Button>Second Button</Button>
          <Button>Third Button</Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Focus States</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Buttons have clear focus indicators for keyboard navigation.
        </p>
        <Button>Focus Me</Button>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Screen Reader Support</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Buttons have proper ARIA labels and descriptions.
        </p>
        <Button aria-label="Delete user account">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Accessibility features including keyboard navigation, focus states, and screen reader support.',
      },
    },
  },
};

// Interactive playground
export const Playground: Story = {
  args: {
    children: 'Click me!',
    variant: 'default',
    size: 'md',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test different button configurations.',
      },
    },
  },
};