export const runtime = "nodejs";
import { readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if ((url.searchParams.get("secret") || "") !== (process.env.CRON_SECRET || "")) {
    return Response.json({ ok:false }, { status: 403 });
  }
  const cwd = process.cwd();
  const hasEnvLocal = existsSync(join(cwd, ".env.local"));
  const files = readdirSync(cwd).slice(0, 50);
  return Response.json({
    ok: true,
    cwd, hasEnvLocal, files,
    env: { cron: !!process.env.CRON_SECRET }
  });
}
