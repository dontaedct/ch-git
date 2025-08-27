// System strings registry - All system names, brand references, and user-facing text
export const systemStrings = {
  // Core application names
  appName: 'Micro App Template',
  organizationName: 'Your Organization',
  fullBrand: 'Your Organization — Micro App',
  
  // Email and communication
  emailFrom: 'Micro App <no-reply@example.com>',
  welcomeMessage: 'Welcome to Your Micro App',
  transactionalFooter: 'This is a transactional message from Your Micro App.',
  
  // Page titles and metadata
  pageTitle: 'Micro App Template',
  pageDescription: 'A modern micro web application template',
  
  // Navigation and UI
  navBrand: 'Micro App',
  navFullBrand: 'Your Organization — Micro App',
  
  // System names (for future rename capability)
  aiSystem: 'OSS Hero',
  guardianSystem: 'Guardian',
  designSystem: 'Design Guardian',
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
