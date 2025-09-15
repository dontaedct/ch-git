# Component Dependency Analysis Report

Generated: 2025-09-12T03:00:26.170Z

## Overview

- **Total Components**: 246
- **Core/Shared Components (5+ uses)**: 15
- **UI Components**: 33
- **Business Logic Components**: 149
- **Page Components**: 0
- **Provider Components**: 40
- **Layout Components**: 26
- **Leaf Components (unused)**: 177

## Core/Shared Components (used by 5+ other components)

- **button.tsx** (ui\button.tsx): **61 uses**
- **card.tsx** (ui\card.tsx): **48 uses**
- **badge.tsx** (ui\badge.tsx): **45 uses**
- **tabs.tsx** (ui\tabs.tsx): **26 uses**
- **alert.tsx** (ui\alert.tsx): **22 uses**
- **input.tsx** (ui\input.tsx): **19 uses**
- **progress.tsx** (ui\progress.tsx): **18 uses**
- **label.tsx** (ui\label.tsx): **11 uses**
- **select.tsx** (ui\select.tsx): **11 uses**
- **separator.tsx** (ui\separator.tsx): **10 uses**
- **switch.tsx** (ui\switch.tsx): **8 uses**
- **theme-toggle.tsx** (ui\theme-toggle.tsx): **7 uses**
- **DynamicBrandName.tsx** (branding\DynamicBrandName.tsx): **5 uses**
- **checkbox.tsx** (ui\checkbox.tsx): **5 uses**
- **textarea.tsx** (ui\textarea.tsx): **5 uses**

## Most Used Components

- **button.tsx** (ui/button.tsx): **61 uses**
- **card.tsx** (ui/card.tsx): **48 uses**
- **badge.tsx** (ui/badge.tsx): **45 uses**
- **tabs.tsx** (ui/tabs.tsx): **26 uses**
- **alert.tsx** (ui/alert.tsx): **22 uses**
- **input.tsx** (ui/input.tsx): **19 uses**
- **progress.tsx** (ui/progress.tsx): **18 uses**
- **label.tsx** (ui/label.tsx): **11 uses**
- **select.tsx** (ui/select.tsx): **11 uses**
- **separator.tsx** (ui/separator.tsx): **10 uses**
- **switch.tsx** (ui/switch.tsx): **8 uses**
- **theme-toggle.tsx** (ui/theme-toggle.tsx): **7 uses**
- **DynamicBrandName.tsx** (branding/DynamicBrandName.tsx): **5 uses**
- **checkbox.tsx** (ui/checkbox.tsx): **5 uses**
- **textarea.tsx** (ui/textarea.tsx): **5 uses**

## Component Architecture Analysis

### UI Components (33)

- button.tsx (ui/button.tsx) - **61 uses**
- badge.tsx (ui/badge.tsx) - **45 uses**
- alert.tsx (ui/alert.tsx) - **22 uses**
- input.tsx (ui/input.tsx) - **19 uses**
- theme-toggle.tsx (ui/theme-toggle.tsx) - **7 uses**
- textarea.tsx (ui/textarea.tsx) - **5 uses**
- micro-interactions.tsx (ui/micro-interactions.tsx) - **4 uses**
- spacing.tsx (ui/spacing.tsx) - **4 uses**
- typography.tsx (ui/typography.tsx) - **4 uses**
- ux-patterns.tsx (ui/ux-patterns.tsx) - **4 uses**
... and 23 more

### Business Logic Components (149)

- theme-toggle.tsx (ui/theme-toggle.tsx) - **7 uses**
- empty-states.tsx (empty-states.tsx) - **4 uses**
- micro-interactions.tsx (ui/micro-interactions.tsx) - **4 uses**
- ux-patterns.tsx (ui/ux-patterns.tsx) - **4 uses**
- config-revert-button.tsx (config-revert-button.tsx) - **2 uses**
- consent.tsx (consent.tsx) - **2 uses**
- email-modal.tsx (email-modal.tsx) - **2 uses**
- modules-editor.tsx (modules-editor.tsx) - **2 uses**
- settings-form.tsx (settings-form.tsx) - **2 uses**
- brand-aware-error-notification.tsx (ui/brand-aware-error-notification.tsx) - **2 uses**
... and 139 more

### Potentially Unused Components (177)

These components are not imported by other components (may still be used directly by pages):

- accordion.tsx (ui/accordion.tsx)
- AdvancedSearch.tsx (hero-tasks/AdvancedSearch.tsx)
- AdvancedSearchBar.tsx (hero-tasks/AdvancedSearchBar.tsx)
- AIIntelligence.tsx (hero-tasks/AIIntelligence.tsx)
- alert-dialog.tsx (ui/alert-dialog.tsx)
- analytics-dashboard.tsx (analytics/analytics-dashboard.tsx)
- aspect-ratio.tsx (ui/aspect-ratio.tsx)
- AuditLogViewer.tsx (audit/AuditLogViewer.tsx)
- auto-save-recovery.tsx (auto-save-recovery.tsx)
- auto-save-status.tsx (auto-save-status.tsx)
- brand-aware-badge.tsx (ui/brand-aware-badge.tsx)
- brand-aware-button.tsx (ui/brand-aware-button.tsx)
- brand-aware-input.tsx (ui/brand-aware-input.tsx)
- brand-management-interface.tsx (admin/brand-management/brand-management-interface.tsx)
- brand-switching-transitions.tsx (branding/brand-switching-transitions.tsx)
- BrandAwareNavigation.tsx (branding/BrandAwareNavigation.tsx)
- BrandComplianceDashboard.tsx (brand/BrandComplianceDashboard.tsx)
- BrandIntegrationDemo.tsx (branding/BrandIntegrationDemo.tsx)
- BrandProvider.tsx (branding/BrandProvider.tsx)
- BrandStylingProvider.tsx (branding/BrandStylingProvider.tsx)
... and 157 more

## Architecture Assessment

✅ **Balanced architecture**: Reasonable balance between UI and business logic components.

✅ **Good reusability**: Appropriate number of heavily-used core components suggests good component design.

⚠️ **Many unused components**: High number of unused components might indicate over-engineering or abandoned code.

✅ **Low complexity**: Average of 1.9 dependencies per component suggests good modularity.
