import { requireUser } from '@/lib/auth/guard';
import { clientUpsert, ClientUpsert } from '@/lib/validation/clients';

export async function upsertClient(input: ClientUpsert) {
  const { user, supabase } = await requireUser();

  const payload = clientUpsert.parse(input);
  const row = { ...payload, coach_id: user.id }; // satisfy RLS policies

  // unique per coach (coach_id, lower(email)) — let DB constraint enforce uniqueness
  const { data, error } = await supabase
    .from('clients')
    .upsert(row, { onConflict: 'coach_id, email' }) // relies on functional unique index (lower(email))
    .select()
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function listClients() {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getClientById(id: string) {
  const { supabase } = await requireUser();

  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function updateClient(id: string, updates: Partial<ClientUpsert>) {
  const { user, supabase } = await requireUser();

  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .eq('coach_id', user.id) // ensure ownership
    .select()
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function deleteClient(id: string) {
  const { user, supabase } = await requireUser();

  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id); // ensure ownership

  if (error) throw error;
  return true;
}
