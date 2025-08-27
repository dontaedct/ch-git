# OSS Hero Template

A minimal, production-ready Next.js application template with Supabase integration, authentication, feature flags, and comprehensive security measures.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account and project

### 1. Create New App
```bash
# From the template directory
node bin/create-micro-app.mjs my-new-app
cd my-new-app
```

### 2. Environment Setup
```bash
# Copy environment template
cp env.example .env.local

# Edit .env.local with your Supabase credentials
# Required:
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Install & Run
```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your app!

## 🏗️ Template Features

### Core Infrastructure
- **Authentication**: Supabase Auth with protected routes
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Feature Flags**: Per-tenant feature management
- **UI Components**: shadcn/ui + Tailwind CSS
- **Type Safety**: Full TypeScript coverage
- **Testing**: Jest + Playwright setup
- **Security**: CSP headers, secret management, bundle analysis
- **Monitoring**: Sentry error tracking
- **Deployment**: Vercel-ready configuration

### Minimal Template Structure
```
app/
├── login/          # Authentication pages
├── operability/    # Admin/ops interface
└── api/           # API routes
    ├── health/    # Health check endpoint
    ├── ping/      # Basic ping endpoint
    └── webhooks/  # Webhook handlers

components/
├── ui/            # Reusable UI components
├── header.tsx     # Main header component
├── ProtectedNav.tsx  # Navigation for authenticated users
└── PublicNav.tsx  # Navigation for public users

lib/
├── supabase/      # Supabase client configuration
├── auth/          # Authentication utilities
├── flags/         # Feature flags system
└── registry/      # Application registries

data/              # Data access layer
types/             # TypeScript type definitions
supabase/          # Database migrations and config
```

## 🔧 Per-Client Setup

### 1. Supabase Project Setup

#### Create New Project
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note your project URL and keys

#### Database Schema
The template includes basic migrations:
```sql
-- Users table with RLS
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Feature flags table
CREATE TABLE feature_flags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES auth.users(id) NOT NULL,
  key TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, key)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can manage own flags" ON feature_flags
  FOR ALL USING (auth.uid() = tenant_id);
```

### 2. Environment Configuration

#### Required Variables
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Optional: Sentry for error tracking
SENTRY_DSN=https://your_sentry_dsn
```

#### Security Notes
- `SUPABASE_SERVICE_ROLE_KEY` should NEVER be exposed to the client
- Use `.env.local` for local development
- Use Vercel environment variables for production

### 3. Customization Steps

#### Branding
1. Update `app/layout.tsx` with your app name and metadata
2. Replace favicon.ico with your logo
3. Update color scheme in `tailwind.config.js`

#### Authentication
1. Customize login page in `app/login/page.tsx`
2. Add signup flow if needed
3. Configure auth redirects in `middleware.ts`

#### Feature Flags
1. Define flags in `lib/registry/flags.ts`
2. Use flags in components with `useFlag()` hook
3. Manage flags via `/operability/flags` admin interface

#### API Routes
1. Add new API routes in `app/api/`
2. Follow existing patterns for error handling
3. Use Supabase client for database operations

### 4. Development Workflow

#### Code Quality
```bash
# Run all checks
npm run ci

# Individual checks
npm run lint          # ESLint
npm run typecheck     # TypeScript
npm run test          # Unit tests
npm run test:smoke    # E2E tests
```

#### Database Changes
```bash
# Create new migration
npx supabase migration new migration_name

# Apply migrations
npx supabase db push

# Reset database (development only)
npx supabase db reset
```

#### Component Development
```bash
# Add new UI component
# 1. Create in components/ui/
# 2. Export from components/ui/index.ts
# 3. Import with @ui/ alias
```

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Supports PostgreSQL + Node.js
- **Self-hosted**: Docker support available

## 🔒 Security Checklist

- [ ] RLS policies configured for all tables
- [ ] Service role key only used server-side
- [ ] Environment variables properly secured
- [ ] CSP headers configured
- [ ] Input validation implemented
- [ ] Rate limiting on API routes
- [ ] Error messages don't expose internals
- [ ] Dependencies regularly updated

## 📚 Examples

Check the `examples/` directory for:
- `auto-save-demo/`: Auto-save functionality demo
- `guardian-demo/`: Security guardian demo
- `design-system/`: UI component showcase
- `ai-live/`: AI integration example
- `test-routes/`: Testing patterns

## 🤝 Contributing

1. Fork the template
2. Create feature branch
3. Make changes
4. Run `npm run ci` to ensure quality
5. Submit pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

- **Documentation**: Check `/docs/` directory
- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Security**: Report to security@example.com

---

**Built with ❤️ for the OSS community**
