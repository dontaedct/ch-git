import { requireUser } from '@/lib/auth/guard';
import { startOfIsoWeek, asIsoDate } from '@/lib/date/week';
import { checkInUpsert, CheckInUpsert } from '@/lib/validation/checkins';

export async function upsertWeeklyCheckIn(input: Omit<CheckInUpsert, 'week_start_date'> & { date?: Date }) {
  const { user, supabase } = await requireUser();

  const normalized = startOfIsoWeek(input.date ?? new Date());
  const payload = checkInUpsert.parse({
    ...input,
    week_start_date: asIsoDate(normalized)
  });

  // Satisfy RLS by including coach_id
  const row = { ...payload, coach_id: user.id };

  // Upsert against the weekly uniqueness
  const { data, error } = await supabase
    .from('check_ins')
    .upsert(row, { onConflict: 'client_id, week_start_date' }) // safe with current constraint
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getWeeklyCheckIn(client_id: string, anyDate: Date) {
  const { supabase } = await requireUser();
  const week = asIsoDate(startOfIsoWeek(anyDate));
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('client_id', client_id)
    .eq('week_start_date', week)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listClientCheckIns(client_id: string, weeks: number = 12) {
  const { supabase } = await requireUser();
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - (weeks * 7));
  
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('client_id', client_id)
    .gte('week_start_date', asIsoDate(startDate))
    .lte('week_start_date', asIsoDate(endDate))
    .order('week_start_date', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function updateWeeklyCheckIn(client_id: string, week_start_date: string, updates: Partial<CheckInUpsert>) {
  const { user, supabase } = await requireUser();

  const { data, error } = await supabase
    .from('check_ins')
    .update(updates)
    .eq('client_id', client_id)
    .eq('week_start_date', week_start_date)
    .eq('coach_id', user.id) // ensure ownership
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}
