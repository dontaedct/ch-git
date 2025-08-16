/**
 * 🚀 MIT HERO SYSTEM - SUPABASE INTEGRATION
 * 
 * Production-ready Supabase client exports with proper error handling,
 * connection pooling, and health monitoring.
 */

// Export real Supabase client implementations
export * from './client';
export * from './types';
export * from './config';

// Re-export common Supabase types for convenience
export type { SupabaseClient } from '@supabase/supabase-js';
export type { User, Session as AuthSession } from '@supabase/supabase-js';

// Export utility functions
export { createClient, createBrowserSupabase, supabaseBrowser, createServiceClient, checkSupabaseHealth } from './client';
export * from './utils';
