# Builder UX Flows - Configuration-First Manifest System

## Overview
This document defines detailed UX flows for the Template Editor and Form Editor wireframes. All interactions follow the configuration-first approach with no WYSIWYG editing capabilities.

## Template Editor UX Flows

### 1. Add Component Flow
**Trigger**: User clicks "Add Component" button in center column
**Steps**:
1. **Modal Opens**: Component palette modal displays with categorized components
   - **Categories**: Layout (Hero, Section, Grid), Content (Text, Image, Video), Interactive (Form, Button, Link), Data (List, Card, Testimonial)
   - **Search**: Real-time filtering by component name/category
   - **Preview**: Each component shows icon + description + version
2. **Component Selection**: User clicks desired component
   - **Validation**: Check if component dependencies are met
   - **Conflict Check**: Warn if component conflicts with existing ones
3. **Props Configuration**: Modal transitions to props editor
   - **Required Props**: Highlighted in red, must be filled
   - **Optional Props**: Collapsed by default, expandable
   - **Validation**: Real-time validation with error messages
4. **Component Added**: On "Add" button click
   - Component appears in center column component list
   - Automatically selected for further editing
   - Undo action available for 5 seconds

**Error Handling**:
- Missing required props: Disable "Add" button, show validation summary
- Dependency conflicts: Show warning dialog with options to resolve
- Network issues: Show retry option with offline mode indication

### 2. Drag-and-Drop Reordering Flow
**Trigger**: User drags component handle in center column
**Steps**:
1. **Drag Start**:
   - Component becomes semi-transparent (0.6 opacity)
   - Drop zones highlighted with blue dashed borders
   - Other components shift to create visual gaps
2. **Drag Over**:
   - Current drop position highlighted with solid blue line
   - Invalid drop zones show red border with "Not allowed" cursor
   - Scroll container auto-scrolls when dragging near edges
3. **Drop**:
   - Component animates to new position (200ms ease-out)
   - Order numbers update automatically
   - Manifest order array updates immediately
4. **Confirmation**:
   - Toast notification: "Component moved successfully"
   - Undo option available for 5 seconds

**Constraints**:
- Header components can only be placed at top
- Footer components can only be placed at bottom
- Form components cannot be nested inside other forms

### 3. Advanced Toggle Flow
**Trigger**: User clicks "Advanced" toggle in right column
**States**:
- **Basic Mode** (Default): Shows 5-8 most common props
- **Advanced Mode**: Shows all available props including:
  - Custom CSS classes
  - Analytics tracking
  - Conditional logic
  - Accessibility attributes
  - Performance settings

**Behavior**:
- Toggle animates with 150ms transition
- Props section expands/collapses with accordion animation
- User preference persisted in localStorage
- Advanced-only props clearly labeled with "Advanced" badge

### 4. Theme Toggle Flow
**Trigger**: User clicks theme toggle in left column
**Options**:
1. **Site Defaults** (Default):
   - Uses design tokens from `design-tokens.json`
   - Shows preview of default color palette
   - Theme customization disabled
2. **Custom Tokens**:
   - Enables theme editor with color pickers
   - Real-time preview in thumbnail
   - Validation for contrast ratios (WCAG AA)
   - Export/import theme JSON capability

**Transition**:
- Smooth animation between modes (300ms)
- Thumbnail updates immediately on theme changes
- Theme validation runs on every color change

### 5. Thumbnail Preview Generation Flow
**Trigger**: Automatic on component/theme changes + manual refresh button
**Steps**:
1. **Debounced Trigger**: Wait 500ms after last change
2. **API Call**: POST to `/api/preview/thumbnail`
   - Send current manifest JSON
   - Include viewport size (desktop/mobile toggle)
3. **Loading State**:
   - Thumbnail area shows skeleton loader
   - "Generating preview..." text
4. **Success**:
   - Thumbnail updates with fade-in animation
   - Cache URL for 5 minutes
5. **Error**:
   - Show fallback "Preview unavailable" image
   - Retry button available

**Performance**:
- Maximum 1 request per 500ms (debounced)
- Cached thumbnails served from CDN
- Offline mode shows last cached thumbnail

### 6. Export Manifest Flow
**Trigger**: User clicks "Export Manifest" button
**Steps**:
1. **Validation**: Full manifest validation check
   - Required fields verification
   - Component dependencies check
   - Schema validation against JSON Schema
2. **Success Path**:
   - JSON downloaded as `{template-name}-manifest.json`
   - Manifest copied to clipboard automatically
   - Success toast: "Manifest exported and copied to clipboard"
