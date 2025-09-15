/**
 * @fileoverview Client-Specific Security Boundaries for Agency Toolkit
 * @module lib/agency-toolkit/client-security
 * @author HT-021.4.2
 * @version 1.0.0
 *
 * HT-021.4.2: Basic Client-Specific Security Boundaries
 *
 * Provides security isolation and boundaries between different client
 * micro-apps to ensure data privacy and access control.
 */

import { SecurityContext } from '../security/headers';

export interface ClientSecurityConfig {
  /** Client identifier */
  clientId: string;
  /** Client name */
  clientName: string;
  /** Security tier */
  tier: 'basic' | 'standard' | 'premium' | 'enterprise';
  /** Allowed domains */
  allowedDomains: string[];
  /** IP whitelist */
  ipWhitelist?: string[];
  /** Rate limiting configuration */
  rateLimit: {
    requests: number;
    window: number; // seconds
    burst?: number;
  };
  /** Authentication requirements */
  auth: {
    required: boolean;
    methods: ('password' | 'oauth' | 'sso' | 'mfa')[];
    sessionTimeout: number; // seconds
  };
  /** Data access permissions */
  permissions: {
    read: string[]; // Resource patterns
    write: string[]; // Resource patterns
    delete: string[]; // Resource patterns
    admin: string[]; // Admin resource patterns
  };
  /** Audit logging */
  audit: {
    enabled: boolean;
    level: 'minimal' | 'standard' | 'detailed';
    retention: number; // days
  };
  /** Encryption requirements */
  encryption: {
    inTransit: boolean;
    atRest: boolean;
    keyRotation: number; // days
  };
}

export interface ClientSecurityBoundary {
  /** Boundary identifier */
  id: string;
  /** Client security configuration */
  config: ClientSecurityConfig;
  /** Resource isolation rules */
  isolation: ResourceIsolationRules;
  /** Security policies */
  policies: SecurityPolicy[];
  /** Active sessions */
  sessions: Map<string, ClientSession>;
  /** Security violations */
  violations: SecurityViolation[];
  /** Creation timestamp */
  createdAt: Date;
  /** Last updated */
  updatedAt: Date;
}

export interface ResourceIsolationRules {
  /** Database isolation */
  database: {
    schema: string;
    tablePrefix: string;
    rowLevelSecurity: boolean;
  };
  /** Storage isolation */
  storage: {
    bucketPrefix: string;
    pathPrefix: string;
    encryption: boolean;
  };
  /** API isolation */
  api: {
    pathPrefix: string;
    subdomain?: string;
    rateLimiting: boolean;
  };
  /** Cache isolation */
  cache: {
    keyPrefix: string;
    namespace: string;
    ttl: number; // seconds
  };
}

export interface SecurityPolicy {
  /** Policy identifier */
  id: string;
  /** Policy name */
  name: string;
  /** Policy type */
  type: 'access' | 'data' | 'network' | 'audit' | 'custom';
  /** Policy rules */
  rules: PolicyRule[];
  /** Policy enabled */
  enabled: boolean;
  /** Policy priority */
  priority: number;
}

export interface PolicyRule {
  /** Rule identifier */
  id: string;
  /** Rule condition */
  condition: string; // Expression or pattern
  /** Rule action */
  action: 'allow' | 'deny' | 'log' | 'alert';
  /** Rule parameters */
  parameters: Record<string, any>;
}

export interface ClientSession {
  /** Session identifier */
  id: string;
  /** Client identifier */
  clientId: string;
  /** User identifier */
  userId: string;
  /** Session data */
  data: Record<string, any>;
  /** Session expiry */
  expiresAt: Date;
  /** Last activity */
  lastActivity: Date;
  /** IP address */
  ipAddress: string;
  /** User agent */
  userAgent: string;
}

