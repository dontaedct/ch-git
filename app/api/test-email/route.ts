import { sendEmail } from "@/lib/email";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const to = searchParams.get("to") ?? "you@example.com";
  
  const result = await sendEmail({
    to,
    subject: "Coach Hub test",
    html: "<p>It works.</p>"
  });
  
  return Response.json(result);
}
