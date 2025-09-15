/**
 * @fileoverview HT-022.2.4: Agency Theme Switcher Component Stories
 * @module components/ui/atomic/theming
 * @author Agency Component System
 * @version 1.0.0
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ThemeSwitcher } from './theme-switcher';
import { SimpleThemeProvider } from './simple-theme-provider';

const meta: Meta<typeof ThemeSwitcher> = {
  title: 'Agency/Theming/ThemeSwitcher',
  component: ThemeSwitcher,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Theme switcher component for client theming system. Allows runtime theme switching with preview capabilities.'
      }
    }
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SimpleThemeProvider>
        <Story />
      </SimpleThemeProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Basic Theme Switcher
export const Default: Story = {};

export const WithCustomization: Story = {
  args: {
    showCustomization: true
  }
};

// Interactive Demo
export const InteractiveDemo: Story = {
  render: () => (
    <div className="space-y-6 w-full max-w-md">
      <ThemeSwitcher showCustomization={true} />

      <div className="p-4 border rounded-lg space-y-3">
        <h3 className="font-semibold">Preview Area</h3>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded">
            Primary Button
          </button>
          <button className="px-4 py-2 border border-primary text-primary rounded">
            Secondary
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          This content reflects the current theme selection above.
        </p>
      </div>
    </div>
  )
};