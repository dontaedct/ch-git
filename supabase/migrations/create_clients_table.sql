-- Create clients table for storing client information
-- This table stores client profiles linked to coaches

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

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_auth_user_id ON clients(auth_user_id);

-- Create unique constraint on email per coach
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_coach_email_unique ON clients(coach_id, email);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Coaches can only see their own clients
CREATE POLICY "Coaches can view their own clients" ON clients
  FOR SELECT USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can insert clients for themselves
CREATE POLICY "Coaches can insert clients for themselves" ON clients
  FOR INSERT WITH CHECK (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can update their own clients
CREATE POLICY "Coaches can update their own clients" ON clients
  FOR UPDATE USING (
    coach_id = auth.uid()
  );

-- RLS Policy: Coaches can delete their own clients
CREATE POLICY "Coaches can delete their own clients" ON clients
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

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE clients IS 'Stores client profiles linked to coaches';
COMMENT ON COLUMN clients.coach_id IS 'Reference to the coach who manages this client';
COMMENT ON COLUMN clients.email IS 'Client email address (unique per coach)';

