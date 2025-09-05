/**
 * UI Polish Hero Task - Swift-Inspired Aesthetic Implementation
 * 
 * This file contains the complete Hero Task definition for the UI Polish project,
 * following the Hero Tasks system format with proper task numbering, subtasks,
 * and ADAV methodology integration.
 * 
 * Universal Header: @docs/ui-polish-hero-task.ts
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

export const UI_POLISH_MAIN_TASK: CreateHeroTaskRequest = {
  title: "HT-003: UI Polish — Swift-Inspired Aesthetic (Dark-First, flagged)",
  description: `Deliver a refined, enterprise-grade landing experience modeled primarily on runswiftapp.com—hero + product montage, feature chip grid, slider-style demo, testimonials—upgraded to a Dark default with Light/Dark toggle, subtle motion, and strong a11y/perf. All changes extend what already exists.

**Constraints & Guardrails:**
- ADAV is mandatory for each sub-task (AUDIT → DECIDE → APPLY → VERIFY)
- No new frameworks/design systems/build tools without approval
- No duplication of component roles (extend/refactor existing primitives)
- Follow existing naming, routing, linting, and token conventions
- All visible changes behind FEATURE_UI_POLISH_TARGET_STYLE (off by default)
- Off-plan change → REQUIRES APPROVAL with justification + minimal alternative
- Provide precise backout steps for every change

**Success Criteria (measurable):**
- Layout rhythm: standardized via tokens; consistent section paddings and inter-section gaps (±4px)
- Typography: clamp-based scale; H1/H2/H3 distinct; body line-length ~68–78ch
- Theme: Dark default + Light toggle using semantic tokens; ≥AA contrast in both modes
- Components: Buttons/Chips/Cards/Stats/Testimonials expose full state matrix (hover/focus/active/disabled/loading/skeleton)
- Motion: 120–200ms transitions; a single easing; reduced-motion honored
- Perf: Lighthouse desktop (landing) LCP ≤ 2.5s, CLS ≤ 0.02; bundle delta < +30KB GZIP; video/large images deferred
- Zero regressions to functionality; all diffs PR-friendly and reversible

**Feature Flag:** FEATURE_UI_POLISH_TARGET_STYLE (via NEXT_PUBLIC_FEATURE_UI_POLISH_TARGET_STYLE=0)`,
  priority: TaskPriority.HIGH,
  type: TaskType.FEATURE,
  estimated_duration_hours: 40,
  tags: ['ui-polish', 'swift-inspired', 'dark-theme', 'accessibility', 'performance', 'feature-flag'],
  metadata: {
    feature_flag: 'FEATURE_UI_POLISH_TARGET_STYLE',
    inspiration_source: 'runswiftapp.com',
    methodology: 'ADAV',
    success_metrics: {
      lcp_target: '2.5s',
      cls_target: '0.02',
      bundle_delta: '+30KB GZIP',
      contrast_standard: 'AA'
    }
  }
};

// =============================================================================
// SUBTASK DEFINITIONS
// =============================================================================

export const UI_POLISH_SUBTASKS: CreateHeroSubtaskRequest[] = [
  {
    task_id: '', // Will be set when main task is created
    title: "HT-003.1: Feature flag + No-Duplicate Guardrails",
    description: `Reversibility and discipline: extend, don't duplicate.

**Implementation Steps:**
- AUDIT: Locate flag helper/env usage; inventory existing Button/Card/Section/Quote/Footer/Theme utilities
- DECIDE: Extend existing flag util; if absent, add lib/flags.ts:isUiPolishEnabled()
- APPLY: Add .env.example → NEXT_PUBLIC_FEATURE_UI_POLISH_TARGET_STYLE=0. Derive uiPolishOn in layout/landing; annotate modified components: // EXTENDS EXISTING <Component>; DO NOT CREATE PARALLEL VARIANTS
- VERIFY: Flip env 0↔1; UI swaps cleanly; no new duplicate components created

**Acceptance Criteria:** Flag OFF = baseline; Flag ON = polished UI paths; no sibling components of same role.`,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 2,
    tags: ['feature-flag', 'guardrails', 'no-duplicate'],
    metadata: {
      phase: 'foundation',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.2: Dark-First theming with Light/Dark switch (extend tokens)",
    description: `You want Dark default; we must use semantic tokens and existing theme architecture.

**Implementation Steps:**
- AUDIT: Find token source (CSS vars/Tailwind theme/etc.) and any theme provider
- DECIDE: Extend existing semantic tokens: surface, surface-elev, border, text, muted, accent, accent-contrast, ring, shadow
- APPLY: Implement dark values; wire a persisted ThemeToggle (uses existing context/provider if present). Switch visible only when uiPolishOn
- VERIFY: Reload persists selection; both modes maintain AA contrast

**Acceptance Criteria:** Dark as default; toggle works; no inline hex scattered; accent is single-source token.`,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 4,
    tags: ['theming', 'dark-mode', 'semantic-tokens', 'theme-toggle'],
    metadata: {
      phase: 'foundation',
      requires_approval: true,
      approval_reason: 'Adding tokens'
    }
  },
  {
    task_id: '',
    title: "HT-003.3: Section wrapper rhythm (refactor-in-place)",
    description: `Mirror Swift's sectional clarity without new wrapper families.

**Implementation Steps:**
- AUDIT: Identify current section/container primitives
- DECIDE: Add variant="marketing" or spacing props under flag
- APPLY: Standardize py-section, max-w-content, and gap-section; support "bleed" for hero montage (radial fade class)
- VERIFY: Consistent top/bottom paddings and container width across sections

**Acceptance Criteria:** One canonical wrapper; no ad-hoc paddings.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 2,
    tags: ['layout', 'rhythm', 'containers'],
    metadata: {
      phase: 'foundation',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.4: Typographic hierarchy via existing scale",
    description: `Achieve crisp H1/H2/H3 and comfortable body, dark-mode tuned.

**Implementation Steps:**
- AUDIT: Locate type tokens/scale
- DECIDE: Extend scale if needed (flagged); otherwise map components to existing tokens
- APPLY: Clamp sizes for H1/H2/H3; set body line-length ~70ch; tighten display letter-spacing slightly
- VERIFY: No overflow/truncation at 320px width

**Acceptance Criteria:** All headings use tokens; visible hierarchy at all breakpoints.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 3,
    tags: ['typography', 'hierarchy', 'responsive'],
    metadata: {
      phase: 'foundation',
      requires_approval: true,
      approval_reason: 'Only if adding tokens'
    }
  },
  {
    task_id: '',
    title: "HT-003.5: Buttons — extend existing with Swift-style variants & states",
    description: `Primary solid accent + secondary text/ghost; full state matrix.

**Implementation Steps:**
- AUDIT: Review Button.* props/states
- DECIDE: Add/extend variant: 'primary'|'secondary'|'link' and sizes sm|md|lg; ensure loading and aria-busy
- APPLY: Implement hover/active/focus-visible rings via tokens; swap hero/footer CTAs by changing props, not components
- VERIFY: Keyboard focus ring visible; loading announced via aria-live

**Acceptance Criteria:** No new Button file; only variant/prop diffs.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 3,
    tags: ['buttons', 'variants', 'accessibility'],
    metadata: {
      phase: 'components',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.6: Feature \"Chip\" grid (reuse/extend existing Badge/Pill/Card)",
    description: `Swift's feature cloud uses rounded pills with subtle elevation.

**Implementation Steps:**
- AUDIT: Find Badge/Pill/Tag or small Card primitive
- DECIDE: Extend existing primitive with chip style
- APPLY: Build responsive grid (wrap, gap tokens); states: hover lift (1–2px), focus-visible ring
- VERIFY: No CLS on hover; readable in dark/light

**Acceptance Criteria:** Chips reuse existing primitive; no parallel "ChipNew" component.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.FEATURE,
    estimated_duration_hours: 3,
    tags: ['chips', 'grid', 'badge', 'responsive'],
    metadata: {
      phase: 'components',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.7: Hero product montage (layered screenshots, dark-mode ready)",
    description: `The Swift hero showcases layered UI imagery with soft shadows/radial fades.

**Implementation Steps:**
- AUDIT: Check current hero media approach and Image utilities
- DECIDE: Compose existing Image components with stacked layers; no new libraries
- APPLY: Add responsive montage with fixed aspect wrappers; use web-optimized images and a radial gradient mask; dark-mode adjusted shadow tokens
- VERIFY: LCP element preloaded; no layout shift; good contrast in dark mode

**Acceptance Criteria:** Montage loads fast, dimensioned, and responsive; no CLS.`,
    priority: TaskPriority.HIGH,
    type: TaskType.FEATURE,
    estimated_duration_hours: 4,
    tags: ['hero', 'montage', 'images', 'performance'],
    metadata: {
      phase: 'components',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.8: Demo slider/panel (extend existing Carousel/Steps)",
    description: `Swift showcases a light carousel demo with arrows/dots.

**Implementation Steps:**
- AUDIT: Find any existing carousel/stepper; if absent, implement minimal slider using current utilities (no new deps)
- APPLY: Add arrows/dots styled via tokens; reduced-motion: fade cross-fade; keyboard/ARIA roles
- VERIFY: Arrow keys advance; focus order sensible; dots have aria-current

**Acceptance Criteria:** Works without pointer; passes reduced-motion.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.FEATURE,
    estimated_duration_hours: 4,
    tags: ['slider', 'carousel', 'accessibility', 'motion'],
    metadata: {
      phase: 'components',
      requires_approval: true,
      approval_reason: 'If proposing any dependency'
    }
  },
  {
    task_id: '',
    title: "HT-003.9: Testimonials/Case study — semantic quote + CTA",
    description: `Mirror Swift's quotes + "Read case study" links.

**Implementation Steps:** Refactor-in-place to <figure><blockquote><p>…</p></blockquote><figcaption>— Name, Role</figcaption></figure>; append small CTA.

**Acceptance Criteria:** Screen readers announce quote + attribution; CTA is focusable.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 2,
    tags: ['testimonials', 'semantic', 'accessibility'],
    metadata: {
      phase: 'components',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.10: Navbar & Footer tidy (Book demo prominence; grouped links)",
    description: `Swift emphasizes "Book demo" and groups platform/support links.

**Implementation Steps:**  
- Emphasize primary CTA in navbar; ensure mobile menu parity
- Footer groups (Platform/Support/Legal) using existing list/link primitives

**Acceptance Criteria:** Focus rings visible; md+ columns, sm stacked; legal links present.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 2,
    tags: ['navigation', 'footer', 'cta', 'responsive'],
    metadata: {
      phase: 'components',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.11: Motion policy — centralize durations/easing; reduced-motion guard",
    description: `Subtle polish without jank.

**Implementation Steps:** Extend existing transition helpers with --motion-duration-quick:120–160ms, --motion-duration-default:180–200ms, and one easing; apply to buttons/chips/cards/slider.

**Acceptance Criteria:** Motion is subtle, consistent; reduced-motion disables non-essential transitions.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.REFACTOR,
    estimated_duration_hours: 2,
    tags: ['motion', 'transitions', 'accessibility'],
    metadata: {
      phase: 'polish',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.12: Video/Loom optimization",
    description: `Swift embeds a Loom—heavy for hero; we must defer.

**Implementation Steps:** Replace inline embed with thumbnail + play → on click, load embed; add loading="lazy"; ensure reduced-motion disables autoplay.

**Acceptance Criteria:** No network fetch until user intent; play works; a11y labels present.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.PERFORMANCE,
    estimated_duration_hours: 2,
    tags: ['video', 'lazy-loading', 'performance'],
    metadata: {
      phase: 'polish',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.13: A11y foundation — landmarks, skip links, focus-visible",
    description: `Surpass Swift on accessibility.

**Implementation Steps:** Confirm header/main/footer landmarks; add or refine skip links; ensure :focus-visible tokens; fix heading level jumps.

**Acceptance Criteria:** Axe/Lighthouse a11y checks green for landmarks, contrast, focus.`,
    priority: TaskPriority.HIGH,
    type: TaskType.SECURITY,
    estimated_duration_hours: 3,
    tags: ['accessibility', 'landmarks', 'focus', 'a11y'],
    metadata: {
      phase: 'polish',
      requires_approval: false
    }
  },
  {
    task_id: '',
    title: "HT-003.14: QA evidence & PR assets",
    description: `Objective review with minimal tooling.

**Implementation Steps:** Use existing screenshot utility (or manual) to capture before/after (sm/md/lg) for hero, features, demo slider, testimonials, footer. Place in docs/ui-polish/. Create a markdown checklist of acceptance items. Add TASK SUMMARY mapping sub-tasks → commit SHAs.

**Acceptance Criteria:** PR shows side-by-side before/after and tickable checklist.`,
    priority: TaskPriority.MEDIUM,
    type: TaskType.DOCUMENTATION,
    estimated_duration_hours: 3,
    tags: ['qa', 'documentation', 'screenshots', 'pr'],
    metadata: {
      phase: 'delivery',
      requires_approval: true,
      approval_reason: 'Only if adding a new screenshot lib'
    }
  }
];

// =============================================================================
// WORKFLOW CHECKLISTS FOR EACH PHASE
// =============================================================================

export const ADAV_CHECKLISTS: Record<WorkflowPhase, WorkflowChecklistItem[]> = {
  [WorkflowPhase.AUDIT]: [
    {
      id: 'audit-1',
      description: 'Locate and inventory existing components/utilities',
      completed: false,
      required: true
    },
    {
      id: 'audit-2',
      description: 'Identify current implementation patterns',
      completed: false,
      required: true
    },
    {
      id: 'audit-3',
      description: 'Document current state and constraints',
      completed: false,
      required: true
    }
  ],
  [WorkflowPhase.DECIDE]: [
    {
      id: 'decide-1',
      description: 'Choose extension approach over duplication',
      completed: false,
      required: true
    },
    {
      id: 'decide-2',
      description: 'Map changes to existing components/tokens',
      completed: false,
      required: true
    },
    {
      id: 'decide-3',
      description: 'Identify approval requirements',
      completed: false,
      required: true
    }
  ],
  [WorkflowPhase.APPLY]: [
    {
      id: 'apply-1',
      description: 'Implement changes behind feature flag',
      completed: false,
      required: true
    },
    {
      id: 'apply-2',
      description: 'Follow no-duplicate rule',
      completed: false,
      required: true
    },
    {
      id: 'apply-3',
      description: 'Add proper comments and documentation',
      completed: false,
      required: true
    }
  ],
  [WorkflowPhase.VERIFY]: [
    {
      id: 'verify-1',
      description: 'Test with flag ON/OFF',
      completed: false,
      required: true
    },
    {
      id: 'verify-2',
      description: 'Run linting and type checks',
      completed: false,
      required: true
    },
    {
      id: 'verify-3',
      description: 'Verify no regressions',
      completed: false,
      required: true
    }
  ]
};

// =============================================================================
// APPROVAL GATES
// =============================================================================

export const APPROVAL_REQUIREMENTS = [
  {
    subtask: 'Dark-First theming with Light/Dark switch',
    reason: 'Adding semantic tokens',
    minimal_alternative: 'Component-scoped CSS vars under the flag'
  },
  {
    subtask: 'Typographic hierarchy',
    reason: 'Only if adding tokens',
    minimal_alternative: 'Scoped CSS vars'
  },
  {
    subtask: 'Demo slider/panel',
    reason: 'If proposing any dependency',
    minimal_alternative: 'Simple CSS/JS slider in existing utils'
  },
  {
    subtask: 'QA evidence & PR assets',
    reason: 'Only if adding a new screenshot lib',
    minimal_alternative: 'Manual screenshots'
  }
];

// =============================================================================
// SUCCESS METRICS
// =============================================================================

export const SUCCESS_METRICS = {
  layout_rhythm: {
    target: '±4px consistency',
    measurement: 'Section padding variance'
  },
  typography: {
    target: 'H1/H2/H3 distinct, 68-78ch body',
    measurement: 'Visual hierarchy and line length'
  },
  theme: {
    target: '≥AA contrast in both modes',
    measurement: 'WCAG contrast ratio checks'
  },
  components: {
    target: 'Full state matrix',
    measurement: 'Hover/focus/active/disabled/loading/skeleton states'
  },
  motion: {
    target: '120-200ms transitions, single easing',
    measurement: 'Transition duration and easing consistency'
  },
  performance: {
    target: 'LCP ≤ 2.5s, CLS ≤ 0.02, bundle delta < +30KB GZIP',
    measurement: 'Lighthouse metrics and bundle analysis'
  }
};

// =============================================================================
// EXPORTS
// =============================================================================

// All exports are already declared above with the const declarations
