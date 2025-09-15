/**
 * @fileoverview HT-022.2.4: Agency Input Component Stories
 * @module components/ui/atomic/atoms
 * @author Agency Component System
 * @version 1.0.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '../../input';
import { Search, Mail, User, Lock } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'Agency/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Agency Input component with validation states, icons, and accessibility features. Supports client theming and rapid customization.'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'error', 'success', 'warning']
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'default', 'lg']
    },
    iconPosition: {
      control: { type: 'select' },
      options: ['left', 'right']
    }
  }
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Input Stories
export const Default: Story = {
  args: {
    placeholder: 'Enter text...'
  }
};

export const WithLabel: Story = {
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email'
  }
};

export const WithHelper: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    helper: 'Must be at least 8 characters long'
  }
};

// Validation States
export const ErrorState: Story = {
  args: {
    label: 'Email Address',
    type: 'email',
    placeholder: 'Enter your email',
    error: 'Please enter a valid email address'
  }
};

export const SuccessState: Story = {
  args: {
    label: 'Username',
    placeholder: 'Enter username',
    success: 'Username is available!'
  }
};

export const WarningState: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter password',
    warning: 'Password strength: Medium'
  }
};

// Icon Examples
export const WithLeftIcon: Story = {
  args: {
    label: 'Search',
    placeholder: 'Search...',
    icon: <Search className="h-4 w-4" />,
    iconPosition: 'left'
  }
};

export const WithRightIcon: Story = {
  args: {
    label: 'Email',
    type: 'email',
    placeholder: 'Enter your email',
    icon: <Mail className="h-4 w-4" />,
    iconPosition: 'right'
  }
};

// Size Variations
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input size="sm" placeholder="Small input" label="Small" />
      <Input size="default" placeholder="Default input" label="Default" />
      <Input size="lg" placeholder="Large input" label="Large" />
    </div>
  )
};

// Form Examples
export const LoginForm: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input
        label="Email"
        type="email"
        placeholder="Enter your email"
        icon={<Mail className="h-4 w-4" />}
        iconPosition="left"
      />
      <Input
        label="Password"
        type="password"
        placeholder="Enter your password"
        icon={<Lock className="h-4 w-4" />}
        iconPosition="left"
      />
    </div>
  )
};

export const ProfileForm: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input
        label="Full Name"
        placeholder="Enter your full name"
        icon={<User className="h-4 w-4" />}
        iconPosition="left"
      />
      <Input
        label="Email Address"
        type="email"
        placeholder="Enter your email"
        helper="We'll never share your email address"
        icon={<Mail className="h-4 w-4" />}
        iconPosition="left"
      />
      <Input
        label="Phone Number"
        type="tel"
        placeholder="+1 (555) 123-4567"
        helper="Optional: For account recovery"
      />
    </div>
  )
};

// Disabled State
export const Disabled: Story = {
  args: {
    label: 'Disabled Input',
    placeholder: 'This input is disabled',
    disabled: true
  }
};

// Input Types
export const InputTypes: Story = {
  render: () => (
    <div className="space-y-4 w-full max-w-sm">
      <Input label="Text" type="text" placeholder="Text input" />
      <Input label="Email" type="email" placeholder="Email input" />
      <Input label="Password" type="password" placeholder="Password input" />
      <Input label="Number" type="number" placeholder="Number input" />
      <Input label="URL" type="url" placeholder="URL input" />
      <Input label="Search" type="search" placeholder="Search input" />
      <Input label="Tel" type="tel" placeholder="Phone input" />
    </div>
  )
};

// Complex Example
export const ComplexExample: Story = {
  args: {
    label: 'Company Email',
    type: 'email',
    placeholder: 'your.name@company.com',
    helper: 'Use your work email for business accounts',
    icon: <Mail className="h-4 w-4" />,
    iconPosition: 'left',
    size: 'lg'
  }
};