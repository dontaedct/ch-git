-- Module Marketplace Database Schema
-- HT-035.3.1 Implementation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Module marketplace tables
CREATE TABLE marketplace_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  description TEXT,
  version VARCHAR(50) NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  category VARCHAR(100),
  tags TEXT[],
  pricing_model VARCHAR(50) NOT NULL,
  price_amount DECIMAL(10,2),
  price_currency VARCHAR(3) DEFAULT 'USD',
  license_type VARCHAR(50),
  compatibility_version VARCHAR(50),
  install_count INTEGER DEFAULT 0,
  rating_average DECIMAL(3,2),
  rating_count INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  download_url TEXT,
  documentation_url TEXT,
  support_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module installations tracking
CREATE TABLE module_installations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  tenant_id UUID REFERENCES tenants(id),
  installed_version VARCHAR(50) NOT NULL,
  installed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'active',
  license_key VARCHAR(255),
  expires_at TIMESTAMP WITH TIME ZONE,
  uninstalled_at TIMESTAMP WITH TIME ZONE,
  uninstall_reason TEXT
);

-- Module reviews and ratings
CREATE TABLE module_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title VARCHAR(255),
  review_text TEXT,
  helpful INTEGER DEFAULT 0,
  not_helpful INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT FALSE,
  moderated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(module_id, user_id)
);

-- Module categories
CREATE TABLE marketplace_categories (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  module_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module licenses
CREATE TABLE module_licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  tenant_id UUID REFERENCES tenants(id),
  license_key VARCHAR(255) UNIQUE NOT NULL,
  license_type VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'active',
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  features TEXT[],
  usage_limits JSONB,
  metadata JSONB,
  revoked_at TIMESTAMP WITH TIME ZONE,
  revoke_reason TEXT
);

-- Module payments
CREATE TABLE module_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  tenant_id UUID REFERENCES tenants(id),
  payment_id VARCHAR(255) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL,
  payment_method_id VARCHAR(255),
  customer_id VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module submissions for moderation
CREATE TABLE module_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  author_id UUID REFERENCES auth.users(id),
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewer_id UUID REFERENCES auth.users(id),
  validation_result JSONB,
  metadata JSONB
);

-- Moderation actions
CREATE TABLE moderation_actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID REFERENCES module_submissions(id),
  module_id UUID REFERENCES marketplace_modules(id),
  action VARCHAR(50) NOT NULL,
  moderator_id UUID REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  comments TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Module validation results
CREATE TABLE module_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  version VARCHAR(50) NOT NULL,
  validation_id VARCHAR(255) UNIQUE NOT NULL,
  success BOOLEAN NOT NULL,
  overall_score INTEGER CHECK (overall_score >= 0 AND overall_score <= 100),
  checks JSONB NOT NULL,
  security_issues JSONB DEFAULT '[]',
  quality_issues JSONB DEFAULT '[]',
  performance_metrics JSONB,
  recommendations TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Publishing pipelines
CREATE TABLE publishing_pipelines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES marketplace_modules(id),
  version VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'building',
  steps JSONB NOT NULL,
  artifacts JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Developer statistics
CREATE TABLE developer_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  developer_id UUID REFERENCES auth.users(id),
  modules_published INTEGER DEFAULT 0,
  total_downloads INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2),
  revenue DECIMAL(10,2) DEFAULT 0,
  followers INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revenue analytics
CREATE TABLE revenue_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  module_breakdown JSONB NOT NULL,
  pricing_breakdown JSONB NOT NULL,
  growth_metrics JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_marketplace_modules_category ON marketplace_modules(category);
CREATE INDEX idx_marketplace_modules_status ON marketplace_modules(status);
CREATE INDEX idx_marketplace_modules_rating ON marketplace_modules(rating_average DESC);
CREATE INDEX idx_marketplace_modules_install_count ON marketplace_modules(install_count DESC);
CREATE INDEX idx_marketplace_modules_created_at ON marketplace_modules(created_at DESC);

CREATE INDEX idx_module_installations_tenant ON module_installations(tenant_id);
CREATE INDEX idx_module_installations_module ON module_installations(module_id);
CREATE INDEX idx_module_installations_status ON module_installations(status);

