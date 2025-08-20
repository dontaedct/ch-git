

// Re-export Supabase types
export type {
  Session,
  SessionInsert,
  SessionUpdate,
  Client,
  ClientInsert,
  ClientUpdate,
  Trainer,
  TrainerInsert,
  TrainerUpdate,
  WeeklyPlan,
  WeeklyPlanInsert,
  WeeklyPlanUpdate,
  CheckIn,
  CheckInInsert,
  CheckInUpdate,
  ProgressMetric,
  ProgressMetricInsert,
  ProgressMetricUpdate,
} from './supabase/types'

// Legacy types for backward compatibility
export interface SessionLite {
  id: string
  title: string
  starts_at: string
  location: string | null
  stripe_link: string | null
  coach_id: string
}

export interface RSVPRecord {
  status: 'confirmed' | 'declined' | 'pending'
  notes?: string
  client_id: string
}

export interface ClientWithFullName {
  id: string
  coach_id: string
  email: string
  first_name: string
  last_name: string
  phone: string | null
  notes: string | null
  stripe_customer_id: string | null
  created_at: string
  updated_at: string
  date_of_birth?: string | null
  height_cm?: number | null
  starting_weight_kg?: number | null
  current_weight_kg?: number | null
  goals?: string | null
  medical_notes?: string | null
  emergency_contact?: string | null
  auth_user_id?: string | null
  last_login?: string | null
  fullName: string
}

// Utility types
export type ActionResult<T> = Promise<{ ok: true; data: T } | { ok: false; error: string }>

// Form action types
export type FormAction = (formData: FormData) => Promise<void> | void
