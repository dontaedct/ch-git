'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { SessionInsert, SessionUpdate, Session } from '@/lib/supabase/types'
import { fail } from '@/lib/errors'
import { error as logError } from '@/lib/logger'
import { sanitizeText } from '@/lib/sanitize'
import { paginationSchema, type PaginatedResponse } from '@/lib/validation'
import { applyPagination } from '@/lib/utils'

export type ActionResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getSessions(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<Session>>> {
  try {
    // Validate and clamp pagination parameters
    const { page: validatedPage, pageSize: validatedPageSize } = paginationSchema.parse({
      page,
      pageSize,
    });

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, error: "Not authenticated" };
    }

    const baseQuery = supabase
      .from("sessions")
      .select("*")
      .eq("coach_id", user.id)
      .order("starts_at", { ascending: false });

    const { data, total } = await applyPagination<Session>(
      baseQuery,
      validatedPage,
      validatedPageSize
    );

    return { 
      ok: true, 
      data: {
        data,
        page: validatedPage,
        pageSize: validatedPageSize,
        total,
      }
    };
  } catch {
    return { ok: false, error: "Failed to fetch sessions" };
  }
}

export async function createSession(formData: FormData): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    
    // Get form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startsAt = formData.get('startsAt') as string
    const durationMinutes = parseInt(formData.get('durationMinutes') as string)
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)
    const location = formData.get('location') as string
    const notes = formData.get('notes') as string

    if (!title || !startsAt || !durationMinutes) {
      return { ok: false, error: 'Missing required fields' }
    }

    // Calculate start and end times
    const startTime = new Date(startsAt)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

    // Scope to authenticated coach
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { ok: false, error: 'Not authenticated' }
    }

    const sessionData: SessionInsert = {
      title: sanitizeText(title),
      description: sanitizeText(description),
      duration_minutes: durationMinutes,
      max_participants: maxParticipants || null,
      location: sanitizeText(location),
      notes: sanitizeText(notes),
      starts_at: startTime.toISOString(),
      ends_at: endTime.toISOString(),
      coach_id: user.id,
    }

    const { error } = await supabase
      .from('sessions')
      .insert(sessionData)

    if (error) {
      logError('Error creating session:', error)
      return { ok: false, error: 'Failed to create session' }
    }

    if (process.env.NODE_ENV === "production") {
      revalidatePath('/sessions')
    }
    return { ok: true }
  } catch (error) {
    logError('Error creating session:', error)
    return fail('An unexpected error occurred')
  }
}

export async function updateSession(
  sessionId: string, 
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    
    // Get form data
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const startsAt = formData.get('startsAt') as string
    const durationMinutes = parseInt(formData.get('durationMinutes') as string)
    const maxParticipants = parseInt(formData.get('maxParticipants') as string)
    const location = formData.get('location') as string
    const notes = formData.get('notes') as string

    if (!title || !startsAt || !durationMinutes) {
      return { ok: false, error: 'Missing required fields' }
    }

    // Calculate start and end times
    const startTime = new Date(startsAt)
    const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)

    const sessionData: SessionUpdate = {
      title: sanitizeText(title),
      description: sanitizeText(description),
      duration_minutes: durationMinutes,
      max_participants: maxParticipants || null,
      location: sanitizeText(location),
      notes: sanitizeText(notes),
      starts_at: startTime.toISOString(),
      ends_at: endTime.toISOString(),
    }

    const { error } = await supabase
      .from('sessions')
      .update(sessionData)
      .eq('id', sessionId)

    if (error) {
      logError('Error updating session:', error)
      return { ok: false, error: 'Failed to update session' }
    }

    if (process.env.NODE_ENV === "production") {
      revalidatePath('/sessions')
    }
    return { ok: true }
  } catch (error) {
    logError('Error updating session:', error)
    return fail('An unexpected error occurred')
  }
}

export async function deleteSession(sessionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const supabase = await createServerClient()
    
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      logError('Error deleting session:', error)
      return { ok: false, error: 'Failed to delete session' }
    }

    if (process.env.NODE_ENV === "production") {
      revalidatePath('/sessions')
    }
    return { ok: true }
  } catch (error) {
    logError('Error deleting session:', error)
    return fail('An unexpected error occurred')
  }
}
