-- Create progress_metrics table for storing client progress data
-- This table stores metrics like weight, body fat, and other progress indicators

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_progress_metrics_coach_id ON progress_metrics(coach_id);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_client_id ON progress_metrics(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_metrics_metric_date ON progress_metrics(metric_date);

-- Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_progress_metrics_client_date ON progress_metrics(client_id, metric_date);

-- Enable Row Level Security
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Coaches can only see their own clients' progress metrics
CREATE POLICY "Coaches can view their clients' progress metrics" ON progress_metrics
  FOR SELECT USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can insert progress metrics for their clients
CREATE POLICY "Coaches can insert progress metrics for their clients" ON progress_metrics
  FOR INSERT WITH CHECK (
    coach_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM clients 
      WHERE id = client_id AND coach_id = auth.uid()
    )
  );

-- RLS Policy: Coaches can update progress metrics for their clients
CREATE POLICY "Coaches can update progress metrics for their clients" ON progress_metrics
  FOR UPDATE USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can delete progress metrics for their clients
CREATE POLICY "Coaches can delete progress metrics for their clients" ON progress_metrics
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

CREATE TRIGGER update_progress_metrics_updated_at 
  BEFORE UPDATE ON progress_metrics 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE progress_metrics IS 'Stores client progress metrics like weight, body fat, and measurements';
COMMENT ON COLUMN progress_metrics.metric_date IS 'Date when the metric was recorded';
COMMENT ON COLUMN progress_metrics.weight_kg IS 'Weight in kilograms';
COMMENT ON COLUMN progress_metrics.body_fat_percentage IS 'Body fat percentage';

