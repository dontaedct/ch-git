import * as Sentry from "@sentry/nextjs";

export const sentryClientInit = () => {
  if (process.env.NODE_ENV !== "production" || !process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  // Placeholder: call Sentry.init here if you add DSN
};
