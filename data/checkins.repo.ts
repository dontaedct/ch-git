import { startOfIsoWeek, asIsoDate } from '@/lib/date/week';
import { checkInUpsert, CheckInUpsert } from '@/lib/validation/checkins';
import { isSafeModeEnabled } from '@/lib/env';

export async function upsertWeeklyCheckIn(
  supabase: any,
  user: { id: string },
  input: Omit<CheckInUpsert, 'week_start_date'> & { date?: Date }
) {
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

export async function getWeeklyCheckIn(
  supabase: any,
  client_id: string, 
  anyDate: Date
) {
  if (isSafeModeEnabled()) {
    return null;
  }
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

export async function listClientCheckIns(
  supabase: any,
  client_id: string, 
  weeks: number = 12
) {
  if (isSafeModeEnabled()) {
    const endDate = new Date();
    return [0,1,2,3,4].map(n => ({
      id: `stub-${n}`,
      client_id,
      coach_id: 'safe-mode-user',
      check_in_date: new Date(endDate.getTime() - n*86400000).toISOString().slice(0,10),
      mood_rating: 3,
      energy_level: 3,
    }));
  }
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

export async function updateWeeklyCheckIn(
  supabase: any,
  user: { id: string },
  client_id: string, 
  week_start_date: string, 
  updates: Partial<CheckInUpsert>
) {
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
