# Loom Recording Script (8–10 minutes)

Goal: Provide a concise, confident walkthrough for handoff.

## 0) Intro (0:30)
- Who this is for (operators, engineers, stakeholders)
- What you’ll see (diagnostics, flags, jobs, local → prod)

## 1) Repo & Local Setup (1:30)
- Show `README.md` and `docs/handover/QUICKSTART.md`
- Demo `npm install` and `npm run dev`
- Open http://localhost:3000

## 2) Diagnostics & Safety (2:00)
- Visit `/operability/diagnostics`
- Switch Summary → Detailed; explain status indicators
- Mention `docs/GUARDIAN_README.md` and route protections

## 3) Feature Flags & Tiers (1:00)
- Visit `/operability/flags`
- Show toggling a safe, non‑destructive flag

## 4) Background Job: Weekly Recap (1:30)
- Explain `CRON_SECRET` and server‑only configuration
- Show cURL: `POST /api/weekly-recap` with `x-cron-secret`
- Note logs/telemetry and Pro+ tier behavior

## 5) Environments & Deploy (1:00)
- Local → Staging → Production flow (Vercel recommended)
- Show where env vars live (Vercel dashboard)

## 6) Incident & Recovery (1:00)
- Open `docs/handover/HANDOVER_SOP.md`
- Walk through Daily/Weekly checks, incident steps, recovery

## 7) Outro (0:30)
- Recap primary links and next steps
- Where to ask for help (owner/on‑call)

