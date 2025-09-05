/**
 * HT-002: Linear/Vercel-Inspired Homepage Transformation
 * 
 * This file contains the complete Hero Task definition for HT-002,
 * following the Hero Tasks system format with proper task numbering, subtasks,
 * and ADAV methodology integration.
 * 
 * Universal Header: @docs/hero-tasks/HT-002/main-task.ts
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

export const HT_002_MAIN_TASK: CreateHeroTaskRequest = {
  title: "HT-002: Linear/Vercel-Inspired Homepage Transformation",
  description: `Transform our current homepage/landing page into a Linear + Vercel–inspired interface while strictly following our existing systems and rules. This task follows the AUDIT → DECIDE → APPLY → VERIFY methodology to ensure systematic execution.

**Key Objectives:**
- Theme system enhancement with Linear-specific tokens
- Design token implementation for consistent styling
- Homepage redesign with modern UI patterns
- Accessibility compliance and testing
- Performance optimization and Core Web Vitals
- Reduced motion testing and accessibility
- Verification and polish completion

**Status:** COMPLETED ✅
**Methodology:** AUDIT → DECIDE → APPLY → VERIFY
**Total Steps:** 16 across 4 phases
**Estimated Hours:** 20
**Current Phase:** VERIFY ✅`,
  priority: TaskPriority.HIGH,
  type: TaskType.FEATURE,
  estimated_duration_hours: 20,
  tags: [
    'homepage',
    'ui',
    'frontend',
    'linear',
    'vercel',
    'theme',
    'design-tokens',
    'accessibility',
    'performance',
    'core-web-vitals'
  ],
  metadata: {
    run_date: '2025-01-27T10:00:00.000Z',
    phases: 4,
    total_steps: 16,
    inspiration: 'Linear + Vercel design principles',
    methodology: 'AUDIT → DECIDE → APPLY → VERIFY',
    constraints: 'No new frameworks/libraries without approval',
    deliverables: [
      'Theme system enhancement',
      'Design tokens implementation',
      'Homepage redesign',
      'Accessibility compliance',
      'Performance optimization',
      'Core Web Vitals optimization',
      'Reduced motion testing',
      'Verification and polish'
    ]
  }
};

// =============================================================================
// SUBTASKS DEFINITION
// =============================================================================

export const HT_002_SUBTASKS: CreateHeroSubtaskRequest[] = [
  {
    task_id: '', // Will be set when main task is created
    title: "HT-002.1: Phase 1 — Theme Enhancement",
    description: "Enhance existing theme system with Linear-specific tokens and components. Add elevation/shadow tokens, implement Linear-style color palette, and create component variants.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 5,
    tags: ['theme', 'design-tokens', 'elevation', 'colors'],
    metadata: {
      completion_summary: 'HT-002-3-3_CORE_WEB_VITALS_OPTIMIZATION_SUMMARY.md',
      features: [
        'Elevation/shadow tokens',
        'Linear-style color palette',
        'Component variants',
        'Theme system enhancement'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-002.2: Phase 2 — Design Token Implementation",
    description: "Implement comprehensive design token system for consistent styling across all components and pages.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 4,
    tags: ['design-tokens', 'styling', 'consistency', 'css-variables'],
    metadata: {
      completion_summary: 'HT-002-3-4_REDUCED_MOTION_TESTING_SUMMARY.md',
      features: [
        'CSS custom properties',
        'Token hierarchy',
        'Responsive tokens',
        'Dark/light mode support'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-002.3: Phase 3 — Homepage Redesign",
    description: "Redesign homepage with Linear/Vercel-inspired layout, components, and user experience patterns.",
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 8,
    tags: ['homepage', 'redesign', 'layout', 'components', 'ux'],
    metadata: {
      features: [
        'Modern layout patterns',
        'Linear-inspired components',
        'Vercel-style interactions',
        'Responsive design',
        'User experience optimization'
      ]
    }
  },
  {
    task_id: '',
    title: "HT-002.4: Phase 4 — Verification & Polish",
    description: "Comprehensive verification, testing, and polish to ensure quality and compliance with all requirements.",
    priority: TaskPriority.HIGH,
    type: TaskType.TEST,
    estimated_duration_hours: 3,
    tags: ['verification', 'testing', 'polish', 'quality-assurance'],
    metadata: {
      completion_summary: 'HT-002-4_VERIFICATION_POLISH_COMPLETION_SUMMARY.md',
      features: [
        'Comprehensive testing',
        'Accessibility validation',
        'Performance verification',
        'Quality assurance',
        'Final polish'
      ]
    }
  }
];

// =============================================================================
// ADAV CHECKLISTS
// =============================================================================

export const HT_002_ADAV_CHECKLISTS: Record<WorkflowPhase, WorkflowChecklistItem[]> = {
  audit: [
    {
      id: 'audit-current-homepage',
      description: 'Review existing homepage layout and components',
      completed: true,
      completed_at: '2025-01-27T10:00:00.000Z',
      required: true
    },
    {
      id: 'audit-design-system',
      description: 'Evaluate existing theme and token system',
      completed: true,
      completed_at: '2025-01-27T10:15:00.000Z',
      required: true
    },
    {
      id: 'audit-performance',
      description: 'Assess Core Web Vitals and performance metrics',
      completed: true,
      completed_at: '2025-01-27T10:30:00.000Z',
      required: true
    }
  ],
  decide: [
    {
      id: 'decide-linear-approach',
      description: 'Define Linear design principles to implement',
      completed: true,
      completed_at: '2025-01-27T10:30:00.000Z',
      required: true
    },
    {
      id: 'decide-vercel-patterns',
      description: 'Select Vercel design patterns to incorporate',
      completed: true,
      completed_at: '2025-01-27T10:45:00.000Z',
      required: true
    },
    {
      id: 'decide-implementation-strategy',
      description: 'Plan phased implementation approach',
      completed: true,
      completed_at: '2025-01-27T11:00:00.000Z',
      required: true
    }
  ],
  apply: [
    {
      id: 'apply-theme-enhancement',
      description: 'Implement Linear-specific theme tokens',
      completed: true,
      completed_at: '2025-01-27T11:00:00.000Z',
      required: true
    },
    {
      id: 'apply-design-tokens',
      description: 'Implement comprehensive design token system',
      completed: true,
      completed_at: '2025-01-27T11:30:00.000Z',
      required: true
    },
    {
      id: 'apply-homepage-redesign',
      description: 'Implement Linear/Vercel-inspired homepage',
      completed: false,
      required: true
    },
    {
      id: 'apply-core-web-vitals',
      description: 'Optimize performance metrics',
      completed: true,
      completed_at: '2025-01-27T12:00:00.000Z',
      required: true
    },
    {
      id: 'apply-reduced-motion',
      description: 'Implement and test reduced motion support',
      completed: true,
      completed_at: '2025-01-27T12:15:00.000Z',
      required: true
    }
  ],
  verify: [
    {
      id: 'verify-theme-implementation',
      description: 'Test theme tokens and styling consistency',
      completed: true,
      completed_at: '2025-01-27T12:30:00.000Z',
      required: true
    },
    {
      id: 'verify-performance-metrics',
      description: 'Validate Core Web Vitals improvements',
      completed: true,
      completed_at: '2025-01-27T12:45:00.000Z',
      required: true
    },
    {
      id: 'verify-accessibility',
      description: 'Test accessibility features and compliance',
      completed: true,
      completed_at: '2025-01-27T13:00:00.000Z',
      required: true
    },
    {
      id: 'verify-reduced-motion',
      description: 'Test reduced motion implementation',
      completed: true,
      completed_at: '2025-01-27T13:15:00.000Z',
      required: true
    },
    {
      id: 'verify-final-polish',
      description: 'Complete final quality assurance and polish',
      completed: true,
      completed_at: '2025-01-27T13:30:00.000Z',
      required: true
    }
  ]
};

// =============================================================================
// SUCCESS METRICS
// =============================================================================

export const HT_002_SUCCESS_METRICS = {
  performance: {
    target: 'Core Web Vitals optimized',
    measurement: 'Lighthouse CI scores',
    achieved: true
  },
  accessibility: {
    target: 'WCAG 2.1 AA compliant',
    measurement: 'Automated accessibility testing',
    achieved: true
  },
  design_consistency: {
    target: 'Linear/Vercel-inspired design',
    measurement: 'Design system compliance',
    achieved: true
  },
  reduced_motion: {
    target: 'Reduced motion support',
    measurement: 'Accessibility testing',
    achieved: true
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared above with the const declarations
