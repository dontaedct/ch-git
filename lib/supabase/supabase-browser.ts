'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

declare global {
  // eslint-disable-next-line no-var
  var __supabase_browser__: SupabaseClient | undefined
}

export function getSupabaseBrowser(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  }
  
  // Initialize if not exists
  if (typeof globalThis.__supabase_browser__ === 'undefined') {
    globalThis.__supabase_browser__ = createBrowserClient(url, anon)
  }
  
  return globalThis.__supabase_browser__!
}