export interface SecurityViolation {
  /** Violation identifier */
  id: string;
  /** Client identifier */
  clientId: string;
  /** Violation type */
  type: 'access_denied' | 'rate_limit' | 'suspicious_activity' | 'data_breach' | 'policy_violation';
  /** Violation severity */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** Violation description */
  description: string;
  /** Violation context */
  context: {
    resource?: string;
    user?: string;
    ip?: string;
    userAgent?: string;
    timestamp: Date;
  };
  /** Violation resolved */
  resolved: boolean;
  /** Resolution notes */
  resolutionNotes?: string;
  /** Creation timestamp */
  createdAt: Date;
}

/**
 * Client Security Manager
 */
export class ClientSecurityManager {
  private boundaries: Map<string, ClientSecurityBoundary> = new Map();
  private rateLimitCounters: Map<string, Map<string, number>> = new Map();

  /**
   * Create client security boundary
   */
  async createSecurityBoundary(config: ClientSecurityConfig): Promise<ClientSecurityBoundary> {
    const boundary: ClientSecurityBoundary = {
      id: this.generateBoundaryId(),
      config,
      isolation: this.generateDefaultIsolationRules(config),
      policies: this.generateDefaultPolicies(config),
      sessions: new Map(),
      violations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.boundaries.set(config.clientId, boundary);
    return boundary;
  }

  /**
   * Get client security boundary
   */
  getSecurityBoundary(clientId: string): ClientSecurityBoundary | null {
    return this.boundaries.get(clientId) || null;
  }

  /**
   * Validate client access
   */
  async validateAccess(
    clientId: string,
    resource: string,
    action: 'read' | 'write' | 'delete' | 'admin',
    context: SecurityContext
  ): Promise<{
    allowed: boolean;
    reason?: string;
    requiresAuth?: boolean;
  }> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) {
      return { allowed: false, reason: 'Client security boundary not found' };
    }

    // Check domain restrictions
    if (boundary.config.allowedDomains.length > 0) {
      // This would be implemented with actual domain validation
      // For now, we'll assume domain is valid
    }

    // Check IP whitelist
    if (boundary.config.ipWhitelist && boundary.config.ipWhitelist.length > 0) {
      if (!boundary.config.ipWhitelist.includes(context.ip)) {
        await this.recordViolation(clientId, {
          type: 'access_denied',
          severity: 'high',
          description: `IP ${context.ip} not in whitelist`,
          context: {
            resource,
            ip: context.ip,
            userAgent: context.userAgent,
            timestamp: new Date(),
          },
        });
        return { allowed: false, reason: 'IP not whitelisted' };
      }
    }

    // Check rate limiting
    const rateLimitCheck = await this.checkRateLimit(clientId, context.ip);
    if (!rateLimitCheck.allowed) {
      await this.recordViolation(clientId, {
        type: 'rate_limit',
        severity: 'medium',
        description: `Rate limit exceeded for IP ${context.ip}`,
        context: {
          resource,
          ip: context.ip,
          userAgent: context.userAgent,
          timestamp: new Date(),
        },
      });
      return { allowed: false, reason: 'Rate limit exceeded' };
    }

    // Check resource permissions
    const hasPermission = this.checkResourcePermission(boundary, resource, action);
    if (!hasPermission) {
      await this.recordViolation(clientId, {
        type: 'access_denied',
        severity: 'medium',
        description: `Access denied to ${resource} for action ${action}`,
        context: {
          resource,
          ip: context.ip,
          userAgent: context.userAgent,
          timestamp: new Date(),
        },
      });
      return { allowed: false, reason: 'Insufficient permissions' };
    }

    // Check authentication requirements
    if (boundary.config.auth.required) {
      return { allowed: true, requiresAuth: true };
    }

