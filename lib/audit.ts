/**
 * Audit logging utilities for privacy and consent tracking
 * Task 18: Privacy/consent + audit log
 */

import { createServiceRoleSupabase } from "@/lib/supabase/server";
import { headers } from "next/headers";
import type { AuditLogInsert, ConsentRecordInsert } from "@/lib/supabase/types";

export interface AuditEvent {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  consentGiven?: boolean;
  consentType?: string;
  consentVersion?: string;
}

export interface ConsentEvent {
  consentType: string;
  consentVersion: string;
  consentGiven: boolean;
  consentText: string;
}

/**
 * Get client IP address and user agent from request headers
 */
async function getClientInfo() {
  try {
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const realIp = headersList.get("x-real-ip");
    const userAgent = headersList.get("user-agent");
    
    const ipAddress = forwarded?.split(",")[0] || realIp || null;
    
    return {
      ipAddress,
      userAgent: userAgent || null,
    };
  } catch {
    return {
      ipAddress: null,
      userAgent: null,
    };
  }
}

/**
 * Log an audit event to the database
 */
export async function logAuditEvent(
  coachId: string,
  event: AuditEvent,
  userId?: string
): Promise<string> {
  const supabase = createServiceRoleSupabase();
  const { ipAddress, userAgent } = await getClientInfo();

  const { data, error } = await supabase.rpc("log_audit_event", {
    p_user_id: userId || null,
    p_coach_id: coachId,
    p_action: event.action,
    p_resource_type: event.resourceType,
    p_resource_id: event.resourceId || null,
    p_details: event.details || null,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
    p_consent_given: event.consentGiven || false,
    p_consent_type: event.consentType || null,
    p_consent_version: event.consentVersion || null,
  });

  if (error) {
    console.error("Failed to log audit event:", error);
    throw new Error(`Audit logging failed: ${error.message}`);
  }

  return data;
}

/**
 * Record a consent event
 */
export async function recordConsent(
  coachId: string,
  event: ConsentEvent,
  userId?: string
): Promise<string> {
  const supabase = createServiceRoleSupabase();
  const { ipAddress, userAgent } = await getClientInfo();

  const { data, error } = await supabase.rpc("record_consent", {
    p_user_id: userId || null,
    p_coach_id: coachId,
    p_consent_type: event.consentType,
    p_consent_version: event.consentVersion,
    p_consent_given: event.consentGiven,
    p_consent_text: event.consentText,
    p_ip_address: ipAddress,
    p_user_agent: userAgent,
  });

  if (error) {
    console.error("Failed to record consent:", error);
    throw new Error(`Consent recording failed: ${error.message}`);
  }

  return data;
}

/**
 * Update client consent fields
 */
export async function updateClientConsent(
  clientId: string,
  consentType: "marketing" | "privacy",
  consentGiven: boolean,
  consentVersion: string
): Promise<void> {
  const supabase = createServiceRoleSupabase();
  
  const updateData: Record<string, unknown> = {
    consent_version: consentVersion,
  };

  if (consentType === "marketing") {
    updateData.marketing_consent = consentGiven;
    updateData.marketing_consent_date = consentGiven ? new Date().toISOString() : null;
  } else if (consentType === "privacy") {
    updateData.privacy_consent = consentGiven;
    updateData.privacy_consent_date = consentGiven ? new Date().toISOString() : null;
  }

  const { error } = await supabase
    .from("clients")
    .update(updateData)
    .eq("id", clientId);

  if (error) {
    console.error("Failed to update client consent:", error);
    throw new Error(`Client consent update failed: ${error.message}`);
  }
}

/**
 * Get consent history for a user
 */
export async function getConsentHistory(
  userId: string,
  coachId: string
): Promise<ConsentRecordInsert[]> {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("consent_records")
    .select("*")
    .eq("user_id", userId)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to get consent history:", error);
    throw new Error(`Consent history retrieval failed: ${error.message}`);
  }

  return data || [];
}

/**
 * Get audit log for a user
 */
export async function getAuditLog(
  userId: string,
  coachId: string,
  limit = 50
): Promise<AuditLogInsert[]> {
  const supabase = createServiceRoleSupabase();

  const { data, error } = await supabase
    .from("audit_log")
    .select("*")
    .eq("user_id", userId)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Failed to get audit log:", error);
    throw new Error(`Audit log retrieval failed: ${error.message}`);
  }

  return data || [];
}
