// Emails registry - All email template IDs and subjects
import { generateDynamicSystemStrings } from '@/lib/branding/system-strings';
import { DEFAULT_BRAND_CONFIG } from '@/lib/branding/logo-manager';

// Generate dynamic email subjects
const dynamicStrings = generateDynamicSystemStrings(DEFAULT_BRAND_CONFIG.brandName);

export const emails = {
  // Template IDs
  templates: {
    invite: 'invite',
    confirmation: 'confirmation',
    welcome: 'welcome',
    'weekly-recap': 'weekly-recap',
    'plan-ready': 'plan-ready',
    'check-in-reminder': 'check-in-reminder',
  },
  
  // Email subjects (now dynamic)
  subjects: {
    invite: 'You\'re invited: {session_title}',
    confirmation: 'Confirmed: {session_title}',
    welcome: dynamicStrings.welcomeMessage,
    'weekly-recap': 'Your weekly recap',
    'plan-ready': 'Your plan is ready',
    'check-in-reminder': 'Please check in',
  },
  
  // Email types
  types: {
    transactional: 'transactional',
    marketing: 'marketing',
    notification: 'notification',
  },
} as const;

export type EmailTemplateId = keyof typeof emails.templates;
export type EmailSubject = keyof typeof emails.subjects;
export type EmailType = keyof typeof emails.types;

// Helper functions
export function getEmailTemplate(id: EmailTemplateId): string {
  return emails.templates[id];
}

export function getEmailSubject(id: EmailSubject): string {
  return emails.subjects[id];
}

export function getEmailType(type: EmailType): string {
  return emails.types[type];
}

// Email validation
export function isValidEmailTemplate(id: string): id is EmailTemplateId {
  return id in emails.templates;
}

export function isValidEmailSubject(id: string): id is EmailSubject {
  return id in emails.subjects;
}

// Template variables
export const emailVariables = {
  session_title: '{session_title}',
  coach_name: '{coach_name}',
  week_start: '{week_start}',
  view_url: '{view_url}',
  check_in_link: '{check_in_link}',
} as const;
