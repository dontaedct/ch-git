-- Master migration: Create core tables for Coach Hub
-- This migration creates the essential tables needed for the check-in flow
-- Run this migration in your Supabase project to set up the database schema

-- 1. Create clients table first (referenced by other tables)
CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  notes TEXT,
  stripe_customer_id TEXT,
  date_of_birth DATE,
  height_cm INTEGER CHECK (height_cm > 0 AND height_cm < 300),
  starting_weight_kg DECIMAL(5,2) CHECK (starting_weight_kg >= 20 AND starting_weight_kg <= 500),
  current_weight_kg DECIMAL(5,2) CHECK (current_weight_kg >= 20 AND current_weight_kg <= 500),
  goals TEXT,
  medical_notes TEXT,
  emergency_contact TEXT,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create check_ins table (main table for the check-in flow)
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Start of week (Monday) for weekly tracking
  check_in_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(), -- Date/time of check-in
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 5), -- 1-5 mood scale
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5), -- 1-5 energy scale
  sleep_hours DECIMAL(3,1) CHECK (sleep_hours >= 0 AND sleep_hours <= 24), -- Hours slept
  water_intake_liters DECIMAL(4,2) CHECK (water_intake_liters >= 0 AND water_intake_liters <= 10), -- Water intake in liters
  weight_kg DECIMAL(5,2) CHECK (weight_kg >= 20 AND weight_kg <= 500), -- Weight in kg
  body_fat_percentage DECIMAL(4,1) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 50), -- Body fat %
  notes TEXT, -- Additional notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create progress_metrics table (for storing progress data)
CREATE TABLE IF NOT EXISTS progress_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  metric_date DATE NOT NULL, -- Date when the metric was recorded
  weight_kg DECIMAL(5,2) CHECK (weight_kg >= 20 AND weight_kg <= 500), -- Weight in kg
  body_fat_percentage DECIMAL(4,1) CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 50), -- Body fat %
  body_weight_lbs DECIMAL(6,2) CHECK (body_weight_lbs >= 44 AND body_weight_lbs <= 1100), -- Weight in lbs
  body_fat_lbs DECIMAL(6,2) CHECK (body_fat_lbs >= 0 AND body_fat_lbs <= 550), -- Body fat in lbs
  lean_mass_lbs DECIMAL(6,2) CHECK (lean_mass_lbs >= 44 AND lean_mass_lbs <= 1100), -- Lean mass in lbs
  bmi DECIMAL(4,2) CHECK (bmi >= 10 AND bmi <= 100), -- Body Mass Index
  waist_circumference_cm DECIMAL(5,1) CHECK (waist_circumference_cm >= 30 AND waist_circumference_cm <= 200), -- Waist circumference
  chest_circumference_cm DECIMAL(5,1) CHECK (chest_circumference_cm >= 30 AND chest_circumference_cm <= 200), -- Chest circumference
  arm_circumference_cm DECIMAL(4,1) CHECK (arm_circumference_cm >= 10 AND arm_circumference_cm <= 100), -- Arm circumference
  leg_circumference_cm DECIMAL(4,1) CHECK (leg_circumference_cm >= 20 AND leg_circumference_cm <= 150), -- Leg circumference
  notes TEXT, -- Additional notes about the metrics
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create weekly_plans table (for weekly training plans)
CREATE TABLE IF NOT EXISTS weekly_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL, -- Start of week (Monday)
  week_end_date DATE, -- End of week (Sunday)
  title TEXT,
  description TEXT,
  plan_json JSONB, -- JSON structure for the plan details
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'sent', 'active', 'completed')),
  goals JSONB DEFAULT '[]', -- Array of goal objects
  tasks JSONB DEFAULT '[]', -- Array of task objects
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create sessions table (for group/private sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('group', 'private')),
  location TEXT NOT NULL,
  starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ends_at TIMESTAMP WITH TIME ZONE,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  price DECIMAL(10,2) CHECK (price >= 0),
  stripe_link TEXT,
  description TEXT,
  duration_minutes INTEGER CHECK (duration_minutes > 0),
  max_participants INTEGER CHECK (max_participants > 0),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create trainers table (for trainer profiles)
