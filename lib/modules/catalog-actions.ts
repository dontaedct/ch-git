'use server'

import { createServerSupabase } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface CatalogOverrides {
  [planId: string]: {
    title?: string
    includes?: string[]
    priceBand?: string
  }
}

export async function getCatalogOverrides(clientId: string): Promise<CatalogOverrides> {
  try {
    const supabase = await createServerSupabase()
    
    const { data, error } = await supabase
      .from('client_app_overrides')
      .select('catalog_overrides')
      .eq('client_id', clientId)
      .single()
    
    if (error) throw error
    
    return data?.catalog_overrides ?? {}
  } catch (error) {
    console.error('Failed to get catalog overrides:', error)
    return {}
  }
}

export async function saveCatalogOverrides(
  clientId: string, 
  overrides: CatalogOverrides
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabase()
    
    // First check if client_app_overrides record exists
    const { data: existing } = await supabase
      .from('client_app_overrides')
      .select('id')
      .eq('client_id', clientId)
      .single()
    
    if (existing) {
      // Update existing record
      const { error } = await supabase
        .from('client_app_overrides')
        .update({ catalog_overrides: overrides })
        .eq('client_id', clientId)
      
      if (error) throw error
    } else {
      // Create new record
      const { error } = await supabase
        .from('client_app_overrides')
        .insert({
          client_id: clientId,
          catalog_overrides: overrides,
          modules_enabled: []
        })
      
      if (error) throw error
    }
    
    // Revalidate paths that use this data
    revalidatePath('/consultation')
    revalidatePath('/dashboard/catalog')
    
    return { success: true }
  } catch (error) {
    console.error('Failed to save catalog overrides:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save overrides'
    }
  }
}

export async function resetCatalogOverrides(
  clientId: string
): Promise<{ success: boolean; error?: string }> {
  return saveCatalogOverrides(clientId, {})
}