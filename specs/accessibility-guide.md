# Accessibility & Keyboard Navigation Guide

## Overview
This document defines comprehensive accessibility requirements and keyboard navigation patterns for the configuration-first manifest builders. All implementations must meet WCAG 2.1 AA standards.

## Core Accessibility Principles

### 1. Perceivable
- **Color Independence**: All information conveyed through color must also be available through text, icons, or patterns
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Text Alternatives**: All images, icons, and visual elements have meaningful alt text
- **Responsive Text**: Support browser zoom up to 200% without horizontal scrolling

### 2. Operable
- **Keyboard Accessible**: All functionality available via keyboard
- **No Seizures**: No content flashes more than 3 times per second
- **Focus Management**: Clear visual focus indicators and logical tab order
- **Sufficient Time**: No time limits on interactions (or user can extend/disable)

### 3. Understandable
- **Readable Text**: Clear language, consistent terminology
- **Predictable Navigation**: Consistent interaction patterns
- **Input Assistance**: Clear error messages and field requirements
- **Context Help**: Available help text and documentation

### 4. Robust
- **Valid Markup**: Clean, semantic HTML structure
- **Screen Reader Compatible**: Works with assistive technologies
- **Cross-Browser**: Consistent behavior across modern browsers
- **Progressive Enhancement**: Core functionality works without JavaScript

## Keyboard Navigation Specification

### Global Keyboard Shortcuts

#### Primary Actions
- **Ctrl+S / Cmd+S**: Save current manifest
- **Ctrl+E / Cmd+E**: Export manifest (download + clipboard)
- **Ctrl+Z / Cmd+Z**: Undo last action
- **Ctrl+Y / Cmd+Y**: Redo last undone action
- **Ctrl+A / Cmd+A**: Add new component/field
- **Ctrl+D / Cmd+D**: Duplicate selected component/field
- **Delete / Backspace**: Remove selected component/field
- **Escape**: Close modal/cancel current action

#### Navigation Shortcuts
- **Tab**: Move forward through interactive elements
- **Shift+Tab**: Move backward through interactive elements
- **Ctrl+1**: Focus left column (Template/Form Settings)
- **Ctrl+2**: Focus center column (Components/Fields List)
- **Ctrl+3**: Focus right column (Component/Field Editor)
- **F6**: Cycle between main sections (left → center → right → repeat)

#### Component/Field Management
- **Arrow Up/Down**: Navigate through component/field list
- **Enter**: Select component/field for editing
- **Space**: Toggle selection checkbox (multi-select mode)
- **Ctrl+Up/Down**: Move selected component/field up/down in order
- **Shift+Click**: Select range of components/fields

### Tab Order and Focus Management

#### Left Column - Template/Form Settings
1. Template/Form name input
2. Description textarea
3. Category select
4. Theme toggle (Site Defaults / Custom)
5. Theme editor (if custom selected)
6. Advanced settings toggle
7. Advanced fields (if expanded)
8. Action buttons (Save, Export, Preview)

#### Center Column - Components/Fields List
1. Search/filter input
2. "Add Component/Field" button
3. Component/field list items (in order)
   - For each item: select checkbox → label → action menu → drag handle
4. Bulk actions toolbar (if items selected)
5. Sort controls

#### Right Column - Component/Field Editor
1. Component/field type indicator
2. Basic settings group
   - All basic fields in logical order
3. Advanced settings toggle
4. Advanced settings group (if expanded)
   - All advanced fields in logical order
5. Conditional logic toggle
6. Conditional logic settings (if enabled)
7. Actions (Save, Cancel, Remove)

### Focus Indicators

#### Visual Focus Design
```css
.focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
  border-radius: 4px;
}

.focus-visible:focus-within {
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
}
```

#### Focus States by Element Type
- **Buttons**: Blue outline with subtle shadow
- **Form Inputs**: Blue border with matching outline
- **Interactive Lists**: Highlighted background with outline
- **Drag Handles**: Enhanced visibility with motion indicator
- **Modal Elements**: Trapped focus within modal boundary

### Screen Reader Support

