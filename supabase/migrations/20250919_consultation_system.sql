-- Consultation System Tables
-- Migration for HT-030.1.2: Data Persistence & State Management Integration
-- Created: 2025-09-19

-- 1. Consultation Sessions Table
-- Stores the main consultation session data
CREATE TABLE IF NOT EXISTS consultation_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    lead_name VARCHAR(255) NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    lead_company VARCHAR(255) NOT NULL,
    lead_phone VARCHAR(50),
    questionnaire_answers JSONB,
    consultation_results JSONB,
    status VARCHAR(50) NOT NULL DEFAULT 'lead_captured',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,

    -- Constraints
    CONSTRAINT consultation_sessions_status_check
        CHECK (status IN ('lead_captured', 'questionnaire_started', 'questionnaire_completed', 'consultation_generated', 'consultation_delivered')),
    CONSTRAINT consultation_sessions_email_check
        CHECK (lead_email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$')
);

-- 2. Questionnaire Submissions Table
-- Stores detailed questionnaire submission data
CREATE TABLE IF NOT EXISTS questionnaire_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    questionnaire_id VARCHAR(255) NOT NULL,
    answers JSONB NOT NULL,
    completion_rate INTEGER DEFAULT 0,
    time_spent_seconds INTEGER,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign key to consultation sessions
    CONSTRAINT fk_questionnaire_session
        FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
        ON DELETE CASCADE,

    -- Constraints
    CONSTRAINT questionnaire_submissions_completion_rate_check
        CHECK (completion_rate >= 0 AND completion_rate <= 100),
    CONSTRAINT questionnaire_submissions_time_spent_check
        CHECK (time_spent_seconds >= 0)
);

-- 3. Consultation Generations Table
-- Stores AI-generated consultation results
CREATE TABLE IF NOT EXISTS consultation_generations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) NOT NULL,
    questionnaire_submission_id UUID NOT NULL,
    selected_plan_id VARCHAR(255),
    ai_recommendations JSONB NOT NULL,
    generation_metadata JSONB DEFAULT '{}',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Foreign keys
    CONSTRAINT fk_generation_session
        FOREIGN KEY (session_id) REFERENCES consultation_sessions(session_id)
        ON DELETE CASCADE,
    CONSTRAINT fk_generation_submission
        FOREIGN KEY (questionnaire_submission_id) REFERENCES questionnaire_submissions(id)
        ON DELETE CASCADE
);

