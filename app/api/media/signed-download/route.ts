import { NextResponse } from "next/server";
import { mediaPathSchema } from "@/lib/validation";
import { requireUser } from "@/lib/auth/guard";
import { ok, fail } from "@/lib/errors";
import { withSentry } from "@/lib/sentry-wrapper";
import { SecureFileDownload } from '@/lib/security/file-download';

export const runtime = 'nodejs';
export const revalidate = 60;

async function GETHandler(req: Request): Promise<NextResponse> {
  try {
    const { user, supabase } = await requireUser();

    const { searchParams } = new URL(req.url);
    const path = mediaPathSchema.parse(searchParams.get("path"));

    // Additional security validation
    if (!SecureFileDownload.validateFilePath(path)) {
      return NextResponse.json(fail("Invalid file path", "VALIDATION_ERROR"), { status: 400 });
    }

    // validate ownership via client id inside path
    const parts = path.split("/");
    const client_id = parts[1]; // client/<client_id>/...
    
    // Additional path validation
    if (parts.length < 3 || parts[0] !== 'client') {
      return NextResponse.json(fail("Invalid path structure", "VALIDATION_ERROR"), { status: 400 });
    }
    
    const { data: okClient, error: cErr } = await (await supabase).from("clients").select("id").eq("id", client_id).eq("coach_id", user.id).single();
    if (cErr || !okClient) return NextResponse.json(fail("forbidden", "FORBIDDEN"), { status: 403 });

    const { data, error } = await (await supabase).storage.from("media").createSignedUrl(path, 60); // 60s
    if (error) return NextResponse.json(fail(error.message, "STORAGE_ERROR"), { status: 500 });

    return NextResponse.json(ok({ url: data.signedUrl }));
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(fail(error.message, "VALIDATION_ERROR"), { status: 400 });
    }
    return NextResponse.json(fail("Internal server error", "INTERNAL_ERROR"), { status: 500 });
  }
}

export const GET = withSentry(GETHandler);
