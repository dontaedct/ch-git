# Accessibility Guide

This document outlines the accessibility standards, testing procedures, and best practices for the DCT Micro-Apps project.

## Overview

Our application is designed to meet **WCAG 2.1 AA** standards, ensuring accessibility for users with disabilities including:

- Visual impairments
- Motor disabilities
- Hearing impairments
- Cognitive disabilities

## Testing Tools

### 1. Axe Core (Playwright)
- **Purpose**: Automated accessibility testing
- **Coverage**: WCAG 2.1 AA compliance
- **Location**: `tests/ui/a11y.spec.ts`
- **Run**: `npm run tool:ui:a11y`

### 2. Storybook Accessibility Addon
- **Purpose**: Component-level accessibility testing
- **Coverage**: Individual component compliance
- **Location**: `.storybook/preview.ts`
- **Run**: `npm run storybook`

### 3. Manual Testing
- **Purpose**: Human verification and edge case testing
- **Tools**: Screen readers, keyboard navigation, color contrast checkers
- **Frequency**: Before major releases

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Perceivable
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Text Alternatives**: All images have descriptive alt text
- **Adaptable**: Content can be presented in different ways
- **Distinguishable**: Users can see and hear content

#### Operable
- **Keyboard Accessible**: All functionality available via keyboard
- **Enough Time**: Users have enough time to read and use content
- **Seizures**: No content that could cause seizures
- **Navigable**: Users can navigate and find content

#### Understandable
- **Readable**: Text is readable and understandable
- **Predictable**: Pages operate in predictable ways
- **Input Assistance**: Users are helped to avoid and correct mistakes

#### Robust
- **Compatible**: Content is compatible with current and future tools

## Testing Procedures

### Automated Testing

#### Playwright Tests
```bash
# Run all accessibility tests
npm run tool:ui:a11y

# Run with detailed reporting
npm run tool:ui:a11y:report
```

#### Storybook Tests
```bash
# Start Storybook with accessibility addon
npm run storybook

# Run Storybook tests
npm run test-storybook
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab order is logical and intuitive
- [ ] All interactive elements are reachable
- [ ] Focus indicators are visible
- [ ] Skip links work correctly

#### Screen Reader Testing
- [ ] All content is announced correctly
- [ ] Form labels are properly associated
- [ ] ARIA attributes are meaningful
- [ ] Navigation landmarks are present

#### Color and Contrast
- [ ] Text meets contrast requirements
- [ ] Color is not the only way to convey information
- [ ] UI elements are distinguishable

#### Responsive Design
- [ ] Content is usable at different zoom levels
- [ ] Touch targets are appropriately sized
- [ ] Text remains readable on small screens

## Common Issues and Solutions

### Missing Alt Text
```tsx
// ❌ Bad
<img src="logo.png" />

// ✅ Good
<img src="logo.png" alt="Company Logo" />
```

### Missing Form Labels
```tsx
// ❌ Bad
<input type="text" />

// ✅ Good
<label htmlFor="name">Name</label>
<input type="text" id="name" />
```

### Poor Color Contrast
```css
/* ❌ Bad - insufficient contrast */
.text { color: #666; }

/* ✅ Good - meets WCAG AA */
.text { color: #595959; }
```

### Missing Focus Indicators
```css
/* ❌ Bad - no focus indicator */
button:focus { outline: none; }

/* ✅ Good - visible focus indicator */
button:focus { 
  outline: 2px solid #007acc;
  outline-offset: 2px;
}
```

## Component Guidelines

### Buttons
- Always include accessible text
- Use proper ARIA attributes when needed
- Ensure sufficient touch target size (44px minimum)

### Forms
- Associate labels with inputs using `htmlFor`
- Provide clear error messages
- Use appropriate input types

### Navigation
- Include skip links for main content
- Use semantic HTML (`nav`, `main`, etc.)
- Ensure logical tab order

### Images
- Provide meaningful alt text
- Use `aria-label` for decorative images
- Consider `aria-describedby` for complex images

## CI/CD Integration

### GitHub Actions
Accessibility tests are automatically run in the CI pipeline:

```yaml
- name: Run Accessibility Tests
  run: npm run tool:ui:a11y
```

### Pre-commit Hooks
Accessibility checks are included in pre-commit validation:

```bash
npm run tool:design:check
```

## Reporting

### Accessibility Reports
Comprehensive reports are generated and stored in `reports/`:

- `accessibility-report.json` - Machine-readable format
- `accessibility-report.md` - Human-readable format

### Violation Tracking
- All violations are logged with severity levels
- Recommendations are provided for fixes
- Progress is tracked over time

## Resources

### Tools
- [Axe DevTools](https://www.deque.com/axe/browser-extensions/)
- [WAVE Web Accessibility Evaluator](https://wave.webaim.org/)
- [Color Contrast Analyzer](https://www.tpgi.com/color-contrast-checker/)

### Documentation
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [Web Accessibility Initiative](https://www.w3.org/WAI/)

### Testing
- [NVDA Screen Reader](https://www.nvaccess.org/)
- [JAWS Screen Reader](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver (macOS)](https://www.apple.com/accessibility/vision/)

## Maintenance

### Regular Reviews
- Monthly accessibility audits
- Quarterly compliance reviews
- Annual user testing sessions

### Updates
- Keep testing tools current
- Monitor for new accessibility standards
- Update documentation as needed

### Training
- Regular team training on accessibility
- New hire accessibility onboarding
- Ongoing best practices education

## Support

For accessibility questions or issues:

1. Check this documentation
2. Review the testing reports
3. Consult the accessibility testing tools
4. Contact the development team

---

**Last Updated**: ${new Date().toISOString().split('T')[0]}
**Version**: 1.0.0
