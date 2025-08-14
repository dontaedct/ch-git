/**
 * Compile-safe email utilities.
 * Replace with your real email provider (Resend/Nodemailer/etc.) later.
 */

export type EmailResult =
  | { ok: true; id: string }
  | { ok: false; code: string; message: string };

export interface EmailPayload {
  to?: string;
  subject?: string;
  html?: string;
  text?: string;
  // Allow extra provider-specific fields without breaking types:
  [key: string]: unknown;
}

/**
 * Send an email. Stubbed to always succeed for now.
 * Return shape matches EmailResult used elsewhere in the app.
 */
export async function sendEmail(_payload?: EmailPayload): Promise<EmailResult> {
  // TODO: integrate real email provider and return real message id.
  return { ok: true, id: "" };
}

// Missing email functions that are imported elsewhere
export async function sendWelcomeEmail(_payload?: EmailPayload): Promise<EmailResult> {
  return { ok: true, id: "" };
}

export async function sendConfirmationEmail(_payload?: EmailPayload): Promise<EmailResult> {
  return { ok: true, id: "" };
}

// Common alias some codebases use
export const send = sendEmail;

export default sendEmail;
