/**
 * @fileoverview HT-006 Card Component Stories - Visual Regression Testing
 * @module components-sandbox/ui/card.stories
 * @author HT-006 Phase 5 - Visual Regression Safety
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 5 - Visual Regression Safety
 * Purpose: Comprehensive visual testing for Card component variants
 * Safety: Sandbox-isolated, automated baseline capture
 * Status: Phase 5 implementation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from './card';
import { Button } from './button';

const meta: Meta<typeof Card> = {
  title: 'HT-006/Components/Card',
  component: Card,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Token-driven Card component with elevation and padding variants, supporting multiple themes and brands.',
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['default', 'outlined', 'filled'],
      description: 'Visual style variant',
    },
    elevation: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Shadow elevation level',
    },
    padding: {
      control: { type: 'select' },
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding size',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card description goes here</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. This is where the main content of the card would be displayed.</p>
      </CardContent>
      <CardFooter>
        <Button>Action</Button>
      </CardFooter>
    </Card>
  ),
};

// Variant stories
export const Outlined: Story = {
  render: () => (
    <Card variant="outlined">
      <CardHeader>
        <CardTitle>Outlined Card</CardTitle>
        <CardDescription>This card has an outlined style</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The outlined variant uses a transparent background with a visible border.</p>
      </CardContent>
    </Card>
  ),
};

export const Filled: Story = {
  render: () => (
    <Card variant="filled">
      <CardHeader>
        <CardTitle>Filled Card</CardTitle>
        <CardDescription>This card has a filled background</CardDescription>
      </CardHeader>
      <CardContent>
        <p>The filled variant uses a muted background color for emphasis.</p>
      </CardContent>
    </Card>
  ),
};

// Elevation stories
export const NoElevation: Story = {
  render: () => (
    <Card elevation="none">
      <CardHeader>
        <CardTitle>No Elevation</CardTitle>
        <CardDescription>This card has no shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Flat design with no shadow elevation.</p>
      </CardContent>
    </Card>
  ),
};

export const SmallElevation: Story = {
  render: () => (
    <Card elevation="sm">
      <CardHeader>
        <CardTitle>Small Elevation</CardTitle>
        <CardDescription>This card has a small shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Subtle shadow for gentle elevation.</p>
      </CardContent>
    </Card>
  ),
};

export const MediumElevation: Story = {
  render: () => (
    <Card elevation="md">
      <CardHeader>
        <CardTitle>Medium Elevation</CardTitle>
        <CardDescription>This card has a medium shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Moderate shadow for clear elevation.</p>
      </CardContent>
    </Card>
  ),
};

export const LargeElevation: Story = {
  render: () => (
    <Card elevation="lg">
      <CardHeader>
        <CardTitle>Large Elevation</CardTitle>
        <CardDescription>This card has a large shadow</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Prominent shadow for strong elevation.</p>
      </CardContent>
    </Card>
  ),
};

// Padding stories
export const NoPadding: Story = {
  render: () => (
    <Card padding="none">
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">No Padding</h3>
        <p>This card has no internal padding - content extends to edges.</p>
      </div>
    </Card>
  ),
};

export const SmallPadding: Story = {
  render: () => (
    <Card padding="sm">
      <CardHeader>
        <CardTitle>Small Padding</CardTitle>
        <CardDescription>This card has small internal padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Compact spacing for dense layouts.</p>
      </CardContent>
    </Card>
  ),
};

export const MediumPadding: Story = {
  render: () => (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Medium Padding</CardTitle>
        <CardDescription>This card has medium internal padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Balanced spacing for comfortable reading.</p>
      </CardContent>
    </Card>
  ),
};

export const LargePadding: Story = {
  render: () => (
    <Card padding="lg">
      <CardHeader>
        <CardTitle>Large Padding</CardTitle>
        <CardDescription>This card has large internal padding</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Generous spacing for spacious layouts.</p>
      </CardContent>
    </Card>
  ),
};

// Complex combinations
export const OutlinedLargeElevation: Story = {
  render: () => (
    <Card variant="outlined" elevation="lg">
      <CardHeader>
        <CardTitle>Outlined + Large Elevation</CardTitle>
        <CardDescription>Combining outlined variant with large elevation</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This combination creates a floating outlined card effect.</p>
      </CardContent>
    </Card>
  ),
};

export const FilledMediumElevation: Story = {
  render: () => (
    <Card variant="filled" elevation="md">
      <CardHeader>
        <CardTitle>Filled + Medium Elevation</CardTitle>
        <CardDescription>Combining filled variant with medium elevation</CardDescription>
      </CardHeader>
      <CardContent>
        <p>This creates a prominent filled card with good elevation.</p>
      </CardContent>
    </Card>
  ),
};

// Interactive states
export const HoverState: Story = {
  render: () => (
    <Card elevation="sm">
      <CardHeader>
        <CardTitle>Hover Me</CardTitle>
        <CardDescription>This card responds to hover</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Hover over this card to see the elevation change.</p>
      </CardContent>
    </Card>
  ),
  parameters: {
    pseudo: {
      hover: true,
    },
  },
};

// Content variations
export const WithImage: Story = {
  render: () => (
    <Card>
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg" />
      <CardHeader>
        <CardTitle>Card with Image</CardTitle>
        <CardDescription>This card includes a visual element</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Cards can contain various types of content including images, videos, and other media.</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline">Learn More</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithActions: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card with Actions</CardTitle>
        <CardDescription>This card has multiple action buttons</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Cards can include multiple action buttons in the footer for different operations.</p>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Confirm</Button>
      </CardFooter>
    </Card>
  ),
};

export const MinimalCard: Story = {
  render: () => (
    <Card padding="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">Minimal card with just content</p>
      </CardContent>
    </Card>
  ),
};

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-4 max-w-4xl">
      <Card variant="default" elevation="sm">
        <CardHeader>
          <CardTitle>Default</CardTitle>
          <CardDescription>Standard card style</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Default variant with small elevation.</p>
        </CardContent>
      </Card>
      
      <Card variant="outlined" elevation="sm">
        <CardHeader>
          <CardTitle>Outlined</CardTitle>
          <CardDescription>Outlined card style</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Outlined variant with small elevation.</p>
        </CardContent>
      </Card>
      
      <Card variant="filled" elevation="sm">
        <CardHeader>
          <CardTitle>Filled</CardTitle>
          <CardDescription>Filled card style</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Filled variant with small elevation.</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};

// All elevations showcase
export const AllElevations: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-4 max-w-5xl">
      <Card elevation="none">
        <CardHeader>
          <CardTitle>None</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No elevation</p>
        </CardContent>
      </Card>
      
      <Card elevation="sm">
        <CardHeader>
          <CardTitle>Small</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Small elevation</p>
        </CardContent>
      </Card>
      
      <Card elevation="md">
        <CardHeader>
          <CardTitle>Medium</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Medium elevation</p>
        </CardContent>
      </Card>
      
      <Card elevation="lg">
        <CardHeader>
          <CardTitle>Large</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Large elevation</p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    layout: 'padded',
  },
};
