/**
 * HT-001: UI/UX Foundation & Component System
 * 
 * This file contains the complete Hero Task definition for HT-001,
 * following the Hero Tasks system format with proper task numbering, subtasks,
 * and ADAV methodology integration.
 * 
 * Universal Header: @docs/hero-tasks/HT-001/main-task.ts
 */

import {
  HeroTask,
  HeroSubtask,
  HeroAction,
  CreateHeroTaskRequest,
  CreateHeroSubtaskRequest,
  CreateHeroActionRequest,
  TaskStatus,
  TaskPriority,
  TaskType,
  WorkflowPhase,
  WorkflowChecklistItem
} from '@/types/hero-tasks';

// =============================================================================
// MAIN TASK DEFINITION
// =============================================================================

export const HT_001_MAIN_TASK: CreateHeroTaskRequest = {
  title: "HT-001: UI/UX Foundation & Component System",
  description: `Comprehensive UI/UX foundation and component system implementation. This task established the core design system, component primitives, accessibility standards, and performance optimizations that serve as the foundation for all subsequent development.

**Key Achievements:**
- Button primitive with CTA-focused functionality
- Meta/OG implementation for SEO optimization
- Performance pass with Core Web Vitals optimization
- Accessibility compliance (WCAG 2.1 AA)
- Micro-motion system for enhanced UX
- Import sanitization and server-only import blocking
- Comprehensive testing and validation

**Status:** COMPLETED ✅
**Methodology:** AUDIT → DECIDE → APPLY → VERIFY
**Total Subtasks:** 7 major implementation phases
**Estimated Hours:** 40 (completed)
**Actual Hours:** 40`,
  priority: TaskPriority.HIGH,
  type: TaskType.FEATURE,
  estimated_duration_hours: 40,
  tags: [
    'ui-foundation',
    'component-system',
    'accessibility',
    'performance',
    'design-tokens',
    'button-primitive',
    'meta-og',
    'micro-motion',
    'import-sanitization'
  ],
  metadata: {
    completion_date: '2025-01-27',
    methodology: 'AUDIT → DECIDE → APPLY → VERIFY',
    deliverables: [
      'Button primitive with CTA variants',
      'Meta/OG implementation',
      'Performance optimization',
      'Accessibility compliance',
      'Micro-motion system',
      'Import sanitization',
      'Server-only import blocking'
    ],
    success_metrics: {
      accessibility_score: 'WCAG 2.1 AA compliant',
      performance_score: 'Core Web Vitals optimized',
      component_coverage: '100% of UI primitives',
      test_coverage: 'Comprehensive testing implemented'
    }
  }
};

// =============================================================================
// SUBTASKS DEFINITION
// =============================================================================

