import { progressMetricUpsert, ProgressMetricUpsert } from '@/lib/validation/progress-metrics';
import { isSafeModeEnabled } from '@/lib/env';
import { 
  createSecureClient, 
  createSecurityContext, 
  executeSecureOperation,
  validateResourceOwnership,
  ResourceType, 
  OperationType, 
  UserRole 
} from '@/lib/supabase/secure-client';

export async function upsertProgressMetric(
  supabase: any,
  user: { id: string },
  input: ProgressMetricUpsert
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.PROGRESS_METRIC,
    OperationType.CREATE,
    undefined,
    { input: { ...input, client_id: input.client_id } }
  );
  
  // Validate user has coach role
  if (secureClient.role !== UserRole.COACH && secureClient.role !== UserRole.ADMIN) {
    throw new Error('Insufficient permissions: Only coaches can manage progress metrics');
  }
  
  return executeSecureOperation(async () => {
    const payload = progressMetricUpsert.parse(input);
    const row = { ...payload, coach_id: secureClient.user.id }; // satisfy RLS policies

    // unique per coach per client per date
    const { data, error } = await secureClient.supabase
      .from('progress_metrics')
      .upsert(row, { onConflict: 'coach_id, client_id, metric_date' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function getProgressMetric(
  supabase: any,
  client_id: string, 
  metric_date: string
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
    ResourceType.PROGRESS_METRIC,
    OperationType.READ,
    undefined,
    { client_id, metric_date }
  );
  
  return executeSecureOperation(async () => {
    // First validate that the client belongs to the authenticated user
    await validateResourceOwnership(
      secureClient.supabase,
      'clients',
      client_id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('progress_metrics')
      .select('*')
      .eq('client_id', client_id)
      .eq('metric_date', metric_date)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function listClientProgressMetrics(
  supabase: any,
  client_id: string,
  days: number = 30
) {
  if (isSafeModeEnabled()) {
    return [0,1,2,3,4].map(n => ({
      id: `stub-${n}`,
      client_id,
      coach_id: 'safe-mode-user',
      metric_date: new Date(Date.now() - n*86400000).toISOString().slice(0,10),
      weight: 70 + n,
      body_fat: 15 + n*0.5,
      muscle_mass: 50 + n*0.3,
      notes: 'Stub metric',
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
    ResourceType.PROGRESS_METRIC,
    OperationType.LIST,
    undefined,
    { client_id, days }
  );
  
  return executeSecureOperation(async () => {
    // First validate that the client belongs to the authenticated user
    await validateResourceOwnership(
      secureClient.supabase,
      'clients',
      client_id,
      secureClient.user.id,
      context
    );
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const { data, error } = await secureClient.supabase
      .from('progress_metrics')
      .select('*')
      .eq('client_id', client_id)
      .gte('metric_date', startDate.toISOString().slice(0,10))
      .lte('metric_date', endDate.toISOString().slice(0,10))
      .order('metric_date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }, context);
}

export async function getProgressMetricById(
  supabase: any,
  user: { id: string },
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
    ResourceType.PROGRESS_METRIC,
    OperationType.READ,
    id
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'progress_metrics',
      id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('progress_metrics')
      .select('*')
      .eq('id', id)
      .eq('coach_id', secureClient.user.id) // ensure ownership
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function updateProgressMetric(
  supabase: any,
  user: { id: string },
  id: string,
  updates: Partial<ProgressMetricUpsert>
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.PROGRESS_METRIC,
    OperationType.UPDATE,
    id,
    { updates }
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'progress_metrics',
      id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('progress_metrics')
      .update(updates)
      .eq('id', id)
      .eq('coach_id', secureClient.user.id) // ensure ownership
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function deleteProgressMetric(
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
    ResourceType.PROGRESS_METRIC,
    OperationType.DELETE,
    id
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'progress_metrics',
      id,
      secureClient.user.id,
      context
    );
    
    const { error } = await secureClient.supabase
      .from('progress_metrics')
      .delete()
      .eq('id', id)
      .eq('coach_id', secureClient.user.id); // ensure ownership

    if (error) throw error;
    return true;
  }, context);
}
