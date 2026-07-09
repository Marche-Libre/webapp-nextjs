import * as Sentry from "@sentry/nextjs";

type AuthSource = "access_modal" | "referral_page" | "x_continue" | "oauth_callback";

type AuthContext = {
  source: AuthSource;
  step: string;
  hasReferral?: boolean;
  status?: string | null;
  destination?: string;
};

export function setObservedUser(userId: string | null) {
  Sentry.setUser(userId ? { id: userId } : null);
}

export function startAuthReplay() {
  Sentry.getReplay()?.start();
}

export function addAuthBreadcrumb(message: string, context: AuthContext) {
  Sentry.addBreadcrumb({
    category: "auth.login",
    level: "info",
    message,
    data: context,
  });
}

export function captureAuthMessage(
  message: string,
  context: AuthContext,
  level: Sentry.SeverityLevel = "info",
) {
  Sentry.withScope((scope) => {
    scope.setTag("auth.source", context.source);
    scope.setTag("auth.step", context.step);
    scope.setContext("auth", context);
    Sentry.captureMessage(message, level);
  });
}

export function captureAuthException(error: unknown, context: AuthContext) {
  Sentry.withScope((scope) => {
    scope.setTag("auth.source", context.source);
    scope.setTag("auth.step", context.step);
    scope.setContext("auth", context);
    Sentry.captureException(error);
  });
}
