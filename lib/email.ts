import { Resend } from "resend";
import type { SessionLite } from "@/types/email";

type Ok = { ok: true; id?: string; skipped?: true };
type Fail = { ok: false; code: string; message: string };
export type EmailResult = Ok | Fail;

const KEY = process.env.RESEND_API_KEY || "";
const FROM = process.env.RESEND_FROM || "Coach Hub <no-reply@example.com>";
const resend = KEY ? new Resend(KEY) : null;

function htmlWrap(inner: string) {
  return `<!doctype html><meta charset="utf-8" />
  <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;padding:16px">
    ${inner}
    <hr style="margin-top:16px;border:none;border-top:1px solid #eee"/>
    <p style="color:#666;font-size:12px">This is a transactional message from Another Level — Coach Hub.</p>
  </div>`;
}

async function actuallySend(to: string, subject: string, html: string): Promise<EmailResult> {
  if (!resend) return { ok: true, skipped: true }; // safe in dev without keys
  try {
    const r = await resend.emails.send({ from: FROM, to, subject, html });
    if ((r as any)?.error) return { ok: false, code: "RESEND_ERROR", message: String((r as any).error) };
    return { ok: true, id: (r as any)?.id };
  } catch (e: any) {
    return { ok: false, code: "SEND_FAILED", message: e?.message || "send failed" };
  }
}

/** Low-level helper you can call directly */
export async function sendEmail(args: { to: string; subject: string; html: string }): Promise<EmailResult> {
  return actuallySend(args.to, args.subject, htmlWrap(args.html));
}

/** Session invite with optional Stripe link */
export async function sendInviteEmail(args: { to: string; session: SessionLite; stripe_link?: string }): Promise<EmailResult> {
  const when = new Date(args.session.starts_at).toLocaleString();
  const body = `
    <h2>You're invited: ${args.session.title}</h2>
    <p><strong>When:</strong> ${when}</p>
    ${args.session.location ? `<p><strong>Where:</strong> ${args.session.location}</p>` : ""}
    ${args.stripe_link ? `<p><a href="${args.stripe_link}">Pay to reserve your spot</a></p>` : ""}
  `;
  return actuallySend(args.to, `You're invited: ${args.session.title}`, htmlWrap(body));
}

/** Confirmation after a client RSVPs or is added */
export async function sendConfirmationEmail(args: { to: string; session: SessionLite }): Promise<EmailResult> {
  const when = new Date(args.session.starts_at).toLocaleString();
  const body = `
    <h2>Confirmed: ${args.session.title}</h2>
    <p><strong>When:</strong> ${when}</p>
    ${args.session.location ? `<p><strong>Where:</strong> ${args.session.location}</p>` : ""}
  `;
  return actuallySend(args.to, `Confirmed: ${args.session.title}`, htmlWrap(body));
}

/** Welcome email for intake flow */
export async function sendWelcomeEmail(args: { to: string; coachName?: string }): Promise<EmailResult> {
  const body = `
    <h2>Welcome to Another Level — Coach Hub</h2>
    <p>${args.coachName ? `${args.coachName} ` : ""}will follow up with your next steps shortly.</p>
  `;
  return actuallySend(args.to, "Welcome to Another Level", htmlWrap(body));
}

/** Weekly digest sent to clients (summary text provided by server) */
export async function sendWeeklyRecap(args: { to: string; summaryHtml: string }): Promise<EmailResult> {
  const body = `<h2>Your weekly recap</h2>${args.summaryHtml}`;
  return actuallySend(args.to, "Your weekly recap", htmlWrap(body));
}

/** Plan ready notice */
export async function sendPlanReadyEmail(args: { to: string; weekStartISO: string; viewUrl?: string }): Promise<EmailResult> {
  const body = `
    <h2>Your plan is ready</h2>
    <p>Week starting ${new Date(args.weekStartISO).toLocaleDateString()}.</p>
    ${args.viewUrl ? `<p><a href="${args.viewUrl}">View your plan</a></p>` : ""}
  `;
  return actuallySend(args.to, "Your plan is ready", htmlWrap(body));
}

/** Check-in reminder */
export async function sendCheckInReminderEmail(args: { to: string; link?: string }): Promise<EmailResult> {
  const body = `
    <h2>Quick check-in</h2>
    <p>How did this week go? ${args.link ? `<a href="${args.link}">Submit check-in</a>` : ""}</p>
  `;
  return actuallySend(args.to, "Please check in", htmlWrap(body));
}
