import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
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
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'],
    },
    size: {
      control: { type: 'select' },
      options: ['default', 'sm', 'lg', 'icon'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'Secondary',
  },
};

export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'Destructive',
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
    children: 'Outline',
  },
};

export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: 'Ghost',
  },
};

export const Link: Story = {
  args: {
    variant: 'link',
    children: 'Link',
  },
};

export const Small: Story = {
  args: {
    size: 'sm',
    children: 'Small',
  },
};

export const Large: Story = {
  args: {
    size: 'lg',
    children: 'Large',
  },
};

export const Icon: Story = {
  args: {
    size: 'icon',
    children: '🔍',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    children: 'Disabled',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Button with Icon',
  },
  render: (args: any) => (
    <Button {...args}>
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mr-2 h-4 w-4"
      >
        <path
          d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.82034 3.71447 9.82476C3.15895 10.8196 3.31803 12.0806 4.37868 12.9442C4.38845 12.9525 4.39844 12.9609 4.40864 12.9692C4.47187 13.0274 4.54553 13.0841 4.62939 13.1378C4.74304 13.2071 4.87695 13.2713 5.02956 13.3258C5.33447 13.4277 5.71729 13.5 6.125 13.5C6.53271 13.5 6.91553 13.4277 7.22044 13.3258C7.37305 13.2713 7.50696 13.2071 7.62061 13.1378C7.70447 13.0841 7.77813 13.0274 7.84136 12.9692C7.85156 12.9609 7.86155 12.9525 7.87132 12.9442C8.93197 12.0806 9.09105 10.8196 8.53553 9.82476C7.97443 8.82034 6.9503 8.12901 5.75627 7.98351C7.26876 7.54738 8.375 6.15288 8.375 4.5C8.375 2.49797 6.75203 0.875 4.75 0.875H7.5ZM7.5 1.875C6.15203 1.875 5.125 2.90203 5.125 4.25C5.125 5.59797 6.15203 6.625 7.5 6.625C8.84797 6.625 9.875 5.59797 9.875 4.25C9.875 2.90203 8.84797 1.875 7.5 1.875Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
      {args.children}
    </Button>
  ),
};
