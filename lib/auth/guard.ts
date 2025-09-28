import { createServerSupabase } from "@/lib/supabase/server";
import { UserRole, PermissionChecker, Permission } from "./permissions";

// Legacy role to modern role mapping for migration compatibility
type LegacyUserRole = 'owner' | 'admin' | 'member' | 'staff' | 'viewer';

const ROLE_MIGRATION_MAP: Record<LegacyUserRole, UserRole> = {
  'owner': 'admin',    // Full administrative access
  'admin': 'admin',    // Full administrative access
  'member': 'editor',  // Content creation and management
  'staff': 'editor',   // Content creation and management
  'viewer': 'viewer'   // Read-only access
};

function migrateRole(role: string): UserRole {
  // If it's already a modern role, return as-is
  if (PermissionChecker.isValidRole(role)) {
    return role as UserRole;
  }

  // If it's a legacy role, migrate it
  if (role in ROLE_MIGRATION_MAP) {
    return ROLE_MIGRATION_MAP[role as LegacyUserRole];
  }

  // Default to viewer for unknown roles
  return 'viewer';
}

export interface ClientContext {
  id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

export async function requireUser() {
  // Check if we're in safe mode or development mode - bypass authentication
  const isSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE === '1';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isSafeMode || isDevelopment) {
    // Return mock user for development/safe mode
    const mockUser = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('🔐 Auth Guard: Development mode - using mock user', { userId: mockUser.id });
    }
    
    // Return mock supabase client (won't be used in dev mode)
    return { user: mockUser, supabase: null };
  }

  const supabase = await createServerSupabase();
  
  // Dev-only tracing
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🔐 Auth Guard: Checking user authentication...');
  }
  
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.warn('❌ Auth Guard: Authentication failed', { error: error?.message });
    }
    throw new Error("Unauthorized");
  }
  
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('✅ Auth Guard: User authenticated', { userId: data.user.id });
  }
  
  return { user: data.user, supabase };
}

export async function requireClient(): Promise<ClientContext> {
  const { user, supabase } = await requireUser();
  
  // Check if we're in safe mode or development mode - return mock client
  const isSafeMode = process.env.NEXT_PUBLIC_SAFE_MODE === '1';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  if (isSafeMode || isDevelopment) {
    // Return mock client for development/safe mode
    const mockClient = {
      id: 'dev-user-123',
      email: 'dev@example.com',
      role: 'admin' as UserRole,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    if (process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('🏢 Client Guard: Development mode - using mock client', { clientId: mockClient.id, role: mockClient.role });
    }
    
    return mockClient;
  }
  
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('🏢 Client Guard: Fetching client context...');
  }
  
  // Get client record with role information
  const { data: client, error } = await supabase
    .from('clients')
    .select('id, email, role, created_at, updated_at')
    .eq('email', user.email)
    .single();

  if (error || !client) {
    // If client doesn't exist, create one with default viewer role
    const { data: newClient, error: insertError } = await supabase
      .from('clients')
      .insert({
        email: user.email,
        role: 'viewer' as UserRole
      })
      .select('id, email, role, created_at, updated_at')
      .single();

    if (insertError || !newClient) {
      if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
        console.error('❌ Client Guard: Failed to create client record', { error: insertError?.message });
      }
      throw new Error("Failed to initialize client context");
    }

    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('✅ Client Guard: Created new client record', { clientId: newClient.id, role: newClient.role });
    }

    return {
      ...newClient,
      role: migrateRole(newClient.role)
    } as ClientContext;
  }

  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('✅ Client Guard: Client context loaded', { clientId: client.id, role: client.role });
  }

  // Migrate legacy roles to modern roles
  const migratedRole = migrateRole(client.role);

  // If role was migrated, update the database
  if (migratedRole !== client.role) {
    await supabase
      .from('clients')
      .update({ role: migratedRole })
      .eq('id', client.id);

    if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
      console.log('🔄 Role Migration: Updated role', { clientId: client.id, oldRole: client.role, newRole: migratedRole });
    }
  }

  return {
    ...client,
    role: migratedRole
  } as ClientContext;
}

export async function requireRole(requiredRole: UserRole): Promise<ClientContext> {
  const client = await requireClient();

  if (!client.role || !PermissionChecker.isValidRole(client.role) || !PermissionChecker.isRoleHigher(client.role, requiredRole) && client.role !== requiredRole) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }

  return client;
}

export async function requirePermission(permission: Permission): Promise<ClientContext> {
  const client = await requireClient();

  if (!client.role || !PermissionChecker.hasPermission(client.role, permission)) {
    throw new Error(`Insufficient permissions. Required permission: ${permission}`);
  }

  return client;
}

export async function getUserOrFail(supabase: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const { data, error } = await supabase.auth.getUser();
  
  if (error || !data?.user) {
    throw new Error("Unauthorized");
  }
  
  return data.user;
}
