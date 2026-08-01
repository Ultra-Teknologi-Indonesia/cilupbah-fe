import * as Sentry from "@sentry/nextjs";

import { commonSentryOptions } from "@/lib/sentry-shared";

Sentry.init({
  ...commonSentryOptions,
  denyUrls: [
    /^chrome:\/\//i,
    /^chrome-extension:\/\//i,
    /^moz-extension:\/\//i,
    /^safari-extension:\/\//i,
    /extensions\//i,
  ],
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
