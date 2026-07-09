// This file configures the initialization of Sentry for edge features (middleware, edge routes, and so on).
// The config you add here will be used whenever one of the edge features is loaded.
// Note that this config is unrelated to the Vercel Edge Runtime and is also required when running locally.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

const sentryEnvironment =
  process.env.SENTRY_ENVIRONMENT ??
  process.env.VERCEL_ENV ??
  process.env.NODE_ENV;

Sentry.init({
  dsn: "https://d0b181883fd4ef5a277bb035e9194bd1@o4511705948160000.ingest.de.sentry.io/4511705959170128",
  environment: sentryEnvironment,

  // Current traffic is low and the login flow is the product risk we need to observe.
  // Capture every traced edge/proxy request for now; lower this once traffic grows.
  tracesSampleRate: 1.0,

  dataCollection: {
    userInfo: false,
    httpBodies: [],
  },
});
