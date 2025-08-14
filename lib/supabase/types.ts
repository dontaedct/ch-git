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
  week_end_date?: string; // ISO date
  title?: string; // Plan title
  description?: string; // Plan description
  plan_json: unknown;
  status: "draft" | "approved" | "sent" | "active" | "completed";
  tasks?: WeeklyPlanTask[]; // Array of tasks - optional but defaults to empty array
  goals?: WeeklyPlanGoal[]; // Array of goals - optional but defaults to empty array
  created_at?: string;
  updated_at?: string | null;
  notes?: string | null;
};

export type WeeklyPlanTask = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
  category: 'workout' | 'nutrition' | 'mindfulness' | 'other';
  frequency: 'daily' | 'weekly' | 'custom';
  custom_schedule?: string | null;
  notes?: string | null;
};

export type WeeklyPlanGoal = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  order: number;
};

export type CheckIn = {
  id: string;
  coach_id: string;
  client_id: string;
  week_start_date: string;
  check_in_date?: string; // Date of check-in
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
  id: string;
  coach_id: string;
  client_id: string;
  key: "compliance7" | "compliance28" | "sessions_done" | "streak_days" | "weight_delta";
  value: number;
  label?: string;
  metric_date?: string; // Date of the metric
  weight_kg?: number | null; // Weight in kg
  body_fat_percentage?: number | null; // Body fat percentage
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

// Missing types that are imported in lib/types.ts
export type EmailLog = {
  id: string;
  coach_id: string;
  client_id?: string | null;
  session_id?: string | null;
  email_type: string;
  subject: string;
  to_email: string;
  status: 'sent' | 'failed' | 'pending';
  error_message?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type Trainer = {
  id: string;
  coach_id: string;
  user_id: string;
  business_name?: string | null;
  specialization?: string | null;
  specialties?: string[]; // Array of specialties
  experience_years?: number | null;
  years_experience?: number | null; // Alternative name for experience_years
  hourly_rate?: number | null; // Hourly rate
  certifications?: string[] | null;
  bio?: string | null;
  website?: string | null;
  social_media?: Record<string, string> | null;
  created_at: string;
  updated_at?: string | null;
};

export type Invite = {
  id: string;
  coach_id: string;
  session_id: string;
  client_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  sent_at: string;
  responded_at?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type Attendance = {
  id: string;
  coach_id: string;
  session_id: string;
  client_id: string;
  status: 'confirmed' | 'attended' | 'no_show' | 'cancelled';
  check_in_time?: string | null;
  check_out_time?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at?: string | null;
};

export type Media = {
  id: string;
  coach_id: string;
  client_id?: string | null;
  session_id?: string | null;
  file_path: string;
  file_name: string;
  file_size: number;
  mime_type: string;
  media_type: 'image' | 'video' | 'document' | 'other';
  tags?: string[] | null;
  description?: string | null;
  created_at: string;
  updated_at?: string | null;
};

// Insert types for new types
export type EmailLogInsert = Omit<EmailLog, 'id' | 'created_at'>;
export type TrainerInsert = Omit<Trainer, 'id' | 'created_at'>;
export type InviteInsert = Omit<Invite, 'id' | 'created_at'>;
export type AttendanceInsert = Omit<Attendance, 'id' | 'created_at'>;
export type MediaInsert = Omit<Media, 'id' | 'created_at'>;

// Update types for new types
export type EmailLogUpdate = Partial<Omit<EmailLog, 'id' | 'created_at'>>;
export type TrainerUpdate = Partial<Omit<Trainer, 'id' | 'created_at'>>;
export type InviteUpdate = Partial<Omit<Invite, 'id' | 'created_at'>>;
export type AttendanceUpdate = Partial<Omit<Attendance, 'id' | 'created_at'>>;
export type MediaUpdate = Partial<Omit<Media, 'id' | 'created_at'>>;
