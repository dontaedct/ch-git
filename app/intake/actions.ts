"use server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { intakeFormSchema } from "@/lib/validation";
import { sendConfirmationEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/validation";
import { splitName } from "@/lib/utils/splitName";
import { logAuditEvent, recordConsent } from "@/lib/audit";
import type { CreateClientIntakeParams } from "@/lib/supabase/rpc-types";

type Result = Promise<{ ok: true } | { ok: false; error: string }>;

/**
 * Atomic intake function that executes all database operations in a single transaction
 */
export async function createClientIntake(formData: FormData): Result {
  try {
    const body = Object.fromEntries(formData.entries());
    
    // Parse form data with Zod schema
    const parsed = intakeFormSchema.parse(body);

    const supabase = createServiceRoleSupabase();

    // Normalize phone number
    let normalizedPhone: string | null = null;
    if (parsed.phone) {
      try {
        normalizedPhone = normalizePhone(parsed.phone);
      } catch {
        return { ok: false, error: "Invalid phone number format" };
      }
    }

    // Execute all database operations atomically
    const params: CreateClientIntakeParams = {
      p_coach_id: "system-intake", // Default coach ID for system intake
      p_email: parsed.email,
      p_first_name: splitName(parsed.full_name).first_name,
      p_last_name: splitName(parsed.full_name).last_name ?? "",
      p_phone: normalizedPhone
    };
    
    const { error: transactionError } = await supabase.rpc('create_client_intake', params);

    if (transactionError) {
      throw transactionError;
    }

    // Log audit event for intake creation
    await logAuditEvent("system-intake", {
      action: "client_intake_created",
      resourceType: "client",
      details: {
        email: parsed.email,
        hasPhone: !!normalizedPhone,
        consentGiven: parsed.consent
      },
      consentGiven: parsed.consent,
      consentType: "marketing",
      consentVersion: "1.0"
    });

    // Record consent if given
    if (parsed.consent) {
      await recordConsent("system-intake", {
        consentType: "marketing",
        consentVersion: "1.0",
        consentGiven: true,
        consentText: "I agree to be contacted about my coaching sessions and related information."
      });
    }

    // Send welcome transactional email (non-critical, can fail without rolling back DB)
    try {
      await sendConfirmationEmail({ 
        to: parsed.email, 
        session: { title: "Welcome", starts_at: new Date().toISOString() } 
      });
    } catch (_emailError) {
      console.warn('Failed to send welcome email:', _emailError);
      // Don't fail the entire operation if email fails
    }

    return { ok: true };
  } catch (_e: unknown) {
    const errorMessage = _e instanceof Error ? _e.message : 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "intake failed" };
  }
}
