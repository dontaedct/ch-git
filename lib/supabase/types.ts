/**
 * 🚀 MIT HERO SYSTEM - SUPABASE DATABASE TYPES
 * 
 * Type-safe database schema definitions for Supabase integration.
 * These types ensure compile-time safety and proper IntelliSense support.
 */

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: Client;
        Insert: ClientInsert;
        Update: ClientUpdate;
      };
      sessions: {
        Row: Session;
        Insert: SessionInsert;
        Update: SessionUpdate;
      };
      invites: {
        Row: Invite;
        Insert: InviteInsert;
        Update: InviteUpdate;
      };
      attendance: {
        Row: Attendance;
        Insert: AttendanceInsert;
        Update: AttendanceUpdate;
      };
      checkins: {
        Row: CheckIn;
        Insert: CheckInInsert;
        Update: CheckInUpdate;
      };
      weekly_plans: {
        Row: WeeklyPlan;
        Insert: WeeklyPlanInsert;
        Update: WeeklyPlanUpdate;
      };
      trainer_profiles: {
        Row: TrainerProfile;
        Insert: TrainerProfileInsert;
        Update: TrainerProfileUpdate;
      };
      progress_metrics: {
        Row: ProgressMetric;
        Insert: ProgressMetricInsert;
        Update: ProgressMetricUpdate;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      session_type: 'group' | 'individual' | 'workshop';
      attendance_status: 'confirmed' | 'attended' | 'cancelled' | 'no_show';
      invite_status: 'pending' | 'accepted' | 'declined' | 'expired';
      checkin_status: 'checked_in' | 'checked_out' | 'late';
    };
  };
}

// Core entity types
export interface Client {
  id: string;
  coach_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  emergency_contact: string;
  medical_notes: string;
  fitness_goals: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  coach_id: string;
  title: string;
  type: Database['public']['Enums']['session_type'];
  capacity: number;
  description: string;
  duration_minutes: number;
  max_participants: number;
  created_at: string;
  updated_at: string;
  starts_at: string;
  ends_at: string;
  location: string;
  stripe_link: string;
  notes: string;
}

export interface Invite {
  id: string;
  coach_id: string;
  client_email: string;
  status: Database['public']['Enums']['invite_status'];
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: string;
  session_id: string;
  client_id: string;
  status: Database['public']['Enums']['attendance_status'];
  check_in_time: string | null;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface CheckIn {
  id: string;
  client_id: string;
  session_id: string;
  status: Database['public']['Enums']['checkin_status'];
  check_in_time: string;
  check_out_time: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface WeeklyPlan {
  id: string;
  coach_id: string;
  week_start_date: string;
  plan_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface TrainerProfile {
  id: string;
  user_id: string;
  bio: string;
  specialties: string[];
  certifications: string[];
  experience_years: number;
  created_at: string;
  updated_at: string;
}

export interface ProgressMetric {
  id: string;
  client_id: string;
  metric_type: string;
  value: number;
  unit: string;
  recorded_at: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Insert types (omit auto-generated fields)
export interface ClientInsert extends Omit<Client, 'id' | 'created_at' | 'updated_at'> {}
export interface SessionInsert extends Omit<Session, 'id' | 'created_at' | 'updated_at'> {}
export interface InviteInsert extends Omit<Invite, 'id' | 'created_at' | 'updated_at'> {}
export interface AttendanceInsert extends Omit<Attendance, 'id' | 'created_at' | 'updated_at'> {}
export interface CheckInInsert extends Omit<CheckIn, 'id' | 'created_at' | 'updated_at'> {}
export interface WeeklyPlanInsert extends Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'> {}
export interface TrainerProfileInsert extends Omit<TrainerProfile, 'id' | 'created_at' | 'updated_at'> {}
export interface ProgressMetricInsert extends Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'> {}

// Update types (make all fields optional except id)
export interface ClientUpdate extends Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>> {}
export interface SessionUpdate extends Partial<Omit<Session, 'id' | 'created_at' | 'updated_at'>> {}
export interface InviteUpdate extends Partial<Omit<Invite, 'id' | 'created_at' | 'updated_at'>> {}
export interface AttendanceUpdate extends Partial<Omit<Attendance, 'id' | 'created_at' | 'updated_at'>> {}
export interface CheckInUpdate extends Partial<Omit<CheckIn, 'id' | 'created_at' | 'updated_at'>> {}
export interface WeeklyPlanUpdate extends Partial<Omit<WeeklyPlan, 'id' | 'created_at' | 'updated_at'>> {}
export interface TrainerProfileUpdate extends Partial<Omit<TrainerProfile, 'id' | 'created_at' | 'updated_at'>> {}
export interface ProgressMetricUpdate extends Partial<Omit<ProgressMetric, 'id' | 'created_at' | 'updated_at'>> {}

// Utility types for common operations
export type TableName = keyof Database['public']['Tables'];
export type Row<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type Insert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type Update<T extends TableName> = Database['public']['Tables'][T]['Update'];

// Realtime subscription types
export interface RealtimeChannel {
  channel: string;
  event: string;
  payload: any;
  timestamp: string;
}

// Error types for better error handling
export interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Response wrapper types
export interface SupabaseResponse<T> {
  data: T | null;
  error: SupabaseError | null;
  count?: number;
  status?: number;
  statusText?: string;
}

// Health check types
export interface HealthCheckResult {
  healthy: boolean;
  timestamp: string;
  errors: string[];
  connectionCount: number;
  responseTime: number;
}
