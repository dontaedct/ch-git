/**
 * HT-022.3.1 & HT-022.3.2: Basic Module Registry & Tenant Theming System
 *
 * Main entry point for the basic module system with registry, lifecycle,
 * configuration management, and tenant theming.
 */

// Core registry functionality (HT-022.3.1)
export * from './basic-registry'
export * from './module-lifecycle'
export * from './module-config'

// Tenant theming and security (HT-022.3.2)
export * from './tenant-theming'
export * from './tenant-security'

// Re-export existing module utilities for compatibility
export * from './actions'
export * from './runtime-config-actions'
export * from './catalog-actions'

// Legacy compatibility - client-safe module registry
// Note: Server-side module config moved to API routes for client safety