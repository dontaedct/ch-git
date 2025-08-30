-- RLS fixes and helper functions for Phase 4 Task 19
-- 1) Provide a generic updated_at trigger function used by some tables
-- 2) Correct clients policies to avoid invalid OLD.* refs and enforce role rules

-- 1) Generic updated_at function (used by feature_flags and others)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2) Clients policy fixes
-- Drop previous policies that referenced OLD.role or lack WITH CHECK
DROP POLICY IF EXISTS "Users can update own client record" ON clients;
DROP POLICY IF EXISTS "Owners can manage users" ON clients;

-- Users may update their own client row but cannot change their role
CREATE POLICY "Users can update own client record" ON clients
  FOR UPDATE
  USING (auth.jwt() ->> 'email' = email)
  WITH CHECK (
    auth.jwt() ->> 'email' = email
    AND role = (
      SELECT role FROM clients WHERE email = auth.jwt() ->> 'email' LIMIT 1
    )
  );

-- Owners may update any client row (including role changes)
CREATE POLICY "Owners can manage users" ON clients
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM clients AS self
      WHERE self.email = auth.jwt() ->> 'email'
      AND self.role = 'owner'
    )
  )
  WITH CHECK (true);

