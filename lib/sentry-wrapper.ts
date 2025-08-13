import * as Sentry from "@sentry/nextjs";
import { toHttpResponse } from "./errors";
import { NextRequest, NextResponse } from "next/server";

type RouteHandler = (
  request: NextRequest,
  context?: { params: Promise<any> }
) => Promise<NextResponse>;

export function withSentry(handler: RouteHandler): RouteHandler {
  return async (request: NextRequest, context?: { params: Promise<any> }) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Capture error in Sentry if available
      if (process.env.SENTRY_DSN) {
        // Add request context to Sentry
        Sentry.addRequestDataToEvent(error, request);
        Sentry.captureException(error);
      }
      
      // Return HTTP response using existing error handling
      return toHttpResponse(error);
    }
  };
}
