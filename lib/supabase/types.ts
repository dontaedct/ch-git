export type Client = {
  id: string;
  coach_id: string;
  full_name: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string | null;
  notes?: string | null;
  stripe_customer_id?: string | null;
  created_at: string;
  updated_at?: string | null;
  date_of_birth?: string | null;
  height_cm?: number | null;
  starting_weight_kg?: number | null;
  current_weight_kg?: number | null;
  goals?: string | null;
  medical_notes?: string | null;
  emergency_contact?: string | null;
  auth_user_id?: string | null;
  last_login?: string | null;
};

export type Session = {
  id: string;
  coach_id: string;
  title: string;
  type: "group" | "private";
  location: "field" | "gym" | "track" | "other";
  starts_at: string;
  ends_at?: string | null;
  capacity: number;
  price?: number | null;
  stripe_link?: string | null;
  created_at?: string;
  updated_at?: string | null;
  description?: string | null;
  duration_minutes?: number | null;
  max_participants?: number | null;
  notes?: string | null;
};

export type WeeklyPlan = {
  id: string;
  coach_id: string;
  client_id: string;
  week_start_date: string; // ISO date
  week_end_date?: string;
  title?: string;
  description?: string;
  plan_json: unknown;
  tasks?: Array<{
    title: string;
    category: string;
    frequency: string;
    completed?: boolean;
  }>;
  goals?: Array<{
    description: string;
    target: string;
  }>;
  status: "draft" | "approved" | "sent";
  created_at?: string;
  updated_at?: string | null;
  notes?: string | null;
};

export type CheckIn = {
  id: string;
  coach_id: string;
  client_id: string;
  check_in_date: string;
  week_start_date?: string;
  adherence_pct?: number | null;
  rpe_avg?: number | null;
  energy?: number | null;
  energy_level?: number | null;
  soreness?: number | null;
  bodyweight_kg?: number | null;
  weight_kg?: number | null;
  body_fat_percentage?: number | null;
  sleep_hours?: number | null;
  water_intake_liters?: number | null;
  mood_rating?: number | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string | null;
};

export type ProgressMetric = {
  id?: string;
  client_id?: string;
  coach_id?: string;
  key: "compliance7" | "compliance28" | "sessions_done" | "streak_days" | "weight_delta";
  value: number;
  label?: string;
  weight_kg?: number;
  body_fat_percentage?: number;
  metric_date?: string;
  created_at?: string | null;
  updated_at?: string | null;
};

// Insert types (for creating new records)
export type ClientInsert = Omit<Client, 'id' | 'created_at'>;
export type SessionInsert = Omit<Session, 'id' | 'created_at'>;
export type WeeklyPlanInsert = Omit<WeeklyPlan, 'id' | 'created_at'>;
export type CheckInInsert = Omit<CheckIn, 'id' | 'created_at'>;
export type ProgressMetricInsert = Omit<ProgressMetric, 'created_at'>;

// Update types (for updating existing records)
export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_at'>>;
export type SessionUpdate = Partial<Omit<Session, 'id' | 'created_at'>>;
export type WeeklyPlanUpdate = Partial<Omit<WeeklyPlan, 'id' | 'created_at'>>;
export type CheckInUpdate = Partial<Omit<CheckIn, 'id' | 'created_at'>>;
export type ProgressMetricUpdate = Partial<Omit<ProgressMetric, 'created_at'>>;
