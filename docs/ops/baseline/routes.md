# Routes Inventory - Next.js App Router

Generated on: 2025-08-29T03:53:00Z

## Page Routes (App Router)

### Root Routes
- `/` → `app/page.tsx` (Home/Landing page)
- `/error` → `app/error.tsx` (Global error boundary)
- `/global-error` → `app/global-error.tsx` (Global error handler)

### Authentication Routes
- `/login` → `app/login/page.tsx` (Login page)

### Dashboard Routes
- `/dashboard` → `app/dashboard/page.tsx` (Main dashboard)
- `/dashboard/design` → `app/dashboard/design/page.tsx` (Design dashboard)
- `/dashboard/operability` → `app/dashboard/operability/page.tsx` (Operability dashboard)

### Consultation Routes
- `/consultation` → `app/consultation/page.tsx` (Consultation page)
- `/consultation/engine` → `app/consultation/engine/page.tsx` (Consultation engine)

### Intake Routes
- `/intake` → `app/intake/page.tsx` (Intake form)
- `/intake/form` → `app/intake/form/page.tsx` (Intake form page)

### Questionnaire Routes
- `/questionnaire` → `app/questionnaire/page.tsx` (Questionnaire page)
- `/questionnaire-demo` → `app/questionnaire-demo/page.tsx` (Questionnaire demo)

### Status & Utility Routes
- `/status` → `app/status/page.tsx` (Status page)
- `/tokens-preview` → `app/tokens-preview/page.tsx` (Tokens preview)
- `/probe` → `app/probe/page.tsx` (Probe/health check)

### Example Routes
- `/examples` → `app/examples/page.tsx` (Examples page)

## API Routes (App Router)

### Core API Routes
- `/api/auth/*` → Authentication endpoints
- `/api/consultation/*` → Consultation API endpoints
- `/api/dashboard/*` → Dashboard data endpoints
- `/api/intake/*` → Intake form processing
- `/api/questionnaire/*` → Questionnaire processing
- `/api/status/*` → Status and health endpoints

### Adapter Routes
- `/api/adapters/*` → External service adapters

### Utility Routes
- `/api/probe/*` → Health check and monitoring endpoints

## Route Patterns

### Protected Routes
- `/dashboard/*` - Requires authentication
- `/consultation/*` - May require authentication
- `/intake/*` - Public but may have rate limiting

### Public Routes
- `/` - Landing page
- `/login` - Authentication
- `/status` - Health checks
- `/examples` - Demo content

### API Route Structure
- RESTful patterns for CRUD operations
- Consistent error handling across endpoints
- Rate limiting on public endpoints
- Authentication middleware on protected endpoints

## Route Dependencies

### Middleware
- `middleware.ts` - Global middleware for authentication, rate limiting, and security headers

### Layout Dependencies
- `app/layout.tsx` - Root layout with providers and navigation
- `app/globals.tailwind.css` - Global styles

### Navigation Components
- `components/GlobalNav.tsx` - Global navigation
- `components/ProtectedNav.tsx` - Protected route navigation
- `components/PublicNav.tsx` - Public route navigation

## Route Security

### Authentication
- Supabase authentication integration
- Protected route guards
- Session management

### Rate Limiting
- API rate limiting on public endpoints
- Bot detection and protection

### CORS
- Configured for production domains
- Development environment allowances
