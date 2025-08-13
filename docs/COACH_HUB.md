Overview - Coach Hub

A multi-tenant, web-based platform for fitness trainers to manage clients, deliver training plans, track progress, and communicate—all from a single streamlined app.

⸻

Core Purpose

Another Level — Coach Hub is a private, mobile-friendly web app that enables each trainer (coach) to run their own "mini app" for their clients. It combines session scheduling, client management, AI-assisted weekly training plan creation, progress tracking, and secure media sharing. The platform is designed to work entirely online with minimal complexity, leveraging Next.js 14, Supabase (Auth, DB, Storage, RLS), Resend (email), Stripe Payment Links (optional payments), and Vercel (hosting + cron jobs).

The system is multi-tenant by design: each trainer's data, clients, and media are completely isolated via Supabase Row Level Security (RLS).

⸻

Key Features

1. Trainer & Client Profiles

• Trainer Profile
• Name, photo, bio, specialties.
• Default units (kg/lb), timezone.
• Client Profile
• Name, email, DOB (optional), height, weight (optional).
• Goals, injuries/notes, consent timestamp.
• Linked to a specific coach (coach_id).

⸻

2. Group Sessions (/sessions route)

• Authenticated coach-only interface.
• Create & manage group or private sessions:
• Fields: title, type (group/private), location, date/time, capacity, optional price, optional Stripe Payment Link.
• View upcoming sessions in a table/list with actions:
• Invite Clients → searchable multi-select, optional message, sends via Resend.
• View RSVPs → manage invite status (invited, confirmed, cancelled), mark paid, mark attended, add notes.
• Export CSV → attendance data for external use.
• Links attendance to client progress (completed sessions).

⸻

3. Client Intake (/intake route)

• Public form for new clients:
• Name, email, sport, position/event, parent email (optional), goals, consent checkbox.
• On submit:
• Insert client record via server action using Supabase service role.
• Send welcome email via Resend.
• Scope data to default coach for that intake link.

⸻

4. Weekly Plans & Check-ins

• Plan Structure
• A weekly plan consists of 3–8 blocks (e.g., "Lower Body A", "Conditioning 20m") with detailed steps.
• Can be created manually, from templates, or AI-assisted.
• AI-Assisted Drafting
• Coach clicks "Draft with AI" → server generates JSON plan & motivational summary.
• Inputs: goals, equipment, session count, time budget, injuries, last week's adherence & soreness.
• Coach reviews, edits, and approves before sending.
• Delivery
• Weekly email (and optional SMS) with plan details + "View Plan" portal link.
• ICS calendar attachment for scheduled sessions.
• Client Check-ins
• Quick sliders: energy, soreness, RPE.
• Adherence %, optional bodyweight, free-text notes.
• Auto-calculates compliance from plan vs completed.
• Automation
• Weekly CRON to pre-draft plans for clients missing a plan for next week.
• Optionally auto-approve and send.

⸻

5. Progress Tracking

• Simple, visual metrics:
• Compliance donut (7-day & 28-day).
• Bodyweight sparkline & weekly delta.
• Sessions completed vs scheduled.
• Streak badges for consistency.
• Goal checkboxes (max 3 active goals).
• All widgets lightweight & focused to prevent overwhelm.

⸻

6. Secure Media Sharing

• Private Supabase Storage bucket (media).
• Signed upload & download URLs—no public access.
• Files organized per client with metadata in media table.
• Per-client monthly storage cap (e.g., 500MB) to control costs.

⸻

7. Transactional Email System

• Powered by Resend with verified sending domain.
• Templates:
• Session invite.
• Weekly plan ready.
• Please check in.
• Welcome email.
• Weekly recap.
• All emails are transactional only—no marketing without opt-in (PIPEDA & CASL compliant).

⸻

8. Payments (Optional)

• Stripe Payment Links:
• Added to sessions for paid bookings.
• Stripe handles checkout; no PCI compliance required.
• Link stored as text in DB.

⸻

9. Automation & Recaps

• Weekly CRON job (Vercel):
• Emails clients summaries of their week's attendance & progress.
• Generates coach digest (who's slipping, who's excelling).
• Coach-level settings for automation:
• Auto-approve AI plans.
• Auto-remind clients to check in.

⸻

10. Security & Compliance

• RLS enforced everywhere: coach_id = auth.uid() for all reads/writes.
• Service role key only used server-side for public intake.
• Signed URL file access only after ownership validation.
• Data retention & deletion requests honored.
• Email compliance: transactional, with opt-in required for promos, unsubscribe link, physical address in footer.

⸻

Technical Architecture

• Frontend: Next.js 14 (App Router, TypeScript), modular components, mobile-first.
• Backend: Supabase (Postgres + RLS), server actions in Next.js, strict zod validation, Sentry for error tracking.
• Storage: Supabase private bucket, signed URLs.
• Email: Resend transactional only.
• Payments: Stripe Payment Links.
• Hosting & Automation: Vercel + Vercel Cron.
