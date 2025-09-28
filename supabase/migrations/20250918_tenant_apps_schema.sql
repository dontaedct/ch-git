-- Tenant Apps Database Schema
-- Part of Phase 1.2 Database Schema & State Management
-- Creates comprehensive schema for Agency Toolkit tenant applications

-- =============================================================================
-- TENANT APPS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS tenant_apps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  admin_email VARCHAR(255) NOT NULL,
  template_id VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'sandbox' CHECK (status IN ('sandbox', 'production', 'disabled', 'archived')),
  public_url VARCHAR(255),
  admin_url VARCHAR(255),
  submissions_count INTEGER DEFAULT 0,
  documents_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  archived BOOLEAN DEFAULT FALSE,
  archived_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  settings JSONB DEFAULT '{}',
  custom_domain VARCHAR(255),
  ssl_enabled BOOLEAN DEFAULT FALSE,
  last_deployed_at TIMESTAMP WITH TIME ZONE,
  deployment_status VARCHAR(50) DEFAULT 'pending' CHECK (deployment_status IN ('pending', 'deploying', 'deployed', 'failed', 'cancelled'))
);

-- =============================================================================
-- APP USERS TABLE (Role Management)
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'editor', 'viewer')),
  invited_by UUID REFERENCES clients(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'revoked')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_app_id, email)
);

-- =============================================================================
-- FORM SUBMISSIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS form_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  form_id VARCHAR(100) NOT NULL,
  form_data JSONB NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  referrer_url TEXT,
  session_id VARCHAR(255),
  status VARCHAR(50) DEFAULT 'submitted' CHECK (status IN ('submitted', 'processed', 'failed', 'archived')),
  processed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- DOCUMENTS TABLE (PDF/Document Storage)
-- =============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES form_submissions(id) ON DELETE SET NULL,
  filename VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size INTEGER,
  file_type VARCHAR(100),
  mime_type VARCHAR(100),
  storage_provider VARCHAR(50) DEFAULT 'supabase' CHECK (storage_provider IN ('supabase', 's3', 'gcs', 'azure')),
  storage_bucket VARCHAR(255),
  storage_key VARCHAR(500),
  checksum VARCHAR(255),
  status VARCHAR(50) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'ready', 'failed', 'archived')),
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  download_count INTEGER DEFAULT 0,
  last_downloaded_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- APP THEMES TABLE (Theme Customization)
-- =============================================================================

