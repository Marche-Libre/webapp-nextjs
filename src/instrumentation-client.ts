// This file configures the initialization of Sentry on the client.
// The added config here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryEnvironment =
  process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT ??
  process.env.NEXT_PUBLIC_VERCEL_ENV ??
  process.env.NODE_ENV;

Sentry.init({
  dsn: "https://d0b181883fd4ef5a277bb035e9194bd1@o4511705948160000.ingest.de.sentry.io/4511705959170128",
  environment: sentryEnvironment,

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Current traffic is low and the login flow is the product risk we need to observe.
  // Capture every traced browser session for now; lower this once traffic grows.
  tracesSampleRate: 1.0,

  // Capture every browser session so first visits and login clicks are replayable.
  replaysSessionSampleRate: 1.0,

  replaysOnErrorSampleRate: 1.0,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
