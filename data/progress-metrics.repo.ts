import { requireUser } from '@/lib/auth/guard';
import { progressMetricUpsert, ProgressMetricUpsert } from '@/lib/validation/progress-metrics';

export async function upsertProgressMetric(input: ProgressMetricUpsert) {
  const { user, supabase } = await requireUser();

  const payload = progressMetricUpsert.parse(input);
  const row = { ...payload, coach_id: user.id }; // satisfy RLS policies

  // Upsert against the uniqueness constraint
  const { data, error } = await supabase
    .from('progress_metrics')
    .upsert(row, { onConflict: 'coach_id, client_id, metric_date' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getProgressMetric(client_id: string, metric_date: string) {
  const { supabase } = await requireUser();
  
  const { data, error } = await supabase
    .from('progress_metrics')
    .select('*')
    .eq('client_id', client_id)
    .eq('metric_date', metric_date)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listClientProgressMetrics(client_id: string, days: number = 90) {
  const { supabase } = await requireUser();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const { data, error } = await supabase
    .from('progress_metrics')
    .select('*')
    .eq('client_id', client_id)
    .gte('metric_date', startDate.toISOString().slice(0, 10))
    .lte('metric_date', endDate.toISOString().slice(0, 10))
    .order('metric_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateProgressMetric(id: string, updates: Partial<ProgressMetricUpsert>) {
  const { user, supabase } = await requireUser();

  const { data, error } = await supabase
    .from('progress_metrics')
    .update(updates)
    .eq('id', id)
    .eq('coach_id', user.id) // ensure ownership
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteProgressMetric(id: string) {
  const { user, supabase } = await requireUser();

  const { error } = await supabase
    .from('progress_metrics')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id); // ensure ownership

  if (error) throw error;
  return true;
}
