"use server";
import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { intakeFormSchema } from "@/lib/validation";
import { sendConfirmationEmail } from "@/lib/email";
import { normalizePhone } from "@/lib/validation";
import { splitName } from "@/lib/utils/splitName";
import { logAuditEvent, recordConsent } from "@/lib/audit";
// Removed CreateClientIntakeParams import - no longer using RPC function
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

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

    // Create client directly in clients_enhanced table
    const { data: clientData, error: insertError } = await supabase
      .from('clients_enhanced')
      .insert([{
        name: parsed.full_name,
        email: parsed.email,
        phone: normalizedPhone,
        company_name: parsed.company_name || null,
        industry: parsed.industry || null,
        business_size: parsed.company_size || null,
        budget_range: parsed.budget_range || null,
        timeline_requirements: parsed.timeline || null,
        status: 'active',
        tier: 'basic',
        acquisition_source: 'intake_form',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating client:', insertError);
      throw new Error(`Failed to create client: ${insertError.message}`);
    }

    console.log('✅ Client created successfully:', clientData);

    // Automatically execute DCT CLI with the collected data (only if all fields are present)
    if (parsed.company_name && parsed.industry && parsed.company_size && parsed.primary_challenges && parsed.primary_goals && parsed.budget_range && parsed.timeline) {
      try {
        const cliCommand = `node bin/dct.js --ci --name "${parsed.company_name}" --industry ${parsed.industry} --size ${parsed.company_size} --challenges ${parsed.primary_challenges} --goals ${parsed.primary_goals} --budget ${parsed.budget_range} --timeline ${parsed.timeline}`;
        
        console.log('🚀 Executing DCT CLI with command:', cliCommand);
        const { stdout, stderr } = await execAsync(cliCommand);
        
        if (stderr) {
          console.warn('DCT CLI stderr:', stderr);
        }
        
        console.log('✅ DCT CLI executed successfully:', stdout);
      } catch (cliError) {
        console.error('❌ DCT CLI execution failed:', cliError);
        // Don't fail the entire operation if CLI fails, just log it
      }
    } else {
      console.log('ℹ️ Skipping DCT CLI execution - not all fields present');
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
