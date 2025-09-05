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

## Homepage Guidelines

The homepage follows Linear/Vercel design principles with strict architectural boundaries:

### ✅ **DO's**
- **Use CSS Variables**: All design tokens via CSS variables in `app/globals.css`
- **Direct Imports**: Use direct file imports instead of barrel imports (`@/components/ui/button` not `@/components`)
- **Server Components**: Keep homepage sections as server components when possible
- **Accessibility First**: Include proper ARIA labels, skip links, and keyboard navigation
- **Performance**: Use `next/image` for images, optimize animations with `willChange`
- **Responsive Design**: Test on mobile (375px), tablet (768px), and desktop (1280px+)
- **Theme Support**: Ensure proper light/dark mode compatibility

### ❌ **DON'Ts**
- **No Barrel Imports**: Avoid `@/components` barrel imports in homepage code
- **No Runtime Token Providers**: Don't use `ClientTokensProvider` or runtime token logic
- **No Server-Only Code**: Never import `fs`, `path`, `winston`, `@opentelemetry` in client components
- **No Heavy Assets**: Keep hero art under 200KB, use optimized SVGs
- **No Layout Shift**: Use `minHeight` and `aspectRatio` to prevent CLS
- **No Unoptimized Animations**: Always respect `prefers-reduced-motion`

### 🧪 **Testing**
- **Snapshot Tests**: `tests/components/homepage-sections.test.tsx` captures structure
- **Visual Regression**: `tests/playwright/homepage-visual.spec.ts` captures appearance
- **Accessibility**: All sections have proper ARIA labels and keyboard navigation

### 📁 **File Structure**
```
app/page.tsx                    # Main homepage component
components/ui/container.tsx     # Layout container
components/ui/grid.tsx          # Grid system
components/ui/surface.tsx       # Surface components
components/ui/button.tsx        # Button variants
styles/globals.css              # CSS variables and tokens
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
