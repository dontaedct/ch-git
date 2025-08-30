import { NextResponse } from "next/server";
import { withSentry } from "@/lib/sentry-wrapper";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { confirmUploadSchema } from "@/lib/validation";
import { logAuditEvent } from "@/lib/audit";

export const runtime = 'nodejs';

async function POSTHandler(req: Request): Promise<NextResponse> {
  try {
    const { user, supabase } = await requireUser();
    const body = await req.json();
    const parsed = confirmUploadSchema.parse(body);

    // Validate the client ownership (email belongs to client or coach relationship)
    const { data: client, error: clientErr } = await (await supabase)
      .from('clients')
      .select('id, coach_id')
      .eq('id', parsed.client_id)
      .single();

    if (clientErr || !client) {
      return NextResponse.json(fail("Client not found", "NOT_FOUND"), { status: 404 });
    }

    // Enforce that the authenticated user is the coach for this client (aligns with other media routes)
    if (client.coach_id !== user.id) {
      return NextResponse.json(fail("forbidden", "FORBIDDEN"), { status: 403 });
    }

    // Insert media row
    const { error: insertErr } = await (await supabase)
      .from('media')
      .insert({
        client_id: parsed.client_id,
        path: parsed.path,
        filename: parsed.filename,
        mime_type: parsed.mime_type,
        size_bytes: parsed.size_bytes,
      });

    if (insertErr) {
      return NextResponse.json(fail(insertErr.message, "DATABASE_ERROR"), { status: 500 });
    }

    // Audit log (best-effort)
    try {
      await logAuditEvent(
        user.id,
        {
          action: 'media_uploaded',
          resourceType: 'media',
          resourceId: parsed.client_id,
          details: {
            filename: parsed.filename,
            mime_type: parsed.mime_type,
            size_bytes: parsed.size_bytes,
            path: parsed.path,
          },
        }
      );
    } catch {}

    return NextResponse.json(ok({ success: true }));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(fail(error.message, "VALIDATION_ERROR"), { status: 400 });
    }
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

export const POST = withSentry(POSTHandler);