    return { allowed: true };
  }

  /**
   * Create client session
   */
  async createSession(
    clientId: string,
    userId: string,
    context: SecurityContext,
    data: Record<string, any> = {}
  ): Promise<ClientSession | null> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) return null;

    const session: ClientSession = {
      id: this.generateSessionId(),
      clientId,
      userId,
      data,
      expiresAt: new Date(Date.now() + boundary.config.auth.sessionTimeout * 1000),
      lastActivity: new Date(),
      ipAddress: context.ip,
      userAgent: context.userAgent,
    };

    boundary.sessions.set(session.id, session);
    return session;
  }

  /**
   * Validate client session
   */
  async validateSession(clientId: string, sessionId: string): Promise<ClientSession | null> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) return null;

    const session = boundary.sessions.get(sessionId);
    if (!session) return null;

    // Check expiry
    if (session.expiresAt < new Date()) {
      boundary.sessions.delete(sessionId);
      return null;
    }

    // Update last activity
    session.lastActivity = new Date();
    return session;
  }

  /**
   * Revoke client session
   */
  async revokeSession(clientId: string, sessionId: string): Promise<boolean> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) return false;

    return boundary.sessions.delete(sessionId);
  }

  /**
   * Check rate limiting
   */
  private async checkRateLimit(clientId: string, identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) return { allowed: true, remaining: 0, resetTime: new Date() };

    const { requests, window } = boundary.config.rateLimit;
    const key = `${clientId}:${identifier}`;

    if (!this.rateLimitCounters.has(clientId)) {
      this.rateLimitCounters.set(clientId, new Map());
    }

    const clientCounters = this.rateLimitCounters.get(clientId)!;
    const now = Date.now();
    const windowStart = Math.floor(now / (window * 1000)) * (window * 1000);
    const windowKey = `${key}:${windowStart}`;

    const currentCount = clientCounters.get(windowKey) || 0;
    const remaining = Math.max(0, requests - currentCount - 1);

    if (currentCount >= requests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(windowStart + window * 1000),
      };
    }

    clientCounters.set(windowKey, currentCount + 1);

    // Clean up old counters
    for (const [counterKey] of clientCounters) {
      const [, , timestamp] = counterKey.split(':');
      if (parseInt(timestamp) < now - window * 1000) {
        clientCounters.delete(counterKey);
      }
    }

    return {
      allowed: true,
      remaining,
      resetTime: new Date(windowStart + window * 1000),
    };
  }

  /**
   * Check resource permission
   */
  private checkResourcePermission(
    boundary: ClientSecurityBoundary,
    resource: string,
    action: 'read' | 'write' | 'delete' | 'admin'
  ): boolean {
    const permissions = boundary.config.permissions[action];
    return permissions.some(pattern => this.matchPattern(resource, pattern));
  }

  /**
   * Match resource pattern
   */
  private matchPattern(resource: string, pattern: string): boolean {
    // Simple pattern matching (would be more sophisticated in production)
    if (pattern === '*') return true;
    if (pattern.endsWith('*')) {
      return resource.startsWith(pattern.slice(0, -1));
    }
    return resource === pattern;
  }

  /**
   * Record security violation
   */
  private async recordViolation(
    clientId: string,
    violation: Omit<SecurityViolation, 'id' | 'clientId' | 'resolved' | 'createdAt'>
  ): Promise<void> {
    const boundary = this.getSecurityBoundary(clientId);
    if (!boundary) return;

    const fullViolation: SecurityViolation = {
      id: this.generateViolationId(),
      clientId,
      ...violation,
      resolved: false,
      createdAt: new Date(),
    };

    boundary.violations.push(fullViolation);

    // Log violation based on audit level
    if (boundary.config.audit.enabled) {
      console.warn('Security violation recorded:', fullViolation);
    }
  }

  /**
   * Generate default isolation rules
   */
  private generateDefaultIsolationRules(config: ClientSecurityConfig): ResourceIsolationRules {
    const prefix = config.clientId.toLowerCase().replace(/[^a-z0-9]/g, '_');

    return {
      database: {
        schema: `client_${prefix}`,
        tablePrefix: `${prefix}_`,
        rowLevelSecurity: true,
      },
      storage: {
        bucketPrefix: `${prefix}`,
        pathPrefix: `clients/${config.clientId}`,
        encryption: config.encryption.atRest,
      },
      api: {
        pathPrefix: `/api/client/${config.clientId}`,
        subdomain: config.tier === 'enterprise' ? prefix : undefined,
        rateLimiting: true,
      },
      cache: {
        keyPrefix: `client:${config.clientId}`,
        namespace: prefix,
        ttl: 3600, // 1 hour
      },
    };
  }

  /**
   * Generate default security policies
   */
  private generateDefaultPolicies(config: ClientSecurityConfig): SecurityPolicy[] {
    const policies: SecurityPolicy[] = [];

    // Access control policy
    policies.push({
      id: 'access_control',
      name: 'Access Control',
      type: 'access',
      enabled: true,
      priority: 1,
      rules: [
        {
          id: 'require_auth',
          condition: 'request.authenticated === false',
          action: config.auth.required ? 'deny' : 'allow',
          parameters: { message: 'Authentication required' },
        },
      ],
    });

    // Data protection policy
    if (config.tier !== 'basic') {
      policies.push({
        id: 'data_protection',
        name: 'Data Protection',
        type: 'data',
        enabled: true,
        priority: 2,
        rules: [
          {
            id: 'encrypt_sensitive',
            condition: 'data.sensitive === true',
            action: 'allow',
            parameters: { requireEncryption: true },
          },
        ],
      });
    }

    // Audit logging policy
    if (config.audit.enabled) {
      policies.push({
        id: 'audit_logging',
        name: 'Audit Logging',
        type: 'audit',
        enabled: true,
        priority: 3,
        rules: [
          {
            id: 'log_all_access',
            condition: 'true',
            action: 'log',
            parameters: { level: config.audit.level },
          },
        ],
      });
    }

    return policies;
  }

  /**
   * Generate boundary ID
   */
  private generateBoundaryId(): string {
    return `boundary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
  }

  /**
   * Generate violation ID
   */
  private generateViolationId(): string {
    return `viol_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Default security configurations by tier
 */
export const DEFAULT_SECURITY_CONFIGS = {
  BASIC: {
    tier: 'basic' as const,
    rateLimit: { requests: 100, window: 60 },
    auth: {
      required: false,
      methods: ['password'] as const,
      sessionTimeout: 1800, // 30 minutes
    },
    permissions: {
      read: ['*'],
      write: ['*'],
      delete: [],
      admin: [],
    },
    audit: {
      enabled: false,
      level: 'minimal' as const,
      retention: 7,
    },
    encryption: {
      inTransit: true,
      atRest: false,
      keyRotation: 90,
    },
  },
  STANDARD: {
    tier: 'standard' as const,
    rateLimit: { requests: 500, window: 60 },
    auth: {
      required: true,
      methods: ['password', 'oauth'] as const,
      sessionTimeout: 3600, // 1 hour
    },
    permissions: {
      read: ['*'],
      write: ['data/*', 'user/*'],
      delete: ['user/*'],
      admin: [],
    },
    audit: {
      enabled: true,
      level: 'standard' as const,
      retention: 30,
    },
    encryption: {
      inTransit: true,
      atRest: true,
      keyRotation: 60,
    },
  },
  PREMIUM: {
    tier: 'premium' as const,
    rateLimit: { requests: 1000, window: 60 },
    auth: {
      required: true,
      methods: ['password', 'oauth', 'sso'] as const,
      sessionTimeout: 7200, // 2 hours
    },
    permissions: {
      read: ['*'],
      write: ['*'],
      delete: ['*'],
      admin: ['settings/*'],
    },
    audit: {
      enabled: true,
      level: 'detailed' as const,
      retention: 90,
    },
    encryption: {
      inTransit: true,
      atRest: true,
      keyRotation: 30,
    },
  },
  ENTERPRISE: {
    tier: 'enterprise' as const,
    rateLimit: { requests: 5000, window: 60 },
    auth: {
      required: true,
      methods: ['password', 'oauth', 'sso', 'mfa'] as const,
      sessionTimeout: 14400, // 4 hours
    },
    permissions: {
      read: ['*'],
      write: ['*'],
      delete: ['*'],
      admin: ['*'],
    },
    audit: {
      enabled: true,
      level: 'detailed' as const,
      retention: 365,
    },
    encryption: {
      inTransit: true,
      atRest: true,
      keyRotation: 15,
    },
  },
} as const;

/**
 * Global client security manager instance
 */
export const clientSecurityManager = new ClientSecurityManager();