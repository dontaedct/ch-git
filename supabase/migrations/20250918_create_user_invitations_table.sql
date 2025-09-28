-- Create user_invitations table for user invitation system
-- Part of Phase 1.1 Authentication Infrastructure

CREATE TABLE IF NOT EXISTS user_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID NOT NULL REFERENCES clients(id),
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  message TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_invitations_email ON user_invitations(email);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token ON user_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_user_invitations_status ON user_invitations(status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_expires_at ON user_invitations(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_invitations_invited_by ON user_invitations(invited_by);

-- Create composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_invitations_email_status ON user_invitations(email, status);
CREATE INDEX IF NOT EXISTS idx_user_invitations_token_status ON user_invitations(invitation_token, status);

-- Enable RLS
ALTER TABLE user_invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can view invitations they sent
CREATE POLICY "Users can view invitations they sent" ON user_invitations
  FOR SELECT USING (auth.uid() = invited_by);

-- Users can view invitations sent to them (by email)
CREATE POLICY "Users can view invitations sent to them" ON user_invitations
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Service role can manage all invitations
CREATE POLICY "Service role can manage invitations" ON user_invitations
  FOR ALL USING (auth.role() = 'service_role');

-- Users can update invitations they sent (to cancel them)
CREATE POLICY "Users can update invitations they sent" ON user_invitations
  FOR UPDATE USING (auth.uid() = invited_by);

-- Users can update invitations sent to them (to accept them)
CREATE POLICY "Users can update invitations sent to them" ON user_invitations
  FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- Add comments for documentation
COMMENT ON TABLE user_invitations IS 'User invitation system for role-based access control';
COMMENT ON COLUMN user_invitations.email IS 'Email address of the invited user';
COMMENT ON COLUMN user_invitations.role IS 'Role to be assigned to the invited user';
COMMENT ON COLUMN user_invitations.invited_by IS 'ID of the user who sent the invitation';
COMMENT ON COLUMN user_invitations.invitation_token IS 'Unique token for invitation acceptance';
COMMENT ON COLUMN user_invitations.message IS 'Optional message from the inviter';
COMMENT ON COLUMN user_invitations.expires_at IS 'When the invitation expires';
COMMENT ON COLUMN user_invitations.status IS 'Current status of the invitation';
COMMENT ON COLUMN user_invitations.accepted_at IS 'When the invitation was accepted';
COMMENT ON COLUMN user_invitations.accepted_by IS 'ID of the user who accepted the invitation';

-- Create function to automatically expire invitations
CREATE OR REPLACE FUNCTION expire_invitations()
RETURNS void AS $$
BEGIN
  UPDATE user_invitations 
  SET status = 'expired', updated_at = NOW()
  WHERE status = 'pending' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old expired invitations (older than 30 days)
CREATE OR REPLACE FUNCTION cleanup_expired_invitations()
RETURNS void AS $$
BEGIN
  DELETE FROM user_invitations 
  WHERE status = 'expired' 
    AND expires_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;
