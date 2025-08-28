import { createServerSupabase } from "@/lib/supabase/server";
import { UserRole, hasRole, hasPermission } from "./roles";

export interface ClientContext {
  id: string;
  email: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
}

export async function requireUser() {
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
    
    return newClient as ClientContext;
  }
  
  if (process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_DEBUG === '1') {
    console.log('✅ Client Guard: Client context loaded', { clientId: client.id, role: client.role });
  }
  
  return client as ClientContext;
}

export async function requireRole(requiredRole: UserRole): Promise<ClientContext> {
  const client = await requireClient();
  
  if (!client.role || !hasRole({ app_metadata: { roles: [client.role] } } as unknown as Parameters<typeof hasRole>[0], requiredRole)) {
    throw new Error(`Insufficient permissions. Required role: ${requiredRole}`);
  }
  
  return client;
}

export async function requirePermission(permission: keyof import("./roles").RolePermissions): Promise<ClientContext> {
  const client = await requireClient();
  
  if (!client.role || !hasPermission(client.role, permission)) {
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