CREATE INDEX idx_module_reviews_module ON module_reviews(module_id);
CREATE INDEX idx_module_reviews_user ON module_reviews(user_id);
CREATE INDEX idx_module_reviews_rating ON module_reviews(rating);

CREATE INDEX idx_module_licenses_tenant ON module_licenses(tenant_id);
CREATE INDEX idx_module_licenses_module ON module_licenses(module_id);
CREATE INDEX idx_module_licenses_status ON module_licenses(status);
CREATE INDEX idx_module_licenses_expires ON module_licenses(expires_at);

CREATE INDEX idx_module_payments_tenant ON module_payments(tenant_id);
CREATE INDEX idx_module_payments_module ON module_payments(module_id);
CREATE INDEX idx_module_payments_status ON module_payments(status);

CREATE INDEX idx_module_submissions_status ON module_submissions(status);
CREATE INDEX idx_module_submissions_author ON module_submissions(author_id);

CREATE INDEX idx_moderation_actions_module ON moderation_actions(module_id);
CREATE INDEX idx_moderation_actions_moderator ON moderation_actions(moderator_id);

CREATE INDEX idx_module_validations_module ON module_validations(module_id);
CREATE INDEX idx_module_validations_success ON module_validations(success);

CREATE INDEX idx_publishing_pipelines_module ON publishing_pipelines(module_id);
CREATE INDEX idx_publishing_pipelines_status ON publishing_pipelines(status);

CREATE INDEX idx_developer_stats_developer ON developer_stats(developer_id);

CREATE INDEX idx_revenue_analytics_period ON revenue_analytics(period);
CREATE INDEX idx_revenue_analytics_dates ON revenue_analytics(start_date, end_date);

-- Create triggers for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_marketplace_modules_updated_at 
    BEFORE UPDATE ON marketplace_modules 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_reviews_updated_at 
    BEFORE UPDATE ON module_reviews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishing_pipelines_updated_at 
    BEFORE UPDATE ON publishing_pipelines 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_module_payments_updated_at 
    BEFORE UPDATE ON module_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update module install count
CREATE OR REPLACE FUNCTION update_module_install_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE marketplace_modules 
        SET install_count = install_count + 1 
        WHERE id = NEW.module_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE marketplace_modules 
        SET install_count = GREATEST(install_count - 1, 0) 
        WHERE id = OLD.module_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_module_install_count_trigger
    AFTER INSERT OR DELETE ON module_installations
    FOR EACH ROW EXECUTE FUNCTION update_module_install_count();

-- Create function to update module rating
CREATE OR REPLACE FUNCTION update_module_rating()
RETURNS TRIGGER AS $$
DECLARE
    avg_rating DECIMAL(3,2);
    rating_count INTEGER;
