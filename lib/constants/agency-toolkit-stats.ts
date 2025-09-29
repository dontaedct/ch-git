/**
 * @fileoverview Centralized Agency Toolkit Statistics
 * Single source of truth for all agency toolkit module statistics
 * This ensures consistency across the main dashboard and all sub-pages
 */

export const AGENCY_TOOLKIT_STATS = {
  templates: {
    total: 8,
    description: "8 custom micro-app templates for rapid deployment with template builder and marketplace",
    items: [
      'CRM Dashboard',
      'E-Commerce Store',
      'Business Portfolio',
      'Lead Capture Landing',
      'Service Business Hub',
      'Analytics Dashboard',
      'Restaurant Ordering',
      'Corporate Website'
    ]
  },

  forms: {
    templates: 6,
    fieldTypes: 11,
    description: "Advanced form builder with 6 templates and 11 field types including validation and analytics",
    fieldTypesList: [
      'text', 'email', 'number', 'select', 'checkbox',
      'textarea', 'date', 'file', 'rating', 'table', 'signature'
    ],
    categories: ['Core', 'Selection', 'Advanced']
  },

  components: {
    total: 8,
    atoms: 3,
    molecules: 3,
    organisms: 2,
    description: "Interactive showcase of agency toolkit components with live examples and code snippets",
    breakdown: {
      atoms: ['Button', 'Input Field', 'Badge'],
      molecules: ['Card', 'Form Group', 'Navigation Item'],
      organisms: ['Header', 'Data Table']
    }
  },

  theming: {
    presetThemes: 3,
    activeThemes: 1,
    description: "Apply client brand with logo upload, color schemes, and theme configuration",
    features: [
      'Color Palette Customization',
      'Typography Controls',
      'Spacing & Layout',
      'Accessibility Validation',
      'Live Preview',
      'CSS Export'
    ]
  },

  analytics: {
    description: "Comprehensive analytics dashboard with performance metrics and user insights",
    metrics: [
      'Productivity Score',
      'Performance Metrics',
      'Build Time',
      'Test Coverage',
      'Deployment Frequency'
    ]
  },

  documents: {
    description: "PDF document generation system with templates and automated delivery",
    features: [
      'Template-based Generation',
      'Email Delivery',
      'Version Control',
      'Custom Formatting',
      'Automated Workflows'
    ]
  },

  integrations: {
    description: "Connect with external services, APIs, and third-party integrations",
    features: [
      'Marketplace',
      'Custom Integrations',
      'OAuth Support',
      'Webhook Management',
      'API Analytics'
    ]
  },

  monitoring: {
    description: "Real-time system monitoring, health checks, and performance tracking",
    metrics: [
      'API Response Time',
      'Database Performance',
      'CDN Latency',
      'Error Rates',
      'Resource Usage'
    ]
  },

  webhooks: {
    description: "Configure webhooks, event triggers, and automated notifications",
    features: [
      'Event Management',
      'Delivery Tracking',
      'Retry Logic',
      'Security Controls',
      'Testing Tools'
    ]
  }
} as const;

// Helper functions for dynamic stats
export const getTemplateCount = () => AGENCY_TOOLKIT_STATS.templates.total;
export const getFormTemplateCount = () => AGENCY_TOOLKIT_STATS.forms.templates;
export const getFormFieldTypeCount = () => AGENCY_TOOLKIT_STATS.forms.fieldTypes;
export const getComponentCount = () => AGENCY_TOOLKIT_STATS.components.total;
export const getComponentBreakdown = () => ({
  atoms: AGENCY_TOOLKIT_STATS.components.atoms,
  molecules: AGENCY_TOOLKIT_STATS.components.molecules,
  organisms: AGENCY_TOOLKIT_STATS.components.organisms
});