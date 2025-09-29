/**
 * Component Registry System
 *
 * Manages the registration, versioning, and loading of components and form fields
 * used by the manifest renderer. Supports lazy loading, version compatibility,
 * and dynamic component resolution.
 */

import React from 'react';
import { ComponentType as ReactComponentType } from 'react';

export interface ComponentDefinition {
  type: string;
  version: string;
  name: string;
  description: string;
  category: 'layout' | 'content' | 'interactive' | 'data';
  component: ReactComponentType<any> | (() => Promise<ReactComponentType<any>>);
  props: ComponentPropDefinition[];
  dependencies?: string[];
  deprecated?: boolean;
  deprecatedMessage?: string;
  supportedVersions?: string[];
}

export interface FieldComponentDefinition {
  type: string;
  name: string;
  description: string;
  category: 'basic' | 'advanced' | 'layout';
  component: ReactComponentType<any> | (() => Promise<ReactComponentType<any>>);
  validation?: ValidationDefinition;
}

export interface ComponentPropDefinition {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  default?: any;
  description?: string;
  options?: Array<{ label: string; value: any }>;
}

export interface ValidationDefinition {
  required?: boolean;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  custom?: string;
}

class ComponentRegistry {
  private components = new Map<string, ComponentDefinition>();
  private fieldComponents = new Map<string, FieldComponentDefinition>();
  private loadedComponents = new Map<string, ReactComponentType<any>>();
  private loadedFieldComponents = new Map<string, ReactComponentType<any>>();

  constructor() {
    this.loadDefaultComponents();
    this.loadDefaultFieldComponents();
  }

  // Register a component
  registerComponent(definition: ComponentDefinition): void {
    const key = `${definition.type}@${definition.version}`;
    this.components.set(key, definition);

    // Also register without version for latest
    this.components.set(definition.type, definition);

    console.log(`Registered component: ${definition.name} (${key})`);
  }

  // Register a field component
  registerFieldComponent(definition: FieldComponentDefinition): void {
    this.fieldComponents.set(definition.type, definition);
    console.log(`Registered field component: ${definition.name} (${definition.type})`);
  }

  // Get component by type and optional version
  async getComponent(type: string, version?: string): Promise<ReactComponentType<any> | null> {
    const key = version ? `${type}@${version}` : type;
    const cacheKey = key;

    // Check if already loaded
    if (this.loadedComponents.has(cacheKey)) {
      return this.loadedComponents.get(cacheKey)!;
    }

    // Find component definition
    const definition = this.components.get(key);
    if (!definition) {
      console.warn(`Component not found: ${key}`);
      return null;
    }

    // Check if deprecated
    if (definition.deprecated) {
      console.warn(`Component ${key} is deprecated: ${definition.deprecatedMessage}`);
    }

    // Load component
    let component: ReactComponentType<any>;
    if (typeof definition.component === 'function' && definition.component.constructor.name === 'AsyncFunction') {
      // Lazy-loaded component
      component = await (definition.component as () => Promise<ReactComponentType<any>>)();
    } else {
      // Direct component reference
      component = definition.component as ReactComponentType<any>;
    }

    // Cache the loaded component
    this.loadedComponents.set(cacheKey, component);
    return component;
  }

  // Get component synchronously (only works with already loaded components)
  getComponentSync(type: string, version?: string): ReactComponentType<any> | null {
    const key = version ? `${type}@${version}` : type;
    const cacheKey = key;

    // Check if already loaded
    if (this.loadedComponents.has(cacheKey)) {
      return this.loadedComponents.get(cacheKey)!;
    }

    // Find component definition
    const definition = this.components.get(key);
    if (!definition) {
      console.warn(`Component not found: ${key}`);
      return null;
    }

    // Check if deprecated
    if (definition.deprecated) {
      console.warn(`Component ${key} is deprecated: ${definition.deprecatedMessage}`);
    }

    // Only return direct component references (not lazy-loaded)
    if (typeof definition.component === 'function' && definition.component.constructor.name === 'AsyncFunction') {
      console.warn(`Component ${key} is lazy-loaded and not available synchronously`);
      return null;
    }

    // Direct component reference
    const component = definition.component as ReactComponentType<any>;
    
    // Cache the loaded component
    this.loadedComponents.set(cacheKey, component);
    return component;
  }

