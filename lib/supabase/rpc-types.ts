// Type definitions for Supabase RPC functions
// These types ensure type safety when calling RPC functions

export interface CreateClientIntakeParams {
  p_coach_id: string;
  p_email: string;
  p_first_name: string;
  p_last_name: string;
  p_phone?: string | null;
}

export interface CreateClientIntakeResult {
  // This function returns void, so no result type needed
}

// Add more RPC function types here as you create them
export interface WeeklyPlanCreateParams {
  // Example for future weekly plan creation
  p_client_id: string;
  p_coach_id: string;
  p_week_start_date: string;
  p_week_end_date: string;
  p_title: string;
  p_description?: string | null;
  p_goals: string[];
}