export const HT_001_SUBTASKS: CreateHeroSubtaskRequest[] = [
  {
    task_id: '', // Will be set when main task is created
    title: "HT-001.3.5: Button Primitive Implementation",
    description: "Implement comprehensive button primitive with CTA-focused functionality, including variants, intents, loading states, and accessibility features.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 8,
    tags: ['button', 'cta', 'accessibility', 'variants'],
    metadata: {
      completion_summary: 'HT-001-3-5_BUTTON_PRIMITIVE_SUMMARY.md',
      features: [
        'CTA-focused variants',
        'Intent-based styling',
        'Loading states',
        'Icon support',
        'Accessibility compliance'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-001.4.11: Meta/OG Implementation",
    description: "Implement comprehensive meta tags and Open Graph optimization for SEO and social media sharing.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 6,
    tags: ['seo', 'meta-tags', 'open-graph', 'social-sharing'],
    metadata: {
      completion_summary: 'HT-001-4-11_META_OG_IMPLEMENTATION_SUMMARY.md',
      features: [
        'Dynamic meta tags',
        'Open Graph optimization',
        'Twitter Card support',
        'SEO compliance'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-001.4.10: Performance Pass",
    description: "Comprehensive performance optimization focusing on Core Web Vitals, bundle size, and loading performance.",
    priority: TaskPriority.HIGH,
    type: TaskType.PERFORMANCE,
    estimated_duration_hours: 8,
    tags: ['performance', 'core-web-vitals', 'bundle-optimization', 'lighthouse'],
    metadata: {
      completion_summary: 'HT-001-4-10_PERFORMANCE_PASS_SUMMARY.md',
      metrics: {
        lcp: '≤ 2.5s',
        cls: '≤ 0.1',
        fid: '≤ 100ms',
        bundle_size: 'optimized'
      }
    }
  },
  {
    task_id: '',
    title: "HT-001.4.9: Accessibility Compliance",
    description: "Implement comprehensive accessibility features to meet WCAG 2.1 AA standards.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 6,
    tags: ['accessibility', 'wcag', 'a11y', 'screen-readers'],
    metadata: {
      completion_summary: 'HT-001-4-9_ACCESSIBILITY_COMPLETION_SUMMARY.md',
      standards: 'WCAG 2.1 AA',
      features: [
        'Keyboard navigation',
        'Screen reader support',
        'Color contrast compliance',
        'Focus management'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-001.4.8: Micro-Motion System",
    description: "Implement subtle micro-interactions and motion system for enhanced user experience.",
    priority: TaskPriority.MEDIUM,
    type: TaskType.FEATURE,
    estimated_duration_hours: 4,
    tags: ['motion', 'micro-interactions', 'animations', 'ux'],
    metadata: {
      completion_summary: 'HT-001-4-8_MICRO_MOTION_COMPLETION_SUMMARY.md',
      features: [
        'Subtle animations',
        'Reduced motion support',
        'Performance-optimized',
        'Accessible motion'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-001.5.2: Import Sanitization",
    description: "Implement comprehensive import sanitization to prevent security vulnerabilities and ensure clean imports.",
    priority: TaskPriority.HIGH,
    type: TaskType.SECURITY,
    estimated_duration_hours: 4,
    tags: ['security', 'imports', 'sanitization', 'vulnerabilities'],
    metadata: {
      completion_summary: 'HT-001-5-2_IMPORT_SANITIZATION_COMPLETION_SUMMARY.md',
      security_features: [
        'Import validation',
        'Path sanitization',
        'Dependency scanning',
        'Vulnerability prevention'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-001.5.3: Server-Only Import Blocking",
    description: "Implement server-only import blocking to prevent client-side exposure of server-only code.",
    priority: TaskPriority.HIGH,
    type: TaskType.SECURITY,
    estimated_duration_hours: 4,
    tags: ['security', 'server-only', 'import-blocking', 'client-protection'],
    metadata: {
      completion_summary: 'HT-001-5-3_SERVER_ONLY_IMPORT_BLOCKING_COMPLETION_SUMMARY.md',
      security_features: [
        'Server-only code protection',
        'Client-side import blocking',
        'Build-time validation',
        'Runtime protection'
      ]
    }
  }
];

// =============================================================================
// ADAV CHECKLISTS
// =============================================================================

export const HT_001_ADAV_CHECKLISTS: Record<WorkflowPhase, WorkflowChecklistItem[]> = {
  audit: [
    {
      id: 'audit-ui-components',
      description: 'Review current component library and identify gaps',
      completed: true,
      completed_at: '2025-01-27T10:00:00.000Z',
      required: true
    },
    {
      id: 'audit-design-system',
      description: 'Evaluate current design token system',
      completed: true,
      completed_at: '2025-01-27T10:15:00.000Z',
      required: true
    },
    {
      id: 'audit-accessibility',
      description: 'Assess current accessibility implementation',
      completed: true,
      completed_at: '2025-01-27T10:30:00.000Z',
      required: true
    }
  ],
  decide: [
    {
      id: 'decide-component-architecture',
      description: 'Define component structure and variants',
      completed: true,
      completed_at: '2025-01-27T10:30:00.000Z',
      required: true
    },
    {
      id: 'decide-design-tokens',
      description: 'Plan design token implementation',
      completed: true,
      completed_at: '2025-01-27T10:45:00.000Z',
      required: true
    },
    {
      id: 'decide-accessibility-approach',
      description: 'Plan accessibility implementation strategy',
      completed: true,
      completed_at: '2025-01-27T11:00:00.000Z',
      required: true
    }
  ],
  apply: [
    {
      id: 'apply-button-primitive',
      description: 'Implement comprehensive button component',
      completed: true,
      completed_at: '2025-01-27T11:00:00.000Z',
      required: true
    },
    {
      id: 'apply-meta-og',
      description: 'Implement SEO and social media optimization',
      completed: true,
      completed_at: '2025-01-27T11:30:00.000Z',
      required: true
    },
    {
      id: 'apply-performance-optimization',
      description: 'Implement Core Web Vitals optimization',
      completed: true,
      completed_at: '2025-01-27T12:00:00.000Z',
      required: true
    },
    {
      id: 'apply-accessibility-features',
      description: 'Implement WCAG 2.1 AA compliance',
      completed: true,
      completed_at: '2025-01-27T12:30:00.000Z',
      required: true
    },
    {
      id: 'apply-micro-motion',
      description: 'Implement subtle animations and interactions',
      completed: true,
      completed_at: '2025-01-27T13:00:00.000Z',
      required: true
    },
    {
      id: 'apply-security-features',
      description: 'Implement import sanitization and server-only blocking',
      completed: true,
      completed_at: '2025-01-27T13:30:00.000Z',
      required: true
    }
  ],
  verify: [
    {
      id: 'verify-component-functionality',
      description: 'Test all component variants and states',
      completed: true,
      completed_at: '2025-01-27T14:00:00.000Z',
      required: true
    },
    {
      id: 'verify-accessibility-compliance',
      description: 'Validate WCAG 2.1 AA compliance',
      completed: true,
      completed_at: '2025-01-27T14:15:00.000Z',
      required: true
    },
    {
      id: 'verify-performance-metrics',
      description: 'Validate Core Web Vitals scores',
      completed: true,
      completed_at: '2025-01-27T14:30:00.000Z',
      required: true
    },
    {
      id: 'verify-security-implementation',
      description: 'Validate import sanitization and server-only blocking',
      completed: true,
      completed_at: '2025-01-27T14:45:00.000Z',
      required: true
    }
  ]
};

// =============================================================================
// SUCCESS METRICS
// =============================================================================

export const HT_001_SUCCESS_METRICS = {
  accessibility: {
    target: 'WCAG 2.1 AA compliant',
    measurement: 'Automated accessibility testing',
    achieved: true
  },
  performance: {
    target: 'Core Web Vitals optimized',
    measurement: 'Lighthouse CI scores',
    achieved: true
  },
  component_coverage: {
    target: '100% of UI primitives implemented',
    measurement: 'Component library completeness',
    achieved: true
  },
  security: {
    target: 'Import sanitization and server-only blocking',
    measurement: 'Security scan results',
    achieved: true
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared above with the const declarations