BEGIN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*)
    INTO avg_rating, rating_count
    FROM module_reviews
    WHERE module_id = COALESCE(NEW.module_id, OLD.module_id);
    
    UPDATE marketplace_modules 
    SET 
        rating_average = COALESCE(avg_rating, 0),
        rating_count = rating_count
    WHERE id = COALESCE(NEW.module_id, OLD.module_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

CREATE TRIGGER update_module_rating_trigger
    AFTER INSERT OR UPDATE OR DELETE ON module_reviews
    FOR EACH ROW EXECUTE FUNCTION update_module_rating();

-- Create function to update category module count
CREATE OR REPLACE FUNCTION update_category_module_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE marketplace_categories 
        SET module_count = module_count + 1 
        WHERE id = NEW.category;
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.category != NEW.category THEN
            UPDATE marketplace_categories 
            SET module_count = GREATEST(module_count - 1, 0) 
            WHERE id = OLD.category;
            UPDATE marketplace_categories 
            SET module_count = module_count + 1 
            WHERE id = NEW.category;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE marketplace_categories 
        SET module_count = GREATEST(module_count - 1, 0) 
        WHERE id = OLD.category;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_category_module_count_trigger
    AFTER INSERT OR UPDATE OR DELETE ON marketplace_modules
    FOR EACH ROW EXECUTE FUNCTION update_category_module_count();

-- Insert default categories
INSERT INTO marketplace_categories (id, name, description, icon) VALUES
('productivity', 'Productivity', 'Tools to improve workflow and efficiency', '⚡'),
('analytics', 'Analytics', 'Data analysis and reporting modules', '📊'),
('integrations', 'Integrations', 'Third-party service integrations', '🔗'),
('automation', 'Automation', 'Workflow automation and triggers', '🤖'),
('communication', 'Communication', 'Email, messaging, and notification tools', '💬'),
('security', 'Security', 'Security and compliance modules', '🔒'),
('ui-components', 'UI Components', 'Custom UI components and widgets', '🎨'),
('utilities', 'Utilities', 'Helper tools and utilities', '🛠️')
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies
ALTER TABLE marketplace_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_installations ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE module_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE publishing_pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE developer_stats ENABLE ROW LEVEL SECURITY;

-- Public read access for approved modules
CREATE POLICY "Public can view approved modules" ON marketplace_modules
    FOR SELECT USING (status = 'approved');

-- Public read access for categories
CREATE POLICY "Public can view categories" ON marketplace_categories
    FOR SELECT USING (true);

-- Public read access for reviews
CREATE POLICY "Public can view reviews" ON module_reviews
    FOR SELECT USING (true);

-- Users can manage their own installations
CREATE POLICY "Users can manage own installations" ON module_installations
    FOR ALL USING (tenant_id = auth.uid());

-- Users can manage their own reviews
CREATE POLICY "Users can manage own reviews" ON module_reviews
    FOR ALL USING (user_id = auth.uid());

-- Users can manage their own licenses
CREATE POLICY "Users can manage own licenses" ON module_licenses
    FOR ALL USING (tenant_id = auth.uid());

-- Users can manage their own payments
CREATE POLICY "Users can manage own payments" ON module_payments
    FOR ALL USING (tenant_id = auth.uid());

-- Authors can manage their own submissions
CREATE POLICY "Authors can manage own submissions" ON module_submissions
    FOR ALL USING (author_id = auth.uid());

-- Authors can manage their own modules
CREATE POLICY "Authors can manage own modules" ON marketplace_modules
    FOR ALL USING (author_id = auth.uid());

-- Authors can manage their own publishing pipelines
CREATE POLICY "Authors can manage own pipelines" ON publishing_pipelines
    FOR ALL USING (module_id IN (
        SELECT id FROM marketplace_modules WHERE author_id = auth.uid()
    ));

-- Authors can manage their own developer stats
CREATE POLICY "Authors can manage own stats" ON developer_stats
    FOR ALL USING (developer_id = auth.uid());

-- Admins can moderate
CREATE POLICY "Admins can moderate" ON moderation_actions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Admins can view all validations
CREATE POLICY "Admins can view all validations" ON module_validations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE id = auth.uid() 
            AND raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Create views for common queries
CREATE VIEW module_marketplace_view AS
SELECT 
    m.*,
    c.name as category_name,
    c.description as category_description,
    c.icon as category_icon,
    COUNT(DISTINCT i.id) as active_installs,
    COUNT(DISTINCT r.id) as review_count,
    AVG(r.rating) as calculated_rating
FROM marketplace_modules m
LEFT JOIN marketplace_categories c ON m.category = c.id
LEFT JOIN module_installations i ON m.id = i.module_id AND i.status = 'active'
LEFT JOIN module_reviews r ON m.id = r.module_id
WHERE m.status = 'approved'
GROUP BY m.id, c.name, c.description, c.icon;

CREATE VIEW developer_dashboard_view AS
SELECT 
    ds.*,
    COUNT(DISTINCT m.id) as published_modules,
    SUM(m.install_count) as total_module_installs,
    AVG(m.rating_average) as average_module_rating
FROM developer_stats ds
LEFT JOIN marketplace_modules m ON ds.developer_id = m.author_id AND m.status = 'approved'
GROUP BY ds.id;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT INSERT, UPDATE, DELETE ON marketplace_modules TO authenticated;
GRANT INSERT, UPDATE, DELETE ON module_installations TO authenticated;
GRANT INSERT, UPDATE, DELETE ON module_reviews TO authenticated;
GRANT INSERT, UPDATE, DELETE ON module_licenses TO authenticated;
GRANT INSERT, UPDATE, DELETE ON module_payments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON module_submissions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON publishing_pipelines TO authenticated;
GRANT INSERT, UPDATE, DELETE ON developer_stats TO authenticated;

-- Grant admin permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO service_role;
