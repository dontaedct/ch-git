/**
 * @fileoverview Design Safety - Accessibility Test Configuration
 * @description Configuration for axe-core accessibility testing in advisory mode
 * @version 1.0.0
 * @author Design Safety Module
 */

import { AxeBuilder } from '@axe-core/playwright';

export const createAxeBuilder = (page: any) => {
  return new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .withRules({
      // Critical rules that should always pass
      'color-contrast': { enabled: true },
      'document-title': { enabled: true },
      'html-has-lang': { enabled: true },
      'landmark-one-main': { enabled: true },
      'page-has-heading-one': { enabled: true },
      
      // Important rules for forms and navigation
      'label': { enabled: true },
      'button-name': { enabled: true },
      'link-name': { enabled: true },
      'input-image-alt': { enabled: true },
      
      // Advisory rules (will report but not fail)
      'heading-order': { enabled: true },
      'list': { enabled: true },
      'listitem': { enabled: true },
      'region': { enabled: true },
      'skip-link': { enabled: true },
      
      // Disable some rules that are too strict for initial testing
      'color-contrast-enhanced': { enabled: false },
      'focus-order-semantics': { enabled: false },
      'landmark-unique': { enabled: false }
    });
};

export const accessibilityRules = {
  // WCAG 2.1 Level A
  wcag2a: [
    'color-contrast',
    'document-title',
    'html-has-lang',
    'landmark-one-main',
    'page-has-heading-one',
    'label',
    'button-name',
    'link-name'
  ],
  
  // WCAG 2.1 Level AA
  wcag2aa: [
    'color-contrast',
    'document-title',
    'html-has-lang',
    'landmark-one-main',
    'page-has-heading-one',
    'label',
    'button-name',
    'link-name',
    'heading-order',
    'list',
    'listitem'
  ]
};

export const advisoryModeConfig = {
  failOnViolations: false, // Advisory mode - don't fail tests
  reportViolations: true,  // But do report them
  logLevel: 'info'         // Log level for violations
};
