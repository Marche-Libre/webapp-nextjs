import { describe, expect, it } from "vitest";
import {
  ONBOARDING_REMINDER_THRESHOLD_PERCENT,
  getOnboardingReminderStorageKey,
  isProfileBelowOnboardingReminderThreshold,
  markOnboardingReminderDismissed,
  readOnboardingReminderDismissed,
  shouldShowOnboardingReminder,
} from "@/lib/onboarding-reminder";

type StorageMock = {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
};

function createStorageMock(initialValues: Record<string, string> = {}): StorageMock {
  const values = new Map<string, string>(Object.entries(initialValues));

  function getItem(key: string) {
    return values.get(key) ?? null;
  }

  function setItem(key: string, value: string) {
    values.set(key, value);
  }

  return { getItem, setItem };
}

describe("onboarding reminder helper", () => {
  it("keeps the explicit threshold set to 30 percent", () => {
    expect(ONBOARDING_REMINDER_THRESHOLD_PERCENT).toBe(30);
  });

  it("marks only profile completion values below 30 as below threshold", () => {
    expect(isProfileBelowOnboardingReminderThreshold(29)).toBe(true);
    expect(isProfileBelowOnboardingReminderThreshold(30)).toBe(false);
    expect(isProfileBelowOnboardingReminderThreshold(72)).toBe(false);
  });

  it("shows the reminder only when below threshold and not dismissed", () => {
    expect(shouldShowOnboardingReminder(29, false)).toBe(true);
    expect(shouldShowOnboardingReminder(29, true)).toBe(false);
    expect(shouldShowOnboardingReminder(30, false)).toBe(false);
  });

  it("stores dismissed state by user id", () => {
    const userId = "user-1";
    const storage = createStorageMock();

    expect(readOnboardingReminderDismissed(storage, userId)).toBe(false);

    markOnboardingReminderDismissed(storage, userId);

    expect(readOnboardingReminderDismissed(storage, userId)).toBe(true);
    expect(readOnboardingReminderDismissed(storage, "user-2")).toBe(false);
  });

  it("handles missing storage without throwing", () => {
    expect(readOnboardingReminderDismissed(null, "user-1")).toBe(false);
    expect(() => markOnboardingReminderDismissed(null, "user-1")).not.toThrow();
  });

  it("derives deterministic storage keys from user ids", () => {
    expect(getOnboardingReminderStorageKey("abc")).toBe(
      "ml-onboarding-reminder-dismissed:abc",
    );
  });
});
