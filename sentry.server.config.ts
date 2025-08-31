import * as Sentry from "@sentry/nextjs";

export const sentryServerInit = () => {
  if (!process.env.SENTRY_DSN) return; // disabled when DSN not provided
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 0.0,
  });
};
