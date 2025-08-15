import { weeklyPlanUpsert, WeeklyPlanUpsert } from '@/lib/validation/weekly-plans';
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

export async function upsertWeeklyPlan(
  supabase: any,
  user: { id: string },
  input: WeeklyPlanUpsert
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.WEEKLY_PLAN,
    OperationType.CREATE,
    undefined,
    { input: { ...input, client_id: input.client_id } }
  );
  
  // Validate user has coach role
  if (secureClient.role !== UserRole.COACH && secureClient.role !== UserRole.ADMIN) {
    throw new Error('Insufficient permissions: Only coaches can manage weekly plans');
  }
  
  return executeSecureOperation(async () => {
    const payload = weeklyPlanUpsert.parse(input);
    const row = { ...payload, coach_id: secureClient.user.id }; // satisfy RLS policies

    // unique per coach per client per week
    const { data, error } = await secureClient.supabase
      .from('weekly_plans')
      .upsert(row, { onConflict: 'coach_id, client_id, week_start_date' })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function getWeeklyPlan(
  supabase: any,
  client_id: string, 
  week: string
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
    ResourceType.WEEKLY_PLAN,
    OperationType.READ,
    undefined,
    { client_id, week }
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
      .from('weekly_plans')
      .select('*')
      .eq('client_id', client_id)
      .eq('week_start_date', week)
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function listClientWeeklyPlans(
  supabase: any,
  client_id: string
) {
  if (isSafeModeEnabled()) {
    return [0,1,2,3,4].map(n => ({
      id: `stub-${n}`,
      coach_id: 'safe-mode-user',
      client_id,
      week_start_date: new Date(Date.now() - n*86400000*7).toISOString().slice(0,10),
      status: 'active',
      goals: ['Goal 1', 'Goal 2'],
      notes: 'Stub plan',
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
    ResourceType.WEEKLY_PLAN,
    OperationType.LIST,
    undefined,
    { client_id }
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
      .from('weekly_plans')
      .select('*')
      .eq('client_id', client_id)
      .order('week_start_date', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }, context);
}

export async function getWeeklyPlanById(
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
    ResourceType.WEEKLY_PLAN,
    OperationType.READ,
    id
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'weekly_plans',
      id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('weekly_plans')
      .select('*')
      .eq('id', id)
      .eq('coach_id', secureClient.user.id) // ensure ownership
      .maybeSingle();

    if (error) throw error;
    return data;
  }, context);
}

export async function updateWeeklyPlan(
  supabase: any,
  user: { id: string },
  id: string,
  updates: Partial<WeeklyPlanUpsert>
) {
  // Create secure client for RLS enforcement
  const secureClient = await createSecureClient();
  
  // Create security context
  const context = createSecurityContext(
    secureClient.user.id,
    secureClient.user.email,
    secureClient.role,
    ResourceType.WEEKLY_PLAN,
    OperationType.UPDATE,
    id,
    { updates }
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'weekly_plans',
      id,
      secureClient.user.id,
      context
    );
    
    const { data, error } = await secureClient.supabase
      .from('weekly_plans')
      .update(updates)
      .eq('id', id)
      .eq('coach_id', secureClient.user.id); // ensure ownership

    if (error) throw error;
    return data;
  }, context);
}

export async function deleteWeeklyPlan(
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
    ResourceType.WEEKLY_PLAN,
    OperationType.DELETE,
    id
  );
  
  return executeSecureOperation(async () => {
    // First validate resource ownership to ensure RLS compliance
    await validateResourceOwnership(
      secureClient.supabase,
      'weekly_plans',
      id,
      secureClient.user.id,
      context
    );
    
    const { error } = await secureClient.supabase
      .from('weekly_plans')
      .delete()
      .eq('id', id)
      .eq('coach_id', secureClient.user.id); // ensure ownership

    if (error) throw error;
    return true;
  }, context);
}

export async function getWeeklyPlanByDate(
  supabase: any,
  user: { id: string },
  week_start_date: string
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
    ResourceType.WEEKLY_PLAN,
    OperationType.READ,
    undefined,
    { week_start_date }
  );
  
  return executeSecureOperation(async () => {
    const { data, error } = await secureClient.supabase
      .from('weekly_plans')
      .select('*')
      .eq('week_start_date', week_start_date)
      .eq('coach_id', secureClient.user.id) // ensure ownership
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }, context);
}

export async function listCoachClients(
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
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data ?? [];
  }, context);
}
