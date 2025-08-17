// Minimal roles logic that doesn't import Supabase
// This prevents bundling issues in server components

import type { User } from './guard'

export type AuthResult<T> = 
  | { status: 'authenticated'; data: T }
  | { status: 'unauthorized' }
  | { status: 'loading' };

export type Role = 'coach' | 'admin' | 'client';

export interface CoachContext {
  user: User;
  coachId: string;
}

export interface ClientContext {
  user: User;
  clientId: string;
  coachId: string;
}

// Helper function to check roles
export function hasRole(user: User, role: 'admin' | 'staff'): boolean {
  const roles = user.user_metadata?.roles ?? [];
  return roles.includes(role);
}

// Placeholder implementations that don't depend on Supabase
// These functions should be called from API routes or server actions

export async function getCoachContext(): Promise<CoachContext> {
  throw new Error('getCoachContext must be called from API routes or server actions with real Supabase client');
}

export async function getClientContext(): Promise<ClientContext> {
  throw new Error('getClientContext must be called from API routes or server actions with real Supabase client');
}

export async function getCoachContextOrFail(): Promise<CoachContext> {
  throw new Error('getCoachContextOrFail must be called from API routes or server actions with real Supabase client');
}

export async function getClientContextOrFail(): Promise<ClientContext> {
  throw new Error('getClientContextOrFail must be called from API routes or server actions with real Supabase client');
}

export async function getClientContextSafe(): Promise<AuthResult<ClientContext>> {
  return { status: 'loading' };
}

// Legacy function names that other files depend on
export async function requireCoach(): Promise<{ user: User; coachId: string }> {
  throw new Error('requireCoach must be called from API routes or server actions with real Supabase client');
}

export async function requireClient(): Promise<{ user: User; clientId: string; coachId: string }> {
  throw new Error('requireClient must be called from API routes or server actions with real Supabase client');
}

export async function requireCoachWithLoading(): Promise<AuthResult<{ user: User; coachId: string }>> {
  return { status: 'loading' };
}

export async function requireClientWithLoading(): Promise<AuthResult<{ user: User; clientId: string; coachId: string }>> {
  return { status: 'loading' };
}

export async function getServerUserRole(): Promise<{ user: User; role: Role; coachId?: string }> {
  throw new Error('getServerUserRole must be called from API routes or server actions with real Supabase client');
}

export async function getServerUserRoleWithLoading(): Promise<AuthResult<{ user: User; role: Role; coachId?: string }>> {
  return { status: 'loading' };
}

export async function getServerCoachId(): Promise<string> {
  throw new Error('getServerCoachId must be called from API routes or server actions with real Supabase client');
}