-- 4. Consultation Analytics Table
-- Stores aggregated analytics data
CREATE TABLE IF NOT EXISTS consultation_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_value NUMERIC NOT NULL,
    metric_metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Unique constraint for date + metric combination
    CONSTRAINT consultation_analytics_unique_date_metric
        UNIQUE (date, metric_name)
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_session_id ON consultation_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_email ON consultation_sessions(lead_email);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_status ON consultation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_created_at ON consultation_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_consultation_sessions_expires_at ON consultation_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_session_id ON questionnaire_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_questionnaire_id ON questionnaire_submissions(questionnaire_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_submissions_submitted_at ON questionnaire_submissions(submitted_at);

CREATE INDEX IF NOT EXISTS idx_consultation_generations_session_id ON consultation_generations(session_id);
CREATE INDEX IF NOT EXISTS idx_consultation_generations_submission_id ON consultation_generations(questionnaire_submission_id);
CREATE INDEX IF NOT EXISTS idx_consultation_generations_plan_id ON consultation_generations(selected_plan_id);
CREATE INDEX IF NOT EXISTS idx_consultation_generations_generated_at ON consultation_generations(generated_at);

CREATE INDEX IF NOT EXISTS idx_consultation_analytics_date ON consultation_analytics(date);
CREATE INDEX IF NOT EXISTS idx_consultation_analytics_metric_name ON consultation_analytics(metric_name);

-- Enable Row Level Security (RLS)
ALTER TABLE consultation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultation_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultation_sessions
CREATE POLICY "Allow public read access to consultation sessions" ON consultation_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to consultation sessions" ON consultation_sessions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to consultation sessions" ON consultation_sessions
    FOR UPDATE USING (true);

-- RLS Policies for questionnaire_submissions
CREATE POLICY "Allow public access to questionnaire submissions" ON questionnaire_submissions
    FOR ALL USING (true);

-- RLS Policies for consultation_generations
CREATE POLICY "Allow public access to consultation generations" ON consultation_generations
    FOR ALL USING (true);

-- RLS Policies for consultation_analytics (read-only for public)
CREATE POLICY "Allow public read access to consultation analytics" ON consultation_analytics
    FOR SELECT USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at trigger to consultation_sessions
CREATE TRIGGER update_consultation_sessions_updated_at
    BEFORE UPDATE ON consultation_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to cleanup expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_consultation_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete expired sessions and get count
    WITH deleted AS (
        DELETE FROM consultation_sessions
        WHERE expires_at < NOW()
        RETURNING id
    )
    SELECT COUNT(*) INTO deleted_count FROM deleted;

    -- Log the cleanup
    INSERT INTO consultation_analytics (date, metric_name, metric_value, metric_metadata)
    VALUES (
        CURRENT_DATE,
        'sessions_cleaned_up',
        deleted_count,
        jsonb_build_object('cleanup_timestamp', NOW())
    )
    ON CONFLICT (date, metric_name)
    DO UPDATE SET
        metric_value = consultation_analytics.metric_value + deleted_count,
        metric_metadata = jsonb_set(
            consultation_analytics.metric_metadata,
            '{last_cleanup_timestamp}',
            to_jsonb(NOW())
        );

    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate daily analytics
CREATE OR REPLACE FUNCTION generate_consultation_analytics()
RETURNS VOID AS $$
BEGIN
    -- Generate analytics for yesterday (to ensure complete data)
    INSERT INTO consultation_analytics (date, metric_name, metric_value, metric_metadata)
    SELECT
        (NOW() - INTERVAL '1 day')::date as date,
        'sessions_created' as metric_name,
        COUNT(*) as metric_value,
        jsonb_build_object('generated_at', NOW()) as metric_metadata
    FROM consultation_sessions
    WHERE DATE(created_at) = (NOW() - INTERVAL '1 day')::date
    ON CONFLICT (date, metric_name) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        metric_metadata = EXCLUDED.metric_metadata;

    -- Sessions by status
    INSERT INTO consultation_analytics (date, metric_name, metric_value, metric_metadata)
    SELECT
        (NOW() - INTERVAL '1 day')::date as date,
        'sessions_by_status_' || status as metric_name,
        COUNT(*) as metric_value,
        jsonb_build_object('status', status, 'generated_at', NOW()) as metric_metadata
    FROM consultation_sessions
    WHERE DATE(created_at) = (NOW() - INTERVAL '1 day')::date
    GROUP BY status
    ON CONFLICT (date, metric_name) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        metric_metadata = EXCLUDED.metric_metadata;

    -- Questionnaire completions
    INSERT INTO consultation_analytics (date, metric_name, metric_value, metric_metadata)
    SELECT
        (NOW() - INTERVAL '1 day')::date as date,
        'questionnaire_completions' as metric_name,
        COUNT(*) as metric_value,
        jsonb_build_object(
            'avg_completion_rate', AVG(completion_rate),
            'avg_time_spent', AVG(time_spent_seconds),
            'generated_at', NOW()
        ) as metric_metadata
    FROM questionnaire_submissions
    WHERE DATE(submitted_at) = (NOW() - INTERVAL '1 day')::date
    ON CONFLICT (date, metric_name) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        metric_metadata = EXCLUDED.metric_metadata;

    -- Consultation generations
    INSERT INTO consultation_analytics (date, metric_name, metric_value, metric_metadata)
    SELECT
        (NOW() - INTERVAL '1 day')::date as date,
        'consultation_generations' as metric_name,
        COUNT(*) as metric_value,
        jsonb_build_object('generated_at', NOW()) as metric_metadata
    FROM consultation_generations
    WHERE DATE(generated_at) = (NOW() - INTERVAL '1 day')::date
    ON CONFLICT (date, metric_name) DO UPDATE SET
        metric_value = EXCLUDED.metric_value,
        metric_metadata = EXCLUDED.metric_metadata;
END;
$$ LANGUAGE plpgsql;

-- Add table comments
COMMENT ON TABLE consultation_sessions IS 'Main consultation session data with lead information and status tracking';
COMMENT ON TABLE questionnaire_submissions IS 'Detailed questionnaire submission data with answers and completion metrics';
COMMENT ON TABLE consultation_generations IS 'AI-generated consultation results linked to questionnaire submissions';
COMMENT ON TABLE consultation_analytics IS 'Aggregated analytics data for consultation system performance monitoring';

-- Add column comments
COMMENT ON COLUMN consultation_sessions.session_id IS 'Unique session identifier for client-side state management';
COMMENT ON COLUMN consultation_sessions.expires_at IS 'Session expiration time (24 hours from creation)';
COMMENT ON COLUMN questionnaire_submissions.completion_rate IS 'Percentage of questions answered (0-100)';
COMMENT ON COLUMN questionnaire_submissions.time_spent_seconds IS 'Time spent completing questionnaire in seconds';
COMMENT ON COLUMN consultation_generations.generation_metadata IS 'Metadata about AI generation process (model version, timing, etc.)';
COMMENT ON COLUMN consultation_analytics.metric_metadata IS 'Additional context and metadata for the metric value';

-- Grant permissions for API access
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;