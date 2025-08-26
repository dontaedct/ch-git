# Repository Tree (2 Levels)

Generated: 2025-08-25

```
my-app/
├── app/                          # Next.js app directory
│   ├── _debug/                   # Debug components
│   ├── adapters/                 # Route adapters
│   ├── ai/                       # AI components
│   ├── api/                      # API routes
│   ├── auto-save-demo/           # Auto-save demo
│   ├── client-portal/            # Client portal pages
│   ├── clients/                  # Client management
│   ├── debug/                    # Debug utilities
│   ├── design-system/            # Design system components
│   ├── error.tsx                 # Error boundary
│   ├── favicon.ico               # Site favicon
│   ├── global-error.tsx          # Global error boundary
│   ├── globals.tailwind.css      # Global styles
│   ├── guardian-demo/            # Guardian demo
│   ├── intake/                   # Intake forms
│   ├── layout.tsx                # Root layout
│   ├── login/                    # Authentication
│   ├── page.tsx                  # Home page
│   ├── probe/                    # Health probes
│   ├── progress/                 # Progress tracking
│   ├── sessions/                 # Session management
│   ├── status/                   # Status pages
│   ├── test/                     # Test pages
│   ├── test-probe/               # Test probes
│   ├── test-simple/              # Simple tests
│   ├── trainer-profile/          # Trainer profiles
│   └── weekly-plans/             # Weekly planning
├── artifacts/                    # Build artifacts
│   └── ai-evals/                 # AI evaluation results
├── attic/                        # Archived files
│   └── removed/                  # Removed components
├── components/                   # React components
│   ├── auto-save-recovery.tsx    # Auto-save recovery
│   ├── auto-save-status.tsx      # Auto-save status
│   ├── empty-states.tsx          # Empty state components
│   ├── guardian-dashboard.tsx    # Guardian dashboard
│   ├── header.tsx                # Site header
│   ├── intake-form.tsx           # Intake forms
│   ├── invite-panel.tsx          # Invite panels
│   ├── progress-dashboard.tsx    # Progress dashboard
│   ├── ProtectedNav.tsx          # Protected navigation
│   ├── PublicNav.tsx             # Public navigation
│   ├── rsvp-panel.tsx            # RSVP panels
│   ├── session-form.tsx          # Session forms
│   ├── session-list.tsx          # Session lists
│   ├── theme-provider.tsx        # Theme provider
│   └── ui/                       # UI component library
├── data/                         # Data layer
│   ├── checkins.repo.ts          # Checkins repository
│   ├── clients.repo.ts           # Clients repository
│   ├── clients.ts                # Client types
│   ├── progress-metrics.repo.ts  # Progress metrics
│   ├── sessions.ts               # Session types
│   └── weekly-plans.repo.ts      # Weekly plans repository
├── design/                       # Design system
│   ├── budgets/                  # Performance budgets
│   ├── policies/                 # Design policies
│   ├── scripts/                  # Design scripts
│   └── templates/                # Design templates
├── docs/                         # Documentation
│   ├── historical/               # Historical docs
│   ├── inventories/              # Repository inventories
│   ├── reports/                  # Analysis reports
│   ├── hardening/                # Hardening documentation
│   └── snippets/                 # Code snippets
├── hooks/                        # React hooks
│   ├── use-auto-save.ts          # Auto-save hook
│   ├── use-mobile.ts             # Mobile detection
│   └── use-toast.ts              # Toast notifications
├── lib/                          # Utility libraries
│   ├── ai/                       # AI utilities
│   ├── auth/                     # Authentication
│   ├── auto-save/                # Auto-save system
│   ├── compat/                   # Compatibility layer
│   ├── guardian/                 # Guardian system
│   ├── registry/                 # Component registry
│   ├── supabase/                 # Supabase integration
│   └── validation/               # Validation utilities
├── logs/                         # Application logs
├── packages/                     # Monorepo packages
│   └── mit-hero-core/            # Core package (legacy)
├── reports/                      # Analysis reports
├── scripts/                      # Build and utility scripts
├── supabase/                     # Database configuration
│   ├── migrations/               # Database migrations
│   └── notes.md                  # Migration notes
├── styles/                       # Global styles
│   └── globals.css               # Global CSS
├── tests/                        # Test files
├── types/                        # TypeScript type definitions
├── var/                          # Variable storage
├── .github/                      # GitHub configuration
├── .vercel/                      # Vercel configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── next.config.ts                # Next.js configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── middleware.ts                 # Next.js middleware
├── vercel.json                   # Vercel deployment config
└── README.md                     # Project documentation
```

## Key Observations

- **App Router Structure**: Uses Next.js 15 App Router with organized feature directories
- **Component Architecture**: Separated UI components, business logic, and data layers
- **Design System**: Comprehensive design system with policies and templates
- **Testing**: Jest and Playwright test setup with visual regression testing
- **Database**: Supabase integration with migration management
- **AI Integration**: Dedicated AI utilities and evaluation systems
- **Legacy Code**: Some MIT Hero references in packages/ (to be cleaned up)
