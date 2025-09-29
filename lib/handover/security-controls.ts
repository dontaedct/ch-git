import { createHash, randomBytes } from 'crypto';

export interface SecurityPolicy {
  id: string;
  name: string;
  rules: SecurityRule[];
  isActive: boolean;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: Date;
  updatedAt: Date;
}

export interface SecurityRule {
  id: string;
  type: 'rate_limit' | 'ip_whitelist' | 'session_timeout' | 'password_policy' | 'access_hours' | 'geo_restriction';
  parameters: Record<string, any>;
  description: string;
  isEnabled: boolean;
}

export interface SecurityEvent {
  id: string;
  clientId: string;
  userId?: string;
  eventType: 'login' | 'logout' | 'access_denied' | 'suspicious_activity' | 'security_violation';
  severity: 'info' | 'warning' | 'error' | 'critical';
  description: string;
  metadata: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  clientId: string;
  ipAddress: string;
  userAgent: string;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}

export class ClientSecurityControls {
  private securityPolicies: Map<string, SecurityPolicy> = new Map();
  private activeSessions: Map<string, SessionInfo> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private ipAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();

  constructor() {
    this.initializeDefaultPolicies();
  }

  // Security Policy Management
  async createSecurityPolicy(
    clientId: string,
    name: string,
    rules: Omit<SecurityRule, 'id'>[],
    severity: SecurityPolicy['severity'] = 'medium'
  ): Promise<SecurityPolicy> {
    const policy: SecurityPolicy = {
      id: `policy_${clientId}_${Date.now()}`,
      name,
      rules: rules.map(rule => ({
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      isActive: true,
      severity,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.securityPolicies.set(policy.id, policy);
    return policy;
  }

  async updateSecurityPolicy(policyId: string, updates: Partial<SecurityPolicy>): Promise<SecurityPolicy> {
    const policy = this.securityPolicies.get(policyId);
    if (!policy) {
      throw new Error('Security policy not found');
    }

    const updatedPolicy = {
      ...policy,
      ...updates,
      updatedAt: new Date()
    };

    this.securityPolicies.set(policyId, updatedPolicy);
    return updatedPolicy;
  }

  async getClientSecurityPolicies(clientId: string): Promise<SecurityPolicy[]> {
    return Array.from(this.securityPolicies.values())
      .filter(policy => policy.id.includes(clientId));
  }

  // Authentication Security
  async validateLoginAttempt(
    clientId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ allowed: boolean; reason?: string }> {
    const policies = await this.getClientSecurityPolicies(clientId);

    // Check rate limiting
    const rateLimitResult = this.checkRateLimit(ipAddress, policies);
    if (!rateLimitResult.allowed) {
      return rateLimitResult;
    }

    // Check IP whitelist
    const ipWhitelistResult = this.checkIpWhitelist(ipAddress, policies);
    if (!ipWhitelistResult.allowed) {
      return ipWhitelistResult;
    }

    // Check access hours
    const accessHoursResult = this.checkAccessHours(policies);
    if (!accessHoursResult.allowed) {
      return accessHoursResult;
    }

    // Check geo restrictions
    const geoResult = await this.checkGeoRestrictions(ipAddress, policies);
    if (!geoResult.allowed) {
      return geoResult;
    }

    return { allowed: true };
  }

  async createSecureSession(
    userId: string,
    clientId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<SessionInfo> {
    const sessionId = this.generateSecureSessionId();
    const policies = await this.getClientSecurityPolicies(clientId);
    const sessionTimeout = this.getSessionTimeout(policies);

    const session: SessionInfo = {
      sessionId,
      userId,
      clientId,
      ipAddress,
      userAgent,
      createdAt: new Date(),
      lastActivity: new Date(),
      expiresAt: new Date(Date.now() + sessionTimeout),
      isActive: true
    };

    this.activeSessions.set(sessionId, session);

    await this.logSecurityEvent({
      clientId,
      userId,
      eventType: 'login',
      severity: 'info',
      description: 'User logged in successfully',
      metadata: { sessionId, ipAddress, userAgent },
      ipAddress,
      userAgent
    });

    return session;
  }

  async validateSession(sessionId: string): Promise<{ valid: boolean; session?: SessionInfo; reason?: string }> {
    const session = this.activeSessions.get(sessionId);

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (!session.isActive) {
      return { valid: false, reason: 'Session is inactive' };
    }

    if (session.expiresAt < new Date()) {
      session.isActive = false;
      this.activeSessions.set(sessionId, session);
      return { valid: false, reason: 'Session expired' };
    }

    // Update last activity
    session.lastActivity = new Date();
    this.activeSessions.set(sessionId, session);

    return { valid: true, session };
  }

  async revokeSession(sessionId: string, reason: string = 'Manual revocation'): Promise<void> {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.isActive = false;
      this.activeSessions.set(sessionId, session);

      await this.logSecurityEvent({
        clientId: session.clientId,
        userId: session.userId,
        eventType: 'logout',
        severity: 'info',
        description: `Session revoked: ${reason}`,
        metadata: { sessionId, reason },
        ipAddress: session.ipAddress,
        userAgent: session.userAgent
      });
    }
  }

  async revokeAllUserSessions(userId: string, clientId: string): Promise<void> {
    const userSessions = Array.from(this.activeSessions.values())
      .filter(session => session.userId === userId && session.clientId === clientId && session.isActive);

    for (const session of userSessions) {
      await this.revokeSession(session.sessionId, 'All sessions revoked');
    }
  }

  // Security Monitoring
  async logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    const securityEvent: SecurityEvent = {
      ...event,
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.securityEvents.push(securityEvent);

    // Trigger alerts for high severity events
    if (event.severity === 'error' || event.severity === 'critical') {
      await this.triggerSecurityAlert(securityEvent);
    }

    // Keep only last 10000 events to prevent memory issues
    if (this.securityEvents.length > 10000) {
      this.securityEvents = this.securityEvents.slice(-10000);
    }
  }

  async getSecurityEvents(
    clientId: string,
    filters?: {
      eventType?: SecurityEvent['eventType'];
      severity?: SecurityEvent['severity'];
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<SecurityEvent[]> {
    let events = this.securityEvents.filter(event => event.clientId === clientId);

    if (filters) {
      if (filters.eventType) {
        events = events.filter(event => event.eventType === filters.eventType);
      }
      if (filters.severity) {
        events = events.filter(event => event.severity === filters.severity);
      }
      if (filters.userId) {
        events = events.filter(event => event.userId === filters.userId);
      }
      if (filters.startDate) {
        events = events.filter(event => event.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        events = events.filter(event => event.timestamp <= filters.endDate!);
      }
    }

    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply limit
    const limit = filters?.limit || 100;
    return events.slice(0, limit);
  }

  async detectSuspiciousActivity(clientId: string): Promise<SecurityEvent[]> {
    const recentEvents = await this.getSecurityEvents(clientId, {
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
    });

    const suspiciousEvents: SecurityEvent[] = [];

    // Detect multiple failed login attempts
    const failedLogins = recentEvents.filter(event =>
      event.eventType === 'access_denied' &&
      event.metadata.reason === 'invalid_credentials'
    );

    if (failedLogins.length > 10) {
      suspiciousEvents.push({
        id: `suspicious_${Date.now()}`,
        clientId,
        eventType: 'suspicious_activity',
        severity: 'warning',
        description: `Multiple failed login attempts detected: ${failedLogins.length} attempts`,
        metadata: { failedLoginCount: failedLogins.length },
        timestamp: new Date()
      });
    }

    // Detect unusual access patterns
    const ipAddresses = new Set(recentEvents.map(event => event.ipAddress).filter(Boolean));
    if (ipAddresses.size > 20) {
      suspiciousEvents.push({
        id: `suspicious_${Date.now()}_ip`,
        clientId,
        eventType: 'suspicious_activity',
        severity: 'warning',
        description: `Access from unusual number of IP addresses: ${ipAddresses.size}`,
        metadata: { uniqueIpCount: ipAddresses.size },
        timestamp: new Date()
      });
    }

    return suspiciousEvents;
  }

  // Private Methods
  private checkRateLimit(
    ipAddress: string,
    policies: SecurityPolicy[]
  ): { allowed: boolean; reason?: string } {
    const rateLimitRule = this.findRule(policies, 'rate_limit');
    if (!rateLimitRule || !rateLimitRule.isEnabled) {
      return { allowed: true };
    }

    const { maxAttempts = 5, windowMinutes = 15 } = rateLimitRule.parameters;
    const windowMs = windowMinutes * 60 * 1000;

    const attempts = this.ipAttempts.get(ipAddress);
    if (!attempts) {
      this.ipAttempts.set(ipAddress, { count: 1, lastAttempt: new Date() });
      return { allowed: true };
    }

    const timeSinceLastAttempt = Date.now() - attempts.lastAttempt.getTime();

    if (timeSinceLastAttempt > windowMs) {
      // Reset window
      this.ipAttempts.set(ipAddress, { count: 1, lastAttempt: new Date() });
      return { allowed: true };
    }

    if (attempts.count >= maxAttempts) {
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Increment count
    attempts.count++;
    attempts.lastAttempt = new Date();
    this.ipAttempts.set(ipAddress, attempts);

    return { allowed: true };
  }

  private checkIpWhitelist(
    ipAddress: string,
    policies: SecurityPolicy[]
  ): { allowed: boolean; reason?: string } {
    const whitelistRule = this.findRule(policies, 'ip_whitelist');
    if (!whitelistRule || !whitelistRule.isEnabled) {
      return { allowed: true };
    }

    const { allowedIps = [] } = whitelistRule.parameters;
    if (allowedIps.length === 0) {
      return { allowed: true };
    }

    const isAllowed = allowedIps.some((allowedIp: string) => {
      // Support CIDR notation and exact matches
      return ipAddress === allowedIp || this.ipInRange(ipAddress, allowedIp);
    });

    return isAllowed
      ? { allowed: true }
      : { allowed: false, reason: 'IP address not whitelisted' };
  }

  private checkAccessHours(policies: SecurityPolicy[]): { allowed: boolean; reason?: string } {
    const accessHoursRule = this.findRule(policies, 'access_hours');
    if (!accessHoursRule || !accessHoursRule.isEnabled) {
      return { allowed: true };
    }

    const { startHour = 0, endHour = 23, timezone = 'UTC' } = accessHoursRule.parameters;
    const now = new Date();
    const currentHour = now.getHours(); // Simplified - should use timezone

    if (currentHour >= startHour && currentHour <= endHour) {
      return { allowed: true };
    }

    return { allowed: false, reason: 'Access outside allowed hours' };
  }

  private async checkGeoRestrictions(
    ipAddress: string,
    policies: SecurityPolicy[]
  ): Promise<{ allowed: boolean; reason?: string }> {
    const geoRule = this.findRule(policies, 'geo_restriction');
    if (!geoRule || !geoRule.isEnabled) {
      return { allowed: true };
    }

    // Simplified geo checking - in production would use a geo IP service
    const { allowedCountries = [], blockedCountries = [] } = geoRule.parameters;

    // Mock geo lookup
    const country = 'US'; // Would be determined from IP

    if (blockedCountries.includes(country)) {
      return { allowed: false, reason: 'Access from blocked country' };
    }

    if (allowedCountries.length > 0 && !allowedCountries.includes(country)) {
      return { allowed: false, reason: 'Access from non-allowed country' };
    }

    return { allowed: true };
  }

  private findRule(policies: SecurityPolicy[], ruleType: SecurityRule['type']): SecurityRule | undefined {
    for (const policy of policies) {
      if (!policy.isActive) continue;
      const rule = policy.rules.find(r => r.type === ruleType);
      if (rule) return rule;
    }
    return undefined;
  }

  private getSessionTimeout(policies: SecurityPolicy[]): number {
    const sessionRule = this.findRule(policies, 'session_timeout');
    if (sessionRule && sessionRule.isEnabled) {
      return sessionRule.parameters.timeoutMinutes * 60 * 1000;
    }
    return 24 * 60 * 60 * 1000; // 24 hours default
  }

  private generateSecureSessionId(): string {
    return createHash('sha256')
      .update(randomBytes(32))
      .update(Date.now().toString())
      .digest('hex');
  }

  private ipInRange(ip: string, range: string): boolean {
    // Simplified CIDR checking - in production would use proper library
    if (!range.includes('/')) {
      return ip === range;
    }
    // Basic implementation - would need proper CIDR library
    return false;
  }

  private async triggerSecurityAlert(event: SecurityEvent): Promise<void> {
    console.warn('Security Alert:', {
      clientId: event.clientId,
      eventType: event.eventType,
      severity: event.severity,
      description: event.description,
      timestamp: event.timestamp
    });

    // In production, would send alerts via email, SMS, or monitoring systems
  }

  private initializeDefaultPolicies(): void {
    // Default security policies would be created here
    const defaultPolicy: SecurityPolicy = {
      id: 'default_policy',
      name: 'Default Security Policy',
      rules: [
        {
          id: 'default_rate_limit',
          type: 'rate_limit',
          parameters: { maxAttempts: 5, windowMinutes: 15 },
          description: 'Limit login attempts to 5 per 15 minutes',
          isEnabled: true
        },
        {
          id: 'default_session_timeout',
          type: 'session_timeout',
          parameters: { timeoutMinutes: 60 },
          description: 'Session timeout after 60 minutes of inactivity',
          isEnabled: true
        }
      ],
      isActive: true,
      severity: 'medium',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.securityPolicies.set(defaultPolicy.id, defaultPolicy);
  }
}

export const clientSecurityControls = new ClientSecurityControls();