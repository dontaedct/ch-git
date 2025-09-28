# Unified Client Creation Workflow

## Overview

The DCT Micro-Apps platform now features a unified workflow for creating client micro-applications using a single universal consultation template. Both the DCT CLI and web-based intake form collect the same comprehensive data and produce identical results.

## Workflow Options

### Option 1: DCT CLI (Recommended for Developers)

**Command:**
```bash
npx dct init
```

**Interactive Prompts:**
1. Client business name
2. Industry type (technology, healthcare, finance, retail, manufacturing, consulting, education, nonprofit, other)
3. Company size (solo, small, medium, large, enterprise)
4. Primary challenges (growth, efficiency, technology, team, marketing, finance, competition, compliance)
5. Primary goals (revenue-growth, cost-reduction, market-expansion, product-development, team-building, automation, customer-satisfaction, digital-transformation)
6. Budget range (under-5k, 5k-15k, 15k-50k, 50k-plus)
7. Timeline (immediately, within-month, within-quarter, planning)

**CI Mode:**
```bash
npx dct init --ci --name "Company Name" --industry technology --size medium --challenges growth --goals revenue-growth --budget 15k-50k --timeline within-month
```

### Option 2: Web-Based Intake Form (Recommended for Non-Technical Users)

**URL:** `http://localhost:3000/intake`

**Form Fields:**
- Company Name
- Email Address
- Full Name
- Phone Number (optional)
- Industry (dropdown)
- Company Size (dropdown)
- Primary Business Challenges (dropdown)
- Primary Business Goals (dropdown)
- Budget Range (dropdown)
- Timeline (dropdown)
- Privacy & Marketing Consent

**Automatic Processing:**
- Creates client database record
- Automatically executes DCT CLI with collected data
- Generates configuration files
- Sends confirmation email

## Universal Consultation Template

### Features

- **AI-Powered Consultation Engine**: Comprehensive business analysis with industry-specific recommendations
- **Multi-Industry Support**: Adapts to any industry vertical
- **Service Package Management**: Dynamic recommendations based on client data
- **White-Label Branding**: Complete client customization
- **Advanced Tier**: All enterprise features included

### Service Packages

1. **Strategic Assessment** ($2,500) - Foundation tier
2. **Digital Transformation Package** ($5,000) - Growth tier
3. **Growth Accelerator** ($7,500) - Enterprise tier
4. **Enterprise Transformation** ($15,000) - Enterprise tier

## Generated Files

Both workflows generate identical configuration files:

- `app.config.ts` - Application configuration with client settings
- `.env.local` - Environment variables with placeholders

## Next Steps

1. Replace placeholder values in `.env.local`
2. Run `npm run env:doctor` to validate configuration
3. Visit `/admin/diagnostics` to verify setup
4. Start with `npm run dev`

## Integration Points

### Agency Toolkit Dashboard
- **URL:** `http://localhost:3000/agency-toolkit`
- **Features:** "Create New Client" button links to intake form
- **Monitoring:** Real-time system health and metrics

### Client Settings
- **URL:** `http://localhost:3000/dashboard/settings`
- **Configuration:** Booking, email, branding, modules

### Template Configuration
- **URL:** `http://localhost:3000/dashboard/modules`
- **Features:** Universal consultation template management

## Validation

Both workflows use the same validation schema:

```typescript
interface ClientConfig {
  clientName: string;
  industry: string;
  companySize: string;
  primaryChallenges: string;
  primaryGoals: string;
  budgetRange: string;
  timeline: string;
  preset: 'universal-consultation';
  tier: 'advanced';
}
```

## Benefits

- **Unified Experience**: Same data collection regardless of method
- **Consistency**: Identical results from both workflows
- **Flexibility**: Choose CLI for automation or web form for ease of use
- **Comprehensive**: Single template handles all industries and business sizes
- **Automated**: Web form automatically executes CLI commands
