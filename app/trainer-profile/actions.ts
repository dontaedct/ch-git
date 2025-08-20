"use server";

import { createServerClient } from "@/lib/supabase/server";
import { getUserOrFail } from "@/lib/auth/guard";
import { sanitizeText } from "@/lib/sanitize";
import { trainerProfileSchema } from "@/lib/validation";
import type { Trainer } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/types";

export async function createTrainerProfile(formData: FormData): ActionResult<{ id: string }> {
  try {
    const supabase = await createServerClient();
    const user = await getUserOrFail();
    
    // Parse form data
    const specialties = formData.getAll("specialties").map(s => s.toString());
    const certifications = formData.getAll("certifications").map(c => c.toString());
    
    const parsed = trainerProfileSchema.parse({
      business_name: sanitizeText(formData.get("business_name")?.toString()),
      bio: sanitizeText(formData.get("bio")?.toString()),
      specialties,
      certifications,
      years_experience: formData.get("years_experience") ? parseInt(formData.get("years_experience")!.toString()) : null,
      hourly_rate: formData.get("hourly_rate") ? parseInt(formData.get("hourly_rate")!.toString()) : null,
      website: sanitizeText(formData.get("website")?.toString()),
      social_links: null, // TODO: Add social links support
    });

    const { data, error } = await supabase
      .from("trainers")
      .insert({ 
        ...parsed, 
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "createTrainerProfile failed" };
  }
}

export async function updateTrainerProfile(formData: FormData): ActionResult<{ id: string }> {
  try {
    const supabase = await createServerClient();
    const user = await getUserOrFail();
    
    // Parse form data
    const specialties = formData.getAll("specialties").map(s => s.toString());
    const certifications = formData.getAll("certifications").map(c => c.toString());
    
    const parsed = trainerProfileSchema.parse({
      business_name: sanitizeText(formData.get("business_name")?.toString()),
      bio: sanitizeText(formData.get("bio")?.toString()),
      specialties,
      certifications,
      years_experience: formData.get("years_experience") ? parseInt(formData.get("years_experience")!.toString()) : null,
      hourly_rate: formData.get("hourly_rate") ? parseInt(formData.get("hourly_rate")!.toString()) : null,
      website: sanitizeText(formData.get("website")?.toString()),
      social_links: null, // TODO: Add social links support
    });

    // Get existing profile to ensure ownership
    const { data: existingProfile, error: fetchError } = await supabase
      .from("trainers")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingProfile) {
      throw new Error("Profile not found");
    }

    const { data, error } = await supabase
      .from("trainers")
      .update({ 
        ...parsed, 
        updated_at: new Date().toISOString()
      })
      .eq("id", existingProfile.id)
      .eq("user_id", user.id) // RLS security
      .select("id")
      .single();

    if (error) throw error;
    return { ok: true, data };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "updateTrainerProfile failed" };
  }
}

export async function getTrainerProfile(): ActionResult<Trainer | null> {
  try {
    const supabase = await createServerClient();
    const user = await getUserOrFail();

    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return { ok: true, data: data ?? null };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "getTrainerProfile failed" };
  }
}
