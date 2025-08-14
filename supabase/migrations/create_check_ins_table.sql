-- Create check_ins table for client check-ins
-- This table stores daily check-ins from clients including week_start_date for weekly tracking

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_check_ins_coach_id ON check_ins(coach_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_client_id ON check_ins(client_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_week_start_date ON check_ins(week_start_date);
CREATE INDEX IF NOT EXISTS idx_check_ins_check_in_date ON check_ins(check_in_date);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_check_ins_client_week ON check_ins(client_id, week_start_date);

-- Enable Row Level Security
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Coaches can only see their own clients' check-ins
CREATE POLICY "Coaches can view their clients' check-ins" ON check_ins
  FOR SELECT USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can insert check-ins for their clients
CREATE POLICY "Coaches can insert check-ins for their clients" ON check_ins
  FOR INSERT WITH CHECK (
    coach_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    )
  );

-- RLS Policy: Coaches can update check-ins for their clients
CREATE POLICY "Coaches can update check-ins for their clients" ON check_ins
  FOR UPDATE USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can delete check-ins for their clients
CREATE POLICY "Coaches can delete check-ins for their clients" ON check_ins
  FOR DELETE USING (
    coach_id = auth.uid()
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_check_ins_updated_at 
  BEFORE UPDATE ON check_ins 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE check_ins IS 'Stores daily client check-ins with weekly tracking via week_start_date';
COMMENT ON COLUMN check_ins.week_start_date IS 'Start of week (Monday) for weekly progress tracking';
COMMENT ON COLUMN check_ins.check_in_date IS 'Date and time when the check-in was submitted';

