import * as Sentry from "@sentry/nextjs";
import { toHttpResponse } from "./errors";
import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<unknown> }
) => Promise<NextResponse>;

export function withSentry(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: { params: Promise<unknown> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Capture error in Sentry if available
      if (process.env.SENTRY_DSN) {
        // Add request context to Sentry
        Sentry.captureException(error);
      }
      
      // Return NextResponse using existing error handling
      if (error instanceof Error) {
        const httpResponse = toHttpResponse({ ok: false, code: "INTERNAL_ERROR", message: error.message });
        return NextResponse.json(httpResponse.body, { status: httpResponse.status });
      }
      return NextResponse.json({ ok: false, code: "INTERNAL_ERROR", message: "Unknown error" }, { status: 500 });
    }
  };
}