CREATE TABLE IF NOT EXISTS app_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_app_id UUID NOT NULL REFERENCES tenant_apps(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  theme_data JSONB NOT NULL,
  is_active BOOLEAN DEFAULT FALSE,
  is_default BOOLEAN DEFAULT FALSE,
  version VARCHAR(50) DEFAULT '1.0.0',
  created_by UUID REFERENCES clients(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(tenant_app_id, name)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Tenant Apps Indexes
CREATE INDEX IF NOT EXISTS idx_tenant_apps_slug ON tenant_apps(slug);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_admin_email ON tenant_apps(admin_email);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_status ON tenant_apps(status);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_created_at ON tenant_apps(created_at);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_archived ON tenant_apps(archived);
CREATE INDEX IF NOT EXISTS idx_tenant_apps_custom_domain ON tenant_apps(custom_domain);

-- App Users Indexes
CREATE INDEX IF NOT EXISTS idx_app_users_tenant_app_id ON app_users(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_app_users_email ON app_users(email);
CREATE INDEX IF NOT EXISTS idx_app_users_role ON app_users(role);
CREATE INDEX IF NOT EXISTS idx_app_users_status ON app_users(status);
CREATE INDEX IF NOT EXISTS idx_app_users_invited_by ON app_users(invited_by);

-- Form Submissions Indexes
CREATE INDEX IF NOT EXISTS idx_form_submissions_tenant_app_id ON form_submissions(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_status ON form_submissions(status);
CREATE INDEX IF NOT EXISTS idx_form_submissions_ip_address ON form_submissions(ip_address);

-- Documents Indexes
CREATE INDEX IF NOT EXISTS idx_documents_tenant_app_id ON documents(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_documents_submission_id ON documents(submission_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_generated_at ON documents(generated_at);
CREATE INDEX IF NOT EXISTS idx_documents_storage_provider ON documents(storage_provider);

-- App Themes Indexes
CREATE INDEX IF NOT EXISTS idx_app_themes_tenant_app_id ON app_themes(tenant_app_id);
CREATE INDEX IF NOT EXISTS idx_app_themes_is_active ON app_themes(is_active);
CREATE INDEX IF NOT EXISTS idx_app_themes_created_at ON app_themes(created_at);

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Update updated_at for tenant_apps
CREATE OR REPLACE FUNCTION update_tenant_apps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenant_apps_updated_at
    BEFORE UPDATE ON tenant_apps
    FOR EACH ROW
    EXECUTE FUNCTION update_tenant_apps_updated_at();

-- Update updated_at for app_users
CREATE OR REPLACE FUNCTION update_app_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_users_updated_at
    BEFORE UPDATE ON app_users
    FOR EACH ROW
    EXECUTE FUNCTION update_app_users_updated_at();

-- Update updated_at for form_submissions
CREATE OR REPLACE FUNCTION update_form_submissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_form_submissions_updated_at
    BEFORE UPDATE ON form_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_form_submissions_updated_at();

-- Update updated_at for documents
CREATE OR REPLACE FUNCTION update_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_documents_updated_at();

-- Update updated_at for app_themes
CREATE OR REPLACE FUNCTION update_app_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_app_themes_updated_at
    BEFORE UPDATE ON app_themes
    FOR EACH ROW
    EXECUTE FUNCTION update_app_themes_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================================

-- Enable RLS on all tables
ALTER TABLE tenant_apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_themes ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- RLS POLICIES FOR TENANT_APPS
-- =============================================================================

-- Users can view tenant apps they have access to
CREATE POLICY "Users can view accessible tenant apps" ON tenant_apps
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.tenant_app_id = tenant_apps.id 
      AND app_users.email = auth.jwt() ->> 'email'
      AND app_users.status = 'accepted'
    )
    OR admin_email = auth.jwt() ->> 'email'
  );

-- Users can update tenant apps they admin
CREATE POLICY "Users can update tenant apps they admin" ON tenant_apps
  FOR UPDATE USING (
    admin_email = auth.jwt() ->> 'email'
    OR EXISTS (
      SELECT 1 FROM app_users 
      WHERE app_users.tenant_app_id = tenant_apps.id 
      AND app_users.email = auth.jwt() ->> 'email'
      AND app_users.role = 'admin'
      AND app_users.status = 'accepted'
    )
  );

-- Service role can manage all tenant apps
CREATE POLICY "Service role can manage tenant apps" ON tenant_apps
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- RLS POLICIES FOR APP_USERS
-- =============================================================================

-- Users can view app users for apps they have access to
CREATE POLICY "Users can view app users for accessible apps" ON app_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = app_users.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users au2
          WHERE au2.tenant_app_id = tenant_apps.id 
          AND au2.email = auth.jwt() ->> 'email'
          AND au2.status = 'accepted'
        )
      )
    )
  );

-- Admins can manage app users
CREATE POLICY "Admins can manage app users" ON app_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = app_users.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users au2
          WHERE au2.tenant_app_id = tenant_apps.id 
          AND au2.email = auth.jwt() ->> 'email'
          AND au2.role = 'admin'
          AND au2.status = 'accepted'
        )
      )
    )
  );

-- Service role can manage all app users
CREATE POLICY "Service role can manage app users" ON app_users
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- RLS POLICIES FOR FORM_SUBMISSIONS
-- =============================================================================

-- Users can view form submissions for apps they have access to
CREATE POLICY "Users can view form submissions for accessible apps" ON form_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = form_submissions.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users 
          WHERE app_users.tenant_app_id = tenant_apps.id 
          AND app_users.email = auth.jwt() ->> 'email'
          AND app_users.status = 'accepted'
        )
      )
    )
  );

-- Service role can manage all form submissions
CREATE POLICY "Service role can manage form submissions" ON form_submissions
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- RLS POLICIES FOR DOCUMENTS
-- =============================================================================

-- Users can view documents for apps they have access to
CREATE POLICY "Users can view documents for accessible apps" ON documents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = documents.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users 
          WHERE app_users.tenant_app_id = tenant_apps.id 
          AND app_users.email = auth.jwt() ->> 'email'
          AND app_users.status = 'accepted'
        )
      )
    )
  );

