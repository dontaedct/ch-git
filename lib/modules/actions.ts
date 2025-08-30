'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getModuleOverrides(clientId: string) {
  const supabase = await createServerSupabase()
  
  const { data, error } = await supabase
    .from('client_app_overrides')
    .select('modules_enabled')
    .eq('client_id', clientId)
    .single()
  
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Failed to get module overrides: ${error.message}`)
  }
  
  return data ?? null
}

export async function saveModuleOverrides(clientId: string, modulesEnabled: string[]) {
  const supabase = await createServerSupabase()
  
  // First check if override record exists
  const { data: existing } = await supabase
    .from('client_app_overrides')
    .select('id')
    .eq('client_id', clientId)
    .single()
  
  if (existing) {
    // Update existing record
    const { error } = await supabase
      .from('client_app_overrides')
      .update({ 
        modules_enabled: modulesEnabled,
        updated_at: new Date().toISOString()
      })
      .eq('client_id', clientId)
    
    if (error) {
      throw new Error(`Failed to update module overrides: ${error.message}`)
    }
  } else {
    // Insert new record
    const { error } = await supabase
      .from('client_app_overrides')
      .insert({
        client_id: clientId,
        modules_enabled: modulesEnabled
      })
    
    if (error) {
      throw new Error(`Failed to save module overrides: ${error.message}`)
    }
  }
  
  // Revalidate pages that might use this data
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/modules')
  revalidatePath('/consultation')
}

export async function resetToDefaults(clientId: string) {
  const supabase = await createServerSupabase()
  
  // Delete the override record to fall back to defaults
  const { error } = await supabase
    .from('client_app_overrides')
    .delete()
    .eq('client_id', clientId)
  
  if (error) {
    throw new Error(`Failed to reset to defaults: ${error.message}`)
  }
  
  // Revalidate pages that might use this data
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/modules')
  revalidatePath('/consultation')
}