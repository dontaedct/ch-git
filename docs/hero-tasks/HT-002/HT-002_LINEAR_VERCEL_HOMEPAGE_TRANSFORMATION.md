# HT-002: Linear/Vercel-Inspired Homepage Transformation

## Task Overview
**Task Number:** HT-002  
**Title:** Linear/Vercel-Inspired Homepage Transformation  
**Type:** Feature  
**Priority:** High  
**Status:** In Progress  
**Created:** 2025-01-27T10:00:00.000Z  
**Estimated Duration:** 20 hours  

## Description
Transform our current homepage/landing page into a Linear + Vercel–inspired interface while strictly following our existing systems and rules. This task follows the AUDIT → DECIDE → APPLY → VERIFY methodology to ensure systematic execution.

## AUDIT SUMMARY

### Files to Touch
- `app/page.tsx` - Main homepage component (already has Linear/Vercel-inspired structure)
- `app/layout.tsx` - Root layout with theme providers
- `app/globals.css` - Global styles and CSS variables
- `styles/globals.css` - Design token definitions
- `styles/motion.css` - Motion system tokens
- `components/ui/container.tsx` - Layout container component
- `components/ui/grid.tsx` - Grid system component
- `components/ui/surface.tsx` - Surface/card components
- `components/ui/button.tsx` - Button primitives
- `lib/design-tokens/provider.tsx` - Design token provider
- `components/theme-provider.tsx` - Theme switching

### Existing Tokens and Gaps
**✅ Existing:**
- Complete OKLCH color system with light/dark themes
- Typography scale (display, heading, body, meta)
- Spacing tokens (xs, sm, md, lg, xl, 2xl)
- Border radius tokens (sm, md, lg, full)
- Motion tokens (duration, easing, transitions)
- Design token provider with React context
- next-themes integration for theme switching

**⚠️ Gaps Identified:**
- Missing elevation/shadow tokens for Linear-style surfaces
- No theme toggle component in UI
- Limited micro-interaction tokens
- Missing Linear-specific spacing patterns

### Current Theme Mechanism
**✅ Robust Theme System:**
- `next-themes` with system preference detection
- OKLCH color space for perceptual uniformity
- CSS custom properties with theme switching
- Design token provider with React context
- Automatic light/dark mode switching
- Reduced motion support built-in

### Risks/Unknowns
- **Low Risk:** Existing homepage already has Linear/Vercel-inspired structure
- **Medium Risk:** Need to ensure no breaking changes to existing components
- **Low Risk:** Theme system is already robust and production-ready

## DECIDE: Implementation Plan

### Phase 1: Theme Enhancement (4 hours)
1. **HT-002.1.1** - Add elevation/shadow tokens for Linear-style surfaces
2. **HT-002.1.2** - Create theme toggle component with accessibility
3. **HT-002.1.3** - Enhance micro-interaction tokens
4. **HT-002.1.4** - Add Linear-specific spacing patterns

### Phase 2: Homepage Refinement (8 hours)
1. **HT-002.2.1** - Refine hero section with Linear typography hierarchy
2. **HT-002.2.2** - Enhance feature cards with subtle elevation
3. **HT-002.2.3** - Add social proof section with muted styling
4. **HT-002.2.4** - Implement CTA section with proper spacing
5. **HT-002.2.5** - Add navigation header with translucent effect
6. **HT-002.2.6** - Enhance footer with multi-column layout

### Phase 3: Accessibility & Performance (4 hours)
1. **HT-002.3.1** - Ensure WCAG AA contrast compliance
2. **HT-002.3.2** - Add proper focus states and keyboard navigation
3. **HT-002.3.3** - Optimize for Core Web Vitals
4. **HT-002.3.4** - Test reduced motion preferences

### Phase 4: Verification & Polish (4 hours)
1. **HT-002.4.1** - Cross-browser testing
2. **HT-002.4.2** - Mobile responsiveness verification
3. **HT-002.4.3** - Performance audit
4. **HT-002.4.4** - Final accessibility audit

## APPLY: Implementation Details

### Design Principles
- **Hierarchy & Density:** Crisp vertical rhythm, clear section headers, compact nav
- **Neutral Foundation:** Grayscale base with restrained brand accent
- **Type System:** Decisive scale (display → heading → subhead → body → meta)
- **Motion:** Micro-interactions only (80–150ms, subtle cubic-bezier)
- **Surfaces:** Flat or very soft elevation, thin hairline dividers
- **Responsive:** Mobile-first, maintain line-length and tap targets

### Token Enhancements
```css
/* New elevation tokens */
--elevation-0: 0px 0px 0px rgba(0, 0, 0, 0);
--elevation-1: 0px 1px 2px rgba(0, 0, 0, 0.05);
--elevation-2: 0px 4px 8px rgba(0, 0, 0, 0.1);

/* Linear-specific spacing */
--space-section: 6rem;
--space-section-sm: 4rem;
--space-section-lg: 8rem;
```

### Component Updates
- Enhance existing Container, Grid, Surface components
- Add theme toggle to header
- Refine button variants for CTAs
- Add subtle hover states and micro-interactions

## VERIFY: Quality Assurance

### Accessibility Checklist
- [ ] WCAG AA contrast compliance in both themes
- [ ] Focus states visible and consistent
- [ ] Keyboard navigation works correctly
- [ ] Screen reader compatibility
- [ ] Reduced motion preferences respected

### Performance Checklist
- [ ] Lighthouse LCP ≤ 2.5s
- [ ] CLS < 0.1
- [ ] No layout shifts on theme toggle
- [ ] Optimized images and assets
- [ ] Minimal bundle size impact

### Visual Quality Checklist
- [ ] Consistent spacing and typography
- [ ] Proper hierarchy and visual flow
- [ ] Subtle micro-interactions
- [ ] Clean, minimal aesthetic
- [ ] Responsive design across breakpoints

## Deliverables
1. **Enhanced Theme System** - Elevation tokens, theme toggle component
2. **Refined Homepage** - Linear/Vercel-inspired design with proper hierarchy
3. **Accessibility Compliance** - WCAG AA standards met
4. **Performance Optimization** - Core Web Vitals optimized
5. **Documentation** - Updated design token documentation

## Success Criteria
- Homepage matches Linear/Vercel design principles
- Theme switching works flawlessly with no FOUC
- Accessibility standards met (WCAG AA)
- Performance metrics within acceptable ranges
- No breaking changes to existing functionality
- Clean, maintainable code following project conventions

## Dependencies
- Existing design token system
- next-themes for theme switching
- Framer Motion for micro-interactions
- Tailwind CSS for styling
- Existing UI component library

## Notes
- Homepage already has good foundation with Linear/Vercel-inspired structure
- Focus on refinement rather than complete rebuild
- Maintain existing functionality while enhancing visual design
- Follow established patterns and conventions
- Ensure backward compatibility