#### ARIA Labels and Descriptions
```html
<!-- Component List Item -->
<div role="listitem"
     aria-label="Hero Section component"
     aria-describedby="hero-component-desc">
  <span id="hero-component-desc" class="sr-only">
    Hero section with title, subtitle, and call-to-action button.
    Position 1 of 5 components.
  </span>
</div>

<!-- Form Field Editor -->
<fieldset aria-labelledby="field-editor-title">
  <legend id="field-editor-title">Text Field Configuration</legend>
  <div role="group" aria-labelledby="basic-settings">
    <h3 id="basic-settings">Basic Settings</h3>
    <!-- Basic fields -->
  </div>
  <div role="group" aria-labelledby="advanced-settings">
    <h3 id="advanced-settings">Advanced Settings</h3>
    <!-- Advanced fields -->
  </div>
</fieldset>
```

#### Live Regions for Dynamic Updates
```html
<!-- Status announcements -->
<div aria-live="polite" aria-atomic="true" class="sr-only" id="status-announcements">
  Component added successfully
</div>

<!-- Error announcements -->
<div aria-live="assertive" aria-atomic="true" class="sr-only" id="error-announcements">
  Required field: Component title cannot be empty
</div>

<!-- Progress updates -->
<div aria-live="polite" aria-atomic="false" class="sr-only" id="progress-announcements">
  Generating preview... 50% complete
</div>
```

#### Landmark Regions
```html
<main role="main" aria-label="Template Builder">
  <aside role="complementary" aria-label="Template Settings">
    <!-- Left column content -->
  </aside>

  <section role="region" aria-label="Component List">
    <!-- Center column content -->
  </section>

  <aside role="complementary" aria-label="Component Editor">
    <!-- Right column content -->
  </aside>
</main>
```

### Modal and Dialog Accessibility

#### Focus Trapping
```typescript
function trapFocus(modalElement: HTMLElement) {
  const focusableElements = modalElement.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  modalElement.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}
```

#### Modal Dialog Markup
```html
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-desc">
  <h2 id="modal-title">Add Component</h2>
  <p id="modal-desc">Choose a component type to add to your template</p>

  <!-- Modal content -->

  <div role="group" aria-label="Modal actions">
    <button type="button" data-action="confirm">Add Component</button>
    <button type="button" data-action="cancel">Cancel</button>
  </div>
</div>
```

### Drag and Drop Accessibility

#### Keyboard-Accessible Drag Operations
```html
<div role="listitem"
     tabindex="0"
     aria-grabbed="false"
     aria-dropeffect="move"
     data-draggable="true">
  <span class="component-label">Hero Section</span>
  <button aria-label="Move Hero Section component"
          data-action="move-mode">
    <svg aria-hidden="true" focusable="false">
      <use href="#drag-icon" />
    </svg>
  </button>
</div>
```

#### Alternative Keyboard Movement
- **Enter**: Activate move mode for selected component
- **Arrow Keys**: Move component up/down while in move mode
- **Enter**: Confirm new position
- **Escape**: Cancel move operation

#### Screen Reader Announcements for Drag Operations
```typescript
// Start move mode
announceToScreenReader("Move mode activated for Hero Section. Use arrow keys to change position, Enter to confirm, Escape to cancel.");

// Position change
announceToScreenReader("Hero Section moved to position 2 of 5.");

// Confirm move
announceToScreenReader("Hero Section moved successfully to position 2.");
```

### Error Handling and Validation

#### Error Message Patterns
```html
<!-- Field with validation error -->
<div class="field-group" data-invalid="true">
  <label for="component-title">Component Title</label>
  <input id="component-title"
         type="text"
         aria-invalid="true"
         aria-describedby="component-title-error">
  <div id="component-title-error"
       role="alert"
       class="error-message">
    Title is required and must be between 2 and 100 characters
  </div>
</div>

<!-- Form validation summary -->
<div role="alert"
     aria-labelledby="error-summary-title"
     class="error-summary">
  <h3 id="error-summary-title">Please fix the following errors:</h3>
  <ul>
    <li><a href="#component-title">Component title is required</a></li>
    <li><a href="#button-url">Button URL must be a valid web address</a></li>
  </ul>
</div>
```

#### Progressive Enhancement for Validation
1. **Server-side validation**: Always present as fallback
2. **Client-side validation**: Enhanced UX with immediate feedback
3. **Real-time validation**: Non-intrusive suggestions as user types
4. **Accessibility**: All validation messages available to screen readers

### Color and Contrast Requirements

