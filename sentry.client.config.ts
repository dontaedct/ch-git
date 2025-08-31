import * as Sentry from "@sentry/nextjs";

/**
 * Initialize Sentry in the browser when a public DSN is provided.
 * Gracefully no-op when disabled or missing configuration.
 */
export const sentryClientInit = () => {
  if (typeof window === 'undefined') return; // client-only
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return; // disabled when DSN not provided

  // Keep client init conservative; performance can be tuned later
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 0.1,
    replaysOnErrorSampleRate: 0.0,
    replaysSessionSampleRate: 0.0,
    integrations: [],
  });
};
