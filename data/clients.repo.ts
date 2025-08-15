import { clientUpsert, ClientUpsert } from '@/lib/validation/clients';
import { isSafeModeEnabled } from '@/lib/env';
import { 
  createSecureClient, 
  createSecurityContext, 
  executeSecureOperation,
  validateResourceOwnership,
  ResourceType, 
  OperationType, 
  UserRole,
  validateResourceOwnershipAndGetData
} from '@/lib/supabase/secure-client';

export async function upsertClient(
  supabase: any,
  user: { id: string },
  input: ClientUpsert
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.CLIENT,
    OperationType.CREATE,
    undefined,
    { input: { ...input, email: input.email ? '[REDACTED]' : undefined } }
  );
  
  // Validate user has coach role
  if (secureClient.role !== UserRole.COACH && secureClient.role !== UserRole.ADMIN) {
    throw new Error('Insufficient permissions: Only coaches can manage clients');
  }
  
  return executeSecureOperation(async () => {
    const payload = clientUpsert.parse(input);
    const row = { ...payload, coach_id: secureClient.user.id }; // satisfy RLS policies
    
    // unique per coach (coach_id, lower(email)) — let DB constraint enforce uniqueness
    const { data, error } = await secureClient.supabase
      .from('clients')
      .upsert(row, { onConflict: 'coach_id, email' }) // relies on functional unique index (lower(email))
      .select()
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function getClient(
  supabase: any,
  id: string
) {
  if (isSafeModeEnabled()) {
    return null;
  }
  
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.CLIENT,
    OperationType.READ,
    id
  );
  
  return executeSecureOperation(async () => {
    // Use efficient validation that gets data in one call
    return await validateResourceOwnershipAndGetData(
      secureClient.supabase,
      'clients',
      id,
      secureClient.user.id,
      context
    );
  }, context);
}

export async function listClients(
  supabase: any,
  user: { id: string }
) {
  if (isSafeModeEnabled()) {
    return [0,1,2,3,4].map(n => ({
      id: `stub-${n}`,
      coach_id: 'safe-mode-user',
      first_name: `Client ${n}`,
      last_name: 'Stub',
      email: `client${n}@stub.dev`,
      phone: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  }
  
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.CLIENT,
    OperationType.LIST,
    undefined,
    { filter: 'by_coach_id' }
  );
  
  return executeSecureOperation(async () => {
    const { data, error } = await secureClient.supabase
      .from('clients')
      .select('*')
      .eq('coach_id', secureClient.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }, context);
}

export async function updateClient(
  supabase: any,
  user: { id: string },
  id: string,
  updates: Partial<ClientUpsert>
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.CLIENT,
    OperationType.UPDATE,
    id,
    { updates: { ...updates, email: updates.email ? '[REDACTED]' : undefined } }
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'clients',
      id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('clients')
      .update(updates)
      .eq('id', id)
      .eq('coach_id', secureClient.user.id) // ensure ownership
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function deleteClient(
  supabase: any,
  user: { id: string },
  id: string
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.CLIENT,
    OperationType.DELETE,
    id
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'clients',
      id,
      secureClient.user.id,
      context
    );
    
    const { error } = await secureClient.supabase
      .from('clients')
      .delete()
      .eq('id', id)
      .eq('coach_id', secureClient.user.id); // ensure ownership

    if (error) throw error;
    return true;
  }, context);
}
