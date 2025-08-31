-- Extend user_role enum with admin and staff roles
-- Phase 5, Task 27: Role-based access control (admin/staff)

DO $$
BEGIN
  -- Add 'admin' role if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'admin'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'admin';
  END IF;

  -- Add 'staff' role if not exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_enum e ON t.oid = e.enumtypid
    WHERE t.typname = 'user_role' AND e.enumlabel = 'staff'
  ) THEN
    ALTER TYPE user_role ADD VALUE 'staff';
  END IF;
END $$;

-- Optional: document role semantics
COMMENT ON TYPE user_role IS 'User role: owner (full), admin (manage), member (rw), staff (rw limited), viewer (ro)';

