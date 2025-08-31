export const runtime = "nodejs";

import { runWeeklyDigest } from "@/lib/jobs/weekly-digest";
import { Logger } from "@/lib/logger";

export async function GET(req: Request) {
  const startedAt = Date.now();
  const url = new URL(req.url);
  const op = Logger.operation("weekly-recap");

  const exp = process.env.CRON_SECRET ?? "";
  if (!exp) {
    op.warn("Missing CRON_SECRET for weekly recap endpoint");
    return Response.json({ ok: false, code: "NO_SECRET_SET" }, { status: 500 });
  }

  const ok = url.searchParams.get("secret") === exp;
  if (!ok) {
    op.warn("Forbidden weekly recap request: bad secret");
    return Response.json({ ok: false, code: "FORBIDDEN" }, { status: 403 });
  }

  // If query contains ping=1, only verify reachability
  if (url.searchParams.get("ping") === "1") {
    return Response.json({ ok: true, message: "cron reachable" });
  }

  try {
    const dryRun = url.searchParams.get("dryRun") === "1";
    const result = await runWeeklyDigest({ dryRun });
    const status = result.ok ? 200 : 500;
    op.log("Weekly recap completed", {
      durationMs: Date.now() - startedAt,
      ok: result.ok,
      sent: result.meta?.sentCount ?? 0,
      skipped: result.meta?.skippedReason,
    });
    return Response.json(result, { status });
  } catch (error: any) {
    op.error("Weekly recap failed", { error: error?.message || String(error) });
    return Response.json({ ok: false, code: "UNEXPECTED_ERROR", message: error?.message || "unexpected error" }, { status: 500 });
  }
}