3. **Error Path**:
   - Validation errors displayed in modal
   - Option to export anyway (with warnings)
   - Link to validation documentation

## Form Editor UX Flows

### 1. Add Field Flow
**Trigger**: User clicks "Add Field" button in center column
**Steps**:
1. **Field Type Selection**:
   - Modal with field type categories: Basic (text, email, select), Advanced (file, date, conditional), Layout (group, divider)
   - Each field type shows icon + description + common use cases
2. **Field Configuration**:
   - **Basic Settings**: Label, placeholder, required toggle
   - **Validation Rules**: Pattern, min/max length, custom validation
   - **Conditional Logic**: Show/hide based on other fields
3. **Field Added**:
   - Appears in center column with auto-generated ID
   - Order automatically assigned
   - Selected for immediate editing

### 2. Field Reordering Flow
**Same as component reordering but with field-specific constraints**:
- Form groups maintain field containment
- Required fields cannot be moved after optional fields (UX best practice warning)
- Conditional fields must come after their trigger fields

### 3. Conditional Logic Flow
**Trigger**: User enables "Conditional Logic" toggle for a field
**Steps**:
1. **Trigger Field Selection**: Dropdown of available fields
2. **Operator Selection**: equals, not equals, contains, is empty, etc.
3. **Value Configuration**: Based on trigger field type
4. **Action Selection**: show/hide field, require field, set value
5. **Preview**: Show/hide logic preview in form preview panel

### 4. Validation Rules Flow
**Trigger**: User clicks "Add Validation" in field editor
**Rule Types**:
- **Pattern Matching**: RegEx with common patterns library
- **Length Limits**: Min/max character counts
- **Custom Functions**: JavaScript validation functions
- **Cross-Field**: Validation against other field values

**Real-time Testing**:
- Test input field to preview validation
- Error message preview
- Performance impact indicator

### 5. Security Settings Flow
**Location**: Left column security panel
**Settings**:
1. **Honeypot**: Toggle with explanation
2. **Rate Limiting**: Submissions per hour slider
3. **CAPTCHA**: Provider selection + configuration
4. **Data Retention**: Days slider + GDPR compliance indicator

## Accessibility & Keyboard Shortcuts

### Keyboard Navigation
- **Tab Order**: Left → Center → Right column progression
- **Component Selection**: Up/Down arrows in center column
- **Quick Actions**:
  - `Ctrl+A`: Add component/field
  - `Ctrl+D`: Duplicate selected component/field
  - `Delete`: Remove selected component/field
  - `Ctrl+Z`: Undo last action
  - `Ctrl+S`: Save manifest
  - `Ctrl+E`: Export manifest

### Screen Reader Support
- All interactive elements have aria-labels
- Form validation errors announced immediately
- Component/field selection changes announced
- Progress indicators for long operations

### Focus Management
- Modal opens: Focus moves to first interactive element
- Modal closes: Focus returns to trigger element
- Component selection: Focus follows selection
- Error states: Focus moves to first error

## Error States & Recovery

### Network Errors
- **Offline Mode**: Continue editing with local storage
- **API Timeouts**: Retry with exponential backoff
- **Save Failures**: Auto-save drafts every 30 seconds

### Validation Errors
- **Real-time**: Field-level validation on blur
- **Form-level**: Full validation on save/export
- **Recovery**: Clear guidance on fixing errors

### Data Loss Prevention
- **Auto-save**: Every 30 seconds to localStorage
- **Page Exit Warning**: Unsaved changes prompt
- **Session Recovery**: Restore on page reload

## Performance Considerations

### Optimization Strategies
- **Debounced Updates**: 300ms delay for real-time preview
- **Virtual Scrolling**: For large component/field lists
- **Lazy Loading**: Component palette loaded on demand
- **Memoization**: Prevent unnecessary re-renders

### Loading States
- **Skeleton Loaders**: For thumbnail generation
- **Progressive Enhancement**: Core functionality works without JS
- **Chunked Loading**: Large forms load in batches

## Mobile Responsive Behavior

### Layout Adaptation
- **Collapse to Single Column**: Stack layout vertically on mobile
- **Touch Targets**: Minimum 44px touch targets
- **Swipe Navigation**: Swipe between columns
- **Drawer Pattern**: Right column becomes bottom drawer

### Touch Interactions
- **Drag-and-Drop**: Touch-friendly drag handles
- **Long Press**: Context menus for advanced actions
- **Pull-to-Refresh**: Refresh thumbnail preview
- **Haptic Feedback**: Success/error vibrations where supported