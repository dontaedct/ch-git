import { NextRequest, NextResponse } from "next/server";
import type { Fail } from "@/lib/errors";

type RouteHandler = (req: NextRequest) => Promise<Response | NextResponse | Fail>;

export function withSentry(handler: RouteHandler) {
  return async (request: NextRequest) => {
    const out = await handler(request);

    // Normalize Web Response -> NextResponse
    if (out instanceof Response && !(out instanceof NextResponse)) {
      const body = await out.text();
      return new NextResponse(body, { status: out.status, headers: out.headers });
    }
    return out as NextResponse | Fail;
  };
}