-- Service role can manage all documents
CREATE POLICY "Service role can manage documents" ON documents
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- RLS POLICIES FOR APP_THEMES
-- =============================================================================

-- Users can view themes for apps they have access to
CREATE POLICY "Users can view themes for accessible apps" ON app_themes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = app_themes.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users 
          WHERE app_users.tenant_app_id = tenant_apps.id 
          AND app_users.email = auth.jwt() ->> 'email'
          AND app_users.status = 'accepted'
        )
      )
    )
  );

-- Users can manage themes for apps they have edit access to
CREATE POLICY "Users can manage themes for accessible apps" ON app_themes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM tenant_apps 
      WHERE tenant_apps.id = app_themes.tenant_app_id 
      AND (
        tenant_apps.admin_email = auth.jwt() ->> 'email'
        OR EXISTS (
          SELECT 1 FROM app_users 
          WHERE app_users.tenant_app_id = tenant_apps.id 
          AND app_users.email = auth.jwt() ->> 'email'
          AND app_users.role IN ('admin', 'editor')
          AND app_users.status = 'accepted'
        )
      )
    )
  );

-- Service role can manage all themes
CREATE POLICY "Service role can manage themes" ON app_themes
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE tenant_apps IS 'Core tenant applications with deployment and configuration data';
COMMENT ON TABLE app_users IS 'User roles and permissions for each tenant app';
COMMENT ON TABLE form_submissions IS 'Form submission data with metadata and processing status';
COMMENT ON TABLE documents IS 'Generated documents (PDFs, etc.) with storage and access tracking';
COMMENT ON TABLE app_themes IS 'Theme customization data for tenant applications';

-- =============================================================================
-- COLUMN COMMENTS
-- =============================================================================

-- Tenant Apps
COMMENT ON COLUMN tenant_apps.slug IS 'URL-friendly identifier for the tenant app';
COMMENT ON COLUMN tenant_apps.template_id IS 'Template used to create this tenant app';
COMMENT ON COLUMN tenant_apps.status IS 'Current deployment status of the app';
COMMENT ON COLUMN tenant_apps.public_url IS 'Public URL where the app is accessible';
COMMENT ON COLUMN tenant_apps.admin_url IS 'Admin panel URL for the app';
COMMENT ON COLUMN tenant_apps.submissions_count IS 'Total number of form submissions';
COMMENT ON COLUMN tenant_apps.documents_count IS 'Total number of generated documents';
COMMENT ON COLUMN tenant_apps.custom_domain IS 'Custom domain for the app (if configured)';
COMMENT ON COLUMN tenant_apps.ssl_enabled IS 'Whether SSL is enabled for the custom domain';
COMMENT ON COLUMN tenant_apps.deployment_status IS 'Current deployment process status';

-- App Users
COMMENT ON COLUMN app_users.role IS 'User role within the tenant app (admin, editor, viewer)';
COMMENT ON COLUMN app_users.status IS 'Invitation status (pending, accepted, declined, revoked)';
COMMENT ON COLUMN app_users.permissions IS 'Additional permissions beyond role-based defaults';

-- Form Submissions
COMMENT ON COLUMN form_submissions.form_id IS 'Identifier for the form that was submitted';
COMMENT ON COLUMN form_submissions.form_data IS 'JSON data from the form submission';
COMMENT ON COLUMN form_submissions.session_id IS 'Session identifier for tracking user sessions';
COMMENT ON COLUMN form_submissions.status IS 'Processing status of the submission';

-- Documents
COMMENT ON COLUMN documents.submission_id IS 'Associated form submission (if generated from form)';
COMMENT ON COLUMN documents.storage_provider IS 'Storage service used (supabase, s3, gcs, azure)';
COMMENT ON COLUMN documents.storage_bucket IS 'Storage bucket name';
COMMENT ON COLUMN documents.storage_key IS 'Storage object key/path';
COMMENT ON COLUMN documents.checksum IS 'File integrity checksum';
COMMENT ON COLUMN documents.download_count IS 'Number of times document has been downloaded';

-- App Themes
COMMENT ON COLUMN app_themes.theme_data IS 'JSON data containing theme configuration';
COMMENT ON COLUMN app_themes.is_active IS 'Whether this theme is currently active';
COMMENT ON COLUMN app_themes.is_default IS 'Whether this is the default theme for the app';
COMMENT ON COLUMN app_themes.version IS 'Theme version for tracking changes';
