"use server";

import { createServerClient } from '@/lib/supabase/server'
// WeeklyPlanInsert and WeeklyPlanUpdate are not currently used but kept for future functionality
import { revalidatePath } from "next/cache";
import { sanitizeText } from "@/lib/sanitize";
import { paginationSchema, type PaginatedResponse } from "@/lib/validation";
import { getEnv } from '@/lib/env';

import { WeeklyPlan, Client, WeeklyPlanUpdate } from "@/lib/supabase/types";

export type ActionResult<T> = 
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function getWeeklyPlans(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<WeeklyPlan>>> {
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
      .from("weekly_plans")
      .select("*")
      .eq("coach_id", user.id)
      .order("week_start_date", { ascending: false });

    // Get total count first
    const { count: totalCount } = await supabase
      .from("weekly_plans")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", user.id);

    // Apply pagination
    const offset = (validatedPage - 1) * validatedPageSize;
    const { data, error } = await baseQuery
      .select("*")
      .range(offset, offset + validatedPageSize - 1);

    if (error) throw error;

    return { 
      ok: true, 
      data: {
        data: data ?? [],
        page: validatedPage,
        pageSize: validatedPageSize,
        total: totalCount ?? 0,
      }
    };
  } catch {
    return { ok: false, error: "Failed to fetch weekly plans" };
  }
}

export async function createWeeklyPlan(formData: FormData): Promise<ActionResult<{ id: string }>> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, error: "Not authenticated" };
    }

    // Parse form data
    const rawGoals = (formData.get("goals") as string | null)?.trim() ?? ""
    const goals = rawGoals.length > 0
      ? rawGoals.split(",").map(g => g.trim()).filter(Boolean)
      : []

    // Collect sample tasks fields if present (task_*, task_category_*, task_frequency_*)
    const taskTriples: { title: string; category: 'workout'|'nutrition'|'mindfulness'|'other'; frequency: 'daily'|'weekly'|'custom' }[] = []
    for (let i = 0; i < 20; i++) {
      const t = formData.get(`task_${i}`)
      if (!t) continue
      const title = String(t).trim()
      if (!title) continue
      const rawCategory = formData.get(`task_category_${i}`) as string
      const rawFrequency = formData.get(`task_frequency_${i}`) as string
      
      if (!['workout', 'nutrition', 'mindfulness', 'other'].includes(rawCategory)) {
        throw new Error(`Invalid category: ${rawCategory}`)
      }
      if (!['daily', 'weekly', 'custom'].includes(rawFrequency)) {
        throw new Error(`Invalid frequency: ${rawFrequency}`)
      }
      
      const category = rawCategory as 'workout'|'nutrition'|'mindfulness'|'other'
      const frequency = rawFrequency as 'daily'|'weekly'|'custom'
      taskTriples.push({ title, category, frequency })
    }

          const tasks = taskTriples.map(triple => ({
        id: crypto.randomUUID(),
        title: sanitizeText(triple.title),
        description: null,
        category: triple.category,
        frequency: triple.frequency,
        custom_schedule: null,
        completed: false,
        notes: null,
      }))

    const clientId = formData.get("client_id") as string
    const weekStart = formData.get("week_start_date") as string
    const weekEnd = formData.get("week_end_date") as string
    const title = formData.get("title") as string
    const description = (formData.get("description") as string | null) ?? null

    // Basic validation - in production you'd want more robust parsing
    if (!clientId || !weekStart || !title) {
      return { ok: false, error: "Missing required fields" };
    }

    const { data, error } = await supabase
      .from("weekly_plans")
      .insert({
        coach_id: user.id,
        client_id: clientId,
        week_start_date: weekStart,
        week_end_date: (weekEnd as string) || weekStart,
        title: sanitizeText(title),
        description: sanitizeText(description),
        goals,
        tasks,
        status: "active"
      })
      .select("id")
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    if (getEnv().NODE_ENV === "production") {
      revalidatePath("/weekly-plans");
    }
    return { ok: true, data: { id: data.id } };
  } catch {
    return { ok: false, error: "Failed to create weekly plan" };
  }
}

export async function updateWeeklyPlan(planId: string, updates: WeeklyPlanUpdate): Promise<ActionResult<void>> {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { ok: false, error: "Not authenticated" };
    }

    const { error } = await supabase
      .from("weekly_plans")
      .update(updates)
      .eq("id", planId)
      .eq("coach_id", user.id);

    if (error) {
      return { ok: false, error: error.message };
    }

    if (getEnv().NODE_ENV === "production") {
      revalidatePath("/weekly-plans");
    }
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, error: "Failed to update weekly plan" };
  }
}

export async function getClients(
  page: number = 1,
  pageSize: number = 20
): Promise<ActionResult<PaginatedResponse<Client>>> {
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
      .from("clients")
      .select("*")
      .eq("coach_id", user.id)
      .order("first_name", { ascending: true });

    // Get total count first
    const { count: totalCount } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("coach_id", user.id);

    // Apply pagination
    const offset = (validatedPage - 1) * validatedPageSize;
    const { data, error } = await baseQuery
      .select("*")
      .range(offset, offset + validatedPageSize - 1);

    if (error) throw error;

    return { 
      ok: true, 
      data: {
        data: data ?? [],
        page: validatedPage,
        pageSize: validatedPageSize,
        total: totalCount ?? 0,
      }
    };
  } catch {
    return { ok: false, error: "Failed to fetch clients" };
  }
}
