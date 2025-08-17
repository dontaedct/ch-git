"use server";

import { createRealSupabaseClient } from '@lib/supabase/server';
import { requireClient } from '@lib/auth/roles';
import { Client, WeeklyPlan, CheckIn, ProgressMetric } from '@lib/supabase/types';

export type ActionResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

/**
 * Get client profile and associated data server-side
 * Eliminates client-side auth loops and provides consistent error handling
 */
export async function getClientPortalData(): Promise<ActionResult<{
  client: Client;
  weeklyPlan: WeeklyPlan | null;
  checkIns: CheckIn[];
  progressMetrics: ProgressMetric[];
}>> {
  try {
    const { clientId } = await requireClient();
    const supabase = await createRealSupabaseClient();
    
    // Get client profile
    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return { ok: false, error: 'Client profile not found' };
    }

    // Load weekly plan
    const { data: planData } = await supabase
      .from('weekly_plans')
      .select('*')
      .eq('client_id', clientId)
      .eq('status', 'active')
      .order('week_start_date', { ascending: false })
      .limit(1)
      .single();

    // Load check-ins
    const { data: checkInData } = await supabase
      .from('check_ins')
      .select('*')
      .eq('client_id', clientId)
      .order('check_in_date', { ascending: false })
      .limit(10);

    // Load progress metrics
    const { data: metricsData } = await supabase
      .from('progress_metrics')
      .select('*')
      .eq('client_id', clientId)
      .order('metric_date', { ascending: true })
      .limit(30);

    return {
      ok: true,
      data: {
        client: clientData as Client,
        weeklyPlan: planData as WeeklyPlan | null,
        checkIns: (checkInData ?? []) as CheckIn[],
        progressMetrics: (metricsData ?? []) as ProgressMetric[],
      }
    };
  } catch {
    return { ok: false, error: 'Failed to load client data' };
  }
}

export async function toggleTaskCompletion(planId: string, taskId: string, completed: boolean) {
  try {
    const { clientId } = await requireClient();
    const supabase = await createRealSupabaseClient();
    
    // Verify the plan belongs to this client
    const { data: planData } = await supabase
      .from('weekly_plans')
      .select('client_id, plan_json')
      .eq('id', planId)
      .single();
    
    if (!planData || (planData as { client_id: string }).client_id !== clientId) {
      return { ok: false, error: 'Plan not found' };
    }
    
    // Update task completion by modifying the plan_json
    const currentPlanJson = (planData as { plan_json: unknown }).plan_json as Record<string, unknown>;
    if (currentPlanJson?.tasks && Array.isArray(currentPlanJson.tasks)) {
      const updatedTasks = (currentPlanJson.tasks as Array<Record<string, unknown>>).map((task) => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      const { error } = await supabase
        .from('weekly_plans')
        .update({ plan_json: { ...currentPlanJson, tasks: updatedTasks } })
        .eq('id', planId);
      
      if (error) throw error;
    }
    
    return { ok: true };
  } catch {
    return { ok: false, error: 'Failed to update task' };
  }
}



