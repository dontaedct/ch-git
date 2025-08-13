-- Example RPC function for weekly plan creation
-- This demonstrates the pattern for other multi-table operations
-- Uncomment and customize as needed

/*
CREATE OR REPLACE FUNCTION create_weekly_plan(
  p_client_id UUID,
  p_coach_id UUID,
  p_week_start_date DATE,
  p_week_end_date DATE,
  p_title TEXT,
  p_description TEXT DEFAULT NULL,
  p_goals TEXT[] DEFAULT '{}',
  p_tasks JSONB DEFAULT '[]'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_plan_id UUID;
BEGIN
  -- Insert weekly plan
  INSERT INTO weekly_plans (
    client_id,
    coach_id,
    week_start_date,
    week_end_date,
    title,
    description,
    goals,
    created_at,
    updated_at
  ) VALUES (
    p_client_id,
    p_coach_id,
    p_week_start_date,
    p_week_end_date,
    p_title,
    p_description,
    p_goals,
    NOW(),
    NOW()
  ) RETURNING id INTO v_plan_id;

  -- Insert tasks if provided
  IF p_tasks IS NOT NULL AND jsonb_array_length(p_tasks) > 0 THEN
    INSERT INTO weekly_plan_tasks (
      weekly_plan_id,
      title,
      description,
      category,
      frequency,
      custom_schedule,
      completed,
      notes
    )
    SELECT 
      v_plan_id,
      (task->>'title')::TEXT,
      (task->>'description')::TEXT,
      (task->>'category')::TEXT,
      (task->>'frequency')::TEXT,
      (task->>'custom_schedule')::TEXT,
      COALESCE((task->>'completed')::BOOLEAN, false),
      (task->>'notes')::TEXT
    FROM jsonb_array_elements(p_tasks) AS task;
  END IF;

  RETURN v_plan_id;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION create_weekly_plan(UUID, UUID, DATE, DATE, TEXT, TEXT, TEXT[], JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_weekly_plan(UUID, UUID, DATE, DATE, TEXT, TEXT, TEXT[], JSONB) TO service_role;
*/
