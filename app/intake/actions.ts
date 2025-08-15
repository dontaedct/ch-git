"use server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { intakeSchema, intakeFormSchema } from "@/lib/validation";
import { sendConfirmationEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/validation";
import { splitName } from "@/lib/utils/splitName";
import type { CreateClientIntakeParams } from "@/lib/supabase/rpc-types";

type Result = Promise<{ ok: true } | { ok: false; error: string }>;

/**
 * Atomic intake function that executes all database operations in a single transaction
 */
export async function createClientIntake(formData: FormData): Result {
  try {
    const body = Object.fromEntries(formData.entries());
    
    // Parse form data with Zod schema
    const parsedForm = intakeFormSchema.parse(body);
    const parsed = intakeSchema.parse(body);

    const supabase = await createServiceRoleSupabase();

    // Normalize phone number
    let normalizedPhone: string | null = null;
    if (parsedForm.phone) {
      try {
        normalizedPhone = normalizePhone(parsedForm.phone);
      } catch {
        return { ok: false, error: "Invalid phone number format" };
      }
    }

    // Execute all database operations atomically
    const params: CreateClientIntakeParams = {
      p_coach_id: "default-coach-id", // TODO: Get from environment or config
      p_email: parsed.email,
      p_first_name: splitName(parsed.full_name).first_name,
      p_last_name: splitName(parsed.full_name).last_name ?? "", // Provide safe default
      p_phone: normalizedPhone
    };
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: transactionError } = await (supabase as any).rpc('create_client_intake', params);

    if (transactionError) {
      throw transactionError;
    }

    // Send welcome transactional email (non-critical, can fail without rolling back DB)
    try {
      await sendConfirmationEmail({ 
        to: parsed.email, 
        session: { title: "Welcome", starts_at: new Date().toISOString() } 
      });
    } catch {
      console.warn('Failed to send welcome email');
      // Don't fail the entire operation if email fails
    }

    return { ok: true };
  } catch {
    const errorMessage = 'Unknown error occurred';
    return { ok: false, error: errorMessage ?? "intake failed" };
  }
}
