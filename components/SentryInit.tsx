"use client";

import { useEffect } from "react";
import { sentryClientInit } from "@/sentry.client.config";

/**
 * Client-only Sentry bootstrap. No-ops when DSN is not provided.
 */
export default function SentryInit() {
  useEffect(() => {
    try {
      sentryClientInit();
    } catch {
      // swallow init errors to remain graceful
    }
  }, []);

  return null;
}

