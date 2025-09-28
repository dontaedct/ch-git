-- Create client intake RPC function
-- Migration for fixing the intake form submission issue
-- Created: 2025-09-28

-- Create the create_client_intake RPC function
CREATE OR REPLACE FUNCTION create_client_intake(
    p_coach_id VARCHAR(255),
    p_email VARCHAR(255),
    p_first_name VARCHAR(255),
    p_last_name VARCHAR(255),
    p_phone VARCHAR(50) DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    client_id UUID;
BEGIN
    -- Validate required parameters
    IF p_email IS NULL OR p_email = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;
    
    IF p_first_name IS NULL OR p_first_name = '' THEN
        RAISE EXCEPTION 'First name is required';
    END IF;

    -- Check if client already exists with this email
    IF EXISTS (SELECT 1 FROM clients_enhanced WHERE email = p_email) THEN
        RAISE EXCEPTION 'Client with email % already exists', p_email;
    END IF;

    -- Insert new client into clients_enhanced table
    INSERT INTO clients_enhanced (
        name,
        email,
        phone,
        status,
        tier,
        acquisition_source,
        created_at,
        updated_at
    ) VALUES (
        COALESCE(p_first_name || ' ' || p_last_name, p_first_name),
        p_email,
        p_phone,
        'active',
        'basic',
        'intake_form',
        NOW(),
        NOW()
    )
    RETURNING id INTO client_id;

    -- Log the successful creation
    RAISE NOTICE 'Client created successfully with ID: % and email: %', client_id, p_email;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION create_client_intake TO authenticated;
GRANT EXECUTE ON FUNCTION create_client_intake TO anon;

-- Add comment
COMMENT ON FUNCTION create_client_intake IS 'Creates a new client record from intake form data with validation and error handling';