#### Color Palette Accessibility
```css
:root {
  /* Primary colors - 4.5:1 contrast ratio */
  --color-primary: #1e40af;      /* Blue - passes AAA */
  --color-primary-light: #3b82f6; /* Lighter blue - passes AA */

  /* Status colors - accessible variants */
  --color-success: #059669;      /* Green - passes AA */
  --color-warning: #d97706;      /* Orange - passes AA */
  --color-error: #dc2626;        /* Red - passes AA */

  /* Neutral colors */
  --color-text: #111827;         /* Near black - passes AAA */
  --color-text-muted: #6b7280;   /* Gray - passes AA */
  --color-background: #ffffff;   /* White */
  --color-border: #d1d5db;       /* Light gray */
}

/* Dark mode variants */
@media (prefers-color-scheme: dark) {
  :root {
    --color-text: #f9fafb;       /* Near white - passes AAA */
    --color-text-muted: #9ca3af; /* Light gray - passes AA */
    --color-background: #111827; /* Dark background */
    --color-border: #374151;     /* Dark border */
  }
}
```

#### Interactive Element States
```css
.button {
  /* Default state - 4.5:1 contrast */
  background: var(--color-primary);
  color: white;
}

.button:hover {
  /* Hover state - enhanced contrast */
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.button:focus-visible {
  /* Focus state - clear indication */
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.button:disabled {
  /* Disabled state - clear indication */
  background: var(--color-text-muted);
  opacity: 0.6;
  cursor: not-allowed;
}
```

### High Contrast Mode Support

#### Windows High Contrast Detection
```css
@media (prefers-contrast: high) {
  .component-card {
    border: 2px solid ButtonText;
    background: ButtonFace;
    color: ButtonText;
  }

  .component-card:focus {
    border-color: Highlight;
    background: HighlightText;
    color: Highlight;
  }
}

@media (-ms-high-contrast: active) {
  .drag-handle {
    border: 1px solid WindowText;
    background: Window;
  }
}
```

### Motion and Animation Accessibility

#### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable animations for users who prefer reduced motion */
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  /* Keep essential animations with minimal duration */
  .focus-visible {
    transition: outline 0.15s ease;
  }
}

@media (prefers-reduced-motion: no-preference) {
  /* Standard animations for users who don't mind motion */
  .component-card {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .component-card:hover {
    transform: translateY(-2px);
  }
}
```

### Testing and Validation

#### Automated Accessibility Testing
```typescript
// Required automated tests
const accessibilityTests = [
  'axe-core', // Comprehensive accessibility testing
  'lighthouse-a11y', // Chrome Lighthouse accessibility audit
  'pa11y', // Command-line accessibility testing
  'jest-axe' // Jest integration for component testing
];

// Manual testing checklist
const manualTests = [
  'Keyboard navigation without mouse',
  'Screen reader testing (NVDA, JAWS, VoiceOver)',
  'High contrast mode verification',
  'Text scaling up to 200%',
  'Color blindness simulation',
  'Focus management in modal dialogs',
  'Error message accessibility'
];
```

#### Accessibility Audit Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Logical tab order maintained
- [ ] Focus indicators clearly visible
- [ ] Screen reader announcements meaningful
- [ ] Color contrast meets WCAG AA standards
- [ ] Form validation accessible
- [ ] Error messages associated with fields
- [ ] Modal dialogs trap focus properly
- [ ] Drag-and-drop has keyboard alternative
- [ ] Motion respects user preferences
- [ ] High contrast mode supported
- [ ] Semantic HTML structure used
- [ ] ARIA labels and descriptions provided
- [ ] Live regions update appropriately
- [ ] Documentation includes accessibility features

### Implementation Priority

#### Phase 1: Core Accessibility (Required for MVP)
1. Keyboard navigation for all interactive elements
2. Basic screen reader support with ARIA labels
3. Color contrast compliance
4. Focus management and indicators
5. Form validation accessibility

#### Phase 2: Enhanced Accessibility
1. Advanced screen reader features
2. High contrast mode support
3. Reduced motion preferences
4. Comprehensive drag-and-drop alternatives
5. Enhanced error handling

#### Phase 3: Advanced Features
1. Voice control support
2. Custom keyboard shortcut configuration
3. Accessibility preferences panel
4. Advanced screen reader optimizations
5. Comprehensive accessibility documentation

This accessibility specification ensures the manifest builders are usable by everyone, regardless of ability or assistive technology used.