CREATE TABLE IF NOT EXISTS trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  bio TEXT NOT NULL,
  specialties TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  years_experience INTEGER CHECK (years_experience >= 0),
  hourly_rate INTEGER CHECK (hourly_rate >= 0),
  website TEXT,
  social_links JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON clients(auth_user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_coach_email_unique ON clients(coach_id, email);

CREATE INDEX IF NOT EXISTS idx_check_ins_coach_id ON check_ins(coach_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_id ON check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_week_start_date ON check_ins(week_start_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_check_in_date ON check_ins(check_in_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_week ON check_ins(client_id, week_start_date);

CREATE INDEX IF NOT EXISTS idx_progress_metrics_coach_id ON progress_metrics(coach_id);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_client_id ON progress_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_metric_date ON progress_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_client_date ON progress_metrics(client_id, metric_date);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_coach_id ON weekly_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_client_id ON weekly_plans(client_id);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_week_start_date ON weekly_plans(week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_plans_status ON weekly_plans(status);

CREATE INDEX IF NOT EXISTS idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX IF NOT EXISTS idx_sessions_starts_at ON sessions(starts_at);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);

CREATE INDEX IF NOT EXISTS idx_trainers_user_id ON trainers(user_id);

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients
CREATE POLICY "Coaches can view their own clients" ON clients FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert clients for themselves" ON clients FOR INSERT WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Coaches can update their own clients" ON clients FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete their own clients" ON clients FOR DELETE USING (coach_id = auth.uid());

-- RLS Policies for check_ins
CREATE POLICY "Coaches can view their clients' check-ins" ON check_ins FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert check-ins for their clients" ON check_ins FOR INSERT WITH CHECK (
  coach_id = auth.uid() AND EXISTS (SELECT 1 FROM clients WHERE id = client_id AND coach_id = auth.uid())
);
CREATE POLICY "Coaches can update check-ins for their clients" ON check_ins FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete check-ins for their clients" ON check_ins FOR DELETE USING (coach_id = auth.uid());

-- RLS Policies for progress_metrics
CREATE POLICY "Coaches can view their clients' progress metrics" ON progress_metrics FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert progress metrics for their clients" ON progress_metrics FOR INSERT WITH CHECK (
  coach_id = auth.uid() AND EXISTS (SELECT 1 FROM clients WHERE id = client_id AND coach_id = auth.uid())
);
CREATE POLICY "Coaches can update progress metrics for their clients" ON progress_metrics FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete progress metrics for their clients" ON progress_metrics FOR DELETE USING (coach_id = auth.uid());

-- RLS Policies for weekly_plans
CREATE POLICY "Coaches can view their clients' weekly plans" ON weekly_plans FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert weekly plans for their clients" ON weekly_plans FOR INSERT WITH CHECK (
  coach_id = auth.uid() AND EXISTS (SELECT 1 FROM clients WHERE id = client_id AND coach_id = auth.uid())
);
CREATE POLICY "Coaches can update weekly plans for their clients" ON weekly_plans FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete weekly plans for their clients" ON weekly_plans FOR DELETE USING (coach_id = auth.uid());

-- RLS Policies for sessions
CREATE POLICY "Coaches can view their own sessions" ON sessions FOR SELECT USING (coach_id = auth.uid());
CREATE POLICY "Coaches can insert sessions for themselves" ON sessions FOR INSERT WITH CHECK (coach_id = auth.uid());
CREATE POLICY "Coaches can update their own sessions" ON sessions FOR UPDATE USING (coach_id = auth.uid());
CREATE POLICY "Coaches can delete their own sessions" ON sessions FOR DELETE USING (coach_id = auth.uid());

-- RLS Policies for trainers
CREATE POLICY "Trainers can view their own profile" ON trainers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Trainers can insert their own profile" ON trainers FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Trainers can update their own profile" ON trainers FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Trainers can delete their own profile" ON trainers FOR DELETE USING (user_id = auth.uid());

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_check_ins_updated_at BEFORE UPDATE ON check_ins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_metrics_updated_at BEFORE UPDATE ON progress_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_weekly_plans_updated_at BEFORE UPDATE ON weekly_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add table comments
COMMENT ON TABLE clients IS 'Stores client profiles linked to coaches';
COMMENT ON TABLE check_ins IS 'Stores daily client check-ins with weekly tracking via week_start_date';
COMMENT ON TABLE progress_metrics IS 'Stores client progress metrics like weight, body fat, and measurements';
COMMENT ON TABLE weekly_plans IS 'Stores weekly training plans for clients';
COMMENT ON TABLE sessions IS 'Stores group and private training sessions';
COMMENT ON TABLE trainers IS 'Stores trainer profile information';

-- Add column comments for key fields
COMMENT ON COLUMN check_ins.week_start_date IS 'Start of week (Monday) for weekly progress tracking - REQUIRED for check-in flow';
COMMENT ON COLUMN check_ins.check_in_date IS 'Date and time when the check-in was submitted';
COMMENT ON COLUMN weekly_plans.week_start_date IS 'Start of week (Monday) for weekly plan tracking';

