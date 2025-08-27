-- Master migration: Create core tables for Micro App Template
-- This migration creates the essential tables needed for the check-in flow
-- Run this migration in your Supabase project to set up the database schema

-- 1. Create clients table first (referenced by other tables)

-- 2. Create check_ins table (main table for the check-in flow)

-- 3. Create progress_metrics table (for storing progress data)

-- 4. Create weekly_plans table (for weekly training plans)

-- 5. Create sessions table (for group/private sessions)

-- 6. Create trainers table (for trainer profiles)

-- Create indexes for performance

CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_coach_email_unique ON clients(coach_id, email);

-- Enable Row Level Security on all tables
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for clients

-- RLS Policies for check_ins

-- Add table comments

-- Add column comments for key fields
COMMENT ON COLUMN check_ins.week_start_date IS 'Start of week (Monday) for weekly progress tracking - REQUIRED for check-in flow';
COMMENT ON COLUMN check_ins.check_in_date IS 'Date and time when the check-in was submitted';
COMMENT ON COLUMN weekly_plans.week_start_date IS 'Start of week (Monday) for weekly plan tracking';

