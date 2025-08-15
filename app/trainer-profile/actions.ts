"use server";

import { createRealSupabaseClient } from "@/lib/supabase/server";
import { sanitizeText } from "@/lib/sanitize";
import { trainerProfileSchema } from "@/lib/validation";
import type { Trainer } from "@/lib/supabase/types";
import type { ActionResult } from "@/lib/types";

export async function createTrainerProfile(formData: FormData): ActionResult<{ id: string }> {
  try {
    const supabase = await createRealSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) throw new Error("Unauthorized");
    const user = authData.user;
    
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
    
    // Type assertion for mock client compatibility
    const typedData = data as { id: string };
    return { ok: true, data: typedData };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "createTrainerProfile failed" };
  }
}

export async function updateTrainerProfile(formData: FormData): ActionResult<{ id: string }> {
  try {
    const supabase = await createRealSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) throw new Error("Unauthorized");
    const user = authData.user;
    
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

    // Type assertion for mock client compatibility
    const typedExistingProfile = existingProfile as { id: string };

    const { data, error } = await supabase
      .from("trainers")
      .update({ 
        ...parsed, 
        updated_at: new Date().toISOString()
      })
      .eq("id", typedExistingProfile.id)
      .eq("user_id", user.id) // RLS security
      .select("id")
      .single();

    if (error) throw error;
    
    // Type assertion for mock client compatibility
    const typedData = data as { id: string };
    return { ok: true, data: typedData };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "updateTrainerProfile failed" };
  }
}

export async function getTrainerProfile(): ActionResult<Trainer | null> {
  try {
    const supabase = await createRealSupabaseClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) throw new Error("Unauthorized");
    const user = authData.user;

    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    // Type assertion for mock client compatibility
    const typedData = data as Trainer | null;
    return { ok: true, data: typedData };
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "getTrainerProfile failed" };
  }
}
