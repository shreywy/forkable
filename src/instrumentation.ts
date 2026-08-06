// Server-side error monitoring (optional). Initializes Sentry only when
// SENTRY_DSN is set - the app runs identically without it.

export async function register() {
  if (!process.env.SENTRY_DSN) return;

  const Sentry = await import("@sentry/nextjs");
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    enabled: true,
  });
}

export async function onRequestError(...args: unknown[]) {
  if (!process.env.SENTRY_DSN) return;
  const Sentry = await import("@sentry/nextjs");
  // @ts-expect-error - forward Next.js request error hook args as-is
  Sentry.captureRequestError(...args);
}
