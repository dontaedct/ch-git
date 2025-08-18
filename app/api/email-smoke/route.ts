import { sendWelcomeEmail } from "@/lib/email";

export async function GET(req: Request) {
  const to = new URL(req.url).searchParams.get("to") ?? "you@example.com";
  const r = await sendWelcomeEmail({ to, coachName: "Coach Demo" });
  return Response.json(r);
}
