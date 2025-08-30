/**
 * Security Logging Module
 * 
 * Comprehensive security event logging with structured data,
 * metrics collection, and SIEM integration capabilities.
 */

import { Logger } from '../logger';

const logger = Logger.create({ component: 'security-logging' });

// Security event types
export type SecurityEventType = 
  | 'malicious_payload'
  | 'ip_blocked'
  | 'admin_access_attempt'
  | 'authentication_failure'
  | 'webhook_verification_failed'
  | 'suspicious_pattern'
  | 'rate_limit_exceeded'
  | 'bot_detected'
  | 'authorization_failure'
  | 'csp_violation';

// Security event sources
export type SecurityEventSource = 
  | 'api_request'
  | 'webhook'
  | 'cron_job'
  | 'admin_panel'
  | 'user_action';

// Security event context
export interface SecurityEventContext {
  ip: string;
  route: string;
  userAgent?: string;
  isBot: boolean;
  riskLevel: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

// Security event outcomes
export type SecurityEventOutcome = 
  | 'allowed'
  | 'blocked'
  | 'rate_limited'
  | 'logged';

// Security actions
export type SecurityAction = 
  | 'none'
  | 'block_ip'
  | 'rate_limit'
  | 'require_captcha'
  | 'notify_admin';

// Security severity levels
export type SecuritySeverity = 'low' | 'medium' | 'high' | 'critical';

// Security event structure
export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: SecurityEventType;
  severity: SecuritySeverity;
  source: SecurityEventSource;
  context: SecurityEventContext;
  outcome: SecurityEventOutcome;
  action?: SecurityAction;
  metadata?: Record<string, any>;
}

// Security metrics structure
export interface SecurityMetrics {
  requestsTotal: number;
  requestsBlocked: number;
  requestsRateLimited: number;
  botsDetected: number;
  highRiskRequests: number;
  criticalEvents: number;
  uniqueIPs: number;
  topBlockedRoutes: Array<{ route: string; count: number }>;
  topUserAgents: Array<{ userAgent: string; count: number; isBot: boolean }>;
}

// In-memory metrics store
const metricsStore = {
  requestsTotal: 0,
  requestsBlocked: 0,
  requestsRateLimited: 0,
  botsDetected: 0,
  highRiskRequests: 0,
  criticalEvents: 0,
  uniqueIPs: new Set<string>(),
  blockedRoutes: new Map<string, number>(),
  userAgents: new Map<string, { count: number; isBot: boolean }>(),
};

/**
 * Generate correlation ID for event tracking
 */
