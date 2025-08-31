# Micro App Template (Minimal)

A modern, production-ready micro web application template built with Next.js 14, TypeScript, and Supabase.

## Features

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: Supabase with PostgreSQL
- **Authentication**: Built-in auth system
- **AI Integration**: OpenAI integration ready
- **Auto-save**: Intelligent form auto-save and recovery
- **Design System**: Comprehensive UI component library
- **Testing**: Jest and Playwright testing setup
- **Security**: Guardian system for route protection
- **Development Tools**: Comprehensive dev tooling

## Quick Start

```bash
npm install
npm run dev
```

## Documentation

See `/docs/` for comprehensive documentation. Key handover docs:

- `docs/handover/HANDOVER_SOP.md` — operations runbook and recovery
- `docs/handover/QUICKSTART.md` — new‑engineer setup and first checks
- `docs/handover/LOOM_SCRIPT.md` — script for the recorded walkthrough

Quick access in dev:

- Diagnostics UI: `http://localhost:3000/operability/diagnostics`
- Flags UI: `http://localhost:3000/operability/flags`
- Diagnostics API: `http://localhost:3000/api/admin/diagnostics?mode=summary`
- Weekly Recap API: `http://localhost:3000/api/weekly-recap` (requires `x-cron-secret`)

## License

Private template for client micro applications.
