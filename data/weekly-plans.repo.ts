import { requireUser } from '@/lib/auth/guard';
import { startOfIsoWeek, asIsoDate } from '@/lib/date/week';
import { weeklyPlanUpsert, WeeklyPlanUpsert } from '@/lib/validation/weekly-plans';

export async function upsertWeeklyPlan(input: Omit<WeeklyPlanUpsert, 'week_start_date'> & { date?: Date }) {
  const { user, supabase } = await requireUser();

  const normalized = startOfIsoWeek(input.date ?? new Date());
  const payload = weeklyPlanUpsert.parse({
    ...input,
    week_start_date: asIsoDate(normalized)
  });

  // Satisfy RLS by including coach_id
  const row = { ...payload, coach_id: user.id };

  // Upsert against the weekly uniqueness constraint
  const { data, error } = await supabase
    .from('weekly_plans')
    .upsert(row, { onConflict: 'coach_id, client_id, week_start_date' })
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWeeklyPlan(client_id: string, anyDate: Date) {
  const { supabase } = await requireUser();
  const week = asIsoDate(startOfIsoWeek(anyDate));
  
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('client_id', client_id)
    .eq('week_start_date', week)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listClientWeeklyPlans(client_id: string, weeks: number = 12) {
  const { supabase } = await requireUser();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('client_id', client_id)
    .gte('week_start_date', asIsoDate(startDate))
    .lte('week_start_date', asIsoDate(endDate))
    .order('week_start_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateWeeklyPlan(id: string, updates: Partial<WeeklyPlanUpsert>) {
  const { user, supabase } = await requireUser();

  const { data, error } = await supabase
    .from('weekly_plans')
    .update(updates)
    .eq('id', id)
    .eq('coach_id', user.id) // ensure ownership
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteWeeklyPlan(id: string) {
  const { user, supabase } = await requireUser();

  const { error } = await supabase
    .from('weekly_plans')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id); // ensure ownership

  if (error) throw error;
  return true;
}

export async function getWeeklyPlansForWeek(week_start_date: string) {
  const { supabase } = await requireUser();
  
  const { data, error } = await supabase
    .from('weekly_plans')
    .select('*')
    .eq('week_start_date', week_start_date)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}