  // Get field component by type
  async getFieldComponent(type: string): Promise<ReactComponentType<any> | null> {
    // Check if already loaded
    if (this.loadedFieldComponents.has(type)) {
      return this.loadedFieldComponents.get(type)!;
    }

    // Find field component definition
    const definition = this.fieldComponents.get(type);
    if (!definition) {
      console.warn(`Field component not found: ${type}`);
      return null;
    }

    // Load component
    let component: ReactComponentType<any>;
    if (typeof definition.component === 'function' && definition.component.constructor.name === 'AsyncFunction') {
      // Lazy-loaded component
      component = await (definition.component as () => Promise<ReactComponentType<any>>)();
    } else {
      // Direct component reference
      component = definition.component as ReactComponentType<any>;
    }

    // Cache the loaded component
    this.loadedFieldComponents.set(type, component);
    return component;
  }

  // Get all available components
  getAvailableComponents(): ComponentDefinition[] {
    const components: ComponentDefinition[] = [];
    const addedTypes = new Set<string>();

    // Get latest version of each component type
    for (const [key, definition] of this.components.entries()) {
      if (!key.includes('@') && !addedTypes.has(definition.type)) {
        components.push(definition);
        addedTypes.add(definition.type);
      }
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get all available field components
  getAvailableFieldComponents(): FieldComponentDefinition[] {
    return Array.from(this.fieldComponents.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  // Get components by category
  getComponentsByCategory(category: ComponentDefinition['category']): ComponentDefinition[] {
    return this.getAvailableComponents().filter(comp => comp.category === category);
  }

  // Get field components by category
  getFieldComponentsByCategory(category: FieldComponentDefinition['category']): FieldComponentDefinition[] {
    return this.getAvailableFieldComponents().filter(comp => comp.category === category);
  }

  // Check if component exists
  hasComponent(type: string, version?: string): boolean {
    const key = version ? `${type}@${version}` : type;
    return this.components.has(key);
  }

  // Check if field component exists
  hasFieldComponent(type: string): boolean {
    return this.fieldComponents.has(type);
  }

  // Get component definition
  getComponentDefinition(type: string, version?: string): ComponentDefinition | null {
    const key = version ? `${type}@${version}` : type;
    return this.components.get(key) || null;
  }

  // Get field component definition
  getFieldComponentDefinition(type: string): FieldComponentDefinition | null {
    return this.fieldComponents.get(type) || null;
  }

  // Load default components
  private loadDefaultComponents(): void {
    // Hero Section Component
    this.registerComponent({
      type: 'hero',
      version: '1.0.0',
      name: 'Hero Section',
      description: 'Large header section with title, subtitle, and CTA',
      category: 'layout',
      component: () => import('../../components/renderer/HeroSection').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: true, description: 'Main headline' },
        { name: 'subtitle', type: 'string', required: false, description: 'Supporting text' },
        { name: 'ctaText', type: 'string', required: true, description: 'Call-to-action button text' },
        { name: 'ctaUrl', type: 'string', required: true, description: 'Call-to-action URL' },
        { name: 'backgroundImage', type: 'string', required: false, description: 'Background image URL' },
        { name: 'layout', type: 'string', required: false, default: 'centered', options: [
          { label: 'Centered', value: 'centered' },
          { label: 'Left Aligned', value: 'left' },
          { label: 'Split Layout', value: 'split' }
        ]},
        { name: 'height', type: 'string', required: false, default: 'large', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
          { label: 'Full Screen', value: 'fullscreen' }
        ]}
      ]
    });

    // Text Content Component
    this.registerComponent({
      type: 'text',
      version: '1.0.0',
      name: 'Text Content',
      description: 'Rich text content with formatting',
      category: 'content',
      component: () => import('../../components/renderer/TextContent').then(m => m.default),
      props: [
        { name: 'content', type: 'string', required: true, description: 'Text content (HTML supported)' },
        { name: 'alignment', type: 'string', required: false, default: 'left', options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
          { label: 'Justify', value: 'justify' }
        ]},
        { name: 'fontSize', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' },
          { label: 'Extra Large', value: 'xl' }
        ]}
      ]
    });

