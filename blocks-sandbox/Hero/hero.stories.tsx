/**
 * @fileoverview HT-006 Hero Block Stories - Visual Regression Testing
 * @module blocks-sandbox/Hero/hero.stories
 * @author HT-006 Phase 5 - Visual Regression Safety
 * @version 1.0.0
 * 
 * UNIVERSAL HEADER: HT-006 Phase 5 - Visual Regression Safety
 * Purpose: Comprehensive visual testing for Hero block variants
 * Safety: Sandbox-isolated, automated baseline capture
 * Status: Phase 5 implementation
 */

import type { Meta, StoryObj } from '@storybook/react';
import { HeroBlockView } from './view';
import { HeroBlockContent } from './schema';

// Sample content for different scenarios
const defaultContent: HeroBlockContent = {
  id: 'hero-default',
  type: 'hero',
  content: {
    headline: {
      level: 'h1',
      text: 'Build Amazing Products',
      className: ''
    },
    subheading: {
      level: 'h2',
      text: 'With HT-006 Design System',
      className: ''
    },
    description: {
      text: 'Create beautiful, accessible, and scalable user interfaces with our comprehensive token-driven design system.',
      className: ''
    },
    badge: {
      text: 'New Release',
      variant: 'default',
      className: ''
    },
    cta: {
      primary: {
        text: 'Get Started',
        href: '/get-started',
        variant: 'primary',
        size: 'lg',
        external: false,
        className: ''
      },
      secondary: {
        text: 'Learn More',
        href: '/learn-more',
        variant: 'secondary',
        size: 'lg',
        external: false,
        className: ''
      }
    },
    visual: {
      type: 'carousel',
      carousel: {
        slides: [
          {
            id: '1',
            title: 'Feature 1',
            description: 'Amazing feature that will revolutionize your workflow'
          },
          {
            id: '2',
            title: 'Feature 2',
            description: 'Another incredible feature for enhanced productivity'
          },
          {
            id: '3',
            title: 'Feature 3',
            description: 'The final piece of the puzzle for complete success'
          }
        ],
        showDots: true,
        showArrows: true,
        autoPlay: true,
        autoPlayInterval: 5000
      }
    }
  },
  layout: {
    alignment: 'center',
    maxWidth: '6xl',
    padding: 'lg',
    background: 'gradient'
  },
  accessibility: {
    ariaLabel: 'Hero section',
    ariaDescribedBy: 'hero-description'
  },
  seo: {
    title: 'HT-006 Design System - Build Amazing Products',
    description: 'Create beautiful, accessible, and scalable user interfaces with our comprehensive token-driven design system.',
    keywords: ['design system', 'UI components', 'accessibility', 'tokens']
  }
};

const minimalContent: HeroBlockContent = {
  id: 'hero-minimal',
  type: 'hero',
  content: {
    headline: {
      level: 'h1',
      text: 'Simple Hero',
      className: ''
    },
    cta: {
      primary: {
        text: 'Start Now',
        href: '/start',
        variant: 'primary',
        size: 'md',
        external: false,
        className: ''
      }
    }
  },
  layout: {
    alignment: 'left',
    maxWidth: '2xl',
    padding: 'md',
    background: 'none'
  },
  accessibility: {
    ariaLabel: 'Simple hero section'
  },
  seo: {
    title: 'Simple Hero - HT-006',
    description: 'A minimal hero section example'
  }
};

const imageContent: HeroBlockContent = {
  id: 'hero-image',
  type: 'hero',
  content: {
    headline: {
      level: 'h1',
      text: 'Visual Hero',
      className: ''
    },
    description: {
      text: 'This hero includes a visual element to showcase the design system capabilities.',
      className: ''
    },
    cta: {
      primary: {
        text: 'Explore',
        href: '/explore',
        variant: 'primary',
        size: 'lg',
        external: false,
        className: ''
      }
    },
    visual: {
      type: 'image',
      src: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      alt: 'Modern workspace with design tools',
      className: 'rounded-lg shadow-lg'
    }
  },
  layout: {
    alignment: 'center',
    maxWidth: '4xl',
    padding: 'lg',
    background: 'subtle'
  },
  accessibility: {
    ariaLabel: 'Visual hero section'
  },
  seo: {
    title: 'Visual Hero - HT-006 Design System',
    description: 'Hero section with visual elements showcasing design capabilities'
  }
};

const meta: Meta<typeof HeroBlockView> = {
  title: 'HT-006/Blocks/Hero',
  component: HeroBlockView,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Hero block component with comprehensive content support, animations, and accessibility features.',
      },
    },
  },
  argTypes: {
    content: {
      control: false,
      description: 'Hero block content configuration',
    },
    className: {
      control: { type: 'text' },
      description: 'Additional CSS classes',
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {
    content: defaultContent,
  },
};

// Minimal story
export const Minimal: Story = {
  args: {
    content: minimalContent,
  },
};

// With image
export const WithImage: Story = {
  args: {
    content: imageContent,
  },
};

// Left aligned
export const LeftAligned: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        alignment: 'left'
      }
    },
  },
};

// Right aligned
export const RightAligned: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        alignment: 'right'
      }
    },
  },
};

// Different background styles
export const SubtleBackground: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        background: 'subtle'
      }
    },
  },
};

export const PatternBackground: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        background: 'pattern'
      }
    },
  },
};

// Different padding sizes
export const SmallPadding: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        padding: 'sm'
      }
    },
  },
};

export const ExtraLargePadding: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        padding: 'xl'
      }
    },
  },
};

// Different max widths
export const SmallMaxWidth: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        maxWidth: 'sm'
      }
    },
  },
};

export const FullMaxWidth: Story = {
  args: {
    content: {
      ...defaultContent,
      layout: {
        ...defaultContent.layout,
        maxWidth: 'full'
      }
    },
  },
};

// Without secondary CTA
export const SingleCTA: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        cta: {
          primary: defaultContent.content.cta.primary
        }
      }
    },
  },
};

// Without badge
export const NoBadge: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        badge: undefined
      }
    },
  },
};

// Without description
export const NoDescription: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        description: undefined
      }
    },
  },
};

// Without visual
export const NoVisual: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        visual: undefined
      }
    },
  },
};

// Long content
export const LongContent: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        headline: {
          level: 'h1',
          text: 'This is a Very Long Headline That Tests How the Component Handles Extended Text Content',
          className: ''
        },
        description: {
          text: 'This is a much longer description that tests how the hero block handles extended text content. It should wrap properly and maintain good readability while still looking visually appealing. The text should flow naturally and not break the layout or design.',
          className: ''
        }
      }
    },
  },
};

// Short content
export const ShortContent: Story = {
  args: {
    content: {
      ...defaultContent,
      content: {
        ...defaultContent.content,
        headline: {
          level: 'h1',
          text: 'Short',
          className: ''
        },
        description: {
          text: 'Brief.',
          className: ''
        }
      }
    },
  },
};

// All layout combinations showcase
export const LayoutShowcase: Story = {
  render: () => (
    <div className="space-y-32">
      <HeroBlockView 
        content={{
          ...defaultContent,
          layout: { ...defaultContent.layout, alignment: 'left', maxWidth: '2xl' }
        }} 
      />
      <HeroBlockView 
        content={{
          ...defaultContent,
          layout: { ...defaultContent.layout, alignment: 'center', maxWidth: '4xl' }
        }} 
      />
      <HeroBlockView 
        content={{
          ...defaultContent,
          layout: { ...defaultContent.layout, alignment: 'right', maxWidth: '2xl' }
        }} 
      />
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
  },
};
