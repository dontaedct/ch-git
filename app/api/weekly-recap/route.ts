export const runtime = "nodejs";
export async function GET(req: Request) {
  const url = new URL(req.url);
  const exp = process.env.CRON_SECRET ?? "";
  if (!exp) return Response.json({ ok:false, code:"NO_SECRET_SET" }, { status: 500 });
  const ok = url.searchParams.get("secret") === exp;
  if (!ok) return Response.json({ ok:false, code:"FORBIDDEN" }, { status: 403 });
  return Response.json({ ok:true, message:"cron reachable" });
}