    // Button Component
    this.registerComponent({
      type: 'button',
      version: '1.0.0',
      name: 'Button',
      description: 'Clickable button with customizable styling',
      category: 'interactive',
      component: () => import('../../components/renderer/Button').then(m => m.default),
      props: [
        { name: 'text', type: 'string', required: true, description: 'Button text' },
        { name: 'url', type: 'string', required: true, description: 'Link URL' },
        { name: 'style', type: 'string', required: false, default: 'primary', options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Outline', value: 'outline' },
          { label: 'Ghost', value: 'ghost' }
        ]},
        { name: 'size', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]},
        { name: 'openInNewTab', type: 'boolean', required: false, default: false }
      ]
    });

    // Image Component
    this.registerComponent({
      type: 'image',
      version: '1.0.0',
      name: 'Image',
      description: 'Responsive image with caption',
      category: 'content',
      component: () => import('../../components/renderer/Image').then(m => m.default),
      props: [
        { name: 'src', type: 'string', required: true, description: 'Image URL' },
        { name: 'alt', type: 'string', required: true, description: 'Alt text for accessibility' },
        { name: 'caption', type: 'string', required: false, description: 'Image caption' },
        { name: 'width', type: 'string', required: false, default: 'full', options: [
          { label: 'Full Width', value: 'full' },
          { label: '75%', value: '75' },
          { label: '50%', value: '50' },
          { label: '25%', value: '25' }
        ]},
        { name: 'alignment', type: 'string', required: false, default: 'center', options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' }
        ]}
      ]
    });

    // Form Component
    this.registerComponent({
      type: 'form',
      version: '1.0.0',
      name: 'Form',
      description: 'Embedded form from form manifest',
      category: 'interactive',
      component: () => import('../../components/renderer/EmbeddedForm').then(m => m.default),
      props: [
        { name: 'formId', type: 'string', required: true, description: 'Form manifest ID' },
        { name: 'title', type: 'string', required: false, description: 'Form title override' },
        { name: 'showTitle', type: 'boolean', required: false, default: true },
        { name: 'layout', type: 'string', required: false, default: 'vertical', options: [
          { label: 'Vertical', value: 'vertical' },
          { label: 'Horizontal', value: 'horizontal' },
          { label: 'Two Column', value: 'two-column' }
        ]}
      ]
    });

    // Section Component
    this.registerComponent({
      type: 'section',
      version: '1.0.0',
      name: 'Section',
      description: 'Container section with background and padding',
      category: 'layout',
      component: () => import('../../components/renderer/Section').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'Section title' },
        { name: 'subtitle', type: 'string', required: false, description: 'Section subtitle' },
        { name: 'content', type: 'string', required: false, description: 'Section content' },
        { name: 'backgroundColor', type: 'string', required: false, description: 'Background color' },
        { name: 'padding', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]}
      ]
    });

    // Header Component
    this.registerComponent({
      type: 'header',
      version: '1.0.0',
      name: 'Header',
      description: 'Navigation header with logo and menu',
      category: 'layout',
      component: () => import('../../components/renderer/Header').then(m => m.default),
      props: [
        { name: 'logo', type: 'string', required: true, description: 'Logo text or image URL' },
        { name: 'navigation', type: 'array', required: false, description: 'Navigation menu items' },
        { name: 'sticky', type: 'boolean', required: false, default: false, description: 'Sticky header' },
        { name: 'background', type: 'string', required: false, default: 'transparent', options: [
          { label: 'Transparent', value: 'transparent' },
          { label: 'Glass', value: 'glass' },
          { label: 'Solid', value: 'solid' }
        ]}
      ]
    });

    // Feature Grid Component
    this.registerComponent({
      type: 'feature_grid',
      version: '1.0.0',
      name: 'Feature Grid',
      description: 'Grid of features with icons and descriptions',
      category: 'content',
      component: () => import('../../components/renderer/FeatureGrid').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'Section title' },
        { name: 'description', type: 'string', required: false, description: 'Section description' },
        { name: 'features', type: 'array', required: true, description: 'Array of feature objects' },
        { name: 'columns', type: 'number', required: false, default: 3, options: [
          { label: '1 Column', value: 1 },
          { label: '2 Columns', value: 2 },
          { label: '3 Columns', value: 3 },
          { label: '4 Columns', value: 4 }
        ]},
        { name: 'layout', type: 'string', required: false, default: 'cards', options: [
          { label: 'Cards', value: 'cards' },
          { label: 'Icons', value: 'icons' },
          { label: 'Text', value: 'text' },
          { label: 'Minimal', value: 'minimal' }
        ]}
      ]
    });

    // CTA Component
    this.registerComponent({
      type: 'cta',
      version: '1.0.0',
      name: 'Call to Action',
      description: 'Call-to-action section with buttons',
      category: 'interactive',
      component: () => import('../../components/renderer/CTA').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'CTA title' },
        { name: 'description', type: 'string', required: false, description: 'CTA description' },
        { name: 'buttons', type: 'array', required: true, description: 'Array of button objects' },
        { name: 'background', type: 'string', required: false, default: 'gradient', options: [
          { label: 'Gradient', value: 'gradient' },
          { label: 'Solid', value: 'solid' },
          { label: 'Transparent', value: 'transparent' }
        ]},
        { name: 'alignment', type: 'string', required: false, default: 'center', options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' }
        ]}
      ]
    });

    // Card Component
    this.registerComponent({
      type: 'card',
      version: '1.0.0',
      name: 'Card',
      description: 'Content card with image, title, and description',
      category: 'content',
      component: () => import('../../components/renderer/Card').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'Card title' },
        { name: 'description', type: 'string', required: false, description: 'Card description' },
        { name: 'image', type: 'string', required: false, description: 'Card image URL' },
        { name: 'link', type: 'string', required: false, description: 'Card link URL' },
        { name: 'style', type: 'string', required: false, default: 'elevated', options: [
          { label: 'Elevated', value: 'elevated' },
          { label: 'Outline', value: 'outline' },
          { label: 'Glass', value: 'glass' },
          { label: 'Minimal', value: 'minimal' }
        ]}
      ]
    });

    // Video Component
    this.registerComponent({
      type: 'video',
      version: '1.0.0',
      name: 'Video',
      description: 'Embedded video player',
      category: 'content',
      component: () => import('../../components/renderer/Video').then(m => m.default),
      props: [
        { name: 'src', type: 'string', required: true, description: 'Video URL' },
        { name: 'poster', type: 'string', required: false, description: 'Video poster image' },
        { name: 'autoplay', type: 'boolean', required: false, default: false, description: 'Auto-play video' },
        { name: 'controls', type: 'boolean', required: false, default: true, description: 'Show video controls' },
        { name: 'loop', type: 'boolean', required: false, default: false, description: 'Loop video' },
        { name: 'muted', type: 'boolean', required: false, default: false, description: 'Mute video' }
      ]
    });

    // Spacer Component
    this.registerComponent({
      type: 'spacer',
      version: '1.0.0',
      name: 'Spacer',
      description: 'Vertical spacing element',
      category: 'layout',
      component: () => import('../../components/renderer/Spacer').then(m => m.default),
      props: [
        { name: 'height', type: 'string', required: false, default: 'medium', options: [
          { label: 'Extra Small', value: 'xs' },
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
          { label: '2X Large', value: '2xl' }
        ]}
      ]
    });

    // Divider Component
    this.registerComponent({
      type: 'divider',
      version: '1.0.0',
      name: 'Divider',
      description: 'Horizontal divider line',
      category: 'layout',
      component: () => import('../../components/renderer/Divider').then(m => m.default),
      props: [
        { name: 'style', type: 'string', required: false, default: 'solid', options: [
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' }
        ]},
        { name: 'thickness', type: 'string', required: false, default: 'medium', options: [
          { label: 'Thin', value: 'thin' },
          { label: 'Medium', value: 'medium' },
          { label: 'Thick', value: 'thick' }
        ]},
        { name: 'color', type: 'string', required: false, description: 'Divider color' }
      ]
    });

    // Testimonial Component
    this.registerComponent({
      type: 'testimonial',
      version: '1.0.0',
      name: 'Testimonial',
      description: 'Customer testimonial with quote and author',
      category: 'content',
      component: () => import('../../components/renderer/Testimonial').then(m => m.default),
      props: [
        { name: 'quote', type: 'string', required: true, description: 'Testimonial quote' },
        { name: 'author', type: 'string', required: true, description: 'Author name' },
        { name: 'title', type: 'string', required: false, description: 'Author title/position' },
        { name: 'company', type: 'string', required: false, description: 'Author company' },
        { name: 'avatar', type: 'string', required: false, description: 'Author avatar image URL' },
        { name: 'rating', type: 'number', required: false, description: 'Star rating (1-5)' },
        { name: 'layout', type: 'string', required: false, default: 'card', options: [
          { label: 'Card', value: 'card' },
          { label: 'Minimal', value: 'minimal' },
          { label: 'Featured', value: 'featured' }
        ]}
      ]
    });

    // Pricing Component
    this.registerComponent({
      type: 'pricing',
      version: '1.0.0',
      name: 'Pricing',
      description: 'Pricing table with plans and features',
      category: 'content',
      component: () => import('../../components/renderer/Pricing').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'Pricing section title' },
        { name: 'description', type: 'string', required: false, description: 'Pricing section description' },
        { name: 'plans', type: 'array', required: true, description: 'Array of pricing plans' },
        { name: 'layout', type: 'string', required: false, default: 'cards', options: [
          { label: 'Cards', value: 'cards' },
          { label: 'Table', value: 'table' },
          { label: 'Minimal', value: 'minimal' }
        ]},
        { name: 'billing', type: 'string', required: false, default: 'monthly', options: [
          { label: 'Monthly', value: 'monthly' },
          { label: 'Yearly', value: 'yearly' },
          { label: 'Toggle', value: 'toggle' }
        ]}
      ]
    });

    // Contact Component
    this.registerComponent({
      type: 'contact',
      version: '1.0.0',
      name: 'Contact',
      description: 'Contact section with form and info',
      category: 'interactive',
      component: () => import('../../components/renderer/Contact').then(m => m.default),
      props: [
        { name: 'title', type: 'string', required: false, description: 'Contact section title' },
        { name: 'description', type: 'string', required: false, description: 'Contact section description' },
        { name: 'formId', type: 'string', required: false, description: 'Form manifest ID' },
        { name: 'contactInfo', type: 'array', required: false, description: 'Contact information items' },
        { name: 'layout', type: 'string', required: false, default: 'split', options: [
          { label: 'Form Only', value: 'form-only' },
          { label: 'Info Only', value: 'info-only' },
          { label: 'Split', value: 'split' }
        ]}
      ]
    });

    // Footer Component
    this.registerComponent({
      type: 'footer',
      version: '1.0.0',
      name: 'Footer',
      description: 'Page footer with links and copyright',
      category: 'layout',
      component: () => import('../../components/renderer/Footer').then(m => m.default),
      props: [
        { name: 'logo', type: 'string', required: false, description: 'Footer logo text or image URL' },
        { name: 'description', type: 'string', required: false, description: 'Footer description' },
        { name: 'links', type: 'array', required: false, description: 'Footer link sections' },
        { name: 'social', type: 'array', required: false, description: 'Social media links' },
        { name: 'copyright', type: 'string', required: false, description: 'Copyright text' },
        { name: 'layout', type: 'string', required: false, default: 'columns', options: [
          { label: 'Columns', value: 'columns' },
          { label: 'Centered', value: 'centered' },
          { label: 'Minimal', value: 'minimal' }
        ]}
      ]
    });

    // Grid Layout Component
    this.registerComponent({
      type: 'grid',
      version: '1.0.0',
      name: 'Grid Layout',
      description: 'CSS Grid container for layout',
      category: 'layout',
      component: () => import('../../components/renderer/GridLayout').then(m => m.default),
      props: [
        { name: 'columns', type: 'number', required: false, default: 2, description: 'Number of columns' },
        { name: 'gap', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]},
        { name: 'responsive', type: 'boolean', required: false, default: true, description: 'Responsive grid' }
      ]
    });

    // Flex Layout Component
    this.registerComponent({
      type: 'flex',
      version: '1.0.0',
      name: 'Flex Layout',
      description: 'Flexbox container for layout',
      category: 'layout',
      component: () => import('../../components/renderer/FlexLayout').then(m => m.default),
      props: [
        { name: 'direction', type: 'string', required: false, default: 'row', options: [
          { label: 'Row', value: 'row' },
          { label: 'Column', value: 'column' },
          { label: 'Row Reverse', value: 'row-reverse' },
          { label: 'Column Reverse', value: 'column-reverse' }
        ]},
        { name: 'justify', type: 'string', required: false, default: 'start', options: [
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' },
          { label: 'Space Between', value: 'space-between' },
          { label: 'Space Around', value: 'space-around' }
        ]},
        { name: 'align', type: 'string', required: false, default: 'stretch', options: [
          { label: 'Stretch', value: 'stretch' },
          { label: 'Start', value: 'start' },
          { label: 'Center', value: 'center' },
          { label: 'End', value: 'end' }
        ]}
      ]
    });

    // Container Component
    this.registerComponent({
      type: 'container',
      version: '1.0.0',
      name: 'Container',
      description: 'Responsive container with max-width',
      category: 'layout',
      component: () => import('../../components/renderer/Container').then(m => m.default),
      props: [
        { name: 'maxWidth', type: 'string', required: false, default: 'lg', options: [
          { label: 'Small', value: 'sm' },
          { label: 'Medium', value: 'md' },
          { label: 'Large', value: 'lg' },
          { label: 'Extra Large', value: 'xl' },
          { label: 'Full', value: 'full' }
        ]},
        { name: 'padding', type: 'string', required: false, default: 'medium', options: [
          { label: 'None', value: 'none' },
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]}
      ]
    });

    // Badge Component
    this.registerComponent({
      type: 'badge',
      version: '1.0.0',
      name: 'Badge',
      description: 'Small status or label badge',
      category: 'content',
      component: () => import('../../components/renderer/Badge').then(m => m.default),
      props: [
        { name: 'text', type: 'string', required: true, description: 'Badge text' },
        { name: 'color', type: 'string', required: false, default: 'primary', options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Secondary', value: 'secondary' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' }
        ]},
        { name: 'size', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]}
      ]
    });

    // Progress Bar Component
    this.registerComponent({
      type: 'progress',
      version: '1.0.0',
      name: 'Progress Bar',
      description: 'Progress indicator bar',
      category: 'content',
      component: () => import('../../components/renderer/ProgressBar').then(m => m.default),
      props: [
        { name: 'value', type: 'number', required: true, description: 'Progress value (0-100)' },
        { name: 'label', type: 'string', required: false, description: 'Progress label' },
        { name: 'color', type: 'string', required: false, default: 'primary', options: [
          { label: 'Primary', value: 'primary' },
          { label: 'Success', value: 'success' },
          { label: 'Warning', value: 'warning' },
          { label: 'Error', value: 'error' }
        ]},
        { name: 'size', type: 'string', required: false, default: 'medium', options: [
          { label: 'Small', value: 'small' },
          { label: 'Medium', value: 'medium' },
          { label: 'Large', value: 'large' }
        ]}
      ]
    });

    // Accordion Component
    this.registerComponent({
      type: 'accordion',
      version: '1.0.0',
      name: 'Accordion',
      description: 'Collapsible content sections',
      category: 'interactive',
      component: () => import('../../components/renderer/Accordion').then(m => m.default),
      props: [
        { name: 'items', type: 'array', required: true, description: 'Array of accordion items' },
        { name: 'allowMultiple', type: 'boolean', required: false, default: false, description: 'Allow multiple open items' },
        { name: 'defaultOpen', type: 'array', required: false, description: 'Default open item indices' }
      ]
    });

    // Tabs Component
    this.registerComponent({
      type: 'tabs',
      version: '1.0.0',
      name: 'Tabs',
      description: 'Tabbed content interface',
      category: 'interactive',
      component: () => import('../../components/renderer/Tabs').then(m => m.default),
      props: [
        { name: 'tabs', type: 'array', required: true, description: 'Array of tab objects' },
        { name: 'defaultTab', type: 'string', required: false, description: 'Default active tab ID' },
        { name: 'style', type: 'string', required: false, default: 'default', options: [
          { label: 'Default', value: 'default' },
          { label: 'Pills', value: 'pills' },
          { label: 'Underline', value: 'underline' }
        ]}
      ]
    });
  }

  // Load default field components
  private loadDefaultFieldComponents(): void {
    // Text Input
    this.registerFieldComponent({
      type: 'text',
      name: 'Text Input',
      description: 'Single-line text input',
      category: 'basic',
      component: () => import('../../components/renderer/fields/TextInput').then(m => m.default),
      validation: {
        minLength: 0,
        maxLength: 1000,
        pattern: '.*'
      }
    });

    // Email Input
    this.registerFieldComponent({
      type: 'email',
      name: 'Email Input',
      description: 'Email address input with validation',
      category: 'basic',
      component: () => import('../../components/renderer/fields/EmailInput').then(m => m.default),
      validation: {
        required: false,
        pattern: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$'
      }
    });

    // Textarea
    this.registerFieldComponent({
      type: 'textarea',
      name: 'Textarea',
      description: 'Multi-line text input',
      category: 'basic',
      component: () => import('../../components/renderer/fields/Textarea').then(m => m.default),
      validation: {
        minLength: 0,
        maxLength: 5000
      }
    });

    // Select Dropdown
    this.registerFieldComponent({
      type: 'select',
      name: 'Select Dropdown',
      description: 'Dropdown selection with options',
      category: 'basic',
      component: () => import('../../components/renderer/fields/Select').then(m => m.default)
    });

    // Radio Buttons
    this.registerFieldComponent({
      type: 'radio',
      name: 'Radio Buttons',
      description: 'Single selection from multiple options',
      category: 'basic',
      component: () => import('../../components/renderer/fields/Radio').then(m => m.default)
    });

    // Checkbox
    this.registerFieldComponent({
      type: 'checkbox',
      name: 'Checkbox',
      description: 'Single checkbox for boolean values',
      category: 'basic',
      component: () => import('../../components/renderer/fields/Checkbox').then(m => m.default)
    });

    // Multi-select
    this.registerFieldComponent({
      type: 'multiselect',
      name: 'Multi-select',
      description: 'Multiple selection from options',
      category: 'advanced',
      component: () => import('../../components/renderer/fields/MultiSelect').then(m => m.default)
    });

    // File Upload
    this.registerFieldComponent({
      type: 'file',
      name: 'File Upload',
      description: 'File upload with type and size restrictions',
      category: 'advanced',
      component: () => import('../../components/renderer/fields/FileUpload').then(m => m.default),
      validation: {
        required: false
      }
    });

    // Number Input
    this.registerFieldComponent({
      type: 'number',
      name: 'Number Input',
      description: 'Numeric input with validation',
      category: 'basic',
      component: () => import('../../components/renderer/fields/NumberInput').then(m => m.default),
      validation: {
        min: Number.MIN_SAFE_INTEGER,
        max: Number.MAX_SAFE_INTEGER
      }
    });

    // Date Input
    this.registerFieldComponent({
      type: 'date',
      name: 'Date Input',
      description: 'Date picker input',
      category: 'advanced',
      component: () => import('../../components/renderer/fields/DateInput').then(m => m.default)
    });

    // Phone Input
    this.registerFieldComponent({
      type: 'tel',
      name: 'Phone Input',
      description: 'Phone number input with formatting',
      category: 'basic',
      component: () => import('../../components/renderer/fields/PhoneInput').then(m => m.default),
      validation: {
        pattern: '^[\\+]?[1-9][\\d]{0,15}$'
      }
    });
  }

  // Batch register components
  registerComponents(definitions: ComponentDefinition[]): void {
    definitions.forEach(def => this.registerComponent(def));
  }

  // Batch register field components
  registerFieldComponents(definitions: FieldComponentDefinition[]): void {
    definitions.forEach(def => this.registerFieldComponent(def));
  }

  // Clear registry (useful for testing)
  clear(): void {
    this.components.clear();
    this.fieldComponents.clear();
    this.loadedComponents.clear();
    this.loadedFieldComponents.clear();
  }

  // Get registry stats
  getStats(): {
    componentCount: number;
    fieldComponentCount: number;
    loadedComponentCount: number;
    loadedFieldComponentCount: number;
  } {
    return {
      componentCount: this.components.size,
      fieldComponentCount: this.fieldComponents.size,
      loadedComponentCount: this.loadedComponents.size,
      loadedFieldComponentCount: this.loadedFieldComponents.size
    };
  }
}

// Global registry instance
let globalRegistry: ComponentRegistry;

export function getComponentRegistry(): ComponentRegistry {
  if (!globalRegistry) {
    globalRegistry = new ComponentRegistry();
  }
  return globalRegistry;
}

// Reset registry (useful for testing)
export function resetComponentRegistry(): void {
  globalRegistry = new ComponentRegistry();
}

export default ComponentRegistry;