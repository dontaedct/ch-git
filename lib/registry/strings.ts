// System strings registry - All system names, brand references, and user-facing text
// Note: Brand-specific strings are now managed by the dynamic branding system
// This file contains only non-brand-specific system strings

import { generateDynamicSystemStrings, initializeSystemStrings } from '@/lib/branding/system-strings';
import { DEFAULT_BRAND_CONFIG } from '@/lib/branding/logo-manager';

// Initialize dynamic system strings
const dynamicStrings = generateDynamicSystemStrings(DEFAULT_BRAND_CONFIG.brandName);
initializeSystemStrings(DEFAULT_BRAND_CONFIG.brandName);

export const systemStrings = {
  // Core application names (non-brand-specific)
  // Brand-specific names are now handled by DynamicBrandName component
  
  // Email and communication (now dynamic)
  emailFrom: dynamicStrings.emailFrom,
  welcomeMessage: dynamicStrings.welcomeMessage,
  transactionalFooter: dynamicStrings.transactionalFooter,
  
  // Page titles and metadata (now dynamic)
  pageTitle: dynamicStrings.pageTitle,
  pageDescription: dynamicStrings.pageDescription,
  
  // System names (for future rename capability)
  aiSystem: dynamicStrings.aiSystem,
  guardianSystem: dynamicStrings.guardianSystem,
  designSystem: dynamicStrings.designSystem,
} as const;

export type SystemStringKey = keyof typeof systemStrings;
export type SystemStringValue = typeof systemStrings[SystemStringKey];

// Helper functions
export function getSystemString(key: SystemStringKey): SystemStringValue {
  return systemStrings[key];
}

export function isSystemString(value: string): value is SystemStringValue {
  return Object.values(systemStrings).includes(value as SystemStringValue);
}

export function getSystemStringKey(value: string): SystemStringKey | null {
  const entry = Object.entries(systemStrings).find(([_, stringValue]) => stringValue === value);
  return entry ? (entry[0] as SystemStringKey) : null;
}

// Validation
export function validateSystemString(key: string): key is SystemStringKey {
  return key in systemStrings;
}

// Get all system strings for bulk operations
export function getAllSystemStrings(): Record<SystemStringKey, SystemStringValue> {
  return { ...systemStrings };
}