function generateCorrelationId(): string {
  return `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate event severity based on type and context
 */
function calculateEventSeverity(
  type: SecurityEventType,
  context: SecurityEventContext,
  outcome: SecurityEventOutcome
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
  outcome: SecurityEventOutcome,
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
  
  // Update metrics
  updateSecurityMetrics(event);
  
  return event;
}

/**
 * Update security metrics
 */
function updateSecurityMetrics(event: SecurityEvent): void {
  metricsStore.requestsTotal++;
  metricsStore.uniqueIPs.add(event.context.ip);
  
  if (event.outcome === 'blocked') {
    metricsStore.requestsBlocked++;
    const currentCount = metricsStore.blockedRoutes.get(event.context.route) || 0;
    metricsStore.blockedRoutes.set(event.context.route, currentCount + 1);
  }
  
  if (event.outcome === 'rate_limited') {
    metricsStore.requestsRateLimited++;
  }
  
  if (event.context.isBot) {
    metricsStore.botsDetected++;
  }
  
  if (event.context.riskLevel === 'high') {
    metricsStore.highRiskRequests++;
  }
  
  if (event.severity === 'critical') {
    metricsStore.criticalEvents++;
  }
  
  // Track user agents
  const ua = event.context.userAgent;
  if (ua) {
    const current = metricsStore.userAgents.get(ua) || { count: 0, isBot: event.context.isBot };
    metricsStore.userAgents.set(ua, { 
      count: current.count + 1, 
      isBot: current.isBot || event.context.isBot 
    });
  }
}

/**
 * Log security event with appropriate level
 */
export function logSecurityEvent(event: SecurityEvent): void {
  const logData = {
    ...event,
    '@timestamp': event.timestamp,
    '@type': 'security_event',
    environment: process.env.NODE_ENV ?? 'unknown',
    service: 'dct-microapps'
  };
  
  switch (event.severity) {
    case 'critical':
      logger.error('Security Event - CRITICAL', logData);
      // TODO: Integrate with alerting system (PagerDuty, Slack, etc.)
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
  
  // Additional structured logging for SIEM integration
  if (process.env.SECURITY_LOG_FORMAT === 'json') {
    console.log(JSON.stringify(logData));
  }
}

/**
 * Log request with security context
 */
export function logSecurityRequest(
  type: SecurityEventType,
  source: SecurityEventSource,
  context: SecurityEventContext,
  outcome: SecurityEventOutcome,
  options?: {
    action?: SecurityAction;
    metadata?: Record<string, any>;
  }
): string {
  const event = createSecurityEvent(type, source, context, outcome, options);
  logSecurityEvent(event);
  return event.id;
}

/**
 * Get current security metrics
 */
export function getSecurityMetrics(): SecurityMetrics {
  const topBlockedRoutes = Array.from(metricsStore.blockedRoutes.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([route, count]) => ({ route, count }));
    
  const topUserAgents = Array.from(metricsStore.userAgents.entries())
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .map(([userAgent, data]) => ({ userAgent, count: data.count, isBot: data.isBot }));
  
  return {
    requestsTotal: metricsStore.requestsTotal,
    requestsBlocked: metricsStore.requestsBlocked,
    requestsRateLimited: metricsStore.requestsRateLimited,
    botsDetected: metricsStore.botsDetected,
    highRiskRequests: metricsStore.highRiskRequests,
    criticalEvents: metricsStore.criticalEvents,
    uniqueIPs: metricsStore.uniqueIPs.size,
    topBlockedRoutes,
    topUserAgents
  };
}

/**
 * Reset security metrics (for testing or periodic reset)
 */
export function resetSecurityMetrics(): void {
  metricsStore.requestsTotal = 0;
  metricsStore.requestsBlocked = 0;
  metricsStore.requestsRateLimited = 0;
  metricsStore.botsDetected = 0;
  metricsStore.highRiskRequests = 0;
  metricsStore.criticalEvents = 0;
  metricsStore.uniqueIPs.clear();
  metricsStore.blockedRoutes.clear();
  metricsStore.userAgents.clear();
}

/**
 * Get security events summary for monitoring dashboard
 */
export function getSecuritySummary(): {
  status: 'healthy' | 'warning' | 'critical';
  metrics: SecurityMetrics;
  alerts: string[];
  recommendations: string[];
} {
  const metrics = getSecurityMetrics();
  const alerts: string[] = [];
  const recommendations: string[] = [];
  
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  
  // Determine overall status
  if (metrics.criticalEvents > 0) {
    status = 'critical';
    alerts.push(`${metrics.criticalEvents} critical security events detected`);
  } else if (metrics.highRiskRequests > 50) {
    status = 'warning';
    alerts.push(`High number of risk requests: ${metrics.highRiskRequests}`);
  } else if (metrics.requestsBlocked > 100) {
    status = 'warning';
    alerts.push(`High number of blocked requests: ${metrics.requestsBlocked}`);
  }
  
  // Generate recommendations
  if (metrics.botsDetected > metrics.requestsTotal * 0.5) {
    recommendations.push('Consider implementing stricter bot protection');
  }
  
  if (metrics.requestsBlocked > metrics.requestsTotal * 0.1) {
    recommendations.push('Review blocking rules for potential false positives');
  }
  
  if (metrics.topBlockedRoutes.length > 0) {
    const topRoute = metrics.topBlockedRoutes[0];
    if (topRoute.count > 50) {
      recommendations.push(`Route ${topRoute.route} is being heavily targeted (${topRoute.count} blocks)`);
    }
  }
  
  return {
    status,
    metrics,
    alerts,
    recommendations
  };
}

/**
 * Export security events for analysis (last N events)
 */
export function exportSecurityEvents(limit: number = 1000): SecurityEvent[] {
  // TODO: Implement proper event storage (database/Redis)
  // For now, return empty array as events are only logged
  return [];
}

/**
 * Security event webhook notification (for external monitoring)
 */
export async function notifySecurityEvent(event: SecurityEvent): Promise<void> {
  if (event.severity === 'critical' || event.severity === 'high') {
    // TODO: Implement webhook notifications
    // await fetch(process.env.SECURITY_WEBHOOK_URL, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event)
    // });
    
    logger.warn('High-priority security event - external notification needed', {
      eventId: event.id,
      type: event.type,
      severity: event.severity
    });
  }
}