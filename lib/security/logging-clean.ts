/**
 * Security Event Logging Module - Clean Version
 * 
 * Structured logging for security events with correlation IDs,
 * risk scoring, and integration with monitoring systems.
 */

import { logger } from '../logger';

export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: SecurityEventSource;
  context: SecurityEventContext;
  action?: SecurityAction;
  outcome: 'allowed' | 'blocked' | 'rate_limited' | 'suspicious';
  metadata?: Record<string, any>;
}

export type SecurityEventType =
  | 'request_received'
  | 'rate_limit_exceeded'
  | 'bot_detected'
  | 'suspicious_pattern'
  | 'malicious_payload'
  | 'authentication_failure'
  | 'authorization_failure'
  | 'csp_violation'
  | 'security_header_missing'
  | 'ip_blocked'
  | 'admin_access_attempt'
  | 'webhook_verification_failed';

export type SecuritySeverity =
  | 'low'      // Normal operations, monitoring
  | 'medium'   // Suspicious activity, investigate
  | 'high'     // Active threat, immediate attention
  | 'critical'; // System compromise, emergency response

export interface SecurityEventSource {
  ip: string;
  userAgent: string;
  route: string;
  method: string;
  origin?: string;
  referer?: string;
}

export interface SecurityEventContext {
  sessionId?: string;
  userId?: string;
  tenantId?: string;
  requestId: string;
  isBot: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

export interface SecurityAction {
  type: 'block' | 'rate_limit' | 'challenge' | 'monitor' | 'alert';
  reason: string;
  duration?: number; // in milliseconds
  retryAfter?: number; // in seconds
}

/**
 * Generate unique correlation ID for request tracking
 */
export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sec_${timestamp}_${random}`;
}

/**
 * Determine severity based on event type and context
 */
export function calculateEventSeverity(
  type: SecurityEventType,
  context: SecurityEventContext,
  outcome: SecurityEvent['outcome']
): SecuritySeverity {
  // Critical events
  if (type === 'malicious_payload' || type === 'ip_blocked') {
    return 'critical';
  }
  
  // High severity events
  if (
    type === 'admin_access_attempt' ||
    type === 'authentication_failure' ||
    type === 'webhook_verification_failed' ||
    (type === 'suspicious_pattern' && context.riskLevel === 'high')
  ) {
    return 'high';
  }
  
  // Medium severity events
  if (
    type === 'rate_limit_exceeded' ||
    type === 'bot_detected' ||
    type === 'authorization_failure' ||
    type === 'csp_violation' ||
    outcome === 'blocked'
  ) {
    return 'medium';
  }
  
  // Low severity (monitoring)
  return 'low';
}

/**
 * Create structured security event
 */
export function createSecurityEvent(
  type: SecurityEventType,
  source: SecurityEventSource,
  context: SecurityEventContext,
  outcome: SecurityEvent['outcome'],
  options: {
    action?: SecurityAction;
    metadata?: Record<string, any>;
  } = {}
): SecurityEvent {
  const event: SecurityEvent = {
    id: generateCorrelationId(),
    timestamp: new Date().toISOString(),
    type,
    severity: calculateEventSeverity(type, context, outcome),
    source,
    context,
    outcome,
    ...options
  };
  
  return event;
}

/**
 * Log security event with appropriate level
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logData = {
    ...event,
    '@timestamp': event.timestamp,
    '@type': 'security_event',
    environment: process.env.NODE_ENV || 'unknown',
    service: 'dct-microapps'
  };
  
  switch (event.severity) {
    case 'critical':
      logger.error('Security Event - CRITICAL', logData);
      break;
    case 'high':
      logger.warn('Security Event - HIGH', logData);
      break;
    case 'medium':
      logger.warn('Security Event - MEDIUM', logData);
      break;
    case 'low':
    default:
      logger.info('Security Event - LOW', logData);
      break;
  }
}

/**
 * Log request with security context
 */
export function logSecurityRequest(
  type: SecurityEventType,
  source: SecurityEventSource,
  context: SecurityEventContext,
  outcome: SecurityEvent['outcome'],
  options?: {
    action?: SecurityAction;
    metadata?: Record<string, any>;
  }
): string {
  const event = createSecurityEvent(type, source, context, outcome, options);
  logSecurityEvent(event);
  return event.id;
}