/**
 * HT-036.3.3: Unified Authentication Integration
 *
 * Provides consistent authentication and authorization across all
 * integrated APIs and services.
 */

import { NextRequest } from 'next/server';
import { createClient } from '@/lib/supabase/client';

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions: string[];
  sessionId: string;
}

export interface AuthResult {
  authenticated: boolean;
  context?: AuthContext;
  error?: string;
}

export interface PermissionCheck {
  resource: string;
  action: string;
  tenantId?: string;
}

const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: [
    'orchestration:*',
    'modules:*',
    'marketplace:*',
    'handover:*',
    'integrations:*',
    'webhooks:*',
    'users:*'
  ],
  manager: [
    'orchestration:read',
    'orchestration:create',
    'modules:read',
    'modules:activate',
    'marketplace:read',
    'marketplace:install',
    'handover:read',
    'handover:create',
    'integrations:read',
    'integrations:configure'
  ],
  user: [
    'orchestration:read',
    'modules:read',
    'marketplace:read',
    'handover:read'
  ]
};

export class AuthIntegration {
  async authenticate(request: NextRequest): Promise<AuthResult> {
    const authHeader = request.headers.get('authorization');
    const sessionCookie = request.cookies.get('session')?.value;

    if (authHeader) {
      return this.authenticateWithToken(authHeader);
    }

    if (sessionCookie) {
      return this.authenticateWithSession(sessionCookie);
    }

    return {
      authenticated: false,
      error: 'No authentication credentials provided'
    };
  }

  private async authenticateWithToken(authHeader: string): Promise<AuthResult> {
    try {
      const token = authHeader.replace('Bearer ', '');

      const supabase = createClient();
      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return {
          authenticated: false,
          error: 'Invalid token'
        };
      }

      const role = user.user_metadata?.role || 'user';
      const permissions = this.getPermissionsForRole(role);

      return {
        authenticated: true,
        context: {
          userId: user.id,
          email: user.email!,
          role,
          tenantId: user.user_metadata?.tenant_id,
          permissions,
          sessionId: `session_${Date.now()}`
        }
      };
    } catch (error) {
      return {
        authenticated: false,
        error: 'Authentication failed'
      };
    }
  }

  private async authenticateWithSession(
    sessionId: string
  ): Promise<AuthResult> {
    try {
      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error || !session) {
        return {
          authenticated: false,
          error: 'Invalid session'
        };
      }

      const user = session.user;
      const role = user.user_metadata?.role || 'user';
      const permissions = this.getPermissionsForRole(role);

      return {
        authenticated: true,
        context: {
          userId: user.id,
          email: user.email!,
          role,
          tenantId: user.user_metadata?.tenant_id,
          permissions,
          sessionId: session.access_token.substring(0, 20)
        }
      };
    } catch (error) {
      return {
        authenticated: false,
        error: 'Session validation failed'
      };
    }
  }

  authorize(context: AuthContext, check: PermissionCheck): boolean {
    const permission = `${check.resource}:${check.action}`;

    const hasWildcard = context.permissions.some(p => {
      if (p.endsWith(':*')) {
        const resource = p.split(':')[0];
        return resource === check.resource;
      }
      return p === '*';
    });

    if (hasWildcard) {
      return true;
    }

    const hasExactPermission = context.permissions.includes(permission);

    if (check.tenantId && context.tenantId !== check.tenantId) {
      return false;
    }

    return hasExactPermission;
  }

  private getPermissionsForRole(role: string): string[] {
    return ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS.user;
  }

  async validateApiKey(apiKey: string): Promise<AuthResult> {
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('api_keys')
        .select('*')
        .eq('key', apiKey)
        .eq('is_active', true)
        .single();

      if (error || !data) {
        return {
          authenticated: false,
          error: 'Invalid API key'
        };
      }

      const permissions = data.permissions || [];

      return {
        authenticated: true,
        context: {
          userId: data.user_id,
          email: data.name || 'api-key-user',
          role: 'api',
          tenantId: data.tenant_id,
          permissions,
          sessionId: `api_${data.id}`
        }
      };
    } catch (error) {
      return {
        authenticated: false,
        error: 'API key validation failed'
      };
    }
  }

  async createServiceToken(
    serviceName: string,
    duration: number = 3600
  ): Promise<string> {
    const payload = {
      service: serviceName,
      exp: Date.now() + duration * 1000,
      permissions: ['service:*']
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  async validateServiceToken(token: string): Promise<AuthResult> {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());

      if (payload.exp < Date.now()) {
        return {
          authenticated: false,
          error: 'Service token expired'
        };
      }

      return {
        authenticated: true,
        context: {
          userId: `service_${payload.service}`,
          email: `${payload.service}@service.local`,
          role: 'service',
          permissions: payload.permissions,
          sessionId: token.substring(0, 20)
        }
      };
    } catch (error) {
      return {
        authenticated: false,
        error: 'Invalid service token'
      };
    }
  }

  getAuthHeader(context: AuthContext): Record<string, string> {
    return {
      'X-User-Id': context.userId,
      'X-User-Email': context.email,
      'X-User-Role': context.role,
      'X-Tenant-Id': context.tenantId || '',
      'X-Session-Id': context.sessionId
    };
  }
}

export const authIntegration = new AuthIntegration();

export async function authenticateRequest(
  request: NextRequest
): Promise<AuthResult> {
  return authIntegration.authenticate(request);
}

export function authorizeRequest(
  context: AuthContext,
  resource: string,
  action: string,
  tenantId?: string
): boolean {
  return authIntegration.authorize(context, { resource, action, tenantId });
}

export async function requireAuth(
  request: NextRequest
): Promise<AuthContext> {
  const result = await authIntegration.authenticate(request);

  if (!result.authenticated || !result.context) {
    throw new Error(result.error || 'Authentication required');
  }

  return result.context;
}

export async function requirePermission(
  request: NextRequest,
  resource: string,
  action: string
): Promise<AuthContext> {
  const context = await requireAuth(request);

  if (!authIntegration.authorize(context, { resource, action })) {
    throw new Error(`Permission denied: ${resource}:${action}`);
  }

  return context;
}