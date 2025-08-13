import * as Sentry from "@sentry/nextjs";

export const sentryServerInit = () => {
  if (process.env.NODE_ENV !== "production" || !process.env.SENTRY_DSN) return;
  
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    tracesSampleRate: 1.0,
  });
};
