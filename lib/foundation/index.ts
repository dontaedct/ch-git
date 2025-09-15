/**
 * HT-021 Foundation Architecture: Main Export
 * 
 * Central export point for all foundation types and interfaces
 * This is the foundation layer that supports HT-022 and HT-023
 */

// Client Theme Types
export * from './types/client-theme';

// Re-export SimpleClientTheme for backward compatibility
export type { SimpleClientTheme } from './types/client-theme';

// Component Customization Types
export * from './types/component-customization';

// State Management Types
export * from './types/state-management';

// Performance Types
export * from './types/performance';
