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
  location: "field" | "gym" | "track" | "other" | "Gym Studio A" | "Outdoor Track" | "Yoga Studio";
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
    id: string;
    title: string;
    category: string;
    frequency: string;
    completed?: boolean;
    description?: string;
  }>;
  goals?: Array<{
    id: string;
    title: string;
    description: string;
    target: string;
  }>;
  status: "draft" | "approved" | "sent" | "active" | "completed";
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

export type Trainer = {
  id: string;
  coach_id: string;
  name: string;
  email: string;
  phone?: string | null;
  specialties?: string[] | null;
  bio?: string | null;
  hourly_rate?: number | null;
  certifications?: string[] | null;
  business_name?: string | null;
  years_experience?: number | null;
  website?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type TrainerInsert = Omit<Trainer, 'id' | 'created_at'>;
export type TrainerUpdate = Partial<Omit<Trainer, 'id' | 'created_at'>>;

export type Invite = {
  id: string;
  coach_id: string;
  client_id: string;
  email: string;
  status: 'pending' | 'accepted' | 'declined';
  expires_at: string;
  created_at: string;
  updated_at?: string | null;
};

export type InviteInsert = Omit<Invite, 'id' | 'created_at'>;
export type InviteUpdate = Partial<Omit<Invite, 'id' | 'created_at'>>;

export type Attendance = {
  id: string;
  session_id: string;
  client_id: string;
  status: 'confirmed' | 'declined' | 'pending';
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type AttendanceInsert = Omit<Attendance, 'id' | 'created_at'>;
export type AttendanceUpdate = Partial<Omit<Attendance, 'id' | 'created_at'>>;

export type Media = {
  id: string;
  client_id: string;
  coach_id: string;
  path: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
  updated_at?: string | null;
};

export type MediaInsert = Omit<Media, 'id' | 'created_at'>;
export type MediaUpdate = Partial<Omit<Media, 'id' | 'created_at'>>;

export type EmailLog = {
  id: string;
  to_email: string;
  subject: string;
  template: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type EmailLogInsert = Omit<EmailLog, 'id' | 'created_at'>;
export type EmailLogUpdate = Partial<Omit<EmailLog, 'id' | 'created_at'>>;
