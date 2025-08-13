-- Create the atomic intake RPC function
-- This function handles both client upsert and email logging in a single transaction
CREATE OR REPLACE FUNCTION create_client_intake(
  p_coach_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert or upsert client
  INSERT INTO clients (
    coach_id,
    email,
    first_name,
    last_name,
    phone,
    created_at,
    updated_at
  ) VALUES (
    p_coach_id,
    p_email,
    p_first_name,
    p_last_name,
    p_phone,
    NOW(),
    NOW()
  )
  ON CONFLICT (coach_id, email)
  DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    phone = EXCLUDED.phone,
    updated_at = NOW();

  -- Log email (align to email_logs schema)
  INSERT INTO email_logs (
    to_email,
    template,
    subject,
    sent_at,
    status,
    metadata
  ) VALUES (
    p_email,
    'welcome',
    'Welcome to the program',
    NOW(),
    'sent',
    jsonb_build_object('coach_id', p_coach_id)
  );
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_client_intake(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION create_client_intake(UUID, TEXT, TEXT, TEXT, TEXT) TO service_role;
