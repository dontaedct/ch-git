/**
 * UI Polish Feature Flags - Swift-Inspired Aesthetic Implementation
 * 
 * Provides centralized flag management for UI polish features inspired by runswiftapp.com
 * All changes are behind FEATURE_UI_POLISH_TARGET_STYLE flag for safe rollout
 * 
 * Universal Header: @lib/ui-polish-flags.ts
 */

import { isEnabled } from './flags';

// =============================================================================
// UI POLISH FLAG CHECKING
// =============================================================================

/**
 * Check if UI polish target style is enabled
 * Controls all Swift-inspired aesthetic changes
 */
export function isUiPolishEnabled(): boolean {
  return isEnabled('ui_polish_target_style');
}

/**
 * Safely execute UI polish code only if flag is enabled
 */
export function withUiPolish<T>(
  callback: () => T,
  fallback?: () => T
): T | undefined {
  if (isUiPolishEnabled()) {
    return callback();
  } else if (fallback) {
    return fallback();
  }
  
  return undefined;
}

/**
 * Get UI polish variant class names
 * Returns polished variants when enabled, empty string when disabled
 */
export function getUiPolishVariant(enabled: string, disabled: string = ''): string {
  return isUiPolishEnabled() ? enabled : disabled;
}

/**
 * Get UI polish props
 * Returns polished props when enabled, default props when disabled
 */
export function getUiPolishProps<T>(polished: T, defaultProps: T): T {
  return isUiPolishEnabled() ? polished : defaultProps;
}

// =============================================================================
// COMPONENT-SPECIFIC HELPERS
// =============================================================================

/**
 * Get button variant for UI polish
 */
export function getButtonVariant(polishedVariant: string, defaultVariant: string = 'default'): string {
  return getUiPolishVariant(polishedVariant, defaultVariant);
}

/**
 * Get theme mode for UI polish (dark-first)
 */
export function getThemeMode(): 'dark' | 'light' {
  return isUiPolishEnabled() ? 'dark' : 'light';
}

/**
 * Get section spacing for UI polish
 */
export function getSectionSpacing(): string {
  return isUiPolishEnabled() ? 'py-section' : 'py-8';
}

/**
 * Get container max width for UI polish
 */
export function getContainerMaxWidth(): string {
  return isUiPolishEnabled() ? 'max-w-content' : 'max-w-7xl';
}

// =============================================================================
// EXPORT UTILITIES
// =============================================================================

export const uiPolishFlags = {
  isEnabled: isUiPolishEnabled,
  withUiPolish,
  getVariant: getUiPolishVariant,
  getProps: getUiPolishProps,
  getButtonVariant,
  getThemeMode,
  getSectionSpacing,
  getContainerMaxWidth,
};

// Default export for convenience
export default uiPolishFlags;
