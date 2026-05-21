"use client";

import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useCallback, useMemo, useSyncExternalStore } from "react";
import { getProfileCompleteness } from "@/lib/profile-utils";
import {
  ONBOARDING_REMINDER_THRESHOLD_PERCENT,
  getOnboardingReminderStorageKey,
  markOnboardingReminderDismissed,
  readOnboardingReminderDismissed,
  shouldShowOnboardingReminder,
} from "@/lib/onboarding-reminder";
import type { Profile } from "@/lib/types/database";

interface OnboardingReminderBannerProps {
  profile: Profile;
}

const MAX_VISIBLE_MISSING_FIELDS = 3;
const REMINDER_EMPTY_STATE =
  "Ajoutez votre presentation pour completer votre profil.";
const ONBOARDING_REMINDER_STORAGE_SYNC_EVENT =
  "ml-onboarding-reminder-storage-sync";

function getDismissedServerSnapshot() {
  return true;
}

function readReminderDismissedSnapshot(userId: string) {
  if (typeof window === "undefined") {
    return getDismissedServerSnapshot();
  }

  return readOnboardingReminderDismissed(window.localStorage, userId);
}

function subscribeToOnboardingReminderDismissed(
  userId: string,
  onStoreChange: () => void,
) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const storageKey = getOnboardingReminderStorageKey(userId);

  const handleStorageChange = (event: StorageEvent) => {
    if (event.key === storageKey) {
      onStoreChange();
    }
  };

  const handleSyncEvent = (event: Event) => {
    const syncEvent = event as CustomEvent<{ userId?: string }>;
    if (!syncEvent.detail?.userId || syncEvent.detail.userId === userId) {
      onStoreChange();
    }
  };

  window.addEventListener("storage", handleStorageChange);
  window.addEventListener(ONBOARDING_REMINDER_STORAGE_SYNC_EVENT, handleSyncEvent);

  return () => {
    window.removeEventListener("storage", handleStorageChange);
    window.removeEventListener(
      ONBOARDING_REMINDER_STORAGE_SYNC_EVENT,
      handleSyncEvent,
    );
  };
}

function buildMissingFieldsText(
  labels: string[],
  totalMissingFields: number,
) {
  if (labels.length === 0) {
    return REMINDER_EMPTY_STATE;
  }

  const base = labels.join(", ");
  const remainingCount = totalMissingFields - labels.length;

  if (remainingCount <= 0) {
    return `${base}.`;
  }

  const pluralSuffix = remainingCount > 1 ? "s" : "";
  return `${base}, et ${remainingCount} autre${pluralSuffix}.`;
}

export function OnboardingReminderBanner({
  profile,
}: OnboardingReminderBannerProps) {
  const { percent, missing } = useMemo(
    () => getProfileCompleteness(profile),
    [profile],
  );

  const visibleMissingFieldLabels = useMemo(
    () =>
      missing
        .slice(0, MAX_VISIBLE_MISSING_FIELDS)
        .map((missingField) => missingField.label),
    [missing],
  );

  const missingFieldsText = useMemo(
    () => buildMissingFieldsText(visibleMissingFieldLabels, missing.length),
    [missing.length, visibleMissingFieldLabels],
  );

  const subscribeToDismissedState = useCallback(
    (onStoreChange: () => void) =>
      subscribeToOnboardingReminderDismissed(profile.id, onStoreChange),
    [profile.id],
  );

  const getDismissedSnapshot = useCallback(
    () => readReminderDismissedSnapshot(profile.id),
    [profile.id],
  );

  const dismissed = useSyncExternalStore(
    subscribeToDismissedState,
    getDismissedSnapshot,
    getDismissedServerSnapshot,
  );

  const visible = useMemo(
    () => shouldShowOnboardingReminder(percent, dismissed),
    [dismissed, percent],
  );

  const handleDismiss = useCallback(() => {
    if (typeof window !== "undefined") {
      markOnboardingReminderDismissed(window.localStorage, profile.id);
      window.dispatchEvent(
        new CustomEvent(ONBOARDING_REMINDER_STORAGE_SYNC_EVENT, {
          detail: { userId: profile.id },
        }),
      );
    }
  }, [profile.id]);

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[70] sm:left-auto sm:right-6 sm:max-w-[460px]">
      <div className="rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-warning/20 text-warning">
            <AlertTriangle className="h-4 w-4" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-base-content">
              Profil incomplet ({percent}% /{" "}
              {ONBOARDING_REMINDER_THRESHOLD_PERCENT}%)
            </p>
            <p className="mt-1 text-xs leading-relaxed text-base-content/70">
              Ajoutez: {missingFieldsText}
            </p>
            <Link
              href="/onboarding"
              className="mt-2 inline-flex items-center text-xs font-medium text-accent hover:underline"
            >
              Completer mon profil
            </Link>
          </div>

          <button
            type="button"
            onClick={handleDismiss}
            className="btn btn-ghost btn-xs btn-square text-base-content/50 hover:text-base-content"
            aria-label="Fermer le rappel de profil"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
