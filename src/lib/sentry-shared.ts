import type { ErrorEvent, EventHint } from "@sentry/nextjs";

export const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

const IGNORE_ERRORS = [
  "ResizeObserver loop limit exceeded",
  "ResizeObserver loop completed with undelivered notifications",
  "Non-Error promise rejection captured",
  "Failed to fetch",
  "NetworkError when attempting to fetch resource",
  "Load failed",
  "AbortError",
  "The operation was aborted",
  "ChunkLoadError",
  "Loading chunk",
  "Loading CSS chunk",
];

function isHandledApiError(hint?: EventHint): boolean {
  const original = hint?.originalException as { status?: unknown } | null | undefined;

  return (
    !!original &&
    typeof original === "object" &&
    typeof (original as { status?: unknown }).status === "number"
  );
}

function beforeSend(event: ErrorEvent, hint: EventHint): ErrorEvent | null {
  if (isHandledApiError(hint)) {
    return null;
  }

  return event;
}

export const commonSentryOptions = {
  dsn: SENTRY_DSN,
  enabled: Boolean(SENTRY_DSN),
  environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
  tracesSampleRate: 0.1,
  sendDefaultPii: false,
  ignoreErrors: IGNORE_ERRORS,
  beforeSend,
};
