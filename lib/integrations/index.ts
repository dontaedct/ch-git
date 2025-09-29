/**
 * Integration System Main Entry Point
 * 
 * Centralized exports and initialization for the integration system.
 */

// Core types and interfaces
export * from './types';

// Registry and management
export * from './registry';

// Custom integration builder
export * from './custom-builder';

// Provider implementations
export * from './providers/stripe';
export * from './providers/email';
export * from './providers/crm';
export * from './providers/analytics';
export * from './providers/social-media';

// Initialize all providers
import { initializeIntegrationRegistry } from './registry';
import { registerStripeProvider } from './providers/stripe';
import { registerEmailProviders } from './providers/email';
import { registerCrmProviders } from './providers/crm';
import { registerAnalyticsProviders } from './providers/analytics';
import { registerSocialMediaProviders } from './providers/social-media';

/**
 * Initialize the complete integration system
 */
export function initializeIntegrationSystem() {
  const registry = initializeIntegrationRegistry();
  
  // Register all providers
  registerStripeProvider();
  registerEmailProviders();
  registerCrmProviders();
  registerAnalyticsProviders();
  registerSocialMediaProviders();
  
  return registry;
}

/**
 * Get integration system status
 */
export function getIntegrationSystemStatus() {
  const registry = initializeIntegrationSystem();
  
  return {
    initialized: true,
    providers: registry.getAllProviders().length,
    categories: Array.from(new Set(registry.getAllProviders().map(p => p.category))),
    lastUpdated: new Date().toISOString()
  };
}